import requests
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = "https://aelp.onrender.com/api/speaking/evaluate"

sb = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_SERVICE_KEY"))
res = sb.auth.sign_in_with_password({"email": "teacher@silveroak.com", "password": "silveroak123"})
token = res.session.access_token

print("Sending POST request to Render with valid token and Origin header...")
post_res = requests.post(
    url, 
    headers={"Authorization": f"Bearer {token}", "Origin": "https://aelp-dszy.vercel.app"},
    files={'audio_file': ('dummy.wav', open('dummy.wav', 'rb'), 'audio/wav')}, 
    data={'assessment_id': 1, 'prompt': 'hello', 'duration': 35}
)
print("Response Status:", post_res.status_code)
print("Response Body:", post_res.text)
print("Response Headers:", post_res.headers)
