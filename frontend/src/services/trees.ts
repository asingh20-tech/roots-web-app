// Family tree API (backend: trees/views.py → FamilyTreeListCreateView).
// Requests go through Vite's /api proxy and use the Django session cookie.

export type FamilyTree = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  is_owner: boolean;
};

export type CreateTreeInput = {
  name: string;
  description?: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string[]>;

  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const readCookie = (name: string): string | null => {
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
};

// Django needs the csrftoken cookie echoed back as X-CSRFToken on writes.
// GET /api/csrf/ sets the cookie if this browser doesn't have one yet.
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

  const fieldErrors: Record<string, string[]> = {};
  let detail = response.statusText || "Request failed";

  if (body && typeof body === "object") {
    for (const [key, value] of Object.entries(body)) {
      if (key === "detail" && typeof value === "string") {
        detail = value;
      } else if (Array.isArray(value)) {
        fieldErrors[key] = value.map(String);
      }
    }
  }

  return new ApiError(response.status, detail, fieldErrors);
};

export const createTree = async ({
  name,
  description,
}: CreateTreeInput): Promise<FamilyTree> => {
  const csrfToken = await getCsrfToken();
  const payload: CreateTreeInput = { name };
  if (description) payload.description = description;

  const response = await fetch("/api/trees/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw await toApiError(response);
  return (await response.json()) as FamilyTree;
};
