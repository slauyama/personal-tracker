import type { Transaction } from "../hooks/useTransactions";

function parseDate(dateStr: string | undefined, fallback: string): Date {
  if (dateStr) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(fallback);
}

export function daysOwned(transaction: Transaction, today: Date): number {
  const bought = parseDate(transaction.purchaseDate, transaction.createdAt);
  const end = transaction.finishDate
    ? parseDate(transaction.finishDate, transaction.createdAt)
    : today;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.max(1, Math.floor((end.getTime() - bought.getTime()) / msPerDay));
}

export function formatCurrency(n: number, fractionDigits = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}
