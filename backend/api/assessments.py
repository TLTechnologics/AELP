from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import Assessment, AssessmentType, Question, QuestionOption, StudentAssessment, StudentAnswer, Student, User
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
    questions: List[QuestionResponse] = []

@router.get("/reading", response_model=AssessmentResponse)
def get_reading_assessment(db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(Assessment.type == AssessmentType.READING).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Reading assessment not found")
    
    questions = []
    for q in assessment.questions:
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
    assessment = db.query(Assessment).filter(Assessment.type == AssessmentType.WRITING).first()
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

class StudentAnswerInput(BaseModel):
    question_id: int
    selected_option_id: int | None = None
    text_answer: str | None = None

class SubmitReadingRequest(BaseModel):
    student_id: int = 1 # hardcoded for MVP if no auth token is passed directly to this logic
    answers: List[StudentAnswerInput]

@router.post("/submit/reading")
def submit_reading(request: SubmitReadingRequest, db: Session = Depends(get_db)):
    ensure_student(db, request.student_id)
    assessment = db.query(Assessment).filter(Assessment.type == AssessmentType.READING).first()
    
    student_assessment = StudentAssessment(
        student_id=request.student_id,
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
            correct_option = db.query(QuestionOption).filter(QuestionOption.question_id == question.id, QuestionOption.is_correct == True).first()
            if correct_option and correct_option.text.strip().lower() == ans.text_answer.strip().lower():
                is_correct = True
                marks_awarded = question.marks
                
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
    student_assessment.accuracy = (total_marks_awarded / total_possible_marks) * 100 if total_possible_marks > 0 else 0
    db.commit()
    
    return {
        "message": "Reading assessment submitted successfully",
        "total_marks": total_marks_awarded,
        "accuracy": student_assessment.accuracy
    }
