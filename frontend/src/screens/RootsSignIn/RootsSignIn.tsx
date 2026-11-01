import { BrandHeaderSection } from "./sections/BrandHeaderSection/BrandHeaderSection";
import { FamilyTreeAuthenticationSection } from "./sections/FamilyTreeAuthenticationSection/FamilyTreeAuthenticationSection";
// import { FooterSection } from "../Wireframe/sections/FooterSection";

export const RootsSignIn = (): JSX.Element => {
  return (
    <main
      className="flex min-h-screen flex-col items-stretch bg-[#f5f0e8] text-[#24302b]"
      data-model-id="73:2"
    >
      <BrandHeaderSection />
      <FamilyTreeAuthenticationSection />
      {/* <FooterSection /> */}
    </main>
  );
};
