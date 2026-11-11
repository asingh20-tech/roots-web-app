// FR-24 / FR-25 (proposed): a Collaborator's own suggestions in this tree,
// by status. Django returns only the signed-in user's suggestions here, so
// nothing on this screen can show or touch anyone else's. Pending ones can be
// edited or withdrawn; approved members open their saved profile.
import { KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState } from "react";
import {
  Dialog,
  formErrorClass,
  secondaryButtonClass,
} from "../../../../components/Dialog/Dialog";
import { ApiError, firstErrorMessage } from "../../../../services/api";
import {
  ChangeRequest,
  ChangeStatus,
  FamilyMember,
  listMySuggestions,
  withdrawSuggestion,
} from "../../../../services/trees";
import { genderOptions } from "../MemberFormDialog/MemberFormDialog";
import { relationshipTypeOptions } from "../RelationshipFormDialog/RelationshipFormDialog";

export type ContributionTab = ChangeStatus;

const TABS: Array<{ value: ContributionTab; label: string; empty: string }> = [
  { value: "PENDING", label: "Pending", empty: "Nothing waiting for review. Suggestions you send show up here straight away." },
  { value: "APPROVED", label: "Approved", empty: "No approved suggestions yet." },
  { value: "REJECTED", label: "Rejected", empty: "None of your suggestions were rejected." },
  { value: "OUTDATED", label: "Outdated", empty: "No outdated suggestions." },
  { value: "WITHDRAWN", label: "Withdrawn", empty: "You haven't withdrawn anything." },
];

export const typeLabels: Record<ChangeRequest["change_type"], string> = {
  ADD_MEMBER: "New person",
  UPDATE_MEMBER: "Changes to a person",
  ADD_MEDIA: "Document",
  ADD_RELATIONSHIP: "Relationship",
};

export const fieldLabels: Record<string, string> = {
  first_name: "First name",
  last_name: "Last name",
  gender: "Gender",
  birth_date: "Birth date",
  death_date: "Death date",
};

export const displayValue = (field: string, value: unknown): string => {
  if (value === null || value === undefined || value === "") return "Not recorded";
  if (field === "gender") {
    return genderOptions.find((option) => option.value === value)?.label ?? String(value);
  }
  return String(value);
};

const formatDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "";

const statusChip: Record<ChangeStatus, string> = {
  PENDING: "bg-[#f0ebdf] text-[#6f6550]",
  APPROVED: "bg-[#e8ede3] text-[#355b43]",
  REJECTED: "bg-[#f7ece6] text-[#8a3f2c]",
  OUTDATED: "bg-[#f7ece6] text-[#8a3f2c]",
  WITHDRAWN: "bg-[#ece9e0] text-[#5f655b]",
};

const actionClass =
  "roots-press inline-flex min-h-11 items-center rounded-lg border border-[#dedcd2] bg-white px-4 [font-family:'Inter',Helvetica] text-[13px] font-semibold text-[#283b30] hover:bg-[#f6f4ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#355b43] disabled:opacity-50";

type MyContributionsDialogProps = {
  treeId: number;
  members: FamilyMember[];
  initialTab?: ContributionTab;
  // Bumped by the parent after an edit, so the list re-reads Django.
  reloadKey?: number;
  onClose: () => void;
  onEdit: (suggestion: ChangeRequest, tab: ContributionTab) => void;
  onOpenMember: (memberId: number) => void;
  onProposeChanges: (member: FamilyMember, tab: ContributionTab) => void;
};

type ListState =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "ready"; items: ChangeRequest[]; count: number; page: number; hasMore: boolean; loadingMore?: boolean };

