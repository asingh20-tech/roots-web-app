import { describe, expect, it } from "vitest";
import type { FamilyMember, Relationship } from "../../../../services/trees";
import { CARD_WIDTH, COLUMN_GAP, layoutFamilyTree, lifeSpan, roundedPath } from "./familyTreeLayout";

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

describe("layoutFamilyTree — family shapes", () => {
  const nodeOf = (layout: ReturnType<typeof layoutFamilyTree>, id: number) =>
    layout.nodes.find((n) => n.member.id === id)!;
  const kinds = (layout: ReturnType<typeof layoutFamilyTree>) =>
    layout.edges.map((edge) => edge.kind).sort();
  const noOverlap = (layout: ReturnType<typeof layoutFamilyTree>) => {
    for (const a of layout.nodes) {
      for (const b of layout.nodes) {
        if (a === b || a.y !== b.y) continue;
        expect(Math.abs(a.x - b.x)).toBeGreaterThanOrEqual(CARD_WIDTH + COLUMN_GAP);
      }
    }
  };

  it("places a single member alone (the canvas centres it)", () => {
    const layout = layoutFamilyTree([m(1, "Solo")], []);
    expect(layout.nodes).toHaveLength(1);
    expect(layout.edges).toHaveLength(0);
    expect(layout.width).toBe(CARD_WIDTH + 2 * 92);
  });

  it("keeps members without relationships on the canvas", () => {
    const layout = layoutFamilyTree([m(1, "A"), m(2, "B"), m(3, "C")], [rel(1, 1, 2, "SPOUSE")]);
    expect(layout.nodes.map((n) => n.member.id).sort()).toEqual([1, 2, 3]);
    noOverlap(layout);
  });

  it("arranges three generations top to bottom with one couple line per child", () => {
    const layout = layoutFamilyTree(
      [m(1, "Gran"), m(2, "Gramps"), m(3, "Mum"), m(4, "Dad"), m(5, "Kid1"), m(6, "Kid2")],
      [
        rel(1, 1, 2, "SPOUSE"),
        rel(2, 1, 3, "PARENT"),
        rel(3, 2, 3, "PARENT"),
        rel(4, 3, 4, "SPOUSE"),
        rel(5, 3, 5, "PARENT"),
        rel(6, 4, 5, "PARENT"),
        rel(7, 3, 6, "PARENT"),
        rel(8, 4, 6, "PARENT"),
      ],
    );
    expect([1, 3, 5].map((id) => nodeOf(layout, id).generation)).toEqual([0, 1, 2]);
    // Dad married in: same row as Mum, beside her.
    expect(nodeOf(layout, 4).y).toBe(nodeOf(layout, 3).y);
    expect(Math.abs(nodeOf(layout, 4).x - nodeOf(layout, 3).x)).toBe(CARD_WIDTH + COLUMN_GAP);
    // Each child hangs from their parents' marriage marker: 3 couple lines.
    expect(kinds(layout)).toEqual(["parent", "parent", "parent", "spouse", "spouse"]);
    expect(layout.markers).toHaveLength(2);
    noOverlap(layout);
  });

  it("draws a single parent's link from their own card", () => {
    const layout = layoutFamilyTree([m(1, "Parent"), m(2, "Child")], [rel(1, 1, 2, "PARENT")]);
    expect(layout.edges).toEqual([
      expect.objectContaining({ key: "parent-1-2", kind: "parent" }),
    ]);
  });

  it("links two parents who aren't married separately (no couple assumed)", () => {
    const layout = layoutFamilyTree(
      [m(1, "P1"), m(2, "P2"), m(3, "Child")],
      [rel(1, 1, 3, "PARENT"), rel(2, 2, 3, "PARENT")],
    );
    expect(layout.edges.map((edge) => edge.key).sort()).toEqual(["parent-1-3", "parent-2-3"]);
    expect(layout.markers).toHaveLength(0);
  });

  it("styles adoptive links separately from biological ones", () => {
    const layout = layoutFamilyTree(
      [m(1, "Birth"), m(2, "Adoptive"), m(3, "Child")],
      [rel(1, 1, 3, "PARENT"), rel(2, 2, 3, "ADOPTIVE_PARENT")],
    );
    expect(kinds(layout)).toEqual(["adoptive", "parent"]);
    expect(nodeOf(layout, 3).generation).toBe(1);
  });

  it("supports same-sex couples and doesn't use gender for layout", () => {
    const members = [
      { ...m(1, "Alex"), gender: "MALE" as const },
      { ...m(2, "Sam"), gender: "MALE" as const },
      m(3, "Kid"),
    ];
    const layout = layoutFamilyTree(members, [
      rel(1, 1, 2, "SPOUSE"),
      rel(2, 1, 3, "PARENT"),
      rel(3, 2, 3, "PARENT"),
    ]);
    expect(kinds(layout)).toEqual(["parent", "spouse"]);
    expect(layout.edges.find((e) => e.kind === "parent")?.key).toBe("parent-couple-1-2-3");
  });

  it("keeps someone married more than once next to each spouse", () => {
    const layout = layoutFamilyTree(
      [m(1, "A"), m(2, "First"), m(3, "Second")],
      [rel(1, 1, 2, "SPOUSE"), rel(2, 1, 3, "SPOUSE")],
    );
    // A sits between both spouses, each directly beside them.
    const [aX, firstX, secondX] = [1, 2, 3].map((id) => nodeOf(layout, id).x);
    expect(Math.abs(firstX - aX)).toBe(CARD_WIDTH + COLUMN_GAP);
    expect(Math.abs(secondX - aX)).toBe(CARD_WIDTH + COLUMN_GAP);
    expect(Math.sign(firstX - aX)).toBe(-Math.sign(secondX - aX));
    expect(layout.markers).toHaveLength(2);
  });

  it("puts explicit siblings on one row and brackets them when no parent links them", () => {
    const layout = layoutFamilyTree(
      [m(1, "Parent"), m(2, "Kid"), m(3, "Sib")],
      [rel(1, 1, 2, "PARENT"), rel(2, 2, 3, "SIBLING")],
    );
    expect(nodeOf(layout, 3).generation).toBe(nodeOf(layout, 2).generation);
    expect(kinds(layout)).toEqual(["parent", "sibling"]);
  });

  it("doesn't bracket siblings who already share a parent", () => {
    const layout = layoutFamilyTree(
      [m(1, "Parent"), m(2, "Kid"), m(3, "Sib")],
      [rel(1, 1, 2, "PARENT"), rel(2, 1, 3, "PARENT"), rel(3, 2, 3, "SIBLING")],
    );
    expect(kinds(layout)).toEqual(["parent", "parent"]);
  });

  it("never overlaps cards in a large generated tree", () => {
    const members: FamilyMember[] = [];
    const relationships: Relationship[] = [];
    let id = 1;
    let relId = 1;
    const couple = () => {
      const a = m(id++, "A");
      const b = m(id++, "B");
      members.push(a, b);
      relationships.push(rel(relId++, a.id, b.id, "SPOUSE"));
      return [a.id, b.id];
    };
    let parents = [couple()];
    for (let gen = 0; gen < 3; gen += 1) {
      const next: number[][] = [];
      for (const [p1, p2] of parents) {
        for (let k = 0; k < 3; k += 1) {
          const [child, partner] = couple();
          relationships.push(rel(relId++, p1, child, "PARENT"), rel(relId++, p2, child, "PARENT"));
          if (k === 0) next.push([child, partner]);
        }
      }
      parents = next;
    }
    const layout = layoutFamilyTree(members, relationships);
    expect(layout.nodes).toHaveLength(members.length);
    expect(new Set(layout.nodes.map((n) => n.generation))).toEqual(new Set([0, 1, 2, 3]));
    noOverlap(layout);
    for (const node of layout.nodes) {
      expect(node.x).toBeGreaterThanOrEqual(92);
      expect(node.x + CARD_WIDTH).toBeLessThanOrEqual(layout.width - 92 + 0.001);
    }
  });
});

describe("roundedPath", () => {
  it("rounds orthogonal corners", () => {
    const d = roundedPath([[0, 0], [0, 50], [100, 50], [100, 100]]);
    expect(d.startsWith("M 0 0")).toBe(true);
    expect(d.match(/Q/g)).toHaveLength(2);
    expect(d.endsWith("L 100 100")).toBe(true);
  });
});
