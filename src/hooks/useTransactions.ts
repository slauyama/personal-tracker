import { useFirebaseCollection } from "./useFirebaseCollection";

export interface Transaction {
  id: string;
  productId: string;
  purchaseDate: string;
  price: number | null;
  location: string;
  finishDate: string;
  createdAt: string;
}

export type TransactionInput = Omit<Transaction, "id" | "createdAt">;

export function useTransactions() {
  const { items: transactions, loading, add, update, remove } =
    useFirebaseCollection<Transaction>("transactions");

  async function addTransaction(input: TransactionInput): Promise<void> {
    await add(input);
  }

  async function updateTransaction(
    id: string,
    updates: Partial<Transaction>,
  ): Promise<void> {
    await update(id, updates);
  }

  async function deleteTransaction(id: string): Promise<void> {
    await remove(id);
  }

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
