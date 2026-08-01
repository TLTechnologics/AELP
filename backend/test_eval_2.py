from services.gemini_service import evaluate_speaking
import os
from dotenv import load_dotenv

load_dotenv()

with open("dummy.wav", "rb") as f:
    audio_bytes = f.read()

try:
    res = evaluate_speaking(audio_bytes, "audio/webm;codecs=opus", "Describe your favorite hobby.")
    print("Success!", res)
except Exception as e:
    print("Error:", e)
