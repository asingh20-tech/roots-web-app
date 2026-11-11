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
  onSubmit: (input: RelationshipInput) => Promise<void>;
  onClose: () => void;
};

export const RelationshipFormDialog = ({
  members,
  initialMemberId,
  onSubmit,
  onClose,
}: RelationshipFormDialogProps): JSX.Element => {
  const [member1, setMember1] = useState(initialMemberId ? String(initialMemberId) : "");
  const [member2, setMember2] = useState("");
  const [type, setType] = useState<RelationshipType>("PARENT");
  const [startDate, setStartDate] = useState("");
  const [fieldError, setFieldError] = useState<{ member1?: string; member2?: string }>({});
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
      });
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
      title="Add a relationship"
      description="Connect two people who are already in this tree."
      onClose={onClose}
      busy={submitting}
    >
      <form
        noValidate
        aria-label="Add relationship"
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
            {submitting ? "Saving…" : "Add relationship"}
          </button>
        </div>
      </form>
    </Dialog>
  );
};
