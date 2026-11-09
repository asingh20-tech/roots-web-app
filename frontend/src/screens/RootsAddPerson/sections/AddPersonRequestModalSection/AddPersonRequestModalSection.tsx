import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type RequestType = "ADD_MEMBER" | "ADD_RELATIONSHIP";
type Gender = "FEMALE" | "MALE" | "OTHER" | "UNKNOWN";
type RelationshipType =
  | "PARENT"
  | "CHILD"
  | "ADOPTIVE_PARENT"
  | "SPOUSE"
  | "SIBLING";

// Writable fields that will be placed in the DB for ADD_MEMBER.
export type MemberFormValues = {
  firstName: string;
  lastName: string;
  gender: Gender;
  birthDate: string;
  deathDate: string;
  description: string;
};

// Writable fields that will be placed in the DB for ADD_RELATIONSHIP.
// Member IDs remain strings here because HTML select values are strings.
export type RelationshipFormValues = {
  member1: string;
  member2: string;
  relationshipType: RelationshipType;
  startDate: string;
  description: string;
};

type MemberOption = {
  id: number;
  fullName: string;
};

export type TreeSubmission =
  | {
      type: "ADD_MEMBER";
      values: MemberFormValues;
    }
  | {
      type: "ADD_RELATIONSHIP";
      values: RelationshipFormValues;
    };

type AddPersonRequestModalSectionProps = {
  onClose: () => void;
  // Later, pass members returned by GET /api/trees/:treeId/members/.
  members?: MemberOption[];
  onTreeSubmit?: (submission: TreeSubmission) => void;
};

const initialMemberValues: MemberFormValues = {
  firstName: "",
  lastName: "",
  gender: "UNKNOWN",
  birthDate: "",
  deathDate: "",
  description: "",
};

const initialRelationshipValues: RelationshipFormValues = {
  member1: "",
  member2: "",
  relationshipType: "PARENT",
  startDate: "",
  description: "",
};

const genderOptions: Array<{ value: Gender; label: string }> = [
  { value: "UNKNOWN", label: "Unknown / prefer not to say" },
  { value: "FEMALE", label: "Female" },
  { value: "MALE", label: "Male" },
  { value: "OTHER", label: "Other" },
];
// Needed for adding to the DB because values are stored as uppercase because thats what the DB accepts
const relationshipOptions: Array<{
  value: RelationshipType;
  label: string;
}> = [
  { value: "PARENT", label: "Parent" },
  { value: "CHILD", label: "Child" },
  { value: "ADOPTIVE_PARENT", label: "Adoptive parent" },
  { value: "SPOUSE", label: "Spouse" },
  { value: "SIBLING", label: "Sibling" },
];

export const AddPersonRequestModalSection = ({
  onClose,
  members = [],
  onTreeSubmit,
}: AddPersonRequestModalSectionProps): JSX.Element => {
  const [requestType, setRequestType] =
    useState<RequestType>("ADD_MEMBER");
  const [memberValues, setMemberValues] =
    useState<MemberFormValues>(initialMemberValues);
  const [relationshipValues, setRelationshipValues] =
    useState<RelationshipFormValues>(initialRelationshipValues);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const updateMemberValue =
    (field: keyof MemberFormValues) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ): void => {
      setMemberValues((currentValues) => ({
        ...currentValues,
        [field]: event.target.value,
      }));
      setSubmitted(false);
      setFormError("");
    };

  const updateRelationshipValue =
    (field: keyof RelationshipFormValues) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ): void => {
      const nextValue = event.target.value;
      setRelationshipValues((currentValues) => ({
        ...currentValues,
        [field]: nextValue,
        // start_date is valid only for a SPOUSE relationship.
        ...(field === "relationshipType" && nextValue !== "SPOUSE"
          ? { startDate: "" }
          : {}),
      }));
      setSubmitted(false);
      setFormError("");
    };

  const selectRequestType = (nextType: RequestType): void => {
    setRequestType(nextType);
    setSubmitted(false);
    setFormError("");
  };

  const memberName = (memberId: string): string =>
    members.find((member) => member.id === Number(memberId))?.fullName ||
    "Not selected";

  const reviewDetails = useMemo(() => {
    if (requestType === "ADD_MEMBER") {
      const fullName = `${memberValues.firstName} ${memberValues.lastName}`.trim();
      return [
        { label: "Request", value: "Add member" },
        { label: "Name", value: fullName || "Not entered" },
        { label: "Gender", value: memberValues.gender },
        { label: "Birth date", value: memberValues.birthDate || "Not provided" },
        { label: "Death date", value: memberValues.deathDate || "Not provided" },
      ];
    }

    return [
      { label: "Request", value: "Add relationship" },
      { label: "First member", value: memberName(relationshipValues.member1) },
      { label: "Relationship", value: relationshipValues.relationshipType },
      { label: "Second member", value: memberName(relationshipValues.member2) },
      ...(relationshipValues.relationshipType === "SPOUSE"
        ? [
            {
              label: "Marriage date",
              value: relationshipValues.startDate || "Not provided",
            },
          ]
        : []),
    ];
  }, [memberValues, members, relationshipValues, requestType]);

