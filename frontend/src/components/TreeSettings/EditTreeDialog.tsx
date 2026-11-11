// FR-23 (proposed): the Tree Owner renames a tree or changes its description
// (PATCH /api/trees/:id/). Prefilled from the saved tree; on failure the
// typed values stay on screen with Django's message (FR-20).
import { FormEvent, useId, useRef, useState } from "react";
import { ApiError, firstErrorMessage } from "../../services/api";
import { FamilyTree, updateTree } from "../../services/trees";
import { notifyTreesChanged } from "../../services/treeEvents";
import {
  Dialog,
  fieldControlClass,
  fieldErrorClass,
  fieldLabelClass,
  formErrorClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "../Dialog/Dialog";

// FamilyTree.name max_length in backend/trees/models.py.
export const TREE_NAME_MAX = 100;

type EditTreeDialogProps = {
  tree: FamilyTree;
  onSaved: (tree: FamilyTree) => void;
  onClose: () => void;
};

type Errors = { name?: string; description?: string };

export const EditTreeDialog = ({ tree, onSaved, onClose }: EditTreeDialogProps): JSX.Element => {
  const [name, setName] = useState(tree.name);
  const [description, setDescription] = useState(tree.description ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const nameId = useId();
  const nameErrorId = useId();
  const counterId = useId();
  const descriptionErrorId = useId();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingRef.current) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setErrors({ name: "Give the tree a name." });
      nameRef.current?.focus();
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setErrors({});
    setFormError("");
    try {
      const saved = await updateTree(tree.id, {
        name: trimmed,
        description: description.trim(),
      });
      notifyTreesChanged();
      onSaved(saved);
    } catch (error) {
      if (error instanceof ApiError) {
        const next: Errors = {
          name: firstErrorMessage(error.fieldErrors.name) ?? undefined,
          description: firstErrorMessage(error.fieldErrors.description) ?? undefined,
        };
        if (next.name || next.description) {
          setErrors(next);
          if (next.name) nameRef.current?.focus();
        } else {
          setFormError(
            error.status === 403
              ? "Only the Tree Owner can change this tree."
              : firstErrorMessage(error.fieldErrors) ?? error.message,
          );
        }
      } else {
        setFormError("We couldn't save your changes. Check your connection and try again.");
      }
      savingRef.current = false;
      setSaving(false);
    }
  };

  const remaining = TREE_NAME_MAX - name.length;

  return (
    <Dialog
      title="Edit tree"
      description="Changes show everywhere this tree appears, for you and your collaborators."
      onClose={onClose}
      busy={saving}
      size="sm"
    >
      <form noValidate onSubmit={(event) => void submit(event)} className="flex flex-col gap-5" aria-label="Edit tree details">
        <div className="flex flex-col gap-2">
          <label htmlFor={nameId} className={fieldLabelClass}>
            Name of tree
          </label>
          <input
            ref={nameRef}
            id={nameId}
            name="name"
            type="text"
            required
            maxLength={TREE_NAME_MAX}
            autoComplete="off"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setErrors((current) => ({ ...current, name: undefined }));
              setFormError("");
            }}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={`${counterId}${errors.name ? ` ${nameErrorId}` : ""}`}
            className={fieldControlClass}
          />
          <div className="flex items-start justify-between gap-3">
            {errors.name ? (
              <span id={nameErrorId} className={fieldErrorClass}>
                {errors.name}
              </span>
            ) : (
              <span />
            )}
            <span
              id={counterId}
              className={`shrink-0 [font-family:'Inter',Helvetica] text-[12px] tabular-nums ${remaining <= 10 ? "text-[#8a3f2c]" : "text-[#7b8177]"}`}
            >
              {remaining} characters left
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className={fieldLabelClass}>
            Description (optional)
            <textarea
              name="description"
              rows={4}
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setErrors((current) => ({ ...current, description: undefined }));
                setFormError("");
              }}
              aria-invalid={errors.description ? true : undefined}
              aria-describedby={errors.description ? descriptionErrorId : undefined}
              className={`${fieldControlClass} h-auto min-h-[112px] resize-y py-3 leading-[21px]`}
            />
          </label>
          {errors.description && (
            <span id={descriptionErrorId} className={fieldErrorClass}>
              {errors.description}
            </span>
          )}
        </div>
        {formError && (
          <p role="alert" className={formErrorClass}>
            {formError}
          </p>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className={secondaryButtonClass} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className={primaryButtonClass} disabled={saving} aria-busy={saving || undefined}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </Dialog>
  );
};
