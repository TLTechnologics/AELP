import re

file_path = r"src\app\teacher\students\[id]\page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix avatar rendering
# From:
#          <div className="w-32 h-32 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-6xl text-brand-dark shadow-xl border-4 border-white shrink-0">
#            {student.avatar}
#          </div>
# To:
#          <div className="w-32 h-32 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-6xl text-brand-dark shadow-xl border-4 border-white shrink-0 overflow-hidden">
#            {typeof student.avatar === 'string' && student.avatar.startsWith('http') ? <img src={student.avatar} alt="avatar" className="w-full h-full object-cover" /> : student.avatar}
#          </div>

content = content.replace(
    '<div className="w-32 h-32 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-6xl text-brand-dark shadow-xl border-4 border-white shrink-0">\n            {student.avatar}\n          </div>',
    '<div className="w-32 h-32 rounded-full bg-brand-yellow flex items-center justify-center font-heading text-6xl text-brand-dark shadow-xl border-4 border-white shrink-0 overflow-hidden">\n            {typeof student.avatar === \'string\' && student.avatar.startsWith(\'http\') ? <img src={student.avatar} alt="avatar" className="w-full h-full object-cover" /> : student.avatar}\n          </div>'
)

# Also fix the use of student.avatar in ReportsHub
with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
