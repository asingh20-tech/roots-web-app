import { useState } from "react";

export const SiteHeaderSection = (): JSX.Element => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <header className="relative flex h-[76px] items-center gap-[60px] px-9 py-0 self-stretch w-full bg-white border-b [border-bottom-style:solid] border-[#dedcd2]">
      <a
        href="/"
        className="inline-flex items-center gap-[9px] relative flex-[0_0_auto]"
        aria-label="Roots home"
      >
        <img
          className="relative w-[57px] h-[46px]"
          alt="Tree logo"
          src="/img/tree-logo-3.png"
        />
        <span className="relative w-fit [font-family:'Lora',Helvetica] font-normal text-[#355b43] text-[32px] tracking-[-0.32px] leading-[normal]">
          Roots
        </span>
      </a>
      <nav
        className="flex items-start relative flex-1 self-stretch grow"
        aria-label="Primary navigation"
      >
        <a
          href="/family-tree"
          aria-current="page"
          className="inline-flex flex-col items-start justify-center relative self-stretch flex-[0_0_auto] border-b-[3px] [border-bottom-style:solid] border-[#355b43]"
        >
          <span className="font-semibold text-[#355b43] text-sm relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
            Family tree
          </span>
        </a>
      </nav>
      <div className="relative inline-flex items-center gap-2.5 flex-[0_0_auto]">
        <button
          type="button"
          className="inline-flex items-center gap-2.5"
          aria-haspopup="menu"
          aria-expanded={isProfileMenuOpen}
          aria-controls="profile-menu"
          onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
        >
          <span
            className="flex w-[34px] h-[34px] items-center justify-center relative bg-[#e8ede3] rounded-[100px] overflow-hidden"
            aria-hidden="true"
          >
            <span className="relative w-fit [font-family:'Inter',Helvetica] font-semibold text-[#355b43] text-xs tracking-[0] leading-[normal]">
              EB
            </span>
          </span>
          <span className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#283b30] text-[13px] tracking-[0] leading-[normal]">
            Emma Bennett
          </span>
          <span className="relative w-3.5 h-3.5" aria-hidden="true">
            <img
              className="absolute w-[80.71%] h-[68.21%] top-[31.79%] left-[19.29%]"
              alt=""
              src="/img/chevron.svg"
            />
          </span>
        </button>
        {isProfileMenuOpen && (
          <div
            id="profile-menu"
            className="absolute right-0 top-[calc(100%+12px)] z-10 min-w-[160px] rounded-md border border-[#dedcd2] bg-white p-2 shadow-md"
            role="menu"
          >
            <a
              href="/profile"
              className="block rounded px-3 py-2 [font-family:'Inter',Helvetica] text-[13px] text-[#283b30] hover:bg-[#e8ede3]"
              role="menuitem"
            >
              Profile
            </a>
            <button
              type="button"
              className="block w-full rounded px-3 py-2 text-left [font-family:'Inter',Helvetica] text-[13px] text-[#283b30] hover:bg-[#e8ede3]"
              role="menuitem"
              onClick={() => setIsProfileMenuOpen(false)}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
