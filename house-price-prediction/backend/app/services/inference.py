"""
Model loading + inference.

The exported artifact at `models/house_price.pkl` is a single, complete
sklearn Pipeline: raw-DataFrame in, prediction out. It already contains the
feature-engineering step (via `app.services.preprocessing.engineer_features`),
imputation, scaling, and one-hot encoding — this module does NOT duplicate
any of that logic. It only loads the pipeline once and calls `.predict()`.
"""

import logging

import joblib
import pandas as pd

from app.core.config import settings
from app.schemas.prediction import PredictionRequest

logger = logging.getLogger(__name__)


class ModelNotLoadedError(RuntimeError):
    """Raised if a prediction is requested before the model has been loaded."""


class HousePricePredictor:
    def __init__(self) -> None:
        self._pipeline = None

    def load(self) -> None:
        model_path = settings.resolved_model_path()
        if not model_path.exists():
            raise FileNotFoundError(
                f"Model artifact not found at {model_path}. "
                "Run the training notebook (notebooks/house_price_model.ipynb) first."
            )
        logger.info("Loading model pipeline from %s", model_path)
        self._pipeline = joblib.load(model_path)
        logger.info("Model pipeline loaded successfully.")

    @property
    def is_loaded(self) -> bool:
        return self._pipeline is not None

    def predict(self, request: PredictionRequest) -> float:
        if self._pipeline is None:
            raise ModelNotLoadedError("Model pipeline has not been loaded yet.")

        input_df = pd.DataFrame([request.model_dump()])
        prediction = self._pipeline.predict(input_df)[0]
        return float(prediction)


# Single shared instance, populated during the FastAPI lifespan startup hook.
predictor = HousePricePredictor()
