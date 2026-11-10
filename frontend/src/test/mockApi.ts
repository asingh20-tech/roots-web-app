// Test helper: stubs global fetch with a "METHOD /path" → handler table.
// Unmatched requests fail loudly so a test can't silently hit a real server.
import { vi } from "vitest";

type Handler = (init?: RequestInit) => Response | Promise<Response>;

export const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const signedOut = (): Response =>
  json({ detail: "Authentication credentials were not provided." }, 403);

export const testUser = {
  id: 7,
  email: "member@example.com",
  first_name: "Test",
  last_name: "User",
};

export const mockApi = (routes: Record<string, Handler>) => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    const key = `${init?.method ?? "GET"} ${url}`;
    const handler = routes[key];
    if (!handler) throw new Error(`Unmocked request: ${key}`);
    return handler(init);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

export const tree = {
  id: 11,
  name: "Smith Family Tree",
  description: null,
  created_at: "2026-11-10T00:00:00Z",
  is_owner: true,
};
