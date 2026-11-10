import { Link } from "react-router-dom";

export const HeaderSection = (): JSX.Element => {
  return (
    <header
      className="flex h-[112px] w-full shrink-0 items-center border-b-2 border-roots-line bg-roots-surface pr-4 sm:h-[168px] sm:pr-8 lg:h-[220px] lg:pr-12"
      aria-label="Roots site header"
    >
      <div className="relative h-full w-[96px] shrink-0 bg-[#e8e2d4] sm:w-[196px] lg:w-[258px]">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="/img/roots-tree-emblem-1.png"
          alt="Roots tree emblem"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1.5 px-3 text-center">
        <h1 className="font-display text-[34px] font-normal leading-none tracking-[4px] text-roots-ink sm:text-[48px] sm:tracking-[6px] lg:text-[64px] lg:tracking-[8px]">
          ROOTS
        </h1>
        <p className="mt-1 text-[9px] font-normal leading-snug tracking-[2px] text-roots-muted sm:text-[11px] sm:tracking-[2.5px] lg:mt-2 lg:text-[13px] lg:tracking-[3px]">
          YOUR FAMILY STORY BEGINS HERE
        </p>
      </div>
      <Link
        className="roots-btn h-11 shrink-0 gap-3 rounded-md border border-[#b0a48e] bg-white px-3.5 text-[15px] font-medium tracking-[1px] text-[#3d4f3b] hover:border-roots-forest/60 hover:bg-roots-paper sm:px-[18px]"
        to="/sign-in"
        aria-label="Sign in or sign up"
      >
        <img
          className="hidden h-7 w-7 sm:block"
          src="/img/rectangle-1.png"
          alt=""
          aria-hidden="true"
        />
        <span className="whitespace-nowrap font-body">Sign In</span>
      </Link>
    </header>
  );
};
