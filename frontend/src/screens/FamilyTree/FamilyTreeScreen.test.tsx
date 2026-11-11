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
import type { ChangeRequest, FamilyTree } from "../../services/trees";
import { fakeTreeApi, makeMember, makeRelationship } from "../../test/fakeTreeApi";

const ownedTree: FamilyTree = {
  id: 11,
  name: "Aditya Family",
  description: null,
  created_at: "2026-11-10T00:00:00Z",
  is_owner: true,
  member_count: 0,
};
const joinedTree: FamilyTree = { ...ownedTree, id: 22, name: "Other Family", is_owner: false };

const lane = () => ({
  [ownedTree.id]: [
    makeMember(1, "Ada", "Lane", { birth_date: "1940-02-01" }),
    makeMember(2, "Ben", "Lane", { birth_date: "1938-07-09" }),
    makeMember(3, "Cy", "Lane", { birth_date: "1970-03-03" }),
  ],
});
const laneRelationships = () => ({
  [ownedTree.id]: [
    makeRelationship(1, 1, 2, "SPOUSE"),
    makeRelationship(2, 1, 3, "PARENT"),
    makeRelationship(3, 2, 3, "PARENT"),
  ],
});

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );

const card = (name: string) =>
  screen.getByRole("button", { name: `View details for ${name}` });

const dialog = (name: string | RegExp) => screen.getByRole("dialog", { name });

const fill = (label: string | RegExp, value: string, container: HTMLElement = document.body) =>
  fireEvent.change(within(container).getByLabelText(label), { target: { value } });

beforeEach(() => {
  document.cookie = "csrftoken=test-token";
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Family tree routing", () => {
  it("redirects to sign-in without a session", async () => {
    fakeTreeApi({ signedIn: false, trees: [ownedTree] });
    renderAt("/family-tree/11");
    expect(await screen.findByRole("heading", { name: "Welcome to Roots" })).toBeInTheDocument();
  });

  it("loads the tree named in the URL (so a refresh reopens it)", async () => {
    const api = fakeTreeApi({ trees: [joinedTree, ownedTree], members: lane(), relationships: laneRelationships() });
    renderAt("/family-tree/11");

    expect(await screen.findByRole("heading", { name: "Aditya Family" })).toBeInTheDocument();
    expect(screen.getByText("3 people")).toBeInTheDocument();
    expect(api.calls.map((call) => call.url)).toEqual(
      expect.arrayContaining(["/api/trees/11/", "/api/trees/11/members/", "/api/trees/11/relationships/"]),
    );
    // Not tree 22, even though it's first in the list.
    expect(api.calls.some((call) => call.url.startsWith("/api/trees/22/"))).toBe(false);
  });

  it("shows not-found for a tree the user can't access", async () => {
    fakeTreeApi({ trees: [ownedTree] });
    renderAt("/family-tree/999");
    expect(await screen.findByRole("alert")).toHaveTextContent("doesn't exist or you don't have access");
    expect(screen.getByRole("link", { name: "Back to My Trees" })).toHaveAttribute("href", "/my-trees");
  });

  it("Back to My Trees opens the dashboard, not the landing page", async () => {
    fakeTreeApi({ trees: [ownedTree] });
    renderAt("/family-tree/11");
    fireEvent.click(await screen.findByRole("link", { name: /back to my trees/i }));
    expect(await screen.findByRole("heading", { name: "My Family Trees" })).toBeInTheDocument();
  });

  it("redirects old /family-tree?tree= links to /family-tree/:id", async () => {
    fakeTreeApi({ trees: [ownedTree] });
    renderAt("/family-tree?tree=11");
    expect(await screen.findByRole("heading", { name: "Aditya Family" })).toBeInTheDocument();
  });

  it("switches trees from the tree menu", async () => {
    fakeTreeApi({ trees: [ownedTree, joinedTree] });
    renderAt("/family-tree/11");
    fireEvent.click(await screen.findByRole("button", { name: "Switch family tree" }));
    fireEvent.click(await screen.findByRole("link", { name: /Other Family/ }));
    expect(await screen.findByRole("heading", { name: "Other Family" })).toBeInTheDocument();
    expect(screen.getByText("Collaborator")).toBeInTheDocument();
  });
});

