import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AppHeader } from "../../components/AppHeader/AppHeader";
import { CreateTreeModal } from "../../components/CreateTreeModal/CreateTreeModal";
import { primaryButtonClass, secondaryButtonClass } from "../../components/Dialog/Dialog";
import { DeleteTreeDialog } from "../../components/TreeSettings/DeleteTreeDialog";
import { EditTreeDialog } from "../../components/TreeSettings/EditTreeDialog";
import { TreeSettingsMenu } from "../../components/TreeSettings/TreeSettingsMenu";
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
  const location = useLocation();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [settings, setSettings] = useState<
    { kind: "edit" | "delete"; tree: FamilyTree } | null
  >(null);
  // Set by the tree workspace after a delete (FR-23).
  const [notice, setNotice] = useState(
    () => (location.state as { notice?: string } | null)?.notice ?? "",
  );
  const createButtonRef = useRef<HTMLButtonElement>(null);

  // Apply an edit or delete to the list straight away; Django has already
  // saved it, so no reload is needed.
  const replaceTree = (saved: FamilyTree) =>
    setState((current) =>
      current.kind === "ready"
        ? {
            kind: "ready",
            trees: current.trees.map((tree) =>
              tree.id === saved.id ? { ...tree, ...saved } : tree,
            ),
          }
        : current,
    );
  const removeTree = (treeId: number) =>
    setState((current) =>
      current.kind === "ready"
        ? { kind: "ready", trees: current.trees.filter((tree) => tree.id !== treeId) }
        : current,
    );

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

        <p role="status" aria-live="polite" className={notice ? "rounded-xl bg-[#e8ede3] px-4 py-3 [font-family:'Inter',Helvetica] text-[13px] text-[#355b43]" : "sr-only"}>
          {notice}
        </p>

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
                {/* The whole card opens the tree through a stretched link on
                    the heading, so the Owner's settings button can sit in the
                    card without nesting a button inside a link. */}
                <article className="group relative flex h-full flex-col gap-4 rounded-2xl border border-[#dedcd2] bg-[#fffdf9] p-6 shadow-[0px_3px_8px_#3444320a] transition-[transform,box-shadow,border-color] duration-200 ease-out has-[a:focus-visible]:outline has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[#355b43] [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:border-[#c9d3c2] [@media(hover:hover)]:hover:shadow-[0px_10px_24px_#34443214]">
                  <div className="flex items-start justify-between gap-3">
                  <span
                    className={`w-fit rounded-[100px] px-2.5 py-[5px] [font-family:'Inter',Helvetica] text-[11px] font-semibold ${
                      tree.is_owner
                        ? "bg-[#e8ede3] text-[#355b43]"
                        : "bg-[#f0ebdf] text-[#6f6550]"
                    }`}
                  >
                    {tree.is_owner ? "Tree Owner" : "Collaborator"}
                  </span>
                  {tree.is_owner && (
                    <div className="-mr-2 -mt-2">
                      <TreeSettingsMenu
                        treeName={tree.name}
                        onEdit={() => setSettings({ kind: "edit", tree })}
                        onDelete={() => setSettings({ kind: "delete", tree })}
                      />
                    </div>
                  )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h2 className="break-words [font-family:'Lora',Helvetica] text-[24px] font-normal leading-tight text-[#283b30]">
                      <Link
                        to={`/family-tree/${tree.id}`}
                        aria-label={`Open ${tree.name}`}
                        className="outline-none after:absolute after:inset-0 after:rounded-2xl after:content-['']"
                      >
                        {tree.name}
                      </Link>
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
                  <span aria-hidden="true" className="inline-flex items-center gap-1.5 [font-family:'Inter',Helvetica] text-[13px] font-semibold text-[#355b43]">
                    Open Tree
                    <span className="transition-transform duration-150 ease-out [@media(hover:hover)]:group-hover:translate-x-0.5">
                      →
                    </span>
                  </span>
                </article>
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

      {settings?.kind === "edit" && (
        <EditTreeDialog
          tree={settings.tree}
          onClose={() => setSettings(null)}
          onSaved={(saved) => {
            replaceTree(saved);
            setSettings(null);
            setNotice(`Saved changes to ${saved.name}.`);
          }}
        />
      )}
      {settings?.kind === "delete" && (
        <DeleteTreeDialog
          tree={settings.tree}
          onClose={() => setSettings(null)}
          onDeleted={(treeId) => {
            removeTree(treeId);
            setSettings(null);
            setNotice(`${settings.tree.name} was deleted.`);
          }}
        />
      )}
    </main>
  );
};
