from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import (
    StudentLearningPaths,
    StudentLessonRecommendations,
    Lesson,
    LearningPath
)
from typing import List
from pydantic import BaseModel
from models.models import Student

from api.deps import get_current_student

router = APIRouter()

class LessonRecommendationResponse(BaseModel):
    id: int
    lesson_id: int
    title: str
    description: str
    estimated_time: int
    difficulty: str
    reason: str
    priority: str
    completed: bool

class LearningPathResponse(BaseModel):
    id: int
    path_name: str
    progress: float
    status: str

class PersonalizedRoadmapResponse(BaseModel):
    active_paths: List[LearningPathResponse]
    recommendations: List[LessonRecommendationResponse]

@router.get("/", response_model=PersonalizedRoadmapResponse)
def get_personalized_roadmap(student: Student = Depends(get_current_student), db: Session = Depends(get_db)):
    # 1. Fetch Active Learning Paths
    active_paths_db = db.query(StudentLearningPaths).filter(
        StudentLearningPaths.student_id == student.id
    ).all()
    
    active_paths = [
        LearningPathResponse(
            id=p.id,
            path_name=p.path_name,
            progress=p.progress,
            status=p.status
        ) for p in active_paths_db
    ]
    
    # 2. Get recommendations
    recs = db.query(StudentLessonRecommendations).filter(
        StudentLessonRecommendations.student_id == student.id,
        StudentLessonRecommendations.completed == False
    ).all()
    
    # Sort in Python for simplicity
    priority_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    recs.sort(key=lambda x: priority_order.get(x.priority, 99))
    
    recommendations = []
    for r in recs:
        lesson = r.lesson
        if lesson:
            recommendations.append(LessonRecommendationResponse(
                id=r.id,
                lesson_id=r.lesson_id,
                title=lesson.title,
                description=lesson.description,
                estimated_time=lesson.estimated_time or 0,
                difficulty=lesson.difficulty or "Beginner",
                reason=r.reason,
                priority=r.priority,
                completed=r.completed
            ))
            
    return PersonalizedRoadmapResponse(
        active_paths=active_paths,
        recommendations=recommendations
    )
