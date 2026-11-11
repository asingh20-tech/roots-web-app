import { ReactNode, useRef, useState } from "react";
import { ApiError, firstErrorMessage } from "../../services/api";
import {
  Dialog,
  dangerButtonClass,
  formErrorClass,
  secondaryButtonClass,
} from "./Dialog";

type ConfirmDialogProps = {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  busyLabel?: string;
  // Rejecting keeps the dialog open and shows the server's message.
  onConfirm: () => Promise<void>;
  onClose: () => void;
};

// Confirmation for destructive actions. Cancel gets focus first so Enter
// never deletes by accident.
export const ConfirmDialog = ({
  title,
  message,
  confirmLabel,
  busyLabel = "Working…",
  onConfirm,
  onClose,
}: ConfirmDialogProps): JSX.Element => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const busyRef = useRef(false);

  const confirm = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await onConfirm();
    } catch (err) {
      setError(
        (err instanceof ApiError &&
          (firstErrorMessage(err.fieldErrors) ?? err.message)) ||
          "Something went wrong. Please try again.",
      );
      busyRef.current = false;
      setBusy(false);
    }
  };

  return (
    <Dialog title={title} onClose={onClose} busy={busy} size="sm" role="alertdialog" description={message}>
      {error && (
        <p role="alert" className={formErrorClass}>
          {error}
        </p>
      )}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          data-autofocus
          className={secondaryButtonClass}
          onClick={onClose}
          disabled={busy}
        >
          Cancel
        </button>
        <button
          type="button"
          className={dangerButtonClass}
          onClick={() => void confirm()}
          disabled={busy}
          aria-busy={busy || undefined}
        >
          {busy ? busyLabel : confirmLabel}
        </button>
      </div>
    </Dialog>
  );
};
