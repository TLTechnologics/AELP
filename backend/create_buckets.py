import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

try:
    supabase.storage.create_bucket("speaking-recordings")
    # try to update it to public
    try:
        supabase.storage.update_bucket("speaking-recordings", {"public": True})
    except:
        pass
    print("Successfully created bucket 'speaking-recordings'")
except Exception as e:
    print(f"Error creating bucket (might already exist): {e}")
