import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";

import { clearAccessToken, getAccessToken } from "@/lib/access-token";
import type { Page } from "@/types";

const FALLBACK_BASE_URL = "http://localhost:5000/api/v1";

/**
 * Data requests go directly to the Express API (the live server in
 * production) and authenticate with the JWT bearer token.
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL?.trim() || FALLBACK_BASE_URL
).replace(/\/+$/, "");

/**
 * The session-to-JWT exchange needs the Better Auth session cookie, which is
 * first-party on this origin, so it goes through the same-origin proxy
 * (next.config.ts rewrites) to the same server.
 */
const TOKEN_BASE_URL = "/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20_000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

export class ApiError extends Error {
  readonly status: number | null;
  readonly code?: string;
  readonly details?: unknown;

  constructor(
    message: string,
    options: {
      status?: number | null;
      code?: string;
      details?: unknown;
      cause?: unknown;
    } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status ?? null;
    this.code = options.code;
    this.details = options.details;

    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function extractMessage(payload: unknown, depth = 0): string | null {
  if (depth > 3 || payload === null || payload === undefined) {
    return null;
  }

  const record = asRecord(payload);
  const direct = record.message ?? record.error ?? record.detail;

  if (typeof direct === "string" && direct.trim()) {
    return direct.trim();
  }

  if (Array.isArray(record.errors) && record.errors.length > 0) {
    const first = asRecord(record.errors[0]);
    const message = first.message ?? first.msg ?? record.errors[0];
    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
  }

  if (record.data !== undefined) {
    return extractMessage(record.data, depth + 1);
  }

  return null;
}

function defaultStatusMessage(status: number | null): string | null {
  switch (status) {
    case 400:
      return "The request could not be processed. Please check the form and try again.";
    case 401:
      return "Your session has expired. Please sign in again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "We could not find what you were looking for.";
    case 409:
      return "That action conflicts with the current state. Please refresh and try again.";
    case 422:
      return "Some of the submitted information is invalid. Please review it and try again.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    default:
      return status && status >= 500
        ? "The server could not complete the request. Please try again shortly."
        : null;
  }
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? null;
    const details = error.response?.data;
    const record = asRecord(details);
    const code =
      typeof record.code === "string" ? record.code : undefined;

    if (!error.response) {
      return new ApiError(
        "We could not reach the server. Check your connection and try again.",
        { status, code, details, cause: error },
      );
    }

    const message =
      extractMessage(details) ??
      defaultStatusMessage(status) ??
      "Something went wrong. Please try again.";

    return new ApiError(message, { status, code, details, cause: error });
  }

  if (error instanceof Error) {
    return new ApiError(error.message, { cause: error });
  }

  return new ApiError("Something went wrong. Please try again.", {
    cause: error,
  });
}

type RetriableConfig = InternalAxiosRequestConfig & { _jwtRetried?: boolean };

// Attach the JWT access token to every request when the user is signed in.
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken(TOKEN_BASE_URL);
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    // Missing/expired token: fetch a fresh one once and replay the request.
    if (axios.isAxiosError(error) && error.response?.status === 401 && error.config) {
      const config = error.config as RetriableConfig;
      if (!config._jwtRetried && !String(config.url ?? "").endsWith("/auth/token")) {
        config._jwtRetried = true;
        clearAccessToken();
        const token = await getAccessToken(TOKEN_BASE_URL, true);
        if (token) {
          config.headers.set("Authorization", `Bearer ${token}`);
          try {
            return await api.request(config);
          } catch (retryError) {
            return Promise.reject(toApiError(retryError));
          }
        }
      }
    }

    return Promise.reject(toApiError(error));
  },
);

/**
 * Unwraps common API envelopes such as `{ data: ... }` or `{ result: ... }`.
 * Prefer `apiGetRaw` when pagination metadata must be preserved.
 */
export function unwrap<T>(payload: unknown): T {
  if (payload === null || payload === undefined) {
    return payload as T;
  }

  if (typeof payload !== "object") {
    return payload as T;
  }

  const record = payload as Record<string, unknown>;

  if ("data" in record) {
    const data = record.data;
    if (data !== null && typeof data === "object" && !Array.isArray(data)) {
      const nested = data as Record<string, unknown>;
      if ("data" in nested && Object.keys(nested).length === 1) {
        return nested.data as T;
      }
    }
    return data as T;
  }

  if ("result" in record) {
    return record.result as T;
  }

  return payload as T;
}

export function buildParams(
  input: Record<string, unknown>,
): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      params[key] = value;
    }
  }

  return params;
}

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.get(url, config);
  return unwrap<T>(response.data);
}

export async function apiGetRaw(
  url: string,
  config?: AxiosRequestConfig,
): Promise<unknown> {
  const response = await api.get(url, config);
  return response.data;
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.post(url, body, config);
  return unwrap<T>(response.data);
}

export async function apiPatch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.patch(url, body, config);
  return unwrap<T>(response.data);
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.delete(url, config);
  return unwrap<T>(response.data);
}

function toNumber(value: unknown, fallback: number): number {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(numeric) ? numeric : fallback;
}

const ITEM_KEYS = [
  "items",
  "results",
  "docs",
  "data",
  "tuitions",
  "users",
  "applications",
  "bookmarks",
  "transactions",
] as const;

/**
 * Normalises a variety of list response shapes into a single page object.
 */
export function toPage<T>(
  payload: unknown,
  mapItem: (raw: unknown) => T,
): Page<T> {
  if (Array.isArray(payload)) {
    return {
      items: payload.map(mapItem),
      page: 1,
      limit: payload.length,
      total: payload.length,
      totalPages: 1,
      hasNextPage: false,
    };
  }

  const root = asRecord(payload);
  const data = root.data;
  const container =
    data !== null && typeof data === "object" && !Array.isArray(data)
      ? asRecord(data)
      : root;

  let rawItems: unknown[] = [];

  for (const key of ITEM_KEYS) {
    const candidate = container[key];
    if (Array.isArray(candidate)) {
      rawItems = candidate;
      break;
    }

    const rootCandidate = root[key];
    if (Array.isArray(rootCandidate)) {
      rawItems = rootCandidate;
      break;
    }
  }

  if (rawItems.length === 0 && Array.isArray(data)) {
    rawItems = data;
  }

  const meta = asRecord(
    container.meta ??
      container.pagination ??
      container.pageInfo ??
      root.meta ??
      root.pagination ??
      root.pageInfo,
  );

  const page = toNumber(
    meta.page ?? meta.currentPage ?? root.page,
    1,
  );
  const limit = toNumber(
    meta.limit ?? meta.perPage ?? meta.pageSize ?? root.limit,
    rawItems.length || 10,
  );
  const total = toNumber(
    meta.total ?? meta.totalItems ?? meta.count ?? root.total,
    rawItems.length,
  );
  const computedTotalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  const totalPages = toNumber(
    meta.totalPages ?? meta.pages ?? meta.pageCount,
    computedTotalPages,
  );

  return {
    items: rawItems.map(mapItem),
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
  };
}

export function toItems<T>(
  payload: unknown,
  mapItem: (raw: unknown) => T,
): T[] {
  return toPage(payload, mapItem).items;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
