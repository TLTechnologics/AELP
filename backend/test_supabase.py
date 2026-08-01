import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

try:
    res = supabase.storage.from_("speaking-recordings").upload(
        "test_file.webm",
        b"dummy data",
        {"content-type": "audio/webm;codecs=opus"}
    )
    print("Success:", res)
except Exception as e:
    print("Error:", e)
