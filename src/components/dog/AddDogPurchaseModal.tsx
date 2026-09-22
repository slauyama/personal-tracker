import { useState } from "react";
import {
  Button,
  Dialog,
  Select,
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

interface AddDogPurchaseModalProps {
  initialValues?: DogPurchase;
  onSave: (data: DogPurchaseInput) => void;
  onDelete?: () => void;
  modalControls: ModalControls;
}

type FormField = keyof DogPurchaseInput;
type FormEvent = React.ChangeEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

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

export default function AddDogPurchaseModal({
  initialValues,
  onSave,
  onDelete,
  modalControls,
}: AddDogPurchaseModalProps) {
  const isEdit = !!initialValues;

  const [form, setForm] = useState<DogPurchaseInput>(
    initialValues
      ? toInput(initialValues)
      : { ...BLANK, date: new Date().toISOString().slice(0, 10) },
  );
  const [priceStr, setPriceStr] = useState<string>(
    initialValues?.price != null ? initialValues.price.toFixed(2) : "",
  );
  const [quantityStr, setQuantityStr] = useState<string>(
    initialValues?.quantity != null ? String(initialValues.quantity) : "",
  );

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

  return (
    <Dialog
      open={modalControls.isOpen}
      onClose={modalControls.close}
      headline={isEdit ? "Edit Purchase" : "Add Purchase"}
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
              Delete Purchase
            </Button>
          )}
          <Button variant="text" type="button" onClick={modalControls.close}>
            Cancel
          </Button>
          <Button variant="filled" type="button" onClick={save}>
            {isEdit ? "Save" : "Add Purchase"}
          </Button>
        </>
      }
    >
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
    </Dialog>
  );
}
