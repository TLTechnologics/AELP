from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import Assessment, AssessmentType, WritingSubmission, AIEvaluation, StudentAssessment, Student, User
from pydantic import BaseModel
from services.ai_evaluation import evaluate_writing
import json

router = APIRouter()

def ensure_student(db: Session, student_id: int = 1) -> Student:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        user = db.query(User).filter(User.id == "default_student_user").first()
        if not user:
            user = User(id="default_student_user", email="student@aelp.com", full_name="Student")
            db.add(user)
            db.commit()
            db.refresh(user)
        student = Student(id=student_id, user_id=user.id)
        db.add(student)
        db.commit()
        db.refresh(student)
    return student

class SubmitWritingRequest(BaseModel):
    student_id: int = 1
    prompt: str
    submission: str

def process_writing_submission(request: SubmitWritingRequest, db: Session):
    ensure_student(db, request.student_id)
    submission_text = request.submission.strip()
    if not submission_text:
        raise HTTPException(status_code=400, detail="Please write your essay before submitting.")

    words = [w for w in submission_text.split() if w]
    if len(words) < 20:
        raise HTTPException(status_code=400, detail="Your essay is too short.")

    try:
        evaluation = evaluate_writing(prompt=request.prompt, submission=submission_text)
    except Exception as e:
        print(f"Groq Evaluation Error: {e}")
        raise HTTPException(status_code=500, detail="Unable to evaluate your writing. Please try again.")

    assessment = db.query(Assessment).filter(Assessment.type == AssessmentType.WRITING).first()
    
    student_assessment = StudentAssessment(
        student_id=request.student_id,
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
    
    student_assessment.total_marks = ai_eval.overall
    student_assessment.accuracy = (ai_eval.overall / 50.0) * 100 if ai_eval.overall else 0
    
    db.commit()

    return evaluation

@router.post("/evaluate")
def submit_and_evaluate_writing(request: SubmitWritingRequest, db: Session = Depends(get_db)):
    return process_writing_submission(request, db)

@router.post("/assess-writing")
def assess_writing(request: SubmitWritingRequest, db: Session = Depends(get_db)):
    return process_writing_submission(request, db)

