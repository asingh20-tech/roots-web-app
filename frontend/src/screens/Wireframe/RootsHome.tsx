import { FamilyTreeBuilderSection } from "./sections/FamilyTreeBuilderSection/FamilyTreeBuilderSection";
// import { FooterSection } from "./sections/FooterSection/FooterSection";
import { HeaderSection } from "./sections/HeaderSection/HeaderSection";

export const RootsHome = () => {
  return (
    <main
    className="flex h-screen w-full flex-col items-stretch overflow-hidden bg-[#f5f0e8] text-[#24302b]"
    >
      <HeaderSection />
      <FamilyTreeBuilderSection />
      {/* <FooterSection /> */}
    </main>
  );
};