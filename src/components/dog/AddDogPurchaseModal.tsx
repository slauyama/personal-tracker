import { useState } from "react";
import {
  Button,
  Input,
  Modal,
  Select,
  TextArea,
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
import { useMediaQuery } from "../../hooks/useMediaQuery";

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
  const isMobile = useMediaQuery("(max-width: 640px)");

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
      variant={isMobile ? "fullscreen" : "basic"}
      title={isEdit ? "Edit Purchase" : "Add Purchase"}
      className="max-h-screen overflow-y-auto"
    >
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            type="text"
            required
            value={form.name}
            onChange={set("name")}
            placeholder="e.g. Blue Buffalo Chicken & Brown Rice 30lb"
          />

          <div className="grid md:grid-cols-2 gap-4 md:gap-3">
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
            <Input
              label="Barcode"
              type="text"
              value={form.barcode}
              onChange={set("barcode")}
              placeholder="e.g. 3614272263955"
              inputMode="numeric"
            />
            <Input
              label="Retailer Link"
              type="url"
              value={form.retailerUrl}
              onChange={set("retailerUrl")}
              placeholder="https://"
            />
          </div>

          <TextArea
            label="Notes"
            value={form.notes}
            onChange={set("notes")}
            placeholder="Any notes about this purchase…"
            rows={1}
          />

          <div className="flex pt-2 justify-between">
            {onDelete && (
              <Button
                surface="error"
                variant="tonal"
                type="button"
                onClick={onDelete}
              >
                Delete Purchase
              </Button>
            )}
            <div>
              <Button variant="filled" type="submit" className="mr-2">
                {isEdit ? "Save" : "Add Purchase"}
              </Button>
              <Button
                variant="text"
                size="sm"
                type="button"
                onClick={modalControls.close}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
