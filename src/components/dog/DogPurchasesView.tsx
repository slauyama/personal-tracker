import { useState } from "react";
import {
  Button,
  Card,
  Heading,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  useIsOpen,
  useTableSort,
} from "@slauyama/ui";
import type {
  DogPurchase,
  DogPurchaseInput,
} from "../../hooks/useDogPurchases";
import AddDogPurchaseModal from "./AddDogPurchaseModal";
import ConfirmModal from "../ui/ConfirmModal";
import CategoryBadge from "./CategoryBadge";
import { PURCHASE_CATEGORY_COLORS } from "./categoryColors";
import { useBreakpoints } from "../../hooks/useBreakpoints";

interface DogPurchasesViewProps {
  dogPurchases: DogPurchase[];
  onAddPurchase: (data: DogPurchaseInput) => void;
  onUpdatePurchase: (id: string, data: DogPurchaseInput) => void;
  onDeletePurchase: (id: string) => void;
}

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

export default function DogPurchasesView({
  dogPurchases,
  onAddPurchase,
  onUpdatePurchase,
  onDeletePurchase,
}: DogPurchasesViewProps) {
  const addModal = useIsOpen();
  const editModal = useIsOpen();
  const confirmDeleteModal = useIsOpen();
  const { isSmall } = useBreakpoints();

  const [activePurchase, setActivePurchase] = useState<DogPurchase | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const filtered = dogPurchases.filter((p) => matchesQuery(p, query));
  const {
    sortedTableRows: rows,
    sortField,
    sortDirection,
    toggleSort,
  } = useTableSort(filtered, "date", {
    initialDirection: "desc",
  });
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
          placeholder="Search"
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  onSort={() => toggleSort("date")}
                  sortDirection={
                    sortField === "date" ? sortDirection : undefined
                  }
                >
                  Date
                </TableHead>
                <TableHead
                  onSort={() => toggleSort("category")}
                  sortDirection={
                    sortField === "category" ? sortDirection : undefined
                  }
                >
                  Category
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>
                  {isSmall ? "Vendor" : "Vendor / Location"}
                </TableHead>
                <TableHead
                  align="right"
                  onSort={() => toggleSort("price")}
                  sortDirection={
                    sortField === "price" ? sortDirection : undefined
                  }
                >
                  Price
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.map((purchase) => (
                <TableRow
                  key={purchase.id}
                  onClick={() => {
                    setActivePurchase(purchase);
                    editModal.open();
                  }}
                >
                  <TableCell className="whitespace-nowrap">
                    {purchase.date}
                  </TableCell>
                  <TableCell className="text-center">
                    <CategoryBadge
                      label={purchase.category}
                      color={PURCHASE_CATEGORY_COLORS[purchase.category]}
                    />
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {purchase.name}
                  </TableCell>
                  <TableCell className="truncate">
                    {isSmall
                      ? purchase.vendor
                      : [purchase.vendor, purchase.location]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                  </TableCell>
                  <TableCell align="right" className="whitespace-nowrap">
                    {purchase.price != null ? formatPrice(purchase.price) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {rows.length > PAGE_SIZE && (
        <div className="flex justify-center mt-3">
          <Button
            variant="outlined"
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
            Cost Summary
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
