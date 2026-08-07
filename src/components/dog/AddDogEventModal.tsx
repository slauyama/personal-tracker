import { useState } from "react";
import {
  Button,
  Input,
  Modal,
  Select,
  Text,
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
      setForm((prev) => ({ ...prev, [field]: e.target.value }) as DogEventInput);
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
      modalControls={modalControls}
      title={isEdit ? "Edit Event" : "Add Event"}
      className="max-h-[90vh] overflow-y-auto"
    >
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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
              placeholder="e.g. 26.8"
            />
          )}

          <div>
            <Text as="label" size="sm" className="block mb-1">
              Notes
            </Text>
            <textarea
              value={form.notes}
              onChange={set("notes")}
              placeholder="Any notes about this event…"
              rows={2}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              type="button"
              onClick={modalControls.close}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {isEdit ? "Save Changes" : "Add Event"}
            </Button>
          </div>

          {onDelete && (
            <div className="pt-1 border-t border-zinc-100 dark:border-zinc-700">
              <Button
                variant="ghost"
                color="error"
                type="button"
                onClick={onDelete}
                className="w-full"
              >
                Delete Event
              </Button>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
}
