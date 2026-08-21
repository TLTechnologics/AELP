import json
from groq import Groq
from config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

def evaluate_writing(prompt: str, submission: str) -> dict:
    """
    Evaluates a student's writing submission using Groq API (mixtral-8x7b-32768).
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

    import requests
    from config import settings
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set.")

    generate_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={api_key}"
    payload = {
        "systemInstruction": {
            "parts": [{"text": system_prompt}]
        },
        "contents": [{
            "parts": [{"text": submission}]
        }],
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json"
        }
    }
    
    response = requests.post(generate_url, json=payload)
    if not response.ok:
        raise ValueError(f"Failed to generate content: {response.text}")
        
    try:
        content_text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
        data = json.loads(content_text)
    except (KeyError, IndexError, json.JSONDecodeError) as e:
        raise ValueError("Failed to parse Gemini API response")
    
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
        model="mixtral-8x7b-32768",
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

def evaluate_speaking_text(transcript_text: str, prompt: str) -> dict:
    """
    Evaluates a student's speaking submission using Groq API (Llama 3 only) based on a pre-generated transcript.
    """
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
        model="mixtral-8x7b-32768",
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
        
    data["transcript"] = transcript_text
    return data

def detect_ai_content(text: str) -> dict:
    """
    Analyzes a student's essay and estimates what percentage appears to be AI-generated.
    Uses Groq Llama model with a carefully crafted detection prompt.
    Returns ai_percentage, verdict, confidence, indicators, human_indicators, and summary.
    """
    system_prompt = """You are an expert AI content detection specialist trained to identify AI-generated text.
Analyze the provided essay and determine what percentage of it appears to be AI-generated vs human-written.

Look for these AI indicators:
- Overly formal or structured writing for a student's level
- Generic, non-specific examples that lack personal experience
- Repetitive sentence structures or transitions (e.g., "Furthermore", "Moreover", "In conclusion")
- Lack of spelling/grammar mistakes (suspiciously perfect)
- Unnaturally even paragraph lengths
- Absence of personal anecdotes or unique perspective
- Buzzwords and hedging phrases typical of LLMs

Look for these HUMAN indicators:
- Spelling mistakes or minor grammar errors
- Informal or colloquial language
- Personal anecdotes or unique perspectives
- Irregular sentence lengths
- Topic drift or tangential thoughts
- Emotion or personal opinion
- Unusual word choices or creative errors

Return ONLY valid JSON matching this schema:
{
    "ai_percentage": 72,
    "verdict": "Likely AI-generated",
    "confidence": "High",
    "indicators": ["Overly structured transitions", "Lack of personal perspective"],
    "human_indicators": ["One informal phrase detected"],
    "summary": "This essay shows strong signs of AI generation due to its unnaturally formal tone and lack of any personal anecdotes or errors."
}

Verdicts must be exactly one of: "Human Written", "Possibly AI Assisted", "Likely AI-generated", "Almost Certainly AI-generated"
Confidence must be exactly one of: "Low", "Medium", "High"
ai_percentage must be an integer from 0 to 100.
"""

    import requests
    from config import settings
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set.")

    generate_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={api_key}"
    payload = {
        "systemInstruction": {
            "parts": [{"text": system_prompt}]
        },
        "contents": [{
            "parts": [{"text": f"Analyze this student essay:\n\n{text}"}]
        }],
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json"
        }
    }
    
    response = requests.post(generate_url, json=payload)
    if not response.ok:
        raise ValueError(f"Failed to generate content: {response.text}")
        
    try:
        content_text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
        data = json.loads(content_text)
    except (KeyError, IndexError, json.JSONDecodeError) as e:
        raise ValueError("Failed to parse Gemini API response")

    # Sanitize / enforce defaults
    data["ai_percentage"] = max(0, min(100, int(data.get("ai_percentage", 0))))

    valid_verdicts = ["Human Written", "Possibly AI Assisted", "Likely AI-generated", "Almost Certainly AI-generated"]
    if data.get("verdict") not in valid_verdicts:
        pct = data["ai_percentage"]
        if pct <= 30:
            data["verdict"] = "Human Written"
        elif pct <= 60:
            data["verdict"] = "Possibly AI Assisted"
        elif pct <= 85:
            data["verdict"] = "Likely AI-generated"
        else:
            data["verdict"] = "Almost Certainly AI-generated"

    if data.get("confidence") not in ["Low", "Medium", "High"]:
        data["confidence"] = "Medium"

    if not isinstance(data.get("indicators"), list):
        data["indicators"] = []
    if not isinstance(data.get("human_indicators"), list):
        data["human_indicators"] = []
    if not data.get("summary"):
        data["summary"] = "Analysis complete."

    return data
