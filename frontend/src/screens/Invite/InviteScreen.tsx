// /invite/:token — the link Django's invitation_url() builds
// ({FRONTEND_URL}/invite/<token>). Sign-in is required first (RequireAuth
// returns here afterwards); POST /api/invite/<token>/ joins as Collaborator.
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "../../components/AppHeader/AppHeader";
import {
  formErrorClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../../components/Dialog/Dialog";
import { ApiError } from "../../services/api";
import {
  InvitationPreview,
  acceptInvitation,
  previewInvitation,
} from "../../services/trees";

type State =
  | { kind: "loading" }
  | { kind: "invalid"; message: string }
  | { kind: "error" }
  | { kind: "ready"; preview: InvitationPreview };

export const InviteScreen = (): JSX.Element => {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const joiningRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    previewInvitation(token, controller.signal)
      .then((preview) => setState({ kind: "ready", preview }))
      .catch((error: unknown) => {
        if ((error as Error).name === "AbortError") return;
        setState(
          error instanceof ApiError && error.status === 404
            ? { kind: "invalid", message: error.message }
            : { kind: "error" },
        );
      });
    return () => controller.abort();
  }, [token]);

  const join = async () => {
    if (joiningRef.current) return;
    joiningRef.current = true;
    setJoining(true);
    setJoinError("");
    try {
      const result = await acceptInvitation(token);
      navigate(`/family-tree/${result.tree_id}`, { replace: true });
    } catch (error) {
      setJoinError(error instanceof ApiError ? error.message : "We couldn't join this tree. Please try again.");
      joiningRef.current = false;
      setJoining(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#f6f4ee] text-[#283b30]">
      <AppHeader />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <section className="flex w-full max-w-[520px] flex-col items-center gap-5 rounded-[20px] border border-[#dedcd2] bg-[#fffdf9] p-8 text-center shadow-[0px_18px_48px_#3444321f] [font-family:'Inter',Helvetica]">
          {state.kind === "loading" && <p role="status" className="text-[14px] text-[#7b8177]">Checking your invitation…</p>}

          {state.kind === "invalid" && (
            <>
              <h1 className="[font-family:'Lora',Helvetica] text-[28px]">Invitation unavailable</h1>
              <p role="alert" className="text-[14px] text-[#7b8177]">{state.message}</p>
              <p className="text-[13px] text-[#7b8177]">Ask the Tree Owner to send you a new link.</p>
              <Link to="/my-trees" className={secondaryButtonClass}>Go to My Trees</Link>
            </>
          )}

          {state.kind === "error" && (
            <>
              <p role="alert" className="text-[14px]">We couldn't check this invitation.</p>
              <button type="button" className={secondaryButtonClass} onClick={() => window.location.reload()}>
                Try again
              </button>
            </>
          )}

          {state.kind === "ready" && (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#7a6e5c]">You're invited</p>
              <h1 className="break-words [font-family:'Lora',Helvetica] text-[30px] leading-tight">
                Join {state.preview.tree_name}?
              </h1>
              {state.preview.already_member ? (
                <>
                  <p className="text-[14px] text-[#7b8177]">You already have access to this tree.</p>
                  <Link to={`/family-tree/${state.preview.tree_id}`} className={primaryButtonClass}>
                    Open Tree
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-[14px] leading-[22px] text-[#7b8177]">
                    As a Collaborator you can view this family tree and send change
                    requests. The Tree Owner reviews every request before the tree changes.
                  </p>
                  {joinError && <p role="alert" className={formErrorClass}>{joinError}</p>}
                  <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    <Link to="/my-trees" className={secondaryButtonClass}>Not now</Link>
                    <button type="button" className={primaryButtonClass} onClick={() => void join()} disabled={joining}>
                      {joining ? "Joining…" : "Join Tree"}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
};
