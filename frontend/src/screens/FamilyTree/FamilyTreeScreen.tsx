import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthRedirectState } from "../../auth/AuthProvider";
import {
  ChangeRequestInput,
  FamilyMember,
  FamilyTree,
  Relationship,
  listMembers,
  listRelationships,
  listTrees,
  submitChangeRequest,
} from "../../services/trees";
import { AppHeaderSection } from "./sections/AppHeaderSection";
import { ChangeRequestModalSection } from "./sections/ChangeRequestModalSection/ChangeRequestModalSection";
import { FamilyTreeCanvasSection } from "./sections/FamilyTreeCanvasSection/FamilyTreeCanvasSection";
import { FamilyTreeToolbarSection } from "./sections/FamilyTreeToolbarSection/FamilyTreeToolbarSection";
import { MemberDetailsDialogSection } from "./sections/MemberDetailsDialogSection/MemberDetailsDialogSection";

type TreeData = {
  tree: FamilyTree;
  members: FamilyMember[];
  relationships: Relationship[];
};

type LoadState =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "no-trees" }
  | { kind: "not-found" }
  | ({ kind: "ready" } & TreeData);

const createTreeState: AuthRedirectState = { intent: "create-tree" };

const Notice = ({ children }: { children: ReactNode }) => (
  <section className="relative flex flex-1 flex-col items-center justify-center gap-4 bg-[#f6f4ee] px-6 py-24 text-center [font-family:'Inter',Helvetica] text-[14px] text-[#7b8177]">
    {children}
  </section>
);

const noticeLinkClass =
  "inline-flex h-10 items-center rounded-lg bg-[#355b43] px-4 text-[13px] font-semibold text-white";

export const FamilyTreeScreen = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const requestedTreeId = Number(searchParams.get("tree")) || null;

  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    setState({ kind: "loading" });

    (async () => {
      const trees = await listTrees(signal);
      if (trees.length === 0) return setState({ kind: "no-trees" });

      // ?tree=<id> from Create Tree; otherwise the first tree the user can see.
      const tree = requestedTreeId
        ? trees.find((candidate) => candidate.id === requestedTreeId)
        : trees[0];
      if (!tree) return setState({ kind: "not-found" });

      const [members, relationships] = await Promise.all([
        listMembers(tree.id, signal),
        listRelationships(tree.id, signal),
      ]);
      setState({ kind: "ready", tree, members, relationships });
    })().catch((error: unknown) => {
      if ((error as Error).name !== "AbortError") setState({ kind: "error" });
    });

    return () => controller.abort();
  }, [requestedTreeId, reloadKey]);

  const ready = state.kind === "ready" ? state : null;

  const memberOptions = useMemo(
    () =>
      (ready?.members ?? []).map((member) => ({
        id: member.id,
        fullName: member.full_name,
      })),
    [ready?.members],
  );

  const handleSubmitRequest = useCallback(
    async (request: ChangeRequestInput) => {
      if (!ready) return;
      await submitChangeRequest(ready.tree.id, request);
    },
    [ready],
  );

  const closeRequestForm = useCallback(() => setIsRequestFormOpen(false), []);
  const closeMemberDetails = useCallback(() => setSelectedMember(null), []);

  return (
    <main className="flex min-h-screen flex-col items-stretch bg-[#f6f4ee] text-[#272522]">
      <AppHeaderSection />

      {state.kind === "loading" && (
        <Notice>
          <p role="status">Loading your family tree…</p>
        </Notice>
      )}

      {state.kind === "error" && (
        <Notice>
          <p role="alert">We couldn't load your family tree.</p>
          <button
            type="button"
            className={noticeLinkClass}
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Try again
          </button>
        </Notice>
      )}

      {state.kind === "no-trees" && (
        <Notice>
          <p className="[font-family:'Lora',Helvetica] text-[22px] text-[#283b30]">
            You don't have a family tree yet
          </p>
          <p>Create one to start adding your family.</p>
          <Link to="/" state={createTreeState} className={noticeLinkClass}>
            Create Tree
          </Link>
        </Notice>
      )}

      {state.kind === "not-found" && (
        <Notice>
          <p role="alert">
            That tree doesn't exist or you don't have access to it.
          </p>
          <Link to="/family-tree" className={noticeLinkClass}>
            Open my trees
          </Link>
        </Notice>
      )}

      {ready && (
        <>
          <FamilyTreeToolbarSection
            treeName={ready.tree.name}
            memberCount={ready.members.length}
            isOwner={ready.tree.is_owner}
            onRequestChange={() => setIsRequestFormOpen(true)}
          />
          <FamilyTreeCanvasSection
            treeName={ready.tree.name}
            members={ready.members}
            relationships={ready.relationships}
            selectedMemberId={selectedMember?.id ?? null}
            onSelectMember={setSelectedMember}
          />

          {isRequestFormOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-[#283b30]/30">
              <ChangeRequestModalSection
                members={memberOptions}
                onClose={closeRequestForm}
                onSubmit={handleSubmitRequest}
              />
            </div>
          )}

          {selectedMember && (
            <MemberDetailsDialogSection
              treeId={ready.tree.id}
              treeName={ready.tree.name}
              member={selectedMember}
              members={ready.members}
              relationships={ready.relationships}
              onClose={closeMemberDetails}
            />
          )}
        </>
      )}
    </main>
  );
};
