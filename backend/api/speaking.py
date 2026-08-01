from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import Assessment, AssessmentType, SpeakingRecording, SpeakingEvaluation, StudentAssessment, Student, User
from sqlalchemy.sql import func
from services.recommendation_engine import process_evaluation
from services.gemini_service import evaluate_speaking
import json
import uuid
import time
from config import settings
from supabase import create_client, Client
from api.deps import get_current_student

router = APIRouter()

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

@router.post("/evaluate")
async def submit_speaking(
    audio_file: UploadFile = File(...),
    assessment_id: int = Form(...),
    prompt: str = Form(...),
    duration: int = Form(...),
    db: Session = Depends(get_db),
    student: Student = Depends(get_current_student)
):
    student_id = student.id
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
        mime_type = audio_file.content_type or "audio/webm"
        evaluation = evaluate_speaking(audio_bytes, mime_type, prompt)
    except Exception as e:
        print(f"Gemini Evaluation Error: {e}")
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")

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
    student_assessment.cefr_level = evaluation.get("cefr_level", "B1")
    student_assessment.status = "Completed"
    student_assessment.evaluation_id = db_eval.id
    student_assessment.completed_at = func.now()
    db.commit()

    # Trigger Adaptive Recommendation Engine
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if assessment:
        try:
            process_evaluation(db, student_id, assessment_id, assessment.type, eval_data=db_eval)
        except Exception as e:
            print(f"Engine Error: {e}")

    return evaluation
