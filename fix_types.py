import re

file_path = r"src\app\teacher\students\[id]\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix `student.assignedLessons.map((l, idx)`
content = re.sub(r'student\.assignedLessons\.map\(\(l, idx\)', 'student.assignedLessons.map((l: string, idx: number)', content)

# Fix `student.recommendations.map((r, idx)`
content = re.sub(r'student\.recommendations\.map\(\(r, idx\)', 'student.recommendations.map((r: string, idx: number)', content)

# Fix `student.assessmentHistory.map((a)`
content = re.sub(r'student\.assessmentHistory\.map\(\(a\)', 'student.assessmentHistory.map((a: any)', content)

# Fix `student.feedbackHistory.map((f)`
content = re.sub(r'student\.feedbackHistory\.map\(\(f\)', 'student.feedbackHistory.map((f: any)', content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
