
import { AppHeaderSection } from "./sections/AppHeaderSection";
import { FamilyTreeToolbarSection } from "./sections/FamilyTreeToolbarSection/FamilyTreeToolbarSection";
import { useState } from "react";
import { 
  AddPersonRequestModalSection, 
  type TreeSubmission, } 
  from "../RootsAddPerson/sections/AddPersonRequestModalSection/AddPersonRequestModalSection";
import { 
  FamilyTreeCanvas, 
  type DemoMember, 
  type DemoRelationship, 
} from "./FamilyTreeCanvas";

export const RootsFamilyTree = (): JSX.Element => {
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);

  const [members, setMembers] = useState<DemoMember[]>([]);
  const [relationships, setRelationships] = useState<DemoRelationship[]>([]);

  
  // Handles adding members and relationships to the family tree
  const handleTreeSubmit = (submission: TreeSubmission): void => {
    if (submission.type === "ADD_MEMBER") {
      const newMember: DemoMember = {
        id: Date.now(),
        fullName: `${submission.values.firstName} ${submission.values.lastName}`.trim(),
      };
      setMembers((current) => [...current, newMember]);
    } else {
      const newRelationship: DemoRelationship = {
        id: Date.now(),
        member1: Number(submission.values.member1),
        member2: Number(submission.values.member2),
        relationshipType: submission.values.relationshipType,
      };

      setRelationships((current) => [...current, newRelationship]);
    }
  };

  
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
