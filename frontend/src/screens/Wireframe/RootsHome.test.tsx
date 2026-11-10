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
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RootsHome } from "./RootsHome";

const renderHome = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<RootsHome />} />
        <Route path="/family-tree" element={<p>Family tree screen</p>} />
      </Routes>
    </MemoryRouter>,
  );

const openModal = () => {
  fireEvent.click(screen.getByRole("button", { name: /create tree/i }));
  return screen.getByRole("dialog", { name: "Create Your Tree" });
};

describe("RootsHome landing page", () => {
  beforeEach(() => {
    document.cookie = "csrftoken=test-token";
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows the landing intro without the inline form or tree preview", () => {
    renderHome();

    expect(
      screen.getByRole("heading", { name: "Begin Your Family Tree" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/name of tree/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText("Your tree is ready for its first family member."),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Family tree preview")).not.toBeInTheDocument();
  });

  it("navigates to /family-tree from View Tree", () => {
    renderHome();
    fireEvent.click(screen.getByRole("link", { name: /view tree/i }));
    expect(screen.getByText("Family tree screen")).toBeInTheDocument();
  });

  it("opens the dialog with the name field focused and closes on Cancel", async () => {
    renderHome();
    openModal();

    expect(screen.getByLabelText(/name of tree/i)).toHaveFocus();
    expect(screen.getByLabelText(/tree description/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("closes on Escape and on a backdrop click", async () => {
    renderHome();
    openModal();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );

    const dialog = openModal();
    const backdrop = dialog.parentElement as HTMLElement;
    fireEvent.mouseDown(backdrop);
    fireEvent.click(backdrop);
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("blocks empty and whitespace-only names", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderHome();
    openModal();

    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Create Tree" }));
    expect(
      screen.getByText("Give your tree a name to continue."),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/name of tree/i), {
      target: { value: "   " },
    });
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Create Tree" }));
    expect(screen.getByLabelText(/name of tree/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("creates the tree once, even when submitted twice", async () => {
    let resolveResponse: (value: Response) => void = () => {};
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveResponse = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    renderHome();
    openModal();

    fireEvent.change(screen.getByLabelText(/name of tree/i), {
      target: { value: "  Smith Family Tree  " },
    });
    const submit = within(screen.getByRole("dialog")).getByRole("button", { name: "Create Tree" });
    const form = submit.closest("form") as HTMLFormElement;
    fireEvent.submit(form);
    fireEvent.submit(form);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("button", { name: "Creating…" })).toBeDisabled();

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("/api/trees/");
    expect(JSON.parse(init.body as string)).toEqual({
      name: "Smith Family Tree",
    });

    await act(async () => {
      resolveResponse(
        new Response(
          JSON.stringify({
            id: 1,
            name: "Smith Family Tree",
            description: null,
            created_at: "2026-11-10T00:00:00Z",
            is_owner: true,
          }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        ),
      );
    });

    await waitFor(() =>
      expect(screen.getByText("Family tree screen")).toBeInTheDocument(),
    );
  });

  it("asks the user to sign in when the API rejects the session", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            detail: "Authentication credentials were not provided.",
          }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    renderHome();
    openModal();

    fireEvent.change(screen.getByLabelText(/name of tree/i), {
      target: { value: "Smith Family Tree" },
    });
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Create Tree" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You need to be signed in to create a tree.",
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
