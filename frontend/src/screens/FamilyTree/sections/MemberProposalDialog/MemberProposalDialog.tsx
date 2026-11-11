// Collaborator member forms that create or edit a SuggestRequest, never the
// member itself (DB-4):
//   mode "add":    edit a pending ADD_MEMBER suggestion (FR-24, proposed).
//   mode "update": propose changes to a saved member (UPDATE_MEMBER, FR-12),
//                  or edit a pending one. Only changed fields are sent, with
//                  the member version the form was filled from (FR-21).
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
import type { FamilyMember, Gender } from "../../../../services/trees";
import { genderOptions } from "../MemberFormDialog/MemberFormDialog";

export type MemberValues = {
  first_name: string;
  last_name: string;
  gender: Gender;
  birth_date: string;
  death_date: string;
};

const FIELDS: Array<keyof MemberValues> = ["first_name", "last_name", "gender", "birth_date", "death_date"];
const NAME_MAX = 50;

const fromMember = (member?: FamilyMember): MemberValues => ({
  first_name: member?.first_name ?? "",
  last_name: member?.last_name ?? "",
  gender: member?.gender ?? "UNKNOWN",
  birth_date: member?.birth_date ?? "",
  death_date: member?.death_date ?? "",
});

const shown = (field: keyof MemberValues, value: string) => {
  if (!value) return "not recorded";
  if (field === "gender") return genderOptions.find((option) => option.value === value)?.label ?? value;
  return value;
};

type MemberProposalDialogProps = {
  mode: "add" | "update";
  // update: the saved member (baseline for "what changed").
  member?: FamilyMember;
  // Values already proposed (editing a pending suggestion).
  initialValues?: Partial<Record<keyof MemberValues, unknown>>;
  initialNotes?: string;
  title: string;
  description: string;
  submitLabel: string;
  // update: `changes` holds only the changed fields (empty date = null).
  onSubmit: (changes: Record<string, string | null>, notes: string) => Promise<void>;
  onClose: () => void;
};

type Errors = Partial<Record<keyof MemberValues | "notes", string>>;

