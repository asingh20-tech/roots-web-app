import { useState } from "react";

type FamilyMember = {
  id: string;
  initials?: string;
  name: string;
  dates: string;
  location: string;
  image?: string;
  top: number;
  left: number;
  selected?: boolean;
};

const familyMembers: FamilyMember[] = [
  {
    id: "arthur",
    initials: "AB",
    name: "Arthur Bennett",
    dates: "1898 – 1974",
    location: "Yorkshire, England",
    top: 64,
    left: 92,
  },
  {
    id: "rose",
    initials: "RM",
    name: "Rose Mitchell",
    dates: "1902 – 1986",
    location: "Yorkshire, England",
    top: 64,
    left: 272,
  },
  {
    id: "george",
    initials: "GE",
    name: "George Ellis",
    dates: "1901 – 1978",
    location: "Bath, England",
    top: 64,
    left: 452,
  },
  {
    id: "ivy",
    initials: "IC",
    name: "Ivy Clarke",
    dates: "1905 – 1992",
    location: "Bristol, England",
    top: 64,
    left: 632,
  },
  {
    id: "henry",
    initials: "HW",
    name: "Henry Walker",
    dates: "1904 – 1981",
    location: "Edinburgh, Scotland",
    top: 64,
    left: 812,
  },
  {
    id: "alice",
    initials: "AF",
    name: "Alice Fraser",
    dates: "1908 – 1996",
    location: "Stirling, Scotland",
    top: 64,
    left: 992,
  },
  {
    id: "edward",
    initials: "EH",
    name: "Edward Hayes",
    dates: "1906 – 1988",
    location: "Oxford, England",
    top: 64,
    left: 1172,
  },
  {
    id: "margaret",
    initials: "MC",
    name: "Margaret Collins",
    dates: "1910 – 1999",
    location: "Oxford, England",
    top: 64,
    left: 1352,
  },
  {
    id: "james",
    name: "James Bennett",
    dates: "1932 – 2018",
    location: "York, England",
    image: "/img/portrait-36.png",
    top: 254,
    left: 272,
  },
  {
    id: "eleanor",
    name: "Eleanor Ellis",
    dates: "1935 – 2021",
    location: "Bath, England",
    image: "/img/portrait-43.png",
    top: 254,
    left: 452,
  },
  {
    id: "william",
    name: "William Walker",
    dates: "1938 – 2019",
    location: "Edinburgh, Scotland",
    image: "/img/portrait-38.png",
    top: 254,
    left: 992,
  },
  {
    id: "grace",
    name: "Grace Hayes",
    dates: "Born 1941",
    location: "Oxford, England",
    image: "/img/portrait-46.png",
    top: 254,
    left: 1172,
  },
  {
    id: "david",
    name: "David Bennett",
    dates: "Born 1967",
    location: "London, England",
    image: "/img/portrait-44.png",
    top: 444,
    left: 632,
  },
  {
    id: "sophie",
    name: "Sophie Walker",
    dates: "Born 1970",
    location: "London, England",
    image: "/img/portrait-45.png",
    top: 444,
    left: 812,
  },
  {
    id: "daniel",
    name: "Daniel Walker",
    dates: "Born 1972",
    location: "London, England",
    image: "/img/portrait-45.png",
    top: 444,
    left: 1172,
  },
  {
    id: "sarah",
    name: "Sarah Hayes",
    dates: "Born 1975",
    location: "London, England",
    image: "/img/portrait-46.png",
    top: 444,
    left: 1352,
  },
  {
    id: "emma",
    name: "Emma Bennett",
    dates: "Born 1998",
    location: "London, England",
    image: "/img/portrait-47.png",
    top: 634,
    left: 632,
    selected: true,
  },
  {
    id: "thomas",
    name: "Thomas Bennett",
    dates: "Born 2001",
    location: "London, England",
    image: "/img/portrait-43.png",
    top: 634,
    left: 812,
  },
  {
    id: "olivia",
    name: "Olivia Bennett",
    dates: "Born 2003",
    location: "London, England",
    image: "/img/portrait-44.png",
    top: 634,
    left: 992,
  },
  {
    id: "ava",
    name: "Ava Walker",
    dates: "Born 2008",
    location: "London, England",
    image: "/img/portrait-47.png",
    top: 634,
    left: 1262,
  },
];

const relationshipMarkers = [
  { top: 307, left: 427, image: "/img/relationship-heart.svg" },
  { top: 307, left: 1147, image: "/img/relationship-heart-1.svg" },
  { top: 497, left: 787, image: "/img/relationship-heart-2.svg" },
  { top: 497, left: 1327, image: "/img/relationship-heart-3.svg" },
  { top: 117, left: 247, image: "/img/relationship-heart-4.svg" },
  { top: 117, left: 607, image: "/img/relationship-heart-5.svg" },
  { top: 117, left: 967, image: "/img/relationship-heart-6.svg" },
  { top: 117, left: 1327, image: "/img/relationship-heart-7.svg" },
];

const legendRelationships = [
  { label: "Married", image: "/img/relationship-heart-8.svg" },
  { label: "Partners", image: "/img/relationship-heart-9.svg" },
  {
    label: "Separated",
    image: "/img/relationship-heart-10.svg",
    separated: true,
  },
];

