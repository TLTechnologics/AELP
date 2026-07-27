from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_achievements():
    return {"message": "achievements route"}
