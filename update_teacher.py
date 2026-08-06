import re

with open("backend/api/teacher.py", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    "from models.models import Assessment, AssessmentType, Question, QuestionType, QuestionOption, AudioFile, User, Student, RoleEnum",
    "from models.models import Assessment, AssessmentType, Question, QuestionType, QuestionOption, AudioFile, User, Student, RoleEnum, StudentAssessment, AIEvaluation, SpeakingEvaluation, ProgressHistory, StudentLessonRecommendations"
)

# 2. Add /reports/summary and /students/{student_id} after get_students
new_endpoints = """
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
    
    return {
        "id": user.id,
        "name": user.full_name,
        "email": user.email,
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.full_name.replace(" ", "%20"),
        "class": student_profile.semester if student_profile and hasattr(student_profile, 'semester') else "Semester 1",
        "group": "Group A",
        "listeningScore": student_profile.listening_score if student_profile else 0,
        "readingScore": student_profile.reading_score if student_profile else 0,
        "writingScore": student_profile.writing_score if student_profile else 0,
        "speakingScore": 0, # missing in model
        "overallScore": student_profile.overall_progress if student_profile else 0,
        "cefrLevel": student_profile.current_level if student_profile else "Beginner",
        "attendance": 100,
        "status": "Good",
        "streak": 0,
        "timeSpent": 0,
        "accuracy": 90,
        "weeklyProgress": [40, 50, 60, 70, 80],
        "assignedLessons": ["Grammar Basics", "Present Continuous"],
        "recommendations": ["Practice speaking with native speakers", "Read more articles"],
        "assessmentHistory": assessment_history,
        "feedbackHistory": feedback_history
    }
"""

content = content.replace("    return result\n", "    return result\n\n" + new_endpoints)

with open("backend/api/teacher.py", "w", encoding="utf-8") as f:
    f.write(content)
