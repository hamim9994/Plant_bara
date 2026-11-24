import type {
  DiseaseEntry,
  DiseaseListResponse,
  HealthResponse,
  ModelInfo,
  PredictResponse,
} from "./types";

const DEFAULT_BASE_URL = "https://plant-bara.onrender.com/";
const MIN_TOP_K = 1;
const MAX_TOP_K = 38;
const DEFAULT_TOP_K = 3;

// Read VITE_API_BASE_URL defensively so the client still compiles before the
// Vite environment declaration file is in place.
const configuredBaseUrl: unknown = (import.meta as ImportMeta & { env?: Record<string, unknown> })
  .env?.VITE_API_BASE_URL;

export const API_BASE_URL: string = (
  typeof configuredBaseUrl === "string" && configuredBaseUrl.trim()
    ? configuredBaseUrl.trim()
    : DEFAULT_BASE_URL
).replace(/\/+$/, "");

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    Object.setPrototypeOf(this, ApiRequestError.prototype);
  }
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: unknown }).name === "AbortError"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function messageFromPayload(
  payload: unknown,
  status: number,
  statusText: string,
): string {
  const fallback = statusText
    ? `Request failed (${status} ${statusText}).`
    : `Request failed (${status}).`;

  if (!isRecord(payload)) {
    return fallback;
  }

  const detail = payload.detail;
  if (typeof detail === "string" && detail.trim()) {
    return detail.trim();
  }

  // FastAPI validation errors arrive as an array of { loc, msg } objects.
  if (Array.isArray(detail)) {
    const messages = detail
      .map((entry) => {
        if (!isRecord(entry) || typeof entry.msg !== "string") {
          return null;
        }
        const location = Array.isArray(entry.loc)
          ? entry.loc.filter((part) => typeof part === "string" || typeof part === "number").join(".")
          : "";
        return location ? `${location}: ${entry.msg}` : entry.msg;
      })
      .filter((message): message is string => typeof message === "string" && message.length > 0);

    if (messages.length > 0) {
      return messages.join("; ");
    }
  }

  if (isRecord(detail) && typeof detail.message === "string" && detail.message.trim()) {
    return detail.message.trim();
  }

  return fallback;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  signal?: AbortSignal,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    throw new ApiRequestError(
      "Could not reach Plant BARA. Check your connection and try again.",
      0,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    throw new ApiRequestError(
      `The server returned an unreadable response (${response.status}).`,
      response.status,
    );
  }

  if (!response.ok) {
    throw new ApiRequestError(
      messageFromPayload(payload, response.status, response.statusText),
      response.status,
    );
  }

  return payload as T;
}

function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  return request<T>(path, { method: "GET" }, signal);
}

function clampTopK(topK: number): number {
  if (!Number.isFinite(topK)) {
    return DEFAULT_TOP_K;
  }
  return Math.min(MAX_TOP_K, Math.max(MIN_TOP_K, Math.trunc(topK)));
}

export const api = {
  getHealth(signal?: AbortSignal): Promise<HealthResponse> {
    return getJson<HealthResponse>("/api/v1/health", signal);
  },

  getModelInfo(signal?: AbortSignal): Promise<ModelInfo> {
    return getJson<ModelInfo>("/api/v1/model/info", signal);
  },

  getDiseases(signal?: AbortSignal): Promise<DiseaseListResponse> {
    return getJson<DiseaseListResponse>("/api/v1/diseases", signal);
  },

  getDisease(className: string, signal?: AbortSignal): Promise<DiseaseEntry> {
    return getJson<DiseaseEntry>(`/api/v1/diseases/${encodeURIComponent(className)}`, signal);
  },

  predict(file: File, topK: number = DEFAULT_TOP_K, signal?: AbortSignal): Promise<PredictResponse> {
    const body = new FormData();
    body.append("file", file);

    return request<PredictResponse>(
      `/api/v1/predict?top_k=${clampTopK(topK)}`,
      { method: "POST", body },
      signal,
    );
  },
};
