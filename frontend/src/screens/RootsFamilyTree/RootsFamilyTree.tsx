
import { AppHeaderSection } from "./sections/AppHeaderSection";
import { FamilyTreeToolbarSection } from "./sections/FamilyTreeToolbarSection/FamilyTreeToolbarSection";
import { useState } from "react";
import { AddPersonRequestModalSection } from "../RootsAddPerson/sections/AddPersonRequestModalSection/AddPersonRequestModalSection";
import { FamilyTreeCanvas, type DemoMember, type DemoRelationship, } from "./FamilyTreeCanvas";

export const RootsFamilyTree = (): JSX.Element => {
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);

  const [members, setMembers] = useState<DemoMember[]>([]);
  const [relationships, setRelationships] = useState<DemoRelationship[]>([]);
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

      <FamilyTreeCanvas
        members={members}
        relationships={relationships}
      />
    </main>
  );
};
