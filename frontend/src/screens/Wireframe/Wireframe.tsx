import { useState } from "react";

type Person = {
  id: string;
  name: string;
  relation: string;
  birth?: string;
  avatar: string;
};

const people: Person[] = [
  {
    id: "you",
    name: "You",
    relation: "You",
    birth: "1990",
    avatar: "YO",
  },
  {
    id: "mother",
    name: "Sarah Anderson",
    relation: "Mother",
    birth: "1962",
    avatar: "SA",
  },
  {
    id: "father",
    name: "Michael Anderson",
    relation: "Father",
    birth: "1959",
    avatar: "MA",
  },
  {
    id: "grandmother",
    name: "Eleanor Wilson",
    relation: "Grandmother",
    birth: "1935",
    avatar: "EW",
  },
  {
    id: "grandfather",
    name: "Robert Wilson",
    relation: "Grandfather",
    birth: "1932",
    avatar: "RW",
  },
];

const navigationItems = ["Family Tree", "Timeline", "Places", "Stories"];

const Icon = ({
  name,
  size = 18,
}: {
  name:
    | "search"
    | "bell"
    | "settings"
    | "plus"
    | "chevron"
    | "close"
    | "user"
    | "folder"
    | "share"
    | "zoomIn"
    | "zoomOut"
    | "fit"
    | "menu";
  size?: number;
}) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "search") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </svg>
    );
  }

  if (name === "bell") {
    return (
      <svg {...common}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.6h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.6v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.6H21a1.7 1.7 0 0 0-1.6 1Z" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg {...common}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }

  if (name === "chevron") {
    return (
      <svg {...common}>
        <path d="m7 10 5 5 5-5" />
      </svg>
    );
  }

  if (name === "close") {
    return (
      <svg {...common}>
        <path d="m6 6 12 12M18 6 6 18" />
      </svg>
    );
  }

  if (name === "user") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c.6-3.4 3-5 7-5s6.4 1.6 7 5" />
      </svg>
    );
  }

  if (name === "folder") {
    return (
      <svg {...common}>
        <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H10l2 2h7.5A1.5 1.5 0 0 1 21 9.5v8A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5Z" />
      </svg>
    );
  }

  if (name === "share") {
    return (
      <svg {...common}>
        <circle cx="18" cy="5" r="2.5" />
        <circle cx="6" cy="12" r="2.5" />
        <circle cx="18" cy="19" r="2.5" />
        <path d="m8.3 10.8 7.4-4.6M8.3 13.2l7.4 4.6" />
      </svg>
    );
  }

  if (name === "zoomIn") {
    return (
      <svg {...common}>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="M10.5 7.5v6M7.5 10.5h6M16 16l4 4" />
      </svg>
    );
  }

  if (name === "zoomOut") {
    return (
      <svg {...common}>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="M7.5 10.5h6M16 16l4 4" />
      </svg>
    );
  }

  if (name === "fit") {
    return (
      <svg {...common}>
        <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
};

const BrandHeaderSection = () => (
  <a href="#" className="flex items-center gap-2.5" aria-label="Kinship home">
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#253d35] text-[16px] font-semibold text-[#f5f0e8]">
      K
    </span>
    <span className="text-[22px] font-semibold tracking-[-0.03em] text-[#253d35]">
      kinship
    </span>
  </a>
);

const PrimaryNavigationSection = () => (
  <nav
    className="hidden items-center gap-8 md:flex"
    aria-label="Primary navigation"
  >
    {navigationItems.map((item, index) => (
      <a
        href={`#${item.toLowerCase().replace(" ", "-")}`}
        className={`text-[14px] transition-colors ${
          index === 0
            ? "font-semibold text-[#253d35]"
            : "text-[#6f756c] hover:text-[#253d35]"
        }`}
        key={item}
      >
        {item}
      </a>
    ))}
  </nav>
);

const SiteHeaderSection = ({ onAddPerson }: { onAddPerson: () => void }) => (
  <header className="border-b border-[#dedbd3] bg-[#f5f0e8]">
    <div className="mx-auto flex h-[88px] max-w-[1440px] items-center justify-between px-8 lg:px-14">
      <BrandHeaderSection />
      <PrimaryNavigationSection />
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="hidden rounded-full p-2 text-[#687066] hover:bg-[#eae5dc] sm:block"
          aria-label="Search"
        >
          <Icon name="search" />
        </button>
        <button
          type="button"
          className="hidden rounded-full p-2 text-[#687066] hover:bg-[#eae5dc] sm:block"
          aria-label="Notifications"
        >
          <Icon name="bell" />
        </button>
        <button
          type="button"
          onClick={onAddPerson}
          className="flex items-center gap-2 rounded-full bg-[#253d35] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#38594d]"
        >
          <Icon name="plus" size={16} />
          Add person
        </button>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d7a98b] text-[12px] font-semibold text-[#573c30]"
          aria-label="Open profile menu"
        >
          AJ
        </button>
      </div>
    </div>
  </header>
);

const FamilyTreeHeaderSection = ({
  onAddPerson,
}: {
  onAddPerson: () => void;
}) => (
  <div className="flex items-center justify-between border-b border-[#dedbd3] px-8 py-5 lg:px-14">
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b9186]">
        My family
      </p>
      <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-[#253d35]">
        Anderson Family Tree
      </h1>
    </div>
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="hidden items-center gap-2 rounded-lg border border-[#d7d5cc] px-3.5 py-2 text-[13px] font-medium text-[#596159] hover:bg-[#ece8df] sm:flex"
      >
        <Icon name="share" size={16} />
        Share tree
      </button>
      <button
        type="button"
        onClick={onAddPerson}
        className="flex items-center gap-2 rounded-lg bg-[#d27d5c] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[#b96a4e]"
      >
        <Icon name="plus" size={16} />
        Add person
      </button>
    </div>
  </div>
);

const FamilyTreeToolbarSection = () => (
  <div className="absolute bottom-6 left-6 flex items-center gap-1 rounded-xl border border-[#d9d6cd] bg-[#fdfcf9] p-1 shadow-sm">
    <button
      type="button"
      className="rounded-lg p-2 text-[#657068] hover:bg-[#f0ede6]"
      aria-label="Zoom in"
    >
      <Icon name="zoomIn" size={17} />
    </button>
    <button
      type="button"
      className="rounded-lg p-2 text-[#657068] hover:bg-[#f0ede6]"
      aria-label="Zoom out"
    >
      <Icon name="zoomOut" size={17} />
    </button>
    <span className="mx-1 h-5 w-px bg-[#dedbd3]" />
    <button
      type="button"
      className="rounded-lg p-2 text-[#657068] hover:bg-[#f0ede6]"
      aria-label="Fit tree to screen"
    >
      <Icon name="fit" size={17} />
    </button>
  </div>
);

const PersonProfileAndDocumentsSection = ({
  person,
  onClose,
}: {
  person: Person;
  onClose: () => void;
}) => (
  <aside className="absolute right-0 top-0 z-10 h-full w-[300px] border-l border-[#dedbd3] bg-[#fdfcf9] p-6 shadow-[-8px_0_24px_rgba(37,61,53,0.05)]">
    <div className="mb-7 flex items-center justify-between">
      <h2 className="text-[17px] font-semibold text-[#253d35]">
        Person details
      </h2>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full p-1.5 text-[#747b72] hover:bg-[#eeeae2]"
        aria-label="Close details"
      >
        <Icon name="close" size={18} />
      </button>
    </div>
    <div className="mb-6 text-center">
      <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-[#d7a98b] text-[22px] font-semibold text-[#573c30]">
        {person.avatar}
      </div>
      <h3 className="text-[20px] font-semibold text-[#253d35]">
        {person.name}
      </h3>
      <p className="mt-1 text-[13px] text-[#81877e]">{person.relation}</p>
    </div>
    <dl className="space-y-4 border-y border-[#e7e3da] py-5 text-[13px]">
      <div className="flex justify-between">
        <dt className="text-[#8a9088]">Birth year</dt>
        <dd className="font-medium text-[#3e5047]">
          {person.birth ?? "Not added"}
        </dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-[#8a9088]">Documents</dt>
        <dd className="font-medium text-[#3e5047]">0 documents</dd>
      </div>
    </dl>
    <button
      type="button"
      className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#d9d6cd] py-2.5 text-[13px] font-semibold text-[#536157] hover:bg-[#f0ede6]"
    >
      <Icon name="folder" size={16} />
      Add document
    </button>
  </aside>
);

const FamilyTreeCanvasSection = ({
  selectedPerson,
  onSelect,
}: {
  selectedPerson: string | null;
  onSelect: (person: Person) => void;
}) => {
  const getPerson = (id: string) =>
    people.find((person) => person.id === id) as Person;

  return (
    <div className="relative min-h-[430px] flex-1 overflow-hidden bg-[#f8f6f0]">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(#c9c9bf 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path
          d="M50% 20% V35% M28% 35% H72% M28% 35% V49% M72% 35% V49%"
          stroke="#c6c5bb"
          strokeWidth="2"
          fill="none"
        />
        <path d="M50% 35% V55%" stroke="#c6c5bb" strokeWidth="2" fill="none" />
      </svg>
      <div className="absolute left-1/2 top-[53%] -translate-x-1/2 -translate-y-1/2">
        <TreePersonCard
          person={getPerson("you")}
          selected={selectedPerson === "you"}
          onSelect={onSelect}
          primary
        />
      </div>
      <div className="absolute left-[28%] top-[30%] -translate-x-1/2 -translate-y-1/2">
        <TreePersonCard
          person={getPerson("mother")}
          selected={selectedPerson === "mother"}
          onSelect={onSelect}
        />
      </div>
      <div className="absolute left-[72%] top-[30%] -translate-x-1/2 -translate-y-1/2">
        <TreePersonCard
          person={getPerson("father")}
          selected={selectedPerson === "father"}
          onSelect={onSelect}
        />
      </div>
      <div className="absolute left-[39%] top-[14%] -translate-x-1/2 -translate-y-1/2">
        <TreePersonCard
          person={getPerson("grandmother")}
          selected={selectedPerson === "grandmother"}
          onSelect={onSelect}
          compact
        />
      </div>
      <div className="absolute left-[61%] top-[14%] -translate-x-1/2 -translate-y-1/2">
        <TreePersonCard
          person={getPerson("grandfather")}
          selected={selectedPerson === "grandfather"}
          onSelect={onSelect}
          compact
        />
      </div>
      <FamilyTreeToolbarSection />
    </div>
  );
};

const TreePersonCard = ({
  person,
  selected,
  onSelect,
  primary = false,
  compact = false,
}: {
  person: Person;
  selected: boolean;
  onSelect: (person: Person) => void;
  primary?: boolean;
  compact?: boolean;
}) => (
  <button
    type="button"
    onClick={() => onSelect(person)}
    className={`relative flex items-center gap-3 rounded-xl border bg-[#fdfcf9] text-left shadow-[0_3px_12px_rgba(37,61,53,0.07)] transition hover:-translate-y-0.5 ${
      compact ? "w-[160px] p-2.5" : "w-[190px] p-3"
    } ${selected ? "border-[#d27d5c] ring-2 ring-[#d27d5c]/20" : "border-[#dedbd3]"} ${
      primary ? "bg-[#fffaf3]" : ""
    }`}
  >
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-[#d7a98b] font-semibold text-[#573c30] ${compact ? "h-8 w-8 text-[10px]" : "h-10 w-10 text-[11px]"}`}
    >
      {person.avatar}
    </span>
    <span className="min-w-0">
      <strong
        className={`block truncate font-semibold text-[#30483e] ${compact ? "text-[11px]" : "text-[12px]"}`}
      >
        {person.name}
      </strong>
      <span className="mt-0.5 block text-[10px] text-[#8b9188]">
        {person.relation} {person.birth ? `· ${person.birth}` : ""}
      </span>
    </span>
  </button>
);

const FamilyTreeWorkspaceSection = ({
  selectedPerson,
  onSelect,
  onAddPerson,
}: {
  selectedPerson: string | null;
  onSelect: (person: Person) => void;
  onAddPerson: () => void;
}) => (
  <section className="mx-auto flex max-w-[1440px] flex-col px-8 pb-10 lg:px-14">
    <FamilyTreeHeaderSection onAddPerson={onAddPerson} />
    <div className="flex min-h-[430px] overflow-hidden rounded-b-xl border border-t-0 border-[#dedbd3] bg-[#f8f6f0]">
      <FamilyTreeCanvasSection
        selectedPerson={selectedPerson}
        onSelect={onSelect}
      />
      {selectedPerson && (
        <PersonProfileAndDocumentsSection
          person={
            people.find((person) => person.id === selectedPerson) as Person
          }
          onClose={() => onSelect({ ...people[0], id: "" })}
        />
      )}
    </div>
  </section>
);

const FamilyTreeOverviewSection = () => (
  <div className="hidden items-center gap-8 text-[12px] text-[#7f877d] lg:flex">
    <span>
      <strong className="text-[#3f5148]">5</strong> people
    </span>
    <span>
      <strong className="text-[#3f5148]">3</strong> generations
    </span>
  </div>
);

const AppHeaderSection = () => (
  <div className="sr-only">Kinship family history workspace</div>
);
const _MainNavigationSection = () => null;
const FamilyTreeHeadingSection = () => <FamilyTreeOverviewSection />;
const _FamilyTreeAuthenticationSection = () => null;
const _GoogleAccountSelectionSection = () => null;
const _FamilyTreeWorkspaceAuthenticationSection = () => null;
const AddPersonRequestModalSection = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [name, setName] = useState("");
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-[#253d35]/25 px-4"
      role="presentation"
    >
      <div
        className="w-full max-w-[420px] rounded-2xl bg-[#fdfcf9] p-7 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-person-title"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2
              id="add-person-title"
              className="text-[21px] font-semibold text-[#253d35]"
            >
              Add a person
            </h2>
            <p className="mt-1 text-[13px] text-[#82887f]">
              Grow your family tree with someone special.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-[#747b72] hover:bg-[#eeeae2]"
            aria-label="Close dialog"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        <label
          htmlFor="person-name"
          className="mb-2 block text-[12px] font-semibold text-[#536157]"
        >
          Full name
        </label>
        <input
          id="person-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter their name"
          className="w-full rounded-lg border border-[#d9d6cd] bg-white px-3.5 py-3 text-[14px] text-[#253d35] placeholder:text-[#a3a69e] focus:border-[#d27d5c] focus:ring-2 focus:ring-[#d27d5c]/20"
        />
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2.5 text-[13px] font-semibold text-[#687168] hover:bg-[#eeeae2]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={!name.trim()}
            className="rounded-lg bg-[#253d35] px-4 py-2.5 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add person
          </button>
        </div>
      </div>
    </div>
  );
};

const _FamilyHistoryWelcomeAndSignInSection = () => null;
const _PersonDetailsDialogSection = () => null;
const FamilyTreeBuilderSection = ({
  selectedPerson,
  onSelect,
  onAddPerson,
}: {
  selectedPerson: string | null;
  onSelect: (person: Person) => void;
  onAddPerson: () => void;
}) => (
  <main>
    <div className="mx-auto flex max-w-[1440px] items-center justify-between px-8 pt-7 lg:px-14">
      <FamilyTreeHeadingSection />
      <FamilyTreeOverviewSection />
    </div>
    <FamilyTreeWorkspaceSection
      selectedPerson={selectedPerson}
      onSelect={onSelect}
      onAddPerson={onAddPerson}
    />
  </main>
);

const SiteFooterSection = () => (
  <footer className="border-t border-[#dedbd3] bg-[#f5f0e8]">
    <div className="mx-auto flex max-w-[1440px] items-center justify-between px-8 py-5 text-[12px] text-[#8a9088] lg:px-14">
      <span>© 2024 Kinship</span>
      <div className="flex gap-5">
        <a href="#privacy" className="hover:text-[#253d35]">
          Privacy
        </a>
        <a href="#help" className="hover:text-[#253d35]">
          Help center
        </a>
      </div>
    </div>
  </footer>
);

const FooterSection = () => <SiteFooterSection />;

const HeaderSection = ({ onAddPerson }: { onAddPerson: () => void }) => (
  <>
    <AppHeaderSection />
    <SiteHeaderSection onAddPerson={onAddPerson} />
  </>
);

export const Wireframe = (): JSX.Element => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person.id || null);
  };

  return (
    <div
      className="min-h-screen w-full min-w-[320px] bg-[#f5f0e8] text-[#253d35]"
      data-model-id="72:2"
    >
      <HeaderSection onAddPerson={() => setModalOpen(true)} />
      <FamilyTreeBuilderSection
        selectedPerson={selectedPerson}
        onSelect={handleSelectPerson}
        onAddPerson={() => setModalOpen(true)}
      />
      <FooterSection />
      <AddPersonRequestModalSection
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};
