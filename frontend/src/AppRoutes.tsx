import { ThemeProvider, useTheme } from "next-themes";
import { Navigate, Outlet, Route, Routes, useSearchParams } from "react-router-dom";
import { AuthProvider, RequireAuth } from "./auth/AuthProvider";
import { FamilyTreeScreen } from "./screens/FamilyTree";
import { InviteScreen } from "./screens/Invite/InviteScreen";
import { LandingScreen } from "./screens/Landing";
import { MyTreesScreen } from "./screens/MyTrees";
import { SignInScreen } from "./screens/SignIn";

// Old links: /family-tree?tree=<id> → /family-tree/<id>, /family-tree → My Trees.
const LegacyFamilyTreeRedirect = (): JSX.Element => {
  const [params] = useSearchParams();
  const id = params.get("tree");
  return <Navigate to={id && /^\d+$/.test(id) ? `/family-tree/${id}` : "/my-trees"} replace />;
};

function ThemedPages() {
  const { resolvedTheme } = useTheme();
  return <div className={resolvedTheme === "dark" ? "roots-dark-page" : undefined}><Outlet /></div>;
}

// The app's routes, shared by index.tsx and the screen tests.
export const AppRoutes = (): JSX.Element => (
  <AuthProvider>
    <Routes>
      <Route element={
        <ThemeProvider attribute="class" defaultTheme="light" storageKey="roots-theme" enableSystem={false} enableColorScheme={false}>
          <ThemedPages />
        </ThemeProvider>
      }>
        <Route path="/" element={<LandingScreen />} />
        <Route
          path="/my-trees"
          element={
            <RequireAuth>
              <MyTreesScreen />
            </RequireAuth>
          }
        />
        <Route
          path="/family-tree/:treeId"
          element={
            <RequireAuth>
              <FamilyTreeScreen />
            </RequireAuth>
          }
        />
      </Route>
      <Route path="/sign-in" element={<SignInScreen />} />
      <Route path="/family-tree" element={<LegacyFamilyTreeRedirect />} />
      <Route
        path="/invite/:token"
        element={
          <RequireAuth>
            <InviteScreen />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </AuthProvider>
);
