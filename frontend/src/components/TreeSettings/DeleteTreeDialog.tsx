// FR-23 (proposed): permanently delete a tree (DELETE /api/trees/:id/).
// The Owner must type the exact tree name before Delete is enabled. Django
// removes every row that belongs to the tree and its stored files (DB-6).
import { FormEvent, useId, useRef, useState } from "react";
import { ApiError, firstErrorMessage } from "../../services/api";
import { FamilyTree, deleteTree } from "../../services/trees";
import { notifyTreesChanged } from "../../services/treeEvents";
import {
  Dialog,
  dangerButtonClass,
  fieldControlClass,
  fieldLabelClass,
  formErrorClass,
  secondaryButtonClass,
} from "../Dialog/Dialog";

type DeleteTreeDialogProps = {
  tree: FamilyTree;
  // Called once the tree is gone (also when Django says it already was).
  onDeleted: (treeId: number) => void;
  onClose: () => void;
};

const removed = [
  "every family member and relationship",
  "photos and attached documents",
  "pending and past suggestions",
  "invitation links",
  "collaborators' access",
];

export const DeleteTreeDialog = ({ tree, onDeleted, onClose }: DeleteTreeDialogProps): JSX.Element => {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const busyRef = useRef(false);
  const inputId = useId();
  const hintId = useId();

  const matches = typed === tree.name;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!matches || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await deleteTree(tree.id);
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 404)) {
        setError(
          err instanceof ApiError
            ? err.status === 403
              ? "Only the Tree Owner can delete this tree."
              : firstErrorMessage(err.fieldErrors) ?? err.message
            : "We couldn't delete the tree. Check your connection and try again.",
        );
        busyRef.current = false;
        setBusy(false);
        return;
      }
      // 404: it's already gone, which is what the Owner wanted.
    }
    notifyTreesChanged();
    onDeleted(tree.id);
  };

  return (
    <Dialog
      title={`Delete ${tree.name}?`}
      role="alertdialog"
      onClose={onClose}
      busy={busy}
      size="sm"
      description="This permanently deletes the tree for you and everyone you've invited. It can't be undone."
    >
      <form noValidate onSubmit={(event) => void submit(event)} className="flex flex-col gap-5" aria-label={`Delete ${tree.name}`}>
        <div className="rounded-xl border border-[#e8d4cb] bg-[#fbf3ef] p-4 [font-family:'Inter',Helvetica] text-[13px] leading-[20px] text-[#283b30]">
          <p className="font-semibold text-[#8a3f2c]">Deleted along with the tree:</p>
          <ul className="mt-2 flex flex-col gap-1">
            {removed.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-[#8a3f2c]" />
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[#7b8177]">
            {tree.member_count} {tree.member_count === 1 ? "person is" : "people are"} saved in this tree.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={inputId} className={fieldLabelClass}>
            <span>
              Type <span className="select-all rounded bg-[#f6f4ee] px-1.5 py-0.5 font-mono text-[12px]">{tree.name}</span> to confirm
            </span>
          </label>
          <input
            id={inputId}
            data-autofocus
            type="text"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            value={typed}
            onChange={(event) => {
              setTyped(event.target.value);
              setError("");
            }}
            aria-describedby={hintId}
            disabled={busy}
            className={fieldControlClass}
          />
          <span id={hintId} className="[font-family:'Inter',Helvetica] text-[12px] text-[#7b8177]">
            {matches ? "Name matches. Delete is now available." : "Delete stays off until the name matches exactly."}
          </span>
        </div>
        {error && (
          <p role="alert" className={formErrorClass}>
            {error}
          </p>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className={secondaryButtonClass} onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className={dangerButtonClass} disabled={!matches || busy} aria-busy={busy || undefined}>
            {busy ? "Deleting…" : "Delete tree"}
          </button>
        </div>
      </form>
    </Dialog>
  );
};
