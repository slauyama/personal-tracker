import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import ProductsView from "../components/beauty/ProductsView";
import StatsView from "../components/beauty/StatsView";
import { Button, Heading, Text } from "@slauyama/ui";
import { ProductStatus } from "../constants";

export default function BeautyPage() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
  } = useProducts();

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const showStats = pathname.includes("/stats");

  const activeCount = products.filter(
    (p) => p.status === ProductStatus.Active,
  ).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
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
          onClick={() => navigate(showStats ? "/beauty" : "/beauty/stats")}
        >
          {showStats ? "← Products" : "Stats"}
        </Button>
      </div>

      <Routes>
        <Route
          index
          element={
            <ProductsView
              products={products}
              onAdd={addProduct}
              onUpdate={updateProduct}
              onDelete={deleteProduct}
              onUpdateStatus={updateProductStatus}
            />
          }
        />
        <Route path="stats" element={<StatsView products={products} />} />
      </Routes>
    </div>
  );
}
