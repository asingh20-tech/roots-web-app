// Person details for one member, from GET /api/trees/:treeId/members/:id/.
// Visual design carried over from the Figma "Person details" frame
// (formerly RootsJamesBennett/PersonDetailsDialogSection, node 29:1967).
import { useEffect, useRef, useState } from "react";
import {
  FamilyMember,
  FamilyMemberDetail,
  Gender,
  Relationship,
  getMember,
} from "../../../../services/trees";
import { initialsOf, lifeSpan } from "../FamilyTreeCanvasSection/familyTreeLayout";

type MemberDetailsDialogSectionProps = {
  treeId: number;
  treeName: string;
  member: FamilyMember;
  members: FamilyMember[];
  relationships: Relationship[];
  onClose: () => void;
};

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

// "Parent: Rose Mitchell", "Spouse: Eleanor Ellis", ... from relationships.
const familyConnections = (
  memberId: number,
  members: FamilyMember[],
  relationships: Relationship[],
): string[] => {
  const nameOf = (id: number) =>
    members.find((candidate) => candidate.id === id)?.full_name;
  const lines: string[] = [];
  for (const rel of relationships) {
    const isFirst = rel.member1 === memberId;
    const isSecond = rel.member2 === memberId;
    if (!isFirst && !isSecond) continue;
    const otherName = nameOf(isFirst ? rel.member2 : rel.member1);
    if (!otherName) continue;
    switch (rel.relationship_type) {
      case "PARENT":
        lines.push(isFirst ? `Child: ${otherName}` : `Parent: ${otherName}`);
        break;
      case "ADOPTIVE_PARENT":
        lines.push(
          isFirst
            ? `Adopted child: ${otherName}`
            : `Adoptive parent: ${otherName}`,
        );
        break;
      case "SPOUSE":
        lines.push(`Spouse: ${otherName}`);
        break;
      case "SIBLING":
        lines.push(`Sibling: ${otherName}`);
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
  onClose,
}: MemberDetailsDialogSectionProps): JSX.Element => {
  const [detail, setDetail] = useState<FamilyMemberDetail | null>(null);
  const [loadError, setLoadError] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    setDetail(null);
    setLoadError(false);
    getMember(treeId, member.id, controller.signal)
      .then(setDetail)
      .catch((error: unknown) => {
        if ((error as Error).name !== "AbortError") setLoadError(true);
      });
    return () => controller.abort();
  }, [treeId, member.id]);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const shown = detail ?? member;
  const dates = lifeSpan(shown);
  const connections = familyConnections(member.id, members, relationships);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#283b30]/30 px-4 py-12"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-details-title"
        className="relative mx-auto flex w-full max-w-[1000px] flex-col gap-6 rounded-[20px] border border-solid border-[#dedcd2] bg-[#fffdf9] p-8 shadow-[0px_18px_48px_#3444321f]"
      >
        <div className="flex items-center gap-6">
          <h1
            id="member-details-title"
            className="flex-1 [font-family:'Lora',Helvetica] font-normal text-[#283b30] text-[32px] tracking-[-0.26px] leading-[normal]"
          >
            {shown.full_name} · Person details
          </h1>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close person details"
            className="flex w-10 h-10 items-center justify-center rounded-[10px] border border-solid border-[#dedcd2]"
          >
            <img className="w-3.5 h-3.5" alt="" src="/img/close.svg" />
          </button>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <aside className="flex w-full flex-col gap-5 md:w-[344px] md:shrink-0">
            <section className="flex flex-col items-center gap-5 rounded-2xl border border-solid border-[#dedcd2] bg-[#fffdf9] p-7">
              {shown.photo_url ? (
                <img
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
              <div className="flex w-full flex-col items-start gap-[9px]">
                <div className="[font-family:'Inter',Helvetica] font-semibold text-[#617b58] text-[11px] uppercase">
                  {treeName}
                </div>
                <h2 className="[font-family:'Lora',Helvetica] font-normal text-[#283b30] text-[38px] tracking-[-0.30px] leading-[normal]">
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
              </dl>
            </section>

            <section className="flex flex-col gap-4 rounded-2xl border border-solid border-[#dedcd2] bg-[#f6f4ee] p-5">
              <h2 className="[font-family:'Inter',Helvetica] font-semibold text-[#283b30] text-lg">
                Family information
              </h2>
              {connections.length ? (
                <ul className="flex flex-col gap-3">
                  {connections.map((line) => (
                    <li key={line} className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="w-1.5 h-1.5 shrink-0 bg-[#617b58] rounded-[3px]"
                      />
                      <span className="[font-family:'Inter',Helvetica] text-[#283b30] text-[13px]">
                        {line}
                      </span>
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

          <section className="flex flex-1 flex-col gap-4" aria-live="polite">
            <div className="flex items-center justify-between">
              <h2 className="[font-family:'Inter',Helvetica] font-semibold text-[#283b30] text-lg">
                Attached Documents
              </h2>
              {detail && (
                <span className="rounded-[100px] bg-[#e8ede3] px-2.5 py-[5px] [font-family:'Inter',Helvetica] font-semibold text-[#355b43] text-[11px]">
                  {detail.documents.length}{" "}
                  {detail.documents.length === 1 ? "document" : "documents"}
                </span>
              )}
            </div>
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
                className="flex items-center gap-[18px] rounded-xl border border-solid border-[#dedcd2] p-3.5"
              >
                <div className="flex flex-col gap-[9px] flex-1 min-w-0">
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
                <a
                  href={document.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center rounded-lg border border-solid border-[#dedcd2] px-4 [font-family:'Inter',Helvetica] font-semibold text-[#355b43] text-[13px]"
                >
                  Open
                </a>
              </article>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
};
