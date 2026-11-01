import {
  FamilyTreeCanvasSection,
  FamilyTreeToolbarSection,
} from "../RootsJamesBennett/RootsJamesBennett";
import { AppHeaderSection } from "./sections/AppHeaderSection";
export const RootsBennettFamily = (): JSX.Element => {
  return (
    <main
      className="flex min-h-screen flex-col items-stretch bg-[#f6f4ee] text-[#272522]"
      data-model-id="5:386"
    >
      <AppHeaderSection />
      <FamilyTreeToolbarSection />
      <FamilyTreeCanvasSection />
    </main>
  );
};
