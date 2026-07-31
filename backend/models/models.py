from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database.database import Base

class RoleEnum(enum.Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True) # UUID from Supabase Auth
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    role = Column(Enum(RoleEnum), default=RoleEnum.STUDENT)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    student_profile = relationship("Student", back_populates="user", uselist=False)

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    current_level = Column(String, default="Beginner")
    overall_progress = Column(Float, default=0.0)
    listening_score = Column(Float, default=0.0)
    reading_score = Column(Float, default=0.0)
    writing_score = Column(Float, default=0.0)
    current_learning_path_id = Column(Integer, ForeignKey("learning_paths.id"), nullable=True)

    user = relationship("User", back_populates="student_profile")
    learning_path = relationship("LearningPath", foreign_keys=[current_learning_path_id])
    progress_history = relationship("ProgressHistory", back_populates="student")
    achievements = relationship("Achievement", back_populates="student")
    lesson_progress = relationship("LessonProgress", back_populates="student")
    assessments = relationship("StudentAssessment", back_populates="student")

class LearningPath(Base):
    __tablename__ = "learning_paths"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    difficulty = Column(String)
    
    lessons = relationship("Lesson", back_populates="learning_path")

class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True, index=True)
    learning_path_id = Column(Integer, ForeignKey("learning_paths.id"))
    title = Column(String, index=True)
    description = Column(Text)
    content = Column(Text)
    video_url = Column(String, nullable=True)
    pdf_url = Column(String, nullable=True)
    estimated_time = Column(Integer) # in minutes
    difficulty = Column(String)
    
    learning_path = relationship("LearningPath", back_populates="lessons")
    progress = relationship("LessonProgress", back_populates="lesson")

class LessonProgress(Base):
    __tablename__ = "lesson_progress"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    completed = Column(Boolean, default=False)
    time_spent = Column(Integer, default=0) # in seconds
    score = Column(Float, nullable=True)
    
    student = relationship("Student", back_populates="lesson_progress")
    lesson = relationship("Lesson", back_populates="progress")

class AssessmentType(enum.Enum):
    LISTENING = "listening"
    READING = "reading"
    WRITING = "writing"
    SPEAKING = "speaking"

class Assessment(Base):
    __tablename__ = "assessments"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    type = Column(Enum(AssessmentType))
    difficulty = Column(String)
    topic = Column(String, nullable=True)
    audio_file_id = Column(Integer, ForeignKey("audio_files.id"), nullable=True)
    reading_passage = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    questions = relationship("Question", back_populates="assessment")
    student_assessments = relationship("StudentAssessment", back_populates="assessment")

class AudioFile(Base):
    __tablename__ = "audio_files"
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String) # Supabase Storage URL
    duration = Column(Integer) # in seconds

class QuestionType(enum.Enum):
    MCQ = "mcq"
    TRUE_FALSE = "true_false"
    FILL_IN_BLANK = "fill_in_blank"
    MATCHING = "matching"
    ORDERING = "ordering"
    WRITING = "writing" # for essay/paragraph prompts

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"))
    type = Column(Enum(QuestionType))
    text = Column(Text)
    explanation = Column(Text, nullable=True)
    marks = Column(Float, default=1.0)
    
    assessment = relationship("Assessment", back_populates="questions")
    options = relationship("QuestionOption", back_populates="question")

class QuestionOption(Base):
    __tablename__ = "question_options"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    text = Column(Text)
    is_correct = Column(Boolean, default=False)
    
    question = relationship("Question", back_populates="options")

class StudentAssessment(Base):
    __tablename__ = "student_assessments"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    assessment_id = Column(Integer, ForeignKey("assessments.id"))
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    time_taken = Column(Integer, nullable=True) # in seconds
    total_marks = Column(Float, nullable=True)
    accuracy = Column(Float, nullable=True)
    cefr_level = Column(String, nullable=True)
    status = Column(String, default="Completed")
    evaluation_id = Column(Integer, nullable=True)
    
    student = relationship("Student", back_populates="assessments")
    assessment = relationship("Assessment", back_populates="student_assessments")
    answers = relationship("StudentAnswer", back_populates="student_assessment")
    writing_submission = relationship("WritingSubmission", back_populates="student_assessment", uselist=False)

