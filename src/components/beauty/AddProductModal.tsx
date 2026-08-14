import { useState } from "react";
import {
  Button,
  Input,
  Modal,
  Select,
  TextArea,
  type ModalControls,
} from "@slauyama/ui";
import { ALL_BRANDS, Brand, Category } from "../../constants";
import type { Product, ProductInput } from "../../hooks/useProducts";
import { useBreakpoints } from "../../hooks/useBreakpoints";

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
  const { isSmall } = useBreakpoints();

  const [form, setForm] = useState<ProductInput>(
    initialValues
      ? toInput(initialValues)
      : { ...BLANK, dateBought: new Date().toISOString().slice(0, 10) },
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
      variant={isSmall ? "fullscreen" : "basic"}
      modalControls={modalControls}
      title={isEdit ? "Edit Product" : "Add Product"}
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

          <div className="grid md:grid-cols-2 gap-4 md:gap-3">
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
            />
          </div>

          <div>
            <TextArea
              label="Notes"
              value={form.notes}
              onChange={set("notes")}
              placeholder="Any notes about this product…"
              rows={2}
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

          <div className="flex pt-2 justify-between">
            {onDelete && (
              <Button
                surface="error"
                variant="filled"
                color="error"
                type="button"
                onClick={onDelete}
                className="w-full"
              >
                Delete
              </Button>
            )}
            <div>
              <Button variant="filled" type="submit" className="mr-3">
                {isEdit ? "Save" : "Add Product"}
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
