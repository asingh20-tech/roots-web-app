import { useRef, useState } from "react";
import { Link } from "react-router-dom";

type FamilyMember = {
  initials?: string;
  name: string;
  dates: string;
  location: string;
  top: number;
  left: number;
  portrait?: string;
  selected?: boolean;
  href?: string;
};

type RelationshipLegendItem = {
  label: string;
  icon: string;
  separated?: boolean;
};

const familyMembers: FamilyMember[] = [
  {
    initials: "AB",
    name: "Arthur Bennett",
    dates: "1898 – 1974",
    location: "Yorkshire, England",
    top: 64,
    left: 92,
  },
  {
    initials: "RM",
    name: "Rose Mitchell",
    dates: "1902 – 1986",
    location: "Yorkshire, England",
    top: 64,
    left: 272,
  },
  {
    initials: "GE",
    name: "George Ellis",
    dates: "1901 – 1978",
    location: "Bath, England",
    top: 64,
    left: 452,
  },
  {
    initials: "IC",
    name: "Ivy Clarke",
    dates: "1905 – 1992",
    location: "Bristol, England",
    top: 64,
    left: 632,
  },
  {
    initials: "HW",
    name: "Henry Walker",
    dates: "1904 – 1981",
    location: "Edinburgh, Scotland",
    top: 64,
    left: 812,
  },
  {
    initials: "AF",
    name: "Alice Fraser",
    dates: "1908 – 1996",
    location: "Stirling, Scotland",
    top: 64,
    left: 992,
  },
  {
    initials: "EH",
    name: "Edward Hayes",
    dates: "1906 – 1988",
    location: "Oxford, England",
    top: 64,
    left: 1172,
  },
  {
    initials: "MC",
    name: "Margaret Collins",
    dates: "1910 – 1999",
    location: "Oxford, England",
    top: 64,
    left: 1352,
  },
  {
    name: "James Bennett",
    dates: "1932 – 2018",
    location: "York, England",
    top: 254,
    left: 272,
    portrait: "/img/portrait-36.png",
    href: "/roots-u183-james-bennett-u183-certificates-attached",
  },
  {
    name: "Eleanor Ellis",
    dates: "1935 – 2021",
    location: "Bath, England",
    top: 254,
    left: 452,
    portrait: "/img/portrait-43.png",
  },
  {
    name: "William Walker",
    dates: "1938 – 2019",
    location: "Edinburgh, Scotland",
    top: 254,
    left: 992,
    portrait: "/img/portrait-38.png",
  },
  {
    name: "Grace Hayes",
    dates: "Born 1941",
    location: "Oxford, England",
    top: 254,
    left: 1172,
    portrait: "/img/portrait-46.png",
  },
  {
    name: "David Bennett",
    dates: "Born 1967",
    location: "London, England",
    top: 444,
    left: 632,
    portrait: "/img/portrait-44.png",
  },
  {
    name: "Sophie Walker",
    dates: "Born 1970",
    location: "London, England",
    top: 444,
    left: 812,
    portrait: "/img/portrait-45.png",
  },
  {
    name: "Daniel Walker",
    dates: "Born 1972",
    location: "London, England",
    top: 444,
    left: 1172,
    portrait: "/img/portrait-45.png",
  },
  {
    name: "Sarah Hayes",
    dates: "Born 1975",
    location: "London, England",
    top: 444,
    left: 1352,
    portrait: "/img/portrait-46.png",
  },
  {
    name: "Emma Bennett",
    dates: "Born 1998",
    location: "London, England",
    top: 634,
    left: 632,
    portrait: "/img/portrait-47.png",
    selected: true,
  },
  {
    name: "Thomas Bennett",
    dates: "Born 2001",
    location: "London, England",
    top: 634,
    left: 812,
    portrait: "/img/portrait-43.png",
  },
  {
    name: "Olivia Bennett",
    dates: "Born 2003",
    location: "London, England",
    top: 634,
    left: 992,
    portrait: "/img/portrait-44.png",
  },
  {
    name: "Ava Walker",
    dates: "Born 2008",
    location: "London, England",
    top: 634,
    left: 1262,
    portrait: "/img/portrait-47.png",
  },
];

