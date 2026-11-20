// Owner-only invitation links (FR-10, FR-11, FR-19, SA-2 as revised in
// docs/invite-qr.md).
// Create: POST /api/trees/:id/invitations/ (returns the URL). Links expire
// after 7 days; one link can be used by several people until it expires or is
// revoked. Revoking stops new joins; people who already joined keep access.
// Manage: GET the list (no URLs) and pick a link. When the server kept an
// encrypted copy (link_available), its URL is fetched on demand from the
// Owner-only /link/ endpoint. Legacy links can't be reconstructed and say so.
// URLs and QR images live only in memory, keyed by invitation ID, and are
// dropped as soon as a link is revoked or expires.
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
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
  getInvitationLink,
  listInvitations,
  revokeInvitation,
} from "../../../../services/trees";

import { InviteQrPreview } from "./InviteQrPreview";
import { invitationQrPng, invitationVisualPng, downloadQr } from "./inviteQr";

type InviteDialogProps = {
  treeId: number;
  treeName: string;
  onClose: () => void;
};

type LinkStatus = "active" | "expired" | "revoked";
type LinkFetch = "loading" | "unavailable" | "error";
type Notice = { tone: "success" | "error"; text: string } | null;

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
const formatDateTime = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleString(undefined, {
        year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      })
    : "";
const joinedText = (count = 0) => `${count} ${count === 1 ? "person" : "people"} joined`;

const newestFirst = (a: Invitation, b: Invitation) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime() || b.id - a.id;

export const LEGACY_MESSAGE =
  "Original link unavailable. This invitation is still active, but its URL was not retained.";

const smallButton =
  "roots-press inline-flex min-h-11 items-center justify-center rounded-lg border border-[#dedcd2] bg-white px-3.5 [font-family:'Inter',Helvetica] text-[13px] font-semibold text-[#283b30] hover:bg-[#f6f4ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#355b43] disabled:cursor-not-allowed disabled:opacity-50";
const dangerSmallButton = `${smallButton} text-[#8a3f2c] hover:bg-[#fbf3ef]`;

class LinkUnavailable extends Error {}

