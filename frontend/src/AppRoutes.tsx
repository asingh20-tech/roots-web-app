import { Route, Routes } from "react-router-dom";
import { AuthProvider, RequireAuth } from "./auth/AuthProvider";
import { FamilyTreeScreen } from "./screens/FamilyTree";
import { LandingScreen } from "./screens/Landing";
import { SignInScreen } from "./screens/SignIn";

// The app's routes, shared by index.tsx and the screen tests.
export const AppRoutes = (): JSX.Element => (
  <AuthProvider>
    <Routes>
      <Route path="/" element={<LandingScreen />} />
      <Route path="/sign-in" element={<SignInScreen />} />
      <Route
        path="/family-tree"
        element={
          <RequireAuth>
            <FamilyTreeScreen />
          </RequireAuth>
        }
      />
    </Routes>
  </AuthProvider>
);
