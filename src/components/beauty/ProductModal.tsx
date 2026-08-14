import { useState } from "react";
import { ALL_BRANDS, Brand, Category } from "../../constants";
import type { Product, ProductInput } from "../../hooks/useProducts";
import type {
  Transaction,
  TransactionInput,
} from "../../hooks/useTransactions";
import {
  Button,
  Card,
  Input,
  Link,
  Modal,
  Select,
  Text,
  TextArea,
  useIsOpen,
  type ModalControls,
} from "@slauyama/ui";
import ConfirmModal from "../ui/ConfirmModal";
import TransactionModal from "./TransactionModal";

import AmazonIcon from "../../assets/amazon_icon.png";
import Caption from "../ui/Caption";
import { useBreakpoints } from "../../hooks/useBreakpoints";

interface ProductModalProps {
  categories: string[];
  modalControls: ModalControls;
  onClose: () => void;
  onDelete: () => void;
  onSave: (data: ProductInput) => void;
  product: Product;
  transactions: Transaction[];
  onAddTransaction: (data: TransactionInput) => void;
  onUpdateTransaction: (id: string, data: TransactionInput) => void;
  onDeleteTransaction: (id: string) => void;
}

const BLANK: ProductInput = {
  name: "",
  category: Category.MakeUp,
  brand: Brand.BenefitCosmetics,
  shade: "",
  size: "",
  barcode: "",
  notes: "",
  imageUrl: "",
  retailerUrl: "",
};

function toInput(product: Product): ProductInput {
  const { id: _id, createdAt: _createdAt, ...rest } = product;
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
        <Text size="sm" className="text-slate-400">
          Image could not be loaded — check the URL
        </Text>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt="Product"
      className="w-full bg-white aspect-square object-cover rounded-xl"
      onError={() => setBroken(true)}
    />
  );
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <Caption className="tracking-wide mb-0.5">{label}</Caption>
      <Text size="sm">{value}</Text>
    </div>
  );
}

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function durationLabel(transaction: Transaction): string {
  const msPerDay = 1000 * 60 * 60 * 24;
  const purchased = new Date(transaction.purchaseDate);
  if (isNaN(purchased.getTime())) return "";

  if (transaction.finishDate) {
    const finished = new Date(transaction.finishDate);
    if (isNaN(finished.getTime())) return "";
    const days = Math.max(
      1,
      Math.round((finished.getTime() - purchased.getTime()) / msPerDay),
    );
    return `Lasted ${days} day${days !== 1 ? "s" : ""}`;
  }

  const days = Math.max(
    0,
    Math.round((Date.now() - purchased.getTime()) / msPerDay),
  );
  return `In use — ${days} day${days !== 1 ? "s" : ""} so far`;
}

interface TransactionsListProps {
  transactions: Transaction[];
  onAdd: () => void;
  onEdit: (transaction: Transaction) => void;
}

