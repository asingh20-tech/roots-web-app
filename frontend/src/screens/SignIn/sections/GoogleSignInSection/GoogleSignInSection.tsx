import { useEffect, useRef, useState } from "react";
import { BACKEND_ORIGIN } from "../../../../services/api";
import {
  GOOGLE_LOGIN_SUCCESS,
  GOOGLE_LOGIN_URL,
  fetchCurrentUser,
} from "../../../../services/auth";

const familyNodes = [
  {
    label: "Family",
    className:
      "left-[210px] flex flex-col w-[126px] h-[50px] items-center justify-center gap-1.5 absolute top-0",
  },
  {
    label: "Family",
    className:
      "left-0 flex flex-col w-[126px] h-[50px] items-center justify-center gap-1.5 absolute top-0",
  },
];

const authenticationProviders = [
  {
    name: "Continue with Google",
    href: GOOGLE_LOGIN_URL,
    logo: "/img/provider-logo-2.svg",
    className: "bg-[#4a5e47] border-[#4a5e47] text-[#faf8f4]",
  },
];

const POPUP_WIDTH = 500;
const POPUP_HEIGHT = 650;
// How often to ask Django whether the popup has finished signing in, and for
// how long before giving up.
export const SESSION_POLL_MS = 1500;
const SESSION_POLL_TIMEOUT_MS = 5 * 60 * 1000;

// Opens Django's Google OAuth login centred over the current window.
const openCenteredPopup = (url: string): Window | null => {
  const left = Math.round(
    window.screenX + (window.outerWidth - POPUP_WIDTH) / 2,
  );
  const top = Math.round(
    window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2,
  );
  return window.open(
    url,
    "GoogleLogin",
    `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top}`,
  );
};

type SignInStatus = "idle" | "waiting" | "verifying" | "error";

type GoogleSignInSectionProps = {
  // Called once Django has a session for this browser. Re-reads /api/me/ and
  // navigates on; resolves to false when the session could not be verified.
  onSignedIn: () => Promise<boolean>;
};

