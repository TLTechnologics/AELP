import requests
from config import settings

api_key = settings.GEMINI_API_KEY
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
res = requests.get(url)
if res.ok:
    models = res.json().get("models", [])
    for m in models:
        print(m.get("name"))
else:
    print("Error:", res.text)
