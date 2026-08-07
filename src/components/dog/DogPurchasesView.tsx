import { useState } from "react";
import { Button, Card, Heading, Input, Text, useIsOpen } from "@slauyama/ui";
import type {
  DogPurchase,
  DogPurchaseInput,
} from "../../hooks/useDogPurchases";
import AddDogPurchaseModal from "./AddDogPurchaseModal";
import ConfirmModal from "../ui/ConfirmModal";
import SortableHeader from "./SortableHeader";
import CategoryBadge from "./CategoryBadge";
import { PURCHASE_CATEGORY_COLORS } from "./categoryColors";

interface DogPurchasesViewProps {
  dogPurchases: DogPurchase[];
  onAddPurchase: (data: DogPurchaseInput) => void;
  onUpdatePurchase: (id: string, data: DogPurchaseInput) => void;
  onDeletePurchase: (id: string) => void;
}

type SortField = "date" | "category" | "price";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 15;

function formatPrice(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4 flex flex-col gap-1">
      <Text className="text-zinc-400 uppercase tracking-wide">{label}</Text>
      <span className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
        {value}
      </span>
    </Card>
  );
}

function buildSpendStats(purchases: DogPurchase[]) {
  const priced = purchases.filter(
    (p): p is DogPurchase & { price: number } => p.price != null && p.price > 0,
  );
  const totalSpent = priced.reduce((sum, p) => sum + p.price, 0);
  const earliestDate = priced.reduce<string | null>(
    (earliest, p) =>
      earliest === null || p.date < earliest ? p.date : earliest,
    null,
  );
  const daysTracked = earliestDate
    ? Math.max(
        1,
        Math.floor(
          (Date.now() - new Date(earliestDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 1;
  const costPerDay = totalSpent / daysTracked;
  const costPerYear = costPerDay * 365;
  return { totalSpent, costPerDay, costPerYear };
}

function matchesQuery(purchase: DogPurchase, query: string): boolean {
  if (!query) return true;
  return [
    purchase.date,
    purchase.category,
    purchase.name,
    purchase.notes,
    purchase.vendor,
    purchase.location,
  ]
    .join(" ")
    .toLowerCase()
    .includes(query.toLowerCase());
}

function sortPurchases(
  purchases: DogPurchase[],
  field: SortField,
  dir: SortDir,
): DogPurchase[] {
  return [...purchases].sort((a, b) => {
    let cmp: number;
    if (field === "price") {
      const ap = a.price;
      const bp = b.price;
      if (ap == null && bp == null) cmp = 0;
      else if (ap == null) return 1;
      else if (bp == null) return -1;
      else cmp = ap - bp;
    } else if (field === "category") {
      cmp = a.category.localeCompare(b.category);
    } else {
      cmp = a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
    }
    return dir === "asc" ? cmp : -cmp;
  });
}

export default function DogPurchasesView({
  dogPurchases,
  onAddPurchase,
  onUpdatePurchase,
  onDeletePurchase,
}: DogPurchasesViewProps) {
  const addModal = useIsOpen();
  const editModal = useIsOpen();
  const confirmDeleteModal = useIsOpen();

  const [activePurchase, setActivePurchase] = useState<DogPurchase | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expanded, setExpanded] = useState(false);

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const filtered = dogPurchases.filter((p) => matchesQuery(p, query));
  const rows = sortPurchases(filtered, sortField, sortDir);
  const visibleRows = expanded ? rows : rows.slice(0, PAGE_SIZE);
  const stats = buildSpendStats(dogPurchases);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <Input
          label="Search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, vendor, category…"
          className="max-w-xs"
        />
        <div className="flex-1" />
        <Button onClick={addModal.open}>+ Add Purchase</Button>
      </div>

      {dogPurchases.length === 0 ? (
        <div className="text-center py-20">
          <Text as="p" className="text-5xl mb-3">
            🐾
          </Text>
          <Text as="p" className="text-lg font-medium text-zinc-500">
            No purchases yet
          </Text>
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-20">
          <Text as="p" className="text-lg font-medium text-zinc-500">
            No purchases match your search
          </Text>
        </div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-700">
                <SortableHeader
                  label="Date"
                  field="date"
                  sortField={sortField}
                  sortDir={sortDir}
                  onClick={handleSort}
                />
                <SortableHeader
                  label="Category"
                  field="category"
                  sortField={sortField}
                  sortDir={sortDir}
                  onClick={handleSort}
                />
                <th className="px-2 py-3 font-medium text-zinc-400 text-left">
                  Item
                </th>
                <th className="px-2 py-3 font-medium text-zinc-400 text-left">
                  Vendor / Location
                </th>
                <SortableHeader
                  label="Price"
                  field="price"
                  sortField={sortField}
                  sortDir={sortDir}
                  align="right"
                  onClick={handleSort}
                />
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((purchase) => (
                <tr
                  key={purchase.id}
                  onClick={() => {
                    setActivePurchase(purchase);
                    editModal.open();
                  }}
                  className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50 border-b border-zinc-50 dark:border-zinc-700 last:border-b-0"
                >
                  <td className="px-2 py-3 text-zinc-100 whitespace-nowrap">
                    {purchase.date}
                  </td>
                  <td className="px-2 py-3">
                    <CategoryBadge
                      label={purchase.category}
                      color={PURCHASE_CATEGORY_COLORS[purchase.category]}
                    />
                  </td>
                  <td className="px-2 py-3 max-w-xs truncate">
                    {purchase.name}
                  </td>
                  <td className="px-2 py-3 text-zinc-400">
                    {[purchase.vendor, purchase.location]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </td>
                  <td className="px-2 py-3 text-right font-semibold text-slate-500 whitespace-nowrap">
                    {purchase.price != null ? formatPrice(purchase.price) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {rows.length > PAGE_SIZE && (
        <div className="flex justify-center mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? "Show less" : `Show all ${rows.length}`}
          </Button>
        </div>
      )}

      {dogPurchases.length > 0 && (
        <div className="mt-8">
          <Heading as="h2" variant="subtitle" className="mb-3">
            Spending Summary
          </Heading>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Total Spent"
              value={formatPrice(stats.totalSpent)}
            />
            <StatCard
              label="Cost / Day"
              value={formatPrice(stats.costPerDay)}
            />
            <StatCard
              label="Cost / Year"
              value={formatPrice(stats.costPerYear)}
            />
          </div>
        </div>
      )}

      <AddDogPurchaseModal
        modalControls={addModal}
        onSave={(data) => {
          onAddPurchase(data);
          addModal.close();
        }}
      />

      {activePurchase && (
        <AddDogPurchaseModal
          key={activePurchase.id}
          modalControls={editModal}
          initialValues={activePurchase}
          onSave={(data) => {
            onUpdatePurchase(activePurchase.id, data);
            editModal.close();
          }}
          onDelete={() => {
            editModal.close();
            confirmDeleteModal.open();
          }}
        />
      )}

      <ConfirmModal
        modalControls={confirmDeleteModal}
        title="Delete Purchase"
        message="Are you sure you want to delete this purchase? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          if (activePurchase) onDeletePurchase(activePurchase.id);
          setActivePurchase(null);
        }}
      />
    </>
  );
}