// Two ways to learn the popup finished, because Django's SecurityMiddleware
// sends Cross-Origin-Opener-Policy: same-origin. The popup (:8000) and this
// page (:5173) are different origins, so the browser severs window.opener and
// popup-complete's postMessage usually never arrives (popup.closed also reads
// true immediately). So we:
//   1. accept GOOGLE_LOGIN_SUCCESS from BACKEND_ORIGIN when it does arrive;
//   2. poll GET /api/me/ and re-check on window focus. The session cookie is
//      host-scoped, so it is visible here as soon as Google's callback lands.
export const GoogleSignInSection = ({
  onSignedIn,
}: GoogleSignInSectionProps): JSX.Element => {
  const [status, setStatus] = useState<SignInStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const popupRef = useRef<Window | null>(null);
  const cleanupRef = useRef<() => void>(() => undefined);

  useEffect(() => () => cleanupRef.current(), []);

  const startGoogleSignIn = (url: string) => {
    // A second click while waiting focuses the popup that's already open.
    if (status === "waiting" && popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus();
      return;
    }
    cleanupRef.current();

    const popup = openCenteredPopup(url);
    if (!popup) {
      setStatus("error");
      setErrorMessage("Please allow pop-ups for Roots to sign in with Google.");
      return;
    }
    popupRef.current = popup;
    setStatus("waiting");
    setErrorMessage("");

    let finished = false;
    let checking = false;

    const finish = async () => {
      if (finished) return;
      finished = true;
      cleanup();
      setStatus("verifying");
      const verified = await onSignedIn();
      if (!verified) {
        setStatus("error");
        setErrorMessage("We couldn't verify your sign-in. Please try again.");
      }
    };

    const checkSession = async () => {
      if (finished || checking) return;
      checking = true;
      try {
        if (await fetchCurrentUser()) await finish();
      } catch {
        // Server briefly unreachable: keep waiting.
      } finally {
        checking = false;
      }
    };

    const handleMessage = (event: MessageEvent) => {
      // Only trust Django's popup-complete page, from the popup we opened.
      if (event.origin !== BACKEND_ORIGIN) return;
      if (event.source !== popup) return;
      if (event.data?.type !== GOOGLE_LOGIN_SUCCESS) return;
      void finish();
    };

    const handleFocus = () => void checkSession();
    const poll = window.setInterval(() => void checkSession(), SESSION_POLL_MS);
    const timeout = window.setTimeout(() => {
      cleanup();
      setStatus((current) => (current === "waiting" ? "idle" : current));
    }, SESSION_POLL_TIMEOUT_MS);

    const cleanup = () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("focus", handleFocus);
      window.clearInterval(poll);
      window.clearTimeout(timeout);
      popupRef.current = null;
      cleanupRef.current = () => undefined;
    };
    cleanupRef.current = cleanup;
    window.addEventListener("message", handleMessage);
    window.addEventListener("focus", handleFocus);
  };

  return (
    <section className="flex min-h-[764px] items-start relative self-stretch w-full flex-[0_0_auto]">
      <aside className="flex flex-col w-[480px] min-h-[764px] items-start gap-8 pt-[58px] pb-12 px-12 relative self-stretch bg-[#ede8dc] border-r [border-right-style:solid] border-[#c8bfa8]">
        <header className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#7a6e5c] text-[11px] tracking-[2.00px] leading-[normal] whitespace-nowrap">
            CONNECTED BY FAMILY
          </div>
          <h1 className="relative self-stretch [font-family:'Lora',Helvetica] font-normal text-[#2e3b2c] text-4xl tracking-[0] leading-[46.8px]">
            Every story begins
            <br />
            with a root.
          </h1>
          <p className="relative self-stretch [font-family:'Inter',Helvetica] font-normal text-[#7a6e5c] text-[15px] tracking-[0] leading-[25.5px]">
            A place to trace your connections, bring generations together, and
            begin your family tree.
          </p>
        </header>
        <div
          aria-hidden="true"
          className="relative self-stretch w-full h-px bg-[#c8bfa8]"
        />
        <div className="flex flex-col items-center gap-[22px] relative self-stretch w-full flex-[0_0_auto]">
          <div
            className="relative w-[336px] h-[218px]"
            aria-label="Family tree illustration"
          >
            <div className="flex flex-col w-[126px] h-[78px] items-center justify-center gap-1.5 absolute top-[137px] left-[105px] bg-[#faf8f4] rounded-lg overflow-hidden border border-solid border-[#4a5e47]">
              <div className="[font-family:'Lora',Helvetica] text-[#2e3b2c] text-xl relative w-fit font-normal tracking-[0] leading-[normal]">
                You
              </div>
              <div className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#7a6e5c] text-[10px] tracking-[1.50px] leading-[normal] whitespace-nowrap">
                THE ROOT
              </div>
            </div>
            {familyNodes.map((node) => (
              <div
                key={`${node.label}-${node.className}`}
                className={`${node.className} bg-[#faf8f4] rounded-lg overflow-hidden border border-solid border-[#c8bfa8]`}
              >
                <div className="[font-family:'Lora',Helvetica] font-normal text-[#2e3b2c] text-base tracking-[0] leading-[normal]">
                  {node.label}
                </div>
              </div>
            ))}

            <img
              className="absolute top-[46px] left-[62px] w-[212px] h-[91px]"
              alt=""
              src="/img/branches-1.svg"
            />
          </div>
          <p className="relative self-stretch [font-family:'Inter',Helvetica] font-normal text-[#7a6e5c] text-xs text-center tracking-[0.30px] leading-[normal]">
            One connection at a time.
          </p>
        </div>
      </aside>
      <main className="flex flex-col min-h-[764px] items-center justify-center p-20 relative flex-1 grow">
        <div className="w-[440px] gap-8 flex flex-col items-start relative flex-[0_0_auto]">
          <header className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#4a5e47] text-[11px] tracking-[2.00px] leading-[normal] whitespace-nowrap">
              SIGN IN / SIGN UP
            </div>
            <h2 className="relative self-stretch [font-family:'Lora',Helvetica] font-normal text-[#2e3b2c] text-4xl tracking-[0] leading-[45px]">
              Welcome to Roots
            </h2>
            <p className="relative self-stretch [font-family:'Inter',Helvetica] font-normal text-[#7a6e5c] text-[15px] tracking-[0] leading-[25.5px]">
              Begin your family tree or pick up where you left off. Choose an
              option below to continue.
            </p>
          </header>
          <nav
            aria-label="Authentication providers"
            className="flex flex-col items-start gap-3.5 relative self-stretch w-full flex-[0_0_auto]"
          >
            {authenticationProviders.map((provider) => ( 
              <button
                key={provider.name}
                type="button"
                className={`flex h-[58px] items-center justify-center relative self-stretch w-full rounded-md overflow-hidden border border-solid ${provider.className}`}
                onClick={() => startGoogleSignIn(provider.href)}
                disabled={status === "verifying"}
                aria-label={provider.name}
              >
                <img
                  className="absolute top-[18px] left-5 w-[22px] h-[22px]"
                  alt=""
                  src={provider.logo}
                />
                <span className="[font-family:'Inter',Helvetica] font-medium text-[15px] tracking-[0.20px] leading-[normal] whitespace-nowrap">
                  {provider.name}
                </span>
              </button>
            ))}
          </nav>
          <p
            role={status === "error" ? "alert" : "status"}
            className={`relative self-stretch min-h-[20px] [font-family:'Inter',Helvetica] text-[13px] leading-[20px] ${
              status === "error" ? "text-[#9b4a32]" : "text-[#7a6e5c]"
            }`}
          >
            {status === "waiting" && "Finish signing in with Google in the pop-up window."}
            {status === "verifying" && "Signing you in…"}
            {status === "error" && errorMessage}
          </p>
          <div className="gap-5 self-stretch w-full flex flex-col items-start relative flex-[0_0_auto]">
            <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#7a6e5c] text-[13px] tracking-[0] leading-[22.1px]">
              New here? These options create your account. Already have an
              account? Use the same provider to sign in.
            </p>
            <div className="flex items-center gap-[9px] relative self-stretch w-full flex-[0_0_auto]">
              <div className="relative w-[15px] h-[15px]" aria-hidden="true">
                <img
                  className="absolute w-[92.50%] h-[96.67%] top-[3.33%] left-[7.50%]"
                  alt=""
                  src="/img/vector-7.svg"
                />
              </div>
              <p className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#4a5e47] text-xs tracking-[0] leading-[normal]">
                No separate Roots password to remember.
              </p>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="relative self-stretch w-full h-px bg-[#c8bfa8]"
          />
        </div>
      </main>
    </section>
  );
};
