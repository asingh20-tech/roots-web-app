import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthRedirectState, useAuth } from "../../auth/AuthProvider";
import { BrandHeaderSection } from "./sections/BrandHeaderSection/BrandHeaderSection";
import { GoogleSignInSection } from "./sections/GoogleSignInSection/GoogleSignInSection";

// Only same-app paths; never bounce to another origin from router state.
const safeReturnPath = (from: string | undefined): string =>
  from && from.startsWith("/") && !from.startsWith("//") ? from : "/";

export const SignInScreen = (): JSX.Element => {
  const { status, refresh } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const redirect = (location.state ?? {}) as AuthRedirectState;
  const returnTo = safeReturnPath(redirect.from);
  const resumeState: AuthRedirectState | undefined = redirect.intent
    ? { intent: redirect.intent }
    : undefined;

  // Already signed in (valid session cookie): don't ask again.
  if (status === "authenticated") {
    return <Navigate to={returnTo} replace state={resumeState} />;
  }

  const handleSignedIn = async (): Promise<boolean> => {
    const user = await refresh();
    if (!user) return false;
    navigate(returnTo, { replace: true, state: resumeState });
    return true;
  };

  return (
    <main
      className="flex min-h-screen flex-col items-stretch bg-[#f5f0e8] text-[#24302b]"
      data-model-id="73:2"
    >
      <BrandHeaderSection />
      <GoogleSignInSection onSignedIn={handleSignedIn} />
    </main>
  );
};
