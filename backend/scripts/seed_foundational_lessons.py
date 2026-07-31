import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.database import SessionLocal
from models.models import LearningPath, Lesson

def seed():
    db = SessionLocal()
    try:
        # Check if paths exist
        if db.query(LearningPath).filter(LearningPath.title == "Reading Foundations").first():
            print("Foundational lessons already seeded.")
            return

        print("Seeding foundational learning paths and lessons...")
        
        paths_data = [
            {"title": "Reading Foundations", "description": "Core reading skills.", "difficulty": "Beginner"},
            {"title": "Grammar Basics", "description": "Essential grammar rules.", "difficulty": "Beginner"},
            {"title": "Vocabulary Builder", "description": "Expand your vocabulary.", "difficulty": "Beginner"},
            {"title": "Speaking Confidence", "description": "Improve fluency and pronunciation.", "difficulty": "Intermediate"},
            {"title": "Essay Organisation", "description": "Learn to write clear, structured essays.", "difficulty": "Intermediate"},
            {"title": "Inference Skills", "description": "Learn to read between the lines.", "difficulty": "Advanced"},
            {"title": "Complex Sentences", "description": "Master complex grammatical structures.", "difficulty": "Advanced"}
        ]
        
        path_objs = {}
        for pd in paths_data:
            path = LearningPath(**pd)
            db.add(path)
            db.commit()
            db.refresh(path)
            path_objs[pd["title"]] = path

        lessons_data = [
            {"learning_path_id": path_objs["Reading Foundations"].id, "title": "Finding the Main Idea", "description": "Identify the core message of any text.", "content": "Sample content...", "estimated_time": 15, "difficulty": "Beginner"},
            {"learning_path_id": path_objs["Reading Foundations"].id, "title": "Scanning and Skimming", "description": "Read faster and find information quickly.", "content": "Sample content...", "estimated_time": 20, "difficulty": "Beginner"},
            
            {"learning_path_id": path_objs["Grammar Basics"].id, "title": "Subject-Verb Agreement", "description": "The foundation of English grammar.", "content": "Sample content...", "estimated_time": 15, "difficulty": "Beginner"},
            {"learning_path_id": path_objs["Grammar Basics"].id, "title": "Tenses Overview", "description": "Understanding past, present, and future.", "content": "Sample content...", "estimated_time": 20, "difficulty": "Beginner"},

            {"learning_path_id": path_objs["Vocabulary Builder"].id, "title": "Common Phrasal Verbs", "description": "Learn everyday phrasal verbs.", "content": "Sample content...", "estimated_time": 15, "difficulty": "Beginner"},
            {"learning_path_id": path_objs["Vocabulary Builder"].id, "title": "Synonyms and Antonyms", "description": "Expand your word choices.", "content": "Sample content...", "estimated_time": 15, "difficulty": "Beginner"},

            {"learning_path_id": path_objs["Speaking Confidence"].id, "title": "Pronunciation Practice", "description": "Clear up common pronunciation mistakes.", "content": "Sample content...", "estimated_time": 20, "difficulty": "Intermediate"},
            {"learning_path_id": path_objs["Speaking Confidence"].id, "title": "Fluency Drills", "description": "Speak smoothly without hesitation.", "content": "Sample content...", "estimated_time": 25, "difficulty": "Intermediate"},

            {"learning_path_id": path_objs["Essay Organisation"].id, "title": "Introduction and Conclusion", "description": "How to start and end your essay.", "content": "Sample content...", "estimated_time": 30, "difficulty": "Intermediate"},
            {"learning_path_id": path_objs["Essay Organisation"].id, "title": "Paragraph Structure", "description": "Organize your body paragraphs.", "content": "Sample content...", "estimated_time": 25, "difficulty": "Intermediate"},

            {"learning_path_id": path_objs["Inference Skills"].id, "title": "Context Clues", "description": "Guess word meanings from context.", "content": "Sample content...", "estimated_time": 20, "difficulty": "Advanced"},
            {"learning_path_id": path_objs["Inference Skills"].id, "title": "Reading Between the Lines", "description": "Understand implied meanings.", "content": "Sample content...", "estimated_time": 25, "difficulty": "Advanced"},

            {"learning_path_id": path_objs["Complex Sentences"].id, "title": "Relative Clauses", "description": "Connect ideas using relative pronouns.", "content": "Sample content...", "estimated_time": 20, "difficulty": "Advanced"},
            {"learning_path_id": path_objs["Complex Sentences"].id, "title": "Conditionals", "description": "Master if-clauses.", "content": "Sample content...", "estimated_time": 25, "difficulty": "Advanced"}
        ]
        
        for ld in lessons_data:
            lesson = Lesson(**ld)
            db.add(lesson)

        db.commit()
        print("Done seeding foundational lessons.")
        
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
