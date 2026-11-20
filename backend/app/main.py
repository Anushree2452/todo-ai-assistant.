from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import router as auth_router
from app.admin import router as admin_router
app = FastAPI(
    title="To-Do Application API",
    description="User and Admin Authentication APIs",
    version="1.0.0"
)

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Include authentication routes
app.include_router(auth_router)
app.include_router(admin_router)

@app.get("/")
def home():
    return {"message": "To-Do Application API is running"}
