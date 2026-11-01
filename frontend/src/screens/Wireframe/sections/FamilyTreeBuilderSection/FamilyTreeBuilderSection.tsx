import { useState } from "react";
import { Link } from "react-router-dom";

type Gender = "Male" | "Female" | "Other";

const genderOptions: Gender[] = ["Male", "Female", "Other"];

export const FamilyTreeBuilderSection = (): JSX.Element => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<Gender>("Male");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [treeName, setTreeName] = useState("You");

  const handleCreateTree = (): void => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    setTreeName(fullName || "You");
  };

  return (
    <main className="flex w-[1440px] h-[804px] items-start absolute top-[220px] left-0">
      <section
        aria-labelledby="about-you-heading"
        className="flex flex-col w-[480px] h-[804px] items-start gap-7 p-12 relative bg-[#ede8dc] border-r-2 [border-right-style:solid] border-[#c8bfa8]"
      >
        <h1
          id="about-you-heading"
          className="w-fit mt-[-2.00px] [font-family:'Lora',Helvetica] text-[#2e3b2c] text-[22px] tracking-[2.00px] relative font-normal leading-[normal]"
        >
          ABOUT YOU
        </h1>
        <p className="self-stretch [font-family:'Inter',Helvetica] text-[#7a6e5c] text-[13px] tracking-[0] relative font-normal leading-[normal]">
          Enter your personal details to start building your family tree.
        </p>
        <div
          aria-hidden="true"
          className="relative self-stretch w-full h-px bg-[#c8bfa8]"
        />
        <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
          <label
            htmlFor="first-name"
            className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#7a6e5c] text-[11px] tracking-[2.00px] leading-[normal] whitespace-nowrap"
          >
            FIRST NAME
          </label>
          <div className="relative self-stretch w-full h-[46px] bg-[#faf8f4] rounded overflow-hidden border border-solid border-[#c8bfa8]">
            <input
              id="first-name"
              name="firstName"
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="e.g. Sarah"
              className="absolute inset-0 w-full h-full px-3.5 [font-family:'Inter',Helvetica] font-normal text-[#2e3b2c] text-[15px] tracking-[0] leading-[normal] placeholder:text-[#b0a48e]"
            />
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
          <label
            htmlFor="last-name"
            className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#7a6e5c] text-[11px] tracking-[2.00px] leading-[normal] whitespace-nowrap"
          >
            LAST NAME / SURNAME
          </label>
          <div className="relative self-stretch w-full h-[46px] bg-[#faf8f4] rounded overflow-hidden border border-solid border-[#c8bfa8]">
            <input
              id="last-name"
              name="lastName"
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="e.g. Bennett"
              className="absolute inset-0 w-full h-full px-3.5 [font-family:'Inter',Helvetica] font-normal text-[#2e3b2c] text-[15px] tracking-[0] leading-[normal] placeholder:text-[#b0a48e]"
            />
          </div>
        </div>
        <fieldset className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
          <legend className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#7a6e5c] text-[11px] tracking-[2.00px] leading-[normal] whitespace-nowrap">
            GENDER
          </legend>
          <div className="flex items-start gap-3 relative self-stretch w-full flex-[0_0_auto]">
            {genderOptions.map((option) => {
              const selected = gender === option;

              return (
                <label
                  key={option}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 relative flex-[0_0_auto] bg-[#faf8f4] rounded border border-solid ${
                    selected ? "border-[#4a5e47]" : "border-[#c8bfa8]"
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={option}
                    checked={selected}
                    onChange={() => setGender(option)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`relative w-3.5 h-3.5 rounded-[7px] border border-solid ${
                      selected
                        ? "bg-[#4a5e47] border-[#4a5e47]"
                        : "bg-[#faf8f4] border-[#c8bfa8]"
                    }`}
                  />
                  <span className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#2e3b2c] text-sm tracking-[0] leading-[normal]">
                    {option}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
          <label
            htmlFor="date-of-birth"
            className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#7a6e5c] text-[11px] tracking-[2.00px] leading-[normal] whitespace-nowrap"
          >
            DATE OF BIRTH
          </label>
          <div className="relative self-stretch w-full h-[46px] bg-[#faf8f4] rounded overflow-hidden border border-solid border-[#c8bfa8]">
            <input
              id="date-of-birth"
              name="dateOfBirth"
              type="text"
              inputMode="numeric"
              autoComplete="bday"
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.target.value)}
              placeholder="MM / DD / YYYY"
              className="absolute inset-0 w-full h-full px-3.5 [font-family:'Inter',Helvetica] font-normal text-[#2e3b2c] text-[15px] tracking-[0] leading-[normal] placeholder:text-[#b0a48e]"
            />
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
          <label
            htmlFor="place-of-birth"
            className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#7a6e5c] text-[11px] tracking-[2.00px] leading-[normal] whitespace-nowrap"
          >
            PLACE OF BIRTH
          </label>
          <div className="relative self-stretch w-full h-[46px] bg-[#faf8f4] rounded overflow-hidden border border-solid border-[#c8bfa8]">
            <input
              id="place-of-birth"
              name="placeOfBirth"
              type="text"
              autoComplete="birthplace"
              value={placeOfBirth}
              onChange={(event) => setPlaceOfBirth(event.target.value)}
              placeholder="City, Country"
              className="absolute inset-0 w-full h-full px-3.5 [font-family:'Inter',Helvetica] font-normal text-[#2e3b2c] text-[15px] tracking-[0] leading-[normal] placeholder:text-[#b0a48e]"
            />
          </div>
        </div>
      </section>
      <section className="flex flex-col h-[804px] items-center gap-9 px-[60px] py-[52px] relative flex-1 grow bg-[#f5f0e8]">
        <header className="flex flex-col items-center gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
          <h2 className="relative self-stretch mt-[-1.00px] [font-family:'Lora',Helvetica] font-normal text-[#2e3b2c] text-3xl text-center tracking-[0] leading-[normal]">
            Begin Your Family Tree
          </h2>
          <p className="relative self-stretch [font-family:'Inter',Helvetica] font-normal text-[#7a6e5c] text-[15px] text-center tracking-[0] leading-[normal]">
            Fill in your details on the left, then create your tree.
            <br />
            You are the root — everyone else branches from you.
          </p>
        </header>
        <div
          aria-label="Family tree preview"
          className="flex flex-col h-[420px] items-center justify-center gap-5 relative self-stretch w-full bg-[#ede8dc] rounded-lg border border-solid border-[#c8bfa8]"
        >
          <div className="gap-2.5 px-7 py-5 bg-[#faf8f4] rounded-lg border border-solid border-[#4a5e47] shadow-[0px_4px_16px_#00000018] inline-flex flex-col items-center relative flex-[0_0_auto]">
            <div className="gap-1 inline-flex flex-col items-center relative flex-[0_0_auto]">
              <div className="relative w-fit mt-[-1.00px] [font-family:'Lora',Helvetica] font-normal text-[#2e3b2c] text-base tracking-[0] leading-[normal]">
                {treeName}
              </div>
              <div className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#7a6e5c] text-[11px] tracking-[1.00px] leading-[normal] whitespace-nowrap">
                THE ROOT
              </div>
            </div>
          </div>
          <p className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#b0a48e] text-xs text-center tracking-[0.50px] leading-[normal]">
            Your tree starts with just you.
          </p>
        </div>
        <div className="flex flex-col gap-3.5 self-stretch w-full items-center relative flex-[0_0_auto]">
          <div className="inline-flex justify-center gap-4 items-center relative flex-[0_0_auto]">
            <button
              type="button"
              onClick={handleCreateTree}
              className="inline-flex items-center justify-center gap-3 px-12 py-[18px] relative flex-[0_0_auto] bg-[#4a5e47] rounded-md shadow-[0px_4px_12px_#00000022]"
            >
              <span className="relative w-5 h-5" aria-hidden="true">
                <img
                  className="absolute w-[92.50%] h-[92.50%] top-[7.50%] left-[7.50%]"
                  alt=""
                  src="/img/vector-4.svg"
                />
              </span>
              <span className="relative w-fit mt-[-1.00px] [font-family:'Lora',Helvetica] font-normal text-[#faf8f4] text-lg tracking-[1.00px] leading-[normal]">
                Create tree
              </span>
            </button>
            <Link
              className="inline-flex items-center justify-center gap-3 px-12 py-[18px] relative flex-[0_0_auto] bg-[#4a5e47] rounded-md shadow-[0px_4px_12px_#00000022]"
              to="/roots-u183-bennett-family-tree"
            >
              <span className="relative w-5 h-5" aria-hidden="true">
                <span className="relative w-[75.00%] h-[75.00%] top-[12.50%] left-[12.50%] flex">
                  <img
                    className="flex-1 w-[14.5px]"
                    alt=""
                    src="/img/vector-5.svg"
                  />
                </span>
              </span>
              <span className="relative w-fit mt-[-1.00px] [font-family:'Lora',Helvetica] font-normal text-[#faf8f4] text-lg tracking-[1.00px] leading-[normal]">
                View tree
              </span>
            </Link>
          </div>
          <p className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#b0a48e] text-xs text-center tracking-[0] leading-[normal]">
            You can always add family members after your tree is created
          </p>
        </div>
      </section>
    </main>
  );
};
