import { useState } from "react";
import { ProductStatus, ALL_BRANDS, Brand, Category } from "../constants";
import type { Product, ProductInput } from "../hooks/useProducts";
import Button from "./ui/Button";
import Heading from "./ui/Heading";
import Link from "./ui/Link";
import Modal from "./ui/Modal";
import Select from "./ui/Select";
import Text from "./ui/Text";
import AmazonIcon from "../assets/amazon_icon.png";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (data: ProductInput) => void;
  onDelete: () => void;
  updateProductStatus: (id: string, status: ProductStatus) => void;
  categories: string[];
}

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
  return { ...BLANK, ...rest };
}

function buildAmazonSearchUrl(product: Product): string {
  const q = [product.brand, product.name, product.shade, product.size]
    .filter(Boolean)
    .join(" ");
  return `https://www.amazon.com/s?k=${encodeURIComponent(q)}`;
}

function ProductImage({ url }: { url: string }) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div className="w-full h-40 rounded-xl bg-rose-50 border border-rose-100 flex flex-col items-center justify-center gap-1 text-rose-400">
        <span className="text-2xl">🖼️</span>
        <Text variant="caption" className="text-rose-400">
          Image could not be loaded — check the URL
        </Text>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt="Product"
      className="w-full aspect-square object-cover rounded-xl"
      onError={() => setBroken(true)}
    />
  );
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <Text
        variant="caption"
        className="text-gray-400 uppercase tracking-wide mb-0.5"
      >
        {label}
      </Text>
      <Text variant="body">{value}</Text>
    </div>
  );
}

type FormField = keyof ProductInput;
type FormEvent = React.ChangeEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300";

export default function ProductModal({
  product,
  onClose,
  onSave,
  onDelete,
  updateProductStatus,
  categories,
}: ProductModalProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProductInput>({ ...BLANK });
  const [priceStr, setPriceStr] = useState("");

  const modalControls = {
    isOpen: product !== null,
    open: () => {},
    close: onClose,
  };

  if (!product) return null;

  const isFinished = product.status === ProductStatus.Finished;
  const amazonSearchUrl = buildAmazonSearchUrl(product);

  function startEditing() {
    setForm(toInput(product!));
    setPriceStr(product!.price != null ? product!.price.toFixed(2) : "");
    setEditing(true);
  }

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

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
    setEditing(false);
  }

  return (
    <Modal
      modalControls={modalControls}
      closeOnBackdrop={!editing}
      className="max-h-[90vh] overflow-y-auto"
    >
      {editing ? (
        <div className="p-6">
          <div className="flex justify-between items-center mb-5">
            <Heading as="h2" variant="title">
              Edit Product
            </Heading>
            <button
              onClick={() => setEditing(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
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
                className={inputCls}
              />
            </div>

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
                  className={inputCls}
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
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Text as="label" variant="label" className="block mb-1">
                  Date Bought
                </Text>
                <input
                  type="date"
                  value={form.dateBought}
                  onChange={set("dateBought")}
                  className={inputCls}
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
                    className={`${inputCls} pl-6`}
                  />
                </div>
              </div>
            </div>

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
                  className={inputCls}
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
                  className={`${inputCls} font-mono`}
                />
              </div>
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
                className={`${inputCls} resize-none`}
              />
            </div>

            <div>
              <Text as="label" variant="label" className="block mb-1">
                Image URL
              </Text>
              <input
                type="url"
                value={form.imageUrl}
                onChange={set("imageUrl")}
                placeholder="https://"
                className={inputCls}
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
                className={inputCls}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Save Changes
              </Button>
            </div>

            <div className="pt-1 border-t border-gray-100">
              <button
                type="button"
                onClick={onDelete}
                className="w-full py-2 text-sm font-medium text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                Delete Product
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <Heading as="h2" variant="title">
                {product.name}
              </Heading>
              {product.brand && (
                <Text variant="muted" className="mt-0.5">
                  {product.brand}
                </Text>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none shrink-0"
            >
              &times;
            </button>
          </div>

          {product.imageUrl && <ProductImage url={product.imageUrl} />}

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Row label="Category" value={product.category} />
            <Row label="Shade" value={product.shade} />
            <Row label="Size" value={product.size} />
            <Row
              label="Price"
              value={
                product.price != null ? `$${product.price.toFixed(2)}` : ""
              }
            />
            <Row label="Date Bought" value={product.dateBought} />
            <Row label="Purchased From" value={product.purchasedAt} />
            <Row label="Status" value={isFinished ? "Finished" : "Active"} />
          </div>

          {product.notes && (
            <div>
              <Text
                variant="caption"
                className="text-gray-400 uppercase tracking-wide mb-0.5"
              >
                Notes
              </Text>
              <Text variant="body" className="whitespace-pre-wrap">
                {product.notes}
              </Text>
            </div>
          )}

          <div className="flex flex-row gap-4 border-t border-gray-100 pt-3">
            {product.retailerUrl && (
              <div className="flex items-center gap-1">
                <Text variant="caption" className="text-gray-400 shrink-0">
                  Retailer:
                </Text>
                <Link href={product.retailerUrl}>Link</Link>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Text variant="caption" className="text-gray-400 shrink-0">
                Amazon:
              </Text>
              <Link
                href={amazonSearchUrl}
                variant="icon"
                title={`Search "${[product.brand, product.name].filter(Boolean).join(" ")}" on Amazon`}
              >
                <img
                  src={AmazonIcon}
                  alt="Search on Amazon"
                  className="h-5 w-auto"
                />
              </Link>
            </div>
            {product.barcode && (
              <div className="flex items-center gap-1">
                <Text variant="caption" className="text-gray-400 shrink-0">
                  Barcode:
                </Text>
                <Link
                  href={`https://www.barcodelookup.com/${product.barcode}`}
                  variant="icon"
                  title={`Look up barcode ${product.barcode}`}
                >
                  <svg
                    viewBox="0 0 24 20"
                    className="h-4 w-auto fill-current text-rose-500"
                    aria-hidden="true"
                  >
                    <rect x="0" y="0" width="1.5" height="20" />
                    <rect x="3" y="0" width="1" height="20" />
                    <rect x="5.5" y="0" width="2" height="20" />
                    <rect x="9" y="0" width="1" height="20" />
                    <rect x="11" y="0" width="1.5" height="20" />
                    <rect x="14" y="0" width="1" height="20" />
                    <rect x="16.5" y="0" width="2" height="20" />
                    <rect x="20" y="0" width="1" height="20" />
                    <rect x="22.5" y="0" width="1.5" height="20" />
                  </svg>
                </Link>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={(_e) => {
                updateProductStatus(
                  product.id,
                  isFinished ? ProductStatus.Active : ProductStatus.Finished,
                );
              }}
              className={
                isFinished
                  ? "flex-1 text-xs bg-rose-50 text-rose-500 border border-rose-200 px-2 py-1.5 rounded-lg hover:bg-rose-100 transition"
                  : "flex-1 text-xs bg-gray-50 text-gray-500 border border-gray-200 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition"
              }
            >
              Mark {isFinished ? "Active" : "Finished"}
            </button>
            <Button onClick={startEditing} className="flex-1">
              Edit
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
