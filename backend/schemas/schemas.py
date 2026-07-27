from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any, Dict
from datetime import datetime
from models.models import RoleEnum, AssessmentType, QuestionType

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: RoleEnum = RoleEnum.STUDENT

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class StudentProgress(BaseModel):
    current_level: str
    overall_progress: float
    listening_score: float
    reading_score: float
    writing_score: float
    current_learning_path_id: Optional[int]

class QuestionOptionSchema(BaseModel):
    id: int
    text: str
    
    class Config:
        from_attributes = True

class QuestionSchema(BaseModel):
    id: int
    type: QuestionType
    text: str
    marks: float
    options: List[QuestionOptionSchema] = []
    
    class Config:
        from_attributes = True

class AssessmentSchema(BaseModel):
    id: int
    title: str
    type: AssessmentType
    difficulty: str
    topic: Optional[str]
    reading_passage: Optional[str]
    questions: List[QuestionSchema] = []
    
    class Config:
        from_attributes = True

class WritingSubmissionCreate(BaseModel):
    assessment_id: int
    content: str

class AIEvaluationSchema(BaseModel):
    grammar: float
    vocabulary: float
    sentence_structure: float
    coherence: float
    relevance: float
    overall: float
    cefr_level: str
    feedback: str
    strengths: str
    weaknesses: str
    recommended_lessons: str
    
    class Config:
        from_attributes = True
