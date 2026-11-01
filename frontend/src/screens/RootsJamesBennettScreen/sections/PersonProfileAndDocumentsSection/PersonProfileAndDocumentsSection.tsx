import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { Link } from "react-router-dom";

const familyInformation = [
  "Requested person: James Bennett",
  "Connection: Child of Arthur Bennett and Rose Mitchell",
  "Place of origin: York, England",
  "Birth year: 1932",
  "Death year: 2018",
  "Partner: Eleanor Ellis",
  "Child: David Bennett",
];

export const PersonProfileAndDocumentsSection = (): JSX.Element => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [requestedDocuments, setRequestedDocuments] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [notes, setNotes] = useState(
    "Found in a family census record and confirmed through a conversation with a great aunt.",
  );
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setSelectedFileName(file.name);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!requestedDocuments.trim()) {
      setSubmitted(false);
      return;
    }

    setSubmitted(true);
  };

  return (
    <section
      aria-labelledby="document-request-title"
      className="flex flex-col w-[1160px] items-start gap-6 p-8 absolute top-24 left-[220px] bg-[#fffdf9] rounded-[20px] overflow-hidden border border-solid border-[#dedcd2] shadow-[0px_18px_48px_#3444321f]"
    >
      <header className="items-center justify-between flex relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col items-start gap-2 relative flex-1 grow">
          <h1
            id="document-request-title"
            className="relative w-fit mt-[-1.00px] [font-family:'Lora',Helvetica] font-normal text-[#283b30] text-[32px] tracking-[-0.26px] leading-[normal]"
          >
            James Bennett · Upload Document
          </h1>
          <p className="relative self-stretch [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-sm tracking-[0] leading-[21px]">
            Share what you know, and the tree owner will review your request
            before adding these documents to James Bennett&apos;s record.
          </p>
        </div>
        <Link
          aria-label="Close document request"
          className="flex flex-col w-10 h-10 items-center justify-center relative bg-[#fffdf9] rounded-[10px] overflow-hidden border border-solid border-[#dedcd2]"
          to="/roots-u183-bennett-family-tree"
        >
          <div className="relative w-4 h-4">
            <img
              className="absolute w-[96.67%] h-[96.67%] top-[3.33%] left-[3.33%]"
              alt=""
              src="/img/vector-22.svg"
            />
          </div>
        </Link>
      </header>
      <div className="items-start gap-6 flex relative self-stretch w-full flex-[0_0_auto]">
        <aside className="flex flex-col w-[344px] items-start gap-5 relative">
          <article className="gap-5 p-7 relative self-stretch w-full flex-[0_0_auto] bg-[#fffdf9] rounded-2xl border border-solid border-[#dedcd2] flex flex-col items-center overflow-hidden">
            <img
              className="relative w-32 h-32 object-cover"
              alt="James portrait"
              src="/img/james-portrait-1.png"
            />
            <div className="flex flex-col items-start gap-[9px] relative self-stretch w-full flex-[0_0_auto]">
              <div className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#617b58] text-[11px] tracking-[0.19px] leading-[normal] whitespace-nowrap">
                THE BENNETT FAMILY
              </div>
              <h2 className="relative self-stretch [font-family:'Lora',Helvetica] font-normal text-[#283b30] text-[38px] tracking-[-0.30px] leading-[normal]">
                James Bennett
              </h2>
              <div className="inline-flex items-center gap-4 relative flex-[0_0_auto]">
                <div className="mt-[-1.00px] text-[#283b30] text-base relative w-fit [font-family:'Inter',Helvetica] font-normal tracking-[0] leading-[normal] whitespace-nowrap">
                  1932 – 2018
                </div>
                <div
                  aria-hidden="true"
                  className="relative w-[3px] h-[3px] bg-[#7b8177] rounded-[1.5px]"
                />
                <div className="inline-flex items-center gap-1.5 relative flex-[0_0_auto]">
                  <div className="relative w-[15px] h-[15px]">
                    <img
                      className="absolute w-[88.66%] h-[97.00%] top-[3.00%] left-[11.34%]"
                      alt=""
                      src="/img/vector-23.svg"
                    />
                  </div>
                  <div className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-sm tracking-[0] leading-[normal]">
                    York, England
                  </div>
                </div>
              </div>
            </div>
            <div className="inline-flex flex-col items-end gap-3 relative flex-[0_0_auto]">
              <button
                type="button"
                className="h-11 justify-center px-[18px] py-0 bg-[#fffdf9] border-[#dedcd2] inline-flex items-center gap-2 relative rounded-lg overflow-hidden border border-solid"
              >
                <div className="relative w-4 h-4">
                  <img
                    className="absolute w-[92.50%] h-[92.50%] top-[7.50%] left-[7.50%]"
                    alt=""
                    src="/img/vector-24.svg"
                  />
                </div>
                <span className="font-semibold text-[#355b43] text-[13px] relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
                  View in family tree
                </span>
              </button>
              <p className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-xs tracking-[0] leading-[normal]">
                Person details · Family record
              </p>
            </div>
          </article>
          <article className="gap-4 p-5 bg-[#f6f4ee] rounded-2xl border border-solid border-[#dedcd2] flex flex-col items-start relative self-stretch w-full flex-[0_0_auto] overflow-hidden">
            <h2 className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#283b30] text-lg tracking-[0] leading-[normal]">
              Family information
            </h2>
            <ul className="flex flex-col items-start gap-3 relative self-stretch w-full flex-[0_0_auto]">
              {familyInformation.map((information) => (
                <li
                  key={information}
                  className="flex items-center gap-2.5 relative self-stretch w-full flex-[0_0_auto]"
                >
                  <span
                    aria-hidden="true"
                    className="relative w-1.5 h-1.5 bg-[#617b58] rounded-[3px]"
                  />
                  <span className="relative flex-1 mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#283b30] text-[13px] tracking-[0] leading-[normal]">
                    {information}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </aside>
        <form
          className="flex flex-col items-start gap-5 relative flex-1 grow"
          onSubmit={handleSubmit}
        >
          <section
            aria-labelledby="document-request-heading"
            className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]"
          >
            <h2
              id="document-request-heading"
              className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#283b30] text-lg tracking-[0] leading-[normal]"
            >
              Document request
            </h2>
            <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
              <label
                htmlFor="requested-documents"
                className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#283b30] text-[13px] tracking-[0] leading-[normal]"
              >
                Requested documents *
              </label>
              <input
                id="requested-documents"
                className="h-12 px-3.5 py-0 relative self-stretch w-full bg-[#fffdf9] rounded-[10px] overflow-hidden border border-solid border-[#dedcd2] flex-1 [font-family:'Inter',Helvetica] font-normal text-[#283b30] text-sm tracking-[0] leading-[normal]"
                placeholder="Birth certificate · Death certificate · Marriage certificate · Other"
                type="text"
                value={requestedDocuments}
                onChange={(event) => setRequestedDocuments(event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
              <span className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#283b30] text-[13px] tracking-[0] leading-[normal]">
                Upload supporting file (optional)
              </span>
              <button
                type="button"
                aria-label="Upload supporting file"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-12 items-center gap-2.5 px-3.5 py-0 relative self-stretch w-full bg-[#fffdf9] rounded-[10px] overflow-hidden border border-solid border-[#dedcd2] text-left"
              >
                <span className="relative flex-1 [font-family:'Inter',Helvetica] font-normal text-[#283b30] text-sm tracking-[0] leading-[normal]">
                  {selectedFileName || "+ Upload PDF, JPG, or PNG"}
                </span>
              </button>
              <input
                ref={fileInputRef}
                className="sr-only"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={handleFileChange}
                tabIndex={-1}
                aria-hidden="true"
              />
            </div>
          </section>
          <section
            aria-labelledby="notes-heading"
            className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]"
          >
            <h2
              id="notes-heading"
              className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#283b30] text-lg tracking-[0] leading-[normal]"
            >
              Notes for review
            </h2>
            <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
              <label
                htmlFor="review-notes"
                className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#283b30] text-[13px] tracking-[0] leading-[normal]"
              >
                Anything else the reviewer should know
              </label>
              <textarea
                id="review-notes"
                className="flex h-[120px] items-center gap-2.5 px-3.5 py-4 relative self-stretch w-full bg-[#fffdf9] rounded-[10px] overflow-hidden border border-solid border-[#dedcd2] resize-none [font-family:'Inter',Helvetica] font-normal text-[#283b30] text-sm tracking-[0] leading-[normal]"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
          </section>
          <aside
            aria-labelledby="request-process-heading"
            className="gap-2 p-4 bg-[#e8ede3] rounded-xl flex flex-col items-start relative self-stretch w-full flex-[0_0_auto] overflow-hidden"
          >
            <h2
              id="request-process-heading"
              className="w-fit mt-[-1.00px] font-semibold text-[#355b43] leading-[normal] relative [font-family:'Inter',Helvetica] text-[13px] tracking-[0]"
            >
              How this request works
            </h2>
            <p className="self-stretch font-normal text-[#283b30] leading-[19.5px] relative [font-family:'Inter',Helvetica] text-[13px] tracking-[0]">
              This request is sent for approval. The tree owner or an admin can
              review the details, ask questions, and then choose whether to add
              these documents to James Bennett&apos;s record.
            </p>
          </aside>
          {submitted && (
            <p
              role="status"
              className="relative self-stretch [font-family:'Inter',Helvetica] font-normal text-[#355b43] text-[13px] tracking-[0] leading-[normal]"
            >
              Your document request has been submitted for review.
            </p>
          )}

          <div className="flex h-12 items-start gap-3 relative self-stretch w-full">
            <button
              type="submit"
              className="flex h-12 items-center justify-center gap-2 px-4 py-0 relative flex-1 grow bg-[#355b43] rounded-[10px] overflow-hidden text-white"
            >
              <span className="font-semibold text-sm relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
                Submit request
              </span>
            </button>
            <Link
              className="flex h-12 items-center justify-center gap-2 px-4 py-0 relative flex-1 grow bg-[#fffdf9] rounded-[10px] overflow-hidden border border-solid border-[#dedcd2]"
              to="/roots-u183-bennett-family-tree"
            >
              <span className="font-semibold text-[#283b30] text-sm relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
                Cancel
              </span>
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
};
