
export type DemoMember = {
  id: number;
  fullName: string;
};

export type DemoRelationship = {
  id: number;
  member1: number;
  member2: number;
  relationshipType: string;
};

type Props = {
  members: DemoMember[];
  relationships: DemoRelationship[];
};

export const FamilyTreeCanvas = ({
  members,
  relationships,
}: Props): JSX.Element => {
  const connectedIds = new Set(
    relationships.flatMap((relationship) => [
      relationship.member1,
      relationship.member2,
    ]),
  );

  // The first person is always visible.
  // Additional people appear only when connected.
  const visibleMembers = members.filter(
    (member, index) =>
      index === 0 || connectedIds.has(member.id),
  );

  const positions = new Map(
    visibleMembers.map((member, index) => [
      member.id,
      {
        x: 140 + (index % 4) * 260,
        y: 120 + Math.floor(index / 4) * 190,
      },
    ]),
  );

  const canvasWidth = 1100;
  const canvasHeight = Math.max(
    450,
    240 + Math.ceil(visibleMembers.length / 4) * 190,
  );

  return (
    <section
      id="family-tree"
      aria-label="Family tree visualization"
      className="relative flex-1 overflow-auto bg-[#f6f4ee]"
    >
      <div
        className="relative min-h-full"
        style={{
          width: canvasWidth,
          minHeight: canvasHeight,
          backgroundImage:
            "radial-gradient(#c9c8bf 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        {visibleMembers.length === 0 && (
          <p className="absolute left-8 top-8 text-[#777970]">
            Your family tree is empty. Add your first member.
          </p>
        )}

        <svg
          className="absolute inset-0"
          width={canvasWidth}
          height={canvasHeight}
          aria-hidden="true"
        >
          {relationships.map((relationship) => {
            const first = positions.get(relationship.member1);
            const second = positions.get(relationship.member2);

            if (!first || !second) return null;

            return (
              <line
                key={relationship.id}
                x1={first.x}
                y1={first.y}
                x2={second.x}
                y2={second.y}
                stroke="#617b58"
                strokeWidth="2"
              />
            );
          })}
        </svg>

        {visibleMembers.map((member) => {
          const position = positions.get(member.id)!;

          return (
            <div
              key={member.id}
              className="absolute z-10 flex h-[90px] w-[180px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-xl border border-[#dedcd2] bg-white p-4 shadow-md"
              style={{
                left: position.x,
                top: position.y,
              }}
            >
              <span className="mb-2 text-[#355b43]">●</span>
              <strong className="text-center text-sm text-[#283b30]">
                {member.fullName}
              </strong>
            </div>
          );
        })}

        {relationships.map((relationship) => {
          const first = positions.get(relationship.member1);
          const second = positions.get(relationship.member2);

          if (!first || !second) return null;

          return (
            <span
              key={`label-${relationship.id}`}
              className="absolute z-20 rounded bg-white px-2 py-1 text-xs text-[#355b43]"
              style={{
                left: (first.x + second.x) / 2,
                top: (first.y + second.y) / 2,
                transform: "translate(-50%, -50%)",
              }}
            >
              {relationship.relationshipType.replaceAll("_", " ")}
            </span>
          );
        })}
      </div>
    </section>
  );
};
