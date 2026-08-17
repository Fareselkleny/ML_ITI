// Allowed categorical values for ocean_proximity. Mirrors the backend's
// PredictionRequest schema (backend/app/schemas/prediction.py) and the
// options exported by the training notebook into locations.json.
export type OceanProximity =
  | "<1H OCEAN"
  | "INLAND"
  | "ISLAND"
  | "NEAR BAY"
  | "NEAR OCEAN";

export interface PredictionRequest {
  longitude: number;
  latitude: number;
  housing_median_age: number;
  total_rooms: number;
  total_bedrooms: number;
  population: number;
  households: number;
  median_income: number;
  ocean_proximity: OceanProximity;
}

export interface PredictionResponse {
  predicted_price: number;
}

export interface LocationsFile {
  field: string;
  label: string;
  options: OceanProximity[];
}

// Raw string values held by the controlled form inputs before validation
// and numeric conversion.
export type PredictionFormValues = {
  [K in keyof PredictionRequest]: string;
};

export interface FormErrors {
  [field: string]: string;
}
