import { ChangeEvent, FormEvent, useState } from "react";
import { Link } from "react-router-dom";

type DocumentRecord = {
  type: string;
  title: string;
  preview: string;
};

const familyInformation = [
  "Requested person: James Bennett",
  "Connection: Child of Arthur Bennett and Rose Mitchell",
  "Place of birth: York, England",
  "Birth year: 1932",
  "Death year: 2018",
  "Partner: Eleanor Ellis",
  "Child: David Bennett",
];

const documents: DocumentRecord[] = [
  {
    type: "Birth certificate",
    title: "James Bennett · Birth record",
    preview: "Birth certificate",
  },
  {
    type: "Death certificate",
    title: "James Bennett · Death record",
    preview: "Death certificate",
  },
  {
    type: "Marriage certificate",
    title: "James & Eleanor · Marriage record",
    preview: "Marriage certificate",
  },
];

export const PersonDetailsDialogSection = (): JSX.Element => {
  const [requestedDocuments, setRequestedDocuments] = useState("all");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="person-details-title"
      className="flex flex-col w-[1160px] h-[873px] items-start justify-between p-8 absolute top-24 left-[220px] bg-[#fffdf9] rounded-[20px] overflow-hidden border border-solid border-[#dedcd2] shadow-[0px_18px_48px_#3444321f]"
    >
      <div className="items-center flex gap-6 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col items-start gap-2 relative flex-1 grow">
          <h1
            id="person-details-title"
            className="relative self-stretch mt-[-1.00px] [font-family:'Lora',Helvetica] font-normal text-[#283b30] text-[32px] tracking-[-0.26px] leading-[normal]"
          >
            James Bennett · Person details
          </h1>
        </div>
        <Link
          aria-label="Close person details"
          className="flex flex-col w-10 h-10 items-center justify-center relative rounded-[10px] overflow-hidden border border-solid border-[#dedcd2]"
          to="/roots-u183-bennett-family-tree"
        >
          <img className="relative w-3.5 h-3.5" alt="" src="/img/close.svg" />
        </Link>
      </div>
      <div className="items-start flex gap-6 relative self-stretch w-full flex-[0_0_auto]">
        <aside className="flex flex-col w-[344px] items-start gap-5 relative">
          <section className="gap-5 p-7 relative self-stretch w-full flex-[0_0_auto] bg-[#fffdf9] rounded-2xl border border-solid border-[#dedcd2] flex flex-col items-center overflow-hidden">
            <img
              className="relative w-32 h-32 object-cover"
              alt="James portrait"
              src="/img/james-portrait-1.png"
            />
            <div className="flex flex-col items-start gap-[9px] relative self-stretch w-full flex-[0_0_auto]">
              <div className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#617b58] text-[11px] tracking-[0] leading-[normal] whitespace-nowrap">
                THE BENNETT FAMILY
              </div>
              <h2 className="relative self-stretch [font-family:'Lora',Helvetica] font-normal text-[#283b30] text-[38px] tracking-[-0.30px] leading-[normal]">
                James Bennett
              </h2>
              <div className="inline-flex items-center gap-4 relative flex-[0_0_auto]">
                <div className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#283b30] text-base tracking-[0] leading-[normal] whitespace-nowrap">
                  1932 – 2018
                </div>
                <div className="relative w-[3px] h-[3px] bg-[#7b8177] rounded-[1.5px]" />
                <div className="inline-flex items-center gap-1.5 relative flex-[0_0_auto]">
                  <img
                    className="relative w-2.5 h-[13px]"
                    alt=""
                    src="/img/map-pin.svg"
                  />
                  <div className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-sm tracking-[0] leading-[normal]">
                    York, England
                  </div>
                </div>
              </div>
            </div>
            <div className="inline-flex flex-col items-center gap-3 relative flex-[0_0_auto]">
              <Link
                className="inline-flex h-11 items-center gap-2 px-[18px] py-0 relative rounded-lg overflow-hidden border border-solid border-[#dedcd2]"
                to="/roots-u183-bennett-family-tree"
              >
                <img
                  className="relative w-3 h-3"
                  alt=""
                  src="/img/family-tree.svg"
                />
                <span className="font-semibold text-[#355b43] text-[13px] relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
                  View in family tree
                </span>
              </Link>
              <p className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-xs tracking-[0] leading-[normal]">
                Person details · Family record
              </p>
            </div>
          </section>
          <section className="flex flex-col items-start gap-4 p-5 relative self-stretch w-full flex-[0_0_auto] bg-[#f6f4ee] rounded-2xl overflow-hidden border border-solid border-[#dedcd2]">
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
          </section>
        </aside>
        <div className="flex flex-col h-[744px] items-start relative flex-1 grow">
          <div className="flex flex-col h-[672px] items-start pl-0 pr-6 py-0 relative self-stretch w-full overflow-hidden">
            <div className="flex flex-col items-start gap-6 pt-0 pb-8 px-0 relative self-stretch w-full flex-[0_0_auto]">
              <section className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
                <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                  <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
                    <h2 className="relative w-fit mt-[-0.50px] [font-family:'Inter',Helvetica] font-semibold text-[#283b30] text-lg tracking-[0] leading-[normal]">
                      Attached Documents
                    </h2>
                    <div className="inline-flex items-start px-2.5 py-[5px] relative flex-[0_0_auto] bg-[#e8ede3] rounded-[100px] overflow-hidden">
                      <span className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#355b43] text-[11px] tracking-[0] leading-[normal] whitespace-nowrap">
                        3 sample records
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-3 relative self-stretch w-full flex-[0_0_auto]">
                  {documents.map((document) => (
                    <article
                      key={document.type}
                      className="flex h-36 items-center gap-[18px] p-3.5 relative self-stretch w-full rounded-xl overflow-hidden border border-solid border-[#dedcd2]"
                    >
                      <div className="flex flex-col w-[92px] h-[114px] items-start p-[7px] relative bg-[#f0ebdf] rounded-[5px] overflow-hidden">
                        <div className="flex flex-col items-center gap-1.5 px-[5px] py-2 relative flex-1 self-stretch w-full grow border border-solid border-[#cbc3af]">
                          <div className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-bold text-[#827b69] text-[7px] tracking-[0.10px] leading-[normal] whitespace-nowrap">
                            SAMPLE
                          </div>
                          <div className="relative self-stretch [font-family:'Lora',Helvetica] font-normal text-[#283b30] text-[9px] text-center tracking-[0] leading-[normal]">
                            {document.preview}
                          </div>
                          <div className="relative w-12 h-px bg-[#c9c0aa]" />
                          <div className="relative self-stretch [font-family:'Inter',Helvetica] font-normal text-[#827b69] text-[6px] text-center tracking-[0] leading-[7.8px]">
                            {document.type === "Marriage certificate"
                              ? "James Bennett & Eleanor Ellis"
                              : "James Bennett"}
                          </div>
                          <div className="w-11 relative h-px bg-[#cec6b4]" />
                          <div className="w-9 relative h-px bg-[#cec6b4]" />
                          <div className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#827b69] text-[5px] tracking-[0] leading-[normal] whitespace-nowrap">
                            NOT AN OFFICIAL RECORD
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-[9px] relative flex-1 grow">
                        <div className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#617b58] text-xs tracking-[0] leading-[normal]">
                          {document.type}
                        </div>
                        <p className="relative self-stretch [font-family:'Inter',Helvetica] font-semibold text-[#283b30] text-base tracking-[0] leading-[normal]">
                          {document.title}
                        </p>
                        <p className="relative self-stretch [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-xs tracking-[0] leading-[normal]">
                          Illustrative attachment · Not verified evidence
                        </p>
                        <div className="inline-flex items-start px-[7px] py-1 relative flex-[0_0_auto] bg-[#f6f4ee] rounded overflow-hidden">
                          <span className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#827b69] text-[10px] tracking-[0] leading-[normal] whitespace-nowrap">
                            SAMPLE RECORD
                          </span>
                        </div>
                      </div>
                      <div
                        className="relative w-[18px] h-[18px]"
                        aria-hidden="true"
                      >
                        <img
                          className="absolute w-[87.50%] h-[95.84%] top-[4.16%] left-[12.50%]"
                          alt=""
                          src="/img/vector-10.svg"
                        />
                      </div>
                    </article>
                  ))}
                </div>
              </section>
              <div className="relative self-stretch w-full h-px bg-[#dedcd2]" />
              <form
                className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]"
                onSubmit={handleSubmit}
              >
                <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
                  <h2 className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#283b30] text-lg tracking-[0] leading-[normal]">
                    Add documents
                  </h2>
                  <p className="relative self-stretch [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-[13px] tracking-[0] leading-[19.5px]">
                    Have another certificate to share? Request an addition to
                    James&apos;s record.
                  </p>
                </div>
                <div className="flex-col items-start gap-2 flex relative self-stretch w-full flex-[0_0_auto]">
                  <label
                    htmlFor="requested-documents"
                    className="mt-[-1.00px] font-semibold text-[#283b30] text-[13px] relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]"
                  >
                    Requested documents *
                  </label>
                  <div className="relative self-stretch w-full">
                    <select
                      id="requested-documents"
                      required
                      value={requestedDocuments}
                      onChange={(event) =>
                        setRequestedDocuments(event.target.value)
                      }
                      className="appearance-none min-h-12 items-center gap-2.5 p-3.5 pr-10 rounded-[10px] overflow-hidden border border-solid border-[#dedcd2] flex relative self-stretch w-full [font-family:'Inter',Helvetica] font-normal text-[#283b30] text-sm tracking-[0] leading-[19.6px]"
                    >
                      <option value="all">
                        Birth certificate · Death certificate · Marriage
                        certificate · Other
                      </option>
                      <option value="birth">Birth certificate</option>
                      <option value="death">Death certificate</option>
                      <option value="marriage">Marriage certificate</option>
                      <option value="other">Other</option>
                    </select>
                    <img
                      className="pointer-events-none absolute w-3.5 h-3.5 right-3.5 top-1/2 -translate-y-1/2"
                      alt=""
                      src="/img/vector-11.svg"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
                  <label
                    htmlFor="supporting-file"
                    className="mt-[-1.00px] font-semibold text-[#283b30] text-[13px] relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]"
                  >
                    Upload supporting file (optional)
                  </label>
                  <label
                    htmlFor="supporting-file"
                    className="flex h-20 items-center gap-3 p-3.5 relative self-stretch w-full rounded-[10px] overflow-hidden border border-solid border-[#dedcd2] cursor-pointer"
                  >
                    <span className="relative w-[22px] h-[22px]" />
                    <span className="inline-flex flex-col items-start gap-[5px] relative flex-[0_0_auto]">
                      <span className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#283b30] text-sm tracking-[0] leading-[normal]">
                        {selectedFile
                          ? selectedFile.name
                          : "+ Upload PDF, JPG, or PNG"}
                      </span>
                      <span className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#7b8177] text-xs tracking-[0] leading-[normal]">
                        Choose a clear scan or photograph of your document.
                      </span>
                    </span>
                    <input
                      id="supporting-file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </div>
                <div className="gap-4 flex-[0_0_auto] flex flex-col items-start relative self-stretch w-full">
                  <h2 className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#283b30] text-lg tracking-[0] leading-[normal]">
                    Notes for review
                  </h2>
                  <div className="gap-2 flex-[0_0_auto] flex flex-col items-start relative self-stretch w-full">
                    <label
                      htmlFor="review-notes"
                      className="mt-[-1.00px] font-semibold text-[#283b30] text-[13px] relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]"
                    >
                      Anything else the reviewer should know
                    </label>
                    <textarea
                      id="review-notes"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Tell us where this document came from and how it relates to James. Leave any unknown details blank."
                      className="h-[120px] p-3.5 rounded-[10px] overflow-hidden border border-solid border-[#dedcd2] flex flex-col items-start relative self-stretch w-full [font-family:'Inter',Helvetica] font-normal text-[#283b30] text-sm tracking-[0] leading-[21px] resize-none placeholder:text-[#7b8177]"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2 p-4 relative self-stretch w-full flex-[0_0_auto] bg-[#e8ede3] rounded-xl overflow-hidden">
                  <div className="w-fit mt-[-1.00px] font-semibold text-[#355b43] leading-[normal] relative [font-family:'Inter',Helvetica] text-[13px] tracking-[0]">
                    How this request works
                  </div>
                  <p className="self-stretch font-normal text-[#283b30] leading-[19.5px] relative [font-family:'Inter',Helvetica] text-[13px] tracking-[0]">
                    This request is sent for approval. The tree owner or an
                    admin can review the details, ask questions, and then choose
                    whether to add these documents to James Bennett&apos;s
                    record.
                  </p>
                </div>
                <div className="flex items-start gap-3 relative self-stretch w-full flex-[0_0_auto]">
                  <button
                    type="submit"
                    className="flex h-12 items-center justify-center relative flex-1 grow bg-[#355b43] rounded-[10px] overflow-hidden"
                  >
                    <span className="font-semibold text-white text-sm relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
                      {submitted ? "Request submitted" : "Submit request"}
                    </span>
                  </button>
                  <Link
                    className="box-border flex h-12 items-center justify-center relative flex-1 grow bg-[#fffdf9] rounded-[10px] overflow-hidden border border-solid border-[#dedcd2]"
                    to="/roots-u183-bennett-family-tree"
                  >
                    <span className="font-semibold text-[#283b30] text-sm relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
                      Cancel
                    </span>
                  </Link>
                </div>
              </form>
            </div>
          </div>
          <div className="h-[744px] bg-[#ece9e0] absolute top-0 right-0 w-[5px] rounded-[100px]" />
          <div className="h-[350px] bg-[#a2ae9c] absolute top-0 right-0 w-[5px] rounded-[100px]" />
          <Link
            className="flex w-[704px] h-14 items-center justify-center gap-2 px-5 py-3 absolute left-0 bottom-0 bg-[#fffdf9] rounded-[0px_0px_12px_12px] overflow-hidden border-t [border-top-style:solid] border-[#dedcd2]"
            to="/roots-u183-james-bennett-person-details-overlay"
          >
            <span className="[-webkit-text-stroke:1px_#617b58] font-semibold text-[#355b43] text-sm relative w-fit [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
              Upload documents
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};
