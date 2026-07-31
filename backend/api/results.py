from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import (
    StudentAssessment,
    Assessment,
    AssessmentType,
    Student,
    User,
    WritingSubmission,
    AIEvaluation,
    SpeakingRecording,
    SpeakingEvaluation,
    StudentAnswer,
    Question,
    QuestionOption
)
from typing import Optional
from sqlalchemy import desc, asc
import json

from api.deps import get_current_student

router = APIRouter()

@router.get("/")
def get_results(
    db: Session = Depends(get_db),
    student: Student = Depends(get_current_student),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    type: Optional[str] = None,
    sort: Optional[str] = "newest",
    search: Optional[str] = None
):
    query = db.query(StudentAssessment).join(Assessment).filter(StudentAssessment.student_id == student.id)
    
    # Filtering
    if type and type != "all":
        try:
            assessment_type = AssessmentType(type.lower())
            query = query.filter(Assessment.type == assessment_type)
        except ValueError:
            pass # Invalid type string
            
    # Searching
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            Assessment.title.ilike(search_term) |
            Assessment.topic.ilike(search_term) |
            Assessment.type.cast(str).ilike(search_term)
        )
        
    # Sorting
    if sort == "newest":
        query = query.order_by(desc(StudentAssessment.started_at))
    elif sort == "oldest":
        query = query.order_by(asc(StudentAssessment.started_at))
    elif sort == "highest":
        query = query.order_by(desc(StudentAssessment.accuracy))
    elif sort == "lowest":
        query = query.order_by(asc(StudentAssessment.accuracy))
    else:
        query = query.order_by(desc(StudentAssessment.started_at))

    total = query.count()
    
    # Pagination
    offset = (page - 1) * limit
    assessments = query.offset(offset).limit(limit).all()
    
    results = []
    for sa in assessments:
        results.append({
            "id": sa.id,
            "assessment_id": sa.assessment_id,
            "type": sa.assessment.type.value if sa.assessment.type else "unknown",
            "title": sa.assessment.title,
            "topic": sa.assessment.topic,
            "date": sa.started_at,
            "score": sa.total_marks,
            "percentage": sa.accuracy,
            "cefr_level": sa.cefr_level or "N/A",
            "status": sa.status or "Completed",
            "duration": sa.time_taken or 0,
        })
        
    return {
        "items": results,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@router.get("/{id}")
def get_result_details(id: int, db: Session = Depends(get_db), student: Student = Depends(get_current_student)):
    sa = db.query(StudentAssessment).filter(StudentAssessment.id == id, StudentAssessment.student_id == student.id).first()
    
    if not sa:
        raise HTTPException(status_code=404, detail="Assessment result not found")
        
    base_info = {
        "id": sa.id,
        "assessment_id": sa.assessment.id,
        "title": sa.assessment.title,
        "type": sa.assessment.type.value if sa.assessment.type else "unknown",
        "topic": sa.assessment.topic,
        "date": sa.started_at,
        "score": sa.total_marks,
        "percentage": sa.accuracy,
        "time_taken": sa.time_taken or 0,
    }

    if sa.assessment.type == AssessmentType.READING:
        # Fetch question by question
        questions_review = []
        correct_count = 0
        incorrect_count = 0
        
        for ans in sa.answers:
            q = ans.question
            if not q: continue
            
            correct_ans_texts = [o.text for o in q.options if o.is_correct]
            correct_ans = ", ".join(correct_ans_texts) if correct_ans_texts else ""
            
            student_ans = ""
            if ans.selected_option_id:
                opt = db.query(QuestionOption).filter(QuestionOption.id == ans.selected_option_id).first()
                if opt: student_ans = opt.text
            elif ans.text_answer:
                student_ans = ans.text_answer
                
            if ans.is_correct:
                correct_count += 1
            else:
                incorrect_count += 1
                
            questions_review.append({
                "question_id": q.id,
                "question": q.text,
                "student_answer": student_ans,
                "correct_answer": correct_ans,
                "is_correct": ans.is_correct,
                "marks_awarded": ans.marks_awarded,
                "total_marks": q.marks
            })
            
        base_info["reading_report"] = {
            "correct_answers": correct_count,
            "incorrect_answers": incorrect_count,
            "questions_review": questions_review,
            "weak_topics": ["Reading Comprehension"] if incorrect_count > 0 else [],
            "recommended_lessons": ["Basic Grammar"] if incorrect_count > 0 else []
        }
        
    elif sa.assessment.type == AssessmentType.WRITING:
        submission = sa.writing_submission
        if sa.evaluation_id:
            eval_data = db.query(AIEvaluation).filter(AIEvaluation.id == sa.evaluation_id).first()
            if eval_data and submission:
                strengths = []
                weaknesses = []
                try: weaknesses = json.loads(eval_data.weaknesses)
                except: pass
                
                base_info["writing_report"] = {
                    "essay_topic": sa.assessment.topic or sa.assessment.title,
                    "student_essay": submission.content,
                    "grammar": eval_data.grammar,
                    "vocabulary": eval_data.vocabulary,
                    "sentence_structure": eval_data.sentence_structure,
                    "coherence": eval_data.coherence,
                    "relevance": eval_data.relevance,
                    "overall": eval_data.overall,
                    "feedback": eval_data.feedback,
                    "cefr_level": sa.cefr_level,
                    "strengths": strengths,
                    "weaknesses": weaknesses,
                    "recommended_lessons": []
                }
            
    elif sa.assessment.type == AssessmentType.SPEAKING:
        # Find the recording
        recording = db.query(SpeakingRecording).filter(
            SpeakingRecording.assessment_id == sa.assessment.id, 
            SpeakingRecording.student_id == sa.student_id
        ).order_by(desc(SpeakingRecording.created_at)).first()
        
        if sa.evaluation_id and recording:
            eval_data = db.query(SpeakingEvaluation).filter(SpeakingEvaluation.id == sa.evaluation_id).first()
            if eval_data:
                strengths = []
                weaknesses = []
                recommended = []
                try: strengths = json.loads(eval_data.strengths)
                except: pass
                try: weaknesses = json.loads(eval_data.weaknesses)
                except: pass
                try: recommended = json.loads(eval_data.recommended_lessons)
                except: pass
                
                base_info["speaking_report"] = {
                    "speaking_topic": sa.assessment.topic or sa.assessment.title,
                    "transcript": eval_data.transcript,
                    "audio_url": recording.audio_url,
                    "grammar": eval_data.grammar,
                    "vocabulary": eval_data.vocabulary,
                    "pronunciation": eval_data.pronunciation,
                    "fluency": eval_data.fluency,
                    "coherence": eval_data.coherence,
                    "confidence": eval_data.confidence,
                    "communication": eval_data.communication,
                    "overall": eval_data.overall,
                    "cefr_level": sa.cefr_level,
                    "feedback": eval_data.feedback,
                    "strengths": strengths,
                    "weaknesses": weaknesses,
                    "recommended_lessons": recommended
                }
            
    return base_info
