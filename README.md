# House Price Prediction — California Housing

>this project is done by : 
1 - freddy fady nashaat 
2- fares mohamed ismail elkleny 


An end-to-end machine-learning project that predicts the **median house value of a California census block group** from demographic, housing, geographic, and ocean-proximity features.

The project covers the complete ML lifecycle:

**Dataset → Data Understanding → Cleaning → EDA → Feature Engineering → Preprocessing → Model Training → Evaluation → Model Selection → Model Export → FastAPI API → React Frontend**

> **Important:** this is a demonstration model trained on the classic 1990 California Housing dataset. It predicts a **block-group median value**, not the price of an individual modern house.

---

## 1. Project Objective

The objective is to build a regression model capable of estimating `median_house_value` from the available California Housing features.

The project also turns the trained model into a usable application:

- A Jupyter notebook performs the complete ML workflow.
- A single scikit-learn pipeline contains feature engineering and preprocessing.
- The trained pipeline is exported as `house_price.pkl`.
- A FastAPI backend exposes `/predict`.
- A React + TypeScript frontend provides a user interface.

---

## 2. Dataset

The project uses the **California Housing** dataset containing:

- **20,640 rows**
- **10 original columns**
- California census block-group data from the 1990 U.S. Census

### Original features

| Feature | Description |
|---|---|
| `longitude` | Longitude of the block group |
| `latitude` | Latitude of the block group |
| `housing_median_age` | Median age of houses in the block group |
| `total_rooms` | Total number of rooms |
| `total_bedrooms` | Total number of bedrooms |
| `population` | Population of the block group |
| `households` | Number of households |
| `median_income` | Median income, represented in tens of thousands of USD |
| `median_house_value` | Target: median house value in USD |
| `ocean_proximity` | Categorical proximity-to-ocean group |

The raw CSV is expected at:

```text
data/housing.csv
```

The dataset is not committed to the repository.

---

## 3. Machine Learning Workflow

### Step 1 — Load and understand the data

The notebook checks:

- Dataset shape
- Column names
- Data types
- Summary statistics
- Missing values
- Target distribution

### Step 2 — Exploratory Data Analysis

The notebook investigates:

1. Target-price distribution
2. Price vs. total rooms
3. Average price by ocean proximity
4. Price by housing-age group
5. Numeric feature correlations
6. Engineered-feature distributions/outliers

### Step 3 — Data cleaning

The cleaning stage:

- Removes target values at the dataset's artificial upper cap.
- Removes duplicate rows.
- Rejects impossible numeric values.
- Handles missing `total_bedrooms` through pipeline imputation.
- Preserves valid categorical values.

### Step 4 — Feature engineering

Three ratio features are created:

```text
rooms_per_household
bedrooms_per_room
population_per_household
```

These features provide more useful information than raw counts alone.

For example:

```text
rooms_per_household = total_rooms / households
```

### Step 5 — Train/test split

The cleaned dataset is split into:

- **80% training**
- **20% testing**

with:

```python
random_state = 42
```

The test set is kept separate for final evaluation.

### Step 6 — Preprocessing

A `ColumnTransformer` performs:

**Numeric features**
- Median imputation
- Standard scaling

**Categorical feature**
- Most-frequent imputation
- One-hot encoding

The feature-engineering function and preprocessing are included inside the exported pipeline.

This prevents **training/serving skew**: the API uses exactly the same transformations used during training.

### Step 7 — Models

Two regression models are trained:

1. `LinearRegression`
2. `RandomForestRegressor`

The Random Forest uses a deliberately constrained configuration:

```text
n_estimators = 120
max_depth = 14
min_samples_leaf = 5
random_state = 42
```

The constraints keep the model artifact much smaller while maintaining strong performance.

---

## 4. Evaluation Metrics

The project uses:

### MAE — Mean Absolute Error

Average absolute difference between actual and predicted prices.

**Lower is better.**

### RMSE — Root Mean Squared Error

Penalizes large prediction errors more strongly than MAE.

**Lower is better.**

### R² — Coefficient of Determination

Measures how much variance in the target is explained by the model.

**Higher is better.**

---

## 5. Model Results

Results from the executed notebook:

| Model | MAE | RMSE | R² |
|---|---:|---:|---:|
| **Random Forest** | **$31,460** | **$46,842** | **0.7799** |
| Linear Regression | $45,199 | $61,864 | 0.6162 |

### Selected model

**RandomForestRegressor**

Why?

- Lowest MAE
- Lowest RMSE
- Highest R²
- Captures nonlinear relationships between income, location, housing characteristics, and price.

The final model explains approximately **78% of the variance** in the test target.

---

## 6. Project Architecture

