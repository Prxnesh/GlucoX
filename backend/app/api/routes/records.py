from fastapi import APIRouter, Depends

from app.schemas.auth import CurrentUser
from app.schemas.record import DashboardResponse
from app.services.auth_service import get_current_user
from app.services.history_service import build_dashboard_snapshot

router = APIRouter()


@router.get("/dashboard", response_model=DashboardResponse)
async def dashboard(user: CurrentUser = Depends(get_current_user)):
    return await build_dashboard_snapshot(user.id)

