import { useState } from "react";
import {
  Button,
  Input,
  Modal,
  Select,
  Text,
  type ModalControls,
} from "@slauyama/ui";
import { ALL_DOG_PURCHASE_CATEGORIES, DogPurchaseCategory } from "../../constants";
import type { DogPurchase, DogPurchaseInput } from "../../hooks/useDogPurchases";

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
      setForm((prev) => ({ ...prev, [field]: e.target.value }) as DogPurchaseInput);
  }

  function handlePriceBlur() {
    const num = parseFloat(priceStr);
    const parsed = isNaN(num) || priceStr.trim() === "" ? null : num;
    setPriceStr(parsed != null ? parsed.toFixed(2) : "");
    setForm((prev) => ({ ...prev, price: parsed }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const num = parseFloat(quantityStr);
    const quantity = isNaN(num) || quantityStr.trim() === "" ? undefined : num;
    onSave({ ...form, quantity });
  }

  return (
    <Modal
      modalControls={modalControls}
      title={isEdit ? "Edit Purchase" : "Add Purchase"}
      className="max-h-[90vh] overflow-y-auto"
    >
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Item Name"
            type="text"
            required
            value={form.name}
            onChange={set("name")}
            placeholder="e.g. Blue Buffalo Chicken & Brown Rice 30lb"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              required
              value={form.date}
              onChange={set("date")}
            />
            <Select
              label="Category"
              value={form.category}
              onChange={set("category")}
              options={ALL_DOG_PURCHASE_CATEGORIES}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Vendor"
              type="text"
              value={form.vendor}
              onChange={set("vendor")}
              placeholder="e.g. Pet Food Express"
            />
            <Input
              label="Location"
              type="text"
              value={form.location}
              onChange={set("location")}
              placeholder="e.g. Campbell"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price"
              prefix="$"
              type="text"
              inputMode="decimal"
              value={priceStr}
              onChange={(e) => setPriceStr(e.target.value)}
              onBlur={handlePriceBlur}
              placeholder="0.00"
            />
            <Input
              label="Quantity"
              type="text"
              inputMode="numeric"
              value={quantityStr}
              onChange={(e) => setQuantityStr(e.target.value)}
              placeholder="e.g. 1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Barcode"
              type="text"
              value={form.barcode}
              onChange={set("barcode")}
              placeholder="e.g. 3614272263955"
              inputMode="numeric"
              className="font-mono"
            />
            <Input
              label="Retailer Link"
              type="url"
              value={form.retailerUrl}
              onChange={set("retailerUrl")}
              placeholder="https://"
            />
          </div>

          <div>
            <Text as="label" size="sm" className="block mb-1">
              Notes
            </Text>
            <textarea
              value={form.notes}
              onChange={set("notes")}
              placeholder="Any notes about this purchase…"
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
              {isEdit ? "Save Changes" : "Add Purchase"}
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
                Delete Purchase
              </Button>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
}
