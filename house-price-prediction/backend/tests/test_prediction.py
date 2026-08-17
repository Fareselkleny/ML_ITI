"""
Backend tests for the House Price Prediction API.

Run with:
    cd backend
    pytest -v

These tests use FastAPI's TestClient, which triggers the app's lifespan
(so the real trained model is loaded from models/house_price.pkl) before
making requests — the model must be exported (via the training notebook)
before running these tests.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app

VALID_PAYLOAD = {
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


@pytest.fixture()
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_predict_valid_request_returns_price(client):
    """TEST 1: a well-formed request returns a successful prediction."""
    response = client.post("/predict", json=VALID_PAYLOAD)
    assert response.status_code == 200

    body = response.json()
    assert "predicted_price" in body
    assert isinstance(body["predicted_price"], (int, float))
    # Predicted price should be a sane positive dollar amount.
    assert body["predicted_price"] > 0


def test_predict_invalid_request_returns_422(client):
    """TEST 2: an invalid request (missing fields, bad category) returns HTTP 422."""
    invalid_payload = {
        "longitude": -122.23,
        "latitude": 37.88,
        # total_rooms missing entirely
        "total_bedrooms": 129,
        "population": 322,
        "households": 126,
        "median_income": 8.3252,
        "ocean_proximity": "MARS",  # not an allowed category
    }
    response = client.post("/predict", json=invalid_payload)
    assert response.status_code == 422


def test_predict_negative_area_returns_422(client):
    """Extra validation case: negative/zero values must be rejected."""
    bad_payload = dict(VALID_PAYLOAD)
    bad_payload["total_rooms"] = -10
    response = client.post("/predict", json=bad_payload)
    assert response.status_code == 422
