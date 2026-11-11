// Stateful stand-in for the Django tree endpoints in screen tests. Writes
// change its in-memory "database" so a reload shows them, and Owner-only
// endpoints answer 403 for a Collaborator, like IsTreeOwnerOrReadOnly.
import { vi } from "vitest";
import type {
  ChangeRequest,
  FamilyMember,
  FamilyTree,
  Relationship,
} from "../services/trees";
import { json, signedOut, testUser } from "./mockApi";

export const makeMember = (
  id: number,
  first: string,
  last: string,
  extra: Partial<FamilyMember> = {},
): FamilyMember => ({
  id,
  first_name: first,
  last_name: last,
  full_name: `${first} ${last}`,
  gender: "UNKNOWN",
  birth_date: null,
  death_date: null,
  photo_url: null,
  version: 1,
  updated_at: "2026-11-10T00:00:00Z",
  ...extra,
});

export const makeRelationship = (
  id: number,
  member1: number,
  member2: number,
  relationship_type: Relationship["relationship_type"],
): Relationship => ({
  id,
  member1,
  member2,
  relationship_type,
  start_date: null,
  created_at: "2026-11-10T00:00:00Z",
});

type FakeDb = {
  signedIn: boolean;
  trees: FamilyTree[];
  members: Record<number, FamilyMember[]>;
  relationships: Record<number, Relationship[]>;
  suggestions: Record<number, ChangeRequest[]>;
};

const ownerOnly = () =>
  json(
    {
      detail:
        "Only the Tree Owner can change this tree. Collaborators can submit suggestions instead.",
    },
    403,
  );

