from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import Assessment, AssessmentType, WritingSubmission, AIEvaluation, StudentAssessment, Student, User
from sqlalchemy.sql import func
from services.recommendation_engine import process_evaluation
from pydantic import BaseModel
from services.ai_evaluation import evaluate_writing
import json

from api.deps import get_current_student

router = APIRouter()

class SubmitWritingRequest(BaseModel):
    prompt: str
    submission: str

def process_writing_submission(student: Student, prompt: str, submission: str, db: Session):
    submission_text = submission.strip()
    if not submission_text:
        raise HTTPException(status_code=400, detail="Please write your essay before submitting.")

    words = [w for w in submission_text.split() if w]
    if len(words) < 20:
        raise HTTPException(status_code=400, detail="Your essay is too short.")

    try:
        assessment = db.query(Assessment).filter(Assessment.type == AssessmentType.WRITING).first()
        evaluation = evaluate_writing(prompt=prompt, submission=submission_text)
    except Exception as e:
        print(f"Groq Evaluation Error: {e}")
        raise HTTPException(status_code=500, detail="Unable to evaluate your writing. Please try again.")

    student_assessment = StudentAssessment(
        student_id=student.id,
        assessment_id=assessment.id if assessment else None
    )
    db.add(student_assessment)
    db.commit()
    db.refresh(student_assessment)

    writing_submission = WritingSubmission(
        student_assessment_id=student_assessment.id,
        content=submission_text
    )
    db.add(writing_submission)
    db.commit()
    db.refresh(writing_submission)

    ai_eval = AIEvaluation(
        submission_id=writing_submission.id,
        grammar=evaluation.get("grammar", 0),
        vocabulary=evaluation.get("vocabulary", 0),
        sentence_structure=evaluation.get("sentence_structure", 0),
        coherence=evaluation.get("coherence", 0),
        relevance=evaluation.get("relevance", 0),
        overall=evaluation.get("overall", 0),
        feedback=evaluation.get("feedback", ""),
        weaknesses=json.dumps(evaluation.get("weaknesses", [])),
        raw_response=json.dumps(evaluation)
    )
    db.add(ai_eval)
    db.commit()
    db.refresh(ai_eval)
    
    student_assessment.total_marks = ai_eval.overall
    accuracy = (ai_eval.overall / 50.0) * 100 if ai_eval.overall else 0
    student_assessment.accuracy = accuracy
    student_assessment.cefr_level = evaluation.get("cefr_level", "B1")
    student_assessment.status = "Completed"
    student_assessment.evaluation_id = ai_eval.id
    student_assessment.completed_at = func.now()
    
    db.commit()
    
    # Trigger Adaptive Recommendation Engine
    if assessment:
        try:
            process_evaluation(db, student.id, assessment.id, assessment.type, eval_data=ai_eval, accuracy=accuracy)
        except Exception as e:
            print(f"Engine Error: {e}")

    return evaluation

@router.post("/evaluate")
def submit_writing_evaluation(request: SubmitWritingRequest, db: Session = Depends(get_db), student: Student = Depends(get_current_student)):
    return process_writing_submission(student, request.prompt, request.submission, db)

@router.post("/assess-writing")
def assess_writing(request: SubmitWritingRequest, db: Session = Depends(get_db), student: Student = Depends(get_current_student)):
    return process_writing_submission(student, request.prompt, request.submission, db)

