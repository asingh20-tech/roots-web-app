import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const toolbarStats = ["20 people", "4 generations", "Up To Date"];

export const FamilyTreeToolbarSection = (): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <section
      aria-label="Family tree toolbar"
      className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto] bg-[#fffdf9]"
    >
      <div className="flex h-24 items-center justify-between px-9 py-0 relative self-stretch w-full">
        <div className="flex-col items-start gap-2 inline-flex relative flex-[0_0_auto]">
          <div className="items-center gap-3.5 inline-flex relative flex-[0_0_auto]">
            <h1 className="relative w-fit mt-[-1.00px] [font-family:'Lora',Helvetica] font-normal text-[#283b30] text-[27px] tracking-[-0.14px] leading-[normal]">
              The Bennett family
            </h1>
            <button
              type="button"
              aria-label="Family tree options"
              className="relative w-[17px] h-[17px]"
            >
              <img
                className="absolute w-[79.71%] h-[67.21%] top-[32.79%] left-[20.29%]"
                alt=""
                aria-hidden="true"
                src="/img/vector-26.svg"
              />
            </button>
          </div>
          <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
            {toolbarStats.map((stat, index) => (
              <span key={stat} className="contents">
                <span className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-xs tracking-[0] leading-[normal]">
                  {stat}
                </span>
                {index < toolbarStats.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="relative w-[3px] h-[3px] bg-[#7b8177] rounded-[1.5px]"
                  />
                )}
              </span>
            ))}
          </div>
        </div>
        <div className="inline-flex items-start gap-2.5 relative flex-[0_0_auto]">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 px-4 py-0 relative flex-[0_0_auto] bg-[#fffdf9] rounded-lg overflow-hidden border border-solid border-[#dedcd2]"
          >
            <span className="relative w-4 h-4">
              <img
                className="absolute w-[96.67%] h-[92.50%] top-[7.50%] left-[3.33%]"
                alt=""
                aria-hidden="true"
                src="/img/vector-38.svg"
              />
            </span>
            <span className="font-normal text-[#283b30] text-[13px] relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
              Invite Link
            </span>
          </button>
          <Link
            className="h-10 px-4 py-0 bg-[#355b43] inline-flex items-center gap-2 relative flex-[0_0_auto] rounded-lg overflow-hidden border border-solid"
            to="/roots-u183-add-person-request-overlay"
            aria-label="Request a change"
          >
            <span className="relative w-4 h-4">
              <img
                className="absolute w-[84.17%] h-[84.17%] top-[15.83%] left-[15.83%]"
                alt=""
                aria-hidden="true"
                src="/img/vector-39.svg"
              />
            </span>
            <span className="font-normal text-white text-[13px] relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
              Request
              <br />
              Change
            </span>
          </Link>
        </div>
      </div>
      <div className="flex h-[58px] items-center justify-between px-9 py-0 relative self-stretch w-full border-t [border-top-style:solid] border-b [border-bottom-style:solid] border-[#dedcd2]">
        <nav
          aria-label="Family tree views"
          className="inline-flex items-center gap-[18px] relative flex-[0_0_auto]"
        >
          <div className="inline-flex items-start gap-[3px] p-1 relative flex-[0_0_auto] bg-[#ece9e0] rounded-lg overflow-hidden">
            <button
              type="button"
              aria-current="page"
              className="inline-flex h-[30px] items-center gap-[7px] px-2.5 py-0 relative flex-[0_0_auto] bg-[#fffdf9] rounded-md overflow-hidden"
            >
              <span className="relative w-[15px] h-[15px]">
                <img
                  className="absolute w-[92.83%] h-[92.83%] top-[7.17%] left-[7.17%]"
                  alt=""
                  aria-hidden="true"
                  src="/img/vector-29.svg"
                />
              </span>
              <span className="font-semibold text-[#355b43] text-xs relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
                Family view
              </span>
            </button>
          </div>
          <button
            type="button"
            className="h-[34px] px-3 py-0 bg-[#fffdf9] border-[#dedcd2] inline-flex items-center gap-2 relative flex-[0_0_auto] rounded-lg overflow-hidden border border-solid"
          >
            <span className="relative w-4 h-4">
              <img
                className="absolute w-[96.67%] h-[96.67%] top-[3.33%] left-[3.33%]"
                alt=""
                aria-hidden="true"
                src="/img/vector-30.svg"
              />
            </span>
            <span className="font-normal text-[#283b30] text-[13px] relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
              4 generations
            </span>
          </button>
        </nav>
        <form
          role="search"
          className="flex w-[264px] h-[34px] items-center gap-[9px] px-3 py-0 relative rounded-lg overflow-hidden border border-solid border-[#dedcd2]"
          onSubmit={(event) => event.preventDefault()}
        >
          <span className="relative w-[15px] h-[15px]">
            <img
              className="absolute w-[92.83%] h-[92.83%] top-[7.17%] left-[7.17%]"
              alt=""
              aria-hidden="true"
              src="/img/vector-42.svg"
            />
          </span>
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Find someone in your tree"
            aria-label="Find someone in your tree"
            className="relative flex-1 min-w-0 [font-family:'Inter',Helvetica] font-normal text-[#283b30] placeholder:text-[#7b8177] text-xs tracking-[0] leading-[normal]"
          />
          <kbd className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-[10px] tracking-[0] leading-[normal] whitespace-nowrap">
            ⌘ K
          </kbd>
        </form>
      </div>
    </section>
  );
};
