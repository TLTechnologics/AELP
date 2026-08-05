from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
import json
import uuid
import time
from config import settings
from supabase import create_client, Client
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy import desc
from models.models import Assessment, AssessmentType, Question, QuestionType, QuestionOption, AudioFile, User, Student, RoleEnum, Lesson
router = APIRouter()
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

@router.get("/students")
def get_students(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.role == RoleEnum.STUDENT).all()
    
    result = []
    for user in users:
        student_profile = db.query(Student).filter(Student.user_id == user.id).first()
        result.append({
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.full_name,
            "class": student_profile.semester if student_profile and hasattr(student_profile, 'semester') else "Semester 1",
            "listeningScore": student_profile.listening_score if student_profile else 0,
            "readingScore": student_profile.reading_score if student_profile else 0,
            "writingScore": student_profile.writing_score if student_profile else 0,
            "speakingScore": 0, # missing in model
            "overallScore": student_profile.overall_progress if student_profile else 0,
            "cefrLevel": student_profile.current_level if student_profile else "Beginner",
            "attendance": 100,
            "status": "Good",
            "streak": 0,
            "weeklyProgress": [40, 50, 60, 70, 80],
            "monthlyProgress": [30, 45, 60, 75, 85]
        })
    return result

class StudentCreateRequest(BaseModel):
    email: str
    password: str
    full_name: str
    semester: str = "Semester 1"

