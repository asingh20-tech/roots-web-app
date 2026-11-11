// ADD_MEDIA (FR-12, FR-18, IR-4, IR-6): a Collaborator proposes a document
// for a member, or edits their pending one (FR-24, proposed). The file is
// stored privately and only reaches the member's profile if the Owner
// approves. Django re-checks type, file signature and the 10 MB limit.
import { FormEvent, useId, useRef, useState } from "react";
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
import { DOCUMENT_ACCEPT, checkUpload } from "../../../../services/trees";

type DocumentSuggestionDialogProps = {
  memberName: string;
  // Editing: the file already proposed (a new one is optional).
  currentFileName?: string | null;
  initialNotes?: string;
  title?: string;
  submitLabel?: string;
  onSubmit: (file: File | null, notes: string) => Promise<void>;
  onClose: () => void;
};

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export const DocumentSuggestionDialog = ({
  memberName,
  currentFileName,
  initialNotes = "",
  title,
  submitLabel = "Send for review",
  onSubmit,
  onClose,
}: DocumentSuggestionDialogProps): JSX.Element => {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState(initialNotes);
  const [errors, setErrors] = useState<{ file?: string; notes?: string }>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileId = useId();
  const fileHintId = useId();
  const editing = currentFileName !== undefined;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    const next: typeof errors = {};
    if (!file && !editing) next.file = "Choose a PDF, JPG or PNG file.";
    if (file) {
      const problem = checkUpload(file, "document");
      if (problem) next.file = problem;
    }
    if (!notes.trim()) next.notes = "Tell the Tree Owner what this document is.";
    setErrors(next);
    if (Object.keys(next).length) {
      if (next.file) inputRef.current?.focus();
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    setFormError("");
    try {
      await onSubmit(file, notes.trim());
    } catch (error) {
      if (error instanceof ApiError) {
        const fileMessage = firstErrorMessage(error.fieldErrors.proposed_file);
        const notesMessage = firstErrorMessage(error.fieldErrors.description);
        if (fileMessage || notesMessage) setErrors({ file: fileMessage ?? undefined, notes: notesMessage ?? undefined });
        else setFormError(firstErrorMessage(error.fieldErrors) ?? error.message);
      } else {
        setFormError("We couldn't upload this. Check your connection and try again.");
      }
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      title={title ?? `Suggest a document for ${memberName}`}
      description="PDF, JPG or PNG up to 10 MB. Only you and the Tree Owner can open it until it is approved."
      onClose={onClose}
      busy={submitting}
      size="sm"
    >
      <form noValidate aria-label={title ?? "Suggest a document"} onSubmit={(event) => void submit(event)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor={fileId} className={fieldLabelClass}>
            {editing ? "Replace the file (optional)" : "Document"}
          </label>
          <input
            ref={inputRef}
            id={fileId}
            name="file"
            type="file"
            accept={DOCUMENT_ACCEPT}
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setErrors((current) => ({ ...current, file: undefined }));
              setFormError("");
            }}
            aria-invalid={errors.file ? true : undefined}
            aria-describedby={`${fileHintId}${errors.file ? " document-file-error" : ""}`}
            className="block w-full rounded-[10px] border border-dashed border-[#cfcabd] bg-white p-3 [font-family:'Inter',Helvetica] text-[13px] text-[#283b30] file:mr-3 file:h-9 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#e8ede3] file:px-3 file:text-[13px] file:font-semibold file:text-[#355b43] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#355b43]"
          />
          <span id={fileHintId} className="[font-family:'Inter',Helvetica] text-[12px] text-[#7b8177]">
            {file
              ? `${file.name} · ${formatSize(file.size)}`
              : editing && currentFileName
                ? `Currently: ${currentFileName}`
                : "Nothing chosen yet."}
          </span>
          {errors.file && (
            <span id="document-file-error" className={fieldErrorClass}>
              {errors.file}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className={fieldLabelClass}>
            Notes for the Tree Owner
            <textarea
              name="notes"
              rows={3}
              value={notes}
              placeholder="For example: birth certificate from the county archive."
              onChange={(event) => {
                setNotes(event.target.value);
                setErrors((current) => ({ ...current, notes: undefined }));
              }}
              aria-invalid={errors.notes ? true : undefined}
              aria-describedby={errors.notes ? "document-notes-error" : undefined}
              className={`${fieldControlClass} h-auto min-h-[96px] resize-y py-3 leading-[21px]`}
            />
          </label>
          {errors.notes && (
            <span id="document-notes-error" className={fieldErrorClass}>
              {errors.notes}
            </span>
          )}
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
            {submitting ? "Uploading…" : submitLabel}
          </button>
        </div>
      </form>
    </Dialog>
  );
};
