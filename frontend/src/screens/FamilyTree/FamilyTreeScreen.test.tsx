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
  it("rejects an invalid invitation token", async () => {   //invalid invitation cannot be accepted
    const api = fakeTreeApi({ trees: [ownedTree] });
    const originalFetch = api.fetchMock;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.includes("invalid-token")) {
          return new Response(JSON.stringify({ detail: "Invitation not found." }),
            {status: 404,headers: { "Content-Type": "application/json" },
            }
          );
        }
        return originalFetch(input, init);
      })
    );
    renderAt("/invite/invalid-token");
    expect(await screen.findByRole("heading", {name: "Invitation unavailable",})).toBeInTheDocument();
    expect(screen.getByText("Ask the Tree Owner to send you a new link.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Join Tree" })).not.toBeInTheDocument();
    expect(api.writes()).toHaveLength(0);
  });

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
    fakeTreeApi({
      trees: [ownedTree, joinedTree],
      members: {
        11: [makeMember(1, "Ada", "Lane")],
        22: [makeMember(2, "Test", "Person")],},
    });
    
    renderAt("/family-tree/11");
    expect(await screen.findByRole("button", { name: "View details for Ada Lane",})).toBeInTheDocument(); //confirm orignal tree member appears first
    fireEvent.click(await screen.findByRole("button", { name: "Switch family tree" }));
    fireEvent.click(await screen.findByRole("link", { name: /Other Family/ }));
    expect(await screen.findByRole("heading", { name: "Other Family" })).toBeInTheDocument();
    expect(screen.getByText("Collaborator")).toBeInTheDocument();
    expect(await screen.findByRole("button", {name: "View details for Test Person",})).toBeInTheDocument(); //wwitching trees loads only the selected trees members
    expect(screen.queryByRole("button", {name: "View details for Ada Lane",})).not.toBeInTheDocument();
  });
});

