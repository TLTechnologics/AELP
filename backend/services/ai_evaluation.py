import json
from groq import Groq
from config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

def evaluate_writing(prompt: str, submission: str) -> dict:
    """
    Evaluates a student's writing submission using Groq API (llama-3.3-70b-versatile).
    Returns strict JSON formatted response according to Cambridge English rubric.
    """
    system_prompt = f"""You are a professional Cambridge English examiner.
Evaluate the student's writing.
Prompt given to student: "{prompt}"

Use the following rubric out of 10 for each criterion:
- Grammar (10 Marks)
- Vocabulary (10 Marks)
- Sentence Structure (10 Marks)
- Coherence (10 Marks)
- Relevance (10 Marks)
Total: 50 Marks.

Determine an estimated CEFR level (A1, A2, B1, B2, C1, C2).

Return ONLY valid JSON matching this schema:
{{
    "grammar": 0,
    "vocabulary": 0,
    "sentence_structure": 0,
    "coherence": 0,
    "relevance": 0,
    "overall": 0,
    "cefr_level": "B2",
    "feedback": "Detailed feedback...",
    "strengths": ["strength 1", "strength 2"],
    "weaknesses": ["weakness 1", "weakness 2"],
    "recommended_lessons": ["lesson 1", "lesson 2"]
}}
"""

    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": submission}
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.1,
        response_format={"type": "json_object"}
    )

    content = response.choices[0].message.content
    if not content:
        raise ValueError("Empty response from Groq API")
        
    data = json.loads(content)
    
    # Calculate overall score if not set
    if "overall" not in data or data["overall"] == 0:
        data["overall"] = (
            data.get("grammar", 0) + 
            data.get("vocabulary", 0) + 
            data.get("sentence_structure", 0) + 
            data.get("coherence", 0) + 
            data.get("relevance", 0)
        )
        
    return data

def evaluate_speaking_groq(audio_file_bytes: bytes, filename: str, prompt: str) -> dict:
    """
    Evaluates a student's speaking submission using Groq API (Whisper for transcription + Llama 3 for evaluation).
    """
    # 1. Transcribe with Whisper
    audio_file = (filename, audio_file_bytes)
    
    try:
        transcription = client.audio.transcriptions.create(
            file=audio_file,
            model="whisper-large-v3",
            response_format="json"
        )
        transcript_text = transcription.text
    except Exception as e:
        print(f"Groq Transcription Error: {e}")
        raise ValueError(f"Failed to transcribe audio: {e}")

    # 2. Evaluate with Llama 3
    system_prompt = f"""You are an experienced Cambridge English and IELTS Speaking Examiner.
Evaluate the student's spoken English based on the provided transcript of their speech.
Prompt given to student: "{prompt}"

Since you only have the transcript and not the audio, estimate Pronunciation and Fluency based on filler words, repetition, and natural flow captured in the text, or give them an average passing score if the text is coherent.

Use the following rubric out of 10 for each criterion:
- Grammar (10 Marks)
- Vocabulary (10 Marks)
- Pronunciation (10 Marks)
- Fluency (10 Marks)
- Coherence (10 Marks)
- Confidence (10 Marks)
- Communication (10 Marks)
Total: 70 Marks.

Estimate the student's CEFR level (A1, A2, B1, B2, C1, C2).

Return ONLY valid JSON matching this schema:
{{
    "transcript": "{transcript_text}",
    "grammar": 0,
    "vocabulary": 0,
    "pronunciation": 0,
    "fluency": 0,
    "coherence": 0,
    "confidence": 0,
    "communication": 0,
    "overall": 0,
    "cefr_level": "B2",
    "feedback": "Detailed feedback...",
    "strengths": ["strength 1", "strength 2"],
    "weaknesses": ["weakness 1", "weakness 2"],
    "recommended_lessons": ["lesson 1", "lesson 2"]
}}
"""

    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": transcript_text}
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.1,
        response_format={"type": "json_object"}
    )

    content = response.choices[0].message.content
    if not content:
        raise ValueError("Empty response from Groq API")
        
    data = json.loads(content)
    
    # Calculate overall score if not set
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
        
    # Ensure transcript is set
    data["transcript"] = transcript_text
    return data

