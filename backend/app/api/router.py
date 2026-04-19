from fastapi import APIRouter

from app.api.routes import auth, chat, predict, records, reports

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(chat.router, prefix="/chat", tags=["assistant"])
api_router.include_router(predict.router, tags=["prediction"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(records.router, prefix="/records", tags=["records"])