describe("Tree Owner", () => {

  it("rejects a whitespace-only first name", async () => {
    const api = fakeTreeApi({ trees: [ownedTree] });
    renderAt("/family-tree/11");
    fireEvent.click(await screen.findByRole("button", { name: "Add the first member" }));
    const form = dialog("Add a family member");
    fill("First name", "   ", form);
    fill("Last name", "Smith", form);
    fireEvent.click(within(form).getByRole("button", { name: "Add member" }));
    expect(within(form).getByText("Enter a first name.")).toBeInTheDocument();
    expect(api.writes()).toHaveLength(0);
    expect(api.db.members[11] ?? []).toHaveLength(0);
  });

  it("edits a family member's birth date", async () => {
    const api = fakeTreeApi({ trees: [ownedTree], members: lane() });
    renderAt("/family-tree/11");
    fireEvent.click(await screen.findByRole("button", { name: "View details for Cy Lane" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit details" }));
    const form = dialog("Edit Cy Lane");
    fill("Birth date (optional)", "1975-05-10", form);
    fireEvent.click(within(form).getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(api.db.members[11].find((member) => member.id === 3)?.birth_date).toBe("1975-05-10"));
    expect(api.writes()).toEqual(expect.arrayContaining([
      expect.objectContaining({ method: "PATCH", url: "/api/trees/11/members/3/" }),
    ]));
  });

  it("adds a member without a death date", async () => {
    const api = fakeTreeApi({ trees: [ownedTree] });
    renderAt("/family-tree/11");
    fireEvent.click(await screen.findByRole("button", { name: "Add the first member" }));
    const form = dialog("Add a family member");
    fill("First name", "John", form);
    fill("Last name", "Smith", form);
    fill("Birth date (optional)", "1990-01-01", form);
    fireEvent.click(within(form).getByRole("button", { name: "Add member" }));
    expect(await screen.findByRole("button", { name: "View details for John Smith" })).toBeInTheDocument();
    expect(api.db.members[11]).toHaveLength(1);
    expect(api.db.members[11][0].death_date).toBeNull();
  });

  it("allows two members with identical names", async () => {
    const api = fakeTreeApi({ trees: [ownedTree] });
    renderAt("/family-tree/11");
    await screen.findByRole("heading", { name: "Aditya Family" });

    for (let i = 0; i < 2; i++) {
      fireEvent.click(screen.getByRole("button", { name: i === 0 ? "Add the first member" : "Add Member" }));
      const form = dialog("Add a family member");
      fill("First name", "John", form);
      fill("Last name", "Smith", form);
      fireEvent.click(within(form).getByRole("button", { name: "Add member" }));
      fireEvent.click(await screen.findByRole("button", { name: "Close person details" }));
    }

    expect(screen.getByText("2 people")).toBeInTheDocument();
    expect(api.db.members[11]).toHaveLength(2);
    expect(api.db.members[11][0].full_name).toBe("John Smith");
    expect(api.db.members[11][1].full_name).toBe("John Smith");
    expect(api.db.members[11][0].id).not.toBe(api.db.members[11][1].id);
  });

  it("creates a valid parent-child relationship", async () => {
    const api = fakeTreeApi({ trees: [ownedTree], members: lane() });
    renderAt("/family-tree/11");
    fireEvent.click(await screen.findByRole("button", { name: "Add Relationship" }));
    const form = dialog("Add a relationship");
    fill("First member", "1", form);
    fill("Relationship", "PARENT", form);
    fill("Second member", "3", form);
    fireEvent.click(within(form).getByRole("button", { name: "Add relationship" }));
    await waitFor(() => expect(api.db.relationships[11]).toHaveLength(1));
    expect(api.db.relationships[11][0]).toMatchObject({ member1: 1, member2: 3, relationship_type: "PARENT" });
    expect(api.writes()).toEqual(expect.arrayContaining([
      expect.objectContaining({ method: "POST", url: "/api/trees/11/relationships/" }),
    ]));
  });

  it("deletes a relationship but keeps both members", async () => {
    const api = fakeTreeApi({ trees: [ownedTree], members: lane(), relationships: laneRelationships() });
    renderAt("/family-tree/11");
    fireEvent.click(await screen.findByRole("button", { name: "View details for Ada Lane" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove relationship: Spouse: Ben Lane" }));
    const confirm = screen.getByRole("alertdialog");
    fireEvent.click(within(confirm).getByRole("button", { name: "Remove relationship" }));
    await waitFor(() => expect(api.db.relationships[11]).toHaveLength(2));
    expect(api.db.relationships[11].some((relationship) => relationship.id === 1)).toBe(false);
    expect(api.db.members[11]).toHaveLength(3);
    expect(api.db.members[11].some((member) => member.id === 1)).toBe(true);
    expect(api.db.members[11].some((member) => member.id === 2)).toBe(true);
  });

  it("loads an empty family tree without crashing", async () => {
    const api = fakeTreeApi({ trees: [ownedTree], members: { 11: [] }, relationships: { 11: [] } });
    renderAt("/family-tree/11");
    expect(await screen.findByRole("heading", { name: "Aditya Family" })).toBeInTheDocument();
    expect(screen.getByText("No family members yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add the first member" })).toBeInTheDocument();
    expect(api.db.members[11]).toHaveLength(0);
    expect(api.db.relationships[11]).toHaveLength(0);
  });
  
  it("rejects a death date earlier than the birth date", async () => {
    const api = fakeTreeApi({ trees: [ownedTree] });
    renderAt("/family-tree/11");
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Add the first member",
      })
    );
    const form = dialog("Add a family member");
    fill("First name", "John", form);
    fill("Last name", "Smith", form);
    fill("Birth date (optional)", "2000-01-01", form);
    fill("Death date (optional)", "1990-01-01", form);
    fireEvent.click(
      within(form).getByRole("button", {name: "Add member",}));
    expect(within(form).getByText("Death date cannot be before the birth date.")).toBeInTheDocument();
    expect(api.writes()).toHaveLength(0);
  });

  
it("handles a server error when adding a family member", async () => {   //simulate a server failure without changing the real database
  const api = fakeTreeApi({ trees: [ownedTree] });
  const originalFetch = api.fetchMock;
  vi.stubGlobal("fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      if (url === "/api/trees/11/members/" &&method === "POST") {
        return new Response(JSON.stringify({detail: "Server error. Please try again.",}),
    {status: 500,headers: { "Content-Type": "application/json" },
          }
        );
      }
      return originalFetch(input, init);
    })
  );
  renderAt("/family-tree/11"); //open the add member form
  fireEvent.click(
    await screen.findByRole("button", {name: "Add the first member",}));
  const form = dialog("Add a family member"); //enter valid member info
  fill("First name", "John", form);
  fill("Last name", "Smith", form); //submit form
  fireEvent.click(within(form).getByRole("button", {name: "Add member",}));   //the application should display an error
  expect(await within(form).findByRole("alert")).toHaveTextContent("Server error. Please try again.");  //the form should remain open
  expect(form).toBeInTheDocument();
  expect(screen.queryByRole("button", {name: "View details for John Smith",})).not.toBeInTheDocument(); //the member shouldnt be added
  expect(api.db.members[11] ?? []).toHaveLength(0);  //the fake database should not be changed 
});

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
    const api = fakeTreeApi({ trees: [ownedTree], members: lane(), relationships: laneRelationships() });
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
    expect(api.db.relationships[11]).toHaveLength(3);
    expect(api.writes().filter((call) => call.method === "POST")).toHaveLength(1);
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
    expect(api.db.members[11]).toHaveLength(2);     //deleted member and their relationships are removed with them
    expect(
      api.db.members[11].some((member) => member.id === 3)
    ).toBe(false);
    expect(api.db.relationships[11]).toHaveLength(1);
    expect(
      api.db.relationships[11].some(
        (relationship) =>
          relationship.member1 === 3 ||
          relationship.member2 === 3
      )
    ).toBe(false);
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
    const api = fakeTreeApi({ trees: [ownedTree], suggestions: { 11: [request(50, "Dee"), request(51, "Eve")] } });
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
    expect(api.db.members[11]).toHaveLength(1);     //approved requests change the database + rejected ones do not
    expect(api.db.members[11].some((member) => member.first_name === "Dee")).toBe(true);
    expect(api.db.members[11].some((member) => member.first_name === "Eve")).toBe(false);
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
  it("does not show direct member editing controls to collaborators", async () => { //collaborators cannot edit family tree members directly
    const api = fakeTreeApi({trees: [joinedTree],members: {[joinedTree.id]: [ makeMember(1, "Test", "Person"),],},});
    renderAt("/family-tree/22");
    const memberCard = await screen.findByRole("button", { name: "View details for Test Person",}); //the collaborator can view the family member
    expect(memberCard).toBeInTheDocument();
    fireEvent.click(memberCard); //open the member details
    const details = await screen.findByRole("dialog", {name: "Test Person · Person details",});
    expect(within(details).queryByRole("button", { name: "Edit details" })).not.toBeInTheDocument(); //editing and deletion must not be available for them
    expect(within(details).queryByRole("button", { name: "Delete person" })).not.toBeInTheDocument();
    expect(api.writes()).toHaveLength(0);  //viewing the member must not modify database
  });
  
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

    expect(
      await within(dialog("Request a change")).findByRole("status"),
    ).toHaveTextContent("Request sent.");
    expect(api.writes()).toEqual([
      expect.objectContaining({ method: "POST", url: "/api/trees/22/suggestions/" }),
    ]);
    // Pending: the tree itself is unchanged.
    expect(api.db.members[22]).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "View details for Dee Lane" })).not.toBeInTheDocument();
  });
});

