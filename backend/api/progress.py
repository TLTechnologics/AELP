from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import Student, StudentAssessment, Assessment, AssessmentType, AIEvaluation, WritingSubmission
from sqlalchemy.sql import func

from api.deps import get_current_student

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_data(student: Student = Depends(get_current_student), db: Session = Depends(get_db)):
    student_id = student.id
    
    # Calculate latest Reading score
    latest_reading = (
        db.query(StudentAssessment)
        .join(Assessment)
        .filter(StudentAssessment.student_id == student_id, Assessment.type == AssessmentType.READING)
        .order_by(StudentAssessment.completed_at.desc())
        .first()
    )
    
    # Calculate latest Writing score
    latest_writing = (
        db.query(StudentAssessment)
        .join(Assessment)
        .filter(StudentAssessment.student_id == student_id, Assessment.type == AssessmentType.WRITING)
        .order_by(StudentAssessment.completed_at.desc())
        .first()
    )
    
    # Calculate latest Speaking score
    latest_speaking = (
        db.query(StudentAssessment)
        .join(Assessment)
        .filter(StudentAssessment.student_id == student_id, Assessment.type == AssessmentType.SPEAKING)
        .order_by(StudentAssessment.completed_at.desc())
        .first()
    )
    
    reading_acc = latest_reading.accuracy if (latest_reading and latest_reading.accuracy is not None) else 0.0
    writing_acc = latest_writing.accuracy if (latest_writing and latest_writing.accuracy is not None) else 0.0
    speaking_acc = latest_speaking.accuracy if (latest_speaking and latest_speaking.accuracy is not None) else 0.0
    
    # Simple average of available modules
    scores = []
    if latest_reading: scores.append(reading_acc)
    if latest_writing: scores.append(writing_acc)
    if latest_speaking: scores.append(speaking_acc)
    
    overall_acc = sum(scores) / len(scores) if scores else 0.0
    
    level = "Beginner"
    if overall_acc >= 80:
        level = "Advanced"
    elif overall_acc >= 50:
        level = "Intermediate"

    return {
        "user_name": student.user.full_name if student and student.user else "Student",
        "overall_score_label": f"{int(overall_acc)}%",
        "overall_score_sub": level,
        "weekly_goal_value": "100%",
        "weekly_goal_sub": "Assessments Available",
        "time_spent_value": "1.5h",
        "time_spent_sub": "This week",
        "words_learned_value": "45",
        "words_learned_sub": "+5 today",
        "reading_score": round(reading_acc, 1),
        "writing_score": round(writing_acc, 1),
        "speaking_score": round(speaking_acc, 1),
        "cefr_level": "B2" if speaking_acc > 0 else "-", # Can pull actual CEFR if needed
        "lessons": [
            { "id": 1, "title": "Reading Assessment: A Healthy Morning Routine", "type": "Reading", "time": "15 min", "status": "Available" if not latest_reading else "Completed" },
            { "id": 2, "title": "Writing Assessment: Helping Others", "type": "Writing", "time": "20 min", "status": "Available" if not latest_writing else "Completed" },
            { "id": 3, "title": "Speaking Assessment: Self Introduction", "type": "Speaking", "time": "5 min", "status": "Available" if not latest_speaking else "Completed" }
        ]
    }
