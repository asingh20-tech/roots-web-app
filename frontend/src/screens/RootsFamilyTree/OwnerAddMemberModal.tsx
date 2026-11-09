
import { useState, type FormEvent } from "react";
import type { TreeSubmission } from "../RootsAddPerson/sections/AddPersonRequestModalSection/AddPersonRequestModalSection";
import type { DemoMember } from "./FamilyTreeCanvas";

type MemberValues = Extract<
  TreeSubmission,
  { type: "ADD_MEMBER" }
>["values"];

type RelationshipValues = Extract<
  TreeSubmission,
  { type: "ADD_RELATIONSHIP" }
>["values"];

type OwnerAddMemberModalProps = {
  onClose: () => void;
  onSubmit: (submission: TreeSubmission) => void;
  members: DemoMember[];
};

export const OwnerAddMemberModal = ({
  onClose,
  onSubmit,
  members,
}: OwnerAddMemberModalProps): JSX.Element => {
  const [formType, setFormType] = useState<"member" | "relationship">(
    "member"
  );

  // Member fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Relationship fields
  const [person1, setPerson1] = useState("");
  const [person2, setPerson2] = useState("");
  const [relationshipType, setRelationshipType] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setError("");

    if (formType === "member") {
      if (!firstName.trim() || !lastName.trim()) {
        setError("Please enter a first and last name.");
        return;
      }

      const values = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender: "",
        birthDate: "",
        deathDate: "",
        description: "",
      } as MemberValues;

      onSubmit({
        type: "ADD_MEMBER",
        values,
      });
    } else {
      if (!person1 || !person2 || !relationshipType) {
        setError("Please complete all relationship fields.");
        return;
      }

      if (person1 === person2) {
        setError("A person cannot have a relationship with themselves.");
        return;
      }

      const values = {
        member1: person1,
        member2: person2,
        relationshipType,
        startDate: "",
        description: "",
      } as RelationshipValues;

      onSubmit({
        type: "ADD_RELATIONSHIP",
        values,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#283b30]/30 p-4">
      <div className="w-full max-w-md rounded-xl bg-[#fffdf9] p-6 shadow-xl">
        <h2 className="mb-5 text-xl font-semibold text-[#283b30]">
          {formType === "member"
            ? "Add Family Member"
            : "Add Family Relationship"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Form selector */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setFormType("member");
                setError("");
              }}
              className={`rounded-lg border px-4 py-2 text-sm ${
                formType === "member"
                  ? "bg-[#355b43] text-white"
                  : "bg-white text-[#283b30]"
              }`}
            >
              Add Person
            </button>

            <button
              type="button"
              onClick={() => {
                setFormType("relationship");
                setError("");
              }}
              disabled={members.length < 2}
              className={`rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 ${
                formType === "relationship"
                  ? "bg-[#355b43] text-white"
                  : "bg-white text-[#283b30]"
              }`}
            >
              Add Relationship
            </button>
          </div>

          {/* Add member fields */}
          {formType === "member" && (
            <>
              <label className="flex flex-col gap-1 text-sm">
                First Name
                <input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="rounded-lg border border-[#dedcd2] p-2"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                Last Name
                <input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="rounded-lg border border-[#dedcd2] p-2"
                />
              </label>
            </>
          )}

          {/* Add relationship fields */}
          {formType === "relationship" && (
            <>
              <label className="flex flex-col gap-1 text-sm">
                Person 1
                <select
                  required
                  value={person1}
                  onChange={(e) => setPerson1(e.target.value)}
                  className="rounded-lg border border-[#dedcd2] p-2"
                >
                  <option value="">Select a person</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.fullName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm">
                Relationship
                <select
                  required
                  value={relationshipType}
                  onChange={(e) => setRelationshipType(e.target.value)}
                  className="rounded-lg border border-[#dedcd2] p-2"
                >
                  <option value="">Select relationship</option>
                  <option value="PARENT">Parent</option>
                  <option value="CHILD">Child</option>
                  <option value="SPOUSE">Spouse</option>
                  <option value="SIBLING">Sibling</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm">
                Person 2
                <select
                  required
                  value={person2}
                  onChange={(e) => setPerson2(e.target.value)}
                  className="rounded-lg border border-[#dedcd2] p-2"
                >
                  <option value="">Select a person</option>
                  {members
                    .filter((member) => String(member.id) !== person1)
                    .map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.fullName}
                      </option>
                    ))}
                </select>
              </label>
            </>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Action buttons */}
          <div className="mt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-[#355b43] px-4 py-2 text-sm text-white"
            >
              {formType === "member"
                ? "Add Member"
                : "Add Relationship"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
