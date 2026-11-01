import { useState } from "react";

type GoogleAccount = {
  name: string;
  email: string;
  initials: string;
  color: string;
};

const googleAccounts: GoogleAccount[] = [
  {
    name: "Alex Johnson",
    email: "alex.johnson@gmail.com",
    initials: "AJ",
    color: "#4285f4",
  },
  {
    name: "Taylor Morgan",
    email: "taylor.morgan@gmail.com",
    initials: "TM",
    color: "#34a853",
  },
];

const Icon = ({
  name,
  size = 24,
}: {
  name: "google" | "close" | "arrow" | "lock" | "chevron";
  size?: number;
}): JSX.Element => {
  if (name === "google") {
    return (
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M21.805 12.23c0-.79-.07-1.55-.225-2.28H12v4.315h5.49a4.69 4.69 0 0 1-2.037 3.078v2.56h3.293c1.928-1.775 3.059-4.394 3.059-7.673Z"
          fill="#4285F4"
        />
        <path
          d="M12 22c2.755 0 5.064-.913 6.752-2.477l-3.293-2.56c-.914.612-2.08.974-3.459.974-2.66 0-4.915-1.797-5.724-4.212H2.872v2.642A10.2 10.2 0 0 0 12 22Z"
          fill="#34A853"
        />
        <path
          d="M6.276 13.725A6.14 6.14 0 0 1 5.955 12c0-.6.11-1.184.321-1.725V7.633H2.872A10.2 10.2 0 0 0 1.8 12c0 1.407.338 2.737 1.072 4.367l3.404-2.642Z"
          fill="#FBBC05"
        />
        <path
          d="M12 6.063c1.5 0 2.847.516 3.907 1.53l2.93-2.93C17.06 3.017 14.75 2 12 2a10.2 10.2 0 0 0-9.128 5.633l3.404 2.642C7.085 7.86 9.34 6.063 12 6.063Z"
          fill="#EA4335"
        />
      </svg>
    );
  }

  if (name === "close") {
    return (
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="m6 6 12 12M18 6 6 18" />
      </svg>
    );
  }

  if (name === "arrow") {
    return (
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    );
  }

  if (name === "lock") {
    return (
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
};

export const BrandHeaderSection = (): JSX.Element => (
  <header className="flex h-[156px] w-full items-center justify-center border-b border-[#d9d0c3] bg-[#f5f0e8]">
    <a
      href="/"
      aria-label="Roots home"
      className="font-serif text-[40px] tracking-[-1.5px] text-[#263329]"
    >
      Roots
    </a>
  </header>
);

export const SiteHeaderSection = (): JSX.Element => (
  <header className="flex h-20 w-full items-center justify-between px-8">
    <span className="font-serif text-3xl text-[#263329]">Roots</span>
    <nav aria-label="Site navigation" className="flex items-center gap-6">
      <a href="/about" className="text-sm text-[#4c574c]">
        About
      </a>
      <a href="/help" className="text-sm text-[#4c574c]">
        Help
      </a>
    </nav>
  </header>
);

export const MainNavigationSection = (): JSX.Element => (
  <nav aria-label="Main navigation" className="flex items-center gap-6">
    <a href="/family-tree">Family tree</a>
    <a href="/stories">Stories</a>
  </nav>
);

export const PrimaryNavigationSection = (): JSX.Element => (
  <nav aria-label="Primary navigation" className="flex items-center gap-5">
    <a href="/sign-in" className="text-sm text-[#263329]">
      Sign in
    </a>
    <a
      href="/get-started"
      className="rounded-full bg-[#263329] px-5 py-3 text-sm text-white"
    >
      Get started
    </a>
  </nav>
);

export const FamilyHistoryWelcomeAndSignInSection = (): JSX.Element => (
  <main className="flex min-h-[543px] w-full flex-1 items-center justify-center bg-[#f5f0e8]">
    <section className="flex max-w-[590px] flex-col items-center px-6 text-center">
      <p className="mb-5 text-xs font-semibold uppercase tracking-[2.5px] text-[#697368]">
        Your family story starts here
      </p>
      <h1 className="font-serif text-[52px] leading-[1.05] tracking-[-1px] text-[#263329]">
        Discover your family history
      </h1>
      <p className="mt-6 max-w-[450px] text-[17px] leading-7 text-[#586258]">
        Build your family tree, preserve your memories, and connect with the
        people who came before you.
      </p>
      <button
        type="button"
        className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#263329] px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-[#3c4b3e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#263329]"
      >
        Continue with Google
        <Icon name="arrow" size={17} />
      </button>
    </section>
  </main>
);

export const SiteFooterSection = (): JSX.Element => (
  <footer className="flex min-h-[56px] w-full items-center justify-center border-t border-[#d9d0c3] bg-[#f5f0e8] px-6 text-center">
    <p className="text-xs text-[#697368]">
      © 2024 Roots · Built for the stories that make us who we are
    </p>
  </footer>
);

export const FooterSection = (): JSX.Element => (
  <footer className="flex items-center justify-between px-8 py-6 text-sm text-[#697368]">
    <span>© 2024 Roots</span>
    <div className="flex gap-5">
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
    </div>
  </footer>
);

export const GoogleAccountSelectionSection = (): JSX.Element => {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return <></>;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#18201966] px-4 pt-[158px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setIsOpen(false);
        }
      }}
    >
      <section
        aria-labelledby="google-account-title"
        aria-modal="true"
        className="relative w-full max-w-[400px] overflow-hidden rounded-[3px] bg-white shadow-[0_12px_35px_rgba(24,32,25,0.2)]"
        role="dialog"
      >
        <button
          type="button"
          aria-label="Close account selection"
          className="absolute right-4 top-4 z-10 rounded-full p-1 text-[#59635b] transition-colors hover:bg-[#f0f2ef] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#263329]"
          onClick={() => setIsOpen(false)}
        >
          <Icon name="close" size={21} />
        </button>
        <div className="border-b border-[#e3e6e3] px-8 pb-6 pt-8">
          <div className="mb-5 flex items-center gap-3">
            <Icon name="google" size={25} />
            <span className="text-[15px] font-medium text-[#3c4043]">
              Sign in with Google
            </span>
          </div>
          <h2
            id="google-account-title"
            className="text-[21px] font-normal leading-7 text-[#202124]"
          >
            Choose an account
          </h2>
          <p className="mt-2 text-sm leading-5 text-[#5f6368]">
            to continue to Roots
          </p>
        </div>
        <div className="px-3 py-3">
          <ul aria-label="Google accounts" className="m-0 list-none p-0">
            {googleAccounts.map((account) => {
              const isSelected = selectedAccount === account.email;

              return (
                <li key={account.email}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    className={`flex w-full items-center gap-3 rounded-md px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#4285f4] ${
                      isSelected ? "bg-[#e8f0fe]" : "hover:bg-[#f5f7f8]"
                    }`}
                    onClick={() => setSelectedAccount(account.email)}
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: account.color }}
                    >
                      {account.initials}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-[#3c4043]">
                        {account.name}
                      </span>
                      <span className="block truncate text-[13px] text-[#5f6368]">
                        {account.email}
                      </span>
                    </span>
                    {isSelected ? (
                      <span className="ml-auto text-xs font-medium text-[#1a73e8]">
                        Selected
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            className="mt-2 flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm text-[#3c4043] transition-colors hover:bg-[#f5f7f8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#4285f4]"
            onClick={() => setSelectedAccount(null)}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dadce0] text-[#5f6368]">
              <span className="text-xl leading-none">+</span>
            </span>
            Use another account
          </button>
        </div>
        <div className="flex items-center gap-2 border-t border-[#e3e6e3] px-8 py-5 text-xs leading-5 text-[#5f6368]">
          <Icon name="lock" size={15} />
          <span>You'll be securely redirected to Google to sign in.</span>
        </div>
        <div className="flex justify-end gap-3 bg-[#f8f9fa] px-8 py-4">
          <button
            type="button"
            className="rounded-md px-4 py-2 text-sm font-medium text-[#1a73e8] hover:bg-[#e8f0fe] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a73e8]"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedAccount}
            className="rounded-md bg-[#1a73e8] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1769d1] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a73e8]"
            onClick={() => setIsOpen(false)}
          >
            Continue
          </button>
        </div>
      </section>
    </div>
  );
};

export const AddPersonRequestModalSection = (): JSX.Element => (
  <section aria-label="Add person request" className="hidden">
    Add a person to your family tree
  </section>
);

export const PersonProfileAndDocumentsSection = (): JSX.Element => (
  <section aria-label="Person profile and documents" className="hidden">
    Person profile and documents
  </section>
);

export const FamilyTreeToolbarSection = (): JSX.Element => (
  <section aria-label="Family tree toolbar" className="hidden">
    Family tree toolbar
  </section>
);

export const FamilyTreeCanvasSection = (): JSX.Element => (
  <section aria-label="Family tree canvas" className="hidden">
    Family tree canvas
  </section>
);

export const FamilyTreeAuthenticationSection = (): JSX.Element => (
  <section aria-label="Family tree authentication" className="hidden">
    Family tree authentication
  </section>
);

export const FamilyTreeHeadingSection = (): JSX.Element => (
  <section aria-label="Family tree heading" className="hidden">
    Family tree heading
  </section>
);

export const FamilyTreeHeaderSection = (): JSX.Element => (
  <section aria-label="Family tree header" className="hidden">
    Family tree header
  </section>
);

export const FamilyTreeWorkspaceSection = (): JSX.Element => (
  <section aria-label="Family tree workspace" className="hidden">
    Family tree workspace
  </section>
);

export const PersonDetailsDialogSection = (): JSX.Element => (
  <section aria-label="Person details dialog" className="hidden">
    Person details dialog
  </section>
);

export const FamilyTreeBuilderSection = (): JSX.Element => (
  <section aria-label="Family tree builder" className="hidden">
    Family tree builder
  </section>
);

export const FamilyTreeOverviewSection = (): JSX.Element => (
  <section aria-label="Family tree overview" className="hidden">
    Family tree overview
  </section>
);

export const AppHeaderSection = (): JSX.Element => (
  <header aria-label="Application header" className="hidden">
    Application header
  </header>
);

export const RootsGoogleSignIn = (): JSX.Element => {
  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-start bg-[#f5f0e8]"
      data-model-id="75:192"
    >
      <BrandHeaderSection />
      <FamilyHistoryWelcomeAndSignInSection />
      <SiteFooterSection />
      <GoogleAccountSelectionSection />
    </div>
  );
};
