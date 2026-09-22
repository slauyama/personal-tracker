import { useMemo } from "react";
import { Product } from "../../hooks/useProducts";
import { Transaction } from "../../hooks/useTransactions";
import { daysOwned, formatCurrency } from "../../lib/transactionStats";
import { Card, Heading, List, Text } from "@slauyama/ui";
import Caption from "../ui/Caption";

interface StatsViewProps {
  products: Product[];
  transactions: Transaction[];
}

interface TransactionStat {
  transaction: Transaction;
  product: Product | undefined;
  price: number;
  daysOwned: number;
  costPerDay: number;
}

function buildStats(
  transactions: Transaction[],
  productsById: Map<string, Product>,
  today: Date,
): TransactionStat[] {
  return transactions
    .map((t) => {
      const price = t.price;
      if (price == null || price <= 0) return null;
      const days = daysOwned(t, today);
      return {
        transaction: t,
        product: productsById.get(t.productId),
        price,
        daysOwned: days,
        costPerDay: price / days,
      };
    })
    .filter((s): s is TransactionStat => s !== null)
    .sort((a, b) => b.costPerDay - a.costPerDay);
}

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="filled" className="p-4 flex flex-col gap-2">
      <Text variant="title-small" className="uppercase tracking-wide">
        {label}
      </Text>
      <Text variant="title-medium" className="text-2xl font-bold">
        {value}
      </Text>
    </Card>
  );
}

export default function StatsView({ products, transactions }: StatsViewProps) {
  const today = useMemo(() => new Date(), []);
  const productsById = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );
  const stats = useMemo(
    () => buildStats(transactions, productsById, today),
    [transactions, productsById, today],
  );

  const totalSpent = stats.reduce((sum, s) => sum + s.price, 0);
  const largestDaysOwned = stats.reduce(
    (largestDaysOwned, s) => Math.max(largestDaysOwned, s.daysOwned),
    0,
  );
  const totalCostPerDay = totalSpent / largestDaysOwned;
  const totalCostPerYear = totalCostPerDay * 365;
  const pricedCount = stats.length;
  const unpricedCount = transactions.filter(
    (t) => t.price == null || t.price <= 0,
  ).length;

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <Text as="p" className="text-5xl mb-3">
          💄
        </Text>
        <Text as="p" variant="body-large">
          No products yet
        </Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Heading as="h2" variant="title-large">
        Spending Summary
      </Heading>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <StatCard
          label="Total Spent"
          value={`$${formatCurrency(totalSpent)}`}
        />
        <StatCard
          label="Cost / Day"
          value={`$${formatCurrency(totalCostPerDay)}`}
        />
        <StatCard
          label="Cost / Year"
          value={`$${formatCurrency(totalCostPerYear)}`}
        />
      </div>

      {unpricedCount > 0 && (
        <Caption className="text-zinc-400">
          {unpricedCount} purchase{unpricedCount !== 1 ? "s" : ""} without a
          price are excluded from calculations.
        </Caption>
      )}

      {pricedCount > 0 && (
        <div className="flex flex-col gap-2">
          <Heading as="h3" variant="title-large">
            Cost / Day by Purchase
          </Heading>
          <Text variant="body-small">
            Amortized over days owned — decreases over time as you get more use
            from each purchase.
          </Text>
          <Card variant="filled" className="overflow-hidden mt-1">
            <List>
              {stats.map((s) => {
                const supportingText = `${s.product?.brand || s.product?.category} · $
                          ${formatCurrency(s.price)} · ${s.daysOwned}d owned`;
                return (
                  <List.Item
                    key={s.transaction.id}
                    headline={s.product?.name ?? "Unknown product"}
                    supportingText={supportingText}
                    trailingText={`$${formatCurrency(s.costPerDay, 3)}/day - $${formatCurrency(s.costPerDay * 365)}/yr`}
                  />
                );
              })}
            </List>
          </Card>
        </div>
      )}
    </div>
  );
}
