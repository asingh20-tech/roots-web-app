// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import {
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

const member = (id: number, first: string, last: string, birth: string | null) => ({
  id,
  first_name: first,
  last_name: last,
  full_name: `${first} ${last}`,
  gender: "UNKNOWN",
  birth_date: birth,
  death_date: null,
  photo_url: null,
  version: 1,
  updated_at: "2026-11-10T00:00:00Z",
});

const members = [
  member(1, "Ada", "Lane", "1940-02-01"),
  member(2, "Ben", "Lane", "1938-07-09"),
  member(3, "Cy", "Lane", "1970-03-03"),
];
const relationships = [
  { id: 1, member1: 1, member2: 2, relationship_type: "SPOUSE", start_date: null, created_at: "" },
  { id: 2, member1: 1, member2: 3, relationship_type: "PARENT", start_date: null, created_at: "" },
];

const treeRoutes = (trees = [tree]) => ({
  "GET /api/me/": () => json(testUser),
  "GET /api/trees/": () => json(trees),
  [`GET /api/trees/${tree.id}/members/`]: () => json(members),
  [`GET /api/trees/${tree.id}/relationships/`]: () => json(relationships),
});

const renderTree = (path = "/family-tree") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );

describe("Family tree screen", () => {
  beforeEach(() => {
    document.cookie = "csrftoken=test-token";
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("redirects to sign-in without a session", async () => {
    mockApi({ "GET /api/me/": signedOut });
    renderTree();
    expect(
      await screen.findByRole("heading", { name: "Welcome to Roots" }),
    ).toBeInTheDocument();
  });

  it("renders the tree, members and relationships from the API", async () => {
    mockApi(treeRoutes());
    renderTree(`/family-tree?tree=${tree.id}`);

    expect(
      await screen.findByRole("heading", { name: "Smith Family Tree" }),
    ).toBeInTheDocument();
    expect(screen.getByText("3 people")).toBeInTheDocument();
    for (const name of ["Ada Lane", "Ben Lane", "Cy Lane"]) {
      expect(
        screen.getByRole("button", { name: `View details for ${name}` }),
      ).toBeInTheDocument();
    }
    expect(screen.getByText("Born 1940")).toBeInTheDocument();
    // No leftover Figma sample data.
    expect(screen.queryByText(/Bennett|Walker|Yorkshire/)).not.toBeInTheDocument();
  });

  it("zooms the canvas for real", async () => {
    mockApi(treeRoutes());
    renderTree();
    await screen.findByRole("heading", { name: "Smith Family Tree" });

    const card = screen.getByRole("button", { name: "View details for Ada Lane" });
    const scaled = card.parentElement as HTMLElement;
    expect(scaled.style.transform).toBe("scale(1)");

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(scaled.style.transform).toBe("scale(1.25)");
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(scaled.style.transform).toBe("scale(1)");
  });

  it("shows a create prompt when the user has no trees", async () => {
    mockApi(treeRoutes([]));
    renderTree();
    expect(
      await screen.findByText("You don't have a family tree yet"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create Tree" })).toBeInTheDocument();
  });

  it("says so when ?tree= points at a tree the user can't see", async () => {
    mockApi(treeRoutes());
    renderTree("/family-tree?tree=999");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "doesn't exist or you don't have access",
    );
  });

  it("opens member details with documents from the API", async () => {
    mockApi({
      ...treeRoutes(),
      [`GET /api/trees/${tree.id}/members/1/`]: () =>
        json({
          ...members[0],
          documents: [
            {
              id: 5,
              name: "birth-certificate.pdf",
              url: `/api/trees/${tree.id}/members/1/documents/5/file/`,
              file_type: "pdf",
              file_size: 204800,
              uploaded_at: "2026-11-01T00:00:00Z",
            },
          ],
        }),
    });
    renderTree();
    fireEvent.click(
      await screen.findByRole("button", { name: "View details for Ada Lane" }),
    );

    const dialog = await screen.findByRole("dialog", {
      name: "Ada Lane · Person details",
    });
    expect(within(dialog).getByText("Spouse: Ben Lane")).toBeInTheDocument();
    expect(within(dialog).getByText("Child: Cy Lane")).toBeInTheDocument();
    expect(
      await within(dialog).findByText("birth-certificate.pdf"),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "Open" })).toHaveAttribute(
      "href",
      `/api/trees/${tree.id}/members/1/documents/5/file/`,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("disables Request a change for the Tree Owner", async () => {
    mockApi(treeRoutes());
    renderTree();
    expect(
      await screen.findByRole("button", { name: "Request a change" }),
    ).toBeDisabled();
    expect(screen.getByText("Tree Owner")).toBeInTheDocument();
  });

  it("lets a Collaborator submit a change request to the tree", async () => {
    const collaboratorTree = { ...tree, is_owner: false };
    const fetchMock = mockApi({
      ...treeRoutes([collaboratorTree]),
      [`POST /api/trees/${tree.id}/suggestions/`]: () =>
        json({ id: 1, change_type: "ADD_RELATIONSHIP", status: "PENDING" }, 201),
    });
    renderTree();

    fireEvent.click(await screen.findByRole("button", { name: "Request a change" }));
    fireEvent.click(screen.getByRole("button", { name: "Add relationship" }));
    // Member options come from the API, not sample data.
    const first = screen.getByLabelText("First member");
    expect(within(first).getByRole("option", { name: "Ada Lane" })).toBeInTheDocument();
    fireEvent.change(first, { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Relationship"), {
      target: { value: "PARENT" },
    });
    fireEvent.change(screen.getByLabelText("Second member"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("Notes for the Tree Owner"), {
      target: { value: "Ben is Cy's father." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit request" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Request sent.");
    const call = fetchMock.mock.calls.find(
      ([url]) => url === `/api/trees/${tree.id}/suggestions/`,
    ) as [string, RequestInit];
    expect(JSON.parse(call[1].body as string)).toEqual({
      change_type: "ADD_RELATIONSHIP",
      description: "Ben is Cy's father.",
      proposed_data: { member1: 2, member2: 3, relationship_type: "PARENT" },
    });

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("signs out from the account menu and lands on the home page", async () => {
    const fetchMock = mockApi({
      ...treeRoutes(),
      "POST /api/logout/": () => new Response(null, { status: 204 }),
    });
    renderTree();
    expect(await screen.findByText("TU")).toBeInTheDocument(); // real initials

    fireEvent.click(screen.getByRole("button", { name: /my account/i }));
    expect(screen.queryByRole("menuitem", { name: "Profile" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitem", { name: "Sign out" }));

    expect(
      await screen.findByRole("heading", { name: "Begin Your Family Tree" }),
    ).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: /sign in/i })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/logout/",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
