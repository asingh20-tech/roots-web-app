// Owner-only: add a member (POST /members/) or edit one (PATCH /members/:id/).
// Fields and limits follow trees/models.py FamilyMember: first/last name
// required (max 50), gender (default UNKNOWN), birth/death dates optional,
// death not before birth.
import { FormEvent, useRef, useState } from "react";
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
import type { FamilyMember, Gender, MemberInput } from "../../../../services/trees";

const NAME_MAX = 50;

export const genderOptions: Array<{ value: Gender; label: string }> = [
  { value: "UNKNOWN", label: "Unknown / prefer not to say" },
  { value: "FEMALE", label: "Female" },
  { value: "MALE", label: "Male" },
  { value: "OTHER", label: "Other" },
];

type Field = "first_name" | "last_name" | "birth_date" | "death_date";
type FieldErrors = Partial<Record<Field, string>>;

type MemberFormDialogProps = {
  // Present when editing.
  member?: FamilyMember;
  onSubmit: (input: MemberInput) => Promise<void>;
  onClose: () => void;
};

export const MemberFormDialog = ({
  member,
  onSubmit,
  onClose,
}: MemberFormDialogProps): JSX.Element => {
  const [values, setValues] = useState({
    first_name: member?.first_name ?? "",
    last_name: member?.last_name ?? "",
    gender: (member?.gender ?? "UNKNOWN") as Gender,
    birth_date: member?.birth_date ?? "",
    death_date: member?.death_date ?? "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  const isEdit = Boolean(member);

  const update = (field: keyof typeof values) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (field in errors) setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!values.first_name.trim()) next.first_name = "Enter a first name.";
    if (!values.last_name.trim()) next.last_name = "Enter a last name.";
    if (values.birth_date && values.death_date && values.death_date < values.birth_date) {
      next.death_date = "Death date cannot be before the birth date.";
    }
    return next;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`)
        ?.focus();
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setFormError("");
    try {
      await onSubmit({
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        gender: values.gender,
        birth_date: values.birth_date || null,
        death_date: values.death_date || null,
      });
    } catch (error) {
      // Django's field errors go next to the matching input.
      if (error instanceof ApiError) {
        const fieldMessages: FieldErrors = {};
        for (const field of ["first_name", "last_name", "birth_date", "death_date"] as Field[]) {
          const message = firstErrorMessage(error.fieldErrors[field]);
          if (message) fieldMessages[field] = message;
        }
        if (Object.keys(fieldMessages).length) setErrors(fieldMessages);
        else setFormError(firstErrorMessage(error.fieldErrors) ?? error.message);
      } else {
        setFormError("We couldn't save this member. Please try again.");
      }
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const textField = (field: "first_name" | "last_name", label: string) => (
    <div className="flex flex-col gap-2">
      <label className={fieldLabelClass}>
      {label}
      <input
        name={field}
        type="text"
        required
        maxLength={NAME_MAX}
        autoComplete="off"
        value={values[field]}
        onChange={(event) => update(field)(event.target.value)}
        aria-invalid={errors[field] ? true : undefined}
        aria-describedby={errors[field] ? `${field}-error` : undefined}
        className={fieldControlClass}
      />
    </label>
      {errors[field] && (
        <span id={`${field}-error`} className={fieldErrorClass}>
          {errors[field]}
        </span>
      )}
    </div>
  );

  const dateField = (field: "birth_date" | "death_date", label: string) => (
    <div className="flex flex-col gap-2">
      <label className={fieldLabelClass}>
      {label}
      <input
        name={field}
        type="date"
        value={values[field]}
        min={field === "death_date" ? values.birth_date || undefined : undefined}
        max={field === "birth_date" ? values.death_date || undefined : undefined}
        onChange={(event) => update(field)(event.target.value)}
        aria-invalid={errors[field] ? true : undefined}
        aria-describedby={errors[field] ? `${field}-error` : undefined}
        className={fieldControlClass}
      />
    </label>
      {errors[field] && (
        <span id={`${field}-error`} className={fieldErrorClass}>
          {errors[field]}
        </span>
      )}
    </div>
  );

  return (
    <Dialog
      title={isEdit ? `Edit ${member?.full_name}` : "Add a family member"}
      description={
        isEdit
          ? "Changes are saved to the tree straight away."
          : "They'll appear on the tree as soon as you save."
      }
      onClose={onClose}
      busy={submitting}
    >
      <form
        ref={formRef}
        noValidate
        aria-label={isEdit ? "Edit family member" : "Add family member"}
        onSubmit={(event) => void handleSubmit(event)}
        className="flex flex-col gap-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {textField("first_name", "First name")}
          {textField("last_name", "Last name")}
        </div>
        <label className={fieldLabelClass}>
          Gender
          <select
            name="gender"
            value={values.gender}
            onChange={(event) => update("gender")(event.target.value)}
            className={fieldControlClass}
          >
            {genderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          {dateField("birth_date", "Birth date (optional)")}
          {dateField("death_date", "Death date (optional)")}
        </div>
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
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Add member"}
          </button>
        </div>
      </form>
    </Dialog>
  );
};
