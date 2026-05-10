import { Brand, Category, ProductStatus } from "../constants";
import { useFirebaseCollection } from "./useFirebaseCollection";

export interface Product {
  id: string;
  name: string;
  brand: Brand;
  category: Category;
  shade: string;
  size: string;
  price: number | null;
  dateBought: string;
  barcode: string;
  purchasedAt: string;
  notes: string;
  imageUrl: string;
  retailerUrl: string;
  status: ProductStatus;
  createdAt: string;
}

export type ProductInput = Omit<Product, "id" | "status" | "createdAt">;

export function useProducts() {
  const { items: products, loading, add, update, remove } =
    useFirebaseCollection<Product>("products");

  async function addProduct(input: ProductInput): Promise<void> {
    await add({ ...input, status: ProductStatus.Active });
  }

  async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    await update(id, updates);
  }

  async function deleteProduct(id: string): Promise<void> {
    await remove(id);
  }

  async function updateProductStatus(id: string, status: ProductStatus): Promise<void> {
    await update(id, { status });
  }

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
  };
}
