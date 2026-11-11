// Owner-only invitation links (FR-10, FR-11, FR-19, SA-2).
// Create: POST /api/trees/:id/invitations/. The full link is shown once;
// Django keeps only a hash and expires it after 7 days. One link can be used
// by several people until it expires or is revoked.
// Manage: GET the list (status, expiry, how many joined) and DELETE to revoke.
// Revoking stops new joins; people who already joined keep access.
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  fieldControlClass,
  formErrorClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../../../components/Dialog/Dialog";
import { ApiError, firstErrorMessage } from "../../../../services/api";
import {
  Invitation,
  createInvitation,
  listInvitations,
  revokeInvitation,
} from "../../../../services/trees";

type InviteDialogProps = {
  treeId: number;
  treeName: string;
  onClose: () => void;
};

type LinkStatus = "active" | "expired" | "revoked";

export const invitationStatus = (invitation: Invitation, now = Date.now()): LinkStatus => {
  if (!invitation.is_active || invitation.revoked_at) return "revoked";
  if (new Date(invitation.expires_at).getTime() <= now || !invitation.is_valid) return "expired";
  return "active";
};

const statusStyle: Record<LinkStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-[#e8ede3] text-[#355b43]" },
  expired: { label: "Expired", className: "bg-[#f0ebdf] text-[#6f6550]" },
  revoked: { label: "Revoked", className: "bg-[#f7ece6] text-[#8a3f2c]" },
};

const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";

const smallButton =
  "roots-press inline-flex min-h-11 items-center rounded-lg border border-[#dedcd2] bg-white px-3.5 [font-family:'Inter',Helvetica] text-[13px] font-semibold text-[#283b30] hover:bg-[#f6f4ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#355b43] disabled:opacity-50";

