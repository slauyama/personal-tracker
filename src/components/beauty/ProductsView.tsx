import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ALL_CATEGORIES } from "../../constants";
import type { Product, ProductInput } from "../../hooks/useProducts";
import type { Transaction } from "../../hooks/useTransactions";
import { Button, Input, Select, Spinner, Text, useIsOpen } from "@slauyama/ui";
import AddProductModal from "./AddProductModal";
import ProductCard from "./ProductCard";
import { AnimatePresence } from "framer-motion";

interface ProductsViewProps {
  products: Product[];
  transactions: Transaction[];
  loading: boolean;
  onAdd: (data: ProductInput) => void;
}

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  ...ALL_CATEGORIES.map((c) => ({ value: c, label: c })),
];

type SortField = "name" | "brand";
type SortDir = "asc" | "desc";
type SortValue = `${SortField}-${SortDir}`;

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "brand-asc", label: "Brand (A–Z)" },
  { value: "brand-desc", label: "Brand (Z–A)" },
];

function sortProducts(
  products: Product[],
  field: SortField,
  dir: SortDir,
): Product[] {
  return [...products].sort((a, b) => {
    let cmp = 0;
    const aValue = a[field];
    const bValue = b[field];
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
  loading,
  onAdd,
}: ProductsViewProps) {
  const navigate = useNavigate();
  const addProductModal = useIsOpen();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortValue, setSortValue] = useState<SortValue>("name-asc");
  const [sortField, sortDir] = sortValue.split("-") as [SortField, SortDir];

  const query = search.trim().toLowerCase();

  const filtered = sortProducts(
    products.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (!query) return true;
      return [p.name, p.brand, p.shade]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(query));
    }),
    sortField,
    sortDir,
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
      <div className="flex flex-col sm:flex-row gap-2 mb-6 sm:items-center">
        <Input
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="hidden sm:block w-px h-16 bg-zinc-200 dark:bg-zinc-700 mx-1" />

        <Select
          label="Categories"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={CATEGORY_OPTIONS}
        />

        <div className="hidden sm:block w-px h-16 bg-zinc-200 dark:bg-zinc-700 mx-1" />

        <Select
          label="Sort"
          value={sortValue}
          onChange={(e) => setSortValue(e.target.value as SortValue)}
          options={SORT_OPTIONS}
        />

        <div className="hidden sm:block flex-1" />

        <div className="flex gap-2">
          <div className="hidden sm:inline-flex">
            <Button variant="tonal" onClick={downloadJSON}>
              Export
            </Button>
          </div>
          <Button variant="filled" onClick={addProductModal.open}>
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">Add Product</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Text as="p" className="text-5xl mb-3">
            💄
          </Text>
          <Text as="p" className="text-lg font-medium text-zinc-500">
            {products.length === 0
              ? "No products yet"
              : "No products match your search"}
          </Text>
          {products.length === 0 && (
            <Text as="p" className="mt-1">
              Hit{" "}
              <Button variant="text" onClick={addProductModal.open}>
                + Add Product
              </Button>{" "}
              to get started!
            </Text>
          )}
        </div>
      ) : (
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
      )}

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
