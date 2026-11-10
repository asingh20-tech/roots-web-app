import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Location, Navigate, useLocation } from "react-router-dom";
import { CurrentUser, fetchCurrentUser, logout } from "../services/auth";

export type AuthStatus = "loading" | "authenticated" | "anonymous" | "error";

type AuthContextValue = {
  status: AuthStatus;
  user: CurrentUser | null;
  // Re-asks Django who is signed in (after the Google popup reports success).
  refresh: () => Promise<CurrentUser | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// What the user was trying to do when we sent them to sign in, so it can be
// resumed afterwards. Travels in React Router location state.
export type AuthIntent = "create-tree";
export type AuthRedirectState = {
  from?: string;
  intent?: AuthIntent;
};

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<CurrentUser | null>(null);

  const refresh = useCallback(async () => {
    try {
      const current = await fetchCurrentUser();
      setUser(current);
      setStatus(current ? "authenticated" : "anonymous");
      return current;
    } catch {
      // Backend unreachable: don't pretend the user is signed out.
      setUser(null);
      setStatus("error");
      return null;
    }
  }, []);

  // One check per page load. A valid Django session cookie means the user is
  // never asked to sign in again until it expires or they sign out.
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    try {
      await logout();
    } finally {
      setUser(null);
      setStatus("anonymous");
    }
  }, []);

  const value = useMemo(
    () => ({ status, user, refresh, signOut }),
    [status, user, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
};

export const locationToPath = (location: Location): string =>
  `${location.pathname}${location.search}${location.hash}`;

const AuthStatusMessage = ({ children }: { children: ReactNode }) => (
  <main className="flex min-h-screen items-center justify-center bg-[#f5f0e8] px-6 text-center [font-family:'Inter',Helvetica] text-[15px] text-[#7a6e5c]">
    {children}
  </main>
);

// Route guard: anonymous visitors go to /sign-in and come back here after.
export const RequireAuth = ({
  children,
}: {
  children: JSX.Element;
}): JSX.Element => {
  const { status, refresh } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <AuthStatusMessage>
        <p role="status">Checking your session…</p>
      </AuthStatusMessage>
    );
  }

  if (status === "error") {
    return (
      <AuthStatusMessage>
        <div role="alert" className="flex flex-col items-center gap-4">
          <p>We couldn't reach the Roots server.</p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="h-11 rounded-md border border-[#b0a48e] bg-white px-5 font-medium text-[#3d4f3b]"
          >
            Try again
          </button>
        </div>
      </AuthStatusMessage>
    );
  }

  if (status === "anonymous") {
    const state: AuthRedirectState = { from: locationToPath(location) };
    return <Navigate to="/sign-in" replace state={state} />;
  }

  return children;
};