const relationshipLegend: RelationshipLegendItem[] = [
  {
    label: "Married",
    icon: "/img/relationship-heart-11.svg",
  },
  {
    label: "Partners",
    icon: "/img/relationship-heart-12.svg",
  },
  {
    label: "Separated",
    icon: "/img/relationship-heart-13.svg",
    separated: true,
  },
];

const relationshipMarkers = [
  { top: 307, left: 427, icon: "/img/relationship-heart-14.svg" },
  { top: 307, left: 1147, icon: "/img/relationship-heart-15.svg" },
  { top: 497, left: 787, icon: "/img/relationship-heart-16.svg" },
  { top: 497, left: 1327, icon: "/img/relationship-heart-17.svg" },
  { top: 117, left: 247, icon: "/img/relationship-heart-18.svg" },
  { top: 117, left: 607, icon: "/img/relationship-heart-19.svg" },
  { top: 117, left: 967, icon: "/img/relationship-heart-20.svg" },
  { top: 117, left: 1327, icon: "/img/relationship-heart-21.svg" },
];

const zoomLevels = [75, 100, 125];

const memberCardClass =
  "bg-[#fffdf9] border border-solid border-[#dedcd2] flex flex-col w-[156px] h-[132px] items-center gap-[5px] pt-3 pb-2.5 px-1.5 absolute rounded-xl overflow-hidden shadow-[0px_3px_8px_#3444320a]";

