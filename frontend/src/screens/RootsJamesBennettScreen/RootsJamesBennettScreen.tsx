import { useState } from "react";

type Person = {
  id: string;
  name: string;
  relation: string;
  years: string;
};

const familyMembers: Person[] = [
  { id: "james", name: "James Bennett", relation: "You", years: "1948 – 2021" },
  {
    id: "mary",
    name: "Mary Bennett",
    relation: "Mother",
    years: "1922 – 2004",
  },
  {
    id: "william",
    name: "William Bennett",
    relation: "Father",
    years: "1919 – 1988",
  },
  {
    id: "ellen",
    name: "Ellen Carter",
    relation: "Grandmother",
    years: "1896 – 1975",
  },
];

const documents = [
  {
    id: "birth",
    title: "Birth certificate",
    meta: "Added May 12, 2023",
    type: "PDF",
  },
  {
    id: "census",
    title: "1940 United States Census",
    meta: "Added May 10, 2023",
    type: "IMAGE",
  },
  {
    id: "obituary",
    title: "James Bennett obituary",
    meta: "Added April 28, 2023",
    type: "PDF",
  },
];

export const BrandHeaderSection = (): JSX.Element => (
  <a
    href="#family-tree"
    aria-label="Roots family history home"
    className="flex items-center gap-3 text-[#283b30] no-underline"
  >
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#283b30] text-xl text-white">
      ✦
    </span>
    <span className="[font-family:Georgia,serif] text-[25px] tracking-[-0.03em]">
      roots
    </span>
  </a>
);

export const MainNavigationSection = (): JSX.Element => (
  <nav
    aria-label="Main navigation"
    className="hidden items-center gap-8 text-sm text-[#405047] md:flex"
  >
    <a href="#tree" className="hover:text-[#283b30]">
      My tree
    </a>
    <a href="#discover" className="hover:text-[#283b30]">
      Discover
    </a>
    <a href="#memories" className="hover:text-[#283b30]">
      Memories
    </a>
  </nav>
);

export const PrimaryNavigationSection = (): JSX.Element => (
  <div className="flex items-center gap-5">
    <button
      type="button"
      className="text-sm text-[#405047] hover:text-[#283b30]"
    >
      Help
    </button>
    <button
      type="button"
      className="rounded-full border border-[#b9c0b8] px-4 py-2 text-sm text-[#283b30] hover:bg-[#eef0e9]"
    >
      Account
    </button>
  </div>
);

export const HeaderSection = (): JSX.Element => (
  <header className="flex h-[74px] items-center justify-between border-b border-[#d9ddd4] bg-[#f6f4ee] px-8">
    <BrandHeaderSection />
    <MainNavigationSection />
    <PrimaryNavigationSection />
  </header>
);

export const SiteHeaderSection = (): JSX.Element => (
  <div className="relative z-10 w-full">
    <HeaderSection />
  </div>
);

export const AppHeaderSection = (): JSX.Element => <HeaderSection />;

export const FamilyTreeHeadingSection = (): JSX.Element => (
  <div className="flex items-center justify-between">
    <div>
      <p className="mb-1 text-xs uppercase tracking-[0.18em] text-[#708074]">
        Family tree
      </p>
      <h1 className="[font-family:Georgia,serif] text-3xl text-[#283b30]">
        The Bennett family
      </h1>
    </div>
    <button
      type="button"
      className="rounded-md bg-[#283b30] px-4 py-2 text-sm text-white hover:bg-[#3c5545]"
    >
      Add person
    </button>
  </div>
);

export const FamilyTreeHeaderSection = (): JSX.Element => (
  <div className="border-b border-[#d9ddd4] px-8 py-6">
    <FamilyTreeHeadingSection />
  </div>
);

export const FamilyTreeToolbarSection = (): JSX.Element => (
  <div className="flex items-center gap-2 border-b border-[#d9ddd4] bg-[#f8f7f2] px-8 py-3">
    <button
      type="button"
      aria-label="Zoom out"
      className="h-8 w-8 rounded border border-[#c8cec5] text-lg text-[#405047]"
    >
      −
    </button>
    <span className="w-12 text-center text-xs text-[#708074]">100%</span>
    <button
      type="button"
      aria-label="Zoom in"
      className="h-8 w-8 rounded border border-[#c8cec5] text-lg text-[#405047]"
    >
      +
    </button>
    <span className="mx-2 h-5 w-px bg-[#d9ddd4]" />
    <button
      type="button"
      className="rounded border border-[#c8cec5] px-3 py-1.5 text-xs text-[#405047]"
    >
      Fit to screen
    </button>
    <button
      type="button"
      className="rounded border border-[#c8cec5] px-3 py-1.5 text-xs text-[#405047]"
    >
      Undo
    </button>
  </div>
);

