import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config import settings
from supabase import create_client, Client

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

def create_speaking_bucket():
    try:
        buckets = supabase.storage.list_buckets()
        bucket_names = [b.name for b in buckets]
        
        if "speaking-recordings" not in bucket_names:
            supabase.storage.create_bucket("speaking-recordings", {"public": True})
            print("Successfully created 'speaking-recordings' bucket in Supabase!")
        else:
            print("'speaking-recordings' bucket already exists.")
            
    except Exception as e:
        print(f"Error creating bucket: {e}")

if __name__ == "__main__":
    create_speaking_bucket()
