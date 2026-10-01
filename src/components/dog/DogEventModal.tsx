import { useState } from "react";
import {
  Button,
  DescriptionList,
  Dialog,
  Select,
  Switch,
  Text,
  TextField,
  type ModalControls,
} from "@slauyama/ui";
import { ALL_DOG_EVENT_TYPES, DogEventType } from "../../constants";
import type { DogEvent, DogEventInput } from "../../hooks/useDogEvents";
import { useBreakpoints } from "@slauyama/hooks";

interface DogEventModalProps {
  dogEvent?: DogEvent;
  onSave: (data: DogEventInput) => void;
  onDelete?: () => void;
  modalControls: ModalControls;
}

type FormField = keyof DogEventInput;
type FormEvent = React.ChangeEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;
type Mode = "add" | "view" | "edit";

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

export default function DogEventModal({
  dogEvent,
  onSave,
  onDelete,
  modalControls,
}: DogEventModalProps) {
  const { isSmall } = useBreakpoints();
  const [mode, setMode] = useState<Mode>(dogEvent ? "view" : "add");

  const [form, setForm] = useState<DogEventInput>(
    dogEvent
      ? toInput(dogEvent)
      : { ...BLANK, date: new Date().toISOString().slice(0, 10) },
  );
  const [weightStr, setWeightStr] = useState<string>(
    dogEvent?.weightLbs != null ? String(dogEvent.weightLbs) : "",
  );

  function resetForm() {
    if (!dogEvent) return;
    setForm(toInput(dogEvent));
    setWeightStr(dogEvent.weightLbs != null ? String(dogEvent.weightLbs) : "");
  }

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

  const headline =
    mode === "view" && dogEvent
      ? dogEvent.type
      : mode === "edit"
        ? "Edit Event"
        : "Add Event";

  const dogEventListItems: Array<{
    term: string;
    value?: string;
  }> = dogEvent
    ? [
        { term: "Date Bought", value: dogEvent.date },
        { term: "Type", value: dogEvent.type },
        {
          term: "Weight",
          value:
            dogEvent.weightLbs != null
              ? `${dogEvent.weightLbs} lbs`
              : undefined,
        },
        {
          term: "Notes",
          value: dogEvent.notes,
        },
      ]
    : [];
  return (
    <Dialog
      open={modalControls.isOpen}
      onClose={modalControls.close}
      headline={headline}
      className="max-h-screen overflow-y-auto"
      actions={
        mode === "view" ? (
          <>
            {onDelete && (
              <Button
                variant={isSmall ? "text" : "filled"}
                icon="delete"
                onClick={onDelete}
                className="text-(--color-error)! mr-auto"
              >
                Delete
              </Button>
            )}
            <Button
              variant="text"
              className="hidden sm:flex-inline"
              onClick={modalControls.close}
            >
              Close
            </Button>
          </>
        ) : (
          <>
            {onDelete && mode === "edit" && (
              <Button
                variant={isSmall ? "text" : "filled"}
                icon="delete"
                onClick={onDelete}
                className="text-(--color-error)! mr-auto"
              >
                Delete
              </Button>
            )}
            <Button
              variant="text"
              className="hidden sm:flex-inline"
              onClick={() => {
                if (dogEvent) {
                  resetForm();
                  setMode("view");
                } else {
                  modalControls.close();
                }
              }}
            >
              Cancel
            </Button>
            <Button variant="filled" onClick={save}>
              {mode === "edit" ? "Save" : "Add Event"}
            </Button>
          </>
        )
      }
    >
      {dogEvent && (
        <div className="flex justify-end items-center gap-2 mb-2">
          <Text>Edit</Text>
          <Switch
            label="Edit mode"
            selected={mode === "edit"}
            onChange={(selected) => {
              if (selected) {
                setMode("edit");
              } else {
                resetForm();
                setMode("view");
              }
            }}
          />
        </div>
      )}

      {mode === "view" && dogEvent ? (
        <DescriptionList dividers>
          {dogEventListItems.map((dogEvent) => {
            if (dogEvent.value) {
              return (
                <DescriptionList.Item term={dogEvent.term}>
                  {dogEvent.value}
                </DescriptionList.Item>
              );
            }
          })}
        </DescriptionList>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <TextField
              variant="outlined"
              label="Date Bought"
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
      )}
    </Dialog>
  );
}
