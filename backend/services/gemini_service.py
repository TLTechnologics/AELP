import json
import requests
from config import settings

def evaluate_speaking(audio_file_bytes: bytes, mime_type: str, prompt: str) -> dict:
    """
    Evaluates a student's speaking submission using Gemini 2.5 Flash via REST API.
    Bypasses grpcio DLL blocks.
    """
    system_instruction = f"""You are an experienced Cambridge English and IELTS Speaking Examiner.
Evaluate ONLY the student's spoken English from the provided audio.
First generate an accurate transcript.
Then evaluate using the rubric below out of 10 for each criterion:
Grammar: 10 Marks
Vocabulary: 10 Marks
Pronunciation: 10 Marks
Fluency: 10 Marks
Coherence: 10 Marks
Confidence: 10 Marks
Communication: 10 Marks

Total: 70 Marks.
Estimate the student's CEFR level (A1, A2, B1, B2, C1, C2).
Give constructive feedback. Suggest lessons the student should complete.

Return ONLY valid JSON.
Required format:
{{
  "transcript": "",
  "grammar": 0,
  "vocabulary": 0,
  "pronunciation": 0,
  "fluency": 0,
  "coherence": 0,
  "confidence": 0,
  "communication": 0,
  "overall": 0,
  "cefr_level": "",
  "feedback": "",
  "strengths": [],
  "weaknesses": [],
  "recommended_lessons": []
}}
"""

    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set.")

    # 1. Upload the file using Gemini REST API
    upload_url = f"https://generativelanguage.googleapis.com/upload/v1beta/files?key={api_key}"
    headers = {
        "X-Goog-Upload-Protocol": "raw",
        "X-Goog-Upload-Header-Content-Length": str(len(audio_file_bytes)),
        "X-Goog-Upload-Header-Content-Type": mime_type,
        "Content-Type": mime_type,
    }
    
    upload_res = requests.post(upload_url, headers=headers, data=audio_file_bytes)
    if not upload_res.ok:
        print("Upload Error:", upload_res.text)
        raise ValueError(f"Failed to upload file to Gemini: {upload_res.status_code}")
        
    file_info = upload_res.json()
    file_uri = file_info.get("file", {}).get("uri")
    
    if not file_uri:
        raise ValueError("File URI not returned from Gemini API")

    try:
        # 2. Generate Content
        generate_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={api_key}"
        payload = {
            "systemInstruction": {
                "parts": [{"text": system_instruction}]
            },
            "contents": [{
                "parts": [
                    {"fileData": {"mimeType": mime_type, "fileUri": file_uri}},
                    {"text": f"Please evaluate the student's speaking. The prompt was: '{prompt}'"}
                ]
            }],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json"
            }
        }
        
        gen_res = requests.post(generate_url, json=payload)
        if not gen_res.ok:
            print("Generate Error:", gen_res.text, flush=True)
            raise ValueError(f"Failed to generate content: {gen_res.status_code} - {gen_res.text}")
            
        gen_data = gen_res.json()
        
        try:
            content_text = gen_data["candidates"][0]["content"]["parts"][0]["text"]
            data = json.loads(content_text)
        except (KeyError, IndexError, json.JSONDecodeError) as e:
            print("Parse Error:", e, "Response:", gen_data)
            raise ValueError("Failed to parse Gemini API response")
        
        # Calculate overall score if not set properly
        if "overall" not in data or data["overall"] == 0:
            data["overall"] = (
                data.get("grammar", 0) + 
                data.get("vocabulary", 0) + 
                data.get("pronunciation", 0) + 
                data.get("fluency", 0) + 
                data.get("coherence", 0) +
                data.get("confidence", 0) +
                data.get("communication", 0)
            )
            
        return data
        
    finally:
        pass # REST API handles cleanup based on expiration, or we could send a DELETE request.
