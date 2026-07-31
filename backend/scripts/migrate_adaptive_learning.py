import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.database import engine
from models.models import StudentSkillAnalysis, StudentLearningPaths, StudentLessonRecommendations, StudentWeakSkills

def migrate():
    print("Creating adaptive learning tables...")
    StudentSkillAnalysis.__table__.create(engine, checkfirst=True)
    StudentLearningPaths.__table__.create(engine, checkfirst=True)
    StudentLessonRecommendations.__table__.create(engine, checkfirst=True)
    StudentWeakSkills.__table__.create(engine, checkfirst=True)
    print("Done.")

if __name__ == "__main__":
    migrate()
