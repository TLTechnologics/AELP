import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.gemini_service import evaluate_speaking

def test_gemini():
    audio_bytes = b"dummy audio data"
    mime_type = "audio/webm"
    prompt = "Introduce yourself."
    try:
        res = evaluate_speaking(audio_bytes, mime_type, prompt)
        print("Success:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_gemini()
