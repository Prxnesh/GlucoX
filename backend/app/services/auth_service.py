from datetime import timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.schemas.auth import AuthResponse, CurrentUser, UserCreate, UserLogin, UserRead
from app.utils.config import get_settings
from app.utils.database import db
from app.utils.security import create_access_token, decode_access_token, get_password_hash, verify_password

bearer_scheme = HTTPBearer(auto_error=False)
settings = get_settings()


async def create_user(payload: UserCreate) -> AuthResponse:
    existing_user = await db.user.find_unique(where={"email": payload.email})
    if existing_user:
        raise ValueError("An account with this email already exists.")

    user = await db.user.create(
        data={
            "name": payload.name,
            "email": payload.email,
            "passwordHash": get_password_hash(payload.password),
        }
    )

    token = create_access_token(
        subject=user.id,
        expires_delta=timedelta(minutes=settings.jwt_expires_minutes),
    )
    return AuthResponse(access_token=token, user=UserRead.model_validate(user))


async def authenticate_user(payload: UserLogin) -> AuthResponse:
    user = await db.user.find_unique(where={"email": payload.email})
    if not user or not verify_password(payload.password, user.passwordHash):
        raise ValueError("Incorrect email or password.")

    token = create_access_token(
        subject=user.id,
        expires_delta=timedelta(minutes=settings.jwt_expires_minutes),
    )
    return AuthResponse(access_token=token, user=UserRead.model_validate(user))


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> CurrentUser:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication is required.",
        )

    try:
        subject = decode_access_token(credentials.credentials)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc

    user = await db.user.find_unique(where={"id": subject})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session is no longer valid.",
        )

    return CurrentUser(id=user.id, name=user.name, email=user.email)
