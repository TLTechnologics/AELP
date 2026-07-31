import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.database import engine
from sqlalchemy import text

def add_columns():
    with engine.connect() as conn:
        print("Adding columns to student_assessments...")
        try:
            conn.execute(text("ALTER TABLE student_assessments ADD COLUMN cefr_level VARCHAR;"))
            print("Added cefr_level")
        except Exception as e:
            print(f"cefr_level might already exist: {e}")
            
        try:
            conn.execute(text("ALTER TABLE student_assessments ADD COLUMN status VARCHAR DEFAULT 'Completed';"))
            print("Added status")
        except Exception as e:
            print(f"status might already exist: {e}")
            
        try:
            conn.execute(text("ALTER TABLE student_assessments ADD COLUMN evaluation_id INTEGER;"))
            print("Added evaluation_id")
        except Exception as e:
            print(f"evaluation_id might already exist: {e}")
            
        conn.commit()
        print("Done.")

if __name__ == "__main__":
    add_columns()
