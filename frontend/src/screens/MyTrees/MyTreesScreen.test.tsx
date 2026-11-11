// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppRoutes } from "../../AppRoutes";
import type { FamilyTree } from "../../services/trees";
import { fakeTreeApi, makeMember } from "../../test/fakeTreeApi";
import { json, mockApi, testUser } from "../../test/mockApi";

const owned: FamilyTree = {
  id: 11,
  name: "Aditya Family",
  description: "Our family's history",
  created_at: "2026-11-01T00:00:00Z",
  is_owner: true,
  member_count: 0,
};
const joined: FamilyTree = {
  id: 22,
  name: "Other Family",
  description: null,
  created_at: "2026-10-01T00:00:00Z",
  is_owner: false,
  member_count: 0,
};

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );

beforeEach(() => {
  document.cookie = "csrftoken=test-token";
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("My Trees dashboard", () => {
  it("lists every accessible tree with role, member count and date", async () => {
    fakeTreeApi({
      trees: [owned, joined],
      members: {
        22: Array.from({ length: 12 }, (_, i) => makeMember(i + 1, `P${i}`, "Other")),
      },
    });
    renderAt("/my-trees");

    expect(await screen.findByRole("heading", { name: "My Family Trees" })).toBeInTheDocument();
    expect(screen.getByText("Explore the family trees you've created or joined.")).toBeInTheDocument();

    const aditya = await screen.findByRole("link", { name: "Open Aditya Family" });
    expect(aditya).toHaveAttribute("href", "/family-tree/11");
    expect(within(aditya).getByText("Tree Owner")).toBeInTheDocument();
    expect(within(aditya).getByText("Our family's history")).toBeInTheDocument();
    expect(within(aditya).getByText(/0 family members/)).toBeInTheDocument();

    const other = screen.getByRole("link", { name: "Open Other Family" });
    expect(within(other).getByText("Collaborator")).toBeInTheDocument();
    expect(within(other).getByText(/12 family members/)).toBeInTheDocument();
    expect(within(other).getByText(/Created/)).toBeInTheDocument();
  });

  it("opens the tree that was clicked", async () => {
    fakeTreeApi({ trees: [owned, joined] });
    renderAt("/my-trees");
    fireEvent.click(await screen.findByRole("link", { name: "Open Other Family" }));
    expect(await screen.findByRole("heading", { name: "Other Family" })).toBeInTheDocument();
  });

  it("shows an empty state that invites the user to create or join", async () => {
    fakeTreeApi({ trees: [] });
    renderAt("/my-trees");
    expect(await screen.findByText("You don't have any family trees yet")).toBeInTheDocument();
    expect(screen.getByText(/invitation link/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Tree" })).toBeInTheDocument();
  });

  it("creates a tree from the dashboard and opens it; it then appears in My Trees", async () => {
    const api = fakeTreeApi({ trees: [owned] });
    renderAt("/my-trees");
    fireEvent.click(await screen.findByRole("button", { name: "Create Tree" }));
    const modal = await screen.findByRole("dialog", { name: "Create Your Tree" });
    fireEvent.change(within(modal).getByLabelText(/name of tree/i), {
      target: { value: "Lane Family" },
    });
    fireEvent.click(within(modal).getByRole("button", { name: "Create Tree" }));

    expect(await screen.findByRole("heading", { name: "Lane Family" })).toBeInTheDocument();
    const newId = api.db.trees[0].id;
    expect(api.writes()).toEqual([
      { method: "POST", url: "/api/trees/", body: { name: "Lane Family" } },
    ]);

    fireEvent.click(screen.getByRole("link", { name: /back to my trees/i }));
    expect(await screen.findByRole("link", { name: "Open Lane Family" })).toHaveAttribute(
      "href",
      `/family-tree/${newId}`,
    );
  });

  it("shows an error with a working retry", async () => {
    let fail = true;
    mockApi({
      "GET /api/me/": () => json(testUser),
      "GET /api/trees/": () => (fail ? json({ detail: "boom" }, 500) : json([owned])),
    });
    renderAt("/my-trees");
    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn't load your family trees.");
    fail = false;
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("link", { name: "Open Aditya Family" })).toBeInTheDocument();
  });

  it("Back to Home returns to the landing page", async () => {
    fakeTreeApi({ trees: [owned] });
    renderAt("/my-trees");
    fireEvent.click(await screen.findByRole("link", { name: /back to home/i }));
    expect(await screen.findByRole("heading", { name: "Begin Your Family Tree" })).toBeInTheDocument();
  });

  it("requires sign-in", async () => {
    fakeTreeApi({ signedIn: false, trees: [owned] });
    renderAt("/my-trees");
    expect(await screen.findByRole("heading", { name: "Welcome to Roots" })).toBeInTheDocument();
  });
});

describe("Invitation link", () => {
  it("lets a signed-in user join a tree as a Collaborator", async () => {
    const fetchMock = mockApi({
      "GET /api/me/": () => json(testUser),
      "GET /api/invite/tok123/": () => json({ tree_id: 22, tree_name: "Other Family", already_member: false }),
      "POST /api/invite/tok123/": () => json({ tree_id: 22, role: "collaborator" }, 201),
      "GET /api/trees/22/": () => json(joined),
      "GET /api/trees/22/members/": () => json([]),
      "GET /api/trees/22/relationships/": () => json([]),
    });
    renderAt("/invite/tok123");
    expect(await screen.findByRole("heading", { name: "Join Other Family?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Join Tree" }));
    expect(await screen.findByRole("heading", { name: "Other Family" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/invite/tok123/", expect.objectContaining({ method: "POST" }));
  });

  it("explains an expired or revoked link", async () => {
    mockApi({
      "GET /api/me/": () => json(testUser),
      "GET /api/invite/bad/": () => json({ detail: "This invitation link is invalid, expired, or revoked." }, 404),
    });
    renderAt("/invite/bad");
    expect(await screen.findByRole("alert")).toHaveTextContent("invalid, expired, or revoked");
  });
});
