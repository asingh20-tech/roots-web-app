// Person details for one member, from GET /api/trees/:treeId/members/:id/.
// Visual design carried over from the Figma "Person details" frame
// (formerly RootsJamesBennett/PersonDetailsDialogSection, node 29:1967).
//
// Owner: edit/delete, relationships, photo (FR-4) and documents (FR-6, FR-9).
// Collaborator: suggest a document for anyone (ADD_MEDIA, UR-2), and propose
// changes to people they contributed (UPDATE_MEMBER; FR-25, proposed).
import {
  ChangeEvent,
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { ApiError, firstErrorMessage } from "../../../../services/api";
import {
  DOCUMENT_ACCEPT,
  FamilyMember,
  FamilyMemberDetail,
  Gender,
  PHOTO_ACCEPT,
  Relationship,
  checkUpload,
  deleteDocument,
  deleteMemberPhoto,
  getMember,
  uploadDocument,
  uploadMemberPhoto,
} from "../../../../services/trees";
import { initialsOf, lifeSpan } from "../FamilyTreeCanvasSection/familyTreeLayout";

type MemberDetailsDialogSectionProps = {
  treeId: number;
  treeName: string;
  member: FamilyMember;
  members: FamilyMember[];
  relationships: Relationship[];
  currentUserId?: number | null;
  onClose: () => void;
  // Owner-only actions; omitted for Collaborators.
  ownerActions?: {
    onEdit: (member: FamilyMember) => void;
    onDelete: (member: FamilyMember) => void;
    onAddRelationship: (member: FamilyMember) => void;
    onDeleteRelationship: (relationship: Relationship, description: string) => void;
    // A photo changed: the canvas card needs the new picture.
    onMediaChanged: () => Promise<void> | void;
  };
  // Collaborator-only entry points; they create suggestions, never edits.
  collaboratorActions?: {
    onSuggestDocument: (member: FamilyMember) => void;
    onProposeChanges: (member: FamilyMember) => void;
  };
};

type Connection = { relationship: Relationship; text: string };

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const genderLabels: Record<Gender, string> = {
  FEMALE: "Female",
  MALE: "Male",
  OTHER: "Other",
  UNKNOWN: "Not recorded",
};

const formatDate = (value: string | null) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not recorded";

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const errorText = (error: unknown, fallback: string) =>
  error instanceof ApiError
    ? firstErrorMessage(error.fieldErrors) ?? error.message
    : fallback;

const smallButton =
  "roots-press inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#dedcd2] bg-white px-4 [font-family:'Inter',Helvetica] text-[13px] font-semibold text-[#283b30] hover:bg-[#f6f4ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#355b43] disabled:cursor-not-allowed disabled:opacity-50";
const solidButton =
  "roots-press inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#355b43] px-4 [font-family:'Inter',Helvetica] text-[13px] font-semibold text-white hover:bg-[#2b4a37] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#355b43] disabled:cursor-not-allowed disabled:opacity-50";
const dangerOutline =
  "roots-press inline-flex min-h-11 items-center justify-center rounded-lg border border-[#e8d4cb] bg-white px-4 [font-family:'Inter',Helvetica] text-[13px] font-semibold text-[#8a3f2c] hover:bg-[#fbf3ef] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a3f2c] disabled:cursor-not-allowed disabled:opacity-50";

// "Parent: Rose Mitchell", "Spouse: Eleanor Ellis", ... from relationships.
const familyConnections = (
  memberId: number,
  members: FamilyMember[],
  relationships: Relationship[],
): Connection[] => {
  const nameOf = (id: number) =>
    members.find((candidate) => candidate.id === id)?.full_name;
  const lines: Connection[] = [];
  const add = (relationship: Relationship, text: string) =>
    lines.push({ relationship, text });
  for (const rel of relationships) {
    const isFirst = rel.member1 === memberId;
    const isSecond = rel.member2 === memberId;
    if (!isFirst && !isSecond) continue;
    const otherName = nameOf(isFirst ? rel.member2 : rel.member1);
    if (!otherName) continue;
    switch (rel.relationship_type) {
      case "PARENT":
        add(rel, isFirst ? `Child: ${otherName}` : `Parent: ${otherName}`);
        break;
      case "ADOPTIVE_PARENT":
        add(
          rel,
          isFirst ? `Adopted child: ${otherName}` : `Adoptive parent: ${otherName}`,
        );
        break;
      case "SPOUSE":
        add(rel, `Spouse: ${otherName}`);
        break;
      case "SIBLING":
        add(rel, `Sibling: ${otherName}`);
        break;
    }
  }
  return lines;
};

export const MemberDetailsDialogSection = ({
  treeId,
  treeName,
  member,
  members,
  relationships,
  currentUserId,
  onClose,
  ownerActions,
  collaboratorActions,
}: MemberDetailsDialogSectionProps): JSX.Element => {
  const [detail, setDetail] = useState<FamilyMemberDetail | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [detailKey, setDetailKey] = useState(0);
  const [busy, setBusy] = useState<null | "photo" | "remove-photo" | "document" | number>(null);
  const [mediaError, setMediaError] = useState("");
  const [mediaNotice, setMediaNotice] = useState("");
  const [confirmDocId, setConfirmDocId] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoadError(false);
    getMember(treeId, member.id, controller.signal)
      .then(setDetail)
      .catch((error: unknown) => {
        if ((error as Error).name !== "AbortError") setLoadError(true);
      });
    return () => controller.abort();
  }, [treeId, member.id, member.version, detailKey]);

  // Reset when a different person is shown.
  useEffect(() => {
    setDetail(null);
    setMediaError("");
    setMediaNotice("");
    setConfirmDocId(null);
  }, [member.id]);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busyRef.current) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !panelRef.current) return;
    const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  // One media request at a time (no duplicate uploads or deletes).
  const run = async (
    kind: NonNullable<typeof busy>,
    action: () => Promise<unknown>,
    done: string,
    fallback: string,
  ) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(kind);
    setMediaError("");
    setMediaNotice("");
    try {
      await action();
      setMediaNotice(done);
      setDetailKey((key) => key + 1);
      if (kind === "photo" || kind === "remove-photo") await ownerActions?.onMediaChanged();
    } catch (error) {
      setMediaError(errorText(error, fallback));
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  };

  const onPhotoPicked = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const problem = checkUpload(file, "photo");
    if (problem) {
      setMediaError(problem);
      return;
    }
    void run("photo", () => uploadMemberPhoto(treeId, member.id, file), "Photo saved.", "We couldn't upload the photo.");
  };

  const onDocumentPicked = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const problem = checkUpload(file, "document");
    if (problem) {
      setMediaError(problem);
      return;
    }
    void run(
      "document",
      () => uploadDocument(treeId, member.id, file),
      `${file.name} attached.`,
      "We couldn't upload the document.",
    );
  };

  const shown = detail ?? member;
  const dates = lifeSpan(shown);
  const connections = familyConnections(member.id, members, relationships);
  const contributorId = shown.contributed_by ?? null;
  const isMine = contributorId !== null && contributorId === currentUserId;
  const addedBy = contributorId === null
    ? "Tree Owner"
    : isMine
      ? "You (approved suggestion)"
      : `${shown.contributed_by_name ?? "A collaborator"} (approved suggestion)`;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[#283b30]/30 px-3 py-6 sm:px-4 sm:py-12"
      onClick={(event) => {
        if (event.target === event.currentTarget && !busyRef.current) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-details-title"
        onKeyDown={trapFocus}
        className="roots-modal-panel relative mx-auto flex w-full max-w-[1000px] flex-col gap-6 rounded-[20px] border border-solid border-[#dedcd2] bg-[#fffdf9] p-5 shadow-[0px_18px_48px_#3444321f] sm:p-8"
      >
        <div className="flex items-start gap-4 sm:items-center sm:gap-6">
          <h1
            id="member-details-title"
            className="min-w-0 flex-1 break-words [font-family:'Lora',Helvetica] font-normal text-[#283b30] text-[24px] tracking-[-0.26px] leading-tight sm:text-[32px]"
          >
            {shown.full_name} · Person details
          </h1>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close person details"
            className="roots-press flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-solid border-[#dedcd2] hover:bg-[#f6f4ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#355b43]"
          >
            <img className="w-3.5 h-3.5" alt="" src="/img/close.svg" />
          </button>
        </div>

        <p role="status" aria-live="polite" className={mediaNotice ? "rounded-lg bg-[#e8ede3] px-3.5 py-2.5 [font-family:'Inter',Helvetica] text-[13px] text-[#355b43]" : "sr-only"}>
          {mediaNotice}
        </p>
        {mediaError && (
          <p role="alert" className="rounded-lg bg-[#f7ece6] px-3.5 py-2.5 [font-family:'Inter',Helvetica] text-[13px] text-[#8a3f2c]">
            {mediaError}
          </p>
        )}

        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <aside className="flex w-full flex-col gap-5 md:w-[344px] md:shrink-0">
            <section className="flex flex-col items-center gap-5 rounded-2xl border border-solid border-[#dedcd2] bg-[#fffdf9] p-5 sm:p-7">
              {shown.photo_url ? (
                <img
                  key={`${shown.photo_url}-${shown.version}`}
                  className="w-32 h-32 rounded-[100px] object-cover"
                  alt={`${shown.full_name} portrait`}
                  src={shown.photo_url}
                />
              ) : (
                <span
                  className="flex w-32 h-32 items-center justify-center rounded-[100px] bg-[#ece9e0] [font-family:'Lora',Helvetica] text-[40px] text-[#617b58]"
                  aria-hidden="true"
                >
                  {initialsOf(shown)}
                </span>
              )}
              {ownerActions && (
                <div className="flex flex-wrap justify-center gap-2">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept={PHOTO_ACCEPT}
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden="true"
                    onChange={onPhotoPicked}
                  />
                  <button
                    type="button"
                    className={smallButton}
                    onClick={() => photoInputRef.current?.click()}
                    disabled={busy !== null}
                    aria-busy={busy === "photo" || undefined}
                  >
                    {busy === "photo" ? "Uploading…" : shown.photo_url ? "Replace photo" : "Add photo"}
                  </button>
                  {shown.photo_url && (
                    <button
                      type="button"
                      className={dangerOutline}
                      onClick={() =>
                        void run(
                          "remove-photo",
                          () => deleteMemberPhoto(treeId, member.id),
                          "Photo removed.",
                          "We couldn't remove the photo.",
                        )
                      }
                      disabled={busy !== null}
                      aria-busy={busy === "remove-photo" || undefined}
                    >
                      {busy === "remove-photo" ? "Removing…" : "Remove photo"}
                    </button>
                  )}
                </div>
              )}
              <div className="flex w-full flex-col items-start gap-[9px]">
                <div className="[font-family:'Inter',Helvetica] font-semibold text-[#617b58] text-[11px] uppercase">
                  {treeName}
                </div>
                <h2 className="break-words [font-family:'Lora',Helvetica] font-normal text-[#283b30] text-[30px] tracking-[-0.30px] leading-tight sm:text-[38px]">
                  {shown.full_name}
                </h2>
                {dates && (
                  <div className="[font-family:'Inter',Helvetica] font-normal text-[#283b30] text-base">
                    {dates}
                  </div>
                )}
              </div>
              <dl className="grid w-full grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-[#dedcd2] pt-4 [font-family:'Inter',Helvetica] text-[13px]">
                <dt className="text-[#7b8177]">Gender</dt>
                <dd className="text-[#283b30]">{genderLabels[shown.gender]}</dd>
                <dt className="text-[#7b8177]">Born</dt>
                <dd className="text-[#283b30]">{formatDate(shown.birth_date)}</dd>
                {shown.death_date && (
                  <>
                    <dt className="text-[#7b8177]">Died</dt>
                    <dd className="text-[#283b30]">{formatDate(shown.death_date)}</dd>
                  </>
                )}
                <dt className="text-[#7b8177]">Added by</dt>
                <dd className="text-[#283b30]">{addedBy}</dd>
              </dl>
            </section>

            {ownerActions && (
              <div className="flex flex-wrap gap-2.5">
                <button type="button" onClick={() => ownerActions.onEdit(shown)} className={solidButton}>
                  Edit details
                </button>
                <button type="button" onClick={() => ownerActions.onAddRelationship(shown)} className={smallButton}>
                  Add relationship
                </button>
                <button type="button" onClick={() => ownerActions.onDelete(shown)} className={dangerOutline}>
                  Delete person
                </button>
              </div>
            )}

            {collaboratorActions && (
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-wrap gap-2.5">
                  {isMine && (
                    <button
                      type="button"
                      onClick={() => collaboratorActions.onProposeChanges(shown)}
                      className={solidButton}
                    >
                      Propose changes
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => collaboratorActions.onSuggestDocument(shown)}
                    className={isMine ? smallButton : solidButton}
                  >
                    Suggest a document
                  </button>
                </div>
                <p className="[font-family:'Inter',Helvetica] text-[12px] leading-[18px] text-[#7b8177]">
                  {isMine
                    ? "You added this person. Changes you propose go to the Tree Owner for approval."
                    : "Only the Tree Owner can change this person's details. You can send them a document to review."}
                </p>
              </div>
            )}

            <section className="flex flex-col gap-4 rounded-2xl border border-solid border-[#dedcd2] bg-[#f6f4ee] p-5">
              <h2 className="[font-family:'Inter',Helvetica] font-semibold text-[#283b30] text-lg">
                Family information
              </h2>
              {connections.length ? (
                <ul className="flex flex-col gap-3">
                  {connections.map(({ relationship, text }) => (
                    <li key={relationship.id} className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="w-1.5 h-1.5 shrink-0 bg-[#617b58] rounded-[3px]"
                      />
                      <span className="flex-1 [font-family:'Inter',Helvetica] text-[#283b30] text-[13px]">
                        {text}
                      </span>
                      {ownerActions && (
                        <button
                          type="button"
                          onClick={() => ownerActions.onDeleteRelationship(relationship, text)}
                          aria-label={`Remove relationship: ${text}`}
                          className="roots-press min-h-11 rounded-md px-3 [font-family:'Inter',Helvetica] text-[12px] font-semibold text-[#8a3f2c] hover:bg-[#f7ece6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8a3f2c]"
                        >
                          Remove
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="[font-family:'Inter',Helvetica] text-[#7b8177] text-[13px]">
                  No relationships recorded yet.
                </p>
              )}
            </section>
          </aside>

          <section className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="[font-family:'Inter',Helvetica] font-semibold text-[#283b30] text-lg">
                Attached Documents
              </h2>
              <div className="flex items-center gap-2.5">
                {detail && (
                  <span className="rounded-[100px] bg-[#e8ede3] px-2.5 py-[5px] [font-family:'Inter',Helvetica] font-semibold text-[#355b43] text-[11px]">
                    {detail.documents.length}{" "}
                    {detail.documents.length === 1 ? "document" : "documents"}
                  </span>
                )}
                {ownerActions && (
                  <>
                    <input
                      ref={documentInputRef}
                      type="file"
                      accept={DOCUMENT_ACCEPT}
                      className="sr-only"
                      tabIndex={-1}
                      aria-hidden="true"
                      onChange={onDocumentPicked}
                    />
                    <button
                      type="button"
                      className={smallButton}
                      onClick={() => documentInputRef.current?.click()}
                      disabled={busy !== null}
                      aria-busy={busy === "document" || undefined}
                    >
                      {busy === "document" ? "Uploading…" : "Attach document"}
                    </button>
                  </>
                )}
              </div>
            </div>
            {ownerActions && (
              <p className="-mt-2 [font-family:'Inter',Helvetica] text-[12px] text-[#7b8177]">
                PDF, JPG or PNG, up to 10 MB.
              </p>
            )}
            {loadError && (
              <p role="alert" className="rounded-lg bg-[#f7ece6] p-3 text-sm text-[#8a3f2c]">
                We couldn't load this person's documents.
              </p>
            )}
            {!detail && !loadError && (
              <p className="[font-family:'Inter',Helvetica] text-[#7b8177] text-[13px]">
                Loading documents…
              </p>
            )}
            {detail && detail.documents.length === 0 && (
              <p className="rounded-xl border border-dashed border-[#dedcd2] p-6 text-center [font-family:'Inter',Helvetica] text-[#7b8177] text-[13px]">
                No documents attached to {detail.full_name} yet.
              </p>
            )}
            {detail?.documents.map((document) => (
              <article
                key={document.id}
                className="flex flex-wrap items-center gap-x-[18px] gap-y-3 rounded-xl border border-solid border-[#dedcd2] p-3.5"
              >
                <div className="flex min-w-[180px] flex-1 flex-col gap-[9px]">
                  <div className="[font-family:'Inter',Helvetica] font-semibold text-[#617b58] text-xs uppercase">
                    {document.file_type}
                  </div>
                  <p className="truncate [font-family:'Inter',Helvetica] font-semibold text-[#283b30] text-base">
                    {document.name}
                  </p>
                  <p className="[font-family:'Inter',Helvetica] text-[#7b8177] text-xs">
                    {formatSize(document.file_size)} · Uploaded{" "}
                    {new Date(document.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {confirmDocId === document.id ? (
                    <>
                      <span className="[font-family:'Inter',Helvetica] text-[13px] text-[#283b30]">Delete this file?</span>
                      <button type="button" className={smallButton} onClick={() => setConfirmDocId(null)} disabled={busy !== null}>
                        Keep
                      </button>
                      <button
                        type="button"
                        className={dangerOutline}
                        onClick={() =>
                          void run(
                            document.id,
                            () => deleteDocument(treeId, member.id, document.id),
                            `${document.name} deleted.`,
                            "We couldn't delete the document.",
                          ).then(() => setConfirmDocId(null))
                        }
                        disabled={busy !== null}
                        aria-busy={busy === document.id || undefined}
                      >
                        {busy === document.id ? "Deleting…" : "Delete"}
                      </button>
                    </>
                  ) : (
                    <>
                      <a
                        href={document.url}
                        target="_blank"
                        rel="noreferrer"
                        className="roots-press inline-flex min-h-11 items-center rounded-lg border border-solid border-[#dedcd2] px-4 [font-family:'Inter',Helvetica] font-semibold text-[#355b43] text-[13px] hover:bg-[#f6f4ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#355b43]"
                      >
                        Open<span className="sr-only"> {document.name} (opens in a new tab)</span>
                      </a>
                      {ownerActions && (
                        <button
                          type="button"
                          className={dangerOutline}
                          aria-label={`Delete ${document.name}`}
                          onClick={() => setConfirmDocId(document.id)}
                          disabled={busy !== null}
                        >
                          Delete
                        </button>
                      )}
                    </>
                  )}
                </div>
              </article>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
};
