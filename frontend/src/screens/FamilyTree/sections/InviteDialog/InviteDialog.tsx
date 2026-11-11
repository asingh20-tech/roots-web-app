// Owner-only: create a collaborator invitation link
// (POST /api/trees/:id/invitations/). The link is shown once; Django keeps
// only a hash and expires it after 7 days.
import { useRef, useState } from "react";
import {
  Dialog,
  fieldControlClass,
  formErrorClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../../../components/Dialog/Dialog";
import { ApiError } from "../../../../services/api";
import { Invitation, createInvitation } from "../../../../services/trees";

type InviteDialogProps = {
  treeId: number;
  treeName: string;
  onClose: () => void;
};

export const InviteDialog = ({ treeId, treeName, onClose }: InviteDialogProps): JSX.Element => {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const busyRef = useRef(false);

  const create = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      setInvitation(await createInvitation(treeId));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "We couldn't create a link. Please try again.",
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!invitation?.url) return;
    try {
      await navigator.clipboard.writeText(invitation.url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog
      title="Invite collaborators"
      description={`Anyone who opens the link and signs in can view ${treeName} and send you change requests. They can't edit it directly.`}
      onClose={onClose}
      busy={busy}
      size="sm"
    >
      {error && (
        <p role="alert" className={formErrorClass}>
          {error}
        </p>
      )}
      {invitation?.url ? (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-2 [font-family:'Inter',Helvetica] text-[13px] font-semibold text-[#283b30]">
            Invitation link
            <input
              readOnly
              value={invitation.url}
              onFocus={(event) => event.currentTarget.select()}
              className={fieldControlClass}
            />
          </label>
          <p className="[font-family:'Inter',Helvetica] text-[12px] text-[#7b8177]">
            Expires {new Date(invitation.expires_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}.
            This link is only shown now, so copy it before closing.
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" className={secondaryButtonClass} onClick={onClose}>
              Done
            </button>
            <button type="button" className={primaryButtonClass} onClick={() => void copy()}>
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
          <p role="status" className="sr-only">
            {copied ? "Invitation link copied" : ""}
          </p>
        </div>
      ) : (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className={secondaryButtonClass} onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className={primaryButtonClass} onClick={() => void create()} disabled={busy}>
            {busy ? "Creating…" : "Create invitation link"}
          </button>
        </div>
      )}
    </Dialog>
  );
};
