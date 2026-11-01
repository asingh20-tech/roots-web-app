import {
  AddPersonRequestModalSection,
  FamilyTreeHeaderSection,
  FamilyTreeWorkspaceSection,
  MainNavigationSection,
} from "../RootsGoogleSignIn/RootsGoogleSignIn";
export const RootsAddPerson = (): JSX.Element => {
  return (
    <div
      className="relative min-h-[1320px] w-full min-w-[1600px] bg-[#f6f4ee]"
      data-model-id="12:18"
    >
      <main className="absolute left-0 top-0 flex h-[1320px] w-[1600px] flex-col items-start bg-[#f6f4ee]">
        <header className="w-full">
          <MainNavigationSection />
        </header>
        <section aria-label="Family tree header" className="w-full">
          <FamilyTreeHeaderSection />
        </section>
        <section aria-label="Family tree workspace" className="w-full">
          <FamilyTreeWorkspaceSection />
        </section>
      </main>
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 h-[1320px] w-[1600px] bg-[#283b30] opacity-[0.28]"
      />
      <AddPersonRequestModalSection />
    </div>
  );
};
