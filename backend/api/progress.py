from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import Student, StudentAssessment, Assessment, AssessmentType, AIEvaluation, WritingSubmission
from sqlalchemy.sql import func

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_data(student_id: int = 1, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    
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
    
    reading_acc = latest_reading.accuracy if (latest_reading and latest_reading.accuracy is not None) else 0.0
    writing_acc = latest_writing.accuracy if (latest_writing and latest_writing.accuracy is not None) else 0.0
    
    overall_acc = (reading_acc + writing_acc) / 2 if (latest_reading and latest_writing) else (reading_acc or writing_acc)
    
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
        "lessons": [
            { "id": 1, "title": "Reading Assessment: A Healthy Morning Routine", "type": "Reading", "time": "15 min", "status": "Available" if not latest_reading else "Completed" },
            { "id": 2, "title": "Writing Assessment: Helping Others", "type": "Writing", "time": "20 min", "status": "Available" if not latest_writing else "Completed" }
        ]
    }
