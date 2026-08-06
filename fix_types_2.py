import re

file_path = r"src\app\teacher\students\[id]\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# student.assessmentHistory.map(as => {
content = re.sub(r'student\.assessmentHistory\.map\((\w+)\s*=>', r'student.assessmentHistory.map((\1: any) =>', content)

# student.feedbackHistory.map((fb, idx) => {
content = re.sub(r'student\.feedbackHistory\.map\(\(fb,\s*idx\)\s*=>', r'student.feedbackHistory.map((fb: any, idx: number) =>', content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