describe("Visualizer", () => {
  it("opens the Add Relationship form", async () => {
    fakeTreeApi({ trees: [ownedTree], members: lane() });
    renderAt("/family-tree/11");
    fireEvent.click(await screen.findByRole("button", { name: "Add Relationship" }));
    expect(screen.getByRole("dialog", { name: "Add a relationship" })).toBeInTheDocument();
  });

  it("shows all three family members", async () => {
    fakeTreeApi({ trees: [ownedTree], members: lane() });
    renderAt("/family-tree/11");
    expect(await screen.findByRole("button", { name: "View details for Ada Lane" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View details for Ben Lane" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View details for Cy Lane" })).toBeInTheDocument();
  });
  
  it("shows an empty state with no members", async () => {
    fakeTreeApi({ trees: [ownedTree] });
    renderAt("/family-tree/11");
    expect(await screen.findByText("No family members yet")).toBeInTheDocument();
    expect(screen.queryByTestId("tree-content")).not.toBeInTheDocument();
  });

  it("displays the family tree name", async () => {
    fakeTreeApi({ trees: [ownedTree] });
    renderAt("/family-tree/11");
    expect(await screen.findByRole("heading", { name: "Aditya Family" })).toBeInTheDocument();
  });

  it("shows the Add Member button to the owner", async () => {
    fakeTreeApi({ trees: [ownedTree], members: lane() });
    renderAt("/family-tree/11");
    expect(await screen.findByRole("button", { name: "Add Member" })).toBeInTheDocument();
  });

  it("shows the Add Relationship button", async () => {
    fakeTreeApi({ trees: [ownedTree], members: lane() });
    renderAt("/family-tree/11");
    expect(await screen.findByRole("button", { name: "Add Relationship" })).toBeInTheDocument();
  });

  it("opens the Add Member form", async () => {
    fakeTreeApi({ trees: [ownedTree], members: lane() });
    renderAt("/family-tree/11");
    fireEvent.click(await screen.findByRole("button", { name: "Add Member" }));
    expect(screen.getByRole("dialog", { name: "Add a family member" })).toBeInTheDocument();
  });

  it("displays the correct member count", async () => {
    fakeTreeApi({ trees: [ownedTree], members: lane() });
    renderAt("/family-tree/11");
    expect(await screen.findByText("3 people")).toBeInTheDocument();
  });

  it("displays the tree owner's role", async () => {
    fakeTreeApi({ trees: [ownedTree] });
    renderAt("/family-tree/11");
    expect(await screen.findByText("Owner")).toBeInTheDocument();
  });

  it("displays the collaborator's role", async () => {
    fakeTreeApi({ trees: [joinedTree] });
    renderAt("/family-tree/22");
    expect(await screen.findByText("Collaborator")).toBeInTheDocument();
  });

  it("shows the zoom in button", async () => {
    fakeTreeApi({ trees: [ownedTree], members: lane() });
    renderAt("/family-tree/11");
    expect(await screen.findByRole("button", { name: "Zoom in" })).toBeInTheDocument();
  });

  it("shows the zoom out button", async () => {
    fakeTreeApi({ trees: [ownedTree], members: lane() });
    renderAt("/family-tree/11");
    expect(await screen.findByRole("button", { name: "Zoom out" })).toBeInTheDocument();
  });

  it("shows the account menu button", async () => {
    fakeTreeApi({ trees: [ownedTree] });
    renderAt("/family-tree/11");
    expect(await screen.findByRole("button", { name: /my account/i })).toBeInTheDocument();
  });
  
  it("shows the reset zoom button", async () => {
    fakeTreeApi({ trees: [ownedTree], members: lane() });
    renderAt("/family-tree/11");
    expect(await screen.findByRole("button", { name: /reset to 100%/ })).toBeInTheDocument();
  });

  it("displays the family tree canvas", async () => {
    fakeTreeApi({ trees: [ownedTree], members: lane() });
    renderAt("/family-tree/11");
    expect(await screen.findByTestId("tree-content")).toBeInTheDocument();
  });

  it("displays the correct tree name for a collaborator", async () => {
    fakeTreeApi({ trees: [joinedTree] });
    renderAt("/family-tree/22");
    expect(await screen.findByRole("heading", { name: "Other Family" })).toBeInTheDocument();
  });

  it("shows the Back to My Trees link", async () => {
    fakeTreeApi({ trees: [ownedTree] });
    renderAt("/family-tree/11");
    expect(await screen.findByRole("link", { name: /back to my trees/i })).toBeInTheDocument();
  });

  it("shows the Invite Link button to the owner", async () => {
    fakeTreeApi({ trees: [ownedTree] });
    renderAt("/family-tree/11");
    expect(await screen.findByRole("button", { name: "Invite Link" })).toBeInTheDocument();
  });
  
  it("zoom out decreases the zoom level", async () => {
    fakeTreeApi({ trees: [ownedTree], members: lane() });
    renderAt("/family-tree/11");
    const content = await screen.findByTestId("tree-content");
    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    expect(content.style.transform).toContain("scale(0.8)");
  });

  it("zoom in twice increases the zoom level", async () => {
    fakeTreeApi({ trees: [ownedTree], members: lane() });
    renderAt("/family-tree/11");
    const content = await screen.findByTestId("tree-content");
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(content.style.transform).toContain("scale(1.4)");
  });

  it("member details display the correct birth date", async () => {
    fakeTreeApi({ trees: [ownedTree], members: lane() });
    renderAt("/family-tree/11");
    fireEvent.click(await screen.findByRole("button", { name: "View details for Cy Lane" }));
    const details = await screen.findByRole("dialog", { name: "Cy Lane · Person details" });
    expect(within(details).getByText(/1970/)).toBeInTheDocument();
  });

  it("draws parent–child links from a couple and a spouse marker", async () => {
    fakeTreeApi({ trees: [ownedTree], members: lane(), relationships: laneRelationships() });
    renderAt("/family-tree/11");
    await screen.findByRole("button", { name: "View details for Cy Lane" }); // One couple → child line (from the marriage marker), one spouse line.
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

  
  it("TC-51: closes member details and returns to the tree", async () => {
    fakeTreeApi({ trees: [ownedTree], members: lane(), relationships: laneRelationships() });
    renderAt("/family-tree/11");
    fireEvent.click(await screen.findByRole("button", { name: "View details for Ada Lane" }));
    expect(await screen.findByRole("dialog", { name: "Ada Lane · Person details" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close person details" }));
    expect(screen.queryByRole("dialog", { name: "Ada Lane · Person details" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View details for Ada Lane" })).toBeInTheDocument();
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
