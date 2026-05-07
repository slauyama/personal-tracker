import { useState } from "react";
import { useProducts } from "./hooks/useProducts";
import type { Product } from "./hooks/useProducts";
import { useModal } from "./hooks/useModal";
import AddProductModal from "./components/AddProductModal";
import ImportExportModal from "./components/ImportExportModal";
import ProductModal from "./components/ProductModal";
import ProductCard from "./components/ProductCard";
import StatsView from "./components/StatsView";
import Button from "./components/ui/Button";
import Heading from "./components/ui/Heading";
import Text from "./components/ui/Text";
import Select from "./components/ui/Select";
import { ALL_CATEGORIES, ProductStatus } from "./constants";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  ...ALL_CATEGORIES.map((c) => ({ value: c, label: c })),
];

const STATUS_FILTERS: Array<ProductStatus | "all"> = [
  "all",
  ProductStatus.Active,
  ProductStatus.Finished,
];

export default function App() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    importProducts,
  } = useProducts();

  const [showStats, setShowStats] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const addProductModal = useModal();
  const importExportModal = useModal();
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState("all");

  const activeCount = products.filter(
    (p) => p.status === ProductStatus.Active,
  ).length;

  const filtered = products.filter((p) => {
    const statusOk = statusFilter === "all" || p.status === statusFilter;
    const catOk = categoryFilter === "all" || p.category === categoryFilter;
    return statusOk && catOk;
  });

  // Always pass the freshest copy of the open product to ProductModal
  const liveProduct = activeProduct
    ? (products.find((p) => p.id === activeProduct.id) ?? null)
    : null;

  return (
    <div className="min-h-screen bg-rose-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <Heading as="h1" variant="display" className="text-rose-500">
              Beauty Tracker
            </Heading>
            <Text variant="muted" as="p" className="mt-0.5">
              {activeCount} product{activeCount !== 1 ? "s" : ""} in use
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              active={showStats}
              onClick={() => setShowStats((v) => !v)}
            >
              {showStats ? "← Products" : "Stats"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={importExportModal.open}
            >
              Import / Export
            </Button>
            <Button onClick={addProductModal.open}>+ Add Product</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {showStats && <StatsView products={products} />}

        {!showStats && (
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

              <div className="w-px h-5 bg-gray-200 mx-1" />

              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={CATEGORY_OPTIONS}
              />
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <Text variant="muted" as="p" className="text-5xl mb-3">
                  💄
                </Text>
                <Text
                  variant="body"
                  as="p"
                  className="text-lg font-medium text-gray-500"
                >
                  {products.length === 0
                    ? "No products yet"
                    : "No products match these filters"}
                </Text>
                {products.length === 0 && (
                  <Text variant="muted" as="p" className="mt-1">
                    Hit{" "}
                    <button
                      onClick={addProductModal.open}
                      className="text-rose-400 underline hover:text-rose-500"
                    >
                      + Add Product
                    </button>{" "}
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
                    updateProductStatus={updateProductStatus}
                    onOpen={() => setActiveProduct(product)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <ProductModal
        product={liveProduct}
        onClose={() => setActiveProduct(null)}
        onSave={(data) => {
          if (liveProduct) updateProduct(liveProduct.id, data);
        }}
        onDelete={() => {
          if (liveProduct) {
            deleteProduct(liveProduct.id);
            setActiveProduct(null);
          }
        }}
        updateProductStatus={updateProductStatus}
        categories={ALL_CATEGORIES}
      />

      <AddProductModal
        categories={ALL_CATEGORIES}
        onSave={(data) => {
          addProduct(data);
          addProductModal.close();
        }}
        modalControls={addProductModal}
      />

      <ImportExportModal
        modalControls={importExportModal}
        products={products}
        onImport={(incoming, merge) => importProducts(incoming, merge)}
      />
    </div>
  );
}
