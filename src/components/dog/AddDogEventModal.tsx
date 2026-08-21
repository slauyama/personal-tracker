import { useState } from "react";
import {
  Button,
  Input,
  Modal,
  Select,
  TextArea,
  type ModalControls,
} from "@slauyama/ui";
import { ALL_DOG_EVENT_TYPES, DogEventType } from "../../constants";
import type { DogEvent, DogEventInput } from "../../hooks/useDogEvents";
import { useBreakpoints } from "@slauyama/hooks";

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
  const { isSmall } = useBreakpoints();

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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const weightLbs =
      form.type === DogEventType.Weight
        ? (() => {
            const num = parseFloat(weightStr);
            return isNaN(num) ? null : num;
          })()
        : null;
    onSave({ ...form, weightLbs });
  }

  return (
    <Modal
      variant={isSmall ? "fullscreen" : "basic"}
      modalControls={modalControls}
      title={isEdit ? "Edit Event" : "Add Event"}
      className="max-h-screen overflow-y-auto"
    >
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              required
              value={form.date}
              onChange={set("date")}
            />
            <Select
              label="Type"
              value={form.type}
              onChange={set("type")}
              options={ALL_DOG_EVENT_TYPES}
              className="w-full"
            />
          </div>

          {form.type === DogEventType.Weight && (
            <Input
              label="Weight (lbs)"
              type="text"
              inputMode="decimal"
              value={weightStr}
              onChange={(e) => setWeightStr(e.target.value)}
              placeholder="e.g. 27"
            />
          )}

          {form.type !== DogEventType.Weight && (
            <TextArea
              label="Event"
              value={form.notes}
              onChange={set("notes")}
              placeholder="Any notes about this event…"
              rows={1}
            />
          )}

          <div className="flex pt-2 justify-between">
            <div className="flex gap-3 pt-2">
              <Button variant="filled" type="submit">
                {isEdit ? "Save" : "Add Event"}
              </Button>
              <Button
                variant="text"
                type="button"
                onClick={modalControls.close}
              >
                Cancel
              </Button>
            </div>

            {onDelete && (
              <Button
                variant="tonal"
                surface="error"
                type="button"
                onClick={onDelete}
                className="w-full"
              >
                Delete
              </Button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
}
