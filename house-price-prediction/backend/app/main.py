import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.prediction import router as prediction_router
from app.core.config import settings
from app.services.inference import predictor
from app.utils.logging_config import configure_logging

configure_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the model exactly once, at startup — never per-request.
    logger.info("Starting up %s (%s environment)", settings.app_name, settings.environment)
    predictor.load()
    yield
    logger.info("Shutting down %s", settings.app_name)


app = FastAPI(
    title=settings.app_name,
    description=(
        "Predicts median house value for a California census block group "
        "using a trained scikit-learn Pipeline (see notebooks/house_price_model.ipynb)."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction_router)


@app.get("/", tags=["root"])
def root():
    return {
        "message": settings.app_name,
        "docs": "/docs",
        "health": "/health",
    }
