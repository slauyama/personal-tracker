import React, { useState } from "react";
import {
  Button,
  Dialog,
  Select,
  TextField,
  type ModalControls,
} from "@slauyama/ui";
import { ALL_BRANDS, Brand, Category } from "../../constants";
import type { Product, ProductInput } from "../../hooks/useProducts";

interface AddProductProps {
  categories: string[];
  initialValues?: Product;
  onSave: (data: ProductInput) => void;
  onDelete?: () => void;
  modalControls: ModalControls;
}

type FormField = keyof ProductInput;
type FormEvent = React.ChangeEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

const BLANK: ProductInput = {
  name: "",
  category: Category.MakeUp,
  brand: Brand.BenefitCosmetics,
  shade: "",
  size: "",
  barcode: "",
  imageUrl: "",
  retailerUrl: "",
};

function toInput(product: Product): ProductInput {
  const { id: _id, createdAt: _createdAt, ...rest } = product;
  return { ...BLANK, ...rest };
}

export default function AddProductModal({
  categories,
  initialValues,
  onSave,
  onDelete,
  modalControls,
}: AddProductProps) {
  const isEdit = !!initialValues;

  const [form, setForm] = useState<ProductInput>(
    initialValues ? toInput(initialValues) : { ...BLANK },
  );

  function set(field: FormField) {
    return (e: FormEvent) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }) as ProductInput);
  }

  function setSelect(field: FormField) {
    return (value: string) =>
      setForm((prev) => ({ ...prev, [field]: value }) as ProductInput);
  }

  function save() {
    if (!form.name.trim()) return;
    onSave(form);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    save();
  }

  return (
    <Dialog
      open={modalControls.isOpen}
      onClose={modalControls.close}
      headline={isEdit ? "Edit Product" : "Add Product"}
      className="max-h-screen overflow-y-auto"
      actions={
        <>
          {onDelete && (
            <Button
              variant="filled"
              type="button"
              onClick={onDelete}
              className="bg-(--color-error)! text-(--color-on-error)! mr-auto"
              icon="delete"
            >
              Delete
            </Button>
          )}
          <Button variant="text" type="button" onClick={modalControls.close}>
            Cancel
          </Button>
          <Button variant="filled" type="button" onClick={save}>
            {isEdit ? "Save" : "Add Product"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          variant="outlined"
          label="Product Name"
          type="text"
          fullWidth
          value={form.name}
          onChange={set("name")}
          placeholder="e.g. Soft Matte Foundation"
        />

        <div className="grid md:grid-cols-2 gap-4 md:gap-3">
          <Select
            label="Brand"
            value={form.brand}
            onChange={setSelect("brand")}
            options={ALL_BRANDS.map((b) => ({ value: b, label: b }))}
            fullWidth
          />
          <Select
            label="Category"
            value={form.category}
            onChange={setSelect("category")}
            options={categories.map((c) => ({ value: c, label: c }))}
            fullWidth
          />
          <TextField
            variant="outlined"
            label="Shade / Color"
            type="text"
            fullWidth
            value={form.shade}
            onChange={set("shade")}
            placeholder="e.g. 120W Warm Beige"
          />
          <TextField
            variant="outlined"
            label="Size"
            type="text"
            fullWidth
            value={form.size}
            onChange={set("size")}
            placeholder="e.g. 1 oz, 30ml"
          />
          <TextField
            variant="outlined"
            label="Barcode"
            type="text"
            fullWidth
            value={form.barcode}
            onChange={set("barcode")}
            placeholder="e.g. 3614272263955"
            inputMode="numeric"
          />
        </div>

        <TextField
          variant="outlined"
          label="Image URL"
          type="url"
          fullWidth
          value={form.imageUrl}
          onChange={set("imageUrl")}
          placeholder="https://"
        />

        <TextField
          variant="outlined"
          label="Manufacturer Link"
          type="url"
          fullWidth
          value={form.retailerUrl}
          onChange={set("retailerUrl")}
          placeholder="https://"
        />
      </form>
    </Dialog>
  );
}
