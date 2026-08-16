from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from api import auth, assessments, writing, speaking, lessons, progress, notifications, achievements, dashboard, results, learning_path, teacher

app = FastAPI(
    title="AELP Backend API",
    description="Backend for Adaptive English Learning Platform",
    version="1.0.0"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "https://aelp-dszy.vercel.app",
        "https://aelp.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
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
app.include_router(speaking.router, prefix="/api/speaking", tags=["Speaking"])
app.include_router(writing.router, prefix="/api", tags=["Writing Direct"])
app.include_router(lessons.router, prefix="/api/lessons", tags=["Lessons"])
app.include_router(progress.router, prefix="/api/progress", tags=["Progress"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(achievements.router, prefix="/api/achievements", tags=["Achievements"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(results.router, prefix="/api/results", tags=["Results"])
app.include_router(learning_path.router, prefix="/api/path", tags=["Learning Path"])
app.include_router(teacher.router, prefix="/api/teacher", tags=["Teacher"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
