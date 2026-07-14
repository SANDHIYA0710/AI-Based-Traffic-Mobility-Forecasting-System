from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.user import UserRegister, UserLogin, UserResponse
from app.schemas.token import Token
from app.services.auth_service import AuthService
from app.core.security import (
    create_access_token,
    create_refresh_token,
)
from app.core.dependencies import get_current_user
from app.models.user import User
from app.core.dependencies import get_admin_user
from fastapi.security import OAuth2PasswordRequestForm


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(user: UserRegister, db: Session = Depends(get_db)):

    existing_user = AuthService.get_user_by_email(db, user.email)

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    return AuthService.create_user(db, user)


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    db_user = AuthService.authenticate(
        db,
        form_data.username,   # username field will contain the email
        form_data.password,
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role,
        }
    )

    refresh_token = create_refresh_token(
        {
            "sub": db_user.email,
        }
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user

@router.get("/admin")
def admin_dashboard(
    admin: User = Depends(get_admin_user),
):
    return {
        "message": f"Welcome {admin.username}"
    }