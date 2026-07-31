import os
import sys
from dotenv import load_dotenv

# Add backend directory to sys path so we can import from database and models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase import create_client, Client
from database.database import SessionLocal
from models.models import User, RoleEnum

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set.")
    sys.exit(1)

supabase: Client = create_client(url, key)

email = "teacher@silveroak.com"
password = "silveroak123"
full_name = "Silveroak Teacher"

db = SessionLocal()

user_id = None

try:
    print(f"Creating user {email} in Supabase Auth...")
    user_response = supabase.auth.admin.create_user({
        "email": email,
        "password": password,
        "email_confirm": True,
        "user_metadata": {
            "full_name": full_name
        }
    })
    user_id = user_response.user.id
    print(f"Successfully created user in Supabase Auth with ID: {user_id}")
except Exception as e:
    print(f"User might already exist in Supabase Auth. Error: {e}")
    # Try fetching the user ID
    try:
        users_resp = supabase.auth.admin.list_users()
        for u in users_resp:
            if u.email == email:
                user_id = u.id
                print(f"Found existing Supabase user with ID: {user_id}")
                
                print("Updating password...")
                supabase.auth.admin.update_user_by_id(
                    user_id,
                    {"password": password, "email_confirm": True}
                )
                break
    except Exception as list_err:
        print(f"Error fetching existing users: {list_err}")

if not user_id:
    print("Could not obtain a valid Supabase User ID. Exiting.")
    sys.exit(1)

print(f"Syncing user {user_id} with Postgres Database...")

try:
    # Check if User exists in DB
    existing_user = db.query(User).filter(User.id == user_id).first()
    if not existing_user:
        new_user = User(
            id=user_id,
            email=email,
            full_name=full_name,
            role=RoleEnum.TEACHER
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print("Created User record in DB.")
    else:
        existing_user.role = RoleEnum.TEACHER
        db.commit()
        print("User record already exists in DB, updated role to TEACHER.")
        

        
    print("User setup complete! They can now log in.")
except Exception as e:
    db.rollback()
    print(f"Database error: {e}")
finally:
    db.close()
