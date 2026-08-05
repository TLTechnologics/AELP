import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")

supabase: Client = create_client(url, key)

email = "teacher@silveroak.com"
password = "silveroak123"

try:
    user = supabase.auth.admin.create_user({
        "email": email,
        "password": password,
        "email_confirm": True,
        "user_metadata": {
            "full_name": "Silver Oak User"
        }
    })
    
    # Also insert into our public.users table
    try:
        supabase.table('users').insert({
            "id": user.user.id,
            "email": email,
            "full_name": "Silver Oak User",
            "role": "teacher"
        }).execute()
    except Exception as e:
        pass
        
    print(f"Successfully created user {email}!")
except Exception as e:
    print(f"Error creating user (might already exist): {e}")

    print("Attempting to update password if user already exists...")
    try:
        users = supabase.auth.admin.list_users()
        user_obj = None
        for u in users:
            if u.email == email:
                user_obj = u
                supabase.auth.admin.update_user_by_id(
                    u.id,
                    {"password": password, "email_confirm": True}
                )
                print("Successfully updated password for existing user!")
                break
                
        if user_obj:
            # Also insert into our public.users table if not exists
            try:
                supabase.table('users').upsert({
                    "id": user_obj.id,
                    "email": email,
                    "full_name": "Silver Oak User",
                    "role": "TEACHER"
                }).execute()
                print("Successfully added user to public.users table!")
            except Exception as e:
                print(f"Note: Could not insert into public.users with TEACHER: {e}")
                
                try:
                    supabase.table('users').upsert({
                        "id": user_obj.id,
                        "email": email,
                        "full_name": "Silver Oak User",
                        "role": "teacher"
                    }).execute()
                except Exception as e2:
                    print(f"Failed with teacher too: {e2}")
                
    except Exception as update_err:
        print(f"Could not update user: {update_err}")