//this makes it so the form passes the information to the parent component first
const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
  event.preventDefault();
  if (
    requestType === "ADD_RELATIONSHIP" &&
    relationshipValues.member1 === relationshipValues.member2
  ) {
    setFormError("A member cannot have a relationship with themselves.");
    return;
  }
  setFormError("");
  if (onTreeSubmit) {
    if (requestType === "ADD_MEMBER") {
      onTreeSubmit({
        type: "ADD_MEMBER",
        values: memberValues,
      });
    } else {
      onTreeSubmit({
        type: "ADD_RELATIONSHIP",
        values: relationshipValues,
      });
    }
    return;
  }
  // Preserve the existing request behavior.
  setSubmitted(true);
};


  const relationshipRequestUnavailable =
    requestType === "ADD_RELATIONSHIP" && members.length < 2;

  return (
    <div
      aria-labelledby="request-change-title"
      aria-modal="true"
      className="relative mx-auto my-12 flex w-[calc(100%-2rem)] max-w-[1160px] flex-col items-start gap-6 overflow-hidden rounded-[20px] border border-solid border-[#dedcd2] bg-[#fffdf9] p-8 shadow-[0px_18px_48px_#3444321f]"
      role="dialog"
    >
      <div className="relative flex w-full items-start justify-between">
        <div className="flex flex-1 flex-col items-start gap-2">
          <h1
            className="[font-family:'Lora',Helvetica] text-[32px] font-normal text-[#283b30]"
            id="request-change-title"
          >
            Request a change
          </h1>
          <p className="[font-family:'Inter',Helvetica] text-sm leading-[21px] text-[#7b8177]">
            Submit family information for the Tree Owner to review before it is
            added to the tree.
          </p>
        </div>
        <button
          aria-label="Close request form"
          className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#dedcd2] bg-[#fffdf9]"
          onClick={onClose}
          type="button"
        >
          <img
            alt=""
            aria-hidden="true"
            className="h-4 w-4"
            src="/img/vector-47.svg"
          />
        </button>
      </div>

      <div
        aria-label="Choose request type"
        className="flex w-full gap-3 rounded-xl bg-[#f6f4ee] p-1.5"
        role="group"
      >
        {(
          [
            ["ADD_MEMBER", "Add member"],
            ["ADD_RELATIONSHIP", "Add relationship"],
          ] as const
        ).map(([value, label]) => (
          <button
            aria-pressed={requestType === value}
            className={`flex-1 rounded-lg px-4 py-3 [font-family:'Inter',Helvetica] text-sm font-semibold ${
              requestType === value
                ? "bg-[#355b43] text-white shadow-sm"
                : "text-[#283b30] hover:bg-white"
            }`}
            key={value}
            onClick={() => selectRequestType(value)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <form
        aria-label="Request a tree change"
        className="flex w-full flex-col items-start gap-6 lg:flex-row"
        onSubmit={handleSubmit}
      >
        <div className="flex w-full flex-col items-start gap-5 lg:w-[720px]">
          {requestType === "ADD_MEMBER" ? (
            <section className="flex w-full flex-col items-start gap-4">
              <h2 className="[font-family:'Inter',Helvetica] text-lg font-semibold text-[#283b30]">
                Member information
              </h2>
              <div className="grid w-full gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-[13px] font-semibold text-[#283b30]">
                  First name
                  <input
                    className="h-12 rounded-[10px] border border-[#dedcd2] px-3.5 text-sm font-normal"
                    maxLength={50}
                    onChange={updateMemberValue("firstName")}
                    required
                    type="text"
                    value={memberValues.firstName}
                  />
                </label>
                <label className="flex flex-col gap-2 text-[13px] font-semibold text-[#283b30]">
                  Last name
                  <input
                    className="h-12 rounded-[10px] border border-[#dedcd2] px-3.5 text-sm font-normal"
                    maxLength={50}
                    onChange={updateMemberValue("lastName")}
                    required
                    type="text"
                    value={memberValues.lastName}
                  />
                </label>
              </div>
              <label className="flex w-full flex-col gap-2 text-[13px] font-semibold text-[#283b30]">
                Gender
                <select
                  className="h-12 rounded-[10px] border border-[#dedcd2] bg-white px-3.5 text-sm font-normal"
                  onChange={updateMemberValue("gender")}
                  value={memberValues.gender}
                >
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid w-full gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-[13px] font-semibold text-[#283b30]">
                  Birth date
                  <input
                    className="h-12 rounded-[10px] border border-[#dedcd2] px-3.5 text-sm font-normal"
                    onChange={updateMemberValue("birthDate")}
                    required
                    type="date"
                    value={memberValues.birthDate}
                  />
                </label>
                <label className="flex flex-col gap-2 text-[13px] font-semibold text-[#283b30]">
                  Death date (optional)
                  <input
                    className="h-12 rounded-[10px] border border-[#dedcd2] px-3.5 text-sm font-normal"
                    min={memberValues.birthDate || undefined}
                    onChange={updateMemberValue("deathDate")}
                    type="date"
                    value={memberValues.deathDate}
                  />
                </label>
              </div>
              <label className="flex w-full flex-col gap-2 text-[13px] font-semibold text-[#283b30]">
                Notes for the Tree Owner
                <textarea
                  className="h-[120px] resize-none rounded-[10px] border border-[#dedcd2] px-3.5 py-4 text-sm font-normal"
                  onChange={updateMemberValue("description")}
                  placeholder="Explain what you know about this family member."
                  required
                  value={memberValues.description}
                />
              </label>
            </section>
          ) : (
            <section className="flex w-full flex-col items-start gap-4">
              <h2 className="[font-family:'Inter',Helvetica] text-lg font-semibold text-[#283b30]">
                Relationship information
              </h2>
              {members.length < 2 && (
                <p className="w-full rounded-lg bg-[#f7ece6] p-3 text-sm text-[#704536]">
                  At least two saved family members are required before a
                  relationship can be requested.
                </p>
              )}
              <label className="flex w-full flex-col gap-2 text-[13px] font-semibold text-[#283b30]">
                First member
                <select
                  className="h-12 rounded-[10px] border border-[#dedcd2] bg-white px-3.5 text-sm font-normal"
                  disabled={members.length === 0}
                  onChange={updateRelationshipValue("member1")}
                  required
                  value={relationshipValues.member1}
                >
                  <option value="">Select a family member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.fullName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex w-full flex-col gap-2 text-[13px] font-semibold text-[#283b30]">
                Relationship
                <select
                  className="h-12 rounded-[10px] border border-[#dedcd2] bg-white px-3.5 text-sm font-normal"
                  onChange={updateRelationshipValue("relationshipType")}
                  value={relationshipValues.relationshipType}
                >
                  {relationshipOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex w-full flex-col gap-2 text-[13px] font-semibold text-[#283b30]">
                Second member
                <select
                  className="h-12 rounded-[10px] border border-[#dedcd2] bg-white px-3.5 text-sm font-normal"
                  disabled={members.length === 0}
                  onChange={updateRelationshipValue("member2")}
                  required
                  value={relationshipValues.member2}
                >
                  <option value="">Select a family member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.fullName}
                    </option>
                  ))}
                </select>
              </label>
              {relationshipValues.relationshipType === "SPOUSE" && (
                <label className="flex w-full flex-col gap-2 text-[13px] font-semibold text-[#283b30]">
                  Marriage date (optional)
                  <input
                    className="h-12 rounded-[10px] border border-[#dedcd2] px-3.5 text-sm font-normal"
                    onChange={updateRelationshipValue("startDate")}
                    type="date"
                    value={relationshipValues.startDate}
                  />
                </label>
              )}
              <label className="flex w-full flex-col gap-2 text-[13px] font-semibold text-[#283b30]">
                Notes for the Tree Owner
                <textarea
                  className="h-[120px] resize-none rounded-[10px] border border-[#dedcd2] px-3.5 py-4 text-sm font-normal"
                  onChange={updateRelationshipValue("description")}
                  placeholder="Explain how these family members are related."
                  required
                  value={relationshipValues.description}
                />
              </label>
            </section>
          )}
        </div>

        <aside className="flex w-full flex-1 grow flex-col items-start gap-4 rounded-2xl border border-[#dedcd2] bg-[#f6f4ee] p-5">
          <h2 className="text-lg font-semibold text-[#283b30]">
            Review before sending
          </h2>
          <ul className="flex w-full flex-col items-start gap-3">
            {reviewDetails.map((item) => (
              <li className="flex w-full items-center gap-2.5" key={item.label}>
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-[3px] bg-[#617b58]"
                />
                <span className="flex-1 text-[13px] text-[#283b30]">
                  {item.label}: {item.value}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex w-full flex-col gap-2 rounded-xl bg-[#e8ede3] p-4">
            <h3 className="text-[13px] font-semibold text-[#355b43]">
              How this request works
            </h3>
            <p className="text-[13px] leading-[19.5px] text-[#283b30]">
              The Tree Owner will review this request. The database changes only
              if the request is approved.
            </p>
          </div>
          {formError && (
            <p className="w-full rounded-lg bg-[#f7ece6] p-3 text-sm text-[#8a3f2c]">
              {formError}
            </p>
          )}
          {submitted && (
            <p className="w-full rounded-lg bg-[#e8ede3] p-3 text-sm text-[#355b43]">
              Request is ready for the SuggestRequest API.
            </p>
          )}
          <div className="flex w-full flex-col gap-3">
            <button
              className="flex h-12 w-full items-center rounded-[10px] bg-[#355b43] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={relationshipRequestUnavailable}
              type="submit"
            >
              Submit request
            </button>
            <button
              className="flex h-12 w-full items-center rounded-[10px] border border-[#dedcd2] bg-white px-4 text-sm font-semibold text-[#283b30]"
              onClick={onClose}
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