describe("Tree Owner", () => {
  it("adds the first member from the empty state and sees the node", async () => {
    const api = fakeTreeApi({ trees: [ownedTree] });
    renderAt("/family-tree/11");

    fireEvent.click(await screen.findByRole("button", { name: "Add the first member" }));
    const form = dialog("Add a family member");
    fireEvent.click(within(form).getByRole("button", { name: "Add member" }));
    expect(within(form).getByText("Enter a first name.")).toBeInTheDocument();
    expect(api.writes()).toHaveLength(0);

    fill("First name", " Ada ", form);
    fill("Last name", "Lane", form);
    fill("Birth date (optional)", "1940-02-01", form);
    fireEvent.click(within(form).getByRole("button", { name: "Add member" }));

    // The new member is selected, so their details open over the canvas.
    expect(await screen.findByRole("dialog", { name: "Ada Lane · Person details" })).toBeInTheDocument();
    expect(card("Ada Lane")).toBeInTheDocument();
    expect(screen.getByText("1 person")).toBeInTheDocument();
    expect(api.writes()).toEqual([
      {
        method: "POST",
        url: "/api/trees/11/members/",
        body: { first_name: "Ada", last_name: "Lane", gender: "UNKNOWN", birth_date: "1940-02-01", death_date: null },
      },
    ]);
  });

  it("adds two members, connects them, and draws the connection", async () => {
    const api = fakeTreeApi({ trees: [ownedTree] });
    renderAt("/family-tree/11");
    await screen.findByRole("heading", { name: "Aditya Family" });

    for (const [first, last] of [["Ada", "Lane"], ["Ben", "Lane"]]) {
      fireEvent.click(screen.getByRole("button", { name: "Add Member" }));
      const form = dialog("Add a family member");
      fill("First name", first, form);
      fill("Last name", last, form);
      fireEvent.click(within(form).getByRole("button", { name: "Add member" }));
      fireEvent.click(await screen.findByRole("button", { name: "Close person details" }));
    }
    expect(screen.getByText("2 people")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add Relationship" }));
    const form = dialog("Add a relationship");
    fill("First member", String(api.db.members[11][0].id), form);
    fill("Relationship", "SPOUSE", form);
    fill("Second member", String(api.db.members[11][1].id), form);
    expect(within(form).getByText("Ada Lane is the spouse of Ben Lane.")).toBeInTheDocument();
    fireEvent.click(within(form).getByRole("button", { name: "Add relationship" }));

    await waitFor(() => expect(document.querySelector('[data-edge="spouse"]')).not.toBeNull());
    expect(document.querySelector('[data-marker="spouse"]')).not.toBeNull();
    expect(api.db.relationships[11]).toHaveLength(1);
  });

  it("rejects a self-relationship before sending it", async () => {
    const api = fakeTreeApi({ trees: [ownedTree], members: lane() });
    renderAt("/family-tree/11");
    fireEvent.click(await screen.findByRole("button", { name: "Add Relationship" }));
    const form = dialog("Add a relationship");
    fill("First member", "1", form);
    fill("Second member", "1", form);
    fireEvent.click(within(form).getByRole("button", { name: "Add relationship" }));
    expect(within(form).getByText("Choose two different members.")).toBeInTheDocument();
    expect(api.writes()).toHaveLength(0);
  });

  it("explains a duplicate relationship rejected by the server", async () => {
    fakeTreeApi({ trees: [ownedTree], members: lane(), relationships: laneRelationships() });
    renderAt("/family-tree/11");
    fireEvent.click(await screen.findByRole("button", { name: "Add Relationship" }));
    const form = dialog("Add a relationship");
    fill("First member", "1", form);
    fill("Relationship", "SPOUSE", form);
    fill("Second member", "2", form);
    fireEvent.click(within(form).getByRole("button", { name: "Add relationship" }));
    expect(await within(form).findByRole("alert")).toHaveTextContent(
      "These two people already have this relationship.",
    );
  });

  it("edits a member and the card updates", async () => {
    const api = fakeTreeApi({ trees: [ownedTree], members: lane(), relationships: laneRelationships() });
    renderAt("/family-tree/11");
    fireEvent.click(await screen.findByRole("button", { name: "View details for Cy Lane" }));
    fireEvent.click(await screen.findByRole("button", { name: "Edit details" }));

    const form = dialog("Edit Cy Lane");
    expect(within(form).getByLabelText("First name")).toHaveValue("Cy");
    fill("First name", "Cyrus", form);
    fireEvent.click(within(form).getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("button", { name: "View details for Cyrus Lane" })).toBeInTheDocument();
    expect(api.writes()[0]).toMatchObject({ method: "PATCH", url: "/api/trees/11/members/3/" });
  });

  it("deletes a member only after confirmation", async () => {
    const api = fakeTreeApi({ trees: [ownedTree], members: lane(), relationships: laneRelationships() });
    renderAt("/family-tree/11");
    fireEvent.click(await screen.findByRole("button", { name: "View details for Cy Lane" }));
    fireEvent.click(await screen.findByRole("button", { name: "Delete person" }));

    const confirm = screen.getByRole("alertdialog", { name: "Delete Cy Lane?" });
    expect(within(confirm).getByRole("button", { name: "Cancel" })).toHaveFocus();
    fireEvent.click(within(confirm).getByRole("button", { name: "Cancel" }));
    expect(api.writes()).toHaveLength(0);

    fireEvent.click(await screen.findByRole("button", { name: "Delete person" }));
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Delete person" }));

    await waitFor(() => expect(screen.queryByRole("button", { name: "View details for Cy Lane" })).not.toBeInTheDocument());
    expect(screen.getByText("2 people")).toBeInTheDocument();
    expect(api.writes()).toEqual([{ method: "DELETE", url: "/api/trees/11/members/3/", body: undefined }]);
    // Their parent–child links went with them.
    expect(document.querySelectorAll('[data-edge="parent"]')).toHaveLength(0);
  });

  it("removes a relationship with confirmation", async () => {
    fakeTreeApi({ trees: [ownedTree], members: lane(), relationships: laneRelationships() });
    renderAt("/family-tree/11");
    fireEvent.click(await screen.findByRole("button", { name: "View details for Ada Lane" }));
    fireEvent.click(await screen.findByRole("button", { name: "Remove relationship: Spouse: Ben Lane" }));
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Remove relationship" }));
    await waitFor(() => expect(document.querySelector('[data-edge="spouse"]')).toBeNull());
  });

  it("reviews requests: approving adds the member, rejecting doesn't", async () => {
    const request = (id: number, first: string): ChangeRequest => ({
      id,
      change_type: "ADD_MEMBER",
      description: `Please add ${first}.`,
      target_member: null,
      target_member_name: null,
      proposed_data: { first_name: first, last_name: "Lane" },
      file_url: null,
      status: "PENDING",
      is_outdated: false,
      comparison: null,
      submitted_by_name: "Cole Collab",
      created_at: "2026-11-09T00:00:00Z",
      reviewed_at: null,
    });
    fakeTreeApi({ trees: [ownedTree], suggestions: { 11: [request(50, "Dee"), request(51, "Eve")] } });
    renderAt("/family-tree/11");

    fireEvent.click(await screen.findByRole("button", { name: "Review Requests (2 waiting)" }));
    const review = await screen.findByRole("dialog", { name: "Review change requests" });
    const [dee] = await within(review).findAllByRole("listitem", { name: "Add member request from Cole Collab" });
    expect(within(review).getByText("Please add Dee.")).toBeInTheDocument();

    fireEvent.click(within(dee).getByRole("button", { name: "Approve" }));
    await waitFor(() => expect(within(review).queryByText("Please add Dee.")).not.toBeInTheDocument());
    fireEvent.click(within(review).getByRole("button", { name: "Reject" }));
    expect(await within(review).findByText("No requests are waiting for review.")).toBeInTheDocument();

    fireEvent.click(within(review).getByRole("button", { name: "Close Review change requests" }));
    expect(card("Dee Lane")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "View details for Eve Lane" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Review Requests" })).toBeInTheDocument();
  });

  it("creates an invitation link", async () => {
    fakeTreeApi({ trees: [ownedTree] });
    renderAt("/family-tree/11");
    fireEvent.click(await screen.findByRole("button", { name: "Invite Link" }));
    fireEvent.click(screen.getByRole("button", { name: "Create invitation link" }));
    expect(await screen.findByDisplayValue("http://localhost:5173/invite/tok123")).toBeInTheDocument();
  });
});

describe("Collaborator", () => {
  it("can view and request changes but has no direct editing controls", async () => {
    const api = fakeTreeApi({
      trees: [joinedTree],
      members: { 22: [makeMember(1, "Ada", "Lane"), makeMember(2, "Cy", "Lane")] },
    });
    renderAt("/family-tree/22");

    expect(await screen.findByRole("heading", { name: "Other Family" })).toBeInTheDocument();
    for (const name of ["Add Member", "Add Relationship", "Review Requests", "Invite Link"]) {
      expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
    }
    fireEvent.click(card("Ada Lane"));
    await screen.findByRole("dialog", { name: "Ada Lane · Person details" });
    expect(screen.queryByRole("button", { name: "Edit details" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete person" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close person details" }));

    fireEvent.click(screen.getByRole("button", { name: "Request a change" }));
    fill("First name", "Dee");
    fill("Last name", "Lane");
    fill("Notes for the Tree Owner", "Cy's daughter.");
    fireEvent.click(screen.getByRole("button", { name: "Submit request" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Request sent.");
    expect(api.writes()).toEqual([
      expect.objectContaining({ method: "POST", url: "/api/trees/22/suggestions/" }),
    ]);
    // Pending: the tree itself is unchanged.
    expect(api.db.members[22]).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "View details for Dee Lane" })).not.toBeInTheDocument();
  });
});

describe("Visualizer", () => {
  it("shows an empty state with no members", async () => {
    fakeTreeApi({ trees: [ownedTree] });
    renderAt("/family-tree/11");
    expect(await screen.findByText("No family members yet")).toBeInTheDocument();
    expect(screen.queryByTestId("tree-content")).not.toBeInTheDocument();
  });

  it("draws parent–child links from a couple and a spouse marker", async () => {
    fakeTreeApi({ trees: [ownedTree], members: lane(), relationships: laneRelationships() });
    renderAt("/family-tree/11");
    await screen.findByRole("button", { name: "View details for Cy Lane" });
    // One couple → child line (from the marriage marker), one spouse line.
    expect(document.querySelectorAll('[data-edge="parent"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-edge="spouse"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-marker="spouse"]')).toHaveLength(1);
  });

  it("zooms with the controls and pans by dragging", async () => {
    fakeTreeApi({ trees: [ownedTree], members: lane(), relationships: laneRelationships() });
    renderAt("/family-tree/11");
    await screen.findByRole("button", { name: "View details for Ada Lane" });
    const content = screen.getByTestId("tree-content");
    const start = content.style.transform;

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(content.style.transform).toContain("scale(1.2)");
    fireEvent.click(screen.getByRole("button", { name: /reset to 100%/ }));
    expect(content.style.transform).toContain("scale(1)");

    const viewport = screen.getByRole("application");
    fireEvent.pointerDown(viewport, { button: 0, pointerId: 1, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(viewport, { pointerId: 1, clientX: 160, clientY: 130 });
    fireEvent.pointerUp(viewport, { pointerId: 1, clientX: 160, clientY: 130 });
    expect(content.style.transform).not.toBe(start);
    expect(content.style.transform).toMatch(/translate\(60px, 30px\)/);

    fireEvent.keyDown(viewport, { key: "ArrowRight" });
    expect(content.style.transform).toMatch(/translate\(0px, 30px\)/);
  });

  it("selects a member to open their details", async () => {
    fakeTreeApi({ trees: [ownedTree], members: lane(), relationships: laneRelationships() });
    renderAt("/family-tree/11");
    fireEvent.click(await screen.findByRole("button", { name: "View details for Ada Lane" }));
    const details = await screen.findByRole("dialog", { name: "Ada Lane · Person details" });
    expect(within(details).getByText("Spouse: Ben Lane")).toBeInTheDocument();
    expect(within(details).getByText("Child: Cy Lane")).toBeInTheDocument();
  });

  it("signs out from the account menu and lands on the home page", async () => {
    const api = fakeTreeApi({ trees: [ownedTree] });
    renderAt("/family-tree/11");
    expect(await screen.findByText("TU")).toBeInTheDocument(); // real initials
    fireEvent.click(screen.getByRole("button", { name: /my account/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Sign out" }));
    expect(await screen.findByRole("heading", { name: "Begin Your Family Tree" })).toBeInTheDocument();
    expect(api.calls).toContainEqual(expect.objectContaining({ method: "POST", url: "/api/logout/" }));
  });
});
