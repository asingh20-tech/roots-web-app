import { Link } from "react-router-dom";

export const HeaderSection = (): JSX.Element => {
  return (
    <header
      className="absolute top-0 left-0 flex h-[220px] w-[1440px] items-center border-b-2 border-[#c8bfa8] bg-[#ede8dc] pl-0 pr-12 py-0"
      aria-label="Roots site header"
    >
      <div className="relative h-[220px] w-[258px] bg-[#e8e2d4]">
        <img
          className="absolute top-0 left-0 h-[220px] w-[258px] object-cover"
          src="/img/roots-tree-emblem-1.png"
          alt="Roots tree emblem"
        />
      </div>
      <div className="relative flex h-[220px] flex-1 grow flex-col items-center justify-center gap-1.5">
        <h1 className="relative w-fit [font-family:'Lora',Helvetica] text-[64px] font-normal leading-[normal] tracking-[8.00px] text-[#2e3b2c]">
          ROOTS
        </h1>
        <p className="relative w-fit [font-family:'Inter',Helvetica] text-[13px] font-normal leading-[normal] tracking-[3.00px] text-[#7a6e5c]">
          YOUR FAMILY STORY BEGINS HERE
        </p>
      </div>
      <Link
        className="relative inline-flex flex-[0_0_auto] items-center gap-3 rounded-md border border-solid border-[#b0a48e] bg-white px-[18px] py-2.5"
        to="/roots-u183-sign-in-or-sign-up"
        aria-label="Sign in or sign up"
      >
        <img
          className="relative h-7 w-7"
          src="/img/rectangle-1.png"
          alt=""
          aria-hidden="true"
        />
        <span className="relative w-fit whitespace-nowrap [font-family:'Inter',Helvetica] text-[15px] font-medium leading-[normal] tracking-[1.00px] text-[#3d4f3b]">
          Sign In
        </span>
      </Link>
    </header>
  );
};
