import { useEffect, useRef, useState } from "react";

export const AppHeaderSection = (): JSX.Element => {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent): void => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="flex h-[76px] items-center gap-[60px] px-9 py-0 relative self-stretch w-full bg-white border-b [border-bottom-style:solid] border-[#dedcd2]">
      <a
        className="inline-flex items-center gap-[9px] relative flex-[0_0_auto]"
        href="/"
        aria-label="Roots home"
      >
        <img
          className="relative w-[57px] h-[46px]"
          alt="Tree logo"
          src="/img/tree-logo-2.png"
        />
        <span className="relative w-fit [font-family:'Lora',Helvetica] font-normal text-[#355b43] text-[32px] tracking-[-0.32px] leading-[normal]">
          Roots
        </span>
      </a>
      <nav
        className="flex items-center gap-8 relative flex-1 self-stretch grow"
        aria-label="Primary navigation"
      >
        <a
          className="inline-flex flex-col items-start justify-center relative self-stretch flex-[0_0_auto] border-b-[3px] [border-bottom-style:solid] border-[#355b43]"
          href="/family-tree"
          aria-current="page"
        >
          <span className="relative w-fit [font-family:'Inter',Helvetica] font-semibold text-[#355b43] text-sm tracking-[0] leading-[normal]">
            Family tree
          </span>
        </a>
      </nav>
      <div
        className="inline-flex items-center gap-[22px] relative flex-[0_0_auto]"
        ref={accountMenuRef}
      >
        <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
          <button
            className="inline-flex items-center gap-2.5 relative flex-[0_0_auto] cursor-pointer"
            type="button"
            aria-haspopup="menu"
            aria-expanded={isAccountMenuOpen}
            aria-controls="account-menu"
            onClick={() => setIsAccountMenuOpen((isOpen) => !isOpen)}
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
                src="/img/vector-36.svg"
              />
            </span>
          </button>
          {isAccountMenuOpen && (
            <div
              id="account-menu"
              className="absolute right-0 top-[50px] z-10 min-w-[150px] rounded-md border border-[#dedcd2] bg-white py-1 shadow-md"
              role="menu"
            >
              <a
                className="block px-4 py-2 [font-family:'Inter',Helvetica] text-[13px] text-[#283b30] hover:bg-[#f5f6f2]"
                href="/profile"
                role="menuitem"
                onClick={() => setIsAccountMenuOpen(false)}
              >
                Profile
              </a>
              <button
                className="block w-full cursor-pointer px-4 py-2 text-left [font-family:'Inter',Helvetica] text-[13px] text-[#283b30] hover:bg-[#f5f6f2]"
                type="button"
                role="menuitem"
                onClick={() => setIsAccountMenuOpen(false)}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
