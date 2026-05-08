import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useProducts } from "./hooks/useProducts";
import ProductsView from "./components/ProductsView";
import StatsView from "./components/StatsView";
import Button from "./components/ui/Button";
import Heading from "./components/ui/Heading";
import Text from "./components/ui/Text";
import { ProductStatus } from "./constants";

export default function App() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    importProducts,
  } = useProducts();

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const showStats = pathname === "/stats";

  const activeCount = products.filter(
    (p) => p.status === ProductStatus.Active,
  ).length;

  return (
    <div className="min-h-screen bg-rose-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <Heading as="h1" variant="display">
              Beauty Tracker
            </Heading>
            <Text variant="muted" as="p" className="mt-0.5">
              {activeCount} product{activeCount !== 1 ? "s" : ""} in use
            </Text>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(showStats ? "/" : "/stats")}
          >
            {showStats ? "← Products" : "Stats"}
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/stats" element={<StatsView products={products} />} />
          <Route
            path="/"
            element={
              <ProductsView
                products={products}
                onAdd={addProduct}
                onUpdate={updateProduct}
                onDelete={deleteProduct}
                onUpdateStatus={updateProductStatus}
                onImport={importProducts}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}
