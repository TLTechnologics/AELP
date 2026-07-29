import json
import google.generativeai as genai
from config import settings
import tempfile
import os

genai.configure(api_key=settings.GEMINI_API_KEY)

def evaluate_speaking(audio_file_bytes: bytes, mime_type: str, prompt: str) -> dict:
    """
    Evaluates a student's speaking submission using Gemini 2.5 Flash API.
    Returns strict JSON formatted response according to Cambridge English rubric.
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
    
    # Save the bytes to a temporary file because Gemini File API requires a path
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
        temp_file.write(audio_file_bytes)
        temp_file_path = temp_file.name

    try:
        # Upload the file to Gemini
        gemini_file = genai.upload_file(path=temp_file_path, mime_type=mime_type)
        
        # Use Gemini 2.5 Flash
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=system_instruction,
            generation_config={"temperature": 0.1, "response_mime_type": "application/json"}
        )
        
        response = model.generate_content([
            gemini_file,
            f"Please evaluate the student's speaking. The prompt was: '{prompt}'"
        ])
        
        content = response.text
        if not content:
            raise ValueError("Empty response from Gemini API")
            
        data = json.loads(content)
        
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
        # Clean up the temporary file and Gemini file
        os.remove(temp_file_path)
        try:
            genai.delete_file(gemini_file.name)
        except Exception:
            pass
