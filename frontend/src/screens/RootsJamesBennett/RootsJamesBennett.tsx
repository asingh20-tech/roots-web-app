import { useMemo, useState } from "react";

type Person = {
  id: string;
  name: string;
  birth: string;
  death?: string;
  relationship: string;
  x: number;
  y: number;
};

const people: Person[] = [
  {
    id: "james-bennett",
    name: "James Bennett",
    birth: "1842",
    death: "1914",
    relationship: "You",
    x: 730,
    y: 270,
  },
  {
    id: "mary-bennett",
    name: "Mary Bennett",
    birth: "1848",
    death: "1922",
    relationship: "Wife",
    x: 930,
    y: 270,
  },
  {
    id: "william-bennett",
    name: "William Bennett",
    birth: "1815",
    death: "1887",
    relationship: "Father",
    x: 530,
    y: 105,
  },
  {
    id: "elizabeth-bennett",
    name: "Elizabeth Bennett",
    birth: "1818",
    death: "1890",
    relationship: "Mother",
    x: 730,
    y: 105,
  },
  {
    id: "robert-bennett",
    name: "Robert Bennett",
    birth: "1870",
    death: "1941",
    relationship: "Son",
    x: 830,
    y: 465,
  },
];

const navigationItems = ["Tree", "Discover", "Memories", "Gallery"];

const Icon = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}): JSX.Element => (
  <span
    aria-label={label}
    role="img"
    className="inline-flex h-5 w-5 items-center justify-center"
  >
    {children}
  </span>
);

