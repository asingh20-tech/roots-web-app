import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FamilyTree } from "../../services/trees";
import { CreateTreeModalSection } from "./sections/CreateTreeModalSection/CreateTreeModalSection";
import { HeaderSection } from "./sections/HeaderSection/HeaderSection";
import { LandingHeroSection } from "./sections/LandingHeroSection/LandingHeroSection";

export const RootsHome = (): JSX.Element => {
  const [isCreateTreeOpen, setIsCreateTreeOpen] = useState(false);
  const navigate = useNavigate();
  const createButtonRef = useRef<HTMLButtonElement>(null);

  const handleTreeCreated = (tree: FamilyTree) => {
    setIsCreateTreeOpen(false);
    // The family tree screen doesn't load trees by id yet; pass the new
    // tree along in router state so it can pick it up when it does.
    navigate("/family-tree", { state: { tree } });
  };

  return (
    <div className="flex min-h-screen min-h-[100dvh] w-full flex-col bg-roots-canvas font-body text-roots-ink">
      <HeaderSection />
      <LandingHeroSection
        onCreateTree={() => setIsCreateTreeOpen(true)}
        createButtonRef={createButtonRef}
      />
      <CreateTreeModalSection
        open={isCreateTreeOpen}
        onClose={() => setIsCreateTreeOpen(false)}
        onCreated={handleTreeCreated}
        returnFocusRef={createButtonRef}
      />
    </div>
  );
};
