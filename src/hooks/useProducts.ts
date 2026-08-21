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
  imageUrl: string;
  retailerUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

export interface ProductLookup {
  item: Product;
  update: (updates: Partial<Product>) => void;
  delete: () => void;
}

export function useProducts() {
  const {
    items: products,
    loading,
    add,
    update,
    remove,
  } = useFirebaseCollection<Product>("products");

  async function addProduct(input: ProductInput): Promise<void> {
    await add({ ...input, updatedAt: new Date().toISOString() });
  }

  async function updateProduct(
    id: string,
    updates: Partial<Product>,
  ): Promise<void> {
    await update(id, { ...updates, updatedAt: new Date().toISOString() });
  }

  async function deleteProduct(id: string): Promise<void> {
    await remove(id);
  }

  function findProductById(id: string | undefined): ProductLookup | undefined {
    const item = products.find((p) => p.id === id);
    if (!item) return undefined;

    return {
      item,
      update: (updates: Partial<Product>) => updateProduct(item.id, updates),
      delete: () => deleteProduct(item.id),
    };
  }

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    findProductById,
  };
}
