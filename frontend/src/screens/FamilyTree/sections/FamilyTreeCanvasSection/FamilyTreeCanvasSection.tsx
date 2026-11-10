import { useMemo, useRef, useState } from "react";
import type { FamilyMember, Relationship } from "../../../../services/trees";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  ROW_GAP,
  initialsOf,
  layoutFamilyTree,
  lifeSpan,
} from "./familyTreeLayout";

type FamilyTreeCanvasSectionProps = {
  treeName: string;
  members: FamilyMember[];
  relationships: Relationship[];
  selectedMemberId: number | null;
  onSelectMember: (member: FamilyMember) => void;
};

const zoomLevels = [75, 100, 125];
const DEFAULT_ZOOM_INDEX = 1;
const HEART_ICON = "/img/relationship-heart-11.svg";
const LINE_COLOUR = "#a2ae9c";

const memberCardClass =
  "bg-[#fffdf9] border border-solid border-[#dedcd2] flex flex-col w-[156px] h-[132px] items-center gap-[5px] pt-3 pb-2.5 px-1.5 absolute rounded-xl overflow-hidden shadow-[0px_3px_8px_#3444320a] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[0px_6px_14px_#34443214] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#355b43]";

export const FamilyTreeCanvasSection = ({
  treeName,
  members,
  relationships,
  selectedMemberId,
  onSelectMember,
}: FamilyTreeCanvasSectionProps): JSX.Element => {
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const canvasRef = useRef<HTMLElement>(null);

  const layout = useMemo(
    () => layoutFamilyTree(members, relationships),
    [members, relationships],
  );
  const positionOf = useMemo(
    () => new Map(layout.nodes.map((node) => [node.member.id, node])),
    [layout],
  );

  const scale = zoomLevels[zoomIndex] / 100;

  const zoomOut = (): void => {
    setZoomIndex((current) => Math.max(0, current - 1));
  };
  const zoomIn = (): void => {
    setZoomIndex((current) => Math.min(zoomLevels.length - 1, current + 1));
  };
  const resetZoom = (): void => {
    setZoomIndex(DEFAULT_ZOOM_INDEX);
  };

  const toggleFullscreen = async (): Promise<void> => {
    if (!document.fullscreenElement && canvasRef.current) {
      await canvasRef.current.requestFullscreen();
    } else if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  };

  const isEmpty = members.length === 0;

  return (
    <section
      ref={canvasRef}
      aria-label={`${treeName} family tree`}
      className="relative flex min-h-[520px] flex-1 flex-col bg-[#f6f4ee]"
    >
      <div
        className="absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage: "radial-gradient(#c9c8bf 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {isEmpty ? (
        <div className="relative flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
          <p className="[font-family:'Lora',Helvetica] text-[22px] text-[#283b30]">
            No family members yet
          </p>
          <p className="max-w-[420px] [font-family:'Inter',Helvetica] text-[13px] leading-[20px] text-[#7b8177]">
            People appear here as soon as they're added to this tree.
          </p>
        </div>
      ) : (
        // Scrolling is the pan; the inner box is sized to the scaled tree so
        // scrollbars match the zoom level.
        <div className="relative flex-1 overflow-auto" tabIndex={-1}>
          <div
            className="relative mx-auto"
            style={{
              width: layout.width * scale,
              height: layout.height * scale,
            }}
          >
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{
                width: layout.width,
                height: layout.height,
                transform: `scale(${scale})`,
              }}
            >
              <svg
                className="absolute inset-0"
                width={layout.width}
                height={layout.height}
                aria-hidden="true"
              >
                {layout.parentLinks.map(({ parentId, childId }) => {
                  const parent = positionOf.get(parentId);
                  const child = positionOf.get(childId);
                  if (!parent || !child) return null;
                  const x1 = parent.x + CARD_WIDTH / 2;
                  const y1 = parent.y + CARD_HEIGHT;
                  const x2 = child.x + CARD_WIDTH / 2;
                  const y2 = child.y;
                  const elbow = y2 - ROW_GAP / 2;
                  return (
                    <path
                      key={`parent-${parentId}-${childId}`}
                      d={`M ${x1} ${y1} V ${elbow} H ${x2} V ${y2}`}
                      fill="none"
                      stroke={LINE_COLOUR}
                      strokeWidth={1.5}
                    />
                  );
                })}
                {layout.spouseLinks.map(({ memberA, memberB }) => {
                  const a = positionOf.get(memberA);
                  const b = positionOf.get(memberB);
                  if (!a || !b || a.y !== b.y) return null;
                  const [left, right] = a.x < b.x ? [a, b] : [b, a];
                  const y = left.y + CARD_HEIGHT / 2;
                  return (
                    <line
                      key={`spouse-${memberA}-${memberB}`}
                      x1={left.x + CARD_WIDTH}
                      y1={y}
                      x2={right.x}
                      y2={y}
                      stroke={LINE_COLOUR}
                      strokeWidth={1.5}
                    />
                  );
                })}
              </svg>

              {layout.spouseLinks.map(({ memberA, memberB }) => {
                const a = positionOf.get(memberA);
                const b = positionOf.get(memberB);
                if (!a || !b || a.y !== b.y) return null;
                const [left, right] = a.x < b.x ? [a, b] : [b, a];
                const centreX = (left.x + CARD_WIDTH + right.x) / 2;
                return (
                  <div
                    key={`marker-${memberA}-${memberB}`}
                    className="flex w-[26px] h-[26px] items-center justify-center absolute bg-[#f6f4ee] rounded-[100px] overflow-hidden"
                    style={{
                      top: left.y + CARD_HEIGHT / 2 - 13,
                      left: centreX - 13,
                    }}
                    aria-hidden="true"
                  >
                    <img className="relative w-3.5 h-[13px]" alt="" src={HEART_ICON} />
                  </div>
                );
              })}

              {layout.nodes.map(({ member, x, y }) => {
                const selected = member.id === selectedMemberId;
                const dates = lifeSpan(member);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => onSelectMember(member)}
                    aria-label={`View details for ${member.full_name}`}
                    aria-pressed={selected}
                    className={`${memberCardClass} ${
                      selected
                        ? "bg-[#f2f6ed] border-2 border-solid border-[#355b43]"
                        : ""
                    }`}
                    style={{ top: y, left: x }}
                  >
                    {member.photo_url ? (
                      <img
                        className="relative w-10 h-10 object-cover rounded-[100px]"
                        alt=""
                        src={member.photo_url}
                      />
                    ) : (
                      <span className="flex w-10 h-10 items-center justify-center relative bg-[#ece9e0] rounded-[100px] overflow-hidden">
                        <span className="relative w-fit [font-family:'Lora',Helvetica] font-normal text-[#617b58] text-[15px] tracking-[0] leading-[normal]">
                          {initialsOf(member)}
                        </span>
                      </span>
                    )}
                    <span className="relative self-stretch line-clamp-2 [font-family:'Inter',Helvetica] font-semibold text-[#283b30] text-[13px] text-center tracking-[0] leading-[normal]">
                      {member.full_name}
                    </span>
                    {dates && (
                      <span className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-[11px] tracking-[0] leading-[normal] whitespace-nowrap">
                        {dates}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="relative flex flex-wrap items-center justify-between gap-4 px-9 py-4">
        <aside
          aria-label="Relationship legend"
          className={`inline-flex h-9 items-center gap-5 ${isEmpty ? "invisible" : ""}`}
        >
          <div className="relative w-fit [font-family:'Inter',Helvetica] font-semibold text-[#7b8177] text-[11px] tracking-[0] leading-[normal] whitespace-nowrap">
            Relationships:
          </div>
          <div className="inline-flex items-center gap-1.5 relative flex-[0_0_auto]">
            <div className="flex w-[26px] h-[26px] items-center justify-center relative bg-[#f6f4ee] rounded-[100px] overflow-hidden">
              <img className="relative w-3.5 h-[13px]" alt="" src={HEART_ICON} />
            </div>
            <div className="font-normal text-[#7b8177] text-[11px] whitespace-nowrap relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
              Married
            </div>
          </div>
          <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
            <div className="relative w-5 h-[1.5px] bg-[#a2ae9c]" />
            <div className="mt-[-1.00px] font-normal text-[#7b8177] text-[11px] whitespace-nowrap relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
              Parent–child
            </div>
          </div>
        </aside>
        <nav
          aria-label="Canvas controls"
          className={`inline-flex h-10 items-center gap-3.5 ${isEmpty ? "invisible" : ""}`}
        >
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
            className="flex w-10 h-10 items-center justify-center relative bg-[#fffdf9] rounded-lg overflow-hidden border border-solid border-[#dedcd2]"
          >
            <span className="relative w-[18px] h-[18px]">
              <img
                className="absolute w-[91.94%] h-[91.94%] top-[8.06%] left-[8.06%]"
                alt=""
                src="/img/vector-43.svg"
              />
            </span>
          </button>
          <div className="inline-flex h-10 items-center gap-5 px-3.5 py-0 relative flex-[0_0_auto] bg-[#fffdf9] rounded-lg overflow-hidden border border-solid border-[#dedcd2]">
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoomIndex === 0}
              aria-label="Zoom out"
              className="relative w-4 h-4 disabled:opacity-40"
            >
              <img
                className="absolute w-[84.17%] h-[55.00%] top-[45.00%] left-[15.83%]"
                alt=""
                src="/img/vector-44.svg"
              />
            </button>
            <button
              type="button"
              onClick={resetZoom}
              aria-label={`Zoom ${zoomLevels[zoomIndex]}%, reset`}
              className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#283b30] text-xs tracking-[0] leading-[normal]"
            >
              {zoomLevels[zoomIndex]}%
            </button>
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoomIndex === zoomLevels.length - 1}
              aria-label="Zoom in"
              className="relative w-4 h-4 disabled:opacity-40"
            >
              <img
                className="absolute w-[84.17%] h-[84.17%] top-[15.83%] left-[15.83%]"
                alt=""
                src="/img/vector-45.svg"
              />
            </button>
          </div>
        </nav>
      </div>
    </section>
  );
};
