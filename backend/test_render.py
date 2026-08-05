import requests

url = "https://aelp.onrender.com/api/speaking/submit"
try:
    with open('dummy.wav', 'wb') as f:
        f.write(b'RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00')
    
    print("Sending POST request to Render...")
    res = requests.post(
        url, 
        files={'audio_file': ('dummy.wav', open('dummy.wav', 'rb'), 'audio/wav')}, 
        data={'assessment_id': 1, 'prompt': 'hello', 'duration': 35}
    )
    print("Response Status:", res.status_code)
    print("Response Body:", res.text)
except Exception as e:
    print("Exception occurred:", type(e).__name__, str(e))