class StudentAnswer(Base):
    __tablename__ = "student_answers"
    id = Column(Integer, primary_key=True, index=True)
    student_assessment_id = Column(Integer, ForeignKey("student_assessments.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    selected_option_id = Column(Integer, ForeignKey("question_options.id"), nullable=True)
    text_answer = Column(Text, nullable=True)
    is_correct = Column(Boolean, nullable=True)
    marks_awarded = Column(Float, default=0.0)
    
    student_assessment = relationship("StudentAssessment", back_populates="answers")

class WritingSubmission(Base):
    __tablename__ = "writing_submissions"
    id = Column(Integer, primary_key=True, index=True)
    student_assessment_id = Column(Integer, ForeignKey("student_assessments.id"))
    content = Column(Text)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    
    student_assessment = relationship("StudentAssessment", back_populates="writing_submission")
    evaluation = relationship("AIEvaluation", back_populates="submission", uselist=False)

class AIEvaluation(Base):
    __tablename__ = "ai_evaluations"
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("writing_submissions.id"))
    grammar = Column("grammar_score", Float)
    vocabulary = Column("vocabulary_score", Float)
    sentence_structure = Column("structure_score", Float)
    coherence = Column("coherence_score", Float)
    relevance = Column("relevance_score", Float)
    overall = Column("overall_score", Float)
    feedback = Column(Text)
    weaknesses = Column("weakness_tags", Text) # JSON string array
    raw_response = Column(Text) # Raw JSON from Groq
    
    submission = relationship("WritingSubmission", back_populates="evaluation")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    title = Column(String)
    message = Column(Text)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    title = Column(String)
    description = Column(Text)
    icon_url = Column(String, nullable=True)
    earned_at = Column(DateTime(timezone=True), server_default=func.now())
    
    student = relationship("Student", back_populates="achievements")

class ProgressHistory(Base):
    __tablename__ = "progress_history"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    date = Column(DateTime(timezone=True), server_default=func.now())
    listening_score = Column(Float)
    reading_score = Column(Float)
    writing_score = Column(Float)
    
    student = relationship("Student", back_populates="progress_history")

class SystemSettings(Base):
    __tablename__ = "system_settings"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(Text)

class SpeakingRecording(Base):
    __tablename__ = "speaking_recordings"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    assessment_id = Column(Integer, ForeignKey("assessments.id"))
    audio_url = Column(String)
    duration = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    student = relationship("Student")
    assessment = relationship("Assessment")
    evaluation = relationship("SpeakingEvaluation", back_populates="recording", uselist=False)

class SpeakingEvaluation(Base):
    __tablename__ = "speaking_evaluations"
    id = Column(Integer, primary_key=True, index=True)
    recording_id = Column(Integer, ForeignKey("speaking_recordings.id"))
    transcript = Column(Text)
    grammar = Column(Float)
    vocabulary = Column(Float)
    pronunciation = Column(Float)
    fluency = Column(Float)
    coherence = Column(Float)
    confidence = Column(Float)
    communication = Column(Float)
    overall = Column(Float)
    cefr_level = Column(String)
    feedback = Column(Text)
    strengths = Column(Text) # JSON string array
    weaknesses = Column(Text) # JSON string array
    recommended_lessons = Column(Text) # JSON string array
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    recording = relationship("SpeakingRecording", back_populates="evaluation")

class StudentSkillAnalysis(Base):
    __tablename__ = "student_skill_analysis"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=True)
    skill_name = Column(String, index=True)
    skill_score = Column(Float)
    priority = Column(String) # HIGH, MEDIUM, LOW
    recommended = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class StudentLearningPaths(Base):
    __tablename__ = "student_learning_paths"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    path_name = Column(String, index=True)
    progress = Column(Float, default=0.0)
    status = Column(String, default="Active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class StudentLessonRecommendations(Base):
    __tablename__ = "student_lesson_recommendations"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    reason = Column(Text)
    priority = Column(String) # HIGH, MEDIUM, LOW
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=True)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    lesson = relationship("Lesson")

class StudentWeakSkills(Base):
    __tablename__ = "student_weak_skills"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    skill_name = Column(String, index=True)
    latest_score = Column(Float)
    priority = Column(String) # HIGH, MEDIUM, LOW
    created_at = Column(DateTime(timezone=True), server_default=func.now())
