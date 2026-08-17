from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
import json
import uuid
import time
from config import settings
from supabase import create_client, Client
from sqlalchemy.orm import Session, joinedload, selectinload
from typing import List, Optional
from pydantic import BaseModel
from database.database import get_db
from api.deps import get_current_user
from models.models import Assessment, AssessmentType, Question, QuestionType, QuestionOption, AudioFile, User, Student, RoleEnum, StudentAssessment, AIEvaluation, SpeakingEvaluation, ProgressHistory, StudentLessonRecommendations, WritingSubmission, SpeakingRecording
router = APIRouter()

# Lazily create supabase client only when needed
_supabase_client = None

def get_supabase():
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    return _supabase_client


@router.get("/students")
def get_students(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in (RoleEnum.TEACHER, RoleEnum.ADMIN):
        raise HTTPException(status_code=403, detail="Teacher access is required")

    # Load the entire directory in a constant number of queries. The previous
    # implementation queried profiles, assessments, assessment definitions,
    # writing submissions, and evaluations separately for every student.
    # That N+1 pattern times out on Render once the directory grows.
    users = (
        db.query(User)
        .options(
            joinedload(User.student_profile).options(
                selectinload(Student.assessments).joinedload(StudentAssessment.assessment),
                selectinload(Student.assessments)
                .selectinload(StudentAssessment.writing_submission)
                .joinedload(WritingSubmission.evaluation),
            )
        )
        .filter(User.role == RoleEnum.STUDENT)
        .all()
    )

    student_ids = [
        user.student_profile.id
        for user in users
        if user.student_profile is not None
    ]
    recordings_by_student = {}
    if student_ids:
        recordings = (
            db.query(SpeakingRecording)
            .options(joinedload(SpeakingRecording.evaluation))
            .filter(SpeakingRecording.student_id.in_(student_ids))
            .all()
        )
        for recording in recordings:
            recordings_by_student.setdefault(recording.student_id, []).append(recording)
    
    result = []
    for user in users:
        student_profile = user.student_profile
        
        # Calculate dynamic scores
        scores_by_type = {"listening": [], "reading": [], "writing": [], "speaking": []}
        
        if student_profile:
            assessments = student_profile.assessments
            for sa in assessments:
                assessment = sa.assessment
                if assessment and sa.total_marks is not None:
                    typ = assessment.type.value.lower()
                    if typ in scores_by_type:
                        scores_by_type[typ].append(sa.total_marks)
            
            # Also check speaking AI evaluations
            recordings = recordings_by_student.get(student_profile.id, [])
            for rec in recordings:
                if rec.evaluation and rec.evaluation.overall is not None:
                    scores_by_type["speaking"].append(rec.evaluation.overall)
                    
            # Also check writing AI evaluations
            for sa in assessments:
                sub = sa.writing_submission
                if sub:
                    ai_eval = sub.evaluation
                    if ai_eval and ai_eval.overall is not None:
                        scores_by_type["writing"].append(ai_eval.overall)
        
        l_score = round(sum(scores_by_type["listening"])/len(scores_by_type["listening"]), 1) if scores_by_type["listening"] else (student_profile.listening_score if student_profile and student_profile.listening_score else 0)
        r_score = round(sum(scores_by_type["reading"])/len(scores_by_type["reading"]), 1) if scores_by_type["reading"] else (student_profile.reading_score if student_profile and student_profile.reading_score else 0)
        w_score = round(sum(scores_by_type["writing"])/len(scores_by_type["writing"]), 1) if scores_by_type["writing"] else (student_profile.writing_score if student_profile and student_profile.writing_score else 0)
        s_score = round(sum(scores_by_type["speaking"])/len(scores_by_type["speaking"]), 1) if scores_by_type["speaking"] else 0
        
        overall_score = round((l_score + r_score + w_score + s_score) / 4, 1)

        result.append({
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.full_name,
            "class": student_profile.semester if student_profile and hasattr(student_profile, 'semester') else "Semester 1",
            "listeningScore": l_score,
            "readingScore": r_score,
            "writingScore": w_score,
            "speakingScore": s_score,
            "overallScore": overall_score,
            "cefrLevel": student_profile.current_level if student_profile else "Beginner",
            "group": student_profile.current_level if student_profile else "Beginner",
            "attendance": 100,
            "status": "Good",
            "streak": 0,
            "weeklyProgress": [40, 50, 60, 70, 80],
            "monthlyProgress": [30, 45, 60, 75, 85]
        })
    return result


@router.get("/reports/summary")
def get_reports_summary(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.role == RoleEnum.STUDENT).all()
    
    total_listening = 0
    total_reading = 0
    total_writing = 0
    count = 0
    
    for user in users:
        student_profile = db.query(Student).filter(Student.user_id == user.id).first()
        if student_profile:
            total_listening += student_profile.listening_score or 0
            total_reading += student_profile.reading_score or 0
            total_writing += student_profile.writing_score or 0
            count += 1
            
    avg_listening = round(total_listening / count, 1) if count > 0 else 0
    avg_reading = round(total_reading / count, 1) if count > 0 else 0
    avg_writing = round(total_writing / count, 1) if count > 0 else 0
    
    return {
        "cohorts": [
            {
                "id": "c-1",
                "name": "Semester 1",
                "totalStudents": count,
                "avgListening": avg_listening,
                "avgReading": avg_reading,
                "avgWriting": avg_writing,
                "avgSpeaking": 0, # Placeholder
                "attendance": 91.5
            }
        ],
        "executiveSummary": {
            "averageAttendance": 91.5,
            "xpAccumulation": 14250,
            "accuracyRatio": 94
        }
    }

@router.get("/students/{student_id}")
def get_student_details(student_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == student_id, User.role == RoleEnum.STUDENT).first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
        
    student_profile = db.query(Student).filter(Student.user_id == user.id).first()
    
    # Get assessments
    student_assessments = []
    if student_profile:
        student_assessments = db.query(StudentAssessment).filter(
            StudentAssessment.student_id == student_profile.id
        ).order_by(StudentAssessment.started_at.desc()).all()
    
    assessment_history = []
    feedback_history = []
    
    for sa in student_assessments:
        # fetch assessment details
        assessment = db.query(Assessment).filter(Assessment.id == sa.assessment_id).first()
        if assessment:
            assessment_history.append({
                "id": str(sa.id),
                "title": assessment.title,
                "type": assessment.type.value.capitalize() if assessment.type else "Unknown",
                "date": sa.started_at.strftime("%Y-%m-%d") if sa.started_at else "N/A",
                "score": sa.total_marks or 0
            })
            
            # Fetch speaking feedback
            if assessment.type == AssessmentType.SPEAKING:
                recording = db.query(SpeakingRecording).filter(SpeakingRecording.assessment_id == sa.assessment_id, SpeakingRecording.student_id == student_profile.id).first()
                if recording and recording.evaluation:
                    feedback_history.append({
                        "id": f"fb-sp-{recording.evaluation.id}",
                        "date": sa.started_at.strftime("%Y-%m-%d") if sa.started_at else "N/A",
                        "type": "Speaking (AI)",
                        "score": recording.evaluation.overall,
                        "feedback": recording.evaluation.feedback,
                        "teacher": "Groq AI"
                    })

            
            # Fetch feedback from AI evaluations
            # Check writing
            if assessment.type == AssessmentType.WRITING and sa.writing_submission:
                ai_eval = db.query(AIEvaluation).filter(AIEvaluation.submission_id == sa.writing_submission.id).first()
                if ai_eval:
                    feedback_history.append({
                        "id": f"fb-ai-{ai_eval.id}",
                        "date": sa.started_at.strftime("%Y-%m-%d") if sa.started_at else "N/A",
                        "type": "Writing (AI)",
                        "score": ai_eval.overall,
                        "feedback": ai_eval.feedback,
                        "teacher": "Groq AI"
                    })
    
    # Dynamically calculate scores
    scores_by_type = {"listening": [], "reading": [], "writing": [], "speaking": []}
    for ah in assessment_history:
        typ = ah["type"].lower()
        if typ in scores_by_type and ah["score"] is not None:
            scores_by_type[typ].append(ah["score"])
    
    l_score = round(sum(scores_by_type["listening"])/len(scores_by_type["listening"]), 1) if scores_by_type["listening"] else (student_profile.listening_score if student_profile else 0)
    r_score = round(sum(scores_by_type["reading"])/len(scores_by_type["reading"]), 1) if scores_by_type["reading"] else (student_profile.reading_score if student_profile else 0)
    w_score = round(sum(scores_by_type["writing"])/len(scores_by_type["writing"]), 1) if scores_by_type["writing"] else (student_profile.writing_score if student_profile else 0)
    
    # For speaking, let's check evaluations if the assessment score is 0
    s_eval_scores = [fb["score"] for fb in feedback_history if fb["type"] == "Speaking (AI)"]
    if s_eval_scores:
        s_score = round(sum(s_eval_scores)/len(s_eval_scores), 1)
    else:
        s_score = round(sum(scores_by_type["speaking"])/len(scores_by_type["speaking"]), 1) if scores_by_type["speaking"] else 0

    overall_score = round((l_score + r_score + w_score + s_score) / 4, 1)
    
    cefr_level = "Beginner"
    if overall_score > 85:
        cefr_level = "Advanced"
    elif overall_score > 70:
        cefr_level = "Upper Intermediate"
    elif overall_score > 50:
        cefr_level = "Intermediate"
    elif overall_score > 25:
        cefr_level = "Elementary"
    
    # Calculate accuracy based on answered questions
    accuracy = 90
    if student_assessments:
        acc_list = [sa.accuracy for sa in student_assessments if sa.accuracy is not None]
        if acc_list:
            accuracy = round(sum(acc_list)/len(acc_list), 1)

    return {
        "id": user.id,
        "name": user.full_name,
        "email": user.email,
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.full_name.replace(" ", "%20"),
        "class": student_profile.semester if student_profile and hasattr(student_profile, 'semester') else "Semester 1",
        "group": "Group A",
        "listeningScore": l_score,
        "readingScore": r_score,
        "writingScore": w_score,
        "speakingScore": s_score,
        "overallScore": overall_score,
        "cefrLevel": cefr_level,
        "attendance": 100,
        "status": "Good" if overall_score >= 50 else ("Needs Improvement" if overall_score >= 30 else "Critical"),
        "streak": len(student_assessments),
        "timeSpent": sum([sa.time_taken or 0 for sa in student_assessments]),
        "accuracy": accuracy,
        "weeklyProgress": [max(0, overall_score - 20), max(0, overall_score - 10), overall_score, overall_score, overall_score],
        "assignedLessons": ["Grammar Basics", "Present Continuous"],
        "recommendations": ["Practice speaking with native speakers", "Read more articles"],
        "assessmentHistory": assessment_history,
        "feedbackHistory": feedback_history
    }


class StudentUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    semester: Optional[str] = None
    group: Optional[str] = None
    roll_number: Optional[str] = None

class StudentCreateRequest(BaseModel):
    email: str
    password: str
    full_name: str
    semester: str = "Semester 1"

@router.put("/students/{student_id}")
def update_student(student_id: str, data: StudentUpdateRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == student_id, User.role == RoleEnum.STUDENT).first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
        
    student_profile = db.query(Student).filter(Student.user_id == user.id).first()
    
    if data.full_name:
        user.full_name = data.full_name
    if data.email:
        user.email = data.email
        
    if student_profile:
        if data.semester is not None:
            student_profile.semester = data.semester
        if data.group is not None:
            student_profile.group = data.group
        if hasattr(student_profile, 'roll_number') and data.roll_number is not None:
            student_profile.roll_number = data.roll_number
            
    db.commit()
    db.refresh(user)
    return {"message": "Student updated successfully"}

@router.delete("/students/{student_id}")
def delete_student(student_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == student_id, User.role == RoleEnum.STUDENT).first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
        
    # Delete from Supabase Auth
    try:
        get_supabase().auth.admin.delete_user(student_id)
    except Exception as e:
        print(f"Failed to delete from Supabase Auth: {e}")
        
    student_profile = db.query(Student).filter(Student.user_id == user.id).first()
    if student_profile:
        db.delete(student_profile)
        
    db.delete(user)
    db.commit()
    
    return {"message": "Student deleted successfully"}


@router.post("/students")
def create_student(data: StudentCreateRequest, db: Session = Depends(get_db)):
    # 1. Create in Supabase Auth
    try:
        user_response = get_supabase().auth.admin.create_user({
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
        get_supabase().storage.from_("speaking-recordings").upload(
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

@router.get('/class-analytics')
def get_class_analytics(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.role == RoleEnum.STUDENT).all()
    students_data = []

    total_l = 0
    total_r = 0
    total_w = 0
    total_s = 0
    count = 0

    for u in users:
        try:
            sp = db.query(Student).filter(Student.user_id == u.id).first()
            if not sp:
                continue

            # Calculate dynamic scores based on assessments
            sass = db.query(StudentAssessment).filter(
                StudentAssessment.student_id == sp.id
            ).all()
            l_scores, r_scores, w_scores, s_scores = [], [], [], []

            for sa in sass:
                try:
                    if sa.assessment and sa.total_marks and sa.assessment.type:
                        t = sa.assessment.type.value.lower()
                        if t == 'listening': l_scores.append(sa.total_marks)
                        elif t == 'reading':  r_scores.append(sa.total_marks)
                        elif t == 'writing':  w_scores.append(sa.total_marks)
                        elif t == 'speaking': s_scores.append(sa.total_marks)
                except Exception:
                    pass

            ls = sum(l_scores)/len(l_scores) if l_scores else (sp.listening_score or 0)
            rs = sum(r_scores)/len(r_scores) if r_scores else (sp.reading_score or 0)
            ws = sum(w_scores)/len(w_scores) if w_scores else (sp.writing_score or 0)

            # Speaking from AI evaluations
            ss = 0
            try:
                recordings = db.query(SpeakingRecording).filter(
                    SpeakingRecording.student_id == sp.id
                ).all()
                recording_ids = [r.id for r in recordings]
                if recording_ids:
                    ai_evals = db.query(SpeakingEvaluation).filter(
                        SpeakingEvaluation.recording_id.in_(recording_ids)
                    ).all()
                    valid = [e.overall for e in ai_evals if e.overall is not None]
                    if valid:
                        ss = sum(valid) / len(valid)
            except Exception:
                pass

            if not ss and s_scores:
                ss = sum(s_scores) / len(s_scores)

            overall = (ls + rs + ws + ss) / 4

            status = 'Good'
            if overall < 50: status = 'Needs Improvement'
            if overall < 30: status = 'Critical'

            students_data.append({
                'id': str(u.id),
                'name': u.full_name or u.email,
                'class': sp.semester or 'Semester 1',
                'listeningScore': round(ls, 1),
                'readingScore':   round(rs, 1),
                'writingScore':   round(ws, 1),
                'speakingScore':  round(ss, 1),
                'overallScore':   round(overall, 1),
                'attendance': 100,
                'status': status,
                'xp': int(overall * 100),
                'streak': len(sass)
            })

            total_l += ls
            total_r += rs
            total_w += ws
            total_s += ss
            count += 1

        except Exception as e:
            print(f"[class-analytics] skipping user {u.id}: {e}")
            continue

    avg_l = round(total_l/count, 1) if count else 0
    avg_r = round(total_r/count, 1) if count else 0
    avg_w = round(total_w/count, 1) if count else 0
    avg_s = round(total_s/count, 1) if count else 0
    avg_overall = round((avg_l + avg_r + avg_w + avg_s) / 4, 1)

    return {
        'classes': [{
            'id': 'c1',
            'name': 'Semester 1',
            'totalStudents': count,
            'avgOverall': avg_overall,
            'attendance': 100,
            'missingAssessments': len([s for s in students_data if s['status'] == 'Critical']),
            'avgListening': avg_l,
            'avgReading':   avg_r,
            'avgWriting':   avg_w,
            'avgSpeaking':  avg_s
        }],
        'students': students_data
    }


@router.get('/writing-submissions')
def get_writing_submissions(db: Session = Depends(get_db)):
    submissions = db.query(WritingSubmission).all()
    
    sa_ids = [sub.student_assessment_id for sub in submissions if sub.student_assessment_id]
    sas = {sa.id: sa for sa in db.query(StudentAssessment).filter(StudentAssessment.id.in_(sa_ids)).all()} if sa_ids else {}
    
    student_ids = [sa.student_id for sa in sas.values() if sa.student_id]
    students = {s.id: s for s in db.query(Student).filter(Student.id.in_(student_ids)).all()} if student_ids else {}
    
    user_ids = [s.user_id for s in students.values() if s.user_id]
    users = {u.id: u for u in db.query(User).filter(User.id.in_(user_ids)).all()} if user_ids else {}
    
    sub_ids = [sub.id for sub in submissions]
    evals = {e.submission_id: e for e in db.query(AIEvaluation).filter(AIEvaluation.submission_id.in_(sub_ids)).all()} if sub_ids else {}

    res = []
    for sub in submissions:
        sa = sas.get(sub.student_assessment_id)
        if not sa: continue
        sp = students.get(sa.student_id)
        if not sp: continue
        u = users.get(sp.user_id)
        if not u: continue
        eval = evals.get(sub.id)
        
        try:
            weaknesses_data = json.loads(eval.weaknesses) if eval and eval.weaknesses else []
        except:
            weaknesses_data = []

        res.append({
            'id': str(sub.id),
            'studentId': u.id,
            'studentName': u.full_name,
            'rollNumber': f"R{sp.id:04d}",
            'class': sp.semester or 'Semester 1',
            'submittedAt': sub.submitted_at.isoformat() if sub.submitted_at else '',
            'content': sub.content or '',
            'wordCount': len((sub.content or '').split()),
            'status': 'Evaluated' if eval else 'Pending',
            'evaluation': {
                'grammar': eval.grammar,
                'vocabulary': eval.vocabulary,
                'coherence': eval.coherence,
                'overall': eval.overall,
                'strengths': weaknesses_data,
                'weaknesses': [],
                'feedback': eval.feedback
            } if eval else None
        })
    return res

@router.post('/evaluate-writing/{submission_id}')
def evaluate_writing(submission_id: int, db: Session = Depends(get_db)):
    import os
    from groq import Groq
    sub = db.query(WritingSubmission).filter(WritingSubmission.id == submission_id).first()
    if not sub: raise HTTPException(404, 'Submission not found')
    
    # Check if evaluated
    ev = db.query(AIEvaluation).filter(AIEvaluation.submission_id == submission_id).first()
    if ev: return {'success': True, 'evaluation_id': ev.id}
    
    prompt = f'''Evaluate this English essay and provide scores out of 100.
    Return ONLY a JSON object with this exact structure:
    {{
      "grammar_score": 85,
      "vocabulary_score": 75,
      "structure_score": 80,
      "coherence_score": 90,
      "relevance_score": 85,
      "overall_score": 83,
      "feedback": "Detailed feedback here...",
      "weakness_tags": ["run-on sentences", "limited vocabulary"]
    }}
    
    Essay to evaluate:
    {sub.content}
    '''
    
    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        response = client.chat.completions.create(
            messages=[{'role': 'user', 'content': prompt}],
            model='llama3-8b-8192',
            response_format={'type': 'json_object'}
        )
        result = json.loads(response.choices[0].message.content)
        
        new_eval = AIEvaluation(
            submission_id=submission_id,
            grammar=result.get('grammar_score', 0),
            vocabulary=result.get('vocabulary_score', 0),
            sentence_structure=result.get('structure_score', 0),
            coherence=result.get('coherence_score', 0),
            relevance=result.get('relevance_score', 0),
            overall=result.get('overall_score', 0),
            feedback=result.get('feedback', ''),
            weaknesses=json.dumps(result.get('weakness_tags', [])),
            raw_response=response.choices[0].message.content
        )
        db.add(new_eval)
        db.commit()
        
        # update sa total_marks
        sa = db.query(StudentAssessment).filter(StudentAssessment.id == sub.student_assessment_id).first()
        if sa:
            sa.total_marks = new_eval.overall
            sa.accuracy = new_eval.overall
            sa.status = 'Evaluated'
            db.commit()
            
        return {'success': True}
    except Exception as e:
        print(e)
        raise HTTPException(500, str(e))

@router.get('/speaking-submissions')
def get_speaking_submissions(db: Session = Depends(get_db)):
    recs = db.query(SpeakingRecording).all()
    
    student_ids = [rec.student_id for rec in recs if rec.student_id]
    students = {s.id: s for s in db.query(Student).filter(Student.id.in_(student_ids)).all()} if student_ids else {}
    
    user_ids = [s.user_id for s in students.values() if s.user_id]
    users = {u.id: u for u in db.query(User).filter(User.id.in_(user_ids)).all()} if user_ids else {}
    
    rec_ids = [rec.id for rec in recs]
    evals = {e.recording_id: e for e in db.query(SpeakingEvaluation).filter(SpeakingEvaluation.recording_id.in_(rec_ids)).all()} if rec_ids else {}

    res = []
    for rec in recs:
        sp = students.get(rec.student_id)
        if not sp: continue
        u = users.get(sp.user_id)
        if not u: continue
        eval = evals.get(rec.id)
        
        res.append({
            'id': str(rec.id),
            'studentId': u.id,
            'studentName': u.full_name,
            'rollNumber': f"R{sp.id:04d}",
            'duration': f"{rec.duration}s",
            'audioUrl': rec.audio_url,
            'submittedAt': rec.created_at.isoformat() if rec.created_at else '',
            'status': 'Evaluated' if eval else 'Pending',
            'evaluation': {
                'transcript': eval.transcript,
                'pronunciation': eval.pronunciation,
                'fluency': eval.fluency,
                'grammar': eval.grammar,
                'vocabulary': eval.vocabulary,
                'overall': eval.overall,
                'feedback': eval.feedback,
                'strengths': json.loads(eval.strengths) if eval.strengths else [],
                'weaknesses': json.loads(eval.weaknesses) if eval.weaknesses else [],
            } if eval else None
        })
    return res

@router.post('/evaluate-speaking/{recording_id}')
def evaluate_speaking(recording_id: int, db: Session = Depends(get_db)):
    from groq import Groq
    rec = db.query(SpeakingRecording).filter(SpeakingRecording.id == recording_id).first()
    if not rec: raise HTTPException(404, 'Recording not found')
    
    ev = db.query(SpeakingEvaluation).filter(SpeakingEvaluation.recording_id == recording_id).first()
    if ev: return {'success': True}
    
    prompt = '''Simulate an AI evaluation of an English speech audio file. 
    Generate a fake transcript (about 3-4 sentences), and evaluate it.
    Return ONLY a JSON object:
    {
      "transcript": "Hello, my name is...",
      "pronunciation": 75,
      "fluency": 80,
      "grammar": 85,
      "vocabulary": 70,
      "overall": 78,
      "feedback": "Good effort...",
      "strengths": ["Clear voice"],
      "weaknesses": ["Pacing"]
    }
    '''
    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        response = client.chat.completions.create(
            messages=[{'role': 'user', 'content': prompt}],
            model='llama3-8b-8192',
            response_format={'type': 'json_object'}
        )
        result = json.loads(response.choices[0].message.content)
        
        new_eval = SpeakingEvaluation(
            recording_id=recording_id,
            transcript=result.get('transcript', ''),
            grammar=result.get('grammar', 0),
            vocabulary=result.get('vocabulary', 0),
            pronunciation=result.get('pronunciation', 0),
            fluency=result.get('fluency', 0),
            overall=result.get('overall', 0),
            feedback=result.get('feedback', ''),
            strengths=json.dumps(result.get('strengths', [])),
            weaknesses=json.dumps(result.get('weaknesses', []))
        )
        db.add(new_eval)
        db.commit()
        return {'success': True}
    except Exception as e:
        print(e)
        raise HTTPException(500, str(e))
