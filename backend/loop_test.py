import os
import sys
import time
import wave
import struct

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from services.gemini_service import evaluate_speaking

def create_dummy_wav():
    filename = "dummy.wav"
    with wave.open(filename, 'w') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(44100)
        for _ in range(44100):
            data = struct.pack('<h', 0)
            f.writeframesraw(data)
    with open(filename, 'rb') as f:
        return f.read()

def run_loop():
    audio_bytes = create_dummy_wav()
    mime_type = "audio/wav"
    prompt = "Introduce yourself."
    
    attempts = 0
    while True:
        attempts += 1
        print(f"--- Attempt {attempts} ---")
        try:
            res = evaluate_speaking(audio_bytes, mime_type, prompt)
            print("Success:", res)
            break
        except Exception as e:
            print("Error occurred:", type(e).__name__)
            import traceback
            traceback.print_exc()
            time.sleep(2)

if __name__ == "__main__":
    run_loop()