```text
                    ┌─────────────────────┐
                    │  data/housing.csv   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Jupyter Notebook  │
                    │ EDA + Cleaning + ML │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Complete sklearn    │
                    │      Pipeline       │
                    └──────────┬──────────┘
                               │
                               ▼
              backend/models/house_price.pkl
                               │
                               ▼
                    ┌─────────────────────┐
                    │     FastAPI API     │
                    │   POST /predict     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ React + TypeScript  │
                    │      Frontend       │
                    └─────────────────────┘
```

---

## 7. Project Structure

```text
house-price-prediction/
│
├── data/
│   └── housing.csv
│
├── docs/
│   ├── eda_target_distribution.png
│   ├── eda_price_vs_rooms.png
│   ├── eda_price_by_location.png
│   ├── eda_price_by_age.png
│   ├── eda_correlation_heatmap.png
│   ├── eda_engineered_outliers.png
│   ├── model_comparison_r2.png
│   └── predicted_vs_actual.png
│
├── notebooks/
│   └── house_price_model.ipynb
│
├── backend/
│   ├── app/
│   │   ├── api/routes/prediction.py
│   │   ├── core/config.py
│   │   ├── schemas/prediction.py
│   │   ├── services/inference.py
│   │   ├── services/preprocessing.py
│   │   └── main.py
│   │
│   ├── models/
│   │   ├── house_price.pkl
│   │   └── locations.json
│   │
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.*
│
└── README.md
```

---

## 8. How to Run the Notebook

From the project root:

```bash
pip install -r backend/requirements.txt
pip install jupyter matplotlib seaborn nbconvert
```

Place the dataset at:

```text
data/housing.csv
```

Then start Jupyter:

```bash
jupyter notebook
```

Open:

```text
notebooks/house_price_model.ipynb
```

and use:

**Kernel → Restart & Run All**

The notebook generates/updates:

```text
backend/models/house_price.pkl
backend/models/locations.json
frontend/public/locations.json
docs/*.png
```

---

## 9. Run the FastAPI Backend

```bash
cd backend

python -m venv .venv
```

Activate the environment.

### Windows

```powershell
.venv\Scripts\activate
```

### Linux/macOS

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the server:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API:

```text
http://localhost:8000
```

Swagger documentation:

```text
http://localhost:8000/docs
```

---

## 10. API

### Health check

```http
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

### Prediction

```http
POST /predict
```

Example request:

```json
{
  "longitude": -122.23,
  "latitude": 37.88,
  "housing_median_age": 41,
  "total_rooms": 880,
  "total_bedrooms": 129,
  "population": 322,
  "households": 126,
  "median_income": 8.3252,
  "ocean_proximity": "NEAR BAY"
}
```

Example response:

```json
{
  "predicted_price": 407785.32
}
```

The exact result can vary if the model is retrained with different data or settings.

---

## 11. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The default Vite development server is:

```text
http://localhost:5173
```

The frontend sends prediction requests to the FastAPI backend.

---

## 12. Testing

Run:

```bash
cd backend
pytest -v
```

The test suite checks:

- Health endpoint
- Valid prediction request
- Invalid request validation
- Invalid numeric values

---

## 13. Important Design Decision: One Complete Pipeline

The exported model is not just the Random Forest.

It is a complete pipeline:

```text
Raw DataFrame
      ↓
Feature Engineering
      ↓
Missing-value Imputation
      ↓
Scaling
      ↓
One-Hot Encoding
      ↓
Random Forest
      ↓
Prediction
```

Therefore, the backend does **not** manually recreate preprocessing.

This is important because manually duplicating preprocessing in the API can cause the model to receive data in a different form from the data used during training.

---

## 14. Limitations

- The data represents the California housing market around 1990.
- Predictions should not be treated as current market valuations.
- The target represents a census block-group median, not an individual property.
- `ISLAND` is extremely rare in the dataset.
- Some important real-world factors are unavailable, such as property condition, exact lot size, renovation quality, and current market conditions.
- R² ≈ 0.78 means a significant portion of target variation remains unexplained.

---

## 15. Possible Improvements

Future versions could include:

- XGBoost / LightGBM
- Hyperparameter optimization
- Cross-validation
- Geospatial distance features
- Modern California housing data
- Prediction intervals
- Explainable AI with SHAP
- Model monitoring
- Docker Compose
- CI/CD
- Cloud deployment

---

## 16. Final Conclusion

The project demonstrates a complete production-oriented machine-learning workflow rather than only training a model.

The final Random Forest model achieves:

- **MAE:** $31,460
- **RMSE:** $46,842
- **R²:** 0.7799

The most important engineering feature is the use of a **single exported pipeline** containing feature engineering and preprocessing together with the trained estimator. This makes the model reusable by the FastAPI backend without duplicating transformation logic.
