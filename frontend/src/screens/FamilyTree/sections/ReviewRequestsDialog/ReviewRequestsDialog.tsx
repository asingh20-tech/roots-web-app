// Owner-only review queue: GET /suggestions/ (PENDING + OUTDATED), then
// POST .../approve/ or .../reject/. Django applies an approval in one
// transaction (trees/services.py) and re-validates it; nothing here edits
// the tree directly.
import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  dangerButtonClass,
  formErrorClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../../../components/Dialog/Dialog";
import { ApiError, firstErrorMessage } from "../../../../services/api";
import {
  ChangeRequest,
  FamilyMember,
  approveChangeRequest,
  listOpenChangeRequests,
  rejectChangeRequest,
} from "../../../../services/trees";
import { genderOptions } from "../MemberFormDialog/MemberFormDialog";
import { relationshipTypeOptions } from "../RelationshipFormDialog/RelationshipFormDialog";

const typeLabels: Record<ChangeRequest["change_type"], string> = {
  ADD_MEMBER: "Add member",
  UPDATE_MEMBER: "Update member",
  ADD_MEDIA: "Add document",
  ADD_RELATIONSHIP: "Add relationship",
};

const fieldLabels: Record<string, string> = {
  first_name: "First name",
  last_name: "Last name",
  gender: "Gender",
  birth_date: "Birth date",
  death_date: "Death date",
};

const display = (field: string, value: unknown): string => {
  if (value === null || value === undefined || value === "") return "Not provided";
  if (field === "gender") {
    return genderOptions.find((option) => option.value === value)?.label ?? String(value);
  }
  return String(value);
};

type ItemState = {
  busy?: "approve" | "reject";
  error?: string;
  // 409: the member changed since the request was made.
  outdated?: ChangeRequest;
};

type ReviewRequestsDialogProps = {
  treeId: number;
  members: FamilyMember[];
  onClose: () => void;
  // An approval changed the tree: reload members/relationships.
  onTreeChanged: () => Promise<void> | void;
  // Open request count changed (for the toolbar badge).
  onCountChange: (count: number) => void;
};

