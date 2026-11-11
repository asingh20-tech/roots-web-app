import { Navigate, Route, Routes, useSearchParams } from "react-router-dom";
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

// The app's routes, shared by index.tsx and the screen tests.
export const AppRoutes = (): JSX.Element => (
  <AuthProvider>
    <Routes>
      <Route path="/" element={<LandingScreen />} />
      <Route path="/sign-in" element={<SignInScreen />} />
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