export const PrimaryNavigationSection = (): JSX.Element => {
  const [activeItem, setActiveItem] = useState("Tree");

  return (
    <header
      className="flex h-[72px] w-full items-center justify-between border-b border-[#dedbd2] bg-[#fffdf8] px-8"
      data-model-id="primary-navigation"
    >
      <a
        href="#family-tree"
        className="flex items-center gap-3"
        aria-label="Roots home"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#283b30] text-xl text-white">
          ✦
        </span>
        <span className="font-serif text-[25px] font-semibold tracking-[-0.02em] text-[#283b30]">
          roots
        </span>
      </a>
      <nav aria-label="Primary navigation">
        <ul className="flex items-center gap-8">
          {navigationItems.map((item) => (
            <li key={item}>
              <button
                type="button"
                onClick={() => setActiveItem(item)}
                className={`border-b-2 px-1 py-6 text-sm font-medium transition-colors ${
                  activeItem === item
                    ? "border-[#283b30] text-[#283b30]"
                    : "border-transparent text-[#77766f] hover:text-[#283b30]"
                }`}
                aria-current={activeItem === item ? "page" : undefined}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex items-center gap-5">
        <button
          type="button"
          className="rounded-full p-2 text-[#53574f] hover:bg-[#f0eee8]"
          aria-label="Search"
        >
          <Icon label="Search">⌕</Icon>
        </button>
        <button
          type="button"
          className="rounded-full p-2 text-[#53574f] hover:bg-[#f0eee8]"
          aria-label="Notifications"
        >
          <Icon label="Notifications">♧</Icon>
        </button>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d4a373] text-sm font-semibold text-white"
          aria-label="Open account menu"
        >
          JB
        </button>
      </div>
    </header>
  );
};

export const FamilyTreeHeadingSection = (): JSX.Element => (
  <section
    className="flex h-[102px] items-center justify-between border-b border-[#e2dfd6] bg-[#f6f4ee] px-10"
    aria-labelledby="tree-heading"
  >
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#89877e]">
        James Bennett family
      </p>
      <h1
        id="tree-heading"
        className="font-serif text-[32px] font-semibold text-[#283b30]"
      >
        Family tree
      </h1>
    </div>
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="rounded-md border border-[#c9c6bc] bg-white px-4 py-2 text-sm font-medium text-[#414840] hover:bg-[#f6f4ee]"
      >
        Share tree
      </button>
      <button
        type="button"
        className="rounded-md bg-[#283b30] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d2e24]"
      >
        Add person
      </button>
    </div>
  </section>
);

export const FamilyTreeToolbarSection = (): JSX.Element => {
  const [view, setView] = useState("Tree view");

  return (
    <section
      className="flex h-[56px] items-center justify-between border-b border-[#dedbd2] bg-white px-10"
      aria-label="Family tree tools"
    >
      <div className="flex items-center gap-1 rounded-md border border-[#d9d6cd] p-1">
        {["Tree view", "Timeline"].map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => setView(item)}
            className={`rounded px-3 py-1.5 text-xs font-medium ${
              view === item ? "bg-[#e9eee8] text-[#283b30]" : "text-[#7c7d76]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-2 rounded-md border border-[#d9d6cd] px-3 py-2 text-xs text-[#555950]"
        >
          <span aria-hidden="true">⌕</span>
          Find person
        </button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[#d9d6cd] text-lg text-[#555950]"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[#d9d6cd] text-lg text-[#555950]"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          className="ml-2 rounded-md px-2 py-2 text-xs text-[#777970] hover:bg-[#f4f2ec]"
        >
          Fit to screen
        </button>
      </div>
    </section>
  );
};

export const FamilyTreeCanvasSection = (): JSX.Element => {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  return (
    <section
      id="family-tree"
      className="relative flex-1 overflow-hidden bg-[#f6f4ee]"
      aria-label="Interactive family tree"
      data-model-id="family-tree-canvas"
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(#c9c8bf 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
        viewBox="0 0 1600 1090"
        preserveAspectRatio="none"
      >
        <path
          d="M820 330 V405 H630 V465"
          fill="none"
          stroke="#b6b8ad"
          strokeWidth="2"
        />
        <path
          d="M820 330 V405 H1030 V465"
          fill="none"
          stroke="#b6b8ad"
          strokeWidth="2"
        />
        <path
          d="M620 165 V220 H780 V270"
          fill="none"
          stroke="#b6b8ad"
          strokeWidth="2"
        />
        <path d="M820 165 V270" fill="none" stroke="#b6b8ad" strokeWidth="2" />
        <path d="M820 330 H1020" fill="none" stroke="#b6b8ad" strokeWidth="2" />
      </svg>
      {people.map((person) => (
        <button
          type="button"
          key={person.id}
          onClick={() => setSelectedPerson(person)}
          className={`absolute w-[180px] -translate-x-1/2 rounded-lg border bg-white p-4 text-left shadow-[0_3px_12px_rgba(40,59,48,0.08)] transition hover:-translate-y-1 hover:shadow-lg ${
            selectedPerson?.id === person.id
              ? "border-[#283b30] ring-2 ring-[#cbd8ca]"
              : "border-[#dedbd2]"
          }`}
          style={{ left: person.x, top: person.y }}
          aria-label={`Open details for ${person.name}`}
        >
          <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#d9e3d6] text-sm font-semibold text-[#416044]"></span>
          <strong className="block text-sm font-semibold text-[#283b30]">
            {person.name}
          </strong>
          <span className="mt-1 block text-xs text-[#777970]">
            {person.birth}–{person.death ?? "present"}
          </span>
          <span className="mt-2 block text-[11px] uppercase tracking-wider text-[#a09e94]">
            {person.relationship}
          </span>
        </button>
      ))}

      <div className="absolute bottom-7 left-8 rounded-md border border-[#dedbd2] bg-white px-4 py-3 text-xs text-[#777970] shadow-sm">
        <span className="font-medium text-[#283b30]">Tip:</span> Select a person
        to view their details
      </div>
      {selectedPerson && (
        <PersonDetailsDialogSection
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </section>
  );
};

export const PersonDetailsDialogSection = ({
  person,
  onClose,
}: {
  person: Person;
  onClose: () => void;
}): JSX.Element => {
  const initials = useMemo(
    () =>
      person.name
        .split(" ")
        .map((part) => part[0])
        .join(""),
    [person.name],
  );

  return (
    <aside
      className="absolute right-8 top-8 z-10 w-[320px] rounded-xl border border-[#dedbd2] bg-white p-6 shadow-[0_12px_35px_rgba(40,59,48,0.16)]"
      role="dialog"
      aria-modal="false"
      aria-labelledby="person-dialog-title"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d9e3d6] font-semibold text-[#416044]">
          {initials}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-xl leading-none text-[#777970] hover:bg-[#f3f1eb]"
          aria-label="Close person details"
        >
          ×
        </button>
      </div>
      <h2
        id="person-dialog-title"
        className="mt-4 font-serif text-2xl font-semibold text-[#283b30]"
      >
        {person.name}
      </h2>
      <p className="mt-1 text-sm text-[#777970]">
        {person.birth}–{person.death ?? "present"} · {person.relationship}
      </p>
      <div className="my-5 border-t border-[#ebe8df]" />
      <dl className="space-y-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wider text-[#a09e94]">
            Life events
          </dt>
          <dd className="mt-1 text-[#535950]">
            Birth records and family memories
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-[#a09e94]">
            Documents
          </dt>
          <dd className="mt-1 text-[#535950]">No documents added yet</dd>
        </div>
      </dl>
      <button
        type="button"
        className="mt-6 w-full rounded-md bg-[#283b30] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1d2e24]"
      >
        View full profile
      </button>
    </aside>
  );
};

export const RootsJamesBennett = (): JSX.Element => {
  return (
    <main
      className="flex min-h-screen items-start justify-center overflow-auto bg-[#f6f4ee]"
      data-model-id="29:1967"
    >
      <div className="relative flex h-[1320px] w-[1600px] min-w-[1000px] flex-col overflow-hidden bg-[#f6f4ee]">
        <PrimaryNavigationSection />
        <FamilyTreeHeadingSection />
        <FamilyTreeToolbarSection />
        <FamilyTreeCanvasSection />
      </div>
    </main>
  );
};
