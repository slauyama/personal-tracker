import { Routes, Route } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useTransactions } from "../hooks/useTransactions";
import { ALL_CATEGORIES } from "../constants";
import ProductsView from "../components/beauty/ProductsView";
import ProductDetailView from "../components/beauty/ProductDetailView";
import StatsView from "../components/beauty/StatsView";
import RouteTabs from "../components/ui/RouteTabs";
import { TabDef } from "@slauyama/ui";

const BEAUTY_TABS: TabDef[] = [
  { label: "Products", value: "/beauty", icon: "shopping_bag" },
  { label: "Stats", value: "/beauty/stats", icon: "analytics" },
];

export default function BeautyPage() {
  const { products, loading, addProduct, findProductById } = useProducts();
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    filterTransactionsByProductId,
  } = useTransactions();

  return (
    <div>
      <RouteTabs tabs={BEAUTY_TABS} className="mb-6" />
      <Routes>
        <Route
          index
          element={
            <ProductsView
              products={products}
              transactions={transactions}
              filterTransactionsByProductId={filterTransactionsByProductId}
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
              filterTransactionsByProductId={filterTransactionsByProductId}
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
