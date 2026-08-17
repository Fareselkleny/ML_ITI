import type { PredictionRequest, PredictionResponse } from "../types/prediction";

// Never hard-code the backend URL — always read it from the environment.
const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Calls POST /predict on the backend.
 * Throws ApiError with a user-friendly message on any failure
 * (network error, validation error, server error).
 */
export async function predictHousePrice(
  payload: PredictionRequest,
): Promise<PredictionResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ApiError(
      "Could not reach the prediction server. Please check your connection and that the backend is running.",
    );
  }

  if (!response.ok) {
    if (response.status === 422) {
      throw new ApiError(
        "The server rejected the submitted values. Please double-check the form and try again.",
        422,
      );
    }
    throw new ApiError(
      `Prediction failed (HTTP ${response.status}). Please try again shortly.`,
      response.status,
    );
  }

  return (await response.json()) as PredictionResponse;
}

/** Calls GET /health on the backend. Used for an optional connectivity check. */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
