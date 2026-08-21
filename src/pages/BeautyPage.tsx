import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useTransactions } from "../hooks/useTransactions";
import { ALL_CATEGORIES } from "../constants";
import ProductsView from "../components/beauty/ProductsView";
import ProductDetailView from "../components/beauty/ProductDetailView";
import StatsView from "../components/beauty/StatsView";
import { Button, Heading, Text } from "@slauyama/ui";

export default function BeautyPage() {
  const { products, loading, addProduct, findProductById } = useProducts();
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    findTransactionsByProductId,
  } = useTransactions();

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const showStats = pathname.includes("/stats");
  const showListHeader = !pathname.includes("/products/");

  return (
    <div>
      {showListHeader && (
        <div className="flex justify-between items-center mb-6">
          <div>
            <Heading as="h1" variant="display">
              Beauty Tracker
            </Heading>
            <Text as="p" className="mt-0.5">
              {products.length} product{products.length !== 1 ? "s" : ""}{" "}
              tracked
            </Text>
          </div>
          <Button
            variant="tonal"
            size="sm"
            onClick={() => navigate(showStats ? "/beauty" : "/beauty/stats")}
          >
            {showStats ? "← Products" : "Stats"}
          </Button>
        </div>
      )}

      <Routes>
        <Route
          index
          element={
            <ProductsView
              products={products}
              transactions={transactions}
              loading={loading}
              onAdd={addProduct}
            />
          }
        />
        <Route
          path="products/:id"
          element={
            <ProductDetailView
              categories={ALL_CATEGORIES}
              loadingProducts={loading}
              findProductById={findProductById}
              findTransactionsByProductId={findTransactionsByProductId}
              onAddTransaction={addTransaction}
              onUpdateTransaction={updateTransaction}
              onDeleteTransaction={deleteTransaction}
            />
          }
        />
        <Route
          path="stats"
          element={
            <StatsView products={products} transactions={transactions} />
          }
        />
      </Routes>
    </div>
  );
}
