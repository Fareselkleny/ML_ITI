import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, predictHousePrice } from "../api/predictionClient";
import type {
  FormErrors,
  LocationsFile,
  PredictionFormValues,
  PredictionRequest,
} from "../types/prediction";
import { hasErrors, validateForm } from "../utils/validation";

const EMPTY_FORM: PredictionFormValues = {
  longitude: "",
  latitude: "",
  housing_median_age: "",
  total_rooms: "",
  total_bedrooms: "",
  population: "",
  households: "",
  median_income: "",
  ocean_proximity: "",
};

// A realistic prefilled example (a real row from the training data) so the
// form isn't intimidating on first load. Users can change any value.
const EXAMPLE_VALUES: PredictionFormValues = {
  longitude: "-122.23",
  latitude: "37.88",
  housing_median_age: "41",
  total_rooms: "880",
  total_bedrooms: "129",
  population: "322",
  households: "126",
  median_income: "8.3252",
  ocean_proximity: "NEAR BAY",
};

const NUMERIC_FIELDS: Array<{
  name: keyof Omit<PredictionFormValues, "ocean_proximity">;
  label: string;
  step: string;
  hint: string;
}> = [
  { name: "longitude", label: "Longitude", step: "0.01", hint: "California range: -125 to -113" },
  { name: "latitude", label: "Latitude", step: "0.01", hint: "California range: 32 to 42.5" },
  { name: "housing_median_age", label: "Housing Median Age (years)", step: "1", hint: "Median age of houses in the area" },
  { name: "total_rooms", label: "Total Rooms", step: "1", hint: "Total rooms across the neighborhood block" },
  { name: "total_bedrooms", label: "Total Bedrooms", step: "1", hint: "Total bedrooms across the neighborhood block" },
  { name: "population", label: "Population", step: "1", hint: "Population of the neighborhood block" },
  { name: "households", label: "Households", step: "1", hint: "Number of households in the block" },
  { name: "median_income", label: "Median Income (10,000s USD)", step: "0.01", hint: "e.g. 8.3252 means $83,252" },
];

export default function PredictionForm() {
  const navigate = useNavigate();

  const [values, setValues] = useState<PredictionFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [locations, setLocations] = useState<LocationsFile | null>(null);
  const [locationsError, setLocationsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Populate the location dropdown from locations.json (exported by the
  // training notebook) instead of hard-coding options in the component.
  useEffect(() => {
    fetch("/locations.json")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load locations.json (HTTP ${res.status})`);
        return res.json();
      })
      .then((data: LocationsFile) => setLocations(data))
      .catch(() => setLocationsError("Could not load location options. Please refresh the page."));
  }, []);

  function handleChange(field: keyof PredictionFormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function fillExample() {
    setValues(EXAMPLE_VALUES);
    setErrors({});
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    const validationErrors = validateForm(values);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) {
      return;
    }

    const payload: PredictionRequest = {
      longitude: Number(values.longitude),
      latitude: Number(values.latitude),
      housing_median_age: Number(values.housing_median_age),
      total_rooms: Number(values.total_rooms),
      total_bedrooms: Number(values.total_bedrooms),
      population: Number(values.population),
      households: Number(values.households),
      median_income: Number(values.median_income),
      ocean_proximity: values.ocean_proximity as PredictionRequest["ocean_proximity"],
    };

    setSubmitting(true);
    try {
      const result = await predictHousePrice(payload);
      navigate("/result", { state: { predictedPrice: result.predicted_price, inputs: payload } });
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Something went wrong while predicting the price. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="prediction-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        {NUMERIC_FIELDS.map((field) => (
          <div className="form-field" key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>
            <input
              id={field.name}
              name={field.name}
              type="number"
              step={field.step}
              value={values[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              aria-invalid={Boolean(errors[field.name])}
              aria-describedby={`${field.name}-hint`}
            />
            <span className="field-hint" id={`${field.name}-hint`}>{field.hint}</span>
            {errors[field.name] && <span className="field-error">{errors[field.name]}</span>}
          </div>
        ))}

        <div className="form-field">
          <label htmlFor="ocean_proximity">{locations?.label ?? "Ocean Proximity"}</label>
          <select
            id="ocean_proximity"
            name="ocean_proximity"
            value={values.ocean_proximity}
            onChange={(e) => handleChange("ocean_proximity", e.target.value)}
            aria-invalid={Boolean(errors.ocean_proximity)}
            disabled={!locations}
          >
            <option value="" disabled>
              {locations ? "Select an option" : "Loading options..."}
            </option>
            {locations?.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="field-hint">How close the block group is to the ocean/bay</span>
          {errors.ocean_proximity && <span className="field-error">{errors.ocean_proximity}</span>}
          {locationsError && <span className="field-error">{locationsError}</span>}
        </div>
      </div>

      {submitError && <div className="form-banner form-banner-error">{submitError}</div>}

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={fillExample} disabled={submitting}>
          Fill Example
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting || !locations}>
          {submitting ? "Predicting..." : "Predict Price"}
        </button>
      </div>
    </form>
  );
}
