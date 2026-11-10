// Turns API members + relationships into card positions for the canvas.
// Pure (no React) so it can be unit-tested.
import type { FamilyMember, Relationship } from "../../../../services/trees";

// Card size and spacing from the Figma canvas (156×132 cards, 24px apart,
// generations 190px apart).
export const CARD_WIDTH = 156;
export const CARD_HEIGHT = 132;
export const COLUMN_GAP = 24;
export const ROW_GAP = 58;
export const CANVAS_PADDING_X = 92;
export const CANVAS_PADDING_TOP = 64;
export const CANVAS_PADDING_BOTTOM = 72;

export type PositionedMember = {
  member: FamilyMember;
  generation: number;
  x: number;
  y: number;
};

export type ParentLink = { parentId: number; childId: number };
export type SpouseLink = { memberA: number; memberB: number };

export type FamilyTreeLayout = {
  nodes: PositionedMember[];
  parentLinks: ParentLink[];
  spouseLinks: SpouseLink[];
  width: number;
  height: number;
};

const isParentType = (type: Relationship["relationship_type"]) =>
  type === "PARENT" || type === "ADOPTIVE_PARENT";

export const layoutFamilyTree = (
  members: FamilyMember[],
  relationships: Relationship[],
): FamilyTreeLayout => {
  const ids = new Set(members.map((member) => member.id));
  const known = relationships.filter(
    (rel) => ids.has(rel.member1) && ids.has(rel.member2),
  );

  // PARENT / ADOPTIVE_PARENT: member1 is the parent of member2.
  const parentLinks: ParentLink[] = known
    .filter((rel) => isParentType(rel.relationship_type))
    .map((rel) => ({ parentId: rel.member1, childId: rel.member2 }));
  const spouseLinks: SpouseLink[] = known
    .filter((rel) => rel.relationship_type === "SPOUSE")
    .map((rel) => ({ memberA: rel.member1, memberB: rel.member2 }));
  const siblingPairs = known
    .filter((rel) => rel.relationship_type === "SIBLING")
    .map((rel) => [rel.member1, rel.member2] as const);

  // Generation: children sit below their parents; spouses and siblings share
  // a row. Relax until stable; the pass cap stops bad data (cycles) looping.
  const generation = new Map(members.map((member) => [member.id, 0]));
  for (let pass = 0; pass <= members.length + 1; pass += 1) {
    let changed = false;
    const raise = (id: number, value: number) => {
      if ((generation.get(id) ?? 0) < value) {
        generation.set(id, value);
        changed = true;
      }
    };
    for (const { parentId, childId } of parentLinks) {
      raise(childId, (generation.get(parentId) ?? 0) + 1);
    }
    for (const [a, b] of [
      ...spouseLinks.map((link) => [link.memberA, link.memberB] as const),
      ...siblingPairs,
    ]) {
      const level = Math.max(generation.get(a) ?? 0, generation.get(b) ?? 0);
      raise(a, level);
      raise(b, level);
    }
    if (!changed) break;
  }

  const parentsOf = new Map<number, number[]>();
  for (const { parentId, childId } of parentLinks) {
    parentsOf.set(childId, [...(parentsOf.get(childId) ?? []), parentId]);
  }
  const spousesOf = new Map<number, number[]>();
  for (const { memberA, memberB } of spouseLinks) {
    spousesOf.set(memberA, [...(spousesOf.get(memberA) ?? []), memberB]);
    spousesOf.set(memberB, [...(spousesOf.get(memberB) ?? []), memberA]);
  }

  const rows = new Map<number, FamilyMember[]>();
  for (const member of members) {
    const level = generation.get(member.id) ?? 0;
    rows.set(level, [...(rows.get(level) ?? []), member]);
  }
  const levels = [...rows.keys()].sort((a, b) => a - b);

  // Order each row under its parents (mean parent slot), keeping spouses
  // side by side. Slots are provisional column indexes; centring comes later.
  const slot = new Map<number, number>();
  const orderedRows: FamilyMember[][] = [];
  for (const level of levels) {
    const row = rows.get(level) ?? [];
    const inputOrder = new Map(row.map((member, index) => [member.id, index]));
    const anchor = (id: number): number | null => {
      const placed = (parentsOf.get(id) ?? []).filter((p) => slot.has(p));
      if (!placed.length) return null;
      return placed.reduce((sum, p) => sum + (slot.get(p) ?? 0), 0) / placed.length;
    };
    const sortKey = (member: FamilyMember): number => {
      const own = anchor(member.id);
      if (own !== null) return own;
      // Married into the family: sit next to the spouse who has parents here.
      for (const spouse of spousesOf.get(member.id) ?? []) {
        const spouseAnchor = anchor(spouse);
        if (spouseAnchor !== null) return spouseAnchor + 0.01;
      }
      return Number.MAX_SAFE_INTEGER / 2 + (inputOrder.get(member.id) ?? 0);
    };
    const sorted = [...row].sort((a, b) => sortKey(a) - sortKey(b));

    const ordered: FamilyMember[] = [];
    const added = new Set<number>();
    const rowIds = new Set(row.map((member) => member.id));
    for (const member of sorted) {
      if (added.has(member.id)) continue;
      ordered.push(member);
      added.add(member.id);
      for (const spouseId of spousesOf.get(member.id) ?? []) {
        if (rowIds.has(spouseId) && !added.has(spouseId)) {
          const spouse = row.find((candidate) => candidate.id === spouseId);
          if (spouse) {
            ordered.push(spouse);
            added.add(spouseId);
          }
        }
      }
    }
    ordered.forEach((member, index) => slot.set(member.id, index));
    orderedRows.push(ordered);
  }

  const step = CARD_WIDTH + COLUMN_GAP;
  const rowWidth = (count: number) => count * CARD_WIDTH + (count - 1) * COLUMN_GAP;
  const widest = Math.max(0, ...orderedRows.map((row) => rowWidth(row.length)));
  const width = widest + CANVAS_PADDING_X * 2;

  const nodes: PositionedMember[] = [];
  orderedRows.forEach((row, rowIndex) => {
    const offset = CANVAS_PADDING_X + (widest - rowWidth(row.length)) / 2;
    row.forEach((member, index) => {
      nodes.push({
        member,
        generation: levels[rowIndex],
        x: offset + index * step,
        y: CANVAS_PADDING_TOP + rowIndex * (CARD_HEIGHT + ROW_GAP),
      });
    });
  });

  const height =
    orderedRows.length === 0
      ? 0
      : CANVAS_PADDING_TOP +
        orderedRows.length * CARD_HEIGHT +
        (orderedRows.length - 1) * ROW_GAP +
        CANVAS_PADDING_BOTTOM;

  return { nodes, parentLinks, spouseLinks, width, height };
};

const yearOf = (date: string | null) => (date ? date.slice(0, 4) : null);

// "1898 – 1974", "Born 1967", "Died 1974" or "" (no dates recorded).
export const lifeSpan = (member: Pick<FamilyMember, "birth_date" | "death_date">) => {
  const born = yearOf(member.birth_date);
  const died = yearOf(member.death_date);
  if (born && died) return `${born} – ${died}`;
  if (born) return `Born ${born}`;
  if (died) return `Died ${died}`;
  return "";
};

export const initialsOf = (member: Pick<FamilyMember, "first_name" | "last_name">) =>
  `${member.first_name.charAt(0)}${member.last_name.charAt(0)}`.toUpperCase();
