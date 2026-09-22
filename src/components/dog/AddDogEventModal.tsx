import { useState } from "react";
import {
  Button,
  Dialog,
  Select,
  TextField,
  type ModalControls,
} from "@slauyama/ui";
import { ALL_DOG_EVENT_TYPES, DogEventType } from "../../constants";
import type { DogEvent, DogEventInput } from "../../hooks/useDogEvents";

interface AddDogEventModalProps {
  initialValues?: DogEvent;
  onSave: (data: DogEventInput) => void;
  onDelete?: () => void;
  modalControls: ModalControls;
}

type FormField = keyof DogEventInput;
type FormEvent = React.ChangeEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

const BLANK: DogEventInput = {
  date: "",
  type: DogEventType.Weight,
  notes: "",
  weightLbs: null,
};

function toInput(event: DogEvent): DogEventInput {
  const { id: _id, createdAt: _createdAt, ...rest } = event;
  return { ...BLANK, ...rest };
}

export default function AddDogEventModal({
  initialValues,
  onSave,
  onDelete,
  modalControls,
}: AddDogEventModalProps) {
  const isEdit = !!initialValues;

  const [form, setForm] = useState<DogEventInput>(
    initialValues
      ? toInput(initialValues)
      : { ...BLANK, date: new Date().toISOString().slice(0, 10) },
  );
  const [weightStr, setWeightStr] = useState<string>(
    initialValues?.weightLbs != null ? String(initialValues.weightLbs) : "",
  );

  function set(field: FormField) {
    return (e: FormEvent) =>
      setForm(
        (prev) => ({ ...prev, [field]: e.target.value }) as DogEventInput,
      );
  }

  function save() {
    const weightLbs =
      form.type === DogEventType.Weight
        ? (() => {
            const num = parseFloat(weightStr);
            return isNaN(num) ? null : num;
          })()
        : null;
    onSave({ ...form, weightLbs });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    save();
  }

  return (
    <Dialog
      open={modalControls.isOpen}
      onClose={modalControls.close}
      headline={isEdit ? "Edit Event" : "Add Event"}
      className="max-h-screen overflow-y-auto"
      actions={
        <>
          {onDelete && (
            <Button
              variant="filled"
              type="button"
              onClick={onDelete}
              className="bg-(--color-error)! text-(--color-on-error)! mr-auto"
            >
              Delete
            </Button>
          )}
          <Button variant="text" type="button" onClick={modalControls.close}>
            Cancel
          </Button>
          <Button variant="filled" type="button" onClick={save}>
            {isEdit ? "Save" : "Add Event"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <TextField
            variant="outlined"
            label="Date"
            type="date"
            fullWidth
            value={form.date}
            onChange={set("date")}
          />
          <Select
            label="Type"
            variant="outlined"
            value={form.type}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, type: value }) as DogEventInput)
            }
            options={ALL_DOG_EVENT_TYPES.map((t) => ({ value: t, label: t }))}
            fullWidth
          />
        </div>

        {form.type === DogEventType.Weight && (
          <TextField
            variant="outlined"
            label="Weight (lbs)"
            type="text"
            fullWidth
            inputMode="decimal"
            value={weightStr}
            onChange={(e) => setWeightStr(e.target.value)}
            placeholder="e.g. 27"
          />
        )}

        {form.type !== DogEventType.Weight && (
          <TextField
            variant="outlined"
            label="Event"
            textarea
            fullWidth
            value={form.notes}
            onChange={set("notes")}
            placeholder="Any notes about this event…"
            rows={1}
          />
        )}
      </form>
    </Dialog>
  );
}
