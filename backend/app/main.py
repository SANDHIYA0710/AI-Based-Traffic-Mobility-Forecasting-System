from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.db.init_db import init_db
from app.models import (
    user,
    route,
    traffic_record,
    forecast,
    anomaly,
    simulation,
    dataset,
)

from fastapi.exceptions import RequestValidationError

from app.core.exceptions import AppException
from app.core.handlers import (
    app_exception_handler,
    validation_exception_handler,
    general_exception_handler,
)

app = FastAPI(
    title="AI Traffic & Mobility Forecasting System",
    version="1.0.0",
    description="AI-powered Traffic Forecasting & Mobility Optimization API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(
    AppException,
    app_exception_handler
)

app.add_exception_handler(
    RequestValidationError,
    validation_exception_handler
)

app.add_exception_handler(
    Exception,
    general_exception_handler
)


@app.on_event("startup")
def startup():
    init_db()


app.include_router(
    api_router,
    prefix="/api/v1"
)


@app.get("/")
def root():
    return {
        "message": "AI Traffic & Mobility Forecasting API Running Successfully"
    }