export const fakeTreeApi = (initial: Partial<FakeDb> = {}) => {
  const db: FakeDb = {
    signedIn: true,
    trees: [],
    members: {},
    relationships: {},
    suggestions: {},
    ...initial,
  };
  let nextId = 1000;
  const calls: Array<{ method: string; url: string; body: unknown }> = [];

  const handle = async (method: string, url: string, body: unknown): Promise<Response> => {
    if (url === "/api/me/") return db.signedIn ? json(testUser) : signedOut();
    if (!db.signedIn) return signedOut();
    if (method === "POST" && url === "/api/logout/") {
      db.signedIn = false;
      return new Response(null, { status: 204 });
    }

    const withCount = (tree: FamilyTree) => ({
      ...tree,
      member_count: (db.members[tree.id] ?? []).length,
    });
    if (url === "/api/trees/" && method === "GET") return json(db.trees.map(withCount));
    if (url === "/api/trees/" && method === "POST") {
      const input = body as { name: string; description?: string };
      const tree: FamilyTree = {
        id: nextId++,
        name: input.name,
        description: input.description ?? null,
        created_at: "2026-11-10T00:00:00Z",
        is_owner: true,
        member_count: 0,
      };
      db.trees.unshift(tree);
      return json(tree, 201);
    }

    const match = url.match(/^\/api\/trees\/(\d+)\/(.*)$/);
    if (!match) return json({ detail: `Unmocked ${method} ${url}` }, 500);
    const treeId = Number(match[1]);
    const rest = match[2];
    const tree = db.trees.find((candidate) => candidate.id === treeId);
    if (!tree) return json({ detail: "Not found." }, 404);
    const members = (db.members[treeId] ??= []);
    const relationships = (db.relationships[treeId] ??= []);
    const write = method !== "GET";

    if (rest === "" && method === "GET") return json(withCount(tree));
    if (rest === "members/" && method === "GET") return json(members);
    if (rest === "relationships/" && method === "GET") return json(relationships);

    if (rest === "suggestions/" && method === "GET") {
      return json(tree.is_owner ? db.suggestions[treeId] ?? [] : []);
    }
    if (rest === "suggestions/" && method === "POST") {
      if (tree.is_owner) {
        return json({ detail: "Only Collaborators can submit suggestions; only the Tree Owner can review them." }, 403);
      }
      const input = body as ChangeRequest;
      const suggestion = { ...input, id: nextId++, status: "PENDING" } as ChangeRequest;
      (db.suggestions[treeId] ??= []).push(suggestion);
      return json(suggestion, 201);
    }
    const review = rest.match(/^suggestions\/(\d+)\/(approve|reject)\/$/);
    if (review && method === "POST") {
      if (!tree.is_owner) return json({ detail: "Only the Tree Owner can review them." }, 403);
      const list = db.suggestions[treeId] ?? [];
      const suggestion = list.find((candidate) => candidate.id === Number(review[1]));
      if (!suggestion) return json({ detail: "Not found." }, 404);
      db.suggestions[treeId] = list.filter((candidate) => candidate !== suggestion);
      if (review[2] === "approve" && suggestion.change_type === "ADD_MEMBER") {
        const data = suggestion.proposed_data as Record<string, string>;
        members.push(makeMember(nextId++, data.first_name, data.last_name));
      }
      return json({ ...suggestion, status: review[2] === "approve" ? "APPROVED" : "REJECTED" });
    }

    if (write && !tree.is_owner) return ownerOnly();

    if (rest === "members/" && method === "POST") {
      const input = body as Omit<FamilyMember, "id" | "full_name">;
      const member = makeMember(nextId++, input.first_name, input.last_name, {
        gender: input.gender,
        birth_date: input.birth_date,
        death_date: input.death_date,
      });
      members.push(member);
      return json(member, 201);
    }
    const memberMatch = rest.match(/^members\/(\d+)\/$/);
    if (memberMatch) {
      const index = members.findIndex((member) => member.id === Number(memberMatch[1]));
      if (index < 0) return json({ detail: "Not found." }, 404);
      if (method === "GET") return json({ ...members[index], documents: [] });
      if (method === "PATCH") {
        const input = body as Partial<FamilyMember>;
        const updated = {
          ...members[index],
          ...input,
          version: members[index].version + 1,
        } as FamilyMember;
        updated.full_name = `${updated.first_name} ${updated.last_name}`;
        members[index] = updated;
        return json(updated);
      }
      if (method === "DELETE") {
        const id = members[index].id;
        members.splice(index, 1);
        db.relationships[treeId] = relationships.filter(
          (rel) => rel.member1 !== id && rel.member2 !== id,
        );
        return new Response(null, { status: 204 });
      }
    }
    if (rest === "relationships/" && method === "POST") {
      const input = body as { member1: number; member2: number; relationship_type: string };
      if (input.member1 === input.member2) {
        return json({ non_field_errors: ["A member cannot be related to themselves."] }, 400);
      }
      let [m1, m2, type] = [input.member1, input.member2, input.relationship_type];
      if (type === "CHILD") [m1, m2, type] = [m2, m1, "PARENT"];
      if (relationships.some((rel) => rel.member1 === m1 && rel.member2 === m2 && rel.relationship_type === type)) {
        return json({ non_field_errors: ["The fields member1, member2, relationship_type must make a unique set."] }, 400);
      }
      const rel = makeRelationship(nextId++, m1, m2, type as Relationship["relationship_type"]);
      relationships.push(rel);
      return json(rel, 201);
    }
    const relMatch = rest.match(/^relationships\/(\d+)\/$/);
    if (relMatch && method === "DELETE") {
      db.relationships[treeId] = relationships.filter((rel) => rel.id !== Number(relMatch[1]));
      return new Response(null, { status: 204 });
    }
    if (rest === "invitations/" && method === "POST") {
      return json({ id: 1, is_active: true, is_valid: true, created_at: "", expires_at: "2026-11-17T00:00:00Z", url: "http://localhost:5173/invite/tok123" }, 201);
    }
    return json({ detail: `Unmocked ${method} ${url}` }, 500);
  };

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    const method = init?.method ?? "GET";
    const body = init?.body ? JSON.parse(init.body as string) : undefined;
    calls.push({ method, url, body });
    return handle(method, url, body);
  });
  vi.stubGlobal("fetch", fetchMock);

  return {
    db,
    calls,
    fetchMock,
    writes: () => calls.filter((call) => call.method !== "GET"),
  };
};
