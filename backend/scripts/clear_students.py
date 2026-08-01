import sys
import os

# Add parent dir to path so we can import from backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.database import SessionLocal
from models.models import User, Student, RoleEnum
from supabase import create_client, Client
from config import settings

def clear_all_students():
    print("Initializing Supabase client...")
    supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    
    print("Connecting to PostgreSQL...")
    db = SessionLocal()
    
    try:
        # 1. Fetch all users with STUDENT role
        students = db.query(User).filter(User.role == RoleEnum.STUDENT).all()
        print(f"Found {len(students)} students in Postgres.")
        
        for s in students:
            print(f"Deleting student: {s.email} (ID: {s.id})")
            
            # Delete from Supabase Auth
            try:
                supabase.auth.admin.delete_user(s.id)
                print(f" - Deleted from Supabase Auth")
            except Exception as e:
                print(f" - Error deleting from Supabase Auth: {e}")
                
            db.delete(s)
            
        db.commit()
        print("All students deleted from local DB successfully.")
        
    except Exception as e:
        print(f"Error during cleanup: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_all_students()
