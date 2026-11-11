import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthRedirectState, useAuth } from "../../auth/AuthProvider";
import { CreateTreeModal } from "../../components/CreateTreeModal/CreateTreeModal";
import { FamilyTree } from "../../services/trees";
import { LandingHeaderSection } from "./sections/LandingHeaderSection/LandingHeaderSection";
import { LandingHeroSection } from "./sections/LandingHeroSection/LandingHeroSection";

export const LandingScreen = (): JSX.Element => {
  const { status } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCreateTreeOpen, setIsCreateTreeOpen] = useState(false);
  // Create Tree pressed while the session check is still in flight.
  const [createPending, setCreatePending] = useState(false);
  const createButtonRef = useRef<HTMLButtonElement>(null);

  const resumeIntent = (location.state as AuthRedirectState | null)?.intent;

  useEffect(() => {
    if (status === "loading") return;

    const wantsCreate = createPending || resumeIntent === "create-tree";
    if (!wantsCreate) return;
    setCreatePending(false);

    if (status === "authenticated") {
      setIsCreateTreeOpen(true);
      // Consume the intent so Back/refresh doesn't reopen the dialog.
      if (resumeIntent) navigate(".", { replace: true, state: null });
    } else if (status === "anonymous") {
      const state: AuthRedirectState = { from: "/", intent: "create-tree" };
      navigate("/sign-in", { state });
    }
  }, [status, createPending, resumeIntent, navigate]);

  const handleCreateTree = () => {
    if (status === "authenticated") setIsCreateTreeOpen(true);
    else setCreatePending(true);
  };

  const handleTreeCreated = (tree: FamilyTree) => {
    setIsCreateTreeOpen(false);
    navigate(`/family-tree/${tree.id}`);
  };

  return (
    <div className="flex min-h-screen min-h-[100dvh] w-full flex-col bg-roots-canvas font-body text-roots-ink">
      <LandingHeaderSection />
      <LandingHeroSection
        onCreateTree={handleCreateTree}
        createButtonRef={createButtonRef}
      />
      <CreateTreeModal
        open={isCreateTreeOpen}
        onClose={() => setIsCreateTreeOpen(false)}
        onCreated={handleTreeCreated}
        returnFocusRef={createButtonRef}
      />
    </div>
  );
};
