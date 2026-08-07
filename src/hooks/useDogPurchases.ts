import { DogPurchaseCategory } from "../constants";
import { useFirebaseCollection } from "./useFirebaseCollection";

export interface DogPurchase {
  id: string;
  date: string;
  category: DogPurchaseCategory;
  name: string;
  notes: string;
  vendor: string;
  location: string;
  barcode?: string;
  price: number | null;
  retailerUrl?: string;
  quantity?: number;
  createdAt: string;
}

export type DogPurchaseInput = Omit<DogPurchase, "id" | "createdAt">;

export function useDogPurchases() {
  const {
    items: dogPurchases,
    loading,
    add,
    update,
    remove,
  } = useFirebaseCollection<DogPurchase>("dogPurchases");

  async function addPurchase(input: DogPurchaseInput): Promise<void> {
    await add(input);
  }

  async function updatePurchase(
    id: string,
    updates: Partial<DogPurchase>,
  ): Promise<void> {
    await update(id, updates);
  }

  async function deletePurchase(id: string): Promise<void> {
    await remove(id);
  }

  return {
    dogPurchases,
    loading,
    addPurchase,
    updatePurchase,
    deletePurchase,
  };
}
