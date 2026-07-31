import os
import sys
from dotenv import load_dotenv
from sqlalchemy import func

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.database import SessionLocal
from models.models import User, Student

db = SessionLocal()

email = "9898065907@gmail.com"
user = db.query(User).filter(User.email == email).first()

if user:
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        max_id = db.query(func.max(Student.id)).scalar() or 0
        new_id = max_id + 1
        
        new_student = Student(
            id=new_id,
            user_id=user.id,
            current_level="Beginner",
            overall_progress=0.0
        )
        db.add(new_student)
        db.commit()
        print(f"Successfully created student record with ID {new_id}")
    else:
        print("Student record already exists.")
else:
    print("User not found in DB.")

db.close()
