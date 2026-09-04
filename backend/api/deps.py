from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import User, Student, RoleEnum
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

from config import settings

_supabase_client = None

def get_supabase_client() -> Client:
    global _supabase_client
    if _supabase_client is None:
        url = os.environ.get("SUPABASE_URL") or settings.SUPABASE_URL
        key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_KEY") or settings.SUPABASE_SERVICE_KEY or settings.SUPABASE_KEY
        if not url or not key:
            raise HTTPException(status_code=500, detail="Supabase configuration is missing in backend environment.")
        _supabase_client = create_client(url, key)
    return _supabase_client

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security), db: Session = Depends(get_db)) -> User:
    token = credentials.credentials
    try:
        # Verify token with Supabase
        user_response = get_supabase_client().auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token or user not found")
            
        supabase_user = user_response.user
        supabase_user_id = supabase_user.id
        
        # Get user from our DB
        user = db.query(User).filter(User.id == supabase_user_id).first()
        if not user:
            # Auto-provision user record in public.users DB table if created via Supabase Auth
            metadata = supabase_user.user_metadata or {}
            role_str = str(metadata.get("role", "")).lower()
            email_str = (supabase_user.email or "").lower()
            
            if "teacher" in role_str or "teacher" in email_str:
                assigned_role = RoleEnum.TEACHER
            elif "admin" in role_str:
                assigned_role = RoleEnum.ADMIN
            else:
                assigned_role = RoleEnum.STUDENT

            full_name = metadata.get("full_name") or metadata.get("name") or (email_str.split("@")[0] if email_str else "User")
            
            user = User(
                id=supabase_user_id,
                email=supabase_user.email,
                full_name=full_name,
                role=assigned_role
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
        return user
    except HTTPException:
        raise
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

def get_current_student(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Student:
    # student = db.query(Student).filter(Student.user_id == user.id).first()
    # if not student:
    #     raise HTTPException(status_code=404, detail="Student profile not found")
    
    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        student = Student(user_id=user.id, semester='Semester 1', current_level='Beginner')
        db.add(student)
        db.commit()
        db.refresh(student)
    return student
