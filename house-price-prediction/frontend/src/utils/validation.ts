import type { FormErrors, PredictionFormValues } from "../types/prediction";

// Mirrors the range constraints enforced server-side in
// backend/app/schemas/prediction.py, so the user gets instant feedback
// instead of waiting for a 422 from the API.
const RANGES: Record<
  Exclude<keyof PredictionFormValues, "ocean_proximity">,
  { min: number; max: number; label: string }
> = {
  longitude: { min: -125, max: -113, label: "Longitude" },
  latitude: { min: 32, max: 42.5, label: "Latitude" },
  housing_median_age: { min: 0, max: 100, label: "Housing median age" },
  total_rooms: { min: 0.01, max: Infinity, label: "Total rooms" },
  total_bedrooms: { min: 0.01, max: Infinity, label: "Total bedrooms" },
  population: { min: 0.01, max: Infinity, label: "Population" },
  households: { min: 0.01, max: Infinity, label: "Households" },
  median_income: { min: 0.01, max: 20, label: "Median income" },
};

export function validateForm(values: PredictionFormValues): FormErrors {
  const errors: FormErrors = {};

  for (const key of Object.keys(RANGES) as Array<keyof typeof RANGES>) {
    const raw = values[key];
    if (raw === undefined || raw.trim() === "") {
      errors[key] = `${RANGES[key].label} is required.`;
      continue;
    }
    const numeric = Number(raw);
    if (Number.isNaN(numeric)) {
      errors[key] = `${RANGES[key].label} must be a number.`;
      continue;
    }
    const { min, max } = RANGES[key];
    if (numeric < min || numeric > max) {
      const maxText = max === Infinity ? "" : ` and at most ${max}`;
      errors[key] = `${RANGES[key].label} must be at least ${min}${maxText}.`;
    }
  }

  if (!values.ocean_proximity || values.ocean_proximity.trim() === "") {
    errors.ocean_proximity = "Ocean proximity is required.";
  }

  return errors;
}

export function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}
