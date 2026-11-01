import { useState } from "react";

type Person = {
  initials?: string;
  name: string;
  dates: string;
  place: string;
  top: number;
  left: number;
  portrait?: string;
  selected?: boolean;
};

const ancestors: Person[] = [
  {
    initials: "AB",
    name: "Arthur Bennett",
    dates: "1898 – 1974",
    place: "Yorkshire, England",
    top: 64,
    left: 92,
  },
  {
    initials: "RM",
    name: "Rose Mitchell",
    dates: "1902 – 1986",
    place: "Yorkshire, England",
    top: 64,
    left: 272,
  },
  {
    initials: "GE",
    name: "George Ellis",
    dates: "1901 – 1978",
    place: "Bath, England",
    top: 64,
    left: 452,
  },
  {
    initials: "IC",
    name: "Ivy Clarke",
    dates: "1905 – 1992",
    place: "Bristol, England",
    top: 64,
    left: 632,
  },
  {
    initials: "HW",
    name: "Henry Walker",
    dates: "1904 – 1981",
    place: "Edinburgh, Scotland",
    top: 64,
    left: 812,
  },
  {
    initials: "AF",
    name: "Alice Fraser",
    dates: "1908 – 1996",
    place: "Stirling, Scotland",
    top: 64,
    left: 992,
  },
  {
    initials: "EH",
    name: "Edward Hayes",
    dates: "1906 – 1988",
    place: "Oxford, England",
    top: 64,
    left: 1172,
  },
  {
    initials: "MC",
    name: "Margaret Collins",
    dates: "1910 – 1999",
    place: "Oxford, England",
    top: 64,
    left: 1352,
  },
];

const descendants: Person[] = [
  {
    name: "James Bennett",
    dates: "1932 – 2018",
    place: "York, England",
    top: 254,
    left: 272,
    portrait: "/img/portrait-36.png",
  },
  {
    name: "Eleanor Ellis",
    dates: "1935 – 2021",
    place: "Bath, England",
    top: 254,
    left: 452,
    portrait: "/img/portrait-43.png",
  },
  {
    name: "William Walker",
    dates: "1938 – 2019",
    place: "Edinburgh, Scotland",
    top: 254,
    left: 992,
    portrait: "/img/portrait-38.png",
  },
  {
    name: "Grace Hayes",
    dates: "Born 1941",
    place: "Oxford, England",
    top: 254,
    left: 1172,
    portrait: "/img/portrait-46.png",
  },
  {
    name: "David Bennett",
    dates: "Born 1967",
    place: "London, England",
    top: 444,
    left: 632,
    portrait: "/img/portrait-44.png",
  },
  {
    name: "Sophie Walker",
    dates: "Born 1970",
    place: "London, England",
    top: 444,
    left: 812,
    portrait: "/img/portrait-45.png",
  },
  {
    name: "Daniel Walker",
    dates: "Born 1972",
    place: "London, England",
    top: 444,
    left: 1172,
    portrait: "/img/portrait-45.png",
  },
  {
    name: "Sarah Hayes",
    dates: "Born 1975",
    place: "London, England",
    top: 444,
    left: 1352,
    portrait: "/img/portrait-46.png",
  },
  {
    name: "Emma Bennett",
    dates: "Born 1998",
    place: "London, England",
    top: 634,
    left: 632,
    portrait: "/img/portrait-47.png",
    selected: true,
  },
  {
    name: "Thomas Bennett",
    dates: "Born 2001",
    place: "London, England",
    top: 634,
    left: 812,
    portrait: "/img/portrait-43.png",
  },
  {
    name: "Olivia Bennett",
    dates: "Born 2003",
    place: "London, England",
    top: 634,
    left: 992,
    portrait: "/img/portrait-44.png",
  },
  {
    name: "Ava Walker",
    dates: "Born 2008",
    place: "London, England",
    top: 634,
    left: 1262,
    portrait: "/img/portrait-47.png",
  },
];