@router.post("/students")
def create_student(data: StudentCreateRequest, db: Session = Depends(get_db)):
    # 1. Create in Supabase Auth
    try:
        user_response = supabase.auth.admin.create_user({
            "email": data.email,
            "password": data.password,
            "email_confirm": True,
            "user_metadata": {
                "full_name": data.full_name
            }
        })
        
        user_id = user_response.user.id
        
        # 2. Add to postgres users table
        new_user = User(
            id=user_id,
            email=data.email,
            full_name=data.full_name,
            role=RoleEnum.STUDENT
        )
        db.add(new_user)
        
        # 3. Add to students table
        new_student = Student(
            user_id=user_id,
            semester=data.semester,
            current_level="Beginner",
            overall_progress=0,
            listening_score=0,
            reading_score=0,
            writing_score=0
        )
        db.add(new_student)
        db.commit()
        
        return {"success": True, "message": "Student created successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

class SpeakingUploadRequest(BaseModel):
    title: str
    difficulty: str
    topic: str

class WritingUploadRequest(BaseModel):
    title: str
    difficulty: str
    topic: str

class OptionInput(BaseModel):
    text: str
    is_correct: bool

class QuestionInput(BaseModel):
    type: str = "mcq"
    text: str
    marks: float
    options: List[OptionInput]

class ReadingUploadRequest(BaseModel):
    title: str
    difficulty: str
    reading_passage: str
    questions: List[QuestionInput]

@router.post("/assessments/speaking")
def upload_speaking_assessment(request: SpeakingUploadRequest, db: Session = Depends(get_db)):
    assessment = Assessment(
        title=request.title,
        type=AssessmentType.SPEAKING,
        difficulty=request.difficulty,
        topic=request.topic
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return {"message": "Speaking assessment uploaded successfully", "id": assessment.id}

@router.post("/assessments/writing")
def upload_writing_assessment(request: WritingUploadRequest, db: Session = Depends(get_db)):
    assessment = Assessment(
        title=request.title,
        type=AssessmentType.WRITING,
        difficulty=request.difficulty,
        topic=request.topic
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return {"message": "Writing assessment uploaded successfully", "id": assessment.id}

@router.post("/assessments/reading")
def upload_reading_assessment(request: ReadingUploadRequest, db: Session = Depends(get_db)):
    assessment = Assessment(
        title=request.title,
        type=AssessmentType.READING,
        difficulty=request.difficulty,
        reading_passage=request.reading_passage
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    for q_input in request.questions:
        # Default to MCQ if type is missing or invalid
        try:
            q_type = QuestionType(q_input.type)
        except ValueError:
            q_type = QuestionType.MCQ
            
        question = Question(
            assessment_id=assessment.id,
            type=q_type,
            text=q_input.text,
            marks=q_input.marks
        )
        db.add(question)
        db.commit()
        db.refresh(question)

        for opt_input in q_input.options:
            option = QuestionOption(
                question_id=question.id,
                text=opt_input.text,
                is_correct=opt_input.is_correct
            )
            db.add(option)
        db.commit()

    return {"message": "Reading assessment uploaded successfully", "id": assessment.id}

@router.post("/assessments/listening")
async def upload_listening_assessment(
    audio_file: UploadFile = File(...),
    title: str = Form(...),
    difficulty: str = Form(...),
    questions: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        questions_list = json.loads(questions)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid questions JSON structure")

    # Upload audio to Supabase Storage
    file_extension = audio_file.filename.split(".")[-1] if audio_file.filename else "mp3"
    unique_filename = f"listening_{int(time.time())}_{uuid.uuid4().hex[:8]}.{file_extension}"
    audio_bytes = await audio_file.read()
    
    try:
        supabase.storage.from_("speaking-recordings").upload(
            unique_filename,
            audio_bytes,
            {"content-type": audio_file.content_type or "audio/mpeg"}
        )
        audio_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/speaking-recordings/{unique_filename}"
    except Exception as e:
        print(f"Supabase Upload Error: {e}")
        raise HTTPException(status_code=500, detail="Unable to upload audio. Please try again.")

    audio_record = AudioFile(url=audio_url, duration=0)
    db.add(audio_record)
    db.commit()
    db.refresh(audio_record)

    assessment = Assessment(
        title=title,
        type=AssessmentType.LISTENING,
        difficulty=difficulty,
        audio_file_id=audio_record.id
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    for q_data in questions_list:
        q_type_str = q_data.get("type", "mcq")
        try:
            q_type = QuestionType(q_type_str)
        except ValueError:
            q_type = QuestionType.MCQ

        question = Question(
            assessment_id=assessment.id,
            type=q_type,
            text=q_data.get("text", ""),
            marks=q_data.get("marks", 1.0)
        )
        db.add(question)
        db.commit()
        db.refresh(question)

        for opt_data in q_data.get("options", []):
            option = QuestionOption(
                question_id=question.id,
                text=opt_data.get("text", ""),
                is_correct=opt_data.get("is_correct", False)
            )
            db.add(option)
    return {"message": "Listening assessment uploaded successfully", "id": assessment.id}

# Default seed lessons if database table has no entries
SEED_LESSONS = [
    {
        "title": "Mastering IELTS Task 2 Essays",
        "description": "Learn how to structure problem-solution and opinion essays with high-band vocabulary.",
        "content": "To score Band 7+ in IELTS Writing Task 2, structure your essay into 4 distinct paragraphs: Introduction, Body 1, Body 2, and Conclusion. Use cohesive devices like 'Furthermore', 'Conversely', and 'Consequently'.",
        "audio_url": None,
        "skill_domain": "writing",
        "difficulty": "intermediate",
        "estimated_time": 20
    },
    {
        "title": "Conversational Fluency & Connected Speech",
        "description": "Listen to native speakers and practice linking words, contractions, and stress patterns.",
        "content": "Connected speech occurs when spoken words join together. For example, 'want to' becomes 'wanna' and 'going to' becomes 'gonna'. Practice sentence stress on content words.",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "skill_domain": "speaking",
        "difficulty": "beginner",
        "estimated_time": 15
    },
    {
        "title": "Academic Reading: Skimming & Scanning Techniques",
        "description": "Improve your reading speed and accuracy for complex scientific and academic articles.",
        "content": "Skimming allows you to grasp the main topic quickly by reading headers and topic sentences. Scanning helps you locate specific details like dates, names, and statistics without reading every word.",
        "audio_url": None,
        "skill_domain": "reading",
        "difficulty": "advanced",
        "estimated_time": 25
    },
    {
        "title": "Active Listening: Identifying Speaker Intent",
        "description": "Practice listening comprehension with audio tracks and catch subtle emotional cues.",
        "content": "Pay attention to tone changes, pauses, and pitch variations. A rising intonation often signals a question or uncertainty, while a falling tone indicates finality.",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "skill_domain": "listening",
        "difficulty": "intermediate",
        "estimated_time": 18
    }
]

@router.get("/lessons")
@router.get("/lessons/")
def get_teacher_lessons(
    skill: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Lesson)
    if skill and skill.lower() != "all":
        query = query.filter(Lesson.skill_domain == skill.lower())
    if difficulty and difficulty.lower() != "all":
        query = query.filter(Lesson.difficulty == difficulty.lower())
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Lesson.title.ilike(search_pattern)) | 
            (Lesson.description.ilike(search_pattern)) |
            (Lesson.content.ilike(search_pattern))
        )
        
    lessons = query.order_by(desc(Lesson.id)).all()
    if not db.query(Lesson).first():
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
        lessons = db.query(Lesson).order_by(desc(Lesson.id)).all()

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

@router.post("/lessons")
@router.post("/lessons/")
async def create_teacher_lesson(
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
    if audio_file:
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

@router.put("/lessons/{lesson_id}")
async def update_teacher_lesson(
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

@router.delete("/lessons/{lesson_id}")
def delete_teacher_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    db.delete(lesson)
    db.commit()
    return {"success": True, "message": "Lesson deleted successfully"}
