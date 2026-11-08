
import { AppHeaderSection } from "./sections/AppHeaderSection";
import { FamilyTreeToolbarSection } from "./sections/FamilyTreeToolbarSection/FamilyTreeToolbarSection";
import { useState } from "react";
import { AddPersonRequestModalSection } from "../RootsAddPerson/sections/AddPersonRequestModalSection/AddPersonRequestModalSection";

export const RootsFamilyTree = (): JSX.Element => {
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  return (
    <main className="flex min-h-screen flex-col items-stretch bg-[#f6f4ee] text-[#272522]">
      <AppHeaderSection />
      {isRequestFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#283b30]/30">
          <AddPersonRequestModalSection
            onClose={() => setIsRequestFormOpen(false)}
          />
        </div>
      )}
      <FamilyTreeToolbarSection onRequestChange={() => setIsRequestFormOpen(true)} />

      <section
        id="family-tree"
        aria-label="Empty family tree"
        className="relative flex-1 bg-[#f6f4ee]"
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(#c9c8bf 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </section>
    </main>
  );
};
