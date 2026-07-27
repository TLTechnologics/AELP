from sqlalchemy.orm import Session
from models.models import Student, LearningPath, Lesson, LessonProgress

def update_learning_path(db: Session, student_id: int):
    """
    Evaluates the student's current scores (listening, reading, writing)
    and updates their assigned learning path based on weak areas.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return None

    # Simple rule-based logic for MVP
    avg_score = (student.listening_score + student.reading_score + student.writing_score) / 3

    difficulty = "Beginner"
    if avg_score >= 80:
        difficulty = "Advanced"
    elif avg_score >= 50:
        difficulty = "Intermediate"

    # Find the most suitable learning path based on difficulty
    path = db.query(LearningPath).filter(LearningPath.difficulty == difficulty).first()
    
    if path and student.current_learning_path_id != path.id:
        student.current_learning_path_id = path.id
        db.commit()
        db.refresh(student)

        # Optional: Initialize LessonProgress for all lessons in this new path
        # In a real app, you might only initialize the first one or just fetch dynamically.
    
    return student.current_learning_path_id
