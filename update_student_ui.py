import os

filepath = r"src\app\teacher\students\[id]\page.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add imports
content = content.replace("import { useStudentDetails } from '@/hooks/use-teacher';",
"""import { useStudentDetails, useUpdateStudent, useDeleteStudent } from '@/hooks/use-teacher';
import { Edit2, Trash2, X } from 'lucide-react';
""")

# 2. Add State inside component
state_code = """
  // CRUD States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', class: '', group: '' });
  
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const handleOpenEdit = () => {
    if (student) {
      setEditForm({ name: student.name, email: student.email, class: student.class, group: student.group });
      setIsEditModalOpen(true);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStudent.mutateAsync({
      id: studentId,
      data: {
        full_name: editForm.name,
        email: editForm.email,
        semester: editForm.class,
        group: editForm.group
      }
    });
    setIsEditModalOpen(false);
    window.location.reload(); // Refresh data
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to permanently delete this student? This action cannot be undone.")) {
      await deleteStudent.mutateAsync(studentId);
      router.push('/teacher/students');
    }
  };
"""

content = content.replace("  const [feedbackHistory, setFeedbackHistory] = useState(student ? student.feedbackHistory : []);",
"  const [feedbackHistory, setFeedbackHistory] = useState(student ? student.feedbackHistory : []);" + state_code)

# 3. Add buttons next to Back to Directory
buttons_ui = """
        <div className="flex justify-between items-center">
          <button 
            onClick={() => router.push('/teacher/students')}
            className="flex items-center gap-2 text-sm font-bold text-brand-dark hover:gap-3 transition-all uppercase"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={handleOpenEdit}
              className="bg-brand-yellow text-brand-dark px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-brand-yellow/80 transition-colors"
            >
              <Edit2 className="w-4 h-4" /> Edit Profile
            </button>
            <button 
              onClick={handleDelete}
              className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
"""
content = content.replace("""        {/* Back Link */}
        <button 
          onClick={() => router.push('/teacher/students')}
          className="flex items-center gap-2 text-sm font-bold text-brand-dark hover:gap-3 transition-all uppercase"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>""", buttons_ui)


# 4. Add Modal at the end of MainLayout
modal_ui = """
      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl relative"
          >
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-brand-dark transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h2 className="font-heading text-3xl mb-6">Edit Profile</h2>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-brand-dark mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full bg-muted border border-border/50 rounded-xl px-4 py-2.5 outline-none focus:border-brand-yellow font-medium"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-brand-dark mb-1 block">Email</label>
                <input 
                  type="email" 
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full bg-muted border border-border/50 rounded-xl px-4 py-2.5 outline-none focus:border-brand-yellow font-medium"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-brand-dark mb-1 block">Semester/Class</label>
                  <input 
                    type="text" 
                    value={editForm.class}
                    onChange={(e) => setEditForm({...editForm, class: e.target.value})}
                    className="w-full bg-muted border border-border/50 rounded-xl px-4 py-2.5 outline-none focus:border-brand-yellow font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-brand-dark mb-1 block">Group</label>
                  <input 
                    type="text" 
                    value={editForm.group}
                    onChange={(e) => setEditForm({...editForm, group: e.target.value})}
                    className="w-full bg-muted border border-border/50 rounded-xl px-4 py-2.5 outline-none focus:border-brand-yellow font-medium"
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={updateStudent.isPending}
                className="w-full bg-brand-dark text-white rounded-xl py-3.5 font-bold mt-2 disabled:opacity-50"
              >
                {updateStudent.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
"""
content = content.replace("    </MainLayout>", modal_ui + "    </MainLayout>")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("UI injected!")
