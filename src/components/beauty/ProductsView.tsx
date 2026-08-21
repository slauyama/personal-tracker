import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ALL_CATEGORIES } from "../../constants";
import type { Product, ProductInput } from "../../hooks/useProducts";
import type { Transaction } from "../../hooks/useTransactions";
import { Button, IconButton, Input, Select, Text, useIsOpen } from "@slauyama/ui";
import AddProductModal from "./AddProductModal";
import ProductCard from "./ProductCard";
import { AnimatePresence } from "framer-motion";

interface ProductsViewProps {
  products: Product[];
  transactions: Transaction[];
  onAdd: (data: ProductInput) => void;
}

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  ...ALL_CATEGORIES.map((c) => ({ value: c, label: c })),
];

type SortField = "name" | "brand" | "createdAt";
type SortDir = "asc" | "desc";

const SORT_OPTIONS = [
  { value: "createdAt", label: "Date Added" },
  { value: "name", label: "Name" },
  { value: "brand", label: "Brand" },
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
  onAdd,
}: ProductsViewProps) {
  const navigate = useNavigate();
  const addProductModal = useIsOpen();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

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
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <Input
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="w-px h-16 bg-zinc-200 dark:bg-zinc-700 mx-1" />

        <Select
          label="Categories"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={CATEGORY_OPTIONS}
        />

        <div className="w-px h-16 bg-zinc-200 dark:bg-zinc-700 mx-1" />

        <Select
          label="Sort"
          value={sortField}
          onChange={(e) => setSortField(e.target.value as SortField)}
          options={SORT_OPTIONS}
        />
        <IconButton
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          title={sortDir === "asc" ? "Ascending" : "Descending"}
        >
          <span
            className={`transition-all duration-400 ${
              sortDir !== "asc" ? "rotate-180 " : "rotate-0"
            }`}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="6" x2="12" y2="19" />
              <polyline points="18 12 12 5 6 12" />
            </svg>
          </span>
        </IconButton>

        <div className="flex-1" />

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

      {filtered.length === 0 ? (
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
