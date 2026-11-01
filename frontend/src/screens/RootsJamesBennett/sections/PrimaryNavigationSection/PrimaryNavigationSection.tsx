import { useEffect, useState } from "react";

export const PrimaryNavigationSection = (): JSX.Element => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="flex h-[76px] items-center gap-[60px] px-9 py-0 relative self-stretch w-full bg-white border-b [border-bottom-style:solid] border-[#dedcd2]">
      <a
        href="/"
        aria-label="Roots home"
        className="inline-flex items-center gap-[9px] relative flex-[0_0_auto]"
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
        aria-label="Primary navigation"
        className="flex items-start relative flex-1 self-stretch grow"
      >
        <a
          href="#family-tree"
          aria-current="page"
          className="inline-flex flex-col items-start justify-center relative self-stretch flex-[0_0_auto] border-b-[3px] [border-bottom-style:solid] border-[#355b43]"
        >
          <span className="font-semibold text-[#355b43] text-sm relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
            Family tree
          </span>
        </a>
      </nav>
      <div className="relative flex-[0_0_auto]">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={isProfileMenuOpen}
          aria-label="Open Emma Bennett profile menu"
          onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
          className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]"
        >
          <span className="flex w-[34px] h-[34px] items-center justify-center relative bg-[#e8ede3] rounded-[100px] overflow-hidden">
            <span className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#355b43] text-xs tracking-[0] leading-[normal]">
              EB
            </span>
          </span>
          <span className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#283b30] text-[13px] tracking-[0] leading-[normal]">
            Emma Bennett
          </span>
          <span
            aria-hidden="true"
            className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#283b30] text-xs tracking-[0] leading-[normal]"
          >
            ⌄
          </span>
        </button>
        {isProfileMenuOpen && (
          <div
            role="menu"
            aria-label="Emma Bennett profile menu"
            className="absolute right-0 top-[42px] z-10 min-w-[150px] rounded-md border border-[#dedcd2] bg-white p-1 shadow-md"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => setIsProfileMenuOpen(false)}
              className="block w-full rounded px-3 py-2 text-left [font-family:'Inter',Helvetica] text-xs text-[#283b30] hover:bg-[#e8ede3]"
            >
              Profile
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => setIsProfileMenuOpen(false)}
              className="block w-full rounded px-3 py-2 text-left [font-family:'Inter',Helvetica] text-xs text-[#283b30] hover:bg-[#e8ede3]"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
