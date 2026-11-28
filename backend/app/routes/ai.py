import os

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from google import genai

from app.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/api/ai", tags=["AI Assistant"])


class TaskBreakdownRequest(BaseModel):
    task: str = Field(min_length=3, max_length=500)


@router.post("/breakdown")
def breakdown_task(
    request: TaskBreakdownRequest,
    current_user: User = Depends(get_current_user)
):
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key is not configured"
        )

    prompt = f"""
    You are a productivity assistant.

    Break the following task into 5 simple,
    actionable subtasks.

    Task: {request.task}

    Return only a numbered list of subtasks.
    Keep each subtask short and practical.
    """

    try:
        client = genai.Client(
            api_key=api_key,
            http_options={
                "timeout": 20000,
                "retry_options": {"attempts": 1}
            }
        )

        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt
        )

        return {
            "task": request.task,
            "breakdown": response.text
        }

    except Exception as e:
        print("Gemini Error:", type(e).__name__,
              getattr(e, "code", ""))

        raise HTTPException(
            status_code=502,
            detail="Unable to generate subtasks using Gemini"
        )