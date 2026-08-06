import re

file_path = r"src\app\teacher\reports\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    "import { mockClasses, mockStudents } from '@/lib/teacherMockData';",
    "import { useStudents, useReportsSummary, useStudentDetails } from '@/hooks/use-teacher';"
)

# 2. Update ReportsHub body
# We need to replace mockClasses and mockStudents logic with hooks

replacement_top = """export default function ReportsHub() {
  const { data: studentsData, isLoading: loadingStudents } = useStudents();
  const { data: reportsData, isLoading: loadingReports } = useReportsSummary();

  const [activeReport, setActiveReport] = useState<'weekly' | 'monthly' | 'student' | 'class'>('weekly');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  
  const { data: activeStudentData, isLoading: loadingStudentDetails } = useStudentDetails(selectedStudentId);

  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const students = studentsData || [];
  const classes = reportsData?.cohorts || [];
  
  const activeStudent = activeStudentData || null;
  const activeCohort = classes.find((c: any) => c.id === selectedClassId) || classes[0] || null;

  // Initialize selections once data loads
  import { useEffect } from 'react';
  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) setSelectedClassId(classes[0].id);
    if (students.length > 0 && !selectedStudentId) setSelectedStudentId(students[0].id);
  }, [classes, students]);
"""

# Replace top part
content = re.sub(
    r"export default function ReportsHub\(\) \{.*?const activeCohort = [^\n]*\n",
    replacement_top,
    content,
    flags=re.DOTALL
)

# 3. Update the student dropdown mapping
content = content.replace(
    "mockStudents.slice(0, 20).map(s =>",
    "students.map((s: any) =>"
)

# 4. Update class dropdown mapping
content = content.replace(
    "mockClasses.map(c => (\n                    <option key={c.id} value={c.name}>{c.name}</option>",
    "classes.map((c: any) => (\n                    <option key={c.id} value={c.id}>{c.name}</option>"
)
content = content.replace(
    "value={selectedClass} \n                  onChange={(e) => setSelectedClass(e.target.value)}",
    "value={selectedClassId} \n                  onChange={(e) => setSelectedClassId(e.target.value)}"
)

# 5. Fix executive metrics binding
content = content.replace(
    '<span className="font-heading text-2xl text-brand-dark mt-1">91.5%</span>',
    '<span className="font-heading text-2xl text-brand-dark mt-1">{reportsData?.executiveSummary?.averageAttendance || 0}%</span>'
)
content = content.replace(
    '<span className="font-heading text-2xl text-brand-dark mt-1">14,250</span>',
    '<span className="font-heading text-2xl text-brand-dark mt-1">{reportsData?.executiveSummary?.xpAccumulation || 0}</span>'
)
content = content.replace(
    '<span className="font-heading text-2xl text-brand-dark mt-1">94%</span>',
    '<span className="font-heading text-2xl text-brand-dark mt-1">{reportsData?.executiveSummary?.accuracyRatio || 0}%</span>'
)

# 6. Fix avatar in reports
content = content.replace(
    "{activeStudent?.avatar || '👤'}",
    "{typeof activeStudent?.avatar === 'string' ? <img src={activeStudent.avatar} alt='avatar' className='w-full h-full object-cover rounded-xl' /> : '👤'}"
)

# 7. Add loading state check
content = content.replace(
    "const handleDownload = () => {",
    "const isLoadingAll = loadingStudents || loadingReports || (activeReport === 'student' && loadingStudentDetails);\n\n  const handleDownload = () => {"
)

# Change loading check in PDF Content rendering
content = content.replace(
    "{isGenerating ? (",
    "{(isGenerating || isLoadingAll) ? ("
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
