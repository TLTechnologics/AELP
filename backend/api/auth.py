from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import User
from api.deps import get_current_user

router = APIRouter()

@router.get("/")
def get_auth():
    return {"message": "auth route"}

@router.get("/profile")
def get_profile(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role.value if user.role else "student"
    }