export const FamilyTreeWorkspaceSection = (): JSX.Element => {
  const [selectedMember, setSelectedMember] = useState("emma");
  const [zoom, setZoom] = useState(100);

  const adjustZoom = (amount: number) => {
    setZoom((currentZoom) => Math.min(200, Math.max(50, currentZoom + amount)));
  };

  return (
    <section
      aria-label="Family tree workspace"
      className="relative self-stretch w-full h-[1090px] bg-[#f6f4ee]"
    >
      <img
        className="absolute top-[129px] left-[248px] w-[1104px] h-[505px]"
        alt="Connected family"
        src="/img/connected-family-lineage-3.svg"
      />
      {familyMembers.map((member) => {
        const isSelected = selectedMember === member.id;
        return (
          <article
            key={member.id}
            aria-label={`${member.name}, ${member.dates}`}
            className={`w-[156px] h-[132px] gap-[5px] pt-3 pb-2.5 px-1.5 absolute bg-[#fffdf9] rounded-xl border border-solid shadow-[0px_3px_8px_#3444320a] flex flex-col items-center overflow-hidden ${
              isSelected
                ? "bg-[#f2f6ed] border-2 border-[#355b43]"
                : "border-[#dedcd2]"
            }`}
            style={{ top: member.top, left: member.left }}
          >
            <button
              type="button"
              aria-label={`Select ${member.name}`}
              onClick={() => setSelectedMember(member.id)}
              className="flex w-full h-full flex-col items-center gap-[5px] p-0"
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
              <span className="relative self-stretch [font-family:'Inter',Helvetica] font-semibold text-[#283b30] text-[13px] text-center tracking-[0] leading-[normal]">
                {member.name}
              </span>
              <span className="text-[#7b8177] text-[11px] relative w-fit [font-family:'Inter',Helvetica] font-normal tracking-[0] leading-[normal] whitespace-nowrap">
                {member.dates}
              </span>
              <span className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-[10px] tracking-[0] leading-[normal] whitespace-nowrap">
                {member.location}
              </span>
            </button>
          </article>
        );
      })}

      {relationshipMarkers.map((marker, index) => (
        <div
          key={`${marker.image}-${index}`}
          className="flex w-[26px] h-[26px] items-center justify-center absolute bg-[#f6f4ee] rounded-[100px] overflow-hidden"
          style={{ top: marker.top, left: marker.left }}
          aria-hidden="true"
        >
          <img className="relative w-3.5 h-[13px]" alt="" src={marker.image} />
        </div>
      ))}

      <div className="absolute top-[687px] left-[27px] [font-family:'Inter',Helvetica] font-semibold text-[#7b8177] text-[10px] tracking-[0.13px] leading-[normal] whitespace-nowrap">
        YOUNGEST GENERATION
      </div>
      <div className="inline-flex h-10 items-center gap-3.5 absolute top-[1011px] left-[1280px]">
        <button
          type="button"
          aria-label="Fit family tree to screen"
          className="flex w-10 h-10 items-center justify-center relative bg-[#fffdf9] rounded-lg overflow-hidden border border-solid border-[#dedcd2]"
        >
          <span className="relative w-[18px] h-[18px]">
            <img
              className="absolute w-[91.94%] h-[91.94%] top-[8.06%] left-[8.06%]"
              alt=""
              src="/img/vector-18.svg"
            />
          </span>
        </button>
        <div className="inline-flex h-10 items-start gap-5 px-3.5 py-0 relative flex-[0_0_auto] bg-[#fffdf9] rounded-lg overflow-hidden border border-solid border-[#dedcd2]">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => adjustZoom(-10)}
            className="relative w-4 h-4"
          >
            <img
              className="absolute w-[84.17%] h-[55.00%] top-[45.00%] left-[15.83%]"
              alt=""
              src="/img/vector-19.svg"
            />
          </button>
          <span className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#283b30] text-xs tracking-[0] leading-[normal]">
            {zoom}%
          </span>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => adjustZoom(10)}
            className="relative w-4 h-4"
          >
            <img
              className="absolute w-[84.17%] h-[84.17%] top-[15.83%] left-[15.83%]"
              alt=""
              src="/img/vector-20.svg"
            />
          </button>
        </div>
        <button
          type="button"
          aria-label="More family tree options"
          className="flex w-10 h-10 items-center justify-center relative bg-[#fffdf9] rounded-lg overflow-hidden border border-solid border-[#dedcd2]"
        >
          <span className="relative w-[18px] h-[18px]">
            <img
              className="absolute w-[87.77%] h-[58.61%] top-[41.39%] left-[12.23%]"
              alt=""
              src="/img/vector-21.svg"
            />
          </span>
        </button>
      </div>
      <div className="inline-flex h-9 items-center gap-5 absolute top-[1013px] left-9">
        <div className="relative w-fit [font-family:'Inter',Helvetica] font-semibold text-[#7b8177] text-[11px] tracking-[0] leading-[normal] whitespace-nowrap">
          Relationships:
        </div>
        {legendRelationships.map((relationship) => (
          <div
            key={relationship.label}
            className="inline-flex items-center gap-1.5 relative flex-[0_0_auto]"
          >
            <div className="relative w-[26px] h-[26px]">
              <div className="flex w-[26px] h-[26px] items-center justify-center relative bg-[#f6f4ee] rounded-[100px] overflow-hidden">
                <img
                  className="relative w-3.5 h-[13px]"
                  alt=""
                  src={relationship.image}
                />
                {relationship.separated && (
                  <img
                    className="absolute top-1 left-1 w-[17px] h-[17px]"
                    alt=""
                    src="/img/separation-indicator-2.svg"
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
      </div>
    </section>
  );
};
