import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type FormValues = {
  fullName: string;
  origin: string;
  birthDate: string;
  deathDate: string;
  relationship: string;
  parents: string;
  children: string;
  notes: string;
};

const initialValues: FormValues = {
  fullName: "Clara Bennett",
  origin: "York, England",
  birthDate: "1965",
  deathDate: "Not applicable",
  relationship: "Parent of / Child of ✓ / Both",
  parents: "James Bennett, Eleanor Ellis",
  children: "Select family members if Parent of or Both",
  notes:
    "Found in a family census record and confirmed through a conversation with a great aunt.",
};

const reviewItems = [
  {
    label: "Requested person",
    getValue: (values: FormValues) => values.fullName,
  },
  {
    label: "Connection",
    getValue: (values: FormValues) => {
      if (values.relationship.includes("Child of")) {
        return "Child of James Bennett";
      }

      if (values.relationship.includes("Parent of")) {
        return "Parent of selected family members";
      }

      return "Not specified";
    },
  },
  {
    label: "Place of origin",
    getValue: (values: FormValues) => values.origin,
  },
  {
    label: "Birth year",
    getValue: (values: FormValues) => values.birthDate,
  },
  {
    label: "Death date",
    getValue: (values: FormValues) => values.deathDate,
  },
];

export const AddPersonRequestModalSection = (): JSX.Element => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [photoName, setPhotoName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const updateValue =
    (field: keyof FormValues) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ): void => {
      setValues((currentValues) => ({
        ...currentValues,
        [field]: event.target.value,
      }));
      setSubmitted(false);
    };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    setPhotoName(file?.name ?? "");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setSubmitted(true);
  };

  const handleReset = (): void => {
    setValues(initialValues);
    setPhotoName("");
    setSubmitted(false);
  };

  const reviewDetails = useMemo(
    () =>
      reviewItems.map((item) => ({
        label: item.label,
        value: item.getValue(values),
      })),
    [values],
  );

  return (
    <div className="absolute left-[220px] top-24 flex w-[1160px] flex-col items-start gap-6 overflow-hidden rounded-[20px] border border-solid border-[#dedcd2] bg-[#fffdf9] p-8 shadow-[0px_18px_48px_#3444321f]">
      <div className="relative flex w-full flex-[0_0_auto] items-start justify-between">
        <div className="relative flex flex-1 grow flex-col items-start gap-2">
          <h1 className="relative mt-[-1.00px] w-fit [font-family:'Lora',Helvetica] text-[32px] font-normal leading-[normal] tracking-[-0.26px] text-[#283b30]">
            Request to add a person
          </h1>
          <p className="relative self-stretch [font-family:'Inter',Helvetica] text-sm font-normal leading-[21px] tracking-[0] text-[#7b8177]">
            Share what you know, and the tree owner or an admin will review your
            request before adding this person to the Bennett family tree.
          </p>
        </div>
        <Link
          aria-label="Close request form"
          className="relative flex h-10 w-10 flex-col items-center justify-center overflow-hidden rounded-[10px] border border-solid border-[#dedcd2] bg-[#fffdf9]"
          to="/roots-u183-bennett-family-tree"
        >
          <div className="relative h-4 w-4">
            <img
              alt=""
              aria-hidden="true"
              className="absolute left-[3.33%] top-[3.33%] h-[96.67%] w-[96.67%]"
              src="/img/vector-47.svg"
            />
          </div>
        </Link>
      </div>
      <form
        aria-label="Request to add a person"
        className="flex w-full flex-[0_0_auto] items-start gap-6"
        onSubmit={handleSubmit}
      >
        <div className="relative flex w-[720px] flex-col items-start gap-5">
          <section className="relative flex w-full flex-[0_0_auto] flex-col items-start gap-4">
            <h2 className="relative mt-[-1.00px] w-fit [font-family:'Inter',Helvetica] text-lg font-semibold leading-[normal] tracking-[0] text-[#283b30]">
              Person identity
            </h2>
            <div className="relative flex w-full flex-[0_0_auto] flex-col items-start gap-2">
              <label
                className="relative mt-[-1.00px] w-fit [font-family:'Inter',Helvetica] text-[13px] font-semibold leading-[normal] tracking-[0] text-[#283b30]"
                htmlFor="full-name"
              >
                Full name
              </label>
              <input
                className="relative h-12 w-full rounded-[10px] border border-solid border-[#dedcd2] bg-[#fffdf9] px-3.5 [font-family:'Inter',Helvetica] text-sm font-normal leading-[normal] tracking-[0] text-[#283b30]"
                id="full-name"
                onChange={updateValue("fullName")}
                required
                type="text"
                value={values.fullName}
              />
            </div>
            <div className="relative flex w-full flex-[0_0_auto] flex-col items-start gap-2">
              <label
                className="relative mt-[-1.00px] w-fit [font-family:'Inter',Helvetica] text-[13px] font-semibold leading-[normal] tracking-[0] text-[#283b30]"
                htmlFor="photo"
              >
                Photo (optional)
              </label>
              <label
                className="relative flex h-12 w-full cursor-pointer items-center gap-2.5 overflow-hidden rounded-[10px] border border-solid border-[#dedcd2] bg-[#fffdf9] px-3.5"
                htmlFor="photo"
              >
                <span className="[font-family:'Inter',Helvetica] text-sm font-normal leading-[normal] tracking-[0] text-[#283b30]">
                  {photoName || "+ Upload photo"}
                </span>
                <input
                  accept="image/*"
                  className="sr-only"
                  id="photo"
                  onChange={handlePhotoChange}
                  type="file"
                />
              </label>
            </div>
            <div className="relative flex w-full flex-[0_0_auto] flex-col items-start gap-2">
              <label
                className="relative mt-[-1.00px] w-fit [font-family:'Inter',Helvetica] text-[13px] font-semibold leading-[normal] tracking-[0] text-[#283b30]"
                htmlFor="origin"
              >
                Place of origin (if known)
              </label>
              <input
                className="relative h-12 w-full rounded-[10px] border border-solid border-[#dedcd2] bg-[#fffdf9] px-3.5 [font-family:'Inter',Helvetica] text-sm font-normal leading-[normal] tracking-[0] text-[#283b30]"
                id="origin"
                onChange={updateValue("origin")}
                type="text"
                value={values.origin}
              />
            </div>
            <div className="relative flex w-full flex-[0_0_auto] items-start gap-4">
              <div className="relative flex flex-1 grow flex-col items-start gap-2">
                <label
                  className="relative mt-[-1.00px] w-fit [font-family:'Inter',Helvetica] text-[13px] font-semibold leading-[normal] tracking-[0] text-[#283b30]"
                  htmlFor="birth-date"
                >
                  Birth date
                </label>
                <input
                  className="relative h-12 w-full rounded-[10px] border border-solid border-[#dedcd2] bg-[#fffdf9] px-3.5 [font-family:'Inter',Helvetica] text-sm font-normal leading-[normal] tracking-[0] text-[#283b30]"
                  id="birth-date"
                  onChange={updateValue("birthDate")}
                  type="text"
                  value={values.birthDate}
                />
              </div>
              <div className="relative flex flex-1 grow flex-col items-start gap-2">
                <label
                  className="relative mt-[-1.00px] w-fit [font-family:'Inter',Helvetica] text-[13px] font-semibold leading-[normal] tracking-[0] text-[#283b30]"
                  htmlFor="death-date"
                >
                  Death date (if applicable)
                </label>
                <input
                  className="relative h-12 w-full rounded-[10px] border border-solid border-[#dedcd2] bg-[#fffdf9] px-3.5 [font-family:'Inter',Helvetica] text-sm font-normal leading-[normal] tracking-[0] text-[#7b8177]"
                  id="death-date"
                  onChange={updateValue("deathDate")}
                  type="text"
                  value={values.deathDate}
                />
              </div>
            </div>
          </section>
          <section className="relative flex w-full flex-[0_0_auto] flex-col items-start gap-4">
            <h2 className="relative mt-[-1.00px] w-fit [font-family:'Inter',Helvetica] text-lg font-semibold leading-[normal] tracking-[0] text-[#283b30]">
              Relationship details
            </h2>
            <div className="relative flex w-full flex-[0_0_auto] flex-col items-start gap-2">
              <label
                className="relative mt-[-1.00px] w-fit [font-family:'Inter',Helvetica] text-[13px] font-semibold leading-[normal] tracking-[0] text-[#283b30]"
                htmlFor="relationship"
              >
                How is this person related? *
              </label>
              <select
                className="relative h-12 w-full rounded-[10px] border border-solid border-[#dedcd2] bg-[#fffdf9] px-3.5 [font-family:'Inter',Helvetica] text-sm font-normal leading-[normal] tracking-[0] text-[#283b30]"
                id="relationship"
                onChange={updateValue("relationship")}
                required
                value={values.relationship}
              >
                <option value="Parent of / Child of ✓ / Both">
                  Parent of / Child of ✓ / Both
                </option>
                <option value="Child of">Child of</option>
                <option value="Parent of">Parent of</option>
                <option value="Both">Both</option>
              </select>
            </div>
            <div className="relative flex w-full flex-[0_0_auto] flex-col items-start gap-2">
              <label
                className="relative mt-[-1.00px] w-fit [font-family:'Inter',Helvetica] text-[13px] font-semibold leading-[normal] tracking-[0] text-[#283b30]"
                htmlFor="parents"
              >
                Child of · select parent(s) *
              </label>
              <input
                className="relative h-12 w-full rounded-[10px] border border-solid border-[#dedcd2] bg-[#fffdf9] px-3.5 [font-family:'Inter',Helvetica] text-sm font-normal leading-[normal] tracking-[0] text-[#283b30]"
                id="parents"
                onChange={updateValue("parents")}
                required
                type="text"
                value={values.parents}
              />
            </div>
            <div className="relative flex w-full flex-[0_0_auto] flex-col items-start gap-2">
              <label
                className="relative mt-[-1.00px] w-fit [font-family:'Inter',Helvetica] text-[13px] font-semibold leading-[normal] tracking-[0] text-[#283b30]"
                htmlFor="children"
              >
                Parent of · select child(ren)
              </label>
              <input
                className="relative h-12 w-full rounded-[10px] border border-solid border-[#dedcd2] bg-[#fffdf9] px-3.5 [font-family:'Inter',Helvetica] text-sm font-normal leading-[normal] tracking-[0] text-[#7b8177]"
                id="children"
                onChange={updateValue("children")}
                type="text"
                value={values.children}
              />
            </div>
          </section>
          <section className="relative flex w-full flex-[0_0_auto] flex-col items-start gap-4">
            <h2 className="relative mt-[-1.00px] w-fit [font-family:'Inter',Helvetica] text-lg font-semibold leading-[normal] tracking-[0] text-[#283b30]">
              Notes for review
            </h2>
            <div className="relative flex w-full flex-[0_0_auto] flex-col items-start gap-2">
              <label
                className="relative mt-[-1.00px] w-fit [font-family:'Inter',Helvetica] text-[13px] font-semibold leading-[normal] tracking-[0] text-[#283b30]"
                htmlFor="notes"
              >
                Anything else the reviewer should know
              </label>
              <textarea
                className="relative h-[120px] w-full resize-none rounded-[10px] border border-solid border-[#dedcd2] bg-[#fffdf9] px-3.5 py-4 [font-family:'Inter',Helvetica] text-sm font-normal leading-[normal] tracking-[0] text-[#7b8177]"
                id="notes"
                onChange={updateValue("notes")}
                value={values.notes}
              />
            </div>
          </section>
        </div>
        <aside className="relative flex flex-1 grow flex-col items-start gap-4 overflow-hidden rounded-2xl border border-solid border-[#dedcd2] bg-[#f6f4ee] p-5">
          <h2 className="relative mt-[-1.00px] w-fit [font-family:'Inter',Helvetica] text-lg font-semibold leading-[normal] tracking-[0] text-[#283b30]">
            Review before sending
          </h2>
          <ul className="relative flex w-full flex-[0_0_auto] flex-col items-start gap-3">
            {reviewDetails.map((item) => (
              <li
                className="relative flex w-full flex-[0_0_auto] items-center gap-2.5"
                key={item.label}
              >
                <span
                  aria-hidden="true"
                  className="relative h-1.5 w-1.5 rounded-[3px] bg-[#617b58]"
                />
                <span className="relative mt-[-1.00px] flex-1 [font-family:'Inter',Helvetica] text-[13px] font-normal leading-[normal] tracking-[0] text-[#283b30]">
                  {item.label}: {item.value}
                </span>
              </li>
            ))}
          </ul>
          <div className="relative flex w-full flex-[0_0_auto] flex-col items-start gap-2 overflow-hidden rounded-xl bg-[#e8ede3] p-4">
            <h3 className="relative mt-[-1.00px] w-fit [font-family:'Inter',Helvetica] text-[13px] font-semibold leading-[normal] tracking-[0] text-[#355b43]">
              How this request works
            </h3>
            <p className="relative self-stretch [font-family:'Inter',Helvetica] text-[13px] font-normal leading-[19.5px] tracking-[0] text-[#283b30]">
              This request is sent for approval. The tree owner or an admin can
              review the details, ask questions, and then choose whether to add
              {` ${values.fullName || "this person"}`} to the Bennett family
              tree.
            </p>
          </div>
          <div className="relative flex w-full flex-[0_0_auto] flex-col items-start gap-3">
            <button
              className="relative flex h-12 w-full items-center gap-2 overflow-hidden rounded-[10px] bg-[#355b43] px-4 [font-family:'Inter',Helvetica] text-sm font-semibold leading-[normal] tracking-[0] text-white"
              type="submit"
            >
              {submitted ? "Request submitted" : "Submit request"}
            </button>
            <button
              className="relative flex h-12 w-full items-center gap-2 overflow-hidden rounded-[10px] border border-solid border-[#dedcd2] bg-[#fffdf9] px-4 [font-family:'Inter',Helvetica] text-sm font-semibold leading-[normal] tracking-[0] text-[#283b30]"
              onClick={handleReset}
              type="button"
            >
              Cancel
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
};