export const MyContributionsDialog = ({
  treeId,
  members,
  initialTab = "PENDING",
  reloadKey = 0,
  onClose,
  onEdit,
  onOpenMember,
  onProposeChanges,
}: MyContributionsDialogProps): JSX.Element => {
  const [tab, setTab] = useState<ContributionTab>(initialTab);
  const [list, setList] = useState<ListState>({ kind: "loading" });
  const [retry, setRetry] = useState(0);
  const [confirmWithdraw, setConfirmWithdraw] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [itemError, setItemError] = useState<Record<number, string>>({});
  const [announce, setAnnounce] = useState("");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const controller = new AbortController();
    setList({ kind: "loading" });
    setConfirmWithdraw(null);
    listMySuggestions(treeId, { status: tab, page: 1 }, controller.signal)
      .then((page) =>
        setList({ kind: "ready", items: page.results, count: page.count, page: 1, hasMore: Boolean(page.next) }),
      )
      .catch((error: unknown) => {
        if ((error as Error).name !== "AbortError") setList({ kind: "error" });
      });
    return () => controller.abort();
  }, [treeId, tab, reloadKey, retry]);

  const loadMore = async () => {
    if (list.kind !== "ready" || list.loadingMore) return;
    setList({ ...list, loadingMore: true });
    try {
      const page = await listMySuggestions(treeId, { status: tab, page: list.page + 1 });
      setList({
        kind: "ready",
        items: [...list.items, ...page.results],
        count: page.count,
        page: list.page + 1,
        hasMore: Boolean(page.next),
      });
    } catch {
      setList({ ...list, loadingMore: false });
      setAnnounce("We couldn't load more. Try again.");
    }
  };

  const memberById = (id: unknown) => members.find((member) => member.id === Number(id));
  const memberName = (id: unknown) => memberById(id)?.full_name ?? "a person no longer in the tree";

  const withdraw = async (suggestion: ChangeRequest) => {
    if (busyId !== null) return;
    setBusyId(suggestion.id);
    setItemError((current) => ({ ...current, [suggestion.id]: "" }));
    try {
      await withdrawSuggestion(treeId, suggestion.id);
      setList((current) =>
        current.kind === "ready"
          ? { ...current, items: current.items.filter((item) => item.id !== suggestion.id), count: current.count - 1 }
          : current,
      );
      setAnnounce("Suggestion withdrawn. It's kept under Withdrawn.");
      setConfirmWithdraw(null);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.status === 409
            ? `${error.message} Refresh the list to see where it went.`
            : firstErrorMessage(error.fieldErrors) ?? error.message
          : "We couldn't withdraw it. Check your connection and try again.";
      setItemError((current) => ({ ...current, [suggestion.id]: message }));
    } finally {
      setBusyId(null);
    }
  };

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    const index = TABS.findIndex((candidate) => candidate.value === tab);
    const moves: Record<string, number> = {
      ArrowRight: (index + 1) % TABS.length,
      ArrowLeft: (index - 1 + TABS.length) % TABS.length,
      Home: 0,
      End: TABS.length - 1,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const next = TABS[moves[event.key]].value;
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  const summary = (s: ChangeRequest) => {
    const data = (s.proposed_data ?? {}) as Record<string, unknown>;
    switch (s.change_type) {
      case "ADD_MEMBER":
        return (
          <p className="text-[15px] font-semibold text-[#283b30]">
            {`${String(data.first_name ?? "")} ${String(data.last_name ?? "")}`.trim()}
            {Boolean(data.birth_date || data.death_date) && (
              <span className="ml-2 text-[13px] font-normal text-[#7b8177]">
                {String(data.birth_date ?? "?").slice(0, 4)}–{data.death_date ? String(data.death_date).slice(0, 4) : ""}
              </span>
            )}
          </p>
        );
      case "UPDATE_MEMBER":
        return (
          <div className="flex flex-col gap-1.5">
            <p className="text-[15px] font-semibold text-[#283b30]">{s.target_member_name ?? memberName(s.target_member)}</p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13px]">
              {Object.entries(s.comparison ?? {}).map(([field, values]) => (
                <div key={field} className="contents">
                  <dt className="text-[#7b8177]">{fieldLabels[field] ?? field}</dt>
                  <dd className="text-[#283b30]">
                    {displayValue(field, values.original ?? values.current)} <span aria-hidden="true">→</span>
                    <span className="sr-only"> to </span> <strong className="font-semibold">{displayValue(field, values.proposed)}</strong>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        );
      case "ADD_RELATIONSHIP": {
        const phrase =
          relationshipTypeOptions.find((option) => option.value === data.relationship_type)?.phrase ??
          String(data.relationship_type);
        return (
          <p className="text-[14px] text-[#283b30]">
            <strong className="font-semibold">{memberName(data.member1)}</strong> {phrase}{" "}
            <strong className="font-semibold">{memberName(data.member2)}</strong>
            {data.start_date ? ` (married ${String(data.start_date)})` : ""}
          </p>
        );
      }
      case "ADD_MEDIA":
        return (
          <p className="text-[14px] text-[#283b30]">
            {s.file_name ? <strong className="font-semibold">{s.file_name}</strong> : "A document"} for{" "}
            <strong className="font-semibold">{s.target_member_name ?? memberName(s.target_member)}</strong>
          </p>
        );
    }
  };

  const reviewLine = (s: ChangeRequest) => {
    switch (s.status) {
      case "APPROVED":
        return `Approved${s.reviewed_by_name ? ` by ${s.reviewed_by_name}` : ""} on ${formatDate(s.reviewed_at)}.`;
      case "REJECTED":
        return `Rejected${s.reviewed_by_name ? ` by ${s.reviewed_by_name}` : ""} on ${formatDate(s.reviewed_at)}.`;
      case "WITHDRAWN":
        return `You withdrew this on ${formatDate(s.withdrawn_at)}.`;
      case "OUTDATED":
        return "This person was changed after you sent it. The Tree Owner sees both versions side by side before deciding.";
      default:
        return "Waiting for the Tree Owner.";
    }
  };

  const actions = (s: ChangeRequest) => {
    if (s.status === "PENDING") {
      if (confirmWithdraw === s.id) {
        return (
          <div className="flex flex-wrap items-center gap-2.5" role="group" aria-label="Confirm withdrawal">
            <span className="text-[13px] text-[#283b30]">Withdraw this suggestion?</span>
            <button type="button" className={actionClass} onClick={() => setConfirmWithdraw(null)} disabled={busyId === s.id}>
              Keep it
            </button>
            <button
              type="button"
              data-autofocus
              className={`${actionClass} border-[#e8d4cb] text-[#8a3f2c] hover:bg-[#fbf3ef]`}
              onClick={() => void withdraw(s)}
              disabled={busyId === s.id}
              aria-busy={busyId === s.id || undefined}
            >
              {busyId === s.id ? "Withdrawing…" : "Withdraw"}
            </button>
          </div>
        );
      }
      return (
        <div className="flex flex-wrap gap-2.5">
          <button type="button" className={actionClass} onClick={() => onEdit(s, tab)}>
            Edit
          </button>
          <button
            type="button"
            className={`${actionClass} text-[#8a3f2c] hover:bg-[#fbf3ef]`}
            onClick={() => setConfirmWithdraw(s.id)}
          >
            Withdraw
          </button>
        </div>
      );
    }
    const member =
      s.status === "APPROVED" && s.change_type !== "ADD_RELATIONSHIP" ? memberById(s.target_member) : undefined;
    if (!member) return null;
    return (
      <div className="flex flex-wrap gap-2.5">
        <button type="button" className={actionClass} onClick={() => onOpenMember(member.id)}>
          Open profile
        </button>
        {s.change_type === "ADD_MEMBER" && (
          <button type="button" className={actionClass} onClick={() => onProposeChanges(member, tab)}>
            Propose changes
          </button>
        )}
      </div>
    );
  };

  const current = TABS.find((candidate) => candidate.value === tab)!;

  return (
    <Dialog
      title="My contributions"
      description="Everything you've suggested for this tree. Only you and the Tree Owner see these."
      onClose={onClose}
      size="lg"
    >
      <div
        role="tablist"
        aria-label="Suggestion status"
        className="flex flex-wrap gap-1 rounded-xl bg-[#f6f4ee] p-1.5 [font-family:'Inter',Helvetica]"
      >
        {TABS.map((option) => {
          const selected = option.value === tab;
          return (
            <button
              key={option.value}
              ref={(node) => {
                tabRefs.current[option.value] = node;
              }}
              type="button"
              role="tab"
              id={`contrib-tab-${option.value}`}
              aria-selected={selected}
              aria-controls="contrib-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(option.value)}
              onKeyDown={onTabKeyDown}
              className={`min-h-11 flex-1 basis-[30%] rounded-lg px-3 text-[13px] sm:basis-auto font-semibold transition-[background-color,color,box-shadow] duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#355b43] ${
                selected ? "bg-white text-[#283b30] shadow-[0_1px_3px_#3444321f]" : "text-[#5f655b] hover:text-[#283b30]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {announce}
      </p>

      <div
        id="contrib-panel"
        role="tabpanel"
        aria-labelledby={`contrib-tab-${tab}`}
        aria-busy={list.kind === "loading" || undefined}
        className="flex flex-col gap-4 [font-family:'Inter',Helvetica]"
      >
        {list.kind === "loading" && (
          <div className="flex flex-col gap-3" aria-hidden="true">
            {[0, 1].map((n) => (
              <div key={n} className="h-[132px] animate-pulse rounded-2xl border border-[#dedcd2] bg-white" />
            ))}
          </div>
        )}
        {list.kind === "error" && (
          <div className="flex flex-col items-start gap-3">
            <p role="alert" className={formErrorClass}>
              We couldn't load your suggestions.
            </p>
            <button type="button" className={secondaryButtonClass} onClick={() => setRetry((n) => n + 1)}>
              Try again
            </button>
          </div>
        )}
        {list.kind === "ready" && list.items.length === 0 && (
          <p className="rounded-xl border border-dashed border-[#dedcd2] p-8 text-center text-[14px] text-[#7b8177]">
            {current.empty}
          </p>
        )}
        {list.kind === "ready" && list.items.length > 0 && (
          <>
            <p className="text-[12px] text-[#7b8177]">
              {list.count} {current.label.toLowerCase()} {list.count === 1 ? "suggestion" : "suggestions"}
            </p>
            <ul className="flex flex-col gap-3" aria-label={`${current.label} suggestions`}>
              {list.items.map((s) => (
                <li key={s.id} className="flex flex-col gap-3 rounded-2xl border border-[#dedcd2] bg-white p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                    <span className="rounded-[100px] bg-[#e8ede3] px-2.5 py-[5px] text-[11px] font-semibold text-[#355b43]">
                      {typeLabels[s.change_type]}
                    </span>
                    <span className={`rounded-[100px] px-2.5 py-[5px] text-[11px] font-semibold ${statusChip[s.status]}`}>
                      {TABS.find((option) => option.value === s.status)?.label ?? s.status}
                    </span>
                    <span className="text-[12px] text-[#7b8177]">
                      Sent {formatDate(s.created_at)} by {s.is_mine === false ? s.submitted_by_name : `you (${s.submitted_by_name})`}
                      {s.edited_at ? ` · edited ${formatDate(s.edited_at)}` : ""}
                    </span>
                  </div>
                  {summary(s)}
                  {s.description && (
                    <p className="rounded-xl bg-[#f6f4ee] px-3.5 py-2.5 text-[13px] leading-[20px] text-[#283b30]">
                      <span className="mr-1.5 text-[11px] font-semibold uppercase tracking-[0.5px] text-[#7b8177]">Notes</span>
                      {s.description}
                    </p>
                  )}
                  <p className="text-[12px] text-[#5f655b]">{reviewLine(s)}</p>
                  {itemError[s.id] && (
                    <p role="alert" className={formErrorClass}>
                      {itemError[s.id]}
                    </p>
                  )}
                  {actions(s)}
                </li>
              ))}
            </ul>
            {list.hasMore && (
              <button
                type="button"
                className={`${secondaryButtonClass} self-center`}
                onClick={() => void loadMore()}
                disabled={list.loadingMore}
                aria-busy={list.loadingMore || undefined}
              >
                {list.loadingMore ? "Loading…" : "Show more"}
              </button>
            )}
          </>
        )}
      </div>
    </Dialog>
  );
};
