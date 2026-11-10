// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppRoutes } from "../../AppRoutes";
import { json, mockApi, signedOut, testUser, tree } from "../../test/mockApi";

const renderApp = (path = "/") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );

const signedInRoutes = {
  "GET /api/me/": () => json(testUser),
};

const openModal = async () => {
  fireEvent.click(await screen.findByRole("button", { name: /create tree/i }));
  return screen.findByRole("dialog", { name: "Create Your Tree" });
};

const dialogButton = (name: string) =>
  within(screen.getByRole("dialog")).getByRole("button", { name });

describe("Landing screen", () => {
  beforeEach(() => {
    document.cookie = "csrftoken=test-token";
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows the landing intro without the inline form or tree preview", async () => {
    mockApi({ "GET /api/me/": signedOut });
    renderApp();

    expect(
      screen.getByRole("heading", { name: "Begin Your Family Tree" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: /sign in/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/name of tree/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText("Your tree is ready for its first family member."),
    ).not.toBeInTheDocument();
  });

  describe("signed out", () => {
    beforeEach(() => {
      mockApi({ "GET /api/me/": signedOut });
    });

    it("sends Create Tree to sign-in instead of opening the dialog", async () => {
      renderApp();
      fireEvent.click(screen.getByRole("button", { name: /create tree/i }));

      expect(
        await screen.findByRole("heading", { name: "Welcome to Roots" }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("sends View Tree to sign-in", async () => {
      renderApp();
      fireEvent.click(await screen.findByRole("link", { name: /view tree/i }));

      expect(
        await screen.findByRole("heading", { name: "Welcome to Roots" }),
      ).toBeInTheDocument();
    });
  });

  describe("signed in", () => {
    it("shows Sign Out instead of Sign In and signs out through the API", async () => {
      const fetchMock = mockApi({
        ...signedInRoutes,
        "POST /api/logout/": () => new Response(null, { status: 204 }),
      });
      renderApp();

      fireEvent.click(await screen.findByRole("button", { name: /sign out/i }));
      expect(
        await screen.findByRole("link", { name: /sign in/i }),
      ).toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/logout/",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("opens the dialog with the name field focused; Cancel closes it", async () => {
      mockApi(signedInRoutes);
      renderApp();
      await openModal();

      expect(screen.getByLabelText(/name of tree/i)).toHaveFocus();
      fireEvent.click(dialogButton("Cancel"));
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    });

    it("closes on Escape and on a backdrop click", async () => {
      mockApi(signedInRoutes);
      renderApp();

      await openModal();
      fireEvent.keyDown(document, { key: "Escape" });
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );

      const dialog = await openModal();
      const backdrop = dialog.parentElement as HTMLElement;
      fireEvent.mouseDown(backdrop);
      fireEvent.click(backdrop);
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    });

    it("blocks empty and whitespace-only names", async () => {
      const fetchMock = mockApi(signedInRoutes);
      renderApp();
      await openModal();

      fireEvent.click(dialogButton("Create Tree"));
      expect(
        screen.getByText("Give your tree a name to continue."),
      ).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText(/name of tree/i), {
        target: { value: "   " },
      });
      fireEvent.click(dialogButton("Create Tree"));
      expect(screen.getByLabelText(/name of tree/i)).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      expect(fetchMock).not.toHaveBeenCalledWith(
        "/api/trees/",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("creates the tree once and opens it", async () => {
      let respond: (value: Response) => void = () => {};
      const fetchMock = mockApi({
        ...signedInRoutes,
        "POST /api/trees/": () =>
          new Promise<Response>((resolve) => {
            respond = resolve;
          }),
        "GET /api/trees/": () => json([tree]),
        [`GET /api/trees/${tree.id}/members/`]: () => json([]),
        [`GET /api/trees/${tree.id}/relationships/`]: () => json([]),
      });
      renderApp();
      await openModal();

      fireEvent.change(screen.getByLabelText(/name of tree/i), {
        target: { value: "  Smith Family Tree  " },
      });
      const form = dialogButton("Create Tree").closest("form") as HTMLFormElement;
      fireEvent.submit(form);
      fireEvent.submit(form);

      await waitFor(() =>
        expect(
          fetchMock.mock.calls.filter(
            ([url, init]) => url === "/api/trees/" && init?.method === "POST",
          ),
        ).toHaveLength(1),
      );
      expect(dialogButton("Creating…")).toBeDisabled();
      const [, init] = fetchMock.mock.calls.find(
        ([url, call]) => url === "/api/trees/" && call?.method === "POST",
      ) as [string, RequestInit];
      expect(JSON.parse(init.body as string)).toEqual({
        name: "Smith Family Tree",
      });
      expect(init.headers).toMatchObject({ "X-CSRFToken": "test-token" });

      await act(async () => respond(json(tree, 201)));

      expect(
        await screen.findByRole("heading", { name: "Smith Family Tree" }),
      ).toBeInTheDocument();
    });

    it("asks the user to sign in again if the session expired", async () => {
      mockApi({
        ...signedInRoutes,
        "POST /api/trees/": signedOut,
      });
      renderApp();
      await openModal();

      fireEvent.change(screen.getByLabelText(/name of tree/i), {
        target: { value: "Smith Family Tree" },
      });
      fireEvent.click(dialogButton("Create Tree"));

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "You need to be signed in to create a tree.",
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
});
