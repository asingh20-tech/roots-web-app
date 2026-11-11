import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { AppHeader } from "../../components/AppHeader/AppHeader";
import { ConfirmDialog } from "../../components/Dialog/ConfirmDialog";
import { primaryButtonClass, secondaryButtonClass } from "../../components/Dialog/Dialog";
import { DeleteTreeDialog } from "../../components/TreeSettings/DeleteTreeDialog";
import { EditTreeDialog } from "../../components/TreeSettings/EditTreeDialog";
import { ApiError } from "../../services/api";
import {
  ChangeRequest,
  ChangeRequestInput,
  FamilyMember,
  FamilyTree,
  MemberInput,
  Relationship,
  RelationshipInput,
  createMember,
  createRelationship,
  deleteMember,
  deleteRelationship,
  getTree,
  listMembers,
  listOpenChangeRequests,
  listRelationships,
  submitChangeRequest,
  submitDocumentSuggestion,
  updateMember,
  updateSuggestion,
} from "../../services/trees";
import { DocumentSuggestionDialog } from "./sections/DocumentSuggestionDialog/DocumentSuggestionDialog";
import { MemberProposalDialog } from "./sections/MemberProposalDialog/MemberProposalDialog";
import {
  ContributionTab,
  MyContributionsDialog,
} from "./sections/MyContributionsDialog/MyContributionsDialog";
import { ChangeRequestModalSection } from "./sections/ChangeRequestModalSection/ChangeRequestModalSection";
import { FamilyTreeCanvasSection } from "./sections/FamilyTreeCanvasSection/FamilyTreeCanvasSection";
import { FamilyTreeToolbarSection } from "./sections/FamilyTreeToolbarSection/FamilyTreeToolbarSection";
import { InviteDialog } from "./sections/InviteDialog/InviteDialog";
import { MemberDetailsDialogSection } from "./sections/MemberDetailsDialogSection/MemberDetailsDialogSection";
import { MemberFormDialog } from "./sections/MemberFormDialog/MemberFormDialog";
import { RelationshipFormDialog } from "./sections/RelationshipFormDialog/RelationshipFormDialog";
import { ReviewRequestsDialog } from "./sections/ReviewRequestsDialog/ReviewRequestsDialog";

type TreeData = {
  tree: FamilyTree;
  members: FamilyMember[];
  relationships: Relationship[];
};

type LoadState =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "not-found" }
  | ({ kind: "ready" } & TreeData);

// Which dialog is open. Only one at a time; member details stays selected
// underneath and reappears when a dialog opened from it closes.
type OpenDialog =
  | { kind: "add-member" }
  | { kind: "edit-member"; member: FamilyMember }
  | { kind: "delete-member"; member: FamilyMember }
  | { kind: "add-relationship"; memberId?: number }
  | { kind: "delete-relationship"; relationship: Relationship; text: string }
  | { kind: "review" }
  | { kind: "invite" }
  | { kind: "request-change" }
  // Owner (FR-23, proposed)
  | { kind: "edit-tree" }
  | { kind: "delete-tree" }
  // Collaborator (FR-12, FR-24, FR-25)
  | { kind: "contributions"; tab?: ContributionTab }
  | { kind: "propose-changes"; member: FamilyMember; returnTo?: ContributionTab }
  | { kind: "suggest-document"; member: FamilyMember }
  | { kind: "edit-suggestion"; suggestion: ChangeRequest; tab: ContributionTab };

const loadTreeData = async (treeId: number, signal?: AbortSignal): Promise<TreeData> => {
  const [tree, members, relationships] = await Promise.all([
    getTree(treeId, signal),
    listMembers(treeId, signal),
    listRelationships(treeId, signal),
  ]);
  return { tree, members, relationships };
};

const Notice = ({ children }: { children: ReactNode }) => (
  <section className="relative flex flex-1 flex-col items-center justify-center gap-4 bg-[#f6f4ee] px-6 py-24 text-center [font-family:'Inter',Helvetica] text-[14px] text-[#7b8177]">
    {children}
  </section>
);

