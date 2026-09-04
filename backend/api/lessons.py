from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import Lesson
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy import desc
import json
import uuid
import time
from config import settings
from supabase import create_client, Client

router = APIRouter()

# Lazily create supabase client only when needed (avoids crashing startup if env vars missing)
_supabase_client = None

def get_supabase():
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    return _supabase_client

# Default seed lessons if database table has no entries
SEED_LESSONS = [
    {
        "id": 1,
        "title": "Mastering IELTS Task 2 Essays",
        "description": "Learn how to structure problem-solution and opinion essays with high-band vocabulary.",
        "content": "To score Band 7+ in IELTS Writing Task 2, structure your essay into 4 distinct paragraphs: Introduction, Body 1, Body 2, and Conclusion. Use cohesive devices like 'Furthermore', 'Conversely', and 'Consequently'.",
        "audio_url": None,
        "skill_domain": "writing",
        "difficulty": "intermediate",
        "estimated_time": 20
    },
    {
        "id": 2,
        "title": "Conversational Fluency & Connected Speech",
        "description": "Listen to native speakers and practice linking words, contractions, and stress patterns.",
        "content": "Connected speech occurs when spoken words join together. For example, 'want to' becomes 'wanna' and 'going to' becomes 'gonna'. Practice sentence stress on content words.",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "skill_domain": "speaking",
        "difficulty": "beginner",
        "estimated_time": 15
    },
    {
        "id": 3,
        "title": "Academic Reading: Skimming & Scanning Techniques",
        "description": "Improve your reading speed and accuracy for complex scientific and academic articles.",
        "content": "Skimming allows you to grasp the main topic quickly by reading headers and topic sentences. Scanning helps you locate specific details like dates, names, and statistics without reading every word.",
        "audio_url": None,
        "skill_domain": "reading",
        "difficulty": "advanced",
        "estimated_time": 25
    },
    {
        "id": 4,
        "title": "Active Listening: Identifying Speaker Intent",
        "description": "Practice listening comprehension with audio tracks and catch subtle emotional cues.",
        "content": "Pay attention to tone changes, pauses, and pitch variations. A rising intonation often signals a question or uncertainty, while a falling tone indicates finality.",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "skill_domain": "listening",
        "difficulty": "intermediate",
        "estimated_time": 18
    }
]

class LessonCreateSchema(BaseModel):
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    audio_url: Optional[str] = None
    skill_domain: str # writing, reading, listening, speaking
    difficulty: str # beginner, intermediate, advanced
    estimated_time: int = 15

class LessonUpdateSchema(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    audio_url: Optional[str] = None
    skill_domain: Optional[str] = None
    difficulty: Optional[str] = None
    estimated_time: Optional[int] = None

@router.get("")
@router.get("/")
def get_lessons(
    skill: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # If DB has no lessons yet, populate SEED_LESSONS into DB
    if not db.query(Lesson).first():
        try:
            for seed in SEED_LESSONS:
                new_seed = Lesson(
                    title=seed["title"],
                    description=seed["description"],
                    content=seed["content"],
                    audio_url=seed["audio_url"],
                    skill_domain=seed["skill_domain"],
                    difficulty=seed["difficulty"],
                    estimated_time=seed["estimated_time"]
                )
                db.add(new_seed)
            db.commit()
        except Exception:
            db.rollback()

    query = db.query(Lesson)
    
    if skill and skill.lower() != "all":
        query = query.filter(Lesson.skill_domain.ilike(skill))
    if difficulty and difficulty.lower() != "all":
        query = query.filter(Lesson.difficulty.ilike(difficulty))
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Lesson.title.ilike(search_pattern)) | 
            (Lesson.description.ilike(search_pattern)) |
            (Lesson.content.ilike(search_pattern))
        )
        
    lessons = query.order_by(desc(Lesson.id)).all()

    result = []
    for l in lessons:
        result.append({
            "id": l.id,
            "title": l.title,
            "description": l.description or "",
            "content": l.content or "",
            "audio_url": l.audio_url,
            "skill_domain": l.skill_domain or "reading",
            "difficulty": l.difficulty or "beginner",
            "estimated_time": l.estimated_time or 15,
            "created_at": l.created_at.strftime("%Y-%m-%d") if hasattr(l, "created_at") and l.created_at else "2026-08-06"
        })
        
    return result

@router.post("")
@router.post("/")
async def create_lesson(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    audio_url: Optional[str] = Form(None),
    skill_domain: str = Form(...),
    difficulty: str = Form(...),
    estimated_time: int = Form(15),
    audio_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    final_audio_url = audio_url

    # Handle Audio File upload if provided
    if audio_file:
        supabase = get_supabase()
        file_ext = audio_file.filename.split(".")[-1] if audio_file.filename else "mp3"
        unique_name = f"lesson_audio_{int(time.time())}_{uuid.uuid4().hex[:6]}.{file_ext}"
        audio_bytes = await audio_file.read()
        
        try:
            supabase.storage.from_("speaking-recordings").upload(
                unique_name,
                audio_bytes,
                {"content-type": audio_file.content_type or "audio/mpeg"}
            )
            final_audio_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/speaking-recordings/{unique_name}"
        except Exception as e:
            print(f"Lesson Audio Upload Exception: {e}")
            # Fallback if storage fails
            final_audio_url = audio_url

    new_lesson = Lesson(
        title=title,
        description=description,
        content=content,
        audio_url=final_audio_url,
        skill_domain=skill_domain.lower(),
        difficulty=difficulty.lower(),
        estimated_time=estimated_time
    )
    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)

    return {
        "success": True,
        "message": "Lesson created successfully",
        "lesson": {
            "id": new_lesson.id,
            "title": new_lesson.title,
            "description": new_lesson.description,
            "content": new_lesson.content,
            "audio_url": new_lesson.audio_url,
            "skill_domain": new_lesson.skill_domain,
            "difficulty": new_lesson.difficulty,
            "estimated_time": new_lesson.estimated_time
        }
    }

@router.put("/{lesson_id}")
async def update_lesson(
    lesson_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    audio_url: Optional[str] = Form(None),
    skill_domain: Optional[str] = Form(None),
    difficulty: Optional[str] = Form(None),
    estimated_time: Optional[int] = Form(None),
    audio_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if title is not None:
        lesson.title = title
    if description is not None:
        lesson.description = description
    if content is not None:
        lesson.content = content
    if skill_domain is not None:
        lesson.skill_domain = skill_domain.lower()
    if difficulty is not None:
        lesson.difficulty = difficulty.lower()
    if estimated_time is not None:
        lesson.estimated_time = estimated_time

    if audio_file:
        supabase = get_supabase()
        file_ext = audio_file.filename.split(".")[-1] if audio_file.filename else "mp3"
        unique_name = f"lesson_audio_{int(time.time())}_{uuid.uuid4().hex[:6]}.{file_ext}"
        audio_bytes = await audio_file.read()
        try:
            supabase.storage.from_("speaking-recordings").upload(
                unique_name,
                audio_bytes,
                {"content-type": audio_file.content_type or "audio/mpeg"}
            )
            lesson.audio_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/speaking-recordings/{unique_name}"
        except Exception as e:
            print(f"Lesson Audio Upload Error: {e}")
    elif audio_url is not None:
        lesson.audio_url = audio_url

    db.commit()
    db.refresh(lesson)

    return {"success": True, "message": "Lesson updated successfully"}

@router.delete("/{lesson_id}")
def delete_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    db.delete(lesson)
    db.commit()
    return {"success": True, "message": "Lesson deleted successfully"}

