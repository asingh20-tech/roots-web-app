
type FamilyTreeToolbarProps = {
  treeName: string;
  memberCount: number;
  isOwner: boolean;
  onRequestChange: () => void;
};

export const FamilyTreeToolbarSection = ({
  treeName,
  memberCount,
  isOwner,
  onRequestChange,
}: FamilyTreeToolbarProps): JSX.Element => {
  const toolbarStats = [
    `${memberCount} ${memberCount === 1 ? "person" : "people"}`,
    isOwner ? "Tree Owner" : "Collaborator",
  ];

  return (
    <section
      aria-label="Family tree toolbar"
      className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto] bg-[#fffdf9]"
    >
      <div className="flex h-24 items-center justify-between px-9 py-0 relative self-stretch w-full">
        <div className="flex-col items-start gap-2 inline-flex relative flex-[0_0_auto]">
          <div className="items-center gap-3.5 inline-flex relative flex-[0_0_auto]">
            <h1 className="relative w-fit mt-[-1.00px] [font-family:'Lora',Helvetica] font-normal text-[#283b30] text-[27px] tracking-[-0.14px] leading-[normal]">
              {treeName}
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
          <button
            className="h-10 px-4 py-0 bg-[#355b43] disabled:cursor-not-allowed disabled:opacity-50 inline-flex items-center gap-2 relative flex-[0_0_auto] rounded-lg overflow-hidden border border-solid"
            type="button"
            aria-label="Request a change"
            aria-describedby={isOwner ? "request-change-owner-note" : undefined}
            onClick={onRequestChange}
            disabled={isOwner}
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
          </button>
        </div>
      </div>
      {isOwner && (
        <p id="request-change-owner-note" className="sr-only">
          Change requests are sent by collaborators for the Tree Owner to
          review.
        </p>
      )}
    </section>
  );
};
