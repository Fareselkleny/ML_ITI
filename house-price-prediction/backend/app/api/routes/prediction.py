import logging

from fastapi import APIRouter, HTTPException

from app.schemas.prediction import HealthResponse, PredictionRequest, PredictionResponse
from app.services.inference import ModelNotLoadedError, predictor

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["health"])
def health() -> HealthResponse:
    """Simple liveness/readiness check."""
    return HealthResponse(status="ok")


@router.post("/predict", response_model=PredictionResponse, tags=["prediction"])
def predict(request: PredictionRequest) -> PredictionResponse:
    """
    Predict the median house value for a census block group.

    Request validation (types, ranges, allowed `ocean_proximity` categories)
    is handled entirely by the `PredictionRequest` Pydantic schema — an
    invalid payload never reaches this function; FastAPI returns HTTP 422
    automatically before this code runs.
    """
    try:
        predicted_price = predictor.predict(request)
    except ModelNotLoadedError as exc:
        logger.error("Prediction attempted before model was loaded: %s", exc)
        raise HTTPException(status_code=503, detail="Model is not ready yet. Please try again shortly.") from exc
    except Exception as exc:  # noqa: BLE001 - convert any unexpected inference error into a clean 500
        logger.exception("Unexpected error during prediction")
        raise HTTPException(status_code=500, detail="Failed to compute a prediction.") from exc

    return PredictionResponse(predicted_price=round(predicted_price, 2))
