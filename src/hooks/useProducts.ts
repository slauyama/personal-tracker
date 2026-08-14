import { Brand, Category } from "../constants";
import { useFirebaseCollection } from "./useFirebaseCollection";

export interface Product {
  id: string;
  name: string;
  brand: Brand;
  category: Category;
  shade: string;
  size: string;
  barcode: string;
  notes: string;
  imageUrl: string;
  retailerUrl: string;
  createdAt: string;
}

export type ProductInput = Omit<Product, "id" | "createdAt">;

export function useProducts() {
  const { items: products, loading, add, update, remove } =
    useFirebaseCollection<Product>("products");

  async function addProduct(input: ProductInput): Promise<void> {
    await add(input);
  }

  async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    await update(id, updates);
  }

  async function deleteProduct(id: string): Promise<void> {
    await remove(id);
  }

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}
