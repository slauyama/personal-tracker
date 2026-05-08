import { useMemo } from "react";
import { Product } from "../../hooks/useProducts";
import { Card, Heading, Text } from "../ui/UI";

interface StatsViewProps {
  products: Product[];
}

interface ProductStat {
  product: Product;
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

function buildStats(products: Product[], today: Date): ProductStat[] {
  return products
    .map((p) => {
      const price = p.price;
      if (price == null || price <= 0) return null;
      const bought = parseDate(p.dateBought, p.createdAt);
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysOwned = Math.max(
        1,
        Math.floor((today.getTime() - bought.getTime()) / msPerDay),
      );
      return { product: p, price, daysOwned, costPerDay: price / daysOwned };
    })
    .filter((s): s is ProductStat => s !== null)
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
      <Text variant="caption" className="text-zinc-400 uppercase tracking-wide">
        {label}
      </Text>
      <span className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
        {value}
      </span>
    </Card>
  );
}

export default function StatsView({ products }: StatsViewProps) {
  const today = useMemo(() => new Date(), []);
  const stats = useMemo(() => buildStats(products, today), [products, today]);

  const totalSpent = stats.reduce((sum, s) => sum + s.price, 0);
  const largestDaysOwned = stats.reduce(
    (largestDaysOwned, s) => Math.max(largestDaysOwned, s.daysOwned),
    0,
  );
  const totalCostPerDay = totalSpent / largestDaysOwned;
  const totalCostPerYear = totalCostPerDay * 365;
  const pricedCount = stats.length;
  const unpricedCount = products.filter(
    (p) => p.price == null || p.price <= 0,
  ).length;

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <Text variant="muted" as="p" className="text-5xl mb-3">
          💄
        </Text>
        <Text
          variant="body"
          as="p"
          className="text-lg font-medium text-zinc-500"
        >
          No products yet
        </Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Heading as="h2" variant="subtitle" className="text-zinc-600">
        Spending Summary
      </Heading>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        <Text variant="caption" className="text-zinc-400">
          {unpricedCount} product{unpricedCount !== 1 ? "s" : ""} without a
          price are excluded from calculations.
        </Text>
      )}

      {pricedCount > 0 && (
        <div className="flex flex-col gap-2">
          <Heading as="h3" variant="subtitle" className="text-zinc-600">
            Cost / Day by Product
          </Heading>
          <Text variant="caption" className="text-zinc-400 -mt-1">
            Amortized over days owned — decreases over time as you get more use
            from each product.
          </Text>
          <Card className="overflow-hidden mt-1">
            {stats.map((s, i) => {
              return (
                <div
                  key={s.product.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i < stats.length - 1
                      ? "border-b border-zinc-50 dark:border-zinc-700"
                      : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2 mb-1">
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">
                        {s.product.name}
                      </span>
                      <span className="text-sm font-semibold text-slate-500 shrink-0">
                        ${formatCurrency(s.costPerDay, 3)}/day
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <Text variant="caption" className="text-zinc-400">
                        {s.product.brand || s.product.category} · $
                        {formatCurrency(s.price)} · {s.daysOwned}d owned
                      </Text>
                      <Text variant="caption" className="text-zinc-400">
                        ${formatCurrency(s.costPerDay * 365)}/yr
                      </Text>
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
