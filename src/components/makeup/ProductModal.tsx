import { useState } from "react";
import { ProductStatus, ALL_BRANDS, Brand, Category } from "../../constants";
import type { Product, ProductInput } from "../../hooks/useProducts";
import { ModalControls, useModal } from "../../hooks/useModal";
import {
  Button,
  ConfirmModal,
  Input,
  Link,
  Modal,
  Select,
  Text,
} from "../ui/UI";

import AmazonIcon from "../../assets/amazon_icon.png";

interface ProductModalProps {
  categories: string[];
  modalControls: ModalControls;
  onClose: () => void;
  onDelete: () => void;
  onSave: (data: ProductInput) => void;
  product: Product | null;
  updateProductStatus: (id: string, status: ProductStatus) => void;
}

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
      <div className="w-full h-40 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center gap-1 text-slate-400">
        <span className="text-2xl">🖼️</span>
        <Text variant="caption" className="text-slate-400">
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
        className="text-zinc-400 uppercase tracking-wide mb-0.5"
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

export default function ProductModal({
  categories,
  modalControls,
  onClose,
  onDelete,
  onSave,
  product,
  updateProductStatus,
}: ProductModalProps) {
  const [editing, setEditing] = useState(false);
  const confirmDeleteModal = useModal();
  const [form, setForm] = useState<ProductInput>({ ...BLANK });
  const [priceStr, setPriceStr] = useState("");

  const isFinished = product?.status === ProductStatus.Finished;

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
    <>
      <Modal
        modalControls={modalControls}
        title={editing ? "Edit Product" : (product?.name ?? "")}
        subtitle={!editing && product?.brand ? product?.brand : undefined}
        onClose={() => {
          setTimeout(() => {
            setEditing(false);
            onClose();
          }, 0);
        }}
        closeOnBackdrop={!editing}
        className="max-h-[90vh] overflow-y-auto"
      >
        {product === null ? (
          ""
        ) : editing ? (
          <>
            <div className="p-6">
              <form onSubmit={handleSave} className="space-y-4">
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
                    onClick={() => setEditing(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Save Changes
                  </Button>
                </div>

                <div className="pt-1 border-t border-zinc-100 dark:border-zinc-700">
                  <Button
                    variant="ghost"
                    color="destructive"
                    type="button"
                    onClick={confirmDeleteModal.open}
                    className="w-full"
                  >
                    Delete Product
                  </Button>
                </div>
              </form>
            </div>
            <ConfirmModal
              modalControls={confirmDeleteModal}
              title="Delete Product"
              message={`Are you sure you want to delete "${product.name}"? This cannot be undone.`}
              confirmLabel="Delete"
              onConfirm={onDelete}
            />
          </>
        ) : (
          <div className="p-6 flex flex-col gap-4">
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
                  className="text-zinc-400 uppercase tracking-wide mb-0.5"
                >
                  Notes
                </Text>
                <Text variant="body" className="whitespace-pre-wrap">
                  {product.notes}
                </Text>
              </div>
            )}

            <div className="flex flex-row gap-4 border-t border-zinc-100 dark:border-zinc-700 pt-3">
              {product.retailerUrl && (
                <div className="flex items-center gap-1">
                  <Text variant="caption" className="text-zinc-400 shrink-0">
                    Retailer:
                  </Text>
                  <Link href={product.retailerUrl}>Link</Link>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Text variant="caption" className="text-zinc-400 shrink-0">
                  Amazon:
                </Text>
                <Link
                  href={buildAmazonSearchUrl(product)}
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
                  <Text variant="caption" className="text-zinc-400 shrink-0">
                    Barcode:
                  </Text>
                  <Link
                    href={`https://www.barcodelookup.com/${product.barcode}`}
                    variant="icon"
                    title={`Look up barcode ${product.barcode}`}
                  >
                    <svg
                      viewBox="0 0 24 20"
                      className="h-4 w-auto fill-current text-black dark:text-white"
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
              <Button
                variant={isFinished ? "ghost" : "secondary"}
                size="xs"
                className="flex-1"
                onClick={() =>
                  updateProductStatus(
                    product.id,
                    isFinished ? ProductStatus.Active : ProductStatus.Finished,
                  )
                }
              >
                Mark {isFinished ? "Active" : "Finished"}
              </Button>
              <Button onClick={startEditing} className="flex-1">
                Edit
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
