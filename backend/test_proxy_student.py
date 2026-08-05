import requests
import os
import time
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = "http://localhost:3000/api/speaking"

print("Logging into Supabase as student...")
sb = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_SERVICE_KEY"))
res = sb.auth.sign_in_with_password({"email": "student@silveroak.com", "password": "silveroak123"})
token = res.session.access_token

# We will send a very short, real WAV file so Gemini doesn't crash on empty bytes.
# A tiny valid WAV header + silent data.
wav_data = b'RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00'
with open('silent.wav', 'wb') as f:
    f.write(wav_data)

print(f"Sending POST request to Next.js Proxy ({url})...")
post_res = requests.post(
    url, 
    headers={"Authorization": f"Bearer {token}"},
    files={'audio_file': ('silent.wav', open('silent.wav', 'rb'), 'audio/wav')}, 
    data={'assessment_id': 1, 'prompt': 'hello', 'duration': 1}
)
print("Response Status:", post_res.status_code)
print("Response Body:", post_res.text)
