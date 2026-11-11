// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppRoutes } from "../../AppRoutes";
import { AuthRedirectState } from "../../auth/AuthProvider";
import { json, mockApi, signedOut, testUser } from "../../test/mockApi";

const renderSignIn = (state?: AuthRedirectState) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: "/sign-in", state }]}>
      <AppRoutes />
    </MemoryRouter>,
  );

// Django's /accounts/popup-complete/ page posts this to window.opener.
const postLoginSuccess = (source: Window, origin = "http://localhost:8000") =>
  act(async () => {
    window.dispatchEvent(
      new MessageEvent("message", {
        origin,
        source,
        data: { type: "GOOGLE_LOGIN_SUCCESS" },
      }),
    );
  });

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Sign-in screen (Google OAuth popup)", () => {
  it("opens Django's Google login URL in a popup", async () => {
    mockApi({ "GET /api/me/": signedOut });
    const open = vi.spyOn(window, "open").mockReturnValue(window);
    renderSignIn();

    fireEvent.click(
      await screen.findByRole("button", { name: "Continue with Google" }),
    );

    expect(open).toHaveBeenCalledWith(
      "http://localhost:8000/accounts/google/login/",
      "GoogleLogin",
      expect.stringContaining("width=500,height=650"),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Finish signing in with Google",
    );
    expect(
      screen.queryByRole("button", { name: "Continue with Apple" }),
    ).not.toBeInTheDocument();
  });

  it("ignores login messages from other origins", async () => {
    let signedIn = false;
    const fetchMock = mockApi({
      "GET /api/me/": () => (signedIn ? json(testUser) : signedOut()),
    });
    vi.spyOn(window, "open").mockReturnValue(window);
    renderSignIn();
    fireEvent.click(
      await screen.findByRole("button", { name: "Continue with Google" }),
    );

    signedIn = true;
    await postLoginSuccess(window, "https://evil.example");

    // Only the initial session check; the forged message didn't trigger one.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("heading", { name: "Welcome to Roots" }),
    ).toBeInTheDocument();
  });

  it("verifies the session, then resumes Create Tree on the landing page", async () => {
    let signedIn = false;
    mockApi({
      "GET /api/me/": () => (signedIn ? json(testUser) : signedOut()),
    });
    vi.spyOn(window, "open").mockReturnValue(window);
    renderSignIn({ from: "/", intent: "create-tree" });

    fireEvent.click(
      await screen.findByRole("button", { name: "Continue with Google" }),
    );
    signedIn = true;
    await postLoginSuccess(window);

    expect(
      await screen.findByRole("dialog", { name: "Create Your Tree" }),
    ).toBeInTheDocument();
  });

  it("returns to the protected page the user asked for", async () => {
    let signedIn = false;
    mockApi({
      "GET /api/me/": () => (signedIn ? json(testUser) : signedOut()),
      "GET /api/trees/": () => json([]),
    });
    vi.spyOn(window, "open").mockReturnValue(window);
    renderSignIn({ from: "/my-trees" });

    fireEvent.click(
      await screen.findByRole("button", { name: "Continue with Google" }),
    );
    signedIn = true;
    await postLoginSuccess(window);

    expect(
      await screen.findByText("You don't have any family trees yet"),
    ).toBeInTheDocument();
  });

  // Django sends Cross-Origin-Opener-Policy: same-origin, so in a real
  // browser the popup usually can't post back. The session check must still
  // complete sign-in.
  it("completes sign-in without postMessage when the window regains focus", async () => {
    let signedIn = false;
    mockApi({
      "GET /api/me/": () => (signedIn ? json(testUser) : signedOut()),
    });
    vi.spyOn(window, "open").mockReturnValue(window);
    renderSignIn({ from: "/", intent: "create-tree" });

    fireEvent.click(
      await screen.findByRole("button", { name: "Continue with Google" }),
    );
    signedIn = true; // Google callback set the session cookie
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
    });

    expect(
      await screen.findByRole("dialog", { name: "Create Your Tree" }),
    ).toBeInTheDocument();
  });

  it("completes sign-in by polling the session while the popup is open", async () => {
    let signedIn = false;
    mockApi({
      "GET /api/me/": () => (signedIn ? json(testUser) : signedOut()),
    });
    vi.spyOn(window, "open").mockReturnValue(window);
    renderSignIn({ from: "/" });

    fireEvent.click(
      await screen.findByRole("button", { name: "Continue with Google" }),
    );
    signedIn = true;

    expect(
      await screen.findByRole(
        "heading",
        { name: "Begin Your Family Tree" },
        { timeout: 4000 },
      ),
    ).toBeInTheDocument();
  });

  it("shows an error if Django doesn't confirm the session", async () => {
    mockApi({ "GET /api/me/": signedOut });
    vi.spyOn(window, "open").mockReturnValue(window);
    renderSignIn();

    fireEvent.click(
      await screen.findByRole("button", { name: "Continue with Google" }),
    );
    await postLoginSuccess(window);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't verify your sign-in.",
    );
  });

  it("tells the user when the popup is blocked", async () => {
    mockApi({ "GET /api/me/": signedOut });
    vi.spyOn(window, "open").mockReturnValue(null);
    renderSignIn();

    fireEvent.click(
      await screen.findByRole("button", { name: "Continue with Google" }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent("allow pop-ups");
  });

  it("skips sign-in entirely when the session is already valid", async () => {
    mockApi({ "GET /api/me/": () => json(testUser) });
    const open = vi.spyOn(window, "open");
    renderSignIn({ from: "/" });

    expect(
      await screen.findByRole("heading", { name: "Begin Your Family Tree" }),
    ).toBeInTheDocument();
    expect(open).not.toHaveBeenCalled();
  });

  it("never redirects to another origin from router state", async () => {
    mockApi({ "GET /api/me/": () => json(testUser) });
    renderSignIn({ from: "//evil.example/steal" });

    expect(
      await screen.findByRole("heading", { name: "Begin Your Family Tree" }),
    ).toBeInTheDocument();
  });
});
