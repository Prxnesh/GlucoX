from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.auth import CurrentUser
from app.schemas.prediction import PredictionInput, PredictionResponse
from app.services.auth_service import get_current_user
from app.services.prediction_service import predict_and_store

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
async def predict(payload: PredictionInput, user: CurrentUser = Depends(get_current_user)):
    try:
        return await predict_and_store(user, payload)
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model artifact not found. Run the training script first.",
        ) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

