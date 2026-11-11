// Modal shell shared by the tree workspace dialogs. Visual style matches the
// Figma "Request a change" modal (rounded 20px panel, Lora title, bordered
// close button) so new dialogs read as part of the same design.
import {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  useEffect,
  useId,
  useRef,
} from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const widths = {
  sm: "max-w-[480px]",
  md: "max-w-[640px]",
  lg: "max-w-[960px]",
} as const;

type DialogProps = {
  title: string;
  description?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  size?: keyof typeof widths;
  // While true (e.g. a request is in flight) Escape/backdrop don't close.
  busy?: boolean;
  role?: "dialog" | "alertdialog";
};

export const Dialog = ({
  title,
  description,
  onClose,
  children,
  size = "md",
  busy = false,
  role = "dialog",
}: DialogProps): JSX.Element => {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const pressStartedOnBackdrop = useRef(false);
  const busyRef = useRef(busy);
  busyRef.current = busy;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const returnFocusTo = document.activeElement as HTMLElement | null;
    // First field (or first control) gets focus; [data-autofocus] wins.
    const panel = panelRef.current;
    const preferred =
      panel?.querySelector<HTMLElement>("[data-autofocus]") ??
      panel?.querySelector<HTMLElement>("input, select, textarea") ??
      panel?.querySelector<HTMLElement>(FOCUSABLE);
    preferred?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busyRef.current) {
        event.stopPropagation();
        onCloseRef.current();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    // Scroll containment: the page behind a dialog doesn't scroll. Nested
    // dialogs restore whatever the previous one set.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (returnFocusTo?.isConnected) returnFocusTo.focus();
    };
  }, []);

  const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !panelRef.current) return;
    const focusable = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    );
    if (!focusable.length) return;
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

  const onBackdropDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    pressStartedOnBackdrop.current = event.target === event.currentTarget;
  };
  const onBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (
      pressStartedOnBackdrop.current &&
      event.target === event.currentTarget &&
      !busy
    ) {
      onClose();
    }
    pressStartedOnBackdrop.current = false;
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[#283b30]/30 px-3 py-6 sm:px-4 sm:py-12"
      onMouseDown={onBackdropDown}
      onClick={onBackdropClick}
    >
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onKeyDown={trapFocus}
        className={`roots-modal-panel relative mx-auto flex w-full ${widths[size]} flex-col gap-6 rounded-[20px] border border-solid border-[#dedcd2] bg-[#fffdf9] p-5 shadow-[0px_18px_48px_#3444321f] sm:p-8`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <h2
              id={titleId}
              className="[font-family:'Lora',Helvetica] text-[26px] font-normal leading-tight text-[#283b30] sm:text-[30px]"
            >
              {title}
            </h2>
            {description && (
              <p
                id={descriptionId}
                className="[font-family:'Inter',Helvetica] text-sm leading-[21px] text-[#7b8177]"
              >
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label={`Close ${title}`}
            onClick={onClose}
            disabled={busy}
            className="roots-press flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[#dedcd2] bg-[#fffdf9] hover:bg-[#f6f4ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#355b43] disabled:opacity-50"
          >
            <img alt="" aria-hidden="true" className="h-4 w-4" src="/img/vector-47.svg" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Shared form/button styles (same as the change-request modal).
export const fieldLabelClass =
  "flex flex-col gap-2 [font-family:'Inter',Helvetica] text-[13px] font-semibold text-[#283b30]";
export const fieldControlClass =
  "h-12 rounded-[10px] border border-[#dedcd2] bg-white px-3.5 text-sm font-normal text-[#283b30] transition-[border-color,box-shadow] focus:border-[#355b43] focus:shadow-[0_0_0_3px_rgba(53,91,67,0.14)] aria-[invalid=true]:border-[#9b4a32]";
export const fieldErrorClass =
  "[font-family:'Inter',Helvetica] text-[12px] font-normal leading-snug text-[#8a3f2c]";
export const formErrorClass =
  "w-full rounded-lg bg-[#f7ece6] p-3 [font-family:'Inter',Helvetica] text-sm text-[#8a3f2c]";
export const primaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#355b43] px-5 [font-family:'Inter',Helvetica] text-sm font-semibold text-white transition-[background-color,transform] duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#355b43] hover:bg-[#2b4a37] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";
export const secondaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-[#dedcd2] bg-white px-5 [font-family:'Inter',Helvetica] text-sm font-semibold text-[#283b30] transition-[background-color,transform] duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#355b43] hover:bg-[#f6f4ee] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";
export const dangerButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#8a3f2c] px-5 [font-family:'Inter',Helvetica] text-sm font-semibold text-white transition-[background-color,transform] duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#355b43] hover:bg-[#73331f] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";
