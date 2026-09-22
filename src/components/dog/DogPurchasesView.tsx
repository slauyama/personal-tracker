import { useState } from "react";
import {
  Button,
  Card,
  Heading,
  SearchBar,
  Table,
  Text,
  useIsOpen,
  useTableSort,
} from "@slauyama/ui";
import { useBreakpoints } from "@slauyama/hooks";
import type {
  DogPurchase,
  DogPurchaseInput,
} from "../../hooks/useDogPurchases";
import AddDogPurchaseModal from "./AddDogPurchaseModal";
import ConfirmModal from "../ui/ConfirmModal";
import ListStateContainer from "../ui/ListStateContainer";
import CategoryBadge from "./CategoryBadge";
import { PURCHASE_CATEGORY_COLORS } from "./categoryColors";

interface DogPurchasesViewProps {
  dogPurchases: DogPurchase[];
  loading: boolean;
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
  loading,
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
        <SearchBar value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="flex-1" />
        <Button onClick={addModal.open}>+ Add Purchase</Button>
      </div>

      <ListStateContainer
        isLoading={loading}
        isEmpty={dogPurchases.length === 0}
        hasNoMatches={rows.length === 0}
        emptyContent={
          <>
            <Text as="p" className="text-5xl mb-3">
              🐾
            </Text>
            <Text as="p" variant="body-large">
              No purchases yet
            </Text>
          </>
        }
        noMatchContent={
          <Text as="p" variant="body-large">
            No purchases match your search
          </Text>
        }
      >
        <Card className="overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head
                  onSort={() => toggleSort("date")}
                  sortDirection={
                    sortField === "date" ? sortDirection : undefined
                  }
                >
                  Date
                </Table.Head>
                <Table.Head
                  onSort={() => toggleSort("category")}
                  sortDirection={
                    sortField === "category" ? sortDirection : undefined
                  }
                >
                  Category
                </Table.Head>
                <Table.Head>Name</Table.Head>
                <Table.Head>
                  {isSmall ? "Vendor" : "Vendor / Location"}
                </Table.Head>
                <Table.Head
                  align="right"
                  onSort={() => toggleSort("price")}
                  sortDirection={
                    sortField === "price" ? sortDirection : undefined
                  }
                >
                  Price
                </Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {visibleRows.map((purchase) => (
                <Table.Row
                  key={purchase.id}
                  onClick={() => {
                    setActivePurchase(purchase);
                    editModal.open();
                  }}
                >
                  <Table.Cell className="whitespace-nowrap">
                    {purchase.date}
                  </Table.Cell>
                  <Table.Cell>
                    <CategoryBadge
                      label={purchase.category}
                      color={PURCHASE_CATEGORY_COLORS[purchase.category]}
                    />
                  </Table.Cell>
                  <Table.Cell className="max-w-xs truncate">
                    {purchase.name}
                  </Table.Cell>
                  <Table.Cell className="truncate">
                    {isSmall
                      ? purchase.vendor
                      : [purchase.vendor, purchase.location]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                  </Table.Cell>
                  <Table.Cell align="right" className="whitespace-nowrap">
                    {purchase.price != null ? formatPrice(purchase.price) : "—"}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      </ListStateContainer>

      {rows.length > PAGE_SIZE && (
        <div className="flex justify-center mt-3">
          <Button variant="outlined" onClick={() => setExpanded((e) => !e)}>
            {expanded ? "Show less" : `Show all ${rows.length}`}
          </Button>
        </div>
      )}

      {dogPurchases.length > 0 && (
        <div className="mt-8">
          <Heading as="h2" variant="title-large" className="mb-3">
            Cost Summary
          </Heading>
          <div className="grid grid-cols-3 gap-2 md:gap-4">
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
