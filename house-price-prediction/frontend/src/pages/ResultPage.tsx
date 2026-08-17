import { Link, useLocation, useNavigate } from "react-router-dom";
import type { PredictionRequest } from "../types/prediction";

interface ResultState {
  predictedPrice: number;
  inputs: PredictionRequest;
}

function formatIndianCurrencyStyleUsd(value: number): string {
  // The house price PDF spec asked for Indian-style currency formatting.
  // The underlying data here is in US dollars (California housing), so we
  // apply Indian digit grouping (lakh/crore style) to a "$" amount rather
  // than converting currencies, which would misrepresent the prediction.
  const [integerPart, decimalPart] = value.toFixed(2).split(".");
  const isNegative = integerPart.startsWith("-");
  const digits = isNegative ? integerPart.slice(1) : integerPart;

  let formatted: string;
  if (digits.length <= 3) {
    formatted = digits;
  } else {
    const lastThree = digits.slice(-3);
    const remaining = digits.slice(0, -3);
    const grouped = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    formatted = `${grouped},${lastThree}`;
  }

  return `${isNegative ? "-" : ""}$${formatted}.${decimalPart}`;
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultState | undefined;

  if (!state) {
    return (
      <div className="page">
        <div className="result-card">
          <h2>No prediction to show</h2>
          <p>Please fill out the form first to get a prediction.</p>
          <Link className="btn btn-primary" to="/">
            Go to prediction form
          </Link>
        </div>
      </div>
    );
  }

  const { predictedPrice, inputs } = state;

  return (
    <div className="page">
      <div className="result-card">
        <span className="result-label">Predicted Median House Value</span>
        <span className="result-price">{formatIndianCurrencyStyleUsd(predictedPrice)}</span>

        <div className="result-details">
          <h3>Inputs used</h3>
          <dl>
            <dt>Longitude</dt>
            <dd>{inputs.longitude}</dd>
            <dt>Latitude</dt>
            <dd>{inputs.latitude}</dd>
            <dt>Housing Median Age</dt>
            <dd>{inputs.housing_median_age} years</dd>
            <dt>Total Rooms</dt>
            <dd>{inputs.total_rooms}</dd>
            <dt>Total Bedrooms</dt>
            <dd>{inputs.total_bedrooms}</dd>
            <dt>Population</dt>
            <dd>{inputs.population}</dd>
            <dt>Households</dt>
            <dd>{inputs.households}</dd>
            <dt>Median Income</dt>
            <dd>{inputs.median_income} (x $10,000)</dd>
            <dt>Ocean Proximity</dt>
            <dd>{inputs.ocean_proximity}</dd>
          </dl>
        </div>

        <div className="form-actions">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Edit inputs
          </button>
          <Link className="btn btn-primary" to="/">
            New prediction
          </Link>
        </div>
      </div>
    </div>
  );
}
