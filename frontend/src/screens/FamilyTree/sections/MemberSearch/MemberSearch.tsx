// FR-15: find a person in this tree by first or last name (partial, any
// case). Django's /api/search/ only searches trees the user owns or has
// joined; `tree` narrows it to the open one. Picking a result selects the
// member and centres their card on the canvas.
import {
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { SearchResult, searchMembers } from "../../../../services/trees";

type MemberSearchProps = {
  treeId: number;
  onSelect: (memberId: number) => void;
};

type SearchState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "ready"; results: SearchResult[] };

const DEBOUNCE_MS = 200;

const years = (result: SearchResult) => {
  const born = result.birth_date?.slice(0, 4);
  const died = result.death_date?.slice(0, 4);
  if (!born && !died) return "";
  return `${born ?? "?"}–${died ?? ""}`;
};

export const MemberSearch = ({ treeId, onSelect }: MemberSearchProps): JSX.Element => {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>({ kind: "idle" });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const labelId = useId();

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setState({ kind: "idle" });
      return;
    }
    const controller = new AbortController();
    setState((current) => (current.kind === "ready" ? current : { kind: "loading" }));
    const timer = window.setTimeout(() => {
      searchMembers(q, treeId, controller.signal)
        .then((results) => {
          setState({ kind: "ready", results });
          setActive(results.length ? 0 : -1);
        })
        .catch((error: unknown) => {
          if ((error as Error).name !== "AbortError") setState({ kind: "error" });
        });
    }, DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, treeId]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const results = state.kind === "ready" ? state.results : [];
  const showList = open && query.trim().length > 0;

  const choose = (result: SearchResult) => {
    onSelect(result.id);
    setQuery("");
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!results.length) return;
      event.preventDefault();
      setOpen(true);
      setActive((index) =>
        event.key === "ArrowDown" ? (index + 1) % results.length : (index - 1 + results.length) % results.length,
      );
    } else if (event.key === "Enter") {
      if (showList && active >= 0 && results[active]) {
        event.preventDefault();
        choose(results[active]);
      }
    } else if (event.key === "Escape") {
      if (open || query) {
        event.preventDefault();
        event.stopPropagation();
        if (open) setOpen(false);
        else setQuery("");
      }
    }
  };

  const optionId = (index: number) => `${listId}-option-${index}`;

  return (
    <div ref={containerRef} className="relative w-full sm:w-[260px]" role="search">
      <span id={labelId} className="sr-only">
        Search people in this tree
      </span>
      <div className="relative">
        <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7b8177]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-labelledby={labelId}
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && active >= 0 ? optionId(active) : undefined}
          placeholder="Search people"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => query && setOpen(true)}
          onKeyDown={onKeyDown}
          className="h-10 w-full rounded-lg border border-[#dedcd2] bg-white pl-9 pr-3 [font-family:'Inter',Helvetica] text-[16px] text-[#283b30] transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-[#9a9f95] focus:border-[#355b43] focus:shadow-[0_0_0_3px_rgba(53,91,67,0.14)] sm:text-[13px]"
        />
      </div>
      {showList && (
        <div
          className="roots-menu absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-[320px] overflow-y-auto overscroll-contain rounded-xl border border-[#dedcd2] bg-white p-1.5 shadow-[0px_12px_32px_#3444321f] [font-family:'Inter',Helvetica] [--roots-menu-origin:top_left]"
        >
          {state.kind === "loading" && <p className="px-3 py-2.5 text-[13px] text-[#7b8177]">Searching…</p>}
          {state.kind === "error" && (
            <p role="alert" className="px-3 py-2.5 text-[13px] text-[#8a3f2c]">
              Search isn't available right now.
            </p>
          )}
          {state.kind === "ready" && results.length === 0 && (
            <p className="px-3 py-2.5 text-[13px] text-[#7b8177]">No one in this tree matches “{query.trim()}”.</p>
          )}
          <ul id={listId} role="listbox" aria-label="Matching people">
            {results.map((result, index) => (
              <li
                key={result.id}
                id={optionId(index)}
                role="option"
                aria-selected={index === active}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => choose(result)}
                onPointerMove={() => setActive(index)}
                className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-[13px] ${
                  index === active ? "bg-[#f2f6ed] text-[#283b30]" : "text-[#283b30]"
                }`}
              >
                <span className="truncate font-semibold">{result.full_name}</span>
                <span className="shrink-0 tabular-nums text-[12px] text-[#7b8177]">{years(result)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p role="status" aria-live="polite" className="sr-only">
        {showList && state.kind === "ready"
          ? `${results.length} ${results.length === 1 ? "match" : "matches"}`
          : ""}
      </p>
    </div>
  );
};