function TransactionsList({
  transactions,
  onAdd,
  onEdit,
}: TransactionsListProps) {
  const sorted = [...transactions].sort((a, b) =>
    b.purchaseDate.localeCompare(a.purchaseDate),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Caption className="tracking-wide">Purchases</Caption>
        <Button variant="text" size="sm" onClick={onAdd}>
          + Add Purchase
        </Button>
      </div>
      {sorted.length === 0 ? (
        <Text size="sm" className="text-zinc-400">
          No purchases recorded yet.
        </Text>
      ) : (
        <Card className="overflow-hidden">
          {sorted.map((t, i) => (
            <div
              key={t.id}
              onClick={() => onEdit(t)}
              className={`flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 ${
                i < sorted.length - 1
                  ? "border-b border-zinc-50 dark:border-zinc-700"
                  : ""
              }`}
            >
              <div className="min-w-0">
                <Text size="sm" className="font-medium">
                  {t.purchaseDate}
                  {t.location ? ` · ${t.location}` : ""}
                </Text>
                <Text size="xs" className="text-zinc-400">
                  {durationLabel(t)}
                </Text>
              </div>
              {t.price != null && (
                <Text size="sm" className="font-semibold shrink-0">
                  ${formatCurrency(t.price)}
                </Text>
              )}
            </div>
          ))}
        </Card>
      )}
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
  transactions,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
}: ProductModalProps) {
  const [editing, setEditing] = useState(false);
  const confirmDeleteModal = useIsOpen();
  const [form, setForm] = useState<ProductInput>({ ...BLANK });
  const { isSmall } = useBreakpoints();

  const transactionModal = useIsOpen();
  const confirmDeleteTransactionModal = useIsOpen();
  const [activeTransaction, setActiveTransaction] =
    useState<Transaction | null>(null);

  const productTransactions = product
    ? transactions.filter((t) => t.productId === product.id)
    : [];

  function startEditing() {
    setForm(toInput(product!));
    setEditing(true);
  }

  function set(field: FormField) {
    return (e: FormEvent) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }) as ProductInput);
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
    setEditing(false);
  }

  function renderEditProduct() {
    return (
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
                label="Barcode"
                type="text"
                value={form.barcode}
                onChange={set("barcode")}
                placeholder="e.g. 3614272263955"
                inputMode="numeric"
              />
            </div>

            <TextArea
              label="Notes"
              value={form.notes}
              onChange={set("notes")}
              placeholder="Any notes about this product…"
              rows={2}
            />

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

            <div className="flex justify-between">
              <Button
                variant="tonal"
                surface="error"
                type="button"
                onClick={confirmDeleteModal.open}
              >
                Delete
              </Button>
              <div>
                <Button variant="filled" type="submit" className="mr-2">
                  Save
                </Button>
                <Button
                  variant="text"
                  type="button"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
        <ConfirmModal
          modalControls={confirmDeleteModal}
          title="Delete Product"
          message={`Are you sure you want to delete "${product.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => {
            onDelete();
            onClose();
          }}
        />
      </>
    );
  }

  function renderProduct() {
    return (
      <div className="p-6 flex flex-col gap-4">
        {product.imageUrl && <ProductImage url={product.imageUrl} />}

        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Row label="Category" value={product.category} />
          <Row label="Shade" value={product.shade} />
          <Row label="Size" value={product.size} />
        </div>

        {product.notes && (
          <div>
            <Caption className="text-zinc-400">Notes</Caption>
            <Text size="sm" className="whitespace-pre-wrap">
              {product.notes}
            </Text>
          </div>
        )}

        <div className="flex flex-row gap-4 border-t border-zinc-100 dark:border-zinc-700 pt-3">
          {product.retailerUrl && (
            <Link href={product.retailerUrl}>Retailer Link</Link>
          )}
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
          {product.barcode && (
            <div className="flex items-center gap-1">
              <Caption className="text-zinc-400">Barcode:</Caption>
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

        <TransactionsList
          transactions={productTransactions}
          onAdd={() => {
            setActiveTransaction(null);
            transactionModal.open();
          }}
          onEdit={(t) => {
            setActiveTransaction(t);
            transactionModal.open();
          }}
        />

        <div className="flex gap-3 pt-1">
          <Button onClick={startEditing}>Edit</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Modal
        variant={isSmall ? "fullscreen" : "fullscreen"}
        modalControls={modalControls}
        title={editing ? "Edit Product" : (product?.name ?? "")}
        subtitle={!editing && product?.brand ? product?.brand : undefined}
        onClose={() => {
          setTimeout(() => {
            setEditing(false);
            onClose();
          }, 0);
        }}
        className="max-h-screen overflow-y-auto"
        closeOnBackdrop={!editing}
      >
        {editing ? renderEditProduct() : renderProduct()}
      </Modal>

      <TransactionModal
        key={activeTransaction?.id ?? "new"}
        productId={product.id}
        initialValues={activeTransaction ?? undefined}
        modalControls={transactionModal}
        onSave={(data) => {
          if (activeTransaction) {
            onUpdateTransaction(activeTransaction.id, data);
          } else {
            onAddTransaction(data);
          }
          transactionModal.close();
        }}
        onDelete={
          activeTransaction
            ? () => confirmDeleteTransactionModal.open()
            : undefined
        }
      />
      <ConfirmModal
        modalControls={confirmDeleteTransactionModal}
        title="Delete Purchase"
        message="Are you sure you want to delete this purchase? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          if (activeTransaction) {
            onDeleteTransaction(activeTransaction.id);
            transactionModal.close();
          }
        }}
      />
    </>
  );
}