export const InviteDialog = ({ treeId, treeName, onClose }: InviteDialogProps): JSX.Element => {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const busyRef = useRef(false);

  const [links, setLinks] = useState<Invitation[] | null>(null);
  const [linksError, setLinksError] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState<number | null>(null);
  const [revoking, setRevoking] = useState<number | null>(null);
  const [revokeError, setRevokeError] = useState("");
  const [announce, setAnnounce] = useState("");

  const loadLinks = useCallback(
    (signal?: AbortSignal) => {
      setLinksError(false);
      listInvitations(treeId, signal)
        .then(setLinks)
        .catch((err: unknown) => {
          if ((err as Error).name !== "AbortError") setLinksError(true);
        });
    },
    [treeId],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadLinks(controller.signal);
    return () => controller.abort();
  }, [loadLinks]);

  const create = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      const created = await createInvitation(treeId);
      setInvitation(created);
      setCopied(false);
      setLinks((current) => [created, ...(current ?? [])]);
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

  const revoke = async (link: Invitation) => {
    if (revoking !== null) return;
    setRevoking(link.id);
    setRevokeError("");
    try {
      await revokeInvitation(treeId, link.id);
      const now = new Date().toISOString();
      setLinks((current) =>
        (current ?? []).map((item) =>
          item.id === link.id ? { ...item, is_active: false, is_valid: false, revoked_at: now } : item,
        ),
      );
      if (invitation?.id === link.id) setInvitation(null);
      setConfirmRevoke(null);
      setAnnounce("Link revoked. Nobody new can join with it.");
    } catch (err) {
      setRevokeError(
        err instanceof ApiError
          ? firstErrorMessage(err.fieldErrors) ?? err.message
          : "We couldn't revoke the link. Please try again.",
      );
    } finally {
      setRevoking(null);
    }
  };

  const activeCount = (links ?? []).filter((link) => invitationStatus(link) === "active").length;

  return (
    <Dialog
      title="Invite collaborators"
      description={`Anyone who opens a link and signs in can view ${treeName} and send you change requests. They can't edit it directly.`}
      onClose={onClose}
      busy={busy}
      size="md"
    >
      {error && (
        <p role="alert" className={formErrorClass}>
          {error}
        </p>
      )}
      {invitation?.url ? (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-2 [font-family:'Inter',Helvetica] text-[13px] font-semibold text-[#283b30]">
            New invitation link
            <input
              readOnly
              value={invitation.url}
              onFocus={(event) => event.currentTarget.select()}
              className={fieldControlClass}
            />
          </label>
          <p className="[font-family:'Inter',Helvetica] text-[12px] text-[#7b8177]">
            Expires {new Date(invitation.expires_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}.
            This link is only shown now, so copy it before closing. Several people can use it.
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

      <section aria-labelledby="invite-links-heading" className="flex flex-col gap-3 border-t border-[#ece9e0] pt-5 [font-family:'Inter',Helvetica]">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 id="invite-links-heading" className="text-[15px] font-semibold text-[#283b30]">
            Links you've created
          </h3>
          {links && (
            <span className="text-[12px] text-[#7b8177]">
              {activeCount} active · links expire 7 days after they're made
            </span>
          )}
        </div>
        <p role="status" aria-live="polite" className="sr-only">
          {announce}
        </p>
        {revokeError && (
          <p role="alert" className={formErrorClass}>
            {revokeError}
          </p>
        )}
        {linksError && (
          <div className="flex flex-wrap items-center gap-3">
            <p role="alert" className="text-[13px] text-[#8a3f2c]">
              We couldn't load your links.
            </p>
            <button type="button" className={smallButton} onClick={() => loadLinks()}>
              Try again
            </button>
          </div>
        )}
        {!links && !linksError && <p className="text-[13px] text-[#7b8177]">Loading links…</p>}
        {links?.length === 0 && (
          <p className="rounded-xl border border-dashed border-[#dedcd2] p-5 text-center text-[13px] text-[#7b8177]">
            No links yet.
          </p>
        )}
        {links && links.length > 0 && (
          <ul className="flex flex-col gap-2.5" aria-label="Invitation links">
            {links.map((link) => {
              const linkStatus = invitationStatus(link);
              const style = statusStyle[linkStatus];
              const joined = link.collaborator_count ?? 0;
              return (
                <li
                  key={link.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dedcd2] bg-white px-4 py-3"
                >
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-[100px] px-2.5 py-[3px] text-[11px] font-semibold ${style.className}`}>
                        {style.label}
                      </span>
                      <span className="text-[13px] font-semibold text-[#283b30]">
                        Created {formatDate(link.created_at)}
                      </span>
                    </div>
                    <span className="text-[12px] text-[#7b8177]">
                      {linkStatus === "revoked"
                        ? `Revoked ${formatDate(link.revoked_at)}`
                        : linkStatus === "expired"
                          ? `Expired ${formatDate(link.expires_at)}`
                          : `Expires ${formatDate(link.expires_at)}`}
                      {" · "}
                      {joined} {joined === 1 ? "person" : "people"} joined
                    </span>
                  </div>
                  {linkStatus === "active" &&
                    (confirmRevoke === link.id ? (
                      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Confirm revoking this link">
                        <button type="button" className={smallButton} onClick={() => setConfirmRevoke(null)} disabled={revoking !== null}>
                          Keep
                        </button>
                        <button
                          type="button"
                          className={`${smallButton} border-[#e8d4cb] text-[#8a3f2c] hover:bg-[#fbf3ef]`}
                          onClick={() => void revoke(link)}
                          disabled={revoking !== null}
                          aria-busy={revoking === link.id || undefined}
                        >
                          {revoking === link.id ? "Revoking…" : "Revoke link"}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={`${smallButton} text-[#8a3f2c]`}
                        onClick={() => setConfirmRevoke(link.id)}
                        aria-label={`Revoke the link created ${formatDate(link.created_at)}`}
                      >
                        Revoke
                      </button>
                    ))}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </Dialog>
  );
};
