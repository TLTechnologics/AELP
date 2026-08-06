from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
import json
import uuid
import time
from config import settings
from supabase import create_client, Client
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from database.database import get_db
from models.models import Assessment, AssessmentType, Question, QuestionType, QuestionOption, AudioFile, User, Student, RoleEnum
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
        db.commit()

    return {"message": "Listening assessment uploaded successfully", "id": assessment.id}
