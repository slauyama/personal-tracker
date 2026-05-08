import { useState } from "react";
import { Button, Input, Modal, Select, Text } from "../ui/UI";
import { ALL_BRANDS, Brand, Category } from "../../constants";
import type { Product, ProductInput } from "../../hooks/useProducts";
import { ModalControls } from "../../hooks/useModal";

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
  price: null,
  dateBought: "",
  barcode: "",
  purchasedAt: "",
  notes: "",
  imageUrl: "",
  retailerUrl: "",
};

function toInput(product: Product): ProductInput {
  const { id: _id, status: _status, createdAt: _createdAt, ...rest } = product;
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
  const [priceStr, setPriceStr] = useState<string>(
    initialValues?.price != null ? initialValues.price.toFixed(2) : "",
  );

  function set(field: FormField) {
    return (e: FormEvent) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }) as ProductInput);
  }

  function handlePriceBlur() {
    const num = parseFloat(priceStr);
    const parsed = isNaN(num) || priceStr.trim() === "" ? null : num;
    setPriceStr(parsed != null ? parsed.toFixed(2) : "");
    setForm((prev) => ({ ...prev, price: parsed }));
  }

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  }

  return (
    <Modal
      modalControls={modalControls}
      title={isEdit ? "Edit Product" : "Add Product"}
      className="max-h-[90vh] overflow-y-auto"
    >
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Product Name"
            type="text"
            required
            value={form.name}
            onChange={set("name")}
            placeholder="e.g. Soft Matte Foundation"
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Brand"
              value={form.brand}
              onChange={set("brand")}
              options={ALL_BRANDS}
              placeholder="Select brand…"
              className="w-full"
            />
            <Select
              label="Category"
              value={form.category}
              onChange={set("category")}
              options={categories}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Shade / Color"
              type="text"
              value={form.shade}
              onChange={set("shade")}
              placeholder="e.g. 120W Warm Beige"
            />
            <Input
              label="Size"
              type="text"
              value={form.size}
              onChange={set("size")}
              placeholder="e.g. 1 oz, 30ml"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date Bought"
              type="date"
              value={form.dateBought}
              onChange={set("dateBought")}
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Store / Retailer"
              type="text"
              value={form.purchasedAt}
              onChange={set("purchasedAt")}
              placeholder="e.g. Sephora, Ulta"
            />
            <Input
              label="Barcode"
              type="text"
              value={form.barcode}
              onChange={set("barcode")}
              placeholder="e.g. 3614272263955"
              inputMode="numeric"
              className="font-mono"
            />
          </div>

          <div>
            <Text as="label" variant="label" className="block mb-1">
              Notes
            </Text>
            <textarea
              value={form.notes}
              onChange={set("notes")}
              placeholder="Any notes about this product…"
              rows={2}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>

          <Input
            label="Image URL"
            type="url"
            value={form.imageUrl}
            onChange={set("imageUrl")}
            placeholder="https://"
          />

          <Input
            label="Retailer Link"
            type="url"
            value={form.retailerUrl}
            onChange={set("retailerUrl")}
            placeholder="https://"
          />

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={modalControls.close}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {isEdit ? "Save Changes" : "Add Product"}
            </Button>
          </div>

          {onDelete && (
            <div className="pt-1 border-t border-zinc-100 dark:border-zinc-700">
              <Button
                variant="ghost"
                color="destructive"
                type="button"
                onClick={onDelete}
                className="w-full"
              >
                Delete Product
              </Button>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
}
