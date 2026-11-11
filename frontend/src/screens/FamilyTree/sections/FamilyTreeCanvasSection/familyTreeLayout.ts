// Turns API members + relationships into card positions and connector paths
// for the canvas. Pure (no React, no DOM) so it can be unit-tested.
//
// Data model (backend trees/models.py Relationship):
//   PARENT / ADOPTIVE_PARENT  member1 is the parent of member2
//   SPOUSE / SIBLING          symmetric; stored lowest id first
//   (CHILD is accepted by the API but stored as a reversed PARENT.)
// Nothing here assumes gender, two-parent households or one marriage.
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

const STEP = CARD_WIDTH + COLUMN_GAP;
const CORNER_RADIUS = 10;
// How far above the cards spouse/sibling links route when they can't be a
// straight line between neighbours.
const OVERHEAD_LIFT = 18;

export type PositionedMember = {
  member: FamilyMember;
  generation: number;
  x: number;
  y: number;
};

export type ParentLink = { parentId: number; childId: number; adoptive: boolean };
export type SpouseLink = { memberA: number; memberB: number };
export type SiblingLink = { memberA: number; memberB: number };

export type EdgeKind = "parent" | "adoptive" | "spouse" | "sibling";

export type Edge = {
  key: string;
  kind: EdgeKind;
  // SVG path in canvas coordinates.
  d: string;
};

export type Marker = { key: string; x: number; y: number };

export type FamilyTreeLayout = {
  nodes: PositionedMember[];
  parentLinks: ParentLink[];
  spouseLinks: SpouseLink[];
  siblingLinks: SiblingLink[];
  edges: Edge[];
  // Marriage markers (centre points).
  markers: Marker[];
  width: number;
  height: number;
};

type Point = [number, number];

// Orthogonal polyline with rounded corners ("smooth connectors").
export const roundedPath = (points: Point[], radius = CORNER_RADIUS): string => {
  const clean = points.filter(
    (point, index) =>
      index === 0 ||
      point[0] !== points[index - 1][0] ||
      point[1] !== points[index - 1][1],
  );
  if (clean.length < 2) return "";
  let d = `M ${clean[0][0]} ${clean[0][1]}`;
  for (let i = 1; i < clean.length - 1; i += 1) {
    const [px, py] = clean[i - 1];
    const [cx, cy] = clean[i];
    const [nx, ny] = clean[i + 1];
    const inLength = Math.hypot(cx - px, cy - py);
    const outLength = Math.hypot(nx - cx, ny - cy);
    const r = Math.min(radius, inLength / 2, outLength / 2);
    const ax = cx - ((cx - px) / inLength) * r;
    const ay = cy - ((cy - py) / inLength) * r;
    const bx = cx + ((nx - cx) / outLength) * r;
    const by = cy + ((ny - cy) / outLength) * r;
    d += ` L ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}`;
  }
  const [lx, ly] = clean[clean.length - 1];
  return `${d} L ${lx} ${ly}`;
};

const pairKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);

