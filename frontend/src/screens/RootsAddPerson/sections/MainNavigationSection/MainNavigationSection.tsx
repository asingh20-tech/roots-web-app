import { useEffect, useRef, useState } from "react";

const navigationItems = [
  {
    label: "Family tree",
    active: true,
  },
];

const profileActions = ["Account settings", "Sign out"];

export const MainNavigationSection = (): JSX.Element => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
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
          className="relative w-[57px] h-[46px] aspect-[1.24]"
          alt="Tree logo"
          src="/img/tree-logo-3.png"
        />
        <span className="relative w-fit [font-family:'Lora',Helvetica] font-normal text-[#355b43] text-[32px] tracking-[-0.32px] leading-[normal]">
          Roots
        </span>
      </a>
      <nav
        className="flex items-center gap-8 relative flex-1 self-stretch grow"
        aria-label="Main navigation"
      >
        {navigationItems.map((item) => (
          <div
            className="inline-flex flex-col items-start justify-center relative self-stretch flex-[0_0_auto] border-b-[3px] [border-bottom-style:solid] border-[#355b43]"
            key={item.label}
          >
            <a
              className="font-semibold text-[#355b43] text-sm relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]"
              href="/family-tree"
              aria-current={item.active ? "page" : undefined}
            >
              {item.label}
            </a>
          </div>
        ))}
      </nav>
      <div
        className="inline-flex items-center gap-[22px] relative flex-[0_0_auto]"
        ref={profileMenuRef}
      >
        <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
          <button
            className="inline-flex items-center gap-2.5 relative flex-[0_0_auto] cursor-pointer"
            type="button"
            aria-haspopup="menu"
            aria-expanded={isProfileMenuOpen}
            aria-label="Open Emma Bennett profile menu"
            onClick={() => setIsProfileMenuOpen((open) => !open)}
          >
            <span className="flex w-[34px] h-[34px] items-center justify-center relative bg-[#e8ede3] rounded-[100px] overflow-hidden">
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
          {isProfileMenuOpen && (
            <div
              className="absolute right-0 top-[46px] z-10 min-w-[170px] rounded-md border border-[#dedcd2] bg-white p-1 shadow-[0_8px_24px_rgba(40,59,48,0.14)]"
              role="menu"
              aria-label="Profile menu"
            >
              {profileActions.map((action) => (
                <button
                  className="block w-full cursor-pointer rounded px-3 py-2 text-left [font-family:'Inter',Helvetica] text-[13px] text-[#283b30] hover:bg-[#e8ede3]"
                  key={action}
                  type="button"
                  role="menuitem"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  {action}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
