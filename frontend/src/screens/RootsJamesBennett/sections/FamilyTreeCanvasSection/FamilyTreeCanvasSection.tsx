import { useRef, useState } from "react";

type FamilyMember = {
  name: string;
  years: string;
  location: string;
  image?: string;
  initials?: string;
  top: string;
  left: string;
  selected?: boolean;
};

const familyMembers: FamilyMember[] = [
  {
    name: "Ava Walker",
    years: "Born 2008",
    location: "London, England",
    image: "/img/portrait-47.png",
    top: "634px",
    left: "1262px",
  },
  {
    name: "Olivia Bennett",
    years: "Born 2003",
    location: "London, England",
    image: "/img/portrait-44.png",
    top: "634px",
    left: "992px",
  },
  {
    name: "Thomas Bennett",
    years: "Born 2001",
    location: "London, England",
    image: "/img/portrait-43.png",
    top: "634px",
    left: "812px",
  },
  {
    name: "Emma Bennett",
    years: "Born 1998",
    location: "London, England",
    image: "/img/portrait-47.png",
    top: "634px",
    left: "632px",
    selected: true,
  },
  {
    name: "Sarah Hayes",
    years: "Born 1975",
    location: "London, England",
    image: "/img/portrait-46.png",
    top: "444px",
    left: "1352px",
  },
  {
    name: "Daniel Walker",
    years: "Born 1972",
    location: "London, England",
    image: "/img/portrait-45.png",
    top: "444px",
    left: "1172px",
  },
  {
    name: "Sophie Walker",
    years: "Born 1970",
    location: "London, England",
    image: "/img/portrait-45.png",
    top: "444px",
    left: "812px",
  },
  {
    name: "David Bennett",
    years: "Born 1967",
    location: "London, England",
    image: "/img/portrait-44.png",
    top: "444px",
    left: "632px",
  },
  {
    name: "Grace Hayes",
    years: "Born 1941",
    location: "Oxford, England",
    image: "/img/portrait-46.png",
    top: "254px",
    left: "1172px",
  },
  {
    name: "William Walker",
    years: "1938 – 2019",
    location: "Edinburgh, Scotland",
    image: "/img/portrait-38.png",
    top: "254px",
    left: "992px",
  },
  {
    name: "Eleanor Ellis",
    years: "1935 – 2021",
    location: "Bath, England",
    image: "/img/portrait-43.png",
    top: "254px",
    left: "452px",
  },
  {
    name: "James Bennett",
    years: "1932 – 2018",
    location: "York, England",
    image: "/img/portrait-36.png",
    top: "254px",
    left: "272px",
  },
  {
    name: "Margaret Collins",
    years: "1910 – 1999",
    location: "Oxford, England",
    initials: "MC",
    top: "64px",
    left: "1352px",
  },
  {
    name: "Edward Hayes",
    years: "1906 – 1988",
    location: "Oxford, England",
    initials: "EH",
    top: "64px",
    left: "1172px",
  },
  {
    name: "Alice Fraser",
    years: "1908 – 1996",
    location: "Stirling, Scotland",
    initials: "AF",
    top: "64px",
    left: "992px",
  },
  {
    name: "Henry Walker",
    years: "1904 – 1981",
    location: "Edinburgh, Scotland",
    initials: "HW",
    top: "64px",
    left: "812px",
  },
  {
    name: "Ivy Clarke",
    years: "1905 – 1992",
    location: "Bristol, England",
    initials: "IC",
    top: "64px",
    left: "632px",
  },
  {
    name: "George Ellis",
    years: "1901 – 1978",
    location: "Bath, England",
    initials: "GE",
    top: "64px",
    left: "452px",
  },
  {
    name: "Rose Mitchell",
    years: "1902 – 1986",
    location: "Yorkshire, England",
    initials: "RM",
    top: "64px",
    left: "272px",
  },
  {
    name: "Arthur Bennett",
    years: "1898 – 1974",
    location: "Yorkshire, England",
    initials: "AB",
    top: "64px",
    left: "92px",
  },
];

const relationshipLegend = [
  "♥  Married",
  "♡  Partners",
  "♡  Separated",
  "—  Parent–child",
];

