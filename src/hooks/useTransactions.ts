import { useFirebaseCollection } from "./useFirebaseCollection";

export interface Transaction {
  id: string;
  productId: string;
  purchaseDate: string;
  price: number | null;
  location: string;
  finishDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionInput = Omit<
  Transaction,
  "id" | "createdAt" | "updatedAt"
>;

export function useTransactions() {
  const {
    items: transactions,
    loading,
    add,
    update,
    remove,
  } = useFirebaseCollection<Transaction>("transactions");

  async function addTransaction(input: TransactionInput): Promise<void> {
    await add({ ...input, updatedAt: new Date().toISOString() });
  }

  async function updateTransaction(
    id: string,
    updates: Partial<Transaction>,
  ): Promise<void> {
    await update(id, { ...updates, updatedAt: new Date().toISOString() });
  }

  async function deleteTransaction(id: string): Promise<void> {
    await remove(id);
  }

  function filterTransactionsByProductId(productId: string): Transaction[] {
    return transactions.filter((t) => t.productId === productId);
  }

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    filterTransactionsByProductId,
  };
}
