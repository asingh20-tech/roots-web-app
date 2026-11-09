
import { useState, type FormEvent } from "react";
import type { TreeSubmission } from "../RootsAddPerson/sections/AddPersonRequestModalSection/AddPersonRequestModalSection";

type OwnerAddMemberModalProps = {
  onClose: () => void;
  onSubmit: (submission: TreeSubmission) => void;
};

export const OwnerAddMemberModal = ({
  onClose,
  onSubmit,
}: OwnerAddMemberModalProps): JSX.Element => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!firstName.trim() || !lastName.trim()) return;

    onSubmit({
      type: "ADD_MEMBER",
      values: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender: "",
        birthDate: "",
        deathDate: "",
        description: "",
      } as TreeSubmission extends infer T
        ? Extract<T, { type: "ADD_MEMBER" }>["values"]
        : never,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#283b30]/30 p-4">
      <div className="w-full max-w-md rounded-xl bg-[#fffdf9] p-6 shadow-xl">
        <h2 className="mb-5 text-xl font-semibold text-[#283b30]">
          Add Family Member
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

          <div className="mt-3 flex justify-end gap-3">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#355b43] px-4 py-2 text-white"
            >
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
