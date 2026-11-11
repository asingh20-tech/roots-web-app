import { ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { TreeSettingsMenu } from "../../../../components/TreeSettings/TreeSettingsMenu";
import { FamilyTree, listTrees } from "../../../../services/trees";
import { onTreesChanged } from "../../../../services/treeEvents";
import { MemberSearch } from "../MemberSearch/MemberSearch";

type FamilyTreeToolbarProps = {
  treeId: number;
  treeName: string;
  treeDescription?: string | null;
  memberCount: number;
  isOwner: boolean;
  // FR-15: a search result was picked.
  onSearchSelect: (memberId: number) => void;
  // Owner (FR-23, proposed).
  onEditTree: () => void;
  onDeleteTree: () => void;
  // Collaborator (FR-24, proposed).
  onOpenContributions: () => void;
  // Owner actions.
  onAddMember: () => void;
  onAddRelationship: () => void;
  onReviewRequests: () => void;
  onInvite: () => void;
  openRequestCount: number | null;
  // Collaborator action.
  onRequestChange: () => void;
};

const outlineButtonClass =
  "roots-press inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap px-3 sm:px-4 py-0 relative flex-[0_0_auto] bg-[#fffdf9] rounded-lg overflow-hidden border border-solid border-[#dedcd2] [font-family:'Inter',Helvetica] text-[13px] text-[#283b30] hover:bg-[#f6f4ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#355b43]";
const solidButtonClass =
  "roots-press h-10 whitespace-nowrap px-3 sm:px-4 py-0 bg-[#355b43] inline-flex items-center justify-center gap-2 relative flex-[0_0_auto] rounded-lg overflow-hidden border border-solid border-[#355b43] [font-family:'Inter',Helvetica] text-[13px] text-white hover:bg-[#2b4a37] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#355b43]";

const PlusIcon = () => (
  <span className="relative w-4 h-4" aria-hidden="true">
    <img
      className="absolute w-[84.17%] h-[84.17%] top-[15.83%] left-[15.83%]"
      alt=""
      src="/img/vector-39.svg"
    />
  </span>
);

const ToolbarIcon = ({ children }: { children: ReactNode }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

// Lists every accessible tree; fetched when the menu is first opened.
const TreeSwitcher = ({ treeId }: { treeId: number }) => {
  const [open, setOpen] = useState(false);
  const [trees, setTrees] = useState<FamilyTree[] | null>(null);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // A rename or delete elsewhere makes the cached list stale (FR-23).
  useEffect(() => onTreesChanged(() => setTrees(null)), []);

  useEffect(() => {
    if (!open || trees) return;
    const controller = new AbortController();
    setError(false);
    listTrees(controller.signal)
      .then(setTrees)
      .catch((err: unknown) => {
        if ((err as Error).name !== "AbortError") setError(true);
      });
    return () => controller.abort();
  }, [open, trees]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Switch family tree"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="roots-press relative flex w-11 h-11 items-center justify-center rounded-lg hover:bg-[#f0ede4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#355b43]"
      >
        <span className="relative w-[17px] h-[17px]">
          <img
            className="absolute w-[79.71%] h-[67.21%] top-[32.79%] left-[20.29%]"
            alt=""
            aria-hidden="true"
            src="/img/vector-26.svg"
          />
        </span>
      </button>
      {open && (
        <div className="roots-menu absolute left-0 top-12 z-20 w-[min(280px,calc(100vw-2rem))] rounded-xl [--roots-menu-origin:top_left] border border-[#dedcd2] bg-white py-2 shadow-[0px_12px_32px_#3444321f] [font-family:'Inter',Helvetica]">
          <p className="px-4 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.5px] text-[#7b8177]">
            Your family trees
          </p>
          {error && <p className="px-4 py-2 text-[13px] text-[#8a3f2c]">Couldn't load your trees.</p>}
          {!trees && !error && <p className="px-4 py-2 text-[13px] text-[#7b8177]">Loading…</p>}
          {trees && (
            <ul>
              {trees.map((tree) => (
                <li key={tree.id}>
                  <Link
                    to={`/family-tree/${tree.id}`}
                    onClick={() => setOpen(false)}
                    aria-current={tree.id === treeId ? "page" : undefined}
                    className={`flex min-h-11 items-center justify-between gap-3 px-4 py-2.5 text-[13px] hover:bg-[#f5f6f2] ${
                      tree.id === treeId ? "font-semibold text-[#355b43]" : "text-[#283b30]"
                    }`}
                  >
                    <span className="truncate">{tree.name}</span>
                    <span className="shrink-0 text-[11px] font-normal text-[#7b8177]">
                      {tree.is_owner ? "Owner" : "Collaborator"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-1 border-t border-[#ece9e0] pt-1">
            <Link
              to="/my-trees"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-[13px] font-semibold text-[#355b43] hover:bg-[#f5f6f2]"
            >
              All my trees
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export const FamilyTreeToolbarSection = ({
  treeId,
  treeName,
  treeDescription,
  memberCount,
  isOwner,
  onSearchSelect,
  onEditTree,
  onDeleteTree,
  onOpenContributions,
  onAddMember,
  onAddRelationship,
  onReviewRequests,
  onInvite,
  openRequestCount,
  onRequestChange,
}: FamilyTreeToolbarProps): JSX.Element => {
  const toolbarStats = [
    `${memberCount} ${memberCount === 1 ? "person" : "people"}`,
    isOwner ? "Tree Owner" : "Collaborator",
  ];

  return (
    <section
      aria-label="Family tree toolbar"
      className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto] bg-[#fffdf9] border-b border-[#ece9e0]"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 relative self-stretch w-full sm:px-9 lg:min-h-24">
        <div className="flex min-w-0 flex-col items-start gap-1.5">
          <Link
            to="/my-trees"
            className="inline-flex items-center gap-1.5 [font-family:'Inter',Helvetica] text-[12px] font-semibold text-[#355b43] hover:underline"
          >
            <span aria-hidden="true">←</span> Back to My Trees
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="min-w-0 break-words [font-family:'Lora',Helvetica] font-normal text-[#283b30] text-[27px] tracking-[-0.14px] leading-tight">
              {treeName}
            </h1>
            <TreeSwitcher treeId={treeId} />
          </div>
          {treeDescription && (
            <p className="max-w-[640px] line-clamp-2 [font-family:'Inter',Helvetica] text-[13px] leading-[19px] text-[#5f655b]">
              {treeDescription}
            </p>
          )}
          <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
            {toolbarStats.map((stat, index) => (
              <span key={stat} className="contents">
                <span className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-xs leading-[normal]">
                  {stat}
                </span>
                {index < toolbarStats.length - 1 && (
                  <span aria-hidden="true" className="relative w-[3px] h-[3px] bg-[#7b8177] rounded-[1.5px]" />
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Phones: a tidy two-column grid; wider screens: one wrapping row. */}
        <div className="grid w-full grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center lg:w-auto lg:justify-end">
          <div className="col-span-2 sm:col-auto">
            <MemberSearch treeId={treeId} onSelect={onSearchSelect} />
          </div>
          {isOwner ? (
            <>
              <TreeSettingsMenu
                treeName={treeName}
                variant="button"
                onEdit={onEditTree}
                onDelete={onDeleteTree}
              />
              <button type="button" className={outlineButtonClass} onClick={onInvite}>
                <span className="relative w-4 h-4" aria-hidden="true">
                  <img
                    className="absolute w-[96.67%] h-[92.50%] top-[7.50%] left-[3.33%]"
                    alt=""
                    src="/img/vector-38.svg"
                  />
                </span>
                Invite Link
              </button>
              <button
                type="button"
                className={outlineButtonClass}
                onClick={onReviewRequests}
                aria-label={
                  openRequestCount
                    ? `Review Requests (${openRequestCount} waiting)`
                    : "Review Requests"
                }
              >
                <ToolbarIcon>
                  <path d="M9 11l3 3 8-8" />
                  <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
                </ToolbarIcon>
                Review Requests
                {Boolean(openRequestCount) && (
                  <span aria-hidden="true" className="ml-0.5 min-w-[20px] rounded-[100px] bg-[#355b43] px-1.5 py-0.5 text-center text-[11px] font-semibold text-white">
                    {openRequestCount}
                  </span>
                )}
              </button>
              <button type="button" className={outlineButtonClass} onClick={onAddRelationship}>
                <ToolbarIcon>
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </ToolbarIcon>
                Add Relationship
              </button>
              <button type="button" className={`${solidButtonClass} col-span-2 sm:col-auto`} onClick={onAddMember}>
                <PlusIcon />
                Add Member
              </button>
            </>
          ) : (
            <>
              <button type="button" className={outlineButtonClass} onClick={onOpenContributions}>
                <ToolbarIcon>
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M19 8v6M22 11h-6" />
                </ToolbarIcon>
                My Contributions
              </button>
              <button
                className={solidButtonClass}
                type="button"
                aria-label="Request a change"
                onClick={onRequestChange}
              >
                <PlusIcon />
                Request Change
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
