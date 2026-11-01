export const BrandHeaderSection = (): JSX.Element => {
  return (
    <header className="flex h-[220px] items-center pl-0 pr-12 py-0 relative self-stretch w-full bg-[#ede8dc] border-b-2 [border-bottom-style:solid] border-[#c8bfa8]">
      <img
        className="relative w-[258px] h-[220px] object-cover"
        alt="Roots tree emblem"
        src="/img/roots-tree-emblem-1.png"
      />
      <div className="flex flex-col items-center gap-1.5 relative flex-1 grow">
        <h1 className="relative w-fit mt-[-1.00px] [font-family:'Lora',Helvetica] font-normal text-[#2e3b2c] text-[64px] tracking-[8.00px] leading-[normal]">
          ROOTS
        </h1>
        <p className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#7a6e5c] text-[13px] tracking-[3.00px] leading-[normal]">
          YOUR FAMILY STORY BEGINS HERE
        </p>
      </div>
      <a
        className="inline-flex h-12 items-center gap-2.5 px-[18px] py-0 relative flex-[0_0_auto] bg-[#faf8f4] rounded-md overflow-hidden border border-solid border-[#b0a48e]"
        href="/"
        aria-label="Back to home"
      >
        <span className="relative w-4 h-4" aria-hidden="true">
          <img
            className="absolute w-[85.80%] h-[83.86%] top-[16.14%] left-[14.20%]"
            alt=""
            src="/img/vector-6.svg"
          />
        </span>
        <span className="[font-family:'Inter',Helvetica] text-[#4a5e47] text-sm relative w-fit font-normal tracking-[0] leading-[normal]">
          Back to home
        </span>
      </a>
    </header>
  );
};
