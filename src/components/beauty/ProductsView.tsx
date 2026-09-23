import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ALL_CATEGORIES } from "../../constants";
import type { Product, ProductInput } from "../../hooks/useProducts";
import type { Transaction } from "../../hooks/useTransactions";
import { effectiveUpdatedAt } from "../../lib/transactionStats";
import { Button, SearchBar, Select, Text, useIsOpen } from "@slauyama/ui";
import AddProductModal from "./AddProductModal";
import ListStateContainer from "../ui/ListStateContainer";
import ProductCard from "./ProductCard";
import { AnimatePresence } from "framer-motion";
import { useBreakpoints } from "@slauyama/hooks";

interface ProductsViewProps {
  products: Product[];
  transactions: Transaction[];
  filterTransactionsByProductId: (productId: string) => Transaction[];
  loading: boolean;
  onAdd: (data: ProductInput) => void;
}

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  ...ALL_CATEGORIES.map((c) => ({ value: c, label: c })),
];

type SortField = "name" | "brand" | "updatedAt";
type SortDir = "asc" | "desc";
type SortValue = `${SortField}-${SortDir}`;

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "updatedAt-desc", label: "Date Updated (Newest)" },
  { value: "updatedAt-asc", label: "Date Updated (Oldest)" },
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "brand-asc", label: "Brand (A–Z)" },
  { value: "brand-desc", label: "Brand (Z–A)" },
];

function sortProducts(
  products: Product[],
  field: SortField,
  dir: SortDir,
  filterTransactionsByProductId: (productId: string) => Transaction[],
): Product[] {
  return [...products].sort((a, b) => {
    let cmp = 0;
    const aValue =
      field === "updatedAt"
        ? effectiveUpdatedAt(a, filterTransactionsByProductId(a.id))
        : a[field];
    const bValue =
      field === "updatedAt"
        ? effectiveUpdatedAt(b, filterTransactionsByProductId(b.id))
        : b[field];
    if (!aValue && !bValue) cmp = 0;
    else if (!aValue) cmp = 1;
    else if (!bValue) cmp = -1;
    else if (aValue < bValue) cmp = -1;
    else if (aValue > bValue) cmp = 1;
    return dir === "asc" ? cmp : -cmp;
  });
}

export default function ProductsView({
  products,
  transactions,
  filterTransactionsByProductId,
  loading,
  onAdd,
}: ProductsViewProps) {
  const navigate = useNavigate();
  const addProductModal = useIsOpen();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortValue, setSortValue] = useState<SortValue>("updatedAt-desc");
  const [sortField, sortDir] = sortValue.split("-") as [SortField, SortDir];
  const { isSmall } = useBreakpoints();

  const query = search.trim().toLowerCase();

  const filtered = sortProducts(
    products.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter)
        return false;
      if (!query) return true;
      return [p.name, p.brand, p.shade]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(query));
    }),
    sortField,
    sortDir,
    filterTransactionsByProductId,
  );

  function downloadJSON() {
    const blob = new Blob(
      [JSON.stringify({ products, transactions }, null, 2)],
      {
        type: "application/json",
      },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `beauty-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button
          variant="text"
          onClick={() => navigate("/beauty/stats")}
          trailingIcon="arrow_forward"
        >
          Stats
        </Button>
      </div>
      <div className="flex justify-between mb-6">
        <div className="flex gap-4">
          <Select
            label="Categories"
            value={categoryFilter}
            onChange={(value) => setCategoryFilter(value)}
            options={CATEGORY_OPTIONS}
          />
          <Select
            label="Sort"
            value={sortValue}
            onChange={(value) => setSortValue(value as SortValue)}
            options={SORT_OPTIONS}
          />
        </div>
        <div className="flex gap-4">
          <div className="hidden  sm:inline-flex">
            <Button variant="text" onClick={downloadJSON} icon="file_export">
              Export
            </Button>
          </div>
          <Button variant="filled" onClick={addProductModal.open} icon="add">
            {isSmall ? "Add" : "Add Product"}
          </Button>
        </div>
      </div>
      <ListStateContainer
        isLoading={loading}
        isEmpty={products.length === 0}
        hasNoMatches={filtered.length === 0}
        emptyContent={
          <>
            <Text as="p" className="text-5xl mb-3">
              💄
            </Text>
            <Text as="p" className="text-lg font-medium text-zinc-500">
              No products yet
            </Text>
            <Text as="p" className="mt-1">
              Hit{" "}
              <Button variant="text" onClick={addProductModal.open} icon="add">
                Add Product
              </Button>{" "}
              to get started!
            </Text>
          </>
        }
        noMatchContent={
          <Text as="p" className="text-lg font-medium text-zinc-500">
            No products match your search
          </Text>
        }
      >
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 items-start">
          <AnimatePresence>
            {filtered.map((product, index, products) => (
              <ProductCard
                key={product.id}
                index={index}
                totalProducts={products.length}
                product={product}
                onClick={() => navigate(`/beauty/products/${product.id}`)}
              />
            ))}
          </AnimatePresence>
        </div>
      </ListStateContainer>

      <AddProductModal
        categories={ALL_CATEGORIES}
        onSave={(data) => {
          onAdd(data);
          addProductModal.close();
        }}
        modalControls={addProductModal}
      />
    </>
  );
}
