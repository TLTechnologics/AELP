from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import (
    Student, User, StudentAssessment, Assessment, AssessmentType,
    Achievement, Notification, ProgressHistory, Lesson, LessonProgress,
    StudentLearningPaths, StudentWeakSkills, StudentLessonRecommendations
)
from sqlalchemy import desc, asc, func
import json
from datetime import datetime, timedelta

router = APIRouter()

from api.deps import get_current_student

@router.get("/")
def get_dashboard_data(db: Session = Depends(get_db), student: Student = Depends(get_current_student)):
    user = student.user
    
    # Completed Assessments & Stage Calculation
    assessments_query = db.query(StudentAssessment).filter(StudentAssessment.student_id == student.id)
    completed_assessments = assessments_query.count()
    
    # Calculate Stage
    completed_types = set()
    for sa in assessments_query.all():
        if sa.assessment and sa.assessment.type:
            completed_types.add(sa.assessment.type.value.lower())
            
    has_reading = "reading" in completed_types
    has_writing = "writing" in completed_types
    has_speaking = "speaking" in completed_types
    
    stage = 1
    completeness = 0
    unlocked_features = ["dashboard", "assessment", "profile"]
    
    if has_reading and has_writing and has_speaking:
        stage = 4
        completeness = 100
        unlocked_features.extend(["results", "learning", "progress", "ai_coach", "advanced_recommendations", "full_profile"])
    elif has_reading and has_writing:
        stage = 3
        completeness = 80
        unlocked_features.extend(["results", "learning", "progress", "ai_coach", "advanced_recommendations"])
    elif has_reading or has_writing:
        stage = 2
        completeness = 50
        unlocked_features.extend(["results", "learning", "progress", "ai_coach"])
    
    avg_score = db.query(func.avg(StudentAssessment.accuracy)).filter(StudentAssessment.student_id == student.id).scalar() or 0.0
    
    # Recent Activity
    recent_assessments = assessments_query.order_by(desc(StudentAssessment.started_at)).limit(5).all()
    recent_activity = []
    for sa in recent_assessments:
        recent_activity.append({
            "id": sa.id,
            "title": sa.assessment.title,
            "type": sa.assessment.type.value if sa.assessment.type else "unknown",
            "date": sa.started_at,
            "score": sa.accuracy,
            "action": "Completed Assessment"
        })
        
    # Achievements
    achievements_db = db.query(Achievement).filter(Achievement.student_id == student.id).order_by(desc(Achievement.earned_at)).limit(3).all()
    achievements = [{"title": a.title, "description": a.description, "date": a.earned_at, "icon": a.icon_url} for a in achievements_db]
    
    # Notifications
    notifications_db = db.query(Notification).filter(Notification.user_id == user.id, Notification.read == False).order_by(desc(Notification.created_at)).limit(5).all()
    notifications = [{"id": n.id, "title": n.title, "message": n.message, "date": n.created_at} for n in notifications_db]
    
    # Progress History (Weekly / Monthly mock logic based on ProgressHistory table or dummy aggregation if empty)
    progress_history = db.query(ProgressHistory).filter(ProgressHistory.student_id == student.id).order_by(asc(ProgressHistory.date)).all()
    weekly_progress = []
    for ph in progress_history[-7:]: # Last 7 entries for weekly
        weekly_progress.append({
            "date": ph.date.strftime("%a"),
            "reading": ph.reading_score or 0,
            "writing": ph.writing_score or 0,
            "speaking": (ph.reading_score + ph.writing_score)/2 # Mocking speaking for now if not present
        })
        
    # Active Learning Paths
    active_paths_db = db.query(StudentLearningPaths).filter(StudentLearningPaths.student_id == student.id).all()
    active_paths = [p.path_name for p in active_paths_db]
    
    # Weak Skills
    weak_skills_db = db.query(StudentWeakSkills).filter(
        StudentWeakSkills.student_id == student.id,
        StudentWeakSkills.priority.in_(["HIGH", "MEDIUM"])
    ).order_by(desc(StudentWeakSkills.created_at)).limit(5).all()
    weak_skills = [{"skill": ws.skill_name, "score": ws.latest_score, "priority": ws.priority} for ws in weak_skills_db]
    
    # Adaptive Recommended Lessons
    recs = db.query(StudentLessonRecommendations).filter(
        StudentLessonRecommendations.student_id == student.id,
        StudentLessonRecommendations.completed == False
    ).all()
    
    priority_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    recs.sort(key=lambda x: priority_order.get(x.priority, 99))
    
    recommended_lessons = []
    for r in recs[:3]: # top 3
        if r.lesson:
            recommended_lessons.append({
                "id": r.lesson.id,
                "title": r.lesson.title,
                "description": r.lesson.description,
                "difficulty": r.lesson.difficulty,
                "reason": r.reason,
                "priority": r.priority
            })
    
    return {
        "student_name": user.full_name or "Student",
        "current_level": student.current_level,
        "latest_cefr_level": student.current_level, # Assuming same for now
        "reading_progress": student.reading_score,
        "writing_progress": student.writing_score,
        "speaking_progress": student.listening_score, # Mapping listening to speaking temporarily for MVP
        "overall_progress": student.overall_progress,
        "completed_assessments": completed_assessments,
        "average_score": round(avg_score, 1),
        "recent_activity": recent_activity,
        "achievements": achievements,
        "notifications": notifications,
        "weekly_progress": weekly_progress,
        "active_paths": active_paths if stage > 1 else [],
        "weak_skills": weak_skills if stage > 1 else [],
        "recommended_lessons": recommended_lessons if stage > 1 else [],
        "profile_stage": stage,
        "profile_completeness": completeness,
        "unlocked_features": unlocked_features,
        "completed_types": list(completed_types)
    }
