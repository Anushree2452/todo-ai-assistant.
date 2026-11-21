
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, case
from sqlalchemy.orm import Session
from app.schemas import TaskResponse

from app.database import get_db
from app.models import User, Task, TaskStatus
from app.dependencies import require_admin

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"]
)

@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    query = (
        select(
            User.id,
            User.name,
            User.email,
            User.role,
            func.count(Task.id).label("total"),
            func.count(
                case((Task.status == TaskStatus.Pending, 1))
            ).label("pending"),
            func.count(
                case((Task.status == TaskStatus.InProgress, 1))
            ).label("in_progress"),
            func.count(
                case((Task.status == TaskStatus.Completed, 1))
            ).label("completed"),
        )
        .outerjoin(Task, Task.user_id == User.id)
        .group_by(User.id, User.name, User.email, User.role)
        .order_by(User.id)
    )

    results = db.execute(query).all()


    return [
        {
            "id": row.id,
            "name": row.name,
            "email": row.email,
            "role": row.role.value.lower(),
            "pending": row.pending,
            "in_progress": row.in_progress,
            "completed": row.completed,
            "total": row.total
        }
        for row in results
    ]


@router.get("/users/{user_id}")
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    query = (
        select(
            User.id,
            User.name,
            User.email,
            User.role,
            func.count(Task.id).label("total"),
            func.count(
                case((Task.status == TaskStatus.Pending, 1))
            ).label("pending"),
            func.count(
                case((Task.status == TaskStatus.InProgress, 1))
            ).label("in_progress"),
            func.count(
                case((Task.status == TaskStatus.Completed, 1))
            ).label("completed"),
        )
        .outerjoin(Task, Task.user_id == User.id)
        .where(User.id == user_id)
        .group_by(User.id, User.name, User.email, User.role)
    )

    row = db.execute(query).first()

    if row is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    return {
        "id": row.id,
        "name": row.name,
        "email": row.email,
        "role": row.role.value.lower(),
        "pending": row.pending,
        "in_progress": row.in_progress,
        "completed": row.completed,
        "total": row.total
    }

@router.get("/users/{user_id}/tasks", response_model=list[TaskResponse])
def get_user_tasks(
    user_id: int,
    status: TaskStatus = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    query = db.query(Task).filter(Task.user_id == user_id)

    if status is not None:
        query = query.filter(Task.status == status)

    return query.all()
