import {
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  RefObject,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { AuthRedirectState } from "../../../../auth/AuthProvider";
import { firstErrorMessage } from "../../../../services/api";
import { ApiError, FamilyTree, createTree } from "../../../../services/trees";

// Matches FamilyTree.name max_length in backend/trees/models.py.
const NAME_MAX_LENGTH = 100;
const signInState: AuthRedirectState = { from: "/", intent: "create-tree" };
// Keep in sync with the closed-state transition in tailwind.css.
const EXIT_DURATION_MS = 160;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type CreateTreeModalSectionProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (tree: FamilyTree) => void;
  // Where focus goes when the dialog closes. Falls back to whatever had
  // focus when it opened (Safari doesn't focus buttons on click).
  returnFocusRef?: RefObject<HTMLElement>;
};

type SubmitError =
  | { kind: "auth" }
  | { kind: "general"; message: string }
  | null;

export const CreateTreeModalSection = ({
  open,
  onClose,
  onCreated,
  returnFocusRef: returnFocusTarget,
}: CreateTreeModalSectionProps): JSX.Element | null => {
  // `mounted` keeps the dialog in the DOM long enough to play its exit;
  // `visible` drives the data-state the CSS transitions key off.
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      returnFocusRef.current =
        returnFocusTarget?.current ??
        (document.activeElement as HTMLElement | null);
      setMounted(true);
      return;
    }
    setVisible(false);
    const timeout = window.setTimeout(
      () => setMounted(false),
      EXIT_DURATION_MS,
    );
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!mounted || !open) return;
    const frame = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, [mounted, open]);

  // While the dialog is up, lock page scroll and take the rest of the app
  // out of the tab order and accessibility tree.
  useEffect(() => {
    if (!mounted) return;
    const appRoot = document.getElementById("app");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    appRoot?.setAttribute("inert", "");
    return () => {
      document.body.style.overflow = previousOverflow;
      appRoot?.removeAttribute("inert");
      // Return focus to whatever opened the dialog (the Create Tree button)
      // once the page is interactive again.
      returnFocusRef.current?.focus();
      returnFocusRef.current = null;
    };
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <CreateTreeDialog
      state={visible ? "open" : "closed"}
      onClose={onClose}
      onCreated={onCreated}
    />,
    document.body,
  );
};

const CreateTreeDialog = ({
  state,
  onClose,
  onCreated,
}: {
  state: "open" | "closed";
  onClose: () => void;
  onCreated: (tree: FamilyTree) => void;
}): JSX.Element => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<SubmitError>(null);
  const [submitting, setSubmitting] = useState(false);

  // A ref, not state, so two clicks in the same frame can't both submit.
  const submittingRef = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const pointerDownOnBackdrop = useRef(false);

  const titleId = useId();
  const descriptionId = useId();
  const nameId = useId();
  const nameErrorId = useId();
  const treeDescriptionId = useId();

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const requestClose = () => {
    if (submittingRef.current) return;
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      requestClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !panelRef.current) return;
    const focusable = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  // Only close when the press both starts and ends on the backdrop, so
  // selecting text in an input and releasing outside doesn't dismiss.
  const handleBackdropPointerDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    pointerDownOnBackdrop.current = event.target === event.currentTarget;
  };
  const handleBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (pointerDownOnBackdrop.current && event.target === event.currentTarget) {
      requestClose();
    }
    pointerDownOnBackdrop.current = false;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Give your tree a name to continue.");
      nameInputRef.current?.focus();
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const tree = await createTree({
        name: trimmedName,
        description: description.trim() || undefined,
      });
      submittingRef.current = false;
      onCreated(tree);
    } catch (error) {
      submittingRef.current = false;
      setSubmitting(false);

      if (error instanceof ApiError) {
        // The session expired after the page loaded.
        if (error.isUnauthenticated) {
          setSubmitError({ kind: "auth" });
          return;
        }
        const nameMessage = firstErrorMessage(error.fieldErrors.name);
        if (nameMessage) {
          setNameError(nameMessage);
          nameInputRef.current?.focus();
          return;
        }
        const otherMessage = firstErrorMessage(error.fieldErrors);
        if (otherMessage) {
          setSubmitError({ kind: "general", message: otherMessage });
          return;
        }
      }
      setSubmitError({
        kind: "general",
        message: "We couldn't create your tree. Please try again.",
      });
    }
  };

  return (
    <div
      data-state={state}
      className="roots-dialog-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#2e3b2c]/40 px-4 py-8 backdrop-blur-[2px]"
      onMouseDown={handleBackdropPointerDown}
      onClick={handleBackdropClick}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={trapFocus}
        className="roots-dialog-panel w-full max-w-[480px] rounded-lg border border-roots-line bg-roots-canvas shadow-[0_24px_64px_-16px_rgba(46,59,44,0.35),0_2px_6px_rgba(46,59,44,0.08)]"
      >
        <form noValidate onSubmit={handleSubmit}>
          <div className="px-6 pb-6 pt-7 sm:px-8 sm:pt-8">
            <h2
              id={titleId}
              className="font-display text-[26px] leading-tight text-roots-ink"
            >
              Create Your Tree
            </h2>
            <p
              id={descriptionId}
              className="mt-2 text-[14px] leading-relaxed text-roots-muted"
            >
              Name it now. You can add family members once it's created.
            </p>

            <div className="mt-7 flex flex-col gap-2">
              <label htmlFor={nameId} className="roots-label">
                Name of tree
              </label>
              <input
                ref={nameInputRef}
                id={nameId}
                name="name"
                type="text"
                required
                autoComplete="off"
                maxLength={NAME_MAX_LENGTH}
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (nameError && event.target.value.trim()) setNameError(null);
                }}
                placeholder="e.g. Smith Family Tree"
                aria-invalid={nameError ? true : undefined}
                aria-describedby={nameError ? nameErrorId : undefined}
                className="roots-field h-12"
              />
              {nameError && (
                <p
                  id={nameErrorId}
                  className="text-[13px] leading-snug text-roots-error"
                >
                  {nameError}
                </p>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <label htmlFor={treeDescriptionId} className="roots-label">
                Tree description{" "}
                <span className="font-normal tracking-[1px] text-roots-faint">
                  (optional)
                </span>
              </label>
              <textarea
                id={treeDescriptionId}
                name="description"
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="e.g. Our family's history"
                className="roots-field resize-none py-3"
              />
            </div>

            {submitError && (
              <div
                role="alert"
                className="mt-5 rounded-md border border-roots-error/25 bg-roots-error/[0.06] px-4 py-3 text-[13px] leading-snug text-roots-error"
              >
                {submitError.kind === "auth" ? (
                  <>
                    You need to be signed in to create a tree.{" "}
                    <Link
                      to="/sign-in"
                      state={signInState}
                      className="font-semibold underline underline-offset-2"
                    >
                      Sign in
                    </Link>
                  </>
                ) : (
                  submitError.message
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-roots-line/70 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
            <button
              type="button"
              onClick={requestClose}
              disabled={submitting}
              className="roots-btn roots-btn-secondary h-11 px-6 text-[15px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting || undefined}
              className="roots-btn roots-btn-primary h-11 px-6 text-[15px]"
            >
              {submitting ? "Creating…" : "Create Tree"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