const relationshipMarkers = [
  { top: 307, left: 427, asset: "/img/relationship-heart-25.svg" },
  { top: 307, left: 1147, asset: "/img/relationship-heart-26.svg" },
  { top: 497, left: 787, asset: "/img/relationship-heart-27.svg" },
  { top: 497, left: 1327, asset: "/img/relationship-heart-28.svg" },
  { top: 117, left: 247, asset: "/img/relationship-heart-29.svg" },
  { top: 117, left: 607, asset: "/img/relationship-heart-30.svg" },
  { top: 117, left: 967, asset: "/img/relationship-heart-31.svg" },
  { top: 117, left: 1327, asset: "/img/relationship-heart-32.svg" },
];

const legendItems = [
  { label: "Married", asset: "/img/relationship-heart-22.svg" },
  { label: "Partners", asset: "/img/relationship-heart-23.svg" },
];

const controlButtonClass =
  "flex h-10 items-center justify-center relative bg-[#fffdf9] rounded-lg overflow-hidden border border-solid border-[#dedcd2] hover:bg-[#f2f0e8] focus-visible:ring-2 focus-visible:ring-[#355b43] focus-visible:outline-none";

const PersonCard = ({ person }: { person: Person }) => (
  <article
    className={`absolute flex flex-col w-[156px] h-[132px] items-center gap-[5px] pt-3 pb-2.5 px-1.5 rounded-xl overflow-hidden shadow-[0px_3px_8px_#3444320a] ${
      person.selected
        ? "bg-[#f2f6ed] border-2 border-solid border-[#355b43]"
        : "bg-[#fffdf9] border border-solid border-[#dedcd2]"
    }`}
    style={{ top: person.top, left: person.left }}
    aria-label={`${person.name}, ${person.dates}`}
  >
    {person.portrait ? (
      <img
        className="relative w-10 h-10 object-cover rounded-full"
        alt={`${person.name} portrait`}
        src={person.portrait}
      />
    ) : (
      <div className="flex w-10 h-10 items-center justify-center relative bg-[#ece9e0] rounded-[100px] overflow-hidden">
        <span className="relative w-fit [font-family:'Lora',Helvetica] font-normal text-[#617b58] text-[15px] tracking-[0] leading-[normal]">
          {person.initials}
        </span>
      </div>
    )}
    <div className="relative self-stretch [font-family:'Inter',Helvetica] font-semibold text-[#283b30] text-[13px] text-center tracking-[0] leading-[normal]">
      {person.name}
    </div>
    <div className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-[11px] tracking-[0] leading-[normal] whitespace-nowrap">
      {person.dates}
    </div>
    <div className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-[10px] tracking-[0] leading-[normal] whitespace-nowrap">
      {person.place}
    </div>
  </article>
);

