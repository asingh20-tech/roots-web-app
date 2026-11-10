import { describe, expect, it } from "vitest";
import type { FamilyMember, Relationship } from "../../../../services/trees";
import { CARD_WIDTH, COLUMN_GAP, layoutFamilyTree, lifeSpan } from "./familyTreeLayout";

const m = (id: number, name: string): FamilyMember => ({
  id,
  first_name: name,
  last_name: "Test",
  full_name: `${name} Test`,
  gender: "UNKNOWN",
  birth_date: null,
  death_date: null,
  photo_url: null,
  version: 1,
  updated_at: "",
});
const rel = (
  id: number,
  member1: number,
  member2: number,
  relationship_type: Relationship["relationship_type"],
): Relationship => ({ id, member1, member2, relationship_type, start_date: null, created_at: "" });

describe("layoutFamilyTree", () => {
  it("puts children a generation below their parents", () => {
    const layout = layoutFamilyTree(
      [m(1, "Child"), m(2, "Parent"), m(3, "Grandparent")],
      [rel(1, 2, 1, "PARENT"), rel(2, 3, 2, "ADOPTIVE_PARENT")],
    );
    const gen = Object.fromEntries(
      layout.nodes.map((node) => [node.member.id, node.generation]),
    );
    expect(gen).toEqual({ 3: 0, 2: 1, 1: 2 });
    const y = (id: number) => layout.nodes.find((n) => n.member.id === id)!.y;
    expect(y(3)).toBeLessThan(y(2));
    expect(y(2)).toBeLessThan(y(1));
  });

  it("keeps a spouse who married in on the same row, beside their partner", () => {
    // 1 + 2 are parents of 3; 4 married 3; 5 is unrelated in gen 0.
    const layout = layoutFamilyTree(
      [m(1, "A"), m(2, "B"), m(3, "C"), m(4, "D"), m(5, "E")],
      [rel(1, 1, 3, "PARENT"), rel(2, 2, 3, "PARENT"), rel(3, 3, 4, "SPOUSE"), rel(4, 1, 2, "SPOUSE")],
    );
    const node = (id: number) => layout.nodes.find((n) => n.member.id === id)!;
    expect(node(4).generation).toBe(node(3).generation);
    expect(Math.abs(node(4).x - node(3).x)).toBe(CARD_WIDTH + COLUMN_GAP);
    expect(Math.abs(node(1).x - node(2).x)).toBe(CARD_WIDTH + COLUMN_GAP);
    expect(layout.spouseLinks).toHaveLength(2);
    expect(layout.parentLinks).toHaveLength(2);
  });

  it("ignores relationships to members outside the tree and survives cycles", () => {
    const layout = layoutFamilyTree(
      [m(1, "A"), m(2, "B")],
      [rel(1, 1, 2, "PARENT"), rel(2, 2, 1, "PARENT"), rel(3, 1, 99, "PARENT")],
    );
    expect(layout.nodes).toHaveLength(2);
    expect(layout.parentLinks).toHaveLength(2);
  });

  it("returns an empty layout for an empty tree", () => {
    expect(layoutFamilyTree([], [])).toMatchObject({ nodes: [], height: 0 });
  });
});

describe("lifeSpan", () => {
  it("formats the years that are known", () => {
    expect(lifeSpan({ birth_date: "1898-01-02", death_date: "1974-05-06" })).toBe("1898 – 1974");
    expect(lifeSpan({ birth_date: "1967-01-01", death_date: null })).toBe("Born 1967");
    expect(lifeSpan({ birth_date: null, death_date: "1974-01-01" })).toBe("Died 1974");
    expect(lifeSpan({ birth_date: null, death_date: null })).toBe("");
  });
});
