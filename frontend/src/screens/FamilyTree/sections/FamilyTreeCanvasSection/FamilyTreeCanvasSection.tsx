import {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { FamilyMember, Relationship } from "../../../../services/trees";
import {
  EdgeKind,
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
  // Shown under the empty-state message (role-specific actions).
  emptyActions?: ReactNode;
};

type View = { x: number; y: number; scale: number };

export const MIN_SCALE = 0.25;
export const MAX_SCALE = 2;
const ZOOM_STEP = 1.2;
const PAN_STEP = 60;
const FIT_MARGIN = 48;
// Movement (px) before a press on a card counts as a drag, not a click.
const DRAG_THRESHOLD = 4;
const HEART_ICON = "/img/relationship-heart-11.svg";
const LINE_COLOUR = "#a2ae9c";

const clampScale = (scale: number) =>
  Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));

const edgeStyle: Record<EdgeKind, { strokeDasharray?: string }> = {
  parent: {},
  spouse: {},
  adoptive: { strokeDasharray: "6 4" },
  sibling: { strokeDasharray: "2 4" },
};

const memberCardClass =
  "bg-[#fffdf9] border border-solid border-[#dedcd2] flex flex-col w-[156px] h-[132px] items-center gap-[5px] pt-3 pb-2.5 px-1.5 absolute rounded-xl overflow-hidden shadow-[0px_3px_8px_#3444320a] transition-[box-shadow,border-color] duration-150 hover:shadow-[0px_6px_14px_#34443214] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#355b43]";

const controlButtonClass =
  "flex w-10 h-10 items-center justify-center relative bg-[#fffdf9] rounded-lg overflow-hidden border border-solid border-[#dedcd2] text-[#283b30]";

