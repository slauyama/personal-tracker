import { useState } from "react";
import {
  Button,
  DescriptionList,
  Dialog,
  Switch,
  Text,
  TextField,
  type ModalControls,
} from "@slauyama/ui";
import { useBreakpoints } from "@slauyama/hooks";
import DeleteButton from "../ui/DeleteButton";
import { formatNumber, formatUsd } from "../../lib/carStats";

type FieldKind = "date" | "text" | "number" | "currency" | "textarea" | "toggle";

export interface FieldDef<T> {
  key: keyof T & string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  required?: boolean;
  /** Digits kept when a currency field is normalized on blur (default 2). */
  decimals?: number;
}

type FormValue = string | boolean;
type FormState = Record<string, FormValue>;
type Mode = "add" | "view" | "edit";

interface RecordModalProps<TInput extends object> {
  noun: string;
  fields: FieldDef<TInput>[];
  blank: TInput;
  record?: TInput & { id: string };
  viewHeadline?: (record: TInput) => string;
  onSave: (data: TInput) => void;
  onDelete?: () => void;
  modalControls: ModalControls;
}

function toForm<T extends object>(fields: FieldDef<T>[], data: T): FormState {
  const form: FormState = {};
  for (const field of fields) {
    const value = data[field.key] as unknown;
    if (field.kind === "toggle") form[field.key] = Boolean(value);
    else if (value == null) form[field.key] = "";
    else if (field.kind === "currency")
      form[field.key] = (value as number).toFixed(field.decimals ?? 2);
    else form[field.key] = String(value);
  }
  return form;
}

function fromForm<T extends object>(
  fields: FieldDef<T>[],
  blank: T,
  form: FormState,
): T {
  const data = { ...blank } as Record<string, unknown>;
  for (const field of fields) {
    const value = form[field.key];
    if (field.kind === "toggle") {
      data[field.key] = Boolean(value);
    } else if (field.kind === "number" || field.kind === "currency") {
      const num = parseFloat(String(value).replace(/,/g, ""));
      data[field.key] = isNaN(num) ? null : num;
    } else {
      data[field.key] = String(value).trim();
    }
  }
  return data as T;
}

function displayValue<T extends object>(
  field: FieldDef<T>,
  data: T,
): string | undefined {
  const value = data[field.key] as unknown;
  if (value == null || value === "" || value === false) return undefined;
  switch (field.kind) {
    case "toggle":
      return "Yes";
    case "currency":
      return formatUsd(value as number, field.decimals ?? 2);
    case "number":
      return formatNumber(value as number, 1);
    default:
      return String(value);
  }
}

export default function RecordModal<TInput extends object>({
  noun,
  fields,
  blank,
  record,
  viewHeadline,
  onSave,
  onDelete,
  modalControls,
}: RecordModalProps<TInput>) {
  const { isSmall } = useBreakpoints();
  const [mode, setMode] = useState<Mode>(record ? "view" : "add");
  const initial = (): FormState =>
    record
      ? toForm(fields, record)
      : { ...toForm(fields, blank), date: new Date().toISOString().slice(0, 10) };
  const [form, setForm] = useState<FormState>(initial);

  function resetForm() {
    setForm(initial());
  }

  function setField(key: string, value: FormValue) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function normalizeCurrency(field: FieldDef<TInput>) {
    const num = parseFloat(String(form[field.key]).replace(/,/g, ""));
    setField(field.key, isNaN(num) ? "" : num.toFixed(field.decimals ?? 2));
  }

  function save() {
    const missing = fields.some(
      (f) => f.required && !String(form[f.key]).trim(),
    );
    if (missing) return;
    onSave(fromForm(fields, blank, form));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    save();
  }

  function getHeadline() {
    if (mode === "view" && record) return viewHeadline?.(record) ?? noun;
    if (mode === "edit") return isSmall ? "Edit" : `Edit ${noun}`;
    return isSmall ? "Add" : `Add ${noun}`;
  }

  function renderActions() {
    if (mode === "view") {
      return (
        <>
          {onDelete && <DeleteButton onClick={onDelete} />}
          <Button
            variant="text"
            className="hidden! sm:inline-flex!"
            onClick={modalControls.close}
          >
            Close
          </Button>
        </>
      );
    }

    return (
      <>
        {onDelete && mode === "edit" && <DeleteButton onClick={onDelete} />}
        <Button
          variant="text"
          className="hidden! sm:inline-flex!"
          onClick={() => {
            if (record) {
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
          {mode === "edit" ? "Save" : `Add ${noun}`}
        </Button>
      </>
    );
  }

  function renderField(field: FieldDef<TInput>) {
    const value = form[field.key];
    if (field.kind === "toggle") {
      return (
        <div key={field.key} className="flex items-center gap-3">
          <Switch
            label={field.label}
            selected={Boolean(value)}
            onChange={(selected) => setField(field.key, selected)}
          />
          <Text>{field.label}</Text>
        </div>
      );
    }

    return (
      <TextField
        key={field.key}
        label={field.label}
        fullWidth
        value={String(value)}
        onChange={(e) => setField(field.key, e.target.value)}
        placeholder={field.placeholder}
        className={field.kind === "textarea" ? "md:col-span-2" : undefined}
        {...(field.kind === "date" && { type: "date" })}
        {...(field.kind === "textarea" && { textarea: true, rows: 1 })}
        {...(field.kind === "number" && { inputMode: "decimal" as const })}
        {...(field.kind === "currency" && {
          prefix: "$",
          inputMode: "decimal" as const,
          onBlur: () => normalizeCurrency(field),
        })}
      />
    );
  }

  return (
    <Dialog
      open={modalControls.isOpen}
      onClose={modalControls.close}
      headline={getHeadline()}
      className="max-h-screen overflow-y-auto"
      actions={renderActions()}
    >
      {record && (
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

      {mode === "view" && record ? (
        <DescriptionList dividers>
          {fields.map((field) => {
            const value = displayValue(field, record);
            if (!value) return null;
            return (
              <DescriptionList.Item key={field.key} term={field.label}>
                {value}
              </DescriptionList.Item>
            );
          })}
        </DescriptionList>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="grid md:grid-cols-2 gap-4 md:gap-3"
        >
          {fields.map(renderField)}
        </form>
      )}
    </Dialog>
  );
}
