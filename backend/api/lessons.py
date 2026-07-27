from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_lessons():
    return {"message": "lessons route"}