export const FamilyTreeCanvasSection = ({
  treeName,
  members,
  relationships,
  selectedMemberId,
  onSelectMember,
  emptyActions,
}: FamilyTreeCanvasSectionProps): JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ x: 0, y: 0, scale: 1 });
  const viewRef = useRef(view);
  viewRef.current = view;

  const layout = useMemo(
    () => layoutFamilyTree(members, relationships),
    [members, relationships],
  );
  const isEmpty = members.length === 0;

  // ----- View helpers -----
  const viewportSize = () => {
    const el = viewportRef.current;
    return { width: el?.clientWidth ?? 0, height: el?.clientHeight ?? 0 };
  };

  const fitToScreen = useCallback(() => {
    const { width, height } = viewportSize();
    if (!width || !height || !layout.width || !layout.height) {
      setView({ x: 0, y: 0, scale: 1 });
      return;
    }
    // Never enlarge past 100%: one member stays a normal-size centred card.
    const scale = clampScale(
      Math.min(
        (width - FIT_MARGIN * 2) / layout.width,
        (height - FIT_MARGIN * 2) / layout.height,
        1,
      ),
    );
    setView({
      scale,
      x: (width - layout.width * scale) / 2,
      y: Math.max(0, (height - layout.height * scale) / 2),
    });
  }, [layout.width, layout.height]);

  // Zoom keeping the canvas point under (cx, cy) fixed on screen.
  const zoomAround = useCallback((nextScale: number, cx?: number, cy?: number) => {
    setView((current) => {
      const scale = clampScale(nextScale);
      const { width, height } = viewportSize();
      const px = cx ?? width / 2;
      const py = cy ?? height / 2;
      const ratio = scale / current.scale;
      return {
        scale,
        x: px - (px - current.x) * ratio,
        y: py - (py - current.y) * ratio,
      };
    });
  }, []);

  const panBy = useCallback((dx: number, dy: number) => {
    setView((current) => ({ ...current, x: current.x + dx, y: current.y + dy }));
  }, []);

  // Fit when a tree first gets members (initial load, or the first member is
  // added). Later data refreshes keep the user's zoom and pan.
  const hadNodes = useRef(false);
  useLayoutEffect(() => {
    if (isEmpty) {
      hadNodes.current = false;
      return;
    }
    if (!hadNodes.current) {
      hadNodes.current = true;
      fitToScreen();
    }
  }, [isEmpty, fitToScreen]);

  // Wheel: trackpad/mouse wheel pans; pinch or Ctrl/⌘ + wheel zooms at the
  // cursor. Non-passive so the page itself doesn't scroll.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) {
        const rect = el.getBoundingClientRect();
        zoomAround(
          viewRef.current.scale * Math.exp(-event.deltaY * 0.01),
          event.clientX - rect.left,
          event.clientY - rect.top,
        );
      } else {
        panBy(-event.deltaX, -event.deltaY);
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [isEmpty, zoomAround, panBy]);

  // ----- Drag to pan -----
  const drag = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: viewRef.current.x,
      originY: viewRef.current.y,
      moved: false,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    if (!current.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    if (!current.moved) {
      current.moved = true;
      setIsDragging(true);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    setView((view) => ({ ...view, x: current.originX + dx, y: current.originY + dy }));
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    if (current.moved) {
      // The click that follows a drag must not select a card.
      suppressClick.current = true;
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 0);
    }
    drag.current = null;
    setIsDragging(false);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return; // not while on a card
    const actions: Record<string, () => void> = {
      ArrowLeft: () => panBy(PAN_STEP, 0),
      ArrowRight: () => panBy(-PAN_STEP, 0),
      ArrowUp: () => panBy(0, PAN_STEP),
      ArrowDown: () => panBy(0, -PAN_STEP),
      "+": () => zoomAround(viewRef.current.scale * ZOOM_STEP),
      "=": () => zoomAround(viewRef.current.scale * ZOOM_STEP),
      "-": () => zoomAround(viewRef.current.scale / ZOOM_STEP),
      "0": fitToScreen,
    };
    const action = actions[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  };

  const toggleFullscreen = async (): Promise<void> => {
    if (!document.fullscreenElement && sectionRef.current) {
      await sectionRef.current.requestFullscreen();
    } else if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  };

  const percent = Math.round(view.scale * 100);
  const usedKinds = new Set(layout.edges.map((edge) => edge.kind));

  return (
    <section
      ref={sectionRef}
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
        <div className="relative flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="[font-family:'Lora',Helvetica] text-[22px] text-[#283b30]">
            No family members yet
          </p>
          <p className="max-w-[420px] [font-family:'Inter',Helvetica] text-[13px] leading-[20px] text-[#7b8177]">
            People appear here as soon as they're added to this tree.
          </p>
          {emptyActions && (
            <div className="mt-2 flex flex-wrap justify-center gap-2.5">{emptyActions}</div>
          )}
        </div>
      ) : (
        <div
          ref={viewportRef}
          role="application"
          aria-roledescription="family tree canvas"
          aria-label={`${treeName}: drag or use the arrow keys to pan, plus and minus to zoom, 0 to fit`}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={handleKeyDown}
          className={`relative min-h-[440px] flex-1 touch-none select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#355b43]/40 ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          <div
            data-testid="tree-content"
            className="absolute left-0 top-0 origin-top-left"
            style={{
              width: layout.width,
              height: layout.height,
              transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            }}
          >
            <svg
              className="absolute inset-0 overflow-visible"
              width={layout.width}
              height={layout.height}
              aria-hidden="true"
            >
              {layout.edges.map((edge) => (
                <path
                  key={edge.key}
                  data-edge={edge.kind}
                  d={edge.d}
                  fill="none"
                  stroke={LINE_COLOUR}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  {...edgeStyle[edge.kind]}
                />
              ))}
            </svg>

            {layout.markers.map((marker) => (
              <div
                key={marker.key}
                data-marker="spouse"
                className="flex w-[26px] h-[26px] items-center justify-center absolute bg-[#f6f4ee] rounded-[100px] overflow-hidden"
                style={{ top: marker.y - 13, left: marker.x - 13 }}
                aria-hidden="true"
              >
                <img className="relative w-3.5 h-[13px]" alt="" src={HEART_ICON} />
              </div>
            ))}

            {layout.nodes.map(({ member, x, y }) => {
              const selected = member.id === selectedMemberId;
              const dates = lifeSpan(member);
              return (
                <button
                  key={member.id}
                  type="button"
                  data-member-id={member.id}
                  onClick={() => {
                    if (!suppressClick.current) onSelectMember(member);
                  }}
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
                      draggable={false}
                      src={member.photo_url}
                    />
                  ) : (
                    <span className="flex w-10 h-10 shrink-0 items-center justify-center relative bg-[#ece9e0] rounded-[100px] overflow-hidden">
                      <span className="relative w-fit [font-family:'Lora',Helvetica] font-normal text-[#617b58] text-[15px] tracking-[0] leading-[normal]">
                        {initialsOf(member)}
                      </span>
                    </span>
                  )}
                  <span className="relative self-stretch line-clamp-2 break-words [font-family:'Inter',Helvetica] font-semibold text-[#283b30] text-[13px] text-center tracking-[0] leading-[17px]">
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
      )}

      <div className="relative flex flex-wrap items-center justify-between gap-4 px-9 py-4">
        <aside
          aria-label="Relationship legend"
          className={`inline-flex flex-wrap items-center gap-x-5 gap-y-2 ${isEmpty ? "invisible" : ""}`}
        >
          <div className="relative w-fit [font-family:'Inter',Helvetica] font-semibold text-[#7b8177] text-[11px] whitespace-nowrap">
            Relationships:
          </div>
          <LegendItem label="Married">
            <div className="flex w-[26px] h-[26px] items-center justify-center bg-[#f6f4ee] rounded-[100px]">
              <img className="w-3.5 h-[13px]" alt="" src={HEART_ICON} />
            </div>
          </LegendItem>
          <LegendItem label="Parent–child">
            <LegendLine />
          </LegendItem>
          {usedKinds.has("adoptive") && (
            <LegendItem label="Adoptive parent">
              <LegendLine dash="6 4" />
            </LegendItem>
          )}
          {usedKinds.has("sibling") && (
            <LegendItem label="Sibling">
              <LegendLine dash="2 4" />
            </LegendItem>
          )}
        </aside>
        <nav
          aria-label="Canvas controls"
          className={`inline-flex h-10 items-center gap-3.5 ${isEmpty ? "invisible" : ""}`}
        >
          <button
            type="button"
            onClick={fitToScreen}
            aria-label="Fit tree to screen"
            title="Fit to screen (0)"
            className={controlButtonClass}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
              <rect x="8" y="8" width="8" height="8" rx="1.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
            className={controlButtonClass}
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
              onClick={() => zoomAround(view.scale / ZOOM_STEP)}
              disabled={view.scale <= MIN_SCALE}
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
              onClick={() => zoomAround(1)}
              aria-label={`Zoom ${percent}%, reset to 100%`}
              className="relative min-w-[36px] [font-family:'Inter',Helvetica] font-normal text-[#283b30] text-xs tabular-nums"
            >
              {percent}%
            </button>
            <button
              type="button"
              onClick={() => zoomAround(view.scale * ZOOM_STEP)}
              disabled={view.scale >= MAX_SCALE}
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

const LegendItem = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="inline-flex items-center gap-1.5">
    {children}
    <div className="[font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-[11px] whitespace-nowrap">
      {label}
    </div>
  </div>
);

const LegendLine = ({ dash }: { dash?: string }) => (
  <svg width="22" height="4" aria-hidden="true">
    <line x1="1" y1="2" x2="21" y2="2" stroke={LINE_COLOUR} strokeWidth="1.5" strokeDasharray={dash} strokeLinecap="round" />
  </svg>
);
