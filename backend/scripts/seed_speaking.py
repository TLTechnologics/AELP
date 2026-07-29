import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.database import SessionLocal
from models.models import Assessment, AssessmentType, Question, QuestionType

def seed_speaking():
    db = SessionLocal()
    
    # Check if speaking assessment already exists
    existing = db.query(Assessment).filter(Assessment.type == AssessmentType.SPEAKING).first()
    if existing:
        print("Speaking assessment already exists. Skipping seed.")
        db.close()
        return

    # Create Assessment
    assessment = Assessment(
        title="Self Introduction",
        type=AssessmentType.SPEAKING,
        difficulty="Beginner",
        topic="Personal Information"
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # Add Question
    question_text = """Introduce yourself.
Talk about:
• Your name
• Your hobbies
• Your family
• Your favourite subject

Speak for approximately one minute."""

    question = Question(
        assessment_id=assessment.id,
        type=QuestionType.WRITING, # Reusing WRITING for open ended text display
        text=question_text,
        marks=70.0
    )
    
    db.add(question)
    db.commit()
    print("Speaking assessment seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_speaking()
