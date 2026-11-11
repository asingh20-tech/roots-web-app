// Owner-only "Tree settings" menu (FR-23, proposed): Edit tree / Delete tree.
// Render it only when tree.is_owner is true; Django refuses the PATCH and
// DELETE for anyone else regardless (IsTreeOwnerOrReadOnly).
import {
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

type TreeSettingsMenuProps = {
  treeName: string;
  onEdit: () => void;
  onDelete: () => void;
  // "icon": a compact square button (My Trees cards). "button": labelled
  // toolbar button (tree workspace).
  variant?: "icon" | "button";
};

const GearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const itemClass =
  "flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 text-left [font-family:'Inter',Helvetica] text-[13px] font-semibold outline-none transition-colors duration-150 focus-visible:bg-[#f2f6ed]";

export const TreeSettingsMenu = ({
  treeName,
  onEdit,
  onDelete,
  variant = "icon",
}: TreeSettingsMenuProps): JSX.Element => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const items = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  useEffect(() => {
    if (!open) return;
    items()[0]?.focus();
    const onPointer = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };

  const onMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);
    const moves: Record<string, number> = {
      ArrowDown: (index + 1) % list.length,
      ArrowUp: (index - 1 + list.length) % list.length,
      Home: 0,
      End: list.length - 1,
    };
    if (event.key in moves) {
      event.preventDefault();
      list[moves[event.key]]?.focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
    } else if (event.key === "Tab") {
      close(false);
    }
  };

  const choose = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Tree settings for ${treeName}`}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={
          variant === "icon"
            ? "roots-press relative z-10 flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#dedcd2] bg-[#fffdf9] text-[#283b30] hover:bg-[#f6f4ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#355b43] aria-expanded:bg-[#f6f4ee]"
            : "roots-press inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg sm:w-auto border border-[#dedcd2] bg-[#fffdf9] px-4 [font-family:'Inter',Helvetica] text-[13px] text-[#283b30] hover:bg-[#f6f4ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#355b43] aria-expanded:bg-[#f6f4ee]"
        }
      >
        <GearIcon />
        {variant === "button" && <span>Tree settings</span>}
      </button>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={`Settings for ${treeName}`}
          onKeyDown={onMenuKeyDown}
          className={`roots-menu absolute top-[calc(100%+6px)] z-30 ${
            // The toolbar button sits at the left on phones; the card icon is
            // always at the right edge. Open towards the free space.
            variant === "button"
              ? "left-0 [--roots-menu-origin:top_left] sm:left-auto sm:right-0 sm:[--roots-menu-origin:top_right]"
              : "right-0"
          } flex w-[220px] flex-col gap-0.5 rounded-xl border border-[#dedcd2] bg-white p-1.5 shadow-[0px_12px_32px_#3444321f]`}
        >
          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            onClick={() => choose(onEdit)}
            className={`${itemClass} text-[#283b30] hover:bg-[#f5f6f2]`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            Edit tree
          </button>
          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            onClick={() => choose(onDelete)}
            className={`${itemClass} text-[#8a3f2c] hover:bg-[#fbf3ef] focus-visible:bg-[#fbf3ef]`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
            Delete tree
          </button>
        </div>
      )}
    </div>
  );
};
