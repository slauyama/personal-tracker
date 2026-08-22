import { useState } from "react";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../lib/firebase";
import type { Product, ProductLookup } from "../../hooks/useProducts";
import type {
  Transaction,
  TransactionInput,
} from "../../hooks/useTransactions";
import { usePriceChecks, type PriceCheck } from "../../hooks/usePriceChecks";
import { daysOwned, formatCurrency } from "../../lib/transactionStats";
import {
  Button,
  Card,
  Heading,
  IconButton,
  Link,
  Spinner,
  Text,
  useIsOpen,
} from "@slauyama/ui";
import ConfirmModal from "../ui/ConfirmModal";
import AddProductModal from "./AddProductModal";
import TransactionModal from "./TransactionModal";
import Caption from "../ui/Caption";
import ListStateContainer from "../ui/ListStateContainer";

interface ProductDetailViewProps {
  categories: string[];
  loadingProducts: boolean;
  findProductById: (id: string | undefined) => ProductLookup | undefined;
  filterTransactionsByProductId: (productId: string) => Transaction[];
  onAddTransaction: (data: TransactionInput) => void;
  onUpdateTransaction: (id: string, data: TransactionInput) => void;
  onDeleteTransaction: (id: string) => void;
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
      <div className="w-40 h-40 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center gap-1 text-slate-400">
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
      className="max-w-100 bg-white aspect-square object-cover rounded-xl"
      onError={() => setBroken(true)}
    />
  );
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-1">
      <dt className="font-normal">{label}: </dt>
      <dd className="font-extralight">{value}</dd>
    </div>
  );
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
  return `In use — ${days} day${days !== 1 ? "s" : ""}`;
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

                {t.notes && (
                  <Text size="xs" className="text-zinc-400 truncate">
                    {t.notes}
                  </Text>
                )}
              </div>
              <div className="text-right">
                {t.price != null && (
                  <Text size="sm" className="font-semibold shrink-0">
                    ${formatCurrency(t.price)}
                  </Text>
                )}
                <Text size="xs" className="text-zinc-400">
                  {durationLabel(t)}
                </Text>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

interface PriceChecksListProps {
  priceChecks: PriceCheck[];
  loading: boolean;
  checking: boolean;
  checkError: string | null;
  onCheck: () => void;
}

function formatCheckedDate(date: string): string {
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString();
}

function PriceChecksList({
  priceChecks,
  loading,
  checking,
  checkError,
  onCheck,
}: PriceChecksListProps) {
  const sorted = [...priceChecks].sort((a, b) => a.price - b.price);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Caption className="tracking-wide">Online Prices</Caption>
        <Button variant="text" size="sm" onClick={onCheck} disabled={checking}>
          {checking ? "Checking…" : "Check Prices"}
        </Button>
      </div>

      {checkError && (
        <Text size="sm" className="text-red-500 mb-2">
          {checkError}
        </Text>
      )}

      <ListStateContainer
        isLoading={loading}
        isEmpty={sorted.length === 0}
        emptyContent={
          <Text size="sm" className="text-zinc-400">
            No price checks yet.
          </Text>
        }
      >
        <Card className="overflow-hidden">
          {sorted.map((pc, i) => (
            <div
              key={pc.id}
              className={`flex items-center justify-between gap-3 px-4 py-3 ${
                i < sorted.length - 1
                  ? "border-b border-zinc-50 dark:border-zinc-700"
                  : ""
              }`}
            >
              <div className="min-w-0">
                <Text size="sm" className="font-medium">
                  {pc.retailer}
                </Text>
                <Text size="xs" className="text-zinc-400">
                  Checked {formatCheckedDate(pc.date)}
                </Text>
              </div>
              <div className="text-right">
                <Text size="sm" className="font-semibold shrink-0">
                  ${formatCurrency(pc.price)}
                </Text>
                {pc.url && <Link href={pc.url}>Visit</Link>}
              </div>
            </div>
          ))}
        </Card>
      </ListStateContainer>
    </div>
  );
}

function BackIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export default function ProductDetailView({
  categories,
  loadingProducts,
  findProductById,
  filterTransactionsByProductId,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
}: ProductDetailViewProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const lookup = findProductById(id);
  const { priceChecks, loading: priceChecksLoading } = usePriceChecks(id);

  const editModal = useIsOpen();
  const confirmDeleteModal = useIsOpen();
  const transactionModal = useIsOpen();
  const confirmDeleteTransactionModal = useIsOpen();
  const [activeTransaction, setActiveTransaction] =
    useState<Transaction | null>(null);
  const [copied, setCopied] = useState(false);
  const [checkingPrices, setCheckingPrices] = useState(false);
  const [checkPricesError, setCheckPricesError] = useState<string | null>(null);

  if (loadingProducts) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }
  if (!lookup) {
    return (
      <div className="text-center py-20">
        <Text as="p" className="text-lg font-medium text-zinc-500">
          Product not found
        </Text>
        <RouterLink to="/beauty">
          <Button variant="text" className="mt-1">
            ← Back to Products
          </Button>
        </RouterLink>
      </div>
    );
  }

  const { item: product, update, delete: removeProduct } = lookup;
  const productTransactions = filterTransactionsByProductId(product.id);

  const today = new Date();
  const priced = productTransactions.filter(
    (t) => t.price != null && t.price > 0,
  );
  const totalSpent = priced.reduce((sum, t) => sum + (t.price ?? 0), 0);
  const totalDays = priced.reduce((sum, t) => sum + daysOwned(t, today), 0);
  const avgCostPerDay = totalDays > 0 ? totalSpent / totalDays : null;
  const averageCostPerPurchage = totalSpent / productTransactions.length;

  async function handleCheckPrices() {
    setCheckingPrices(true);
    setCheckPricesError(null);
    try {
      const searchProductPrices = httpsCallable(
        functions,
        "searchProductPrices",
      );
      await searchProductPrices({
        productId: product.id,
        brand: product.brand,
        name: product.name,
        shade: product.shade,
        size: product.size,
      });
    } catch {
      setCheckPricesError("Couldn't check prices — try again later.");
    } finally {
      setCheckingPrices(false);
    }
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch {
        // user cancelled the native share sheet — nothing to do
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard access denied — nothing to do
      }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <IconButton onClick={() => navigate(-1)} title="Back">
          <BackIcon />
        </IconButton>
        <div className="flex-1 min-w-0">
          <Heading as="h2" variant="subtitle" className="truncate">
            {product.name}
          </Heading>
          {product.brand && (
            <Text size="sm" className="text-zinc-400">
              {product.brand}
            </Text>
          )}
        </div>
        <Button variant="tonal" size="sm" onClick={handleShare}>
          {copied ? "Copied!" : "Share"}
        </Button>
        <Button variant="filled" size="sm" onClick={editModal.open}>
          Edit
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {product.imageUrl && <ProductImage url={product.imageUrl} />}
        <div className="flex grow flex-col gap-4">
          <dl className="flex-col gap-1">
            <Row label="Shade" value={product.shade} />
            <Row label="Size" value={product.size} />
          </dl>

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

          {priced.length > 0 && (
            <div className="flex gap-4">
              <Card>
                <Text className="p-2">
                  Total Spent: {`$${formatCurrency(totalSpent)}`}
                </Text>
              </Card>
              <Card>
                <Text className="p-2">
                  Cost Per Purchase:{" "}
                  {averageCostPerPurchage != null
                    ? `$${formatCurrency(averageCostPerPurchage)}`
                    : "—"}
                </Text>
              </Card>
              <Card>
                <Text className="p-2">
                  Cost Per Day:{" "}
                  {avgCostPerDay != null
                    ? `$${formatCurrency(avgCostPerDay)}`
                    : "—"}
                </Text>
              </Card>
            </div>
          )}

          <PriceChecksList
            priceChecks={priceChecks}
            loading={priceChecksLoading}
            checking={checkingPrices}
            checkError={checkPricesError}
            onCheck={handleCheckPrices}
          />

          <br />

          {product.retailerUrl && (
            <Link href={product.retailerUrl}>Manufacturer Link</Link>
          )}

          {product.barcode && (
            <Link
              href={`https://www.barcodelookup.com/${product.barcode}`}
              title={`Look up barcode ${product.barcode}`}
            >
              Barcode Lookup Link
            </Link>
          )}
          <Link
            href={buildAmazonSearchUrl(product)}
            title={`Search "${[product.brand, product.name].filter(Boolean).join(" ")}" on Amazon`}
          >
            Amazon Link
          </Link>
        </div>
      </div>

      <AddProductModal
        categories={categories}
        initialValues={product}
        modalControls={editModal}
        onSave={(data) => {
          update(data);
          editModal.close();
        }}
        onDelete={confirmDeleteModal.open}
      />
      <ConfirmModal
        modalControls={confirmDeleteModal}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          removeProduct();
          navigate("/beauty");
        }}
      />

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
    </div>
  );
}
