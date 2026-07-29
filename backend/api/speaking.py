from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import Assessment, AssessmentType, SpeakingRecording, SpeakingEvaluation, StudentAssessment, Student, User
from services.gemini_service import evaluate_speaking
import json
import uuid
import time
from config import settings
from supabase import create_client, Client

router = APIRouter()

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

def ensure_student(db: Session, student_id: int = 1) -> Student:
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        user = db.query(User).filter(User.id == "default_student_user").first()
        if not user:
            user = User(id="default_student_user", email="student@aelp.com", full_name="Student")
            db.add(user)
            db.commit()
            db.refresh(user)
        student = Student(id=student_id, user_id=user.id)
        db.add(student)
        db.commit()
        db.refresh(student)
    return student

@router.post("/submit")
async def submit_speaking(
    student_id: int = Form(1),
    assessment_id: int = Form(...),
    prompt: str = Form(...),
    duration: int = Form(...),
    audio_file: UploadFile = File(...)
):
    # Enforce duration limits
    if duration < 30:
        raise HTTPException(status_code=400, detail="Please speak for at least 30 seconds.")
    if duration > 120:
        raise HTTPException(status_code=400, detail="Maximum recording time reached.")

    # Upload to Supabase Storage
    file_extension = audio_file.filename.split(".")[-1] if audio_file.filename else "webm"
    unique_filename = f"student_{student_id}_{int(time.time())}_{uuid.uuid4().hex[:8]}.{file_extension}"
    
    audio_bytes = await audio_file.read()
    
    try:
        supabase.storage.from_("speaking-recordings").upload(
            unique_filename,
            audio_bytes,
            {"content-type": audio_file.content_type}
        )
        audio_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/speaking-recordings/{unique_filename}"
    except Exception as e:
        print(f"Supabase Upload Error: {e}")
        raise HTTPException(status_code=500, detail="Unable to upload recording. Please try again.")

    # Evaluate with Gemini
    try:
        evaluation = evaluate_speaking(audio_bytes, audio_file.content_type, prompt)
    except Exception as e:
        print(f"Gemini Evaluation Error: {e}")
        raise HTTPException(status_code=500, detail="Unable to evaluate speaking assessment. Please try again later.")

    # Save to Database
    db = next(get_db())
    ensure_student(db, student_id)
    
    student_assessment = StudentAssessment(
        student_id=student_id,
        assessment_id=assessment_id
    )
    db.add(student_assessment)
    db.commit()
    db.refresh(student_assessment)

    recording = SpeakingRecording(
        student_id=student_id,
        assessment_id=assessment_id,
        audio_url=audio_url,
        duration=duration
    )
    db.add(recording)
    db.commit()
    db.refresh(recording)

    db_eval = SpeakingEvaluation(
        recording_id=recording.id,
        transcript=evaluation.get("transcript", ""),
        grammar=evaluation.get("grammar", 0),
        vocabulary=evaluation.get("vocabulary", 0),
        pronunciation=evaluation.get("pronunciation", 0),
        fluency=evaluation.get("fluency", 0),
        coherence=evaluation.get("coherence", 0),
        confidence=evaluation.get("confidence", 0),
        communication=evaluation.get("communication", 0),
        overall=evaluation.get("overall", 0),
        cefr_level=evaluation.get("cefr_level", ""),
        feedback=evaluation.get("feedback", ""),
        strengths=json.dumps(evaluation.get("strengths", [])),
        weaknesses=json.dumps(evaluation.get("weaknesses", [])),
        recommended_lessons=json.dumps(evaluation.get("recommended_lessons", []))
    )
    db.add(db_eval)
    
    # Update student_assessment score
    student_assessment.total_marks = db_eval.overall
    student_assessment.accuracy = (db_eval.overall / 70.0) * 100 if db_eval.overall else 0
    db.commit()

    return evaluation
