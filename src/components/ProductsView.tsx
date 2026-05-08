import { useState } from "react";
import { ProductStatus, ALL_CATEGORIES } from "../constants";
import type { Product, ProductInput } from "../hooks/useProducts";
import { useModal } from "../hooks/useModal";
import AddProductModal from "./AddProductModal";
import ImportExportModal from "./ImportExportModal";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";
import Button from "./ui/Button";
import IconButton from "./ui/IconButton";
import Select from "./ui/Select";
import Text from "./ui/Text";

interface ProductsViewProps {
  products: Product[];
  onAdd: (data: ProductInput) => void;
  onUpdate: (id: string, data: ProductInput) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: ProductStatus) => void;
  onImport: (products: Product[], merge: boolean) => void;
}

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  ...ALL_CATEGORIES.map((c) => ({ value: c, label: c })),
];

const STATUS_FILTERS: Array<ProductStatus | "all"> = [
  "all",
  ProductStatus.Active,
  ProductStatus.Finished,
];

type SortField = "dateBought" | "price" | "createdAt";
type SortDir = "asc" | "desc";

const SORT_OPTIONS = [
  { value: "dateBought", label: "Date Bought" },
  { value: "brand", label: "Brand" },
  { value: "price", label: "Cost" },
];

function sortProducts(
  products: Product[],
  field: SortField,
  dir: SortDir,
): Product[] {
  return [...products].sort((a, b) => {
    let cmp = 0;
    if (field === "price") {
      if (a.price == null && b.price == null) cmp = 0;
      else if (a.price == null) return 1;
      else if (b.price == null) return -1;
      else cmp = a.price - b.price;
    } else {
      const av = a[field];
      const bv = b[field];
      if (!av && !bv) cmp = 0;
      else if (!av) return 1;
      else if (!bv) return -1;
      else cmp = av < bv ? -1 : av > bv ? 1 : 0;
    }
    return dir === "asc" ? cmp : -cmp;
  });
}

export default function ProductsView({
  products,
  onAdd,
  onUpdate,
  onDelete,
  onUpdateStatus,
  onImport,
}: ProductsViewProps) {
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const addProductModal = useModal();
  const importExportModal = useModal();
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const liveProduct = activeProduct
    ? (products.find((p) => p.id === activeProduct.id) ?? null)
    : null;

  const filtered = sortProducts(
    products.filter((p) => {
      const statusOk = statusFilter === "all" || p.status === statusFilter;
      const catOk = categoryFilter === "all" || p.category === categoryFilter;
      return statusOk && catOk;
    }),
    sortField,
    sortDir,
  );

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f}
            variant="pill"
            active={statusFilter === f}
            onClick={() => setStatusFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}

        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />

        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={CATEGORY_OPTIONS}
        />

        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />

        <Text>Sort</Text>
        <Select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as SortField)}
          options={SORT_OPTIONS}
        />
        <IconButton
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          title={sortDir === "asc" ? "Ascending" : "Descending"}
        >
          <span
            className={`transition-all ${
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

        <Button
          variant="secondary"
          size="sm"
          onClick={importExportModal.open}
          className="hidden sm:inline-flex"
        >
          Import / Export
        </Button>
        <Button onClick={addProductModal.open}>
          <span className="sm:hidden">+ Add</span>
          <span className="hidden sm:inline">+ Add Product</span>
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Text variant="muted" as="p" className="text-5xl mb-3">
            💄
          </Text>
          <Text
            variant="body"
            as="p"
            className="text-lg font-medium text-zinc-500"
          >
            {products.length === 0
              ? "No products yet"
              : "No products match these filters"}
          </Text>
          {products.length === 0 && (
            <Text variant="muted" as="p" className="mt-1">
              Hit{" "}
              <Button variant="inline" onClick={addProductModal.open}>
                + Add Product
              </Button>{" "}
              to get started!
            </Text>
          )}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 items-start">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpen={() => setActiveProduct(product)}
            />
          ))}
        </div>
      )}

      <ProductModal
        product={liveProduct}
        onClose={() => setActiveProduct(null)}
        onSave={(data) => {
          if (liveProduct) onUpdate(liveProduct.id, data);
        }}
        onDelete={() => {
          if (liveProduct) {
            onDelete(liveProduct.id);
            setActiveProduct(null);
          }
        }}
        updateProductStatus={onUpdateStatus}
        categories={ALL_CATEGORIES}
      />

      <AddProductModal
        categories={ALL_CATEGORIES}
        onSave={(data) => {
          onAdd(data);
          addProductModal.close();
        }}
        modalControls={addProductModal}
      />

      <ImportExportModal
        modalControls={importExportModal}
        products={products}
        onImport={onImport}
      />
    </>
  );
}
