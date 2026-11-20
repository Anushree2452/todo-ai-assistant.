
from fastapi import FastAPI
from app.routes.tasks import router as tasks_router

app = FastAPI(title="To-Do Application API")

app.include_router(tasks_router)

@app.get("/")
def home():
    return {"message": "To-Do API is running!"}
