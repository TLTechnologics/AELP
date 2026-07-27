from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from api import auth, assessments, writing, lessons, progress, notifications, achievements

app = FastAPI(
    title="AELP Backend API",
    description="Backend for Adaptive English Learning Platform",
    version="1.0.0"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
def health_check():
    return {"status": "ok", "message": "AELP Backend is running smoothly."}

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(assessments.router, prefix="/api/assessments", tags=["Assessments"])
app.include_router(writing.router, prefix="/api/writing", tags=["Writing"])
app.include_router(writing.router, prefix="/api", tags=["Writing Direct"])
app.include_router(lessons.router, prefix="/api/lessons", tags=["Lessons"])
app.include_router(progress.router, prefix="/api/progress", tags=["Progress"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(achievements.router, prefix="/api/achievements", tags=["Achievements"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
