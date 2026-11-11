import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppHeader } from "../../components/AppHeader/AppHeader";
import { CreateTreeModal } from "../../components/CreateTreeModal/CreateTreeModal";
import { primaryButtonClass, secondaryButtonClass } from "../../components/Dialog/Dialog";
import { FamilyTree, listTrees } from "../../services/trees";

type LoadState =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "ready"; trees: FamilyTree[] };

const formatCreated = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const memberCountLabel = (count: number) =>
  `${count} family ${count === 1 ? "member" : "members"}`;

// Every tree the signed-in user owns or has joined, from GET /api/trees/.
export const MyTreesScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const createButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    setState({ kind: "loading" });
    listTrees(controller.signal)
      .then((trees) => setState({ kind: "ready", trees }))
      .catch((error: unknown) => {
        if ((error as Error).name !== "AbortError") setState({ kind: "error" });
      });
    return () => controller.abort();
  }, [reloadKey]);

  const retry = useCallback(() => setReloadKey((key) => key + 1), []);

  const createButton = (
    <button
      ref={createButtonRef}
      type="button"
      className={primaryButtonClass}
      onClick={() => setIsCreateOpen(true)}
      aria-haspopup="dialog"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
      Create Tree
    </button>
  );

  return (
    <main className="flex min-h-screen flex-col bg-[#f6f4ee] text-[#283b30]">
      <AppHeader current="my-trees" />

      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-8 px-4 py-8 sm:px-9 sm:py-10">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-1.5 [font-family:'Inter',Helvetica] text-[13px] font-semibold text-[#355b43] hover:underline"
        >
          <span aria-hidden="true">←</span> Back to Home
        </Link>

        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="[font-family:'Lora',Helvetica] text-[32px] font-normal leading-tight text-[#283b30] sm:text-[38px]">
              My Family Trees
            </h1>
            <p className="[font-family:'Inter',Helvetica] text-[15px] text-[#7b8177]">
              Explore the family trees you've created or joined.
            </p>
          </div>
          {state.kind === "ready" && state.trees.length > 0 && createButton}
        </header>

        {state.kind === "loading" && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            <p role="status" className="sr-only">
              Loading your family trees…
            </p>
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                aria-hidden="true"
                className="h-[188px] animate-pulse rounded-2xl border border-[#dedcd2] bg-[#fffdf9]"
              />
            ))}
          </div>
        )}

        {state.kind === "error" && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#dedcd2] bg-[#fffdf9] px-6 py-14 text-center">
            <p role="alert" className="[font-family:'Inter',Helvetica] text-[15px] text-[#283b30]">
              We couldn't load your family trees.
            </p>
            <button type="button" className={secondaryButtonClass} onClick={retry}>
              Try again
            </button>
          </div>
        )}

        {state.kind === "ready" && state.trees.length === 0 && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[#cfcabd] bg-[#fffdf9] px-6 py-16 text-center">
            <p className="[font-family:'Lora',Helvetica] text-[24px] text-[#283b30]">
              You don't have any family trees yet
            </p>
            <p className="max-w-[460px] [font-family:'Inter',Helvetica] text-[14px] leading-[22px] text-[#7b8177]">
              Start your own tree, or join a relative's tree by opening the
              invitation link they shared with you.
            </p>
            {createButton}
          </div>
        )}

        {state.kind === "ready" && state.trees.length > 0 && (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {state.trees.map((tree) => (
              <li key={tree.id}>
                <Link
                  to={`/family-tree/${tree.id}`}
                  aria-label={`Open ${tree.name}`}
                  className="group flex h-full flex-col gap-4 rounded-2xl border border-[#dedcd2] bg-[#fffdf9] p-6 shadow-[0px_3px_8px_#3444320a] transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-0.5 hover:border-[#c9d3c2] hover:shadow-[0px_10px_24px_#34443214] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#355b43]"
                >
                  <span
                    className={`w-fit rounded-[100px] px-2.5 py-[5px] [font-family:'Inter',Helvetica] text-[11px] font-semibold ${
                      tree.is_owner
                        ? "bg-[#e8ede3] text-[#355b43]"
                        : "bg-[#f0ebdf] text-[#6f6550]"
                    }`}
                  >
                    {tree.is_owner ? "Tree Owner" : "Collaborator"}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h2 className="break-words [font-family:'Lora',Helvetica] text-[24px] font-normal leading-tight text-[#283b30]">
                      {tree.name}
                    </h2>
                    {tree.description && (
                      <p className="line-clamp-2 [font-family:'Inter',Helvetica] text-[13px] leading-[20px] text-[#7b8177]">
                        {tree.description}
                      </p>
                    )}
                  </div>
                  <p className="mt-auto [font-family:'Inter',Helvetica] text-[12px] text-[#7b8177]">
                    {memberCountLabel(tree.member_count)}
                    <span aria-hidden="true"> · </span>
                    <span className="sr-only">, </span>
                    Created {formatCreated(tree.created_at)}
                  </p>
                  <span className="inline-flex items-center gap-1.5 [font-family:'Inter',Helvetica] text-[13px] font-semibold text-[#355b43]">
                    Open Tree
                    <span aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-0.5">
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CreateTreeModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(tree) => {
          setIsCreateOpen(false);
          navigate(`/family-tree/${tree.id}`);
        }}
        returnFocusRef={createButtonRef}
        signInReturnPath="/my-trees"
      />
    </main>
  );
};