export const FamilyTreeCanvasSection = (): JSX.Element => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleZoomOut = (): void => {
    setZoom((currentZoom) => Math.max(50, currentZoom - 10));
  };

  const handleZoomIn = (): void => {
    setZoom((currentZoom) => Math.min(200, currentZoom + 10));
  };

  const handleFullscreen = async (): Promise<void> => {
    if (!document.fullscreenElement && canvasRef.current) {
      await canvasRef.current.requestFullscreen();
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  };

  return (
    <section
      ref={canvasRef}
      aria-label="Family tree canvas"
      className="relative w-[1600px] h-[1090px]"
    >
      <div
        role="toolbar"
        aria-label="Family tree canvas controls"
        className="inline-flex items-start gap-3.5 absolute top-[1011px] left-[1280px]"
      >
        <button
          type="button"
          aria-label="Toggle fullscreen"
          title="Toggle fullscreen"
          onClick={handleFullscreen}
          className="inline-flex h-10 items-center px-4 py-0 relative flex-[0_0_auto] bg-[#fffdf9] rounded-lg overflow-hidden border border-solid border-[#dedcd2] cursor-pointer"
        >
          <span className="font-normal text-[#283b30] text-[13px] relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
            ⛶
          </span>
        </button>
        <div className="inline-flex h-10 items-center px-4 py-0 relative flex-[0_0_auto] bg-[#fffdf9] rounded-lg overflow-hidden border border-solid border-[#dedcd2]">
          <button
            type="button"
            aria-label="Zoom out"
            title="Zoom out"
            onClick={handleZoomOut}
            className="font-normal text-[#283b30] text-[13px] [font-family:'Inter',Helvetica] tracking-[0] leading-[normal] cursor-pointer"
          >
            −
          </button>
          <output
            aria-label="Current zoom level"
            className="font-normal text-[#283b30] text-[13px] [font-family:'Inter',Helvetica] tracking-[0] leading-[normal] whitespace-pre"
          >
            {"    "}
            {zoom}%{"    "}
          </output>
          <button
            type="button"
            aria-label="Zoom in"
            title="Zoom in"
            onClick={handleZoomIn}
            className="font-normal text-[#283b30] text-[13px] [font-family:'Inter',Helvetica] tracking-[0] leading-[normal] cursor-pointer"
          >
            +
          </button>
        </div>
        <div className="relative">
          <button
            type="button"
            aria-label="Open canvas menu"
            aria-expanded={menuOpen}
            title="More options"
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
            className="inline-flex h-10 items-center px-4 py-0 relative flex-[0_0_auto] bg-[#fffdf9] rounded-lg overflow-hidden border border-solid border-[#dedcd2] cursor-pointer"
          >
            <span className="font-normal text-[#283b30] text-[13px] relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
              •••
            </span>
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 bottom-12 min-w-[140px] rounded-lg border border-solid border-[#dedcd2] bg-[#fffdf9] p-1 shadow-[0px_3px_8px_#3444320a]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => setZoom(100)}
                className="block w-full rounded-md px-3 py-2 text-left text-[12px] text-[#283b30] [font-family:'Inter',Helvetica] hover:bg-[#f2f6ed] cursor-pointer"
              >
                Reset zoom
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="absolute top-[1025px] left-9 [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-[11px] tracking-[0] leading-[normal] whitespace-nowrap">
        Relationships:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        {relationshipLegend.map((relationship) => (
          <span key={relationship}>
            {relationship}
            {"        "}
          </span>
        ))}
      </p>
      <div className="absolute top-[687px] left-[27px] [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-[10px] tracking-[0] leading-[normal] whitespace-nowrap">
        YOUNGEST GENERATION
      </div>
      {familyMembers.map((member) => (
        <article
          key={member.name}
          aria-label={`${member.name}, ${member.years}, ${member.location}`}
          className={`w-[156px] h-[132px] gap-[5px] pt-3 pb-2.5 px-1.5 absolute bg-[${
            member.selected ? "f2f6ed" : "fffdf9"
          }] rounded-xl ${
            member.selected
              ? "border-2 border-solid border-[#355b43]"
              : "border border-solid border-[#dedcd2]"
          } shadow-[0px_3px_8px_#3444320a] flex flex-col items-center overflow-hidden`}
          style={{ top: member.top, left: member.left }}
        >
          {member.image ? (
            <img
              className="relative w-10 h-10 object-cover"
              alt={`${member.name} portrait`}
              src={member.image}
            />
          ) : (
            <div className="flex w-10 h-10 items-center justify-center relative bg-[#ece9e0] rounded-[100px] overflow-hidden">
              <span className="relative w-fit [font-family:'Lora',Helvetica] font-normal text-[#617b58] text-[15px] tracking-[0] leading-[normal]">
                {member.initials}
              </span>
            </div>
          )}
          <div className="relative self-stretch [font-family:'Inter',Helvetica] font-semibold text-[#283b30] text-[13px] text-center tracking-[0] leading-[normal]">
            {member.name}
          </div>
          <div className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-[11px] tracking-[0] leading-[normal] whitespace-nowrap">
            {member.years}
          </div>
          <div className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-[10px] tracking-[0] leading-[normal] whitespace-nowrap">
            {member.location}
          </div>
        </article>
      ))}

      <img
        className="absolute top-[130px] left-[248px] w-[1104px] h-[504px] pointer-events-none"
        alt="Connected family"
        src="/img/connected-family-lineage.svg"
      />
    </section>
  );
};
