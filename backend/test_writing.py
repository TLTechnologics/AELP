import sys
import os

from sqlalchemy.orm import Session
from database.database import SessionLocal
from models.models import WritingSubmission, StudentAssessment, Student, User, AIEvaluation

db = SessionLocal()

submissions = db.query(WritingSubmission).all()
print(f"Total WritingSubmissions: {len(submissions)}")

for sub in submissions:
    print(f"\nProcessing sub {sub.id}:")
    sa = db.query(StudentAssessment).filter(StudentAssessment.id == sub.student_assessment_id).first()
    print(f"  StudentAssessment: {sa}")
    if not sa: continue
    
    sp = db.query(Student).filter(Student.id == sa.student_id).first()
    print(f"  Student: {sp}")
    if not sp: continue
    
    u = db.query(User).filter(User.id == sp.user_id).first()
    print(f"  User: {u}")
    
    eval = db.query(AIEvaluation).filter(AIEvaluation.submission_id == sub.id).first()
    print(f"  Evaluation: {eval}")
