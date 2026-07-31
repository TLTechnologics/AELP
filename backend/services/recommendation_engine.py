from sqlalchemy.orm import Session
from models.models import (
    StudentSkillAnalysis,
    StudentLearningPaths,
    StudentLessonRecommendations,
    StudentWeakSkills,
    StudentWeakSkills,
    LearningPath,
    Lesson,
    AssessmentType,
    StudentAssessment
)
import json

def get_priority(score: float):
    if score < 40:
        return "HIGH"
    elif score < 70:
        return "MEDIUM"
    return "LOW"

def map_writing_skills(eval_data):
    return {
        "Grammar": eval_data.grammar * 10,  # Convert 0-10 to 0-100
        "Vocabulary": eval_data.vocabulary * 10,
        "Sentence Structure": eval_data.sentence_structure * 10,
        "Coherence": eval_data.coherence * 10,
        "Relevance": eval_data.relevance * 10,
    }

def map_speaking_skills(eval_data):
    return {
        "Pronunciation": eval_data.pronunciation * 10,
        "Fluency": eval_data.fluency * 10,
        "Grammar": eval_data.grammar * 10,
        "Vocabulary": eval_data.vocabulary * 10,
        "Coherence": eval_data.coherence * 10,
        "Confidence": eval_data.confidence * 10,
        "Communication": eval_data.communication * 10,
    }

def get_path_mapping(skill_name: str):
    skill_lower = skill_name.lower()
    if "grammar" in skill_lower or "sentence" in skill_lower:
        return "Grammar Basics", "Grammar Learning Path"
    elif "vocab" in skill_lower:
        return "Vocabulary Builder", "Vocabulary Learning Path"
    elif "pronunciation" in skill_lower or "fluency" in skill_lower or "confidence" in skill_lower or "communication" in skill_lower:
        return "Speaking Confidence", "Speaking Learning Path"
    elif "coherence" in skill_lower or "relevance" in skill_lower:
        return "Essay Organisation", "Writing Learning Path"
    else:
        return "Reading Foundations", "Reading Learning Path"

def get_reason(skill_name, score, assessment_type_name):
    return f"Recommended because your {assessment_type_name} {skill_name} score was only {score}%."

def process_evaluation(db: Session, student_id: int, assessment_id: int, assessment_type: AssessmentType, eval_data=None, accuracy: float=0.0):
    skills = {}
    
    if assessment_type == AssessmentType.WRITING and eval_data:
        skills = map_writing_skills(eval_data)
    elif assessment_type == AssessmentType.SPEAKING and eval_data:
        skills = map_speaking_skills(eval_data)
    elif assessment_type == AssessmentType.READING:
        # For MVP, we'll map reading accuracy broadly to some foundational reading skills
        skills = {
            "Main Idea": accuracy,
            "Scanning and Skimming": accuracy,
        }
        
    # Calculate current stage
    assessments_query = db.query(StudentAssessment).filter(StudentAssessment.student_id == student_id)
    completed_types = set()
    for sa in assessments_query.all():
        if sa.assessment and sa.assessment.type:
            completed_types.add(sa.assessment.type.value.lower())
    
    # Add current assessment type in case it's not saved yet
    completed_types.add(assessment_type.value.lower())
    
    has_reading = "reading" in completed_types
    has_writing = "writing" in completed_types
    has_speaking = "speaking" in completed_types
    
    stage = 1
    if has_reading and has_writing and has_speaking:
        stage = 4
    elif has_reading and has_writing:
        stage = 3
    elif has_reading or has_writing:
        stage = 2
        
    for skill_name, score in skills.items():
        priority = get_priority(score)
        
        # Log analysis
        analysis = StudentSkillAnalysis(
            student_id=student_id,
            assessment_id=assessment_id,
            skill_name=skill_name,
            skill_score=score,
            priority=priority,
            recommended=(priority != "LOW")
        )
        db.add(analysis)
        
        # Update or create weak skills
        weak_skill = db.query(StudentWeakSkills).filter(
            StudentWeakSkills.student_id == student_id,
            StudentWeakSkills.skill_name == skill_name
        ).first()
        
        if not weak_skill:
            weak_skill = StudentWeakSkills(
                student_id=student_id,
                skill_name=skill_name,
                latest_score=score,
                priority=priority
            )
            db.add(weak_skill)
        else:
            weak_skill.latest_score = score
            weak_skill.priority = priority
            
        db.commit()
        
        # If weak, recommend lesson and update path
        if priority in ["HIGH", "MEDIUM"]:
            target_path_title, path_display_name = get_path_mapping(skill_name)
            
            # Add to active learning paths
            learning_path = db.query(StudentLearningPaths).filter(
                StudentLearningPaths.student_id == student_id,
                StudentLearningPaths.path_name == path_display_name
            ).first()
            
            if not learning_path:
                learning_path = StudentLearningPaths(
                    student_id=student_id,
                    path_name=path_display_name,
                    status="Active",
                    progress=0.0
                )
                db.add(learning_path)
                db.commit()
                
            # Find relevant lessons for this path
            lp = db.query(LearningPath).filter(LearningPath.title == target_path_title).first()
            if lp:
                for lesson in lp.lessons:
                    # Check if already recommended and not completed
                    existing_rec = db.query(StudentLessonRecommendations).filter(
                        StudentLessonRecommendations.student_id == student_id,
                        StudentLessonRecommendations.lesson_id == lesson.id,
                        StudentLessonRecommendations.completed == False
                    ).first()
                    
                    if not existing_rec:
                        
                        reason_prefix = ""
                        if stage == 4:
                            reason_prefix = "Based on your complete English profile: "
                        elif stage == 3:
                            reason_prefix = "Based on your combined Reading and Writing profile: "
                        
                        rec = StudentLessonRecommendations(
                            student_id=student_id,
                            lesson_id=lesson.id,
                            reason=reason_prefix + get_reason(skill_name, score, assessment_type.value.capitalize()),
                            priority=priority,
                            assessment_id=assessment_id
                        )
                        db.add(rec)
            db.commit()
