from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import User, Student
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY") # Or anon key if preferable, but we have service key

if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")

supabase: Client = create_client(supabase_url, supabase_key)

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security), db: Session = Depends(get_db)) -> User:
    token = credentials.credentials
    try:
        # Verify token with Supabase
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token or user not found")
            
        supabase_user_id = user_response.user.id
        
        # Get user from our DB
        user = db.query(User).filter(User.id == supabase_user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User record not found in database")
            
        return user
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

def get_current_student(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Student:
    # student = db.query(Student).filter(Student.user_id == user.id).first()
    # if not student:
    #     raise HTTPException(status_code=404, detail="Student profile not found")
    
    return user # Return user instead of student for testing
