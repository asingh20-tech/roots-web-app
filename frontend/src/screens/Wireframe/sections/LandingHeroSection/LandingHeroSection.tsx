import { RefObject } from "react";
import { Link } from "react-router-dom";

type LandingHeroSectionProps = {
  onCreateTree: () => void;
  createButtonRef?: RefObject<HTMLButtonElement>;
};

const BranchIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="6" cy="19" r="2" />
    <circle cx="18" cy="6" r="2" />
    <path d="M6 17V5M6 13c0-4 4-5 10-6.5" />
  </svg>
);

const EyeIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.75" />
  </svg>
);

export const LandingHeroSection = ({
  onCreateTree,
  createButtonRef,
}: LandingHeroSectionProps): JSX.Element => {
  return (
    <main
      aria-labelledby="landing-heading"
      className="flex flex-1 items-center justify-center bg-roots-canvas px-6 py-16 sm:px-10 sm:py-20"
    >
      <div className="flex w-full max-w-[680px] flex-col items-center text-center">
        <span
          aria-hidden="true"
          className="roots-enter mb-8 h-px w-12 bg-roots-forest/50"
          style={{ animationDelay: "0ms" }}
        />

        <h2
          id="landing-heading"
          className="roots-enter text-balance font-display text-[40px] leading-[1.1] tracking-[-0.01em] text-roots-ink sm:text-[52px] lg:text-[60px]"
          style={{ animationDelay: "40ms" }}
        >
          Begin Your Family Tree
        </h2>

        <p
          className="roots-enter mt-6 max-w-[580px] text-pretty text-[16px] leading-[1.7] text-roots-muted sm:text-[17px]"
          style={{ animationDelay: "90ms" }}
        >
          ROOTS is a shared home for your family's history. Map parents,
          partners and children across generations, keep the photos and
          documents that tell their stories, and invite relatives to help fill
          in the branches.
        </p>

        <div
          className="roots-enter mt-10 flex w-full max-w-[360px] flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4"
          style={{ animationDelay: "140ms" }}
        >
          <button
            ref={createButtonRef}
            type="button"
            onClick={onCreateTree}
            aria-haspopup="dialog"
            className="roots-btn roots-btn-primary h-[52px] gap-2.5 px-8 text-[17px] sm:min-w-[200px]"
          >
            <BranchIcon />
            Create Tree
          </button>
          <Link
            to="/family-tree"
            className="roots-btn roots-btn-secondary h-[52px] gap-2.5 px-8 text-[17px] sm:min-w-[200px]"
          >
            <EyeIcon />
            View Tree
          </Link>
        </div>
      </div>
    </main>
  );
};
