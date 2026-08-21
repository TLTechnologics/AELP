from services.ai_evaluation import detect_ai_content

try:
    res = detect_ai_content("Social media has become an important part of our daily lives. It helps us stay connected with family and friends, share ideas, learn new skills, and keep up with current events.")
    print("Success:", res)
except Exception as e:
    import traceback
    traceback.print_exc()
