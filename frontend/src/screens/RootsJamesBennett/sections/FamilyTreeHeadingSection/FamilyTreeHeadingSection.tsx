import type { MouseEventHandler } from "react";

type FamilyTreeHeadingSectionProps = {
  onInvite?: MouseEventHandler<HTMLButtonElement>;
  onRequestChange?: MouseEventHandler<HTMLButtonElement>;
};

export const FamilyTreeHeadingSection = ({
  onInvite,
  onRequestChange,
}: FamilyTreeHeadingSectionProps): JSX.Element => {
  return (
    <header className="relative flex h-24 w-full items-center justify-between self-stretch bg-[#fffdf9] px-9 py-0">
      <div className="relative inline-flex flex-[0_0_auto] flex-col items-start gap-2">
        <h1 className="relative mt-[-1.00px] w-fit [font-family:'Lora',Helvetica] text-[27px] font-normal leading-[normal] tracking-[0] text-[#283b30]">
          The Bennett family
        </h1>
        <p className="relative w-fit [font-family:'Inter',Helvetica] text-xs font-normal leading-[normal] tracking-[0] text-[#7b8177]">
          20 people&nbsp;&nbsp; •&nbsp;&nbsp; 4 generations&nbsp;&nbsp;
          •&nbsp;&nbsp; Up To Date
        </p>
      </div>
      <div className="relative inline-flex flex-[0_0_auto] items-start gap-2.5">
        <button
          type="button"
          onClick={onInvite}
          className="relative inline-flex h-10 flex-[0_0_auto] items-center overflow-hidden rounded-lg border border-solid border-[#dedcd2] bg-[#fffdf9] px-4 py-0 [font-family:'Inter',Helvetica] text-[13px] font-normal leading-[normal] tracking-[0] text-[#283b30] transition-colors hover:bg-[#f7f5ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355b43] focus-visible:ring-offset-2 active:bg-[#efede6]"
          aria-label="Invite a family member"
        >
          Invite family
        </button>
        <button
          type="button"
          onClick={onRequestChange}
          className="relative inline-flex h-10 flex-[0_0_auto] items-center overflow-hidden rounded-lg border border-solid border-[#dedcd2] bg-[#355b43] px-4 py-0 [font-family:'Inter',Helvetica] text-[13px] font-normal leading-[normal] tracking-[0] text-white transition-colors hover:bg-[#2d4d39] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355b43] focus-visible:ring-offset-2 active:bg-[#254332]"
          aria-label="Request a change to the family tree"
        >
          +&nbsp;&nbsp;Request Change
        </button>
      </div>
    </header>
  );
};