export const layoutFamilyTree = (
  members: FamilyMember[],
  relationships: Relationship[],
): FamilyTreeLayout => {
  const ids = new Set(members.map((member) => member.id));
  const known = relationships.filter(
    (rel) =>
      ids.has(rel.member1) && ids.has(rel.member2) && rel.member1 !== rel.member2,
  );

  const parentLinks: ParentLink[] = known
    .filter(
      (rel) =>
        rel.relationship_type === "PARENT" ||
        rel.relationship_type === "ADOPTIVE_PARENT",
    )
    .map((rel) => ({
      parentId: rel.member1,
      childId: rel.member2,
      adoptive: rel.relationship_type === "ADOPTIVE_PARENT",
    }));
  const spouseLinks: SpouseLink[] = known
    .filter((rel) => rel.relationship_type === "SPOUSE")
    .map((rel) => ({ memberA: rel.member1, memberB: rel.member2 }));
  const siblingLinks: SiblingLink[] = known
    .filter((rel) => rel.relationship_type === "SIBLING")
    .map((rel) => ({ memberA: rel.member1, memberB: rel.member2 }));

  // ----- 1. Generations -----
  // Children sit below all their parents; spouses and siblings share a row.
  // Relax until stable; the pass cap stops bad data (cycles) looping.
  const generation = new Map(members.map((member) => [member.id, 0]));
  const sameRowPairs = [
    ...spouseLinks.map((link) => [link.memberA, link.memberB] as const),
    ...siblingLinks.map((link) => [link.memberA, link.memberB] as const),
  ];
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
    for (const [a, b] of sameRowPairs) {
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
  const siblingsOf = new Map<number, number[]>();
  for (const { memberA, memberB } of siblingLinks) {
    siblingsOf.set(memberA, [...(siblingsOf.get(memberA) ?? []), memberB]);
    siblingsOf.set(memberB, [...(siblingsOf.get(memberB) ?? []), memberA]);
  }

  const rows = new Map<number, FamilyMember[]>();
  for (const member of members) {
    const level = generation.get(member.id) ?? 0;
    rows.set(level, [...(rows.get(level) ?? []), member]);
  }
  const levels = [...rows.keys()].sort((a, b) => a - b);
  const inputOrder = new Map(members.map((member, index) => [member.id, index]));

  // ----- 2. Horizontal placement, row by row -----
  // Each row is split into blocks (a person plus everyone they're married to
  // on that row, so couples stay side by side). A block wants to sit under
  // its members' parents; blocks are then pushed apart so cards never
  // overlap, and the row is shifted to best match where it wanted to be.
  const centreX = new Map<number, number>();

  for (const level of levels) {
    const row = rows.get(level) ?? [];
    const rowIds = new Set(row.map((member) => member.id));

    const desired = new Map<number, number>();
    for (const member of row) {
      const placedParents = (parentsOf.get(member.id) ?? []).filter((p) =>
        centreX.has(p),
      );
      if (placedParents.length) {
        desired.set(
          member.id,
          placedParents.reduce((sum, p) => sum + (centreX.get(p) ?? 0), 0) /
            placedParents.length,
        );
      }
    }
    // Siblings without parents in the tree follow a sibling who has some.
    for (const member of row) {
      if (desired.has(member.id)) continue;
      const sibling = (siblingsOf.get(member.id) ?? []).find((s) => desired.has(s));
      if (sibling !== undefined) desired.set(member.id, desired.get(sibling) ?? 0);
    }

    // Spouse components on this row, ordered as a chain where possible.
    const blocks: number[][] = [];
    const assigned = new Set<number>();
    const byInput = [...row].sort(
      (a, b) => (inputOrder.get(a.id) ?? 0) - (inputOrder.get(b.id) ?? 0),
    );
    for (const member of byInput) {
      if (assigned.has(member.id)) continue;
      const component: number[] = [];
      const stack = [member.id];
      while (stack.length) {
        const id = stack.pop() as number;
        if (assigned.has(id)) continue;
        assigned.add(id);
        component.push(id);
        for (const spouse of spousesOf.get(id) ?? []) {
          if (rowIds.has(spouse) && !assigned.has(spouse)) stack.push(spouse);
        }
      }
      // Chain order: start from an end (one spouse on the row), walk along.
      const degree = (id: number) =>
        (spousesOf.get(id) ?? []).filter((s) => component.includes(s)).length;
      const start =
        component.find((id) => degree(id) <= 1 && desired.has(id)) ??
        component.find((id) => degree(id) <= 1) ??
        component[0];
      const ordered: number[] = [];
      const visit = (id: number) => {
        if (ordered.includes(id)) return;
        ordered.push(id);
        for (const spouse of spousesOf.get(id) ?? []) {
          if (component.includes(spouse)) visit(spouse);
        }
      };
      visit(start);
      for (const id of component) if (!ordered.includes(id)) ordered.push(id);
      // Put the member with parents further left on the left.
      const first = desired.get(ordered[0]);
      const last = desired.get(ordered[ordered.length - 1]);
      if (
        (first !== undefined && last !== undefined && last < first) ||
        (first === undefined && last !== undefined)
      ) {
        ordered.reverse();
      }
      blocks.push(ordered);
    }

    // Where each block's left edge wants to be.
    const wantedLeft = (block: number[]): number | null => {
      const wishes = block
        .map((id, index) =>
          desired.has(id)
            ? (desired.get(id) ?? 0) - CARD_WIDTH / 2 - index * STEP
            : null,
        )
        .filter((value): value is number => value !== null);
      return wishes.length
        ? wishes.reduce((sum, value) => sum + value, 0) / wishes.length
        : null;
    };
    const wanted = new Map(blocks.map((block) => [block, wantedLeft(block)]));
    blocks.sort((a, b) => {
      const wa = wanted.get(a);
      const wb = wanted.get(b);
      if (wa != null && wb != null && wa !== wb) return wa - wb;
      if (wa != null && wb == null) return -1;
      if (wa == null && wb != null) return 1;
      return (inputOrder.get(a[0]) ?? 0) - (inputOrder.get(b[0]) ?? 0);
    });

    let cursor = -Infinity;
    const placedLeft = new Map<number[], number>();
    for (const block of blocks) {
      const want = wanted.get(block);
      const left =
        cursor === -Infinity
          ? (want ?? 0)
          : Math.max(want ?? cursor, cursor);
      placedLeft.set(block, left);
      cursor = left + block.length * STEP;
    }
    // Shift the row so blocks that wanted a position are, on average, there.
    const deltas = blocks
      .filter((block) => wanted.get(block) != null)
      .map((block) => (wanted.get(block) ?? 0) - (placedLeft.get(block) ?? 0));
    const shift = deltas.length
      ? deltas.reduce((sum, value) => sum + value, 0) / deltas.length
      : 0;
    for (const block of blocks) {
      const left = (placedLeft.get(block) ?? 0) + shift;
      block.forEach((id, index) => {
        centreX.set(id, left + index * STEP + CARD_WIDTH / 2);
      });
    }
  }

  // ----- 3. Normalise into canvas coordinates -----
  const lefts = members.map((member) => (centreX.get(member.id) ?? 0) - CARD_WIDTH / 2);
  const minLeft = lefts.length ? Math.min(...lefts) : 0;
  const maxRight = lefts.length ? Math.max(...lefts) + CARD_WIDTH : 0;
  const offsetX = CANVAS_PADDING_X - minLeft;
  const rowIndex = new Map(levels.map((level, index) => [level, index]));

  const nodes: PositionedMember[] = members.map((member) => {
    const level = generation.get(member.id) ?? 0;
    return {
      member,
      generation: level,
      x: (centreX.get(member.id) ?? 0) - CARD_WIDTH / 2 + offsetX,
      y: CANVAS_PADDING_TOP + (rowIndex.get(level) ?? 0) * (CARD_HEIGHT + ROW_GAP),
    };
  });
  const position = new Map(nodes.map((node) => [node.member.id, node]));

  const width = members.length ? maxRight - minLeft + CANVAS_PADDING_X * 2 : 0;
  const height = levels.length
    ? CANVAS_PADDING_TOP +
      levels.length * CARD_HEIGHT +
      (levels.length - 1) * ROW_GAP +
      CANVAS_PADDING_BOTTOM
    : 0;

  // ----- 4. Connectors -----
  const edges: Edge[] = [];
  const markers: Marker[] = [];
  const spousePairs = new Set(spouseLinks.map((l) => pairKey(l.memberA, l.memberB)));
  const adjacentOnRow = (a: PositionedMember, b: PositionedMember) =>
    a.y === b.y && Math.abs(a.x - b.x) === STEP;

  // Spouses.
  const spouseMidpoint = new Map<string, Point>();
  for (const { memberA, memberB } of spouseLinks) {
    const a = position.get(memberA);
    const b = position.get(memberB);
    if (!a || !b) continue;
    const key = pairKey(memberA, memberB);
    if (adjacentOnRow(a, b)) {
      const [left, right] = a.x < b.x ? [a, b] : [b, a];
      const y = left.y + CARD_HEIGHT / 2;
      const mid: Point = [(left.x + CARD_WIDTH + right.x) / 2, y];
      edges.push({
        key: `spouse-${key}`,
        kind: "spouse",
        d: `M ${left.x + CARD_WIDTH} ${y} L ${right.x} ${y}`,
      });
      markers.push({ key: `marker-${key}`, x: mid[0], y: mid[1] });
      spouseMidpoint.set(key, mid);
    } else if (a.y === b.y) {
      // Not neighbours (e.g. remarriage): route over the cards in between.
      const [left, right] = a.x < b.x ? [a, b] : [b, a];
      const top = left.y - OVERHEAD_LIFT;
      const x1 = left.x + CARD_WIDTH / 2;
      const x2 = right.x + CARD_WIDTH / 2;
      edges.push({
        key: `spouse-${key}`,
        kind: "spouse",
        d: roundedPath([[x1, left.y], [x1, top], [x2, top], [x2, right.y]]),
      });
      markers.push({ key: `marker-${key}`, x: (x1 + x2) / 2, y: top });
    } else {
      // Different rows (only with conflicting data): plain link, no marker.
      const ax = a.x + CARD_WIDTH / 2;
      const bx = b.x + CARD_WIDTH / 2;
      const [upper, lower] = a.y < b.y ? [a, b] : [b, a];
      edges.push({
        key: `spouse-${key}`,
        kind: "spouse",
        d: roundedPath([
          [upper === a ? ax : bx, upper.y + CARD_HEIGHT],
          [upper === a ? ax : bx, lower.y - ROW_GAP / 2],
          [lower === a ? ax : bx, lower.y - ROW_GAP / 2],
          [lower === a ? ax : bx, lower.y],
        ]),
      });
    }
  }

  // Parents → child. When a child's two parents (same kind of link) are a
  // couple side by side, one line drops from their marriage marker.
  const byChild = new Map<number, ParentLink[]>();
  for (const link of parentLinks) {
    byChild.set(link.childId, [...(byChild.get(link.childId) ?? []), link]);
  }
  for (const [childId, links] of byChild) {
    const child = position.get(childId);
    if (!child) continue;
    const childX = child.x + CARD_WIDTH / 2;
    const busY = child.y - ROW_GAP / 2;
    const handled = new Set<ParentLink>();

    for (const adoptive of [false, true]) {
      const group = links.filter((link) => link.adoptive === adoptive);
      if (group.length !== 2) continue;
      const [p1, p2] = group;
      const key = pairKey(p1.parentId, p2.parentId);
      const mid = spouseMidpoint.get(key);
      const a = position.get(p1.parentId);
      if (!mid || !a || !spousePairs.has(key) || a.y >= child.y) continue;
      edges.push({
        key: `${adoptive ? "adoptive" : "parent"}-couple-${key}-${childId}`,
        kind: adoptive ? "adoptive" : "parent",
        d: roundedPath([
          [mid[0], mid[1] + 13], // just below the marker
          [mid[0], busY],
          [childX, busY],
          [childX, child.y],
        ]),
      });
      handled.add(p1);
      handled.add(p2);
    }

    for (const link of links) {
      if (handled.has(link)) continue;
      const parent = position.get(link.parentId);
      if (!parent) continue;
      const parentX = parent.x + CARD_WIDTH / 2;
      edges.push({
        key: `${link.adoptive ? "adoptive" : "parent"}-${link.parentId}-${childId}`,
        kind: link.adoptive ? "adoptive" : "parent",
        d: roundedPath([
          [parentX, parent.y + CARD_HEIGHT],
          [parentX, busY],
          [childX, busY],
          [childX, child.y],
        ]),
      });
    }
  }

  // Explicit siblings who don't already share a parent in the tree: a
  // bracket over their cards.
  for (const { memberA, memberB } of siblingLinks) {
    const sharesParent = (parentsOf.get(memberA) ?? []).some((p) =>
      (parentsOf.get(memberB) ?? []).includes(p),
    );
    if (sharesParent) continue;
    const a = position.get(memberA);
    const b = position.get(memberB);
    if (!a || !b) continue;
    const ax = a.x + CARD_WIDTH / 2;
    const bx = b.x + CARD_WIDTH / 2;
    const top = Math.min(a.y, b.y) - OVERHEAD_LIFT;
    edges.push({
      key: `sibling-${pairKey(memberA, memberB)}`,
      kind: "sibling",
      d: roundedPath([[ax, a.y], [ax, top], [bx, top], [bx, b.y]]),
    });
  }

  return { nodes, parentLinks, spouseLinks, siblingLinks, edges, markers, width, height };
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