export const FamilyTreeCanvasSection = (): JSX.Element => (
  <div
    id="tree"
    className="relative min-h-[700px] overflow-hidden bg-[#e9ebe4]"
    aria-label="Family tree canvas"
  >
    <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(#b8c0b5_1px,transparent_1px),linear-gradient(90deg,#b8c0b5_1px,transparent_1px)] [background-size:32px_32px]" />
    <div className="absolute left-[31%] top-[38%] h-px w-[38%] bg-[#809084]" />
    <div className="absolute left-[50%] top-[22%] h-[35%] w-px bg-[#809084]" />
    <div className="absolute left-[24%] top-[28%] rounded-lg border border-[#b9c5b8] bg-white px-5 py-4 shadow-sm">
      <p className="text-xs text-[#708074]">Father</p>
      <p className="mt-1 font-medium text-[#283b30]">William Bennett</p>
      <p className="mt-1 text-xs text-[#708074]">1919 – 1988</p>
    </div>
    <div className="absolute left-[47%] top-[48%] rounded-lg border-2 border-[#283b30] bg-[#fdfcf8] px-6 py-5 shadow-md">
      <p className="text-xs text-[#708074]">You</p>
      <p className="mt-1 font-medium text-[#283b30]">James Bennett</p>
      <p className="mt-1 text-xs text-[#708074]">1948 – 2021</p>
    </div>
    <div className="absolute left-[66%] top-[28%] rounded-lg border border-[#b9c5b8] bg-white px-5 py-4 shadow-sm">
      <p className="text-xs text-[#708074]">Mother</p>
      <p className="mt-1 font-medium text-[#283b30]">Mary Bennett</p>
      <p className="mt-1 text-xs text-[#708074]">1922 – 2004</p>
    </div>
  </div>
);

export const FamilyTreeBuilderSection = (): JSX.Element => (
  <section className="flex h-full flex-col">
    <FamilyTreeHeaderSection />
    <FamilyTreeToolbarSection />
    <FamilyTreeCanvasSection />
  </section>
);

export const FamilyTreeWorkspaceSection = (): JSX.Element => (
  <main
    id="family-tree"
    className="relative z-0 flex min-h-[1246px] flex-1 flex-col bg-[#e9ebe4]"
  >
    <FamilyTreeBuilderSection />
  </main>
);

export const FamilyTreeOverviewSection = (): JSX.Element => (
  <aside className="absolute left-8 top-[108px] z-10 w-[210px] rounded-lg border border-[#d4dacf] bg-[#fdfcf8] p-4 shadow-sm">
    <p className="mb-3 text-xs uppercase tracking-[0.14em] text-[#708074]">
      Overview
    </p>
    <div className="space-y-3">
      {familyMembers.slice(0, 3).map((member) => (
        <a
          key={member.id}
          href={`#${member.id}`}
          className="block text-sm text-[#405047] hover:text-[#283b30]"
        >
          <span className="block font-medium">{member.name}</span>
          <span className="text-xs text-[#879188]">{member.relation}</span>
        </a>
      ))}
    </div>
  </aside>
);

export const FamilyTreeAuthenticationSection = (): JSX.Element => (
  <section className="rounded-lg bg-[#f6f4ee] p-6 text-center">
    <h2 className="[font-family:Georgia,serif] text-2xl text-[#283b30]">
      Sign in to continue
    </h2>
    <p className="mt-2 text-sm text-[#708074]">
      Save your family tree and keep discovering your story.
    </p>
    <button
      type="button"
      className="mt-5 rounded-md bg-[#283b30] px-5 py-2 text-sm text-white"
    >
      Sign in
    </button>
  </section>
);

export const FamilyHistoryWelcomeAndSignInSection = (): JSX.Element => (
  <FamilyTreeAuthenticationSection />
);

export const GoogleAccountSelectionSection = (): JSX.Element => (
  <button
    type="button"
    className="flex w-full items-center justify-center gap-2 rounded-md border border-[#c8cec5] px-4 py-2 text-sm text-[#405047]"
  >
    <span className="font-bold text-[#4285f4]">G</span>
    Continue with Google
  </button>
);

export const AddPersonRequestModalSection = (): JSX.Element => (
  <div className="rounded-lg border border-[#d9ddd4] bg-[#f8f7f2] p-5">
    <h2 className="[font-family:Georgia,serif] text-xl text-[#283b30]">
      Request a person
    </h2>
    <p className="mt-1 text-sm text-[#708074]">
      Tell us who you would like to add to your tree.
    </p>
    <label
      className="mt-4 block text-xs font-medium text-[#405047]"
      htmlFor="person-name"
    >
      Name
    </label>
    <input
      id="person-name"
      type="text"
      className="mt-1 w-full rounded border border-[#c8cec5] bg-white px-3 py-2 text-sm"
      placeholder="Enter a name"
    />
    <button
      type="button"
      className="mt-4 rounded bg-[#283b30] px-4 py-2 text-sm text-white"
    >
      Send request
    </button>
  </div>
);

export const PersonDetailsDialogSection = ({
  onClose,
}: {
  onClose: () => void;
}): JSX.Element => {
  const [activeTab, setActiveTab] = useState<"profile" | "documents">(
    "profile",
  );

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="person-dialog-title"
      className="absolute left-1/2 top-[60px] z-30 h-[545px] w-[744px] -translate-x-1/2 overflow-hidden rounded-sm border border-[#b7b8b1] bg-[#fdfcf8] shadow-2xl"
    >
      <div className="flex items-start justify-between border-b border-[#d9ddd4] px-6 py-5">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#708074]">
            Person profile
          </p>
          <h2
            id="person-dialog-title"
            className="mt-1 [font-family:Georgia,serif] text-[30px] text-[#283b30]"
          >
            James Bennett
          </h2>
          <p className="mt-1 text-sm text-[#708074]">
            1948 – 2021 · Your family tree
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close person profile"
          className="text-2xl leading-none text-[#708074] hover:text-[#283b30]"
        >
          ×
        </button>
      </div>
      <div className="flex border-b border-[#d9ddd4] px-6">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`border-b-2 px-1 py-4 mr-6 text-sm ${activeTab === "profile" ? "border-[#283b30] text-[#283b30]" : "border-transparent text-[#879188]"}`}
        >
          Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("documents")}
          className={`border-b-2 px-1 py-4 text-sm ${activeTab === "documents" ? "border-[#283b30] text-[#283b30]" : "border-transparent text-[#879188]"}`}
        >
          Documents ({documents.length})
        </button>
      </div>
      {activeTab === "profile" ? (
        <div className="grid grid-cols-[150px_1fr] gap-7 px-6 py-7">
          <div className="flex h-[150px] items-center justify-center rounded bg-[#dfe5dc] text-5xl text-[#708074]">
            JB
          </div>
          <div>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-5 text-sm">
              <div>
                <dt className="text-xs text-[#879188]">Full name</dt>
                <dd className="mt-1 text-[#283b30]">James William Bennett</dd>
              </div>
              <div>
                <dt className="text-xs text-[#879188]">Gender</dt>
                <dd className="mt-1 text-[#283b30]">Male</dd>
              </div>
              <div>
                <dt className="text-xs text-[#879188]">Birthplace</dt>
                <dd className="mt-1 text-[#283b30]">Boston, Massachusetts</dd>
              </div>
              <div>
                <dt className="text-xs text-[#879188]">Relationship</dt>
                <dd className="mt-1 text-[#283b30]">Self</dd>
              </div>
            </dl>
            <button
              type="button"
              className="mt-8 rounded border border-[#aeb9ad] px-4 py-2 text-sm text-[#405047] hover:bg-[#eef0e9]"
            >
              Edit profile
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 px-6 py-6">
          {documents.map((document) => (
            <article
              key={document.id}
              className="flex items-center justify-between rounded border border-[#d9ddd4] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded bg-[#e4e9e1] text-xs text-[#405047]">
                  ▧
                </span>
                <div>
                  <h3 className="text-sm text-[#283b30]">{document.title}</h3>
                  <p className="mt-1 text-xs text-[#879188]">{document.meta}</p>
                </div>
              </div>
              <span className="text-[10px] tracking-wider text-[#879188]">
                {document.type}
              </span>
            </article>
          ))}
        </div>
      )}
      <div className="absolute bottom-0 flex w-full justify-between border-t border-[#d9ddd4] px-6 py-4">
        <button type="button" className="text-sm text-[#9a5c4d]">
          Remove from tree
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-[#aeb9ad] px-4 py-2 text-sm text-[#405047]"
        >
          Done
        </button>
      </div>
    </section>
  );
};

export const PersonProfileAndDocumentsSection = (): JSX.Element => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="absolute right-8 top-24 z-20 rounded bg-[#283b30] px-4 py-2 text-sm text-white"
      >
        Open profile
      </button>
    );
  }

  return (
    <>
      <div
        className="absolute inset-0 z-20 bg-[#283b30]/[0.28]"
        aria-hidden="true"
      />
      <PersonDetailsDialogSection onClose={() => setIsOpen(false)} />
    </>
  );
};

export const SiteFooterSection = (): JSX.Element => (
  <footer className="border-t border-[#d9ddd4] bg-[#f6f4ee] px-8 py-6 text-xs text-[#879188]">
    <span>© 2024 Roots</span>
  </footer>
);

export const FooterSection = (): JSX.Element => <SiteFooterSection />;

export const RootsJamesBennettScreen = (): JSX.Element => (
  <div
    className="relative flex min-h-screen flex-col bg-[#f6f4ee]"
    data-model-id="21:160"
  >
    <SiteHeaderSection />
    <FamilyTreeOverviewSection />
    <FamilyTreeWorkspaceSection />
    <SiteFooterSection />
    <PersonProfileAndDocumentsSection />
  </div>
);
