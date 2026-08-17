"""
Shared feature-engineering logic for the House Price Prediction project.

IMPORTANT: This module is imported by BOTH:
  1. notebooks/house_price_model.ipynb  (during training, to build the
     exported sklearn Pipeline)
  2. backend/app/services/inference.py  (at prediction time)

This is the single source of truth for how raw input columns are turned
into the engineered features the model was trained on. Because the
trained Pipeline stores a reference to `engineer_features` at the
import path `app.services.preprocessing.engineer_features`, this file
must not be moved or renamed without retraining/re-exporting the model.

Keeping this logic in one place (instead of reimplemented separately in
the notebook and the API) avoids train/serve skew: the backend never
performs its own one-hot encoding or scaling, it simply hands a raw
DataFrame to the loaded Pipeline, which runs this function internally.
"""

import pandas as pd

# Raw columns the trained pipeline expects as input (before engineering).
RAW_NUMERIC_COLUMNS = [
    "longitude",
    "latitude",
    "housing_median_age",
    "total_rooms",
    "total_bedrooms",
    "population",
    "households",
    "median_income",
]

RAW_CATEGORICAL_COLUMNS = ["ocean_proximity"]

RAW_INPUT_COLUMNS = RAW_NUMERIC_COLUMNS + RAW_CATEGORICAL_COLUMNS

# Engineered numeric columns created by `engineer_features` below.
ENGINEERED_NUMERIC_COLUMNS = [
    "rooms_per_household",
    "bedrooms_per_room",
    "population_per_household",
]

ALL_NUMERIC_COLUMNS = RAW_NUMERIC_COLUMNS + ENGINEERED_NUMERIC_COLUMNS


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Derive ratio features from the raw block-group counts.

    These three features are the classic engineered features for this
    dataset (Aurelien Geron's "Hands-On Machine Learning" formulation):

      - rooms_per_household:       total_rooms / households
      - bedrooms_per_room:         total_bedrooms / total_rooms
      - population_per_household:  population / households

    They are computed ONLY from raw columns available both at training
    time and at inference time (a single API request), so there is no
    data leakage (no use of the target, no use of statistics computed
    across the full dataset).

    A tiny epsilon is added to denominators to guard against division
    by zero, although the source data has no zero-valued households or
    total_rooms.
    """
    df = df.copy()
    eps = 1e-6
    df["rooms_per_household"] = df["total_rooms"] / (df["households"] + eps)
    df["bedrooms_per_room"] = df["total_bedrooms"] / (df["total_rooms"] + eps)
    df["population_per_household"] = df["population"] / (df["households"] + eps)
    return df
