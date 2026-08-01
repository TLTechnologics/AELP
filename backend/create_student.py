import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")

supabase: Client = create_client(url, key)

email = "student@silveroak.com"
password = "silveroak123"

try:
    user = supabase.auth.admin.create_user({
        "email": email,
        "password": password,
        "email_confirm": True,
        "user_metadata": {
            "full_name": "Silver Oak Student"
        }
    })
    
    supabase.table('users').insert({
        "id": user.user.id,
        "email": email,
        "full_name": "Silver Oak Student",
        "role": "STUDENT"
    }).execute()
    
    supabase.table('students').insert({
        "user_id": user.user.id,
        "teacher_id": 1,
        "batch": "Morning",
        "grade_level": "Grade 10"
    }).execute()
    print("Created student!")
except Exception as e:
    print(f"Error: {e}")
