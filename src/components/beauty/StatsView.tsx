import { useMemo } from "react";
import { Product } from "../../hooks/useProducts";
import { Transaction } from "../../hooks/useTransactions";
import { Card, Heading, Text } from "@slauyama/ui";
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

function parseDate(dateStr: string | undefined, fallback: string): Date {
  if (dateStr) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(fallback);
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
      const bought = parseDate(t.purchaseDate, t.createdAt);
      const end = t.finishDate ? parseDate(t.finishDate, t.createdAt) : today;
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysOwned = Math.max(
        1,
        Math.floor((end.getTime() - bought.getTime()) / msPerDay),
      );
      return {
        transaction: t,
        product: productsById.get(t.productId),
        price,
        daysOwned,
        costPerDay: price / daysOwned,
      };
    })
    .filter((s): s is TransactionStat => s !== null)
    .sort((a, b) => b.costPerDay - a.costPerDay);
}

function formatCurrency(n: number, fractionDigits = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4 flex flex-col gap-1">
      <Text className="text-zinc-400 uppercase tracking-wide">{label}</Text>
      <span className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
        {value}
      </span>
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
        <Text as="p" size="lg" className="font-medium text-zinc-500">
          No products yet
        </Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Heading as="h2" variant="subtitle">
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
          <Heading as="h3" variant="subtitle" className="text-zinc-600">
            Cost / Day by Purchase
          </Heading>
          <Text size="xs" className="text-zinc-400">
            Amortized over days owned — decreases over time as you get more use
            from each purchase.
          </Text>
          <Card className="overflow-hidden mt-1">
            {stats.map((s, i) => {
              return (
                <div
                  key={s.transaction.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i < stats.length - 1
                      ? "border-b border-zinc-50 dark:border-zinc-700"
                      : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2 mb-1">
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">
                        {s.product?.name ?? "Unknown product"}
                      </span>
                      <span className="text-sm font-semibold text-slate-500 shrink-0">
                        ${formatCurrency(s.costPerDay, 3)}/day
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <Text size="xs" className="text-zinc-400">
                        {s.product?.brand || s.product?.category} · $
                        {formatCurrency(s.price)} · {s.daysOwned}d owned
                      </Text>
                      <Caption className="text-zinc-400">
                        ${formatCurrency(s.costPerDay * 365)}/yr
                      </Caption>
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}
    </div>
  );
}
