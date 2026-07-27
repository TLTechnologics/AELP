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

