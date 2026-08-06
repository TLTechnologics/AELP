import re

file_path = r"src\app\teacher\students\[id]\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update imports
content = content.replace("import { mockStudents } from '@/lib/teacherMockData';", "import { useStudentDetails } from '@/hooks/use-teacher';\nimport { Loader2 } from 'lucide-react';")

# 2. Update StudentDetailProfile component body
# From:
#   const studentId = params.id as string;
#   const student = mockStudents.find(s => s.id === studentId);
#
#   // New feedback text state
#   const [newFeedback, setNewFeedback] = useState('');
#   const [feedbackHistory, setFeedbackHistory] = useState(student ? student.feedbackHistory : []);
# To:
#   const studentId = params.id as string;
#   const { data: student, isLoading } = useStudentDetails(studentId);
#
#   // New feedback text state
#   const [newFeedback, setNewFeedback] = useState('');
#   const [feedbackHistory, setFeedbackHistory] = useState([]);

replacement_body = """  const studentId = params.id as string;
  const { data: student, isLoading } = useStudentDetails(studentId);

  // New feedback text state
  const [newFeedback, setNewFeedback] = useState('');
  const [feedbackHistory, setFeedbackHistory] = useState(student ? student.feedbackHistory : []);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto text-center py-40 space-y-4">
          <Loader2 className="w-12 h-12 text-brand-dark animate-spin mx-auto" />
          <h1 className="font-heading text-2xl uppercase">Loading Profile...</h1>
        </div>
      </MainLayout>
    );
  }"""

content = re.sub(r"  const studentId = params.id as string;\n  const student = mockStudents.find\(s => s\.id === studentId\);\n\n  // New feedback text state\n  const \[newFeedback, setNewFeedback\] = useState\(''\);\n  const \[feedbackHistory, setFeedbackHistory\] = useState\(student \? student\.feedbackHistory : \[\]\);", replacement_body, content, count=1)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