export const FamilyTreeWorkspaceSection = (): JSX.Element => {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const increaseZoom = () => setZoom((value) => Math.min(value + 10, 200));
  const decreaseZoom = () => setZoom((value) => Math.max(value - 10, 50));
  const resetZoom = () => setZoom(100);

  return (
    <section
      className="relative w-[1600px] h-[1090px] bg-[#f6f4ee]"
      aria-label="Family tree workspace"
      data-fullscreen={isFullscreen}
    >
      <img
        className="absolute top-[129px] left-[248px] w-[1104px] h-[505px]"
        alt="Connected family lineage"
        src="/img/connected-family-lineage-3.svg"
      />
      <div className="absolute top-[687px] left-[27px] [font-family:'Inter',Helvetica] font-semibold text-[#7b8177] text-[10px] tracking-[0.13px] leading-[normal] whitespace-nowrap">
        YOUNGEST GENERATION
      </div>
      {ancestors.map((person) => (
        <PersonCard key={person.name} person={person} />
      ))}

      {descendants.map((person) => (
        <PersonCard key={person.name} person={person} />
      ))}

      {relationshipMarkers.map((marker) => (
        <div
          key={`${marker.top}-${marker.left}`}
          className="flex w-[26px] h-[26px] items-center justify-center absolute bg-[#f6f4ee] rounded-[100px] overflow-hidden"
          style={{ top: marker.top, left: marker.left }}
          aria-hidden="true"
        >
          <img className="relative w-3.5 h-[13px]" alt="" src={marker.asset} />
        </div>
      ))}

      <aside
        className="inline-flex h-9 items-center gap-5 absolute top-[1013px] left-9"
        aria-label="Relationship legend"
      >
        <div className="relative w-fit [font-family:'Inter',Helvetica] font-semibold text-[#7b8177] text-[11px] tracking-[0] leading-[normal] whitespace-nowrap">
          Relationships:
        </div>
        {legendItems.map((item) => (
          <div
            key={item.label}
            className="inline-flex items-center gap-1.5 relative flex-[0_0_auto]"
          >
            <div className="relative w-[26px] h-[26px]">
              <div className="flex w-[26px] h-[26px] items-center justify-center relative bg-[#f6f4ee] rounded-[100px] overflow-hidden">
                <img
                  className="relative w-3.5 h-[13px]"
                  alt=""
                  src={item.asset}
                />
              </div>
            </div>
            <div className="font-normal text-[#7b8177] text-[11px] whitespace-nowrap relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
              {item.label}
            </div>
          </div>
        ))}
        <div className="inline-flex items-center gap-1.5 relative flex-[0_0_auto]">
          <div className="relative w-[26px] h-[26px]">
            <div className="flex w-[26px] h-[26px] items-center justify-center relative bg-[#f6f4ee] rounded-[100px] overflow-hidden">
              <img
                className="relative w-3.5 h-[13px]"
                alt=""
                src="/img/relationship-heart-24.svg"
              />
              <img
                className="absolute top-1 left-1 w-[17px] h-[17px]"
                alt=""
                src="/img/separation-indicator-2.svg"
              />
            </div>
          </div>
          <div className="font-normal text-[#7b8177] text-[11px] whitespace-nowrap relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
            Separated
          </div>
        </div>
        <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
          <div className="relative w-5 h-[1.5px] bg-[#a2ae9c]" />
          <div className="mt-[-1.00px] font-normal text-[#7b8177] text-[11px] whitespace-nowrap relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
            Parent–child
          </div>
        </div>
      </aside>
      <nav
        className="inline-flex h-10 items-center gap-3.5 absolute top-[1011px] left-[1280px]"
        aria-label="Workspace controls"
      >
        <button
          type="button"
          className={`${controlButtonClass} w-10`}
          aria-label="Reset view"
          onClick={resetZoom}
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
            className="relative w-4 h-4 mt-3 focus-visible:ring-2 focus-visible:ring-[#355b43] focus-visible:outline-none"
            aria-label="Zoom out"
            onClick={decreaseZoom}
          >
            <img
              className="absolute w-[84.17%] h-[55.00%] top-[45.00%] left-[15.83%]"
              alt=""
              src="/img/vector-44.svg"
            />
          </button>
          <button
            type="button"
            className="relative w-fit mt-2.5 [font-family:'Inter',Helvetica] font-normal text-[#283b30] text-xs tracking-[0] leading-[normal] focus-visible:ring-2 focus-visible:ring-[#355b43] focus-visible:outline-none"
            onClick={resetZoom}
            aria-label="Reset zoom"
          >
            {zoom}%
          </button>
          <button
            type="button"
            className="relative w-4 h-4 mt-3 focus-visible:ring-2 focus-visible:ring-[#355b43] focus-visible:outline-none"
            aria-label="Zoom in"
            onClick={increaseZoom}
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
          className={`${controlButtonClass} w-10`}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          onClick={() => setIsFullscreen((value) => !value)}
        >
          <span className="relative w-[18px] h-[18px]">
            <img
              className="absolute w-[87.78%] h-[58.61%] top-[41.39%] left-[12.22%]"
              alt=""
              src="/img/vector-46.svg"
            />
          </span>
        </button>
      </nav>
    </section>
  );
};
