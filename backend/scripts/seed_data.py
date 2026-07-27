import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.database import SessionLocal
from models.models import Assessment, AssessmentType, Question, QuestionType, QuestionOption, LearningPath, Lesson

def seed_db():
    db = SessionLocal()
    
    try:
        # Clear existing assessments and lessons for clean state
        print("Cleaning up old data...")
        db.query(QuestionOption).delete()
        db.query(Question).delete()
        db.query(Lesson).delete()
        db.query(Assessment).delete()
        db.query(LearningPath).delete()
        db.commit()

        print("Seeding Reading Assessment...")
        reading_passage = """Many people believe that a good morning routine helps them have a productive day. Waking up early gives people enough time to prepare for the day without feeling rushed. Some people begin their morning by drinking a glass of water because it helps the body stay hydrated after a night's sleep.

Exercise is another healthy habit. It does not have to be difficult. Even a 20-minute walk or a few stretching exercises can improve a person's mood and energy. After exercising, eating a healthy breakfast is important. Foods such as fruits, eggs, whole-grain bread, and milk provide the body with energy.

Many students and workers also spend a few minutes planning their day. They write down the tasks they need to complete and decide which ones are most important. This helps them manage their time better and reduces stress.

However, not everyone follows the same routine. Some people prefer to wake up later because they work at night. Others enjoy reading a book or listening to music before starting work or school. The best morning routine is the one that helps a person feel healthy, focused, and ready for the day."""

        reading_assessment = Assessment(
            title="Reading Assessment: A Healthy Morning Routine",
            type=AssessmentType.READING,
            difficulty="Beginner",
            topic="Daily Routines",
            reading_passage=reading_passage
        )
        db.add(reading_assessment)
        db.commit()
        db.refresh(reading_assessment)

        # Questions Part A: MCQ
        q1 = Question(assessment_id=reading_assessment.id, type=QuestionType.MCQ, text="1. Why do many people wake up early?", marks=1.0)
        db.add(q1)
        db.commit()
        db.refresh(q1)
        db.add_all([
            QuestionOption(question_id=q1.id, text="A. To watch television", is_correct=False),
            QuestionOption(question_id=q1.id, text="B. To have enough time to prepare for the day", is_correct=True),
            QuestionOption(question_id=q1.id, text="C. To play games", is_correct=False),
            QuestionOption(question_id=q1.id, text="D. To avoid breakfast", is_correct=False)
        ])

        q2 = Question(assessment_id=reading_assessment.id, type=QuestionType.MCQ, text="2. Why do some people drink water in the morning?", marks=1.0)
        db.add(q2)
        db.commit()
        db.refresh(q2)
        db.add_all([
            QuestionOption(question_id=q2.id, text="A. To lose weight immediately", is_correct=False),
            QuestionOption(question_id=q2.id, text="B. To stay hydrated", is_correct=True),
            QuestionOption(question_id=q2.id, text="C. To avoid exercise", is_correct=False),
            QuestionOption(question_id=q2.id, text="D. To help them sleep", is_correct=False)
        ])

        q3 = Question(assessment_id=reading_assessment.id, type=QuestionType.MCQ, text="3. Which food is NOT mentioned in the passage?", marks=1.0)
        db.add(q3)
        db.commit()
        db.refresh(q3)
        db.add_all([
            QuestionOption(question_id=q3.id, text="A. Eggs", is_correct=False),
            QuestionOption(question_id=q3.id, text="B. Fruits", is_correct=False),
            QuestionOption(question_id=q3.id, text="C. Rice", is_correct=True),
            QuestionOption(question_id=q3.id, text="D. Milk", is_correct=False)
        ])

        q4 = Question(assessment_id=reading_assessment.id, type=QuestionType.MCQ, text="4. Why do students and workers write down their tasks?", marks=1.0)
        db.add(q4)
        db.commit()
        db.refresh(q4)
        db.add_all([
            QuestionOption(question_id=q4.id, text="A. To waste time", is_correct=False),
            QuestionOption(question_id=q4.id, text="B. To improve time management", is_correct=True),
            QuestionOption(question_id=q4.id, text="C. To forget their work", is_correct=False),
            QuestionOption(question_id=q4.id, text="D. To make friends", is_correct=False)
        ])

        # Questions Part B: True/False/Not Given
        q5 = Question(assessment_id=reading_assessment.id, type=QuestionType.TRUE_FALSE, text="5. Everyone should wake up early every day.", marks=1.0)
        db.add(q5)
        db.commit()
        db.refresh(q5)
        db.add_all([
            QuestionOption(question_id=q5.id, text="True", is_correct=False),
            QuestionOption(question_id=q5.id, text="False", is_correct=True),
            QuestionOption(question_id=q5.id, text="Not Given", is_correct=False)
        ])

        q6 = Question(assessment_id=reading_assessment.id, type=QuestionType.TRUE_FALSE, text="6. A short walk can improve a person's mood.", marks=1.0)
        db.add(q6)
        db.commit()
        db.refresh(q6)
        db.add_all([
            QuestionOption(question_id=q6.id, text="True", is_correct=True),
            QuestionOption(question_id=q6.id, text="False", is_correct=False),
            QuestionOption(question_id=q6.id, text="Not Given", is_correct=False)
        ])

        q7 = Question(assessment_id=reading_assessment.id, type=QuestionType.TRUE_FALSE, text="7. Drinking coffee is recommended in the passage.", marks=1.0)
        db.add(q7)
        db.commit()
        db.refresh(q7)
        db.add_all([
            QuestionOption(question_id=q7.id, text="True", is_correct=False),
            QuestionOption(question_id=q7.id, text="False", is_correct=False),
            QuestionOption(question_id=q7.id, text="Not Given", is_correct=True)
        ])

        q8 = Question(assessment_id=reading_assessment.id, type=QuestionType.TRUE_FALSE, text="8. Some people work at night.", marks=1.0)
        db.add(q8)
        db.commit()
        db.refresh(q8)
        db.add_all([
            QuestionOption(question_id=q8.id, text="True", is_correct=True),
            QuestionOption(question_id=q8.id, text="False", is_correct=False),
            QuestionOption(question_id=q8.id, text="Not Given", is_correct=False)
        ])

        # Part C: Fill in the blanks
        q9 = Question(assessment_id=reading_assessment.id, type=QuestionType.FILL_IN_BLANK, text="9. Drinking water helps keep the body __________.", marks=1.0)
        db.add(q9)
        db.commit()
        db.refresh(q9)
        db.add(QuestionOption(question_id=q9.id, text="hydrated", is_correct=True))

        q10 = Question(assessment_id=reading_assessment.id, type=QuestionType.FILL_IN_BLANK, text="10. A healthy breakfast gives the body __________.", marks=1.0)
        db.add(q10)
        db.commit()
        db.refresh(q10)
        db.add(QuestionOption(question_id=q10.id, text="energy", is_correct=True))

        q11 = Question(assessment_id=reading_assessment.id, type=QuestionType.FILL_IN_BLANK, text="11. Planning the day can reduce __________.", marks=1.0)
        db.add(q11)
        db.commit()
        db.refresh(q11)
        db.add(QuestionOption(question_id=q11.id, text="stress", is_correct=True))

        q12 = Question(assessment_id=reading_assessment.id, type=QuestionType.FILL_IN_BLANK, text="12. The best morning routine helps people feel healthy and __________.", marks=1.0)
        db.add(q12)
        db.commit()
        db.refresh(q12)
        db.add(QuestionOption(question_id=q12.id, text="focused", is_correct=True))

        # Part D: Short Answer
        q13 = Question(assessment_id=reading_assessment.id, type=QuestionType.FILL_IN_BLANK, text="13. How long can a simple walk be?", marks=1.0)
        db.add(q13)
        db.commit()
        db.refresh(q13)
        db.add(QuestionOption(question_id=q13.id, text="20 minutes", is_correct=True))

        q14 = Question(assessment_id=reading_assessment.id, type=QuestionType.FILL_IN_BLANK, text="14. Name one activity people may enjoy before work or school.", marks=1.0)
        db.add(q14)
        db.commit()
        db.refresh(q14)
        db.add_all([
            QuestionOption(question_id=q14.id, text="Reading a book", is_correct=True),
            QuestionOption(question_id=q14.id, text="Listening to music", is_correct=True)
        ])

        q15 = Question(assessment_id=reading_assessment.id, type=QuestionType.FILL_IN_BLANK, text="15. What do people decide after writing their tasks?", marks=1.0)
        db.add(q15)
        db.commit()
        db.refresh(q15)
        db.add(QuestionOption(question_id=q15.id, text="Which ones are most important", is_correct=True))

        # Vocabulary Match
        q16 = Question(assessment_id=reading_assessment.id, type=QuestionType.MATCHING, text="16. Hydrated", marks=1.0)
        db.add(q16)
        db.commit()
        db.refresh(q16)
        db.add_all([
            QuestionOption(question_id=q16.id, text="A. Feeling worried", is_correct=False),
            QuestionOption(question_id=q16.id, text="B. Daily habit", is_correct=False),
            QuestionOption(question_id=q16.id, text="C. Having enough water in the body", is_correct=True)
        ])

        q17 = Question(assessment_id=reading_assessment.id, type=QuestionType.MATCHING, text="17. Routine", marks=1.0)
        db.add(q17)
        db.commit()
        db.refresh(q17)
        db.add_all([
            QuestionOption(question_id=q17.id, text="A. Feeling worried", is_correct=False),
            QuestionOption(question_id=q17.id, text="B. Daily habit", is_correct=True),
            QuestionOption(question_id=q17.id, text="C. Having enough water in the body", is_correct=False)
        ])

        q18 = Question(assessment_id=reading_assessment.id, type=QuestionType.MATCHING, text="18. Stress", marks=1.0)
        db.add(q18)
        db.commit()
        db.refresh(q18)
        db.add_all([
            QuestionOption(question_id=q18.id, text="A. Feeling worried", is_correct=True),
            QuestionOption(question_id=q18.id, text="B. Daily habit", is_correct=False),
            QuestionOption(question_id=q18.id, text="C. Having enough water in the body", is_correct=False)
        ])

        print("Seeding Writing Assessment...")
        writing_assessment = Assessment(
            title="Writing Assessment: Helping Others",
            type=AssessmentType.WRITING,
            difficulty="Beginner",
            topic="Describe a time when someone helped you or when you helped someone else. How did it make you feel? (Word limit: 120-150 words)"
        )
        db.add(writing_assessment)
        db.commit()
        db.refresh(writing_assessment)
        
        q_writing = Question(assessment_id=writing_assessment.id, type=QuestionType.WRITING, text="Describe a time when someone helped you or when you helped someone else. How did it make you feel? (Word limit: 120-150 words)", marks=50.0)
        db.add(q_writing)
        
        print("Seeding Learning Paths and Lessons...")
        lp = LearningPath(title="Beginner English Masterclass", difficulty="Beginner", description="A comprehensive path for beginners.")
        db.add(lp)
        db.commit()
        db.refresh(lp)

        db.add_all([
            Lesson(learning_path_id=lp.id, title="Reading Basics", description="Learn how to read better.", content="Read this...", estimated_time=15, difficulty="Beginner"),
            Lesson(learning_path_id=lp.id, title="Writing Fundamentals", description="Learn sentence structure.", content="Write this...", estimated_time=20, difficulty="Beginner")
        ])
        
        db.commit()
        print("Seed data successfully injected!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
