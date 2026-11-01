import { useEffect, useRef, useState } from "react";

type FamilyTreeHeaderSectionProps = {
  onInviteFamily?: () => void;
  onRequestChange?: () => void;
  onFamilyViewChange?: () => void;
  onGenerationsChange?: () => void;
};

export const FamilyTreeHeaderSection = ({
  onInviteFamily,
  onRequestChange,
  onFamilyViewChange,
  onGenerationsChange,
}: FamilyTreeHeaderSectionProps): JSX.Element => {
  const [searchValue, setSearchValue] = useState("");
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
    <header className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto] bg-[#fffdf9]">
      <div className="flex h-24 items-center justify-between px-9 py-0 relative self-stretch w-full">
        <div className="flex-col items-start gap-2 inline-flex relative flex-[0_0_auto]">
          <div className="items-center gap-3.5 inline-flex relative flex-[0_0_auto]">
            <h1 className="relative w-fit mt-[-1.00px] [font-family:'Lora',Helvetica] font-normal text-[#283b30] text-[27px] tracking-[-0.14px] leading-[normal]">
              The Bennett family
            </h1>
            <div className="relative w-[17px] h-[17px]" aria-hidden="true">
              <img
                className="absolute w-[79.71%] h-[67.21%] top-[32.79%] left-[20.29%]"
                alt=""
                src="/img/vector-37.svg"
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
            <span className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-xs tracking-[0] leading-[normal]">
              20 people
            </span>
            <span
              className="relative w-[3px] h-[3px] bg-[#7b8177] rounded-[1.5px]"
              aria-hidden="true"
            />
            <span className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-xs tracking-[0] leading-[normal]">
              4 generations
            </span>
            <span
              className="relative w-[3px] h-[3px] bg-[#7b8177] rounded-[1.5px]"
              aria-hidden="true"
            />
            <span className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-xs tracking-[0] leading-[normal]">
              Up To Date
            </span>
          </div>
        </div>
        <div className="inline-flex items-start gap-2.5 relative flex-[0_0_auto]">
          <button
            type="button"
            onClick={onInviteFamily}
            className="inline-flex h-10 items-center gap-2 px-4 py-0 relative flex-[0_0_auto] bg-[#fffdf9] rounded-lg overflow-hidden border border-solid border-[#dedcd2]"
            aria-label="Invite family"
          >
            <span className="relative w-4 h-4" aria-hidden="true">
              <img
                className="absolute w-[96.67%] h-[92.50%] top-[7.50%] left-[3.33%]"
                alt=""
                src="/img/vector-38.svg"
              />
            </span>
            <span className="font-normal text-[#283b30] text-[13px] relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
              Invite family
            </span>
          </button>
          <button
            type="button"
            onClick={onRequestChange}
            className="h-10 px-4 py-0 bg-[#355b43] inline-flex items-center gap-2 relative flex-[0_0_auto] rounded-lg overflow-hidden border border-solid"
            aria-label="Request change"
          >
            <span className="relative w-4 h-4" aria-hidden="true">
              <img
                className="absolute w-[84.17%] h-[84.17%] top-[15.83%] left-[15.83%]"
                alt=""
                src="/img/vector-39.svg"
              />
            </span>
            <span className="font-normal text-white text-[13px] relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
              Request
              <br />
              Change
            </span>
          </button>
        </div>
      </div>
      <div className="flex h-[58px] items-center justify-between px-9 py-0 relative self-stretch w-full border-t [border-top-style:solid] border-b [border-bottom-style:solid] border-[#dedcd2]">
        <nav
          className="inline-flex items-center gap-[18px] relative flex-[0_0_auto]"
          aria-label="Family tree views"
        >
          <div className="inline-flex items-start gap-[3px] p-1 relative flex-[0_0_auto] bg-[#ece9e0] rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={onFamilyViewChange}
              className="inline-flex h-[30px] items-center gap-[7px] px-2.5 py-0 relative flex-[0_0_auto] bg-[#fffdf9] rounded-md overflow-hidden"
              aria-current="page"
            >
              <span className="relative w-[15px] h-[15px]" aria-hidden="true">
                <img
                  className="absolute w-[92.83%] h-[92.83%] top-[7.17%] left-[7.17%]"
                  alt=""
                  src="/img/vector-40.svg"
                />
              </span>
              <span className="font-semibold text-[#355b43] text-xs relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
                Family view
              </span>
            </button>
          </div>
          <button
            type="button"
            onClick={onGenerationsChange}
            className="h-[34px] px-3 py-0 bg-[#fffdf9] border-[#dedcd2] inline-flex items-center gap-2 relative flex-[0_0_auto] rounded-lg overflow-hidden border border-solid"
          >
            <span className="relative w-4 h-4" aria-hidden="true">
              <img
                className="absolute w-[96.67%] h-[96.67%] top-[3.33%] left-[3.33%]"
                alt=""
                src="/img/vector-41.svg"
              />
            </span>
            <span className="font-normal text-[#283b30] text-[13px] relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
              4 generations
            </span>
          </button>
        </nav>
        <div className="flex w-[264px] h-[34px] items-center gap-[9px] px-3 py-0 relative rounded-lg overflow-hidden border border-solid border-[#dedcd2]">
          <label
            htmlFor="family-tree-search"
            className="relative w-[15px] h-[15px] cursor-text"
            aria-label="Find someone in your tree"
          >
            <img
              className="absolute w-[92.83%] h-[92.83%] top-[7.17%] left-[7.17%]"
              alt=""
              src="/img/vector-42.svg"
            />
          </label>
          <input
            ref={searchInputRef}
            id="family-tree-search"
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Find someone in your tree"
            className="relative flex-1 min-w-0 [font-family:'Inter',Helvetica] font-normal text-[#283b30] placeholder:text-[#7b8177] text-xs tracking-[0] leading-[normal]"
            aria-label="Find someone in your tree"
          />
          <kbd className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-[10px] tracking-[0] leading-[normal] whitespace-nowrap">
            ⌘ K
          </kbd>
        </div>
      </div>
    </header>
  );
};
