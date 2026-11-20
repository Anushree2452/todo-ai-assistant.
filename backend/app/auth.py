from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import User, UserRole
from app.schemas import UserRegister, UserResponse, Token
from app.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.dependencies import get_current_user, require_admin


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


# User Registration
@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    user: UserRegister,
    db: Session = Depends(get_db)
):
    email = user.email.lower()

    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    new_user = User(
        name=user.name,
        email=email,
        password_hash=hash_password(user.password),
        role=UserRole.User
    )

    db.add(new_user)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Unable to register with these details"
        )

    db.refresh(new_user)

    return new_user


# Verify login credentials
def authenticate_user(email, password, db):
    user = db.query(User).filter(
        User.email == email.lower()
    ).first()

    if not user or not verify_password(
        password, user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return user


# User Login
@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(
        form_data.username,
        form_data.password,
        db
    )

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role.value
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# Admin Login
@router.post("/admin/login", response_model=Token)
def admin_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(
        form_data.username,
        form_data.password,
        db
    )

    if user.role != UserRole.Admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role.value
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# Logged-in User Profile
@router.get("/me", response_model=UserResponse)
def get_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user


# Verify Admin Access
@router.get("/admin/me", response_model=UserResponse)
def admin_profile(
    current_user: User = Depends(require_admin)
):
    return current_user
