"""Request/response schemas for the /predict endpoint."""

from typing import Literal

from pydantic import BaseModel, Field

OceanProximity = Literal["<1H OCEAN", "INLAND", "ISLAND", "NEAR BAY", "NEAR OCEAN"]


class PredictionRequest(BaseModel):
    """
    Raw inputs the model pipeline expects, at the granularity of a census
    block group. Field constraints mirror the plausible value ranges found
    in the training data (see notebooks/house_price_model.ipynb, Section 3).
    """

    longitude: float = Field(..., ge=-125, le=-113, description="Longitude of the block group (California range).")
    latitude: float = Field(..., ge=32, le=42.5, description="Latitude of the block group (California range).")
    housing_median_age: float = Field(..., ge=0, le=100, description="Median age of houses in the block group (years).")
    total_rooms: float = Field(..., gt=0, description="Total number of rooms in the block group.")
    total_bedrooms: float = Field(..., gt=0, description="Total number of bedrooms in the block group.")
    population: float = Field(..., gt=0, description="Population of the block group.")
    households: float = Field(..., gt=0, description="Number of households in the block group.")
    median_income: float = Field(..., gt=0, le=20, description="Median income of the block group, in tens of thousands of USD.")
    ocean_proximity: OceanProximity = Field(..., description="Categorical proximity to the ocean.")

    model_config = {
        "json_schema_extra": {
            "example": {
                "longitude": -122.23,
                "latitude": 37.88,
                "housing_median_age": 41,
                "total_rooms": 880,
                "total_bedrooms": 129,
                "population": 322,
                "households": 126,
                "median_income": 8.3252,
                "ocean_proximity": "NEAR BAY",
            }
        }
    }


class PredictionResponse(BaseModel):
    predicted_price: float = Field(..., description="Predicted median house value in USD.")


class HealthResponse(BaseModel):
    status: str = "ok"
