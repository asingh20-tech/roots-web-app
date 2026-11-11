// Shared HTTP layer for the Django API.
//
// Every request goes through Vite's /api proxy (vite.config.ts), so it is
// same-origin and carries the Django `sessionid` cookie. Cookies are scoped to
// the host, not the port, so the session set by the Google popup on
// localhost:8000 is also sent from localhost:5173.

// Where Django itself is served; used for the OAuth popup and to verify the
// origin of its postMessage. Override with VITE_BACKEND_ORIGIN in production.
export const BACKEND_ORIGIN: string =
  import.meta.env.VITE_BACKEND_ORIGIN ?? "http://localhost:8000";

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, unknown>;

  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  // DRF answers a missing/expired session with 403 "Authentication
  // credentials were not provided." (SessionAuthentication). Other 403s are
  // real permission errors and must not send the user to sign in.
  get isUnauthenticated(): boolean {
    return (
      this.status === 401 ||
      (this.status === 403 &&
        /credentials were not provided|not authenticated/i.test(this.message))
    );
  }
}

const readCookie = (name: string): string | null => {
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
};

// Django rotates the CSRF token on login, so read the cookie on every write
// rather than caching it. GET /api/csrf/ sets it if it's missing.
const getCsrfToken = async (): Promise<string> => {
  const existing = readCookie("csrftoken");
  if (existing) return existing;
  await fetch("/api/csrf/", { credentials: "include" });
  return readCookie("csrftoken") ?? "";
};

const toApiError = async (response: Response): Promise<ApiError> => {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // Non-JSON error page; fall through with the status alone.
  }

  const fieldErrors: Record<string, unknown> = {};
  let detail = response.statusText || "Request failed";

  if (body && typeof body === "object" && !Array.isArray(body)) {
    for (const [key, value] of Object.entries(body)) {
      if (key === "detail" && typeof value === "string") detail = value;
      else fieldErrors[key] = value;
    }
  } else if (Array.isArray(body) && body.length) {
    detail = String(body[0]);
  }

  return new ApiError(response.status, detail, fieldErrors);
};

// First human-readable message in a DRF error body, however deeply nested
// (e.g. {"proposed_data": {"birth_date": ["Enter a valid date."]}}).
export const firstErrorMessage = (value: unknown): string | null => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const message = firstErrorMessage(item);
      if (message) return message;
    }
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      const message = firstErrorMessage(item);
      if (message) return message;
    }
  }
  return null;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  // A plain object is sent as JSON. FormData is sent as multipart and the
  // browser sets Content-Type (with the boundary) itself, so it must not be
  // forced to JSON here.
  body?: unknown;
  signal?: AbortSignal;
};

export const apiRequest = async <T>(
  path: string,
  { method = "GET", body, signal }: RequestOptions = {},
): Promise<T> => {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (method !== "GET") headers["X-CSRFToken"] = await getCsrfToken();
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";

  const response = await fetch(path, {
    method,
    credentials: "include",
    headers,
    body:
      body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    signal,
  });

  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
};
