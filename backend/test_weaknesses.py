import sys
import os

from database.database import SessionLocal
from models.models import WritingSubmission, AIEvaluation

db = SessionLocal()

submissions = db.query(WritingSubmission).all()
print(f"Total WritingSubmissions: {len(submissions)}")

for sub in submissions:
    eval = db.query(AIEvaluation).filter(AIEvaluation.submission_id == sub.id).first()
    if eval:
        print(f"Sub {sub.id} weaknesses: {repr(eval.weaknesses)}")
    else:
        print(f"Sub {sub.id} has no AIEvaluation")
