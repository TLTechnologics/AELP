import requests
import os
import time
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = "http://localhost:3000/api/speaking"

sb = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_SERVICE_KEY"))
res = sb.auth.sign_in_with_password({"email": "teacher@silveroak.com", "password": "silveroak123"})
token = res.session.access_token

# Wait for Next.js to compile
time.sleep(10)

print("Sending POST request to LOCAL NEXT.JS PROXY with valid token...")
post_res = requests.post(
    url, 
    headers={"Authorization": f"Bearer {token}"},
    files={'audio_file': ('dummy.wav', open('dummy.wav', 'rb'), 'audio/wav')}, 
    data={'assessment_id': 1, 'prompt': 'hello', 'duration': 35}
)
print("Response Status:", post_res.status_code)
print("Response Body:", post_res.text)
print("Response Headers:", post_res.headers)
