// Owner-only: link two saved members (POST /relationships/).
// Direction follows trees/serializers.py RelationshipSerializer: the request
// reads "first member is the <type> of second member". CHILD is stored by
// Django as the reversed PARENT; it rejects self-links, ancestor cycles,
// duplicates and marriage dates on non-spouse links with a 400.
import { FormEvent, useMemo, useRef, useState } from "react";
import {
  Dialog,
  fieldControlClass,
  fieldErrorClass,
  fieldLabelClass,
  formErrorClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../../../components/Dialog/Dialog";
import { ApiError, firstErrorMessage } from "../../../../services/api";
import type {
  FamilyMember,
  RelationshipInput,
  RelationshipType,
} from "../../../../services/trees";

export const relationshipTypeOptions: Array<{
  value: RelationshipType;
  label: string;
  phrase: string;
}> = [
  { value: "PARENT", label: "Parent", phrase: "is the parent of" },
  { value: "CHILD", label: "Child", phrase: "is the child of" },
  { value: "ADOPTIVE_PARENT", label: "Adoptive parent", phrase: "is the adoptive parent of" },
  { value: "SPOUSE", label: "Spouse", phrase: "is the spouse of" },
  { value: "SIBLING", label: "Sibling", phrase: "is the sibling of" },
];

type RelationshipFormDialogProps = {
  members: FamilyMember[];
  // Pre-selects the first member (opened from a person's details).
  initialMemberId?: number;
  // Editing a Collaborator's pending ADD_RELATIONSHIP suggestion (FR-24):
  // prefilled values, its own wording, and a required notes field whose
  // value is passed to onSubmit.
  initial?: Partial<RelationshipInput>;
  notes?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
  onSubmit: (input: RelationshipInput, notes: string) => Promise<void>;
  onClose: () => void;
};

export const RelationshipFormDialog = ({
  members,
  initialMemberId,
  initial,
  notes: initialNotes,
  title = "Add a relationship",
  description = "Connect two people who are already in this tree.",
  submitLabel = "Add relationship",
  onSubmit,
  onClose,
}: RelationshipFormDialogProps): JSX.Element => {
  const [member1, setMember1] = useState(
    initial?.member1 ? String(initial.member1) : initialMemberId ? String(initialMemberId) : "",
  );
  const [member2, setMember2] = useState(initial?.member2 ? String(initial.member2) : "");
  const [type, setType] = useState<RelationshipType>(initial?.relationship_type ?? "PARENT");
  const [startDate, setStartDate] = useState(initial?.start_date ?? "");
  const hasNotes = initialNotes !== undefined;
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [fieldError, setFieldError] = useState<{ member1?: string; member2?: string; notes?: string }>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const nameOf = (id: string) =>
    members.find((member) => String(member.id) === id)?.full_name;
  const phrase = relationshipTypeOptions.find((option) => option.value === type)?.phrase;
  const preview = useMemo(() => {
    const a = nameOf(member1);
    const b = nameOf(member2);
    return a && b ? `${a} ${phrase} ${b}.` : null;
  }, [member1, member2, phrase, members]);

  const tooFewMembers = members.length < 2;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    const errors: typeof fieldError = {};
    if (!member1) errors.member1 = "Choose the first member.";
    if (!member2) errors.member2 = "Choose the second member.";
    else if (member1 === member2) errors.member2 = "Choose two different members.";
    if (hasNotes && !notes.trim()) errors.notes = "Tell the Tree Owner how they are related.";
    setFieldError(errors);
    setFormError("");
    if (Object.keys(errors).length) return;

    submittingRef.current = true;
    setSubmitting(true);
    try {
      await onSubmit({
        member1: Number(member1),
        member2: Number(member2),
        relationship_type: type,
        ...(type === "SPOUSE" && startDate ? { start_date: startDate } : {}),
      }, notes.trim());
    } catch (error) {
      const message =
        (error instanceof ApiError &&
          (firstErrorMessage(error.fieldErrors) ?? error.message)) ||
        "We couldn't save this relationship. Please try again.";
      // Django's unique-constraint text names database columns.
      setFormError(
        /must make a unique set|already exists/i.test(message)
          ? "These two people already have this relationship."
          : message,
      );
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const memberSelect = (
    which: "member1" | "member2",
    label: string,
    value: string,
    setValue: (value: string) => void,
  ) => (
    <div className="flex flex-col gap-2">
      <label className={fieldLabelClass}>
      {label}
      <select
        name={which}
        value={value}
        disabled={tooFewMembers}
        onChange={(event) => {
          setValue(event.target.value);
          setFieldError((current) => ({ ...current, [which]: undefined }));
          setFormError("");
        }}
        aria-invalid={fieldError[which] ? true : undefined}
        aria-describedby={fieldError[which] ? `${which}-error` : undefined}
        className={fieldControlClass}
      >
        <option value="">Select a family member</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.full_name}
          </option>
        ))}
      </select>
    </label>
      {fieldError[which] && (
        <span id={`${which}-error`} className={fieldErrorClass}>
          {fieldError[which]}
        </span>
      )}
    </div>
  );

  return (
    <Dialog
      title={title}
      description={description}
      onClose={onClose}
      busy={submitting}
    >
      <form
        noValidate
        aria-label={title}
        onSubmit={(event) => void handleSubmit(event)}
        className="flex flex-col gap-5"
      >
        {tooFewMembers && (
          <p className="w-full rounded-lg bg-[#f7ece6] p-3 [font-family:'Inter',Helvetica] text-sm text-[#704536]">
            Add at least two family members before connecting them.
          </p>
        )}
        {memberSelect("member1", "First member", member1, setMember1)}
        <label className={fieldLabelClass}>
          Relationship
          <select
            name="relationship_type"
            value={type}
            onChange={(event) => {
              setType(event.target.value as RelationshipType);
              setFormError("");
            }}
            className={fieldControlClass}
          >
            {relationshipTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {memberSelect("member2", "Second member", member2, setMember2)}
        {type === "SPOUSE" && (
          <label className={fieldLabelClass}>
            Marriage date (optional)
            <input
              name="start_date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className={fieldControlClass}
            />
          </label>
        )}
        {hasNotes && (
          <div className="flex flex-col gap-2">
            <label className={fieldLabelClass}>
              Notes for the Tree Owner
              <textarea
                name="notes"
                rows={3}
                value={notes}
                onChange={(event) => {
                  setNotes(event.target.value);
                  setFieldError((current) => ({ ...current, notes: undefined }));
                }}
                aria-invalid={fieldError.notes ? true : undefined}
                aria-describedby={fieldError.notes ? "notes-error" : undefined}
                className={`${fieldControlClass} h-auto min-h-[96px] resize-y py-3`}
              />
            </label>
            {fieldError.notes && (
              <span id="notes-error" className={fieldErrorClass}>
                {fieldError.notes}
              </span>
            )}
          </div>
        )}
        <p
          aria-live="polite"
          className="min-h-[44px] rounded-xl bg-[#e8ede3] px-4 py-3 [font-family:'Inter',Helvetica] text-[13px] text-[#283b30]"
        >
          {preview ?? "Choose two members to preview the relationship."}
        </p>
        {formError && (
          <p role="alert" className={formErrorClass}>
            {formError}
          </p>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className={secondaryButtonClass} onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="submit"
            className={primaryButtonClass}
            disabled={submitting || tooFewMembers}
            aria-busy={submitting || undefined}
          >
            {submitting ? "Saving…" : submitLabel}
          </button>
        </div>
      </form>
    </Dialog>
  );
};