export const ReviewRequestsDialog = ({
  treeId,
  members,
  onClose,
  onTreeChanged,
  onCountChange,
}: ReviewRequestsDialogProps): JSX.Element => {
  const [requests, setRequests] = useState<ChangeRequest[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [items, setItems] = useState<Record<number, ItemState>>({});
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoadError(false);
    listOpenChangeRequests(treeId, controller.signal)
      .then((list) => {
        setRequests(list);
        onCountChange(list.length);
      })
      .catch((error: unknown) => {
        if ((error as Error).name !== "AbortError") setLoadError(true);
      });
    return () => controller.abort();
  }, [treeId, reloadKey, onCountChange]);

  const memberName = (id: unknown) => {
    const member = members.find((candidate) => candidate.id === Number(id));
    return member ? member.full_name : `Member #${String(id)} (no longer in the tree)`;
  };

  const setItem = (id: number, patch: ItemState | null) =>
    setItems((current) => ({ ...current, [id]: patch ? { ...current[id], ...patch } : {} }));

  const removeRequest = useCallback(
    (id: number) => {
      setRequests((current) => {
        const next = (current ?? []).filter((request) => request.id !== id);
        onCountChange(next.length);
        return next;
      });
    },
    [onCountChange],
  );

  const review = async (
    request: ChangeRequest,
    action: "approve" | "reject",
    confirmOutdated = false,
  ) => {
    if (items[request.id]?.busy) return;
    setItem(request.id, { busy: action, error: undefined });
    try {
      if (action === "approve") {
        await approveChangeRequest(treeId, request.id, confirmOutdated);
        removeRequest(request.id);
        await onTreeChanged();
      } else {
        await rejectChangeRequest(treeId, request.id);
        removeRequest(request.id);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setItem(request.id, {
          busy: undefined,
          outdated: (error.fieldErrors.suggestion as ChangeRequest) ?? request,
          error: error.message,
        });
        return;
      }
      setItem(request.id, {
        busy: undefined,
        error:
          (error instanceof ApiError &&
            (firstErrorMessage(error.fieldErrors) ?? error.message)) ||
          "Something went wrong. Please try again.",
      });
    }
  };

  const proposal = (request: ChangeRequest) => {
    const data = request.proposed_data ?? {};
    switch (request.change_type) {
      case "ADD_MEMBER":
        return (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px]">
            {Object.keys(fieldLabels)
              .filter((field) => field in data || field === "first_name" || field === "last_name")
              .map((field) => (
                <FieldRow key={field} label={fieldLabels[field]} value={display(field, data[field])} />
              ))}
          </dl>
        );
      case "ADD_RELATIONSHIP": {
        const option = relationshipTypeOptions.find(
          (candidate) => candidate.value === data.relationship_type,
        );
        return (
          <p className="text-[13px] text-[#283b30]">
            <strong className="font-semibold">{memberName(data.member1)}</strong>{" "}
            {option?.phrase ?? String(data.relationship_type)}{" "}
            <strong className="font-semibold">{memberName(data.member2)}</strong>
            {data.start_date ? ` (married ${String(data.start_date)})` : ""}.
          </p>
        );
      }
      case "UPDATE_MEMBER":
        // After a 409 the response carries the freshest comparison.
        return (
          <ComparisonTable
            comparison={items[request.id]?.outdated?.comparison ?? request.comparison ?? {}}
          />
        );
      case "ADD_MEDIA":
        return request.file_url ? (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#283b30]">
            <span className="font-semibold">{request.file_name ?? "Proposed document"}</span>
            <a
              href={request.file_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center font-semibold text-[#355b43] underline underline-offset-2"
            >
              Preview<span className="sr-only"> {request.file_name ?? "the proposed document"} (opens in a new tab)</span>
            </a>
          </p>
        ) : null;
    }
  };

  return (
    <Dialog
      title="Review change requests"
      description="Collaborators' requests change the tree only when you approve them."
      onClose={onClose}
      size="lg"
    >
      {loadError && (
        <div className="flex flex-col items-start gap-3">
          <p role="alert" className={formErrorClass}>
            We couldn't load the change requests.
          </p>
          <button type="button" className={secondaryButtonClass} onClick={() => setReloadKey((key) => key + 1)}>
            Try again
          </button>
        </div>
      )}
      {!loadError && requests === null && (
        <p role="status" className="[font-family:'Inter',Helvetica] text-[14px] text-[#7b8177]">
          Loading requests…
        </p>
      )}
      {requests?.length === 0 && (
        <p className="rounded-xl border border-dashed border-[#dedcd2] p-8 text-center [font-family:'Inter',Helvetica] text-[14px] text-[#7b8177]">
          No requests are waiting for review.
        </p>
      )}
      {requests && requests.length > 0 && (
        <ul className="flex flex-col gap-4 [font-family:'Inter',Helvetica]" aria-label="Pending change requests">
          {requests.map((request) => {
            const item = items[request.id] ?? {};
            const outdated = item.outdated ?? (request.status === "OUTDATED" ? request : undefined);
            return (
              <li
                key={request.id}
                aria-label={`${typeLabels[request.change_type]} request from ${request.submitted_by_name}`}
                className="flex flex-col gap-4 rounded-2xl border border-[#dedcd2] bg-white p-5"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <span className="rounded-[100px] bg-[#e8ede3] px-2.5 py-[5px] text-[11px] font-semibold text-[#355b43]">
                    {typeLabels[request.change_type]}
                  </span>
                  <span
                    className={`rounded-[100px] px-2.5 py-[5px] text-[11px] font-semibold ${
                      request.status === "OUTDATED" ? "bg-[#f7ece6] text-[#8a3f2c]" : "bg-[#f0ebdf] text-[#6f6550]"
                    }`}
                  >
                    {request.status === "OUTDATED" ? "Outdated" : "Pending"}
                  </span>
                  <span className="text-[12px] text-[#7b8177]">
                    From {request.submitted_by_name} ·{" "}
                    {new Date(request.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {request.target_member_name && (
                  <p className="text-[13px] text-[#7b8177]">
                    About <span className="font-semibold text-[#283b30]">{request.target_member_name}</span>
                  </p>
                )}
                {outdated && (
                  <p className="rounded-xl border border-[#e8d4cb] bg-[#fbf3ef] p-4 text-[13px] font-semibold leading-[20px] text-[#8a3f2c]">
                    {request.target_member_name ?? "This person"} changed after this request was sent.
                    Compare the saved values with the proposal below. Approving replaces the saved values.
                  </p>
                )}
                {proposal(request)}
                {request.description && (
                  <blockquote className="rounded-xl bg-[#f6f4ee] px-4 py-3 text-[13px] leading-[20px] text-[#283b30]">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.5px] text-[#7b8177]">
                      Notes
                    </span>
                    {request.description}
                  </blockquote>
                )}
                {item.error && (
                  <p role="alert" className={formErrorClass}>
                    {item.error}
                  </p>
                )}
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    className={dangerButtonClass}
                    onClick={() => void review(request, "reject")}
                    disabled={Boolean(item.busy)}
                  >
                    {item.busy === "reject" ? "Rejecting…" : "Reject"}
                  </button>
                  <button
                    type="button"
                    className={primaryButtonClass}
                    onClick={() => void review(request, "approve", Boolean(outdated))}
                    disabled={Boolean(item.busy)}
                  >
                    {item.busy === "approve"
                      ? "Approving…"
                      : outdated
                        ? "Approve anyway"
                        : "Approve"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Dialog>
  );
};

// FR-21: values when the request was sent, saved now, and proposed, side by
// side. A row whose saved value moved since then is flagged.
const ComparisonTable = ({
  comparison,
}: {
  comparison: NonNullable<ChangeRequest["comparison"]>;
}) => (
  <div className="-mx-1 overflow-x-auto px-1">
    <table className="w-full min-w-[420px] border-separate border-spacing-0 text-left text-[13px]">
      <caption className="sr-only">Saved and proposed values</caption>
      <thead>
        <tr className="text-[11px] uppercase tracking-[0.5px] text-[#7b8177]">
          <th scope="col" className="border-b border-[#ece9e0] py-2 pr-3 font-semibold">Field</th>
          <th scope="col" className="border-b border-[#ece9e0] py-2 pr-3 font-semibold">When sent</th>
          <th scope="col" className="border-b border-[#ece9e0] py-2 pr-3 font-semibold">Saved now</th>
          <th scope="col" className="border-b border-[#ece9e0] py-2 font-semibold">Proposed</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(comparison).map(([field, values]) => {
          // `original` is absent for requests made before it was recorded.
          const known = "original" in values;
          const moved = known && (values.original ?? null) !== (values.current ?? null);
          return (
            <tr key={field}>
              <th scope="row" className="border-b border-[#f1efe8] py-2 pr-3 font-normal text-[#7b8177]">
                {fieldLabels[field] ?? field}
              </th>
              <td className="border-b border-[#f1efe8] py-2 pr-3 text-[#283b30]">
                {known ? display(field, values.original) : "Not recorded"}
              </td>
              <td className={`border-b border-[#f1efe8] py-2 pr-3 ${moved ? "font-semibold text-[#8a3f2c]" : "text-[#283b30]"}`}>
                {display(field, values.current)}
                {moved && <span className="sr-only"> (changed since the request was sent)</span>}
              </td>
              <td className="border-b border-[#f1efe8] py-2 font-semibold text-[#355b43]">
                {display(field, values.proposed)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const FieldRow = ({ label, value }: { label: string; value: string }) => (
  <>
    <dt className="text-[#7b8177]">{label}</dt>
    <dd className="text-[#283b30]">{value}</dd>
  </>
);
