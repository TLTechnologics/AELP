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

    # Simple rule-based logic for MVP including speaking
    # Use 0 if the attribute isn't present or None
    listening = getattr(student, 'listening_score', 0) or 0
    reading = getattr(student, 'reading_score', 0) or 0
    writing = getattr(student, 'writing_score', 0) or 0
    # For now we'll pretend there is a speaking score on the model or we fetch it
    # We will just use the ones we have for MVP
    avg_score = (listening + reading + writing) / 3

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