// /family-tree/:treeId — always loads from the URL id, so a refresh or a
// shared link opens the same tree.
export const FamilyTreeScreen = (): JSX.Element => {
  const { treeId: treeIdParam } = useParams();
  const treeId = /^\d+$/.test(treeIdParam ?? "") ? Number(treeIdParam) : null;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [dialog, setDialog] = useState<OpenDialog | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [openRequestCount, setOpenRequestCount] = useState<number | null>(null);
  const [refreshError, setRefreshError] = useState("");
  const [notice, setNotice] = useState("");
  const [focusRequest, setFocusRequest] = useState<{ memberId: number; key: number } | null>(null);
  const [contributionsReload, setContributionsReload] = useState(0);
  const latestLoad = useRef(0);

  useEffect(() => {
    if (treeId === null) {
      setState({ kind: "not-found" });
      return;
    }
    const controller = new AbortController();
    setState({ kind: "loading" });
    setSelectedMemberId(null);
    setDialog(null);
    setOpenRequestCount(null);
    loadTreeData(treeId, controller.signal)
      .then((data) => setState({ kind: "ready", ...data }))
      .catch((error: unknown) => {
        if ((error as Error).name === "AbortError") return;
        setState(
          error instanceof ApiError && error.status === 404
            ? { kind: "not-found" }
            : { kind: "error" },
        );
      });
    return () => controller.abort();
  }, [treeId, reloadKey]);

  const ready = state.kind === "ready" ? state : null;
  const isOwner = ready?.tree.is_owner ?? false;

  // Owner: how many requests are waiting (toolbar badge).
  const loadedTreeId = ready?.tree.id;
  useEffect(() => {
    if (loadedTreeId === undefined || !isOwner) return;
    const controller = new AbortController();
    listOpenChangeRequests(loadedTreeId, controller.signal)
      .then((list) => setOpenRequestCount(list.length))
      .catch(() => undefined);
    return () => controller.abort();
  }, [loadedTreeId, isOwner]);

  // Re-read the tree after a change, without the full-page loading state, so
  // the canvas keeps its zoom and pan.
  const refresh = useCallback(async () => {
    if (treeId === null) return;
    const loadId = ++latestLoad.current;
    try {
      const data = await loadTreeData(treeId);
      if (loadId !== latestLoad.current) return;
      setRefreshError("");
      setState({ kind: "ready", ...data });
      setSelectedMemberId((id) =>
        id !== null && data.members.some((member) => member.id === id) ? id : null,
      );
    } catch {
      if (loadId === latestLoad.current) {
        setRefreshError("The change was saved, but the tree couldn't be reloaded. Refresh the page to see it.");
      }
    }
  }, [treeId]);

  const closeDialog = useCallback(() => setDialog(null), []);
  const selectedMember = useMemo(
    () => ready?.members.find((member) => member.id === selectedMemberId) ?? null,
    [ready?.members, selectedMemberId],
  );
  const memberOptions = useMemo(
    () => (ready?.members ?? []).map((member) => ({ id: member.id, fullName: member.full_name })),
    [ready?.members],
  );

  // ----- Mutations (each goes through Django, then reloads) -----
  const handleAddMember = async (input: MemberInput) => {
    if (treeId === null) return;
    const created = await createMember(treeId, input);
    setDialog(null);
    await refresh();
    setSelectedMemberId(created.id);
  };

  const handleEditMember = async (member: FamilyMember, input: MemberInput) => {
    if (treeId === null) return;
    await updateMember(treeId, member.id, input);
    setDialog(null);
    await refresh();
  };

  const handleDeleteMember = async (member: FamilyMember) => {
    if (treeId === null) return;
    await deleteMember(treeId, member.id);
    setDialog(null);
    setSelectedMemberId(null);
    await refresh();
  };

  const handleAddRelationship = async (input: RelationshipInput) => {
    if (treeId === null) return;
    await createRelationship(treeId, input);
    setDialog(null);
    await refresh();
  };

  const handleDeleteRelationship = async (relationship: Relationship) => {
    if (treeId === null) return;
    await deleteRelationship(treeId, relationship.id);
    setDialog(null);
    await refresh();
  };

  const handleSubmitRequest = useCallback(
    async (request: ChangeRequestInput) => {
      if (treeId === null) return;
      await submitChangeRequest(treeId, request);
    },
    [treeId],
  );

  // ----- Tree settings (Owner; FR-23, proposed) -----
  const handleTreeSaved = (saved: FamilyTree) => {
    setState((current) =>
      current.kind === "ready" ? { ...current, tree: { ...current.tree, ...saved } } : current,
    );
    setDialog(null);
    setNotice(`Saved changes to ${saved.name}.`);
  };

  const handleTreeDeleted = (name: string) => {
    // Replace, so Back doesn't return to the deleted tree's URL.
    navigate("/my-trees", { replace: true, state: { notice: `${name} was deleted.` } });
  };

  // ----- Search (FR-15) -----
  const handleSearchSelect = (memberId: number) => {
    setFocusRequest((current) => ({ memberId, key: (current?.key ?? 0) + 1 }));
  };

  // ----- Collaborator suggestions (FR-12, FR-24) -----
  const backToContributions = (tab?: ContributionTab, message?: string) => {
    if (message) setNotice(message);
    setContributionsReload((key) => key + 1);
    setDialog(tab ? { kind: "contributions", tab } : null);
  };

  const handleProposeChanges = async (
    member: FamilyMember,
    changes: Record<string, string | null>,
    notes: string,
    returnTo?: ContributionTab,
  ) => {
    if (treeId === null) return;
    await submitChangeRequest(treeId, {
      change_type: "UPDATE_MEMBER",
      description: notes,
      target_member: member.id,
      based_on_version: member.version,
      proposed_data: changes,
    });
    backToContributions(returnTo, `Your changes to ${member.full_name} were sent to the Tree Owner.`);
  };

  const handleSuggestDocument = async (member: FamilyMember, file: File | null, notes: string) => {
    if (treeId === null || !file) return;
    await submitDocumentSuggestion(treeId, { target_member: member.id, description: notes, file });
    setDialog(null);
    setNotice(`Document sent to the Tree Owner for ${member.full_name}.`);
  };

  const saveSuggestionEdit = async (
    suggestion: ChangeRequest,
    tab: ContributionTab,
    edit: Parameters<typeof updateSuggestion>[2],
  ) => {
    if (treeId === null) return;
    await updateSuggestion(treeId, suggestion.id, edit);
    backToContributions(tab, "Suggestion updated.");
  };

  const ownerEmptyActions = (
    <>
      <button type="button" className={primaryButtonClass} onClick={() => setDialog({ kind: "add-member" })}>
        Add the first member
      </button>
      {Boolean(openRequestCount) && (
        <button type="button" className={secondaryButtonClass} onClick={() => setDialog({ kind: "review" })}>
          Review {openRequestCount} {openRequestCount === 1 ? "request" : "requests"}
        </button>
      )}
    </>
  );
  const collaboratorEmptyActions = (
    <button type="button" className={primaryButtonClass} onClick={() => setDialog({ kind: "request-change" })}>
      Request a change
    </button>
  );

  return (
    <main className="flex min-h-screen flex-col items-stretch bg-[#f6f4ee] text-[#272522]">
      <AppHeader current="my-trees" />

      {state.kind === "loading" && (
        <Notice>
          <p role="status">Loading your family tree…</p>
        </Notice>
      )}

      {state.kind === "error" && (
        <Notice>
          <p role="alert">We couldn't load this family tree.</p>
          <button type="button" className={primaryButtonClass} onClick={() => setReloadKey((key) => key + 1)}>
            Try again
          </button>
          <Link to="/my-trees" className="text-[13px] font-semibold text-[#355b43] hover:underline">
            Back to My Trees
          </Link>
        </Notice>
      )}

      {state.kind === "not-found" && (
        <Notice>
          <p role="alert">That tree doesn't exist or you don't have access to it.</p>
          <Link to="/my-trees" className={primaryButtonClass}>
            Back to My Trees
          </Link>
        </Notice>
      )}

      {ready && treeId !== null && (
        <>
          <FamilyTreeToolbarSection
            treeId={treeId}
            treeName={ready.tree.name}
            treeDescription={ready.tree.description}
            memberCount={ready.members.length}
            isOwner={isOwner}
            onSearchSelect={handleSearchSelect}
            onEditTree={() => setDialog({ kind: "edit-tree" })}
            onDeleteTree={() => setDialog({ kind: "delete-tree" })}
            onOpenContributions={() => setDialog({ kind: "contributions" })}
            openRequestCount={openRequestCount}
            onAddMember={() => setDialog({ kind: "add-member" })}
            onAddRelationship={() => setDialog({ kind: "add-relationship" })}
            onReviewRequests={() => setDialog({ kind: "review" })}
            onInvite={() => setDialog({ kind: "invite" })}
            onRequestChange={() => setDialog({ kind: "request-change" })}
          />
          <p
            role="status"
            aria-live="polite"
            className={notice ? "flex items-center justify-between gap-3 bg-[#e8ede3] px-4 py-2.5 [font-family:'Inter',Helvetica] text-[13px] text-[#355b43] sm:px-9" : "sr-only"}
          >
            <span>{notice}</span>
            {notice && (
              <button
                type="button"
                onClick={() => setNotice("")}
                className="min-h-11 rounded-md px-3 font-semibold hover:bg-[#dfe7d8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#355b43]"
              >
                Dismiss
              </button>
            )}
          </p>
          {refreshError && (
            <p role="alert" className="bg-[#f7ece6] px-9 py-2.5 [font-family:'Inter',Helvetica] text-[13px] text-[#8a3f2c]">
              {refreshError}
            </p>
          )}
          <FamilyTreeCanvasSection
            treeName={ready.tree.name}
            members={ready.members}
            relationships={ready.relationships}
            selectedMemberId={selectedMemberId}
            onSelectMember={(member) => setSelectedMemberId(member.id)}
            focusRequest={focusRequest}
            emptyActions={isOwner ? ownerEmptyActions : collaboratorEmptyActions}
          />

          {selectedMember && !dialog && (
            <MemberDetailsDialogSection
              treeId={treeId}
              treeName={ready.tree.name}
              member={selectedMember}
              members={ready.members}
              relationships={ready.relationships}
              currentUserId={user?.id ?? null}
              onClose={() => setSelectedMemberId(null)}
              ownerActions={
                isOwner
                  ? {
                      onEdit: (member) => setDialog({ kind: "edit-member", member }),
                      onDelete: (member) => setDialog({ kind: "delete-member", member }),
                      onAddRelationship: (member) =>
                        setDialog({ kind: "add-relationship", memberId: member.id }),
                      onDeleteRelationship: (relationship, text) =>
                        setDialog({ kind: "delete-relationship", relationship, text }),
                      onMediaChanged: refresh,
                    }
                  : undefined
              }
              collaboratorActions={
                isOwner
                  ? undefined
                  : {
                      onSuggestDocument: (member) => setDialog({ kind: "suggest-document", member }),
                      onProposeChanges: (member) => setDialog({ kind: "propose-changes", member }),
                    }
              }
            />
          )}

          {dialog?.kind === "add-member" && (
            <MemberFormDialog onSubmit={handleAddMember} onClose={closeDialog} />
          )}
          {dialog?.kind === "edit-member" && (
            <MemberFormDialog
              member={dialog.member}
              onSubmit={(input) => handleEditMember(dialog.member, input)}
              onClose={closeDialog}
            />
          )}
          {dialog?.kind === "delete-member" && (
            <ConfirmDialog
              title={`Delete ${dialog.member.full_name}?`}
              message={`This permanently removes ${dialog.member.full_name} from ${ready.tree.name}, along with their relationships, photo and attached documents. This can't be undone.`}
              confirmLabel="Delete person"
              busyLabel="Deleting…"
              onConfirm={() => handleDeleteMember(dialog.member)}
              onClose={closeDialog}
            />
          )}
          {dialog?.kind === "add-relationship" && (
            <RelationshipFormDialog
              members={ready.members}
              initialMemberId={dialog.memberId}
              onSubmit={handleAddRelationship}
              onClose={closeDialog}
            />
          )}
          {dialog?.kind === "delete-relationship" && (
            <ConfirmDialog
              title="Remove this relationship?"
              message={`“${dialog.text}” will be removed from the tree. Both people stay in the tree.`}
              confirmLabel="Remove relationship"
              busyLabel="Removing…"
              onConfirm={() => handleDeleteRelationship(dialog.relationship)}
              onClose={closeDialog}
            />
          )}
          {dialog?.kind === "review" && (
            <ReviewRequestsDialog
              treeId={treeId}
              members={ready.members}
              onClose={closeDialog}
              onTreeChanged={refresh}
              onCountChange={setOpenRequestCount}
            />
          )}
          {dialog?.kind === "invite" && (
            <InviteDialog treeId={treeId} treeName={ready.tree.name} onClose={closeDialog} />
          )}
          {dialog?.kind === "edit-tree" && (
            <EditTreeDialog tree={ready.tree} onSaved={handleTreeSaved} onClose={closeDialog} />
          )}
          {dialog?.kind === "delete-tree" && (
            <DeleteTreeDialog
              tree={{ ...ready.tree, member_count: ready.members.length }}
              onDeleted={() => handleTreeDeleted(ready.tree.name)}
              onClose={closeDialog}
            />
          )}
          {dialog?.kind === "contributions" && (
            <MyContributionsDialog
              treeId={treeId}
              members={ready.members}
              initialTab={dialog.tab}
              reloadKey={contributionsReload}
              onClose={closeDialog}
              onEdit={(suggestion, tab) => setDialog({ kind: "edit-suggestion", suggestion, tab })}
              onOpenMember={(memberId) => {
                setDialog(null);
                setSelectedMemberId(memberId);
              }}
              onProposeChanges={(member, tab) =>
                setDialog({ kind: "propose-changes", member, returnTo: tab })
              }
            />
          )}
          {dialog?.kind === "propose-changes" && (
            <MemberProposalDialog
              mode="update"
              member={dialog.member}
              title={`Propose changes to ${dialog.member.full_name}`}
              description="The Tree Owner reviews your changes before anything in the tree changes."
              submitLabel="Send for review"
              onSubmit={(changes, notes) =>
                handleProposeChanges(dialog.member, changes, notes, dialog.returnTo)
              }
              onClose={() =>
                setDialog(dialog.returnTo ? { kind: "contributions", tab: dialog.returnTo } : null)
              }
            />
          )}
          {dialog?.kind === "suggest-document" && (
            <DocumentSuggestionDialog
              memberName={dialog.member.full_name}
              onSubmit={(file, notes) => handleSuggestDocument(dialog.member, file, notes)}
              onClose={closeDialog}
            />
          )}
          {dialog?.kind === "edit-suggestion" &&
            (() => {
              const { suggestion, tab } = dialog;
              const data = (suggestion.proposed_data ?? {}) as Record<string, unknown>;
              const back = () => setDialog({ kind: "contributions", tab });
              switch (suggestion.change_type) {
                case "ADD_MEMBER":
                  return (
                    <MemberProposalDialog
                      mode="add"
                      initialValues={data}
                      initialNotes={suggestion.description}
                      title="Edit your suggested person"
                      description="Still waiting for review, so you can change it."
                      submitLabel="Save changes"
                      onSubmit={(values, notes) =>
                        saveSuggestionEdit(suggestion, tab, { description: notes, proposed_data: values })
                      }
                      onClose={back}
                    />
                  );
                case "UPDATE_MEMBER": {
                  const target = ready.members.find((member) => member.id === suggestion.target_member);
                  if (!target) return null;
                  return (
                    <MemberProposalDialog
                      mode="update"
                      member={target}
                      initialValues={data}
                      initialNotes={suggestion.description}
                      title={`Edit your changes to ${target.full_name}`}
                      description="Still waiting for review, so you can change it."
                      submitLabel="Save changes"
                      onSubmit={(changes, notes) =>
                        saveSuggestionEdit(suggestion, tab, {
                          description: notes,
                          proposed_data: changes,
                          based_on_version: target.version,
                        })
                      }
                      onClose={back}
                    />
                  );
                }
                case "ADD_RELATIONSHIP":
                  return (
                    <RelationshipFormDialog
                      members={ready.members}
                      initial={data as Partial<RelationshipInput>}
                      notes={suggestion.description}
                      title="Edit your suggested relationship"
                      description="Still waiting for review, so you can change it."
                      submitLabel="Save changes"
                      onSubmit={(input, notes) =>
                        saveSuggestionEdit(suggestion, tab, {
                          description: notes,
                          proposed_data: input as unknown as Record<string, unknown>,
                        })
                      }
                      onClose={back}
                    />
                  );
                case "ADD_MEDIA": {
                  const memberName =
                    suggestion.target_member_name ??
                    ready.members.find((member) => member.id === suggestion.target_member)?.full_name ??
                    "this person";
                  return (
                    <DocumentSuggestionDialog
                      memberName={memberName}
                      currentFileName={suggestion.file_name ?? null}
                      initialNotes={suggestion.description}
                      title={`Edit your document for ${memberName}`}
                      submitLabel="Save changes"
                      onSubmit={(file, notes) => {
                        if (!file) return saveSuggestionEdit(suggestion, tab, { description: notes });
                        const form = new FormData();
                        form.append("description", notes);
                        form.append("proposed_file", file);
                        return saveSuggestionEdit(suggestion, tab, form);
                      }}
                      onClose={back}
                    />
                  );
                }
              }
            })()}
          {dialog?.kind === "request-change" && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-[#283b30]/30">
              <ChangeRequestModalSection
                members={memberOptions}
                onClose={closeDialog}
                onSubmit={handleSubmitRequest}
              />
            </div>
          )}
        </>
      )}
    </main>
  );
};
