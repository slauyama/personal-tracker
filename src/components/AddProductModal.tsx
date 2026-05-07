import { useState } from "react";
import Button from "./ui/Button";
import Heading from "./ui/Heading";
import Modal from "./ui/Modal";
import Select from "./ui/Select";
import Text from "./ui/Text";
import { ALL_BRANDS, Brand, Category } from "../constants";
import type { Product, ProductInput } from "../hooks/useProducts";
import { ModalControls } from "../hooks/useModal";

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
  category: Category.Blush,
  brand: Brand.bareMinerals,
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
  // Spread BLANK first so any fields added after a product was created
  // (e.g. purchasedAt on old records) default to empty string.
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

  const input =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300";

  return (
    <Modal
      modalControls={modalControls}
      className="max-h-[90vh] overflow-y-auto"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-5">
          <Heading as="h2" variant="title">
            {isEdit ? "Edit Product" : "Add Product"}
          </Heading>
          <button
            onClick={modalControls.close}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Text as="label" variant="label" className="block mb-1">
              Product Name <span className="text-rose-400">*</span>
            </Text>
            <input
              type="text"
              required
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Soft Matte Foundation"
              className={input}
            />
          </div>

          {/* Brand + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Text as="label" variant="label" className="block mb-1">
                Brand
              </Text>
              <Select
                value={form.brand}
                onChange={set("brand")}
                options={ALL_BRANDS}
                placeholder="Select brand…"
                className="w-full"
              />
            </div>
            <div>
              <Text as="label" variant="label" className="block mb-1">
                Category
              </Text>
              <Select
                value={form.category}
                onChange={set("category")}
                options={categories}
                className="w-full"
              />
            </div>
          </div>

          {/* Shade + Size */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Text as="label" variant="label" className="block mb-1">
                Shade / Color
              </Text>
              <input
                type="text"
                value={form.shade}
                onChange={set("shade")}
                placeholder="e.g. 120W Warm Beige"
                className={input}
              />
            </div>
            <div>
              <Text as="label" variant="label" className="block mb-1">
                Size
              </Text>
              <input
                type="text"
                value={form.size}
                onChange={set("size")}
                placeholder="e.g. 1 oz, 30ml"
                className={input}
              />
            </div>
          </div>

          {/* Date Bought + Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Text as="label" variant="label" className="block mb-1">
                Date Bought
              </Text>
              <input
                type="date"
                value={form.dateBought}
                onChange={set("dateBought")}
                className={input}
              />
            </div>
            <div>
              <Text as="label" variant="label" className="block mb-1">
                Price
              </Text>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">
                  $
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={priceStr}
                  onChange={(e) => setPriceStr(e.target.value)}
                  onBlur={handlePriceBlur}
                  placeholder="0.00"
                  className={`${input} pl-6`}
                />
              </div>
            </div>
          </div>

          {/* Store / Barcode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Text as="label" variant="label" className="block mb-1">
                Store / Retailer
              </Text>
              <input
                type="text"
                value={form.purchasedAt}
                onChange={set("purchasedAt")}
                placeholder="e.g. Sephora, Ulta"
                className={input}
              />
            </div>
            <div>
              <Text as="label" variant="label" className="block mb-1">
                Barcode
              </Text>
              <input
                type="text"
                value={form.barcode}
                onChange={set("barcode")}
                placeholder="e.g. 3614272263955"
                inputMode="numeric"
                className={`${input} font-mono`}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Text as="label" variant="label" className="block mb-1">
              Notes
            </Text>
            <textarea
              value={form.notes}
              onChange={set("notes")}
              placeholder="Any notes about this product…"
              rows={2}
              className={`${input} resize-none`}
            />
          </div>

          {/* Image URL */}
          <div>
            <Text as="label" variant="label" className="block mb-1">
              Image URL
            </Text>
            <input
              type="url"
              value={form.imageUrl}
              onChange={set("imageUrl")}
              placeholder="https://"
              className={input}
            />
          </div>

          <div>
            <Text as="label" variant="label" className="block mb-1">
              Retailer Link
            </Text>
            <input
              type="url"
              value={form.retailerUrl}
              onChange={set("retailerUrl")}
              placeholder="https://"
              className={input}
            />
          </div>

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
            <div className="pt-1 border-t border-gray-100">
              <button
                type="button"
                onClick={onDelete}
                className="w-full py-2 text-sm font-medium text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                Delete Product
              </button>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
}
