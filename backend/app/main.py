from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.utils.config import get_settings
from app.utils.database import connect_db, disconnect_db
from app.utils.logger import configure_logging

settings = get_settings()
configure_logging()


@asynccontextmanager
async def lifespan(_: FastAPI):
    await connect_db()
    yield
    await disconnect_db()


app = FastAPI(
    title="DiaSense API",
    version="0.1.0",
    description="Prediction, OCR, and health history services for DiaSense.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/health")
async def healthcheck():
    return {"status": "ok"}