export const InviteDialog = ({ treeId, treeName, onClose }: InviteDialogProps): JSX.Element => {
  const [links, setLinks] = useState<Invitation[] | null>(null);
  const [linksError, setLinksError] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [createError, setCreateError] = useState("");
  const [confirmRevoke, setConfirmRevoke] = useState<{ id: number; from: "row" | "panel" } | null>(null);
  const [revoking, setRevoking] = useState<number | null>(null);
  const [revokeError, setRevokeError] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [manualCopyId, setManualCopyId] = useState<number | null>(null);
  const [fetchState, setFetchState] = useState<Record<number, LinkFetch>>({});
  const [focusKey, setFocusKey] = useState<string | null>(null);
  // URL cache: a ref for synchronous reads in click handlers, plus a render tick.
  const urls = useRef(new Map<number, string>());
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const pending = useRef(new Map<number, Promise<string>>());
  const artworks = useRef(new Map<number, string>());
  const pngs = useRef(new Map<number, Promise<Blob>>());
  const busyRef = useRef(false);
  const mounted = useRef(true);
  const linksRef = useRef<Invitation[]>([]);
  linksRef.current = links ?? [];
  const rootRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    mounted.current = true;
    const cache = { urls: urls.current, pending: pending.current, pngs: pngs.current, artworks: artworks.current };
    return () => {
      mounted.current = false;
      Object.values(cache).forEach(map => map.clear());
    };
  }, []);

  const isActiveId = (id: number) =>
    linksRef.current.some(item => item.id === id && invitationStatus(item) === "active");

  const forget = useCallback((id: number) => {
    urls.current.delete(id); pending.current.delete(id);
    pngs.current.delete(id); artworks.current.delete(id);
  }, []);

  // Re-render exactly when the next active link expires, then drop its secrets.
  useEffect(() => {
    const next = (links ?? [])
      .filter(link => invitationStatus(link, now) === "active")
      .map(link => new Date(link.expires_at).getTime())
      .reduce((min, time) => Math.min(min, time), Infinity);
    if (!Number.isFinite(next)) return;
    const timer = setTimeout(() => setNow(Date.now()), Math.min(Math.max(next - Date.now(), 0) + 50, 2 ** 31 - 1));
    return () => clearTimeout(timer);
  }, [links, now]);
  useEffect(() => {
    let changed = false;
    for (const link of links ?? []) {
      if (invitationStatus(link, now) !== "active" && urls.current.has(link.id)) { forget(link.id); changed = true; }
    }
    if (changed) rerender();
  }, [links, now, forget]);

  // Copy/selection messages fade out of relevance; "Link copied" resets.
  useEffect(() => {
    if (copiedId === null) return;
    const timer = setTimeout(() => setCopiedId(null), 2000);
    return () => clearTimeout(timer);
  }, [copiedId]);

  useEffect(() => {
    if (!focusKey) return;
    rootRef.current?.querySelector<HTMLElement>(`[data-focus-key="${focusKey}"]`)?.focus();
    setFocusKey(null);
  }, [focusKey]);

  const loadLinks = useCallback(
    (signal?: AbortSignal) => {
      setLinksError(false);
      listInvitations(treeId, signal)
        .then(incoming => setLinks(current => {
          const ids = new Set(incoming.map(link => link.id));
          // Keep a just-created link if the list response raced the create.
          const local = (current ?? []).filter(link => !ids.has(link.id));
          return [...local, ...incoming.map(({ url: _url, ...link }) => link)].sort(newestFirst);
        }))
        .catch((err: unknown) => {
          if ((err as Error).name !== "AbortError" && mounted.current) setLinksError(true);
        });
    },
    [treeId],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadLinks(controller.signal);
    return () => controller.abort();
  }, [loadLinks]);

  const markUnavailable = (id: number) => {
    setLinks(current => current?.map(link => link.id === id ? { ...link, link_available: false } : link) ?? null);
    setFetchState(current => ({ ...current, [id]: "unavailable" }));
  };

  // One in-flight request per invitation; the result is stored under that
  // invitation's ID, so a late response can never fill another selection.
  const ensureUrl = (id: number): Promise<string> => {
    const cached = urls.current.get(id);
    if (cached) return Promise.resolve(cached);
    const inflight = pending.current.get(id);
    if (inflight) return inflight;
    setFetchState(current => ({ ...current, [id]: "loading" }));
    const request = getInvitationLink(treeId, id)
      .then(({ url }) => {
        if (!mounted.current || !isActiveId(id)) throw new LinkUnavailable();
        urls.current.set(id, url);
        setFetchState(current => { const next = { ...current }; delete next[id]; return next; });
        return url;
      })
      .catch((err: unknown) => {
        if (!mounted.current) throw err;
        if (err instanceof LinkUnavailable || (err instanceof ApiError && err.status === 404)) {
          markUnavailable(id);
          throw new LinkUnavailable();
        }
        setFetchState(current => ({ ...current, [id]: "error" }));
        throw err;
      })
      .finally(() => { if (pending.current.get(id) === request) pending.current.delete(id); });
    pending.current.set(id, request);
    return request;
  };

  const selectedLink = links?.find(link => link.id === selectedId) ?? null;
  const selectedStatus = selectedLink ? invitationStatus(selectedLink, now) : null;
  const selectedUrl = selectedLink && selectedStatus === "active" ? urls.current.get(selectedLink.id) : undefined;

  // Fetch the selected link's URL when the server can recover it.
  useEffect(() => {
    if (!selectedLink || selectedStatus !== "active" || !selectedLink.link_available) return;
    if (urls.current.has(selectedLink.id) || fetchState[selectedLink.id]) return;
    ensureUrl(selectedLink.id).then(rerender, () => undefined);
    // Only the selection matters; ensureUrl dedupes and caches by ID.
  }, [selectedLink?.id, selectedLink?.link_available, selectedStatus]);

  // Clipboard failed: put the URL in front of the owner, selected, to copy by hand.
  useEffect(() => {
    if (manualCopyId !== null && manualCopyId === selectedId && selectedUrl && urlInputRef.current) {
      urlInputRef.current.focus();
      urlInputRef.current.select();
    }
  }, [manualCopyId, selectedId, selectedUrl]);

  const select = (id: number, reveal = false) => {
    setSelectedId(id);
    setNotice(null);
    if (manualCopyId !== id) setManualCopyId(null);
    if (confirmRevoke?.from === "panel" && confirmRevoke.id !== id) setConfirmRevoke(null);
    if (reveal && window.matchMedia?.("(max-width: 1023px)").matches) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      requestAnimationFrame(() => detailRef.current?.scrollIntoView?.({ block: "start", behavior: reduce ? "auto" : "smooth" }));
    }
  };

  const create = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setCreateError("");
    setNotice(null);
    try {
      const { url, ...created } = await createInvitation(treeId);
      if (!mounted.current) return;
      if (url) urls.current.set(created.id, url);
      setLinks(current => [created, ...(current ?? []).filter(link => link.id !== created.id)].sort(newestFirst));
      setSelectedId(created.id);
      setManualCopyId(null);
      setNotice({ tone: "success", text: "Invitation link created. It expires in 7 days." });
    } catch (err) {
      if (mounted.current) setCreateError(err instanceof ApiError ? err.message : "We couldn't create a link. Please try again.");
    } finally {
      busyRef.current = false;
      if (mounted.current) setBusy(false);
    }
  };

  const copyLink = async (id: number) => {
    if (!isActiveId(id)) return;
    setNotice(null);
    setCopiedId(null);
    let fetchError: unknown = null;
    try {
      const clipboard = navigator.clipboard;
      if (!clipboard?.writeText && !clipboard?.write) throw new Error("clipboard unavailable");
      const cached = urls.current.get(id);
      if (cached && clipboard.writeText) {
        await clipboard.writeText(cached);
      } else if (clipboard.write && typeof ClipboardItem !== "undefined") {
        // Start the write inside the click so Safari keeps the user gesture.
        const url = ensureUrl(id);
        url.catch(err => { fetchError = err; });
        await clipboard.write([new ClipboardItem({
          "text/plain": url.then(value => new Blob([value], { type: "text/plain" })),
        })]);
        await url;
      } else {
        const url = await ensureUrl(id).catch(err => { fetchError = err; throw err; });
        await clipboard.writeText(url);
      }
      if (!mounted.current || !isActiveId(id)) return;
      setCopiedId(id);
      setManualCopyId(null);
      setNotice({ tone: "success", text: "Link copied" });
      rerender();
    } catch {
      if (!mounted.current) return;
      if (fetchError) {
        setNotice({
          tone: "error",
          text: fetchError instanceof LinkUnavailable ? LEGACY_MESSAGE : "We couldn't load this link. Please try again.",
        });
        return;
      }
      if (!isActiveId(id)) return;
      select(id, true);
      setManualCopyId(id);
      setNotice({
        tone: "error",
        text: "Couldn't access the clipboard. The link is selected in the field below — copy it with Ctrl+C or ⌘C.",
      });
      // Fetch for the manual field if the clipboard path never got the URL.
      ensureUrl(id).then(rerender, () => undefined);
    }
  };

  const shareQr = async (id: number, download = false) => {
    const url = urls.current.get(id);
    if (!url || !isActiveId(id)) return;
    setNotice(null);
    const valid = () => mounted.current && isActiveId(id) && urls.current.get(id) === url;
    try {
      if (!download && (!navigator.clipboard?.write || typeof ClipboardItem === "undefined")) throw new Error();
      let png = pngs.current.get(id);
      if (!png) {
        const artwork = artworks.current.get(id);
        png = artwork ? invitationVisualPng(url, artwork) : invitationQrPng(url);
        pngs.current.set(id, png);
      }
      if (download) {
        const blob = await png;
        if (valid()) { downloadQr(blob, id); setNotice({ tone: "success", text: "QR code downloaded." }); }
      } else {
        // Start the write in the user gesture, including Safari's promise-valued item.
        await navigator.clipboard.write([new ClipboardItem({ "image/png": png.then(blob => {
          if (!valid()) throw new Error();
          return blob;
        }) })]);
        if (valid()) setNotice({ tone: "success", text: "QR code copied." });
      }
    } catch {
      pngs.current.delete(id);
      if (valid()) setNotice({
        tone: "error",
        text: download ? "Couldn't generate this QR. Please copy the link instead." : "Image copying is unavailable here. Use Download QR instead.",
      });
    }
  };

  const revoke = async (link: Invitation) => {
    if (revoking !== null) return;
    setRevoking(link.id);
    setRevokeError("");
    try {
      await revokeInvitation(treeId, link.id);
      if (!mounted.current) return;
      forget(link.id);
      const revokedAt = new Date().toISOString();
      setLinks(current => (current ?? []).map(item =>
        item.id === link.id ? { ...item, is_active: false, is_valid: false, link_available: false, revoked_at: revokedAt } : item));
      setConfirmRevoke(null);
      if (manualCopyId === link.id) setManualCopyId(null);
      setNotice({ tone: "success", text: "Link revoked. Nobody new can join with it; people who joined keep access." });
      setFocusKey(`select-${link.id}`);
      loadLinks();
    } catch (err) {
      if (!mounted.current) return;
      setRevokeError(err instanceof ApiError
        ? firstErrorMessage(err.fieldErrors) ?? err.message
        : "We couldn't revoke the link. Please try again.");
    } finally {
      if (mounted.current) setRevoking(null);
    }
  };

  const { active, history } = useMemo(() => {
    const sorted = [...(links ?? [])].sort(newestFirst);
    return {
      active: sorted.filter(link => invitationStatus(link, now) === "active"),
      history: sorted.filter(link => invitationStatus(link, now) !== "active"),
    };
  }, [links, now]);

  const revokeControls = (link: Invitation, from: "row" | "panel") =>
    confirmRevoke?.id === link.id && confirmRevoke.from === from ? (
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Confirm revoking this link">
        <span className="basis-full text-[12px] text-[#7b8177]">Nobody new will be able to join with this link.</span>
        <button
          type="button"
          className={smallButton}
          data-focus-key={`keep-${from}-${link.id}`}
          onClick={() => { setConfirmRevoke(null); setFocusKey(`revoke-${from}-${link.id}`); }}
          disabled={revoking !== null}
        >
          Keep link
        </button>
        <button
          type="button"
          className={`${dangerSmallButton} border-[#e8d4cb]`}
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
        className={dangerSmallButton}
        data-focus-key={`revoke-${from}-${link.id}`}
        onClick={() => { setRevokeError(""); setConfirmRevoke({ id: link.id, from }); setFocusKey(`keep-${from}-${link.id}`); }}
        aria-label={`Revoke the link created ${formatDateTime(link.created_at)}`}
      >
        Revoke
      </button>
    );

  const renderCard = (link: Invitation) => {
    const status = invitationStatus(link, now);
    const style = statusStyle[status];
    const selected = link.id === selectedId;
    const hasUrl = status === "active" && urls.current.has(link.id);
    const shareable = status === "active" && (hasUrl || !!link.link_available);
    const legacy = status === "active" && !shareable;
    return (
      <li key={link.id} className="roots-swap">
        <div
          className={`flex flex-col gap-2 rounded-xl border bg-white transition-[border-color,background-color,box-shadow] duration-150 ease-out ${
            selected ? "border-[#355b43] bg-[#f6f9f3] shadow-[0_0_0_3px_rgba(53,91,67,0.12)]" : "border-[#dedcd2]"
          } ${status === "active" ? "" : "bg-[#fcfbf8]"}`}
        >
          <button
            type="button"
            aria-pressed={selected}
            data-focus-key={`select-${link.id}`}
            onClick={() => select(link.id, true)}
            className="flex min-w-0 flex-col gap-1 rounded-xl px-4 pb-1 pt-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#355b43]"
          >
            <span className="flex flex-wrap items-center gap-2">
              <span className={`rounded-[100px] px-2.5 py-[3px] text-[11px] font-semibold ${style.className}`}>{style.label}</span>
              <span className="text-[13px] font-semibold text-[#283b30]">Created {formatDate(link.created_at)}</span>
              {selected && <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[#355b43]">Selected</span>}
            </span>
            <span className="text-[12px] text-[#7b8177]">
              {status === "revoked"
                ? `Revoked ${formatDate(link.revoked_at)}`
                : status === "expired"
                  ? `Expired ${formatDateTime(link.expires_at)}`
                  : `Expires ${formatDateTime(link.expires_at)}`}
              {" · "}
              {joinedText(link.collaborator_count)}
            </span>
          </button>
          {legacy && <p className="px-4 text-[12px] leading-snug text-[#6f6550]">{LEGACY_MESSAGE}</p>}
          {status === "active" && (
            <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
              {shareable && (
                <>
                  <button type="button" className={smallButton} onClick={() => void copyLink(link.id)}
                    aria-label={`Copy the link created ${formatDateTime(link.created_at)}`}>
                    {copiedId === link.id ? "Link copied" : "Copy link"}
                  </button>
                  <button type="button" className={smallButton} onClick={() => select(link.id, true)}
                    aria-label={`View QR for the link created ${formatDateTime(link.created_at)}`}>
                    View QR
                  </button>
                </>
              )}
              {revokeControls(link, "row")}
            </div>
          )}
          {status !== "active" && <div className="pb-2" />}
        </div>
      </li>
    );
  };

  const renderDetail = () => {
    if (!selectedLink || !selectedStatus) return <InviteQrPreview />;
    const state = fetchState[selectedLink.id];
    let body: JSX.Element;
    if (selectedStatus !== "active") {
      body = (
        <p className="rounded-xl border border-[#dedcd2] bg-[#fcfbf8] p-4 text-[13px] leading-snug text-[#6f6550]">
          {selectedStatus === "revoked"
            ? `This invitation was revoked on ${formatDateTime(selectedLink.revoked_at)}. It can't be shared again; people who already joined keep access.`
            : `This invitation expired on ${formatDateTime(selectedLink.expires_at)}. It can't be shared again.`}
        </p>
      );
    } else if (selectedUrl) {
      body = (
        <div className="flex flex-col gap-3">
          <InviteQrPreview url={selectedUrl} onArtwork={(url, image) => {
            const id = selectedLink.id;
            if (urls.current.get(id) === url && isActiveId(id)) { artworks.current.set(id, image); pngs.current.delete(id); }
          }} />
          <label className="flex min-w-0 flex-col gap-2 text-[13px] font-semibold text-[#283b30]">
            Invitation link
            <input
              ref={urlInputRef}
              readOnly
              value={selectedUrl}
              onFocus={event => event.currentTarget.select()}
              className={`${fieldControlClass} min-w-0 font-mono text-[13px]`}
            />
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button type="button" className={primaryButtonClass} onClick={() => void copyLink(selectedLink.id)}>
              {copiedId === selectedLink.id ? "Link copied" : "Copy link"}
            </button>
            <button type="button" className={secondaryButtonClass} onClick={() => void shareQr(selectedLink.id)}>Copy QR</button>
            <button type="button" className={secondaryButtonClass} onClick={() => void shareQr(selectedLink.id, true)}>Download QR</button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[12px] text-[#7b8177]">
              Expires {formatDateTime(selectedLink.expires_at)} · {joinedText(selectedLink.collaborator_count)}
            </p>
            {revokeControls(selectedLink, "panel")}
          </div>
        </div>
      );
    } else if (selectedLink.link_available && state !== "error" && state !== "unavailable") {
      body = (
        <div aria-busy="true" className="flex min-h-[200px] items-center justify-center rounded-xl border border-[#dedcd2] bg-[#f6f1e7] text-[13px] text-[#7b8177]">
          Loading link…
        </div>
      );
    } else if (state === "error") {
      body = (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-[#dedcd2] bg-[#fcfbf8] p-4">
          <p role="alert" className="text-[13px] text-[#8a3f2c]">We couldn't load this link.</p>
          <button type="button" className={smallButton} onClick={() => {
            ensureUrl(selectedLink.id).then(rerender, () => undefined);
          }}>Try again</button>
        </div>
      );
    } else {
      body = (
        <div className="flex flex-col gap-3 rounded-xl border border-[#dedcd2] bg-[#fcfbf8] p-4">
          <p className="text-[13px] leading-snug text-[#6f6550]">{LEGACY_MESSAGE}</p>
          <p className="text-[12px] text-[#7b8177]">
            Expires {formatDateTime(selectedLink.expires_at)} · {joinedText(selectedLink.collaborator_count)}
          </p>
          <div>{revokeControls(selectedLink, "panel")}</div>
        </div>
      );
    }
    return (
      <div key={`${selectedLink.id}:${selectedStatus}:${selectedUrl ? "url" : state ?? "none"}`} className="roots-swap">
        {body}
      </div>
    );
  };

  return (
    <Dialog
      title="Invite collaborators"
      description={`Share an invitation to ${treeName} with family members. Collaborators can view the tree and suggest changes.`}
      onClose={onClose}
      busy={busy}
      size="lg"
    >
      <div ref={rootRef} className="flex min-w-0 flex-col gap-5 [font-family:'Inter',Helvetica]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-[#7b8177]">Links expire 7 days after they're made. Several people can use one link.</p>
          <button
            type="button"
            className={`${primaryButtonClass} w-full sm:w-auto`}
            onClick={() => void create()}
            disabled={busy}
            aria-busy={busy || undefined}
            data-autofocus
            data-focus-key="create"
          >
            {busy ? "Creating…" : <><span aria-hidden="true">+</span> Create invitation link</>}
          </button>
        </div>
        {createError && <p role="alert" className={formErrorClass}>{createError}</p>}
        <div aria-live="polite" role="status" className={notice ? "" : "sr-only"}>
          {notice?.tone === "success" && <p className="text-[13px] font-semibold text-[#355b43]">{notice.text}</p>}
        </div>
        {notice?.tone === "error" && <p role="alert" className={formErrorClass}>{notice.text}</p>}

        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section ref={detailRef} aria-labelledby="invite-selected-heading" className="flex min-w-0 scroll-mt-4 flex-col gap-3">
            <h3 id="invite-selected-heading" className="text-[15px] font-semibold text-[#283b30]">Selected invitation</h3>
            {renderDetail()}
          </section>

          <section aria-labelledby="invite-links-heading" className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 id="invite-links-heading" className="text-[15px] font-semibold text-[#283b30]">Invitation history</h3>
              {links && <span className="text-[12px] text-[#7b8177]">{active.length} active</span>}
            </div>
            {revokeError && <p role="alert" className={formErrorClass}>{revokeError}</p>}
            {linksError && (
              <div className="flex flex-wrap items-center gap-3">
                <p role="alert" className="text-[13px] text-[#8a3f2c]">We couldn't load your links.</p>
                <button type="button" className={smallButton} onClick={() => loadLinks()}>Try again</button>
              </div>
            )}
            {!links && !linksError && <p className="text-[13px] text-[#7b8177]">Loading links…</p>}
            {links?.length === 0 && (
              <p className="rounded-xl border border-dashed border-[#dedcd2] p-5 text-center text-[13px] text-[#7b8177]">
                No links yet. Create one to invite family members.
              </p>
            )}
            {links && links.length > 0 && (
              <div className="flex flex-col gap-4 lg:max-h-[min(560px,65vh)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
                {active.length > 0 && (
                  <ul className="flex flex-col gap-2.5" aria-label="Active invitations">
                    {active.map(renderCard)}
                  </ul>
                )}
                {history.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <h4 className="text-[12px] font-semibold uppercase tracking-[1px] text-[#7b8177]">Expired and revoked</h4>
                    <ul className="flex flex-col gap-2.5" aria-label="Expired and revoked invitations">
                      {history.map(renderCard)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </Dialog>
  );
};
