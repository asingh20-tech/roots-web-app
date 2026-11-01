export const FamilyTreeToolbarSection = (): JSX.Element => {
  const viewOptions = ["Family view", "4 generations"];

  return (
    <nav
      aria-label="Family tree toolbar"
      className="relative flex h-[58px] w-full items-center justify-between self-stretch border-t border-b border-[#dedcd2] bg-[#fffdf9] px-9 py-0"
    >
      <div className="inline-flex items-start gap-[18px]">
        {viewOptions.map((option) => (
          <button
            key={option}
            type="button"
            className="inline-flex h-10 items-center overflow-hidden rounded-lg border border-solid border-[#dedcd2] bg-[#fffdf9] px-4 py-0 text-left"
            aria-label={option}
          >
            <span className="relative w-fit font-normal text-[13px] leading-[normal] tracking-[0] text-[#283b30] [font-family:'Inter',Helvetica]">
              {option}
            </span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="inline-flex h-10 items-center overflow-hidden rounded-lg border border-solid border-[#dedcd2] bg-[#fffdf9] px-4 py-0 text-left"
        aria-label="Find someone in your tree. Keyboard shortcut Command K"
      >
        <span className="relative w-fit font-normal text-[13px] leading-[normal] tracking-[0] text-[#283b30] [font-family:'Inter',Helvetica]">
          Find someone in your tree
        </span>
        <kbd className="ml-8 whitespace-nowrap font-normal text-[13px] leading-[normal] tracking-[0] text-[#283b30] [font-family:'Inter',Helvetica]">
          ⌘ K
        </kbd>
      </button>
    </nav>
  );
};
