from fastapi import APIRouter, HTTPException, status

from app.schemas.auth import AuthResponse, UserCreate, UserLogin
from app.services.auth_service import authenticate_user, create_user

router = APIRouter()


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: UserCreate):
    try:
        return await create_user(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/login", response_model=AuthResponse)
async def login(payload: UserLogin):
    try:
        return await authenticate_user(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