export const MemberProposalDialog = ({
  mode,
  member,
  initialValues,
  initialNotes = "",
  title,
  description,
  submitLabel,
  onSubmit,
  onClose,
}: MemberProposalDialogProps): JSX.Element => {
  const baseline = useMemo(() => fromMember(member), [member]);
  const [values, setValues] = useState<MemberValues>(() => {
    const start = { ...baseline };
    for (const field of FIELDS) {
      const value = initialValues?.[field];
      if (value !== undefined) start[field] = (value ?? "") as never;
    }
    return start;
  });
  const [notes, setNotes] = useState(initialNotes);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  const changed = FIELDS.filter((field) => values[field] !== baseline[field]);

  const update = (field: keyof MemberValues | "notes", value: string) => {
    if (field === "notes") setNotes(value);
    else setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (!values.first_name.trim()) next.first_name = "Enter a first name.";
    if (!values.last_name.trim()) next.last_name = "Enter a last name.";
    if (values.birth_date && values.death_date && values.death_date < values.birth_date) {
      next.death_date = "Death date cannot be before the birth date.";
    }
    if (!notes.trim()) next.notes = "Add a note for the Tree Owner.";
    return next;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    const found = validate();
    if (mode === "update" && changed.length === 0) {
      setFormError("Change at least one detail before sending.");
      return;
    }
    setErrors(found);
    if (Object.keys(found).length) {
      formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`)?.focus();
      return;
    }
    const clean = (field: keyof MemberValues) => {
      const value = field.endsWith("_name") ? values[field].trim() : values[field];
      return field.endsWith("_date") ? value || null : value;
    };
    const payload: Record<string, string | null> = {};
    for (const field of mode === "update" ? changed : FIELDS) {
      const value = clean(field);
      // ADD_MEMBER: leave out empty optional dates rather than send null.
      if (mode === "add" && value === null) continue;
      payload[field] = value;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setFormError("");
    try {
      await onSubmit(payload, notes.trim());
    } catch (error) {
      if (error instanceof ApiError) {
        // Field problems arrive as {"proposed_data": {"birth_date": [...]}}.
        const nested = (error.fieldErrors.proposed_data ?? {}) as Record<string, unknown>;
        const next: Errors = {};
        if (nested && typeof nested === "object" && !Array.isArray(nested)) {
          for (const field of FIELDS) {
            const message = firstErrorMessage(nested[field]);
            if (message) next[field] = message;
          }
        }
        const notesMessage = firstErrorMessage(error.fieldErrors.description);
        if (notesMessage) next.notes = notesMessage;
        if (Object.keys(next).length) setErrors(next);
        else if (error.status === 409) {
          setFormError(`${error.message} Close this form to see its current status.`);
        } else {
          setFormError(firstErrorMessage(error.fieldErrors) ?? error.message);
        }
      } else {
        setFormError("We couldn't send this. Your changes are still here, so try again.");
      }
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const savedHint = (field: keyof MemberValues) =>
    mode === "update" && values[field] !== baseline[field] ? (
      <span className="[font-family:'Inter',Helvetica] text-[12px] font-normal text-[#7b8177]">
        Saved now: {shown(field, baseline[field])}
      </span>
    ) : null;

  const errorFor = (field: keyof Errors) =>
    errors[field] ? (
      <span id={`proposal-${field}-error`} className={fieldErrorClass}>
        {errors[field]}
      </span>
    ) : null;

  const controlProps = (field: keyof Errors) => ({
    name: field,
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `proposal-${field}-error` : undefined,
  });

  return (
    <Dialog title={title} description={description} onClose={onClose} busy={submitting}>
      <form ref={formRef} noValidate aria-label={title} onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {(["first_name", "last_name"] as const).map((field) => (
            <div key={field} className="flex flex-col gap-2">
              <label className={fieldLabelClass}>
                {field === "first_name" ? "First name" : "Last name"}
                <input
                  {...controlProps(field)}
                  type="text"
                  required
                  maxLength={NAME_MAX}
                  autoComplete="off"
                  value={values[field]}
                  onChange={(event) => update(field, event.target.value)}
                  className={fieldControlClass}
                />
              </label>
              {savedHint(field)}
              {errorFor(field)}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <label className={fieldLabelClass}>
            Gender
            <select
              {...controlProps("gender")}
              value={values.gender}
              onChange={(event) => update("gender", event.target.value)}
              className={fieldControlClass}
            >
              {genderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {savedHint("gender")}
          {errorFor("gender")}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(["birth_date", "death_date"] as const).map((field) => (
            <div key={field} className="flex flex-col gap-2">
              <label className={fieldLabelClass}>
                {field === "birth_date" ? "Birth date (optional)" : "Death date (optional)"}
                <input
                  {...controlProps(field)}
                  type="date"
                  value={values[field]}
                  min={field === "death_date" ? values.birth_date || undefined : undefined}
                  max={field === "birth_date" ? values.death_date || undefined : undefined}
                  onChange={(event) => update(field, event.target.value)}
                  className={fieldControlClass}
                />
              </label>
              {savedHint(field)}
              {errorFor(field)}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <label className={fieldLabelClass}>
            Notes for the Tree Owner
            <textarea
              {...controlProps("notes")}
              rows={3}
              value={notes}
              placeholder={mode === "update" ? "Why should this change? Mention your source." : "What do you know about this person?"}
              onChange={(event) => update("notes", event.target.value)}
              className={`${fieldControlClass} h-auto min-h-[96px] resize-y py-3 leading-[21px]`}
            />
          </label>
          {errorFor("notes")}
        </div>
        <p className="rounded-xl bg-[#e8ede3] px-4 py-3 [font-family:'Inter',Helvetica] text-[13px] leading-[20px] text-[#283b30]">
          {mode === "update"
            ? changed.length
              ? `${changed.length} ${changed.length === 1 ? "detail" : "details"} changed. Nothing in the tree changes until the Tree Owner approves.`
              : "Edit the details you want to correct. Nothing in the tree changes until the Tree Owner approves."
            : "This person stays a suggestion until the Tree Owner approves it."}
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
          <button type="submit" className={primaryButtonClass} disabled={submitting} aria-busy={submitting || undefined}>
            {submitting ? "Sending…" : submitLabel}
          </button>
        </div>
      </form>
    </Dialog>
  );
};
