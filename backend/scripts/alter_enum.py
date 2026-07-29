import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.database import engine
from sqlalchemy import text

def alter_enum():
    with engine.execution_options(isolation_level="AUTOCOMMIT").begin() as conn:
        try:
            conn.execute(text("ALTER TYPE assessmenttype ADD VALUE 'SPEAKING';"))
            print("Successfully added 'SPEAKING' to assessmenttype ENUM.")
        except Exception as e:
            print(f"Error (might already exist): {e}")

if __name__ == "__main__":
    alter_enum()
