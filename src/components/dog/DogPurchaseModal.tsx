import { useState } from "react";
import {
  Button,
  Dialog,
  List,
  Select,
  Switch,
  Text,
  TextField,
  type ModalControls,
} from "@slauyama/ui";
import {
  ALL_DOG_PURCHASE_CATEGORIES,
  DogPurchaseCategory,
} from "../../constants";
import type {
  DogPurchase,
  DogPurchaseInput,
} from "../../hooks/useDogPurchases";

interface DogPurchaseModalProps {
  dogPurchase?: DogPurchase;
  onSave: (data: DogPurchaseInput) => void;
  onDelete?: () => void;
  modalControls: ModalControls;
}

type FormField = keyof DogPurchaseInput;
type FormEvent = React.ChangeEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;
type Mode = "add" | "view" | "edit";

const BLANK: DogPurchaseInput = {
  date: "",
  category: DogPurchaseCategory.Veterinarian,
  name: "",
  notes: "",
  vendor: "",
  location: "",
  barcode: "",
  price: null,
  retailerUrl: "",
  quantity: undefined,
};

function toInput(purchase: DogPurchase): DogPurchaseInput {
  const { id: _id, createdAt: _createdAt, ...rest } = purchase;
  return { ...BLANK, ...rest };
}

function formatPrice(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function DogPurchaseModal({
  dogPurchase,
  onSave,
  onDelete,
  modalControls,
}: DogPurchaseModalProps) {
  const [mode, setMode] = useState<Mode>(dogPurchase ? "view" : "add");

  const [form, setForm] = useState<DogPurchaseInput>(
    dogPurchase
      ? toInput(dogPurchase)
      : { ...BLANK, date: new Date().toISOString().slice(0, 10) },
  );
  const [priceStr, setPriceStr] = useState<string>(
    dogPurchase?.price != null ? dogPurchase.price.toFixed(2) : "",
  );
  const [quantityStr, setQuantityStr] = useState<string>(
    dogPurchase?.quantity != null ? String(dogPurchase.quantity) : "",
  );

  function resetForm() {
    if (!dogPurchase) return;
    setForm(toInput(dogPurchase));
    setPriceStr(dogPurchase.price != null ? dogPurchase.price.toFixed(2) : "");
    setQuantityStr(
      dogPurchase.quantity != null ? String(dogPurchase.quantity) : "",
    );
  }

  function set(field: FormField) {
    return (e: FormEvent) =>
      setForm(
        (prev) => ({ ...prev, [field]: e.target.value }) as DogPurchaseInput,
      );
  }

  function handlePriceBlur() {
    const num = parseFloat(priceStr);
    const parsed = isNaN(num) || priceStr.trim() === "" ? null : num;
    setPriceStr(parsed != null ? parsed.toFixed(2) : "");
    setForm((prev) => ({ ...prev, price: parsed }));
  }

  function save() {
    if (!form.name.trim()) return;
    const num = parseFloat(quantityStr);
    const quantity = isNaN(num) || quantityStr.trim() === "" ? undefined : num;
    onSave({ ...form, quantity });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    save();
  }

  const headline =
    mode === "view" && dogPurchase
      ? dogPurchase.name
      : mode === "edit"
        ? "Edit Purchase"
        : "Add Purchase";

  const dogPurchaseListItems: Array<{
    headline: string;
    trailingText?: string;
  }> = dogPurchase
    ? [
        {
          headline: "Notes",
          trailingText: dogPurchase.notes,
        },
        {
          headline: "Date",
          trailingText: dogPurchase.date,
        },
        {
          headline: "Category",
          trailingText: dogPurchase.category,
        },
        {
          headline: "Vendor",
          trailingText: dogPurchase.vendor,
        },
        {
          headline: "Location",
          trailingText: dogPurchase.location,
        },
        {
          headline: "Price",
          trailingText:
            dogPurchase.price != null
              ? formatPrice(dogPurchase.price)
              : undefined,
        },
        {
          headline: "Quantity",
          trailingText:
            dogPurchase.quantity != null
              ? String(dogPurchase.quantity)
              : undefined,
        },
        {
          headline: "Barcode",
          trailingText: dogPurchase.barcode,
        },
        {
          headline: "Manufacturer Link",
          trailingText: dogPurchase.retailerUrl,
        },
        {
          headline: "Notes",
          trailingText: dogPurchase.notes,
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
                variant="filled"
                icon="delete"
                onClick={onDelete}
                className="bg-(--color-error)! text-(--color-on-error)! mr-auto"
              >
                Delete
              </Button>
            )}
            <Button variant="text" onClick={modalControls.close}>
              Close
            </Button>
          </>
        ) : (
          <>
            {onDelete && mode === "edit" && (
              <Button
                variant="filled"
                onClick={onDelete}
                icon="delete"
                className="bg-(--color-error)! text-(--color-on-error)! mr-auto"
              >
                Delete
              </Button>
            )}
            <Button
              variant="text"
              onClick={() => {
                if (dogPurchase) {
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
              {mode === "edit" ? "Save" : "Add Purchase"}
            </Button>
          </>
        )
      }
    >
      {dogPurchase && (
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

      {mode === "view" && dogPurchase ? (
        <List dividers>
          {dogPurchaseListItems.map((dogPurchase) => {
            if (dogPurchase.trailingText) {
              return (
                <List.Item
                  headline={dogPurchase.headline}
                  trailingText={dogPurchase.trailingText}
                />
              );
            }
            return null;
          })}
        </List>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Name"
            type="text"
            fullWidth
            value={form.name}
            onChange={set("name")}
            placeholder="e.g. Blue Buffalo Chicken & Brown Rice 30lb"
          />

          <div className="grid md:grid-cols-2 gap-4 md:gap-3">
            <TextField
              label="Date"
              type="date"
              fullWidth
              value={form.date}
              onChange={set("date")}
            />
            <Select
              label="Category"
              value={form.category}
              onChange={(value) =>
                setForm(
                  (prev) => ({ ...prev, category: value }) as DogPurchaseInput,
                )
              }
              options={ALL_DOG_PURCHASE_CATEGORIES.map((c) => ({
                value: c,
                label: c,
              }))}
              fullWidth
            />
            <TextField
              label="Vendor"
              type="text"
              fullWidth
              value={form.vendor}
              onChange={set("vendor")}
              placeholder="e.g. Pet Food Express"
            />
            <TextField
              label="Location"
              type="text"
              fullWidth
              value={form.location}
              onChange={set("location")}
              placeholder="e.g. Campbell"
            />
            <TextField
              label="Price"
              prefix="$"
              type="text"
              fullWidth
              inputMode="decimal"
              value={priceStr}
              onChange={(e) => setPriceStr(e.target.value)}
              onBlur={handlePriceBlur}
              placeholder="0.00"
            />
            <TextField
              label="Quantity"
              type="text"
              fullWidth
              inputMode="numeric"
              value={quantityStr}
              onChange={(e) => setQuantityStr(e.target.value)}
              placeholder="e.g. 1"
            />
            <TextField
              label="Barcode"
              type="text"
              fullWidth
              value={form.barcode}
              onChange={set("barcode")}
              placeholder="e.g. 3614272263955"
              inputMode="numeric"
            />
            <TextField
              label="Manufacturer Link"
              type="url"
              fullWidth
              value={form.retailerUrl}
              onChange={set("retailerUrl")}
              placeholder="https://"
            />
          </div>

          <TextField
            label="Notes"
            textarea
            fullWidth
            value={form.notes}
            onChange={set("notes")}
            placeholder="Any notes about this purchase…"
            rows={1}
          />
        </form>
      )}
    </Dialog>
  );
}
