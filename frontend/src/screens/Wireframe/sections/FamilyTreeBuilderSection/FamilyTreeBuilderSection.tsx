import { useState } from "react";
import { Link } from "react-router-dom";

export const FamilyTreeBuilderSection = (): JSX.Element => {
  const [treeName, setTreeName] = useState("Your family tree");
  const [newTreeName, setNewTreeName] = useState("");
  const [treeDescription, setTreeDescription] = useState("");

  const handleCreateTree = (): void => {
    setTreeName(newTreeName.trim() || "Your family tree");
  };

  return (
    <main className="flex min-h-0 w-full flex-1 items-stretch">
      <section
        aria-labelledby="create-tree-heading"
        className="flex flex-col h-full w-[480px] shrink-0 items-start gap-7 p-12 relative bg-[#ede8dc] border-r-2 [border-right-style:solid] border-[#c8bfa8]"
      >
        <h1
          id="create-tree-heading"
          className="w-fit mt-[-2.00px] [font-family:'Lora',Helvetica] text-[#2e3b2c] text-[22px] tracking-[2.00px] relative font-normal leading-[normal]"
          >
            CREATE YOUR TREE
        </h1>
<div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
  <label
    htmlFor="new-tree-name"
    className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#7a6e5c] text-[11px] tracking-[2.00px] leading-[normal] whitespace-nowrap"
  >
    NAME OF TREE
  </label>
  <div className="relative self-stretch w-full h-[46px] bg-[#faf8f4] rounded overflow-hidden border border-solid border-[#c8bfa8]">
    <input
      id="new-tree-name"
      name="newTreeName"
      type="text"
      value={newTreeName}
      onChange={(event) => setNewTreeName(event.target.value)}
      placeholder="e.g. Smith Family Tree"
      className="absolute inset-0 w-full h-full px-3.5 [font-family:'Inter',Helvetica] font-normal text-[#2e3b2c] text-[15px] tracking-[0] leading-[normal] placeholder:text-[#b0a48e]"
    />
  </div>
</div>

<div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
  <label
    htmlFor="tree-description"
    className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#7a6e5c] text-[11px] tracking-[2.00px] leading-[normal] whitespace-nowrap"
  >
    {/* Optional based on DB restrictions */}
    TREE DESCRIPTION (OPTIONAL)
  </label>
  <div className="relative self-stretch w-full h-[46px] bg-[#faf8f4] rounded overflow-hidden border border-solid border-[#c8bfa8]">
    <input
      id="tree-description"
      name="treeDescription"
      type="text"
      value={treeDescription}
      onChange={(event) => setTreeDescription(event.target.value)}
      placeholder="e.g. Our family's history"
      className="absolute inset-0 w-full h-full px-3.5 [font-family:'Inter',Helvetica] font-normal text-[#2e3b2c] text-[15px] tracking-[0] leading-[normal] placeholder:text-[#b0a48e]"
    />
  </div>
</div>
      </section>
      <section className="flex flex-col h-full min-w-0 items-center gap-9 px-[60px] py-[52px] relative flex-1 grow bg-[#f5f0e8]">
        <header className="flex flex-col items-center gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
          <h2 className="relative self-stretch mt-[-1.00px] [font-family:'Lora',Helvetica] font-normal text-[#2e3b2c] text-3xl text-center tracking-[0] leading-[normal]">
            Begin Your Family Tree
          </h2>
          <p className="relative self-stretch [font-family:'Inter',Helvetica] font-normal text-[#7a6e5c] text-[15px] text-center tracking-[0] leading-[normal]">
            Give your family tree a name and optional description.
            <br />
            You can add family members after the tree is created.
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
                FAMILY TREE
              </div>
            </div>
          </div>
          <p className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#b0a48e] text-xs text-center tracking-[0.50px] leading-[normal]">
            Your tree is ready for its first family member.
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
              to="/family-tree"
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
