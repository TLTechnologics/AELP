import os
import re

backend_file = r"backend\api\teacher.py"

with open(backend_file, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add StudentUpdateRequest
schema_code = """
class StudentUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    semester: Optional[str] = None
    group: Optional[str] = None
    roll_number: Optional[str] = None

"""
if "StudentUpdateRequest" not in content:
    # insert before create_student
    content = content.replace("class StudentCreateRequest(BaseModel):", schema_code + "class StudentCreateRequest(BaseModel):")

# 2. Add endpoints
endpoints_code = """
@router.put("/students/{student_id}")
def update_student(student_id: str, data: StudentUpdateRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == student_id, User.role == RoleEnum.STUDENT).first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
        
    student_profile = db.query(Student).filter(Student.user_id == user.id).first()
    
    if data.full_name:
        user.full_name = data.full_name
    if data.email:
        user.email = data.email
        
    if student_profile:
        if data.semester is not None:
            student_profile.semester = data.semester
        if data.group is not None:
            student_profile.group = data.group
        if hasattr(student_profile, 'roll_number') and data.roll_number is not None:
            student_profile.roll_number = data.roll_number
            
    db.commit()
    db.refresh(user)
    return {"message": "Student updated successfully"}

@router.delete("/students/{student_id}")
def delete_student(student_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == student_id, User.role == RoleEnum.STUDENT).first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
        
    student_profile = db.query(Student).filter(Student.user_id == user.id).first()
    if student_profile:
        db.delete(student_profile)
        
    db.delete(user)
    db.commit()
    
    return {"message": "Student deleted successfully"}
"""

if "def update_student" not in content:
    content = content.replace("def create_student(data: StudentCreateRequest, db: Session = Depends(get_db)):", endpoints_code + "\n\ndef create_student(data: StudentCreateRequest, db: Session = Depends(get_db)):")

with open(backend_file, "w", encoding="utf-8") as f:
    f.write(content)

print("Backend API endpoints added!")
