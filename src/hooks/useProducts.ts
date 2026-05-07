import { useState, useEffect } from "react";
import { Brand, Category, ProductStatus } from "../constants";

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

const STORAGE_KEY = "makeup-tracker-products";

function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(loadProducts);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  function addProduct(input: ProductInput): Product {
    const product: Product = {
      ...input,
      id: crypto.randomUUID(),
      status: ProductStatus.Active,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [product, ...prev]);
    return product;
  }

  function updateProduct(id: string, updates: Partial<Product>): void {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
  }

  function deleteProduct(id: string): void {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function updateProductStatus(id: string, status: ProductStatus): void {
    updateProduct(id, { status });
  }

  function importProducts(incoming: Product[], merge: boolean): void {
    setProducts((prev) => {
      if (!merge) return incoming;
      const existingIds = new Set(prev.map((p) => p.id));
      const newOnes = incoming.filter((p) => !existingIds.has(p.id));
      return [...prev, ...newOnes];
    });
  }

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    importProducts,
  };
}
