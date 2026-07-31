from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import Assessment, AssessmentType, Question, QuestionOption, StudentAssessment, StudentAnswer, Student, User
from sqlalchemy.sql import func
from services.recommendation_engine import process_evaluation
from typing import List
from pydantic import BaseModel

router = APIRouter()

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

class OptionResponse(BaseModel):
    id: int
    text: str

class QuestionResponse(BaseModel):
    id: int
    type: str
    text: str
    marks: float
    options: List[OptionResponse] = []

class AssessmentResponse(BaseModel):
    id: int
    title: str
    type: str
    difficulty: str
    reading_passage: str | None = None
    topic: str | None = None
    audio_url: str | None = None
    questions: List[QuestionResponse] = []

@router.get("/reading", response_model=AssessmentResponse)
def get_reading_assessment(db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(Assessment.type == AssessmentType.READING).order_by(Assessment.created_at.desc()).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Reading assessment not found")
    
    questions = []
    for q in assessment.questions:
        options = []
        if q.type.value not in ['fill_in_blank', 'writing']:
            options = [{"id": o.id, "text": o.text} for o in q.options]
        questions.append(QuestionResponse(
            id=q.id,
            type=q.type.value,
            text=q.text,
            marks=q.marks,
            options=options
        ))
        
    return AssessmentResponse(
        id=assessment.id,
        title=assessment.title,
        type=assessment.type.value,
        difficulty=assessment.difficulty,
        reading_passage=assessment.reading_passage,
        topic=assessment.topic,
        questions=questions
    )

@router.get("/writing", response_model=AssessmentResponse)
def get_writing_assessment(db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(Assessment.type == AssessmentType.WRITING).order_by(Assessment.created_at.desc()).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Writing assessment not found")
        
    questions = []
    for q in assessment.questions:
        questions.append(QuestionResponse(
            id=q.id,
            type=q.type.value,
            text=q.text,
            marks=q.marks,
            options=[]
        ))
        
    return AssessmentResponse(
        id=assessment.id,
        title=assessment.title,
        type=assessment.type.value,
        difficulty=assessment.difficulty,
        topic=assessment.topic,
        questions=questions
    )

@router.get("/speaking", response_model=AssessmentResponse)
def get_speaking_assessment(db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(Assessment.type == AssessmentType.SPEAKING).order_by(Assessment.created_at.desc()).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Speaking assessment not found")
        
    questions = []
    for q in assessment.questions:
        questions.append(QuestionResponse(
            id=q.id,
            type=q.type.value,
            text=q.text,
            marks=q.marks,
            options=[]
        ))
        
    return AssessmentResponse(
        id=assessment.id,
        title=assessment.title,
        type=assessment.type.value,
        difficulty=assessment.difficulty,
        topic=assessment.topic,
        questions=questions
    )

class StudentAnswerInput(BaseModel):
    question_id: int
    selected_option_id: int | None = None
    text_answer: str | None = None

class SubmitReadingRequest(BaseModel):
    answers: List[StudentAnswerInput]

from api.deps import get_current_student

@router.post("/submit/reading")
def submit_reading(request: SubmitReadingRequest, db: Session = Depends(get_db), student: Student = Depends(get_current_student)):
    assessment = db.query(Assessment).filter(Assessment.type == AssessmentType.READING).first()
    
    if not assessment:
        raise HTTPException(status_code=404, detail="Reading assessment not found in database")
        
    student_assessment = StudentAssessment(
        student_id=student.id,
        assessment_id=assessment.id
    )
    db.add(student_assessment)
    db.commit()
    db.refresh(student_assessment)
    
    total_marks_awarded = 0.0
    total_possible_marks = 0.0
    
    for ans in request.answers:
        question = db.query(Question).filter(Question.id == ans.question_id).first()
        if not question:
            continue
            
        total_possible_marks += question.marks
        is_correct = False
        marks_awarded = 0.0
        
        if ans.selected_option_id:
            option = db.query(QuestionOption).filter(QuestionOption.id == ans.selected_option_id).first()
            if option and option.is_correct:
                is_correct = True
                marks_awarded = question.marks
        elif ans.text_answer:
            correct_options = db.query(QuestionOption).filter(QuestionOption.question_id == question.id, QuestionOption.is_correct == True).all()
            student_text = ans.text_answer.strip().lower().rstrip('.!?,')
            
            for opt in correct_options:
                opt_text = opt.text.strip().lower().rstrip('.!?,')
                if student_text == opt_text:
                    is_correct = True
                    marks_awarded = question.marks
                    break
                
        student_answer = StudentAnswer(
            student_assessment_id=student_assessment.id,
            question_id=question.id,
            selected_option_id=ans.selected_option_id,
            text_answer=ans.text_answer,
            is_correct=is_correct,
            marks_awarded=marks_awarded
        )
        db.add(student_answer)
        total_marks_awarded += marks_awarded
        
    student_assessment.total_marks = total_marks_awarded
    accuracy = (total_marks_awarded / total_possible_marks) * 100 if total_possible_marks > 0 else 0
    student_assessment.accuracy = accuracy
    
    cefr_level = "A1"
    if accuracy >= 90: cefr_level = "C1"
    elif accuracy >= 75: cefr_level = "B2"
    elif accuracy >= 50: cefr_level = "B1"
    elif accuracy >= 25: cefr_level = "A2"
    
    student_assessment.cefr_level = cefr_level
    student_assessment.status = "Completed"
    student_assessment.completed_at = func.now()
    
    db.commit()
    
    # Trigger Adaptive Recommendation Engine
    try:
        process_evaluation(db, student.id, assessment.id, assessment.type, eval_data=None, accuracy=accuracy)
    except Exception as e:
        print(f"Engine Error: {e}")
    
    return {
        "message": "Reading assessment submitted successfully",
        "total_marks": total_marks_awarded,
        "accuracy": student_assessment.accuracy
    }

@router.get("/listening", response_model=AssessmentResponse)
def get_listening_assessment(db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(Assessment.type == AssessmentType.LISTENING).order_by(Assessment.created_at.desc()).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Listening assessment not found")
        
    questions = []
    for q in assessment.questions:
        options = []
        if q.type.value not in ['fill_in_blank', 'writing']:
            options = [{"id": o.id, "text": o.text} for o in q.options]
        questions.append(QuestionResponse(
            id=q.id,
            type=q.type.value,
            text=q.text,
            marks=q.marks,
            options=options
        ))
        
    audio_url = None
    if assessment.audio_file_id:
        from models.models import AudioFile
        audio_file = db.query(AudioFile).filter(AudioFile.id == assessment.audio_file_id).first()
        if audio_file:
            audio_url = audio_file.url
            
    return AssessmentResponse(
        id=assessment.id,
        title=assessment.title,
        type=assessment.type.value,
        difficulty=assessment.difficulty,
        audio_url=audio_url,
        questions=questions
    )

@router.post("/listening/submit")
def submit_listening(request: SubmitReadingRequest, db: Session = Depends(get_db), student: Student = Depends(get_current_student)):
    if not request.answers:
        raise HTTPException(status_code=400, detail="No answers provided")
        
    assessment = db.query(Assessment).filter(Assessment.type == AssessmentType.LISTENING).order_by(Assessment.created_at.desc()).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    student_assessment = StudentAssessment(
        student_id=student.id,
        assessment_id=assessment.id
    )
    db.add(student_assessment)
    db.commit()
    db.refresh(student_assessment)
    
    total_marks_awarded = 0.0
    total_possible_marks = 0.0
    
    for ans in request.answers:
        question = db.query(Question).filter(Question.id == ans.question_id).first()
        if not question:
            continue
            
        total_possible_marks += question.marks
        is_correct = False
        marks_awarded = 0.0
        
        if ans.selected_option_id:
            option = db.query(QuestionOption).filter(QuestionOption.id == ans.selected_option_id).first()
            if option and option.is_correct:
                is_correct = True
                marks_awarded = question.marks
        elif ans.text_answer:
            correct_options = db.query(QuestionOption).filter(QuestionOption.question_id == question.id, QuestionOption.is_correct == True).all()
            student_text = ans.text_answer.strip().lower().rstrip('.!?,')
            
            for opt in correct_options:
                opt_text = opt.text.strip().lower().rstrip('.!?,')
                if student_text == opt_text:
                    is_correct = True
                    marks_awarded = question.marks
                    break
                
        student_answer = StudentAnswer(
            student_assessment_id=student_assessment.id,
            question_id=question.id,
            selected_option_id=ans.selected_option_id,
            text_answer=ans.text_answer,
            is_correct=is_correct,
            marks_awarded=marks_awarded
        )
        db.add(student_answer)
        total_marks_awarded += marks_awarded
        
    student_assessment.total_marks = total_marks_awarded
    accuracy = (total_marks_awarded / total_possible_marks) * 100 if total_possible_marks > 0 else 0
    student_assessment.accuracy = accuracy
    
    cefr_level = "A1"
    if accuracy >= 90: cefr_level = "C1"
    elif accuracy >= 75: cefr_level = "B2"
    elif accuracy >= 50: cefr_level = "B1"
    elif accuracy >= 25: cefr_level = "A2"
    
    student_assessment.cefr_level = cefr_level
    student_assessment.status = "Completed"
    student_assessment.completed_at = func.now()
    
    db.commit()
    
    try:
        process_evaluation(db, student.id, assessment.id, assessment.type, eval_data=None, accuracy=accuracy)
    except Exception as e:
        print(f"Engine Error: {e}")
    
    return {
        "message": "Listening assessment submitted successfully",
        "total_marks": total_marks_awarded,
        "accuracy": student_assessment.accuracy
    }