export const FamilyTreeCanvasSection = (): JSX.Element => {
  const [zoomIndex, setZoomIndex] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);

  const zoomOut = (): void => {
    setZoomIndex((current) => Math.max(0, current - 1));
  };

  const zoomIn = (): void => {
    setZoomIndex((current) => Math.min(zoomLevels.length - 1, current + 1));
  };

  const resetZoom = (): void => {
    setZoomIndex(1);
  };

  const toggleFullscreen = async (): Promise<void> => {
    if (!document.fullscreenElement && canvasRef.current) {
      await canvasRef.current.requestFullscreen();
    } else if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  };

  return (
    <section
      ref={canvasRef}
      aria-label="Bennett family tree"
      className="relative w-[1600px] h-[1090px] bg-[#f6f4ee]"
    >
      <img
        className="absolute top-[129px] left-[248px] w-[1104px] h-[505px]"
        alt="Connected family lineage"
        src="/img/connected-family-lineage-3.svg"
      />
      <div className="absolute top-[687px] left-[27px] [font-family:'Inter',Helvetica] font-semibold text-[#7b8177] text-[10px] tracking-[0.13px] leading-[normal] whitespace-nowrap">
        YOUNGEST GENERATION
      </div>
      {familyMembers.map((member) => {
        const cardClass = `${memberCardClass} ${
          member.selected
            ? "bg-[#f2f6ed] border-2 border-solid border-[#355b43]"
            : ""
        }`;

        const content = (
          <>
            {member.portrait ? (
              <img
                className="relative w-10 h-10 object-cover rounded-[100px]"
                alt={`${member.name} portrait`}
                src={member.portrait}
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
              {member.dates}
            </div>
            <div className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-[10px] tracking-[0] leading-[normal] whitespace-nowrap">
              {member.location}
            </div>
          </>
        );

        return member.href ? (
          <Link
            key={member.name}
            className={cardClass}
            style={{ top: member.top, left: member.left }}
            to={member.href}
            aria-label={`View details for ${member.name}`}
          >
            {content}
          </Link>
        ) : (
          <article
            key={member.name}
            className={cardClass}
            style={{ top: member.top, left: member.left }}
            aria-label={member.name}
          >
            {content}
          </article>
        );
      })}

      {relationshipMarkers.map((marker) => (
        <div
          key={`${marker.top}-${marker.left}`}
          className="flex w-[26px] h-[26px] items-center justify-center absolute bg-[#f6f4ee] rounded-[100px] overflow-hidden"
          style={{ top: marker.top, left: marker.left }}
          aria-hidden="true"
        >
          <img className="relative w-3.5 h-[13px]" alt="" src={marker.icon} />
        </div>
      ))}

      <aside
        aria-label="Relationship legend"
        className="inline-flex h-9 items-center gap-5 absolute top-[1013px] left-9"
      >
        <div className="relative w-fit [font-family:'Inter',Helvetica] font-semibold text-[#7b8177] text-[11px] tracking-[0] leading-[normal] whitespace-nowrap">
          Relationships:
        </div>
        {relationshipLegend.map((relationship) => (
          <div
            key={relationship.label}
            className="inline-flex items-center gap-1.5 relative flex-[0_0_auto]"
          >
            <div className="relative w-[26px] h-[26px]">
              <div className="flex w-[26px] h-[26px] items-center justify-center relative bg-[#f6f4ee] rounded-[100px] overflow-hidden">
                <img
                  className="relative w-3.5 h-[13px]"
                  alt=""
                  src={relationship.icon}
                />
                {relationship.separated && (
                  <img
                    className="absolute top-1 left-1 w-[17px] h-[17px]"
                    alt=""
                    src="/img/separation-indicator-1.svg"
                  />
                )}
              </div>
            </div>
            <div className="font-normal text-[#7b8177] text-[11px] whitespace-nowrap relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
              {relationship.label}
            </div>
          </div>
        ))}

        <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
          <div className="relative w-5 h-[1.5px] bg-[#a2ae9c]" />
          <div className="mt-[-1.00px] font-normal text-[#7b8177] text-[11px] whitespace-nowrap relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
            Parent–child
          </div>
        </div>
      </aside>
      <nav
        aria-label="Canvas controls"
        className="inline-flex h-10 items-center gap-3.5 absolute top-[1011px] left-[1280px]"
      >
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label="Toggle fullscreen"
          className="flex w-10 h-10 items-center justify-center relative bg-[#fffdf9] rounded-lg overflow-hidden border border-solid border-[#dedcd2]"
        >
          <span className="relative w-[18px] h-[18px]">
            <img
              className="absolute w-[91.94%] h-[91.94%] top-[8.06%] left-[8.06%]"
              alt=""
              src="/img/vector-43.svg"
            />
          </span>
        </button>
        <div className="inline-flex h-10 items-start gap-5 px-3.5 py-0 relative flex-[0_0_auto] bg-[#fffdf9] rounded-lg overflow-hidden border border-solid border-[#dedcd2]">
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoomIndex === 0}
            aria-label="Zoom out"
            className="relative w-4 h-4 disabled:opacity-40"
          >
            <img
              className="absolute w-[84.17%] h-[55.00%] top-[45.00%] left-[15.83%]"
              alt=""
              src="/img/vector-44.svg"
            />
          </button>
          <button
            type="button"
            onClick={resetZoom}
            aria-label="Reset zoom"
            className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#283b30] text-xs tracking-[0] leading-[normal]"
          >
            {zoomLevels[zoomIndex]}%
          </button>
          <button
            type="button"
            onClick={zoomIn}
            disabled={zoomIndex === zoomLevels.length - 1}
            aria-label="Zoom in"
            className="relative w-4 h-4 disabled:opacity-40"
          >
            <img
              className="absolute w-[84.17%] h-[84.17%] top-[15.83%] left-[15.83%]"
              alt=""
              src="/img/vector-45.svg"
            />
          </button>
        </div>
        <button
          type="button"
          aria-label="More canvas options"
          className="flex w-10 h-10 items-center justify-center relative bg-[#fffdf9] rounded-lg overflow-hidden border border-solid border-[#dedcd2]"
        >
          <span className="[font-family:'Inter',Helvetica] font-semibold text-[#283b30] text-xs tracking-[0] leading-[normal]">
            …
          </span>
        </button>
      </nav>
    </section>
  );
};
