from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.schemas.auth import CurrentUser
from app.schemas.report import ReportExtractionResponse
from app.services.auth_service import get_current_user
from app.services.report_service import analyze_and_store_report

router = APIRouter()


@router.post("/analyze", response_model=ReportExtractionResponse)
async def analyze_report(
    file: UploadFile = File(...),
    user: CurrentUser = Depends(get_current_user),
):
    try:
        return await analyze_and_store_report(user, file)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

