import { useState, useEffect, useRef } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { Brand, Category, ProductStatus } from "../constants";

const LOCAL_STORAGE_KEY = "makeup-tracker-products";
const PRODUCTS_REF = () => collection(db, "products");

async function migrateFromLocalStorage(existingProducts: Product[]) {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return;
  try {
    const local = JSON.parse(raw) as Product[];
    const existingIds = new Set(existingProducts.map((p) => p.id));
    const toMigrate = local.filter((p) => !existingIds.has(p.id));
    if (toMigrate.length > 0) {
      const batch = writeBatch(db);
      toMigrate.forEach(({ id, ...data }) => {
        batch.set(doc(PRODUCTS_REF(), id), data);
      });
      await batch.commit();
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // don't wipe localStorage if something goes wrong
  }
}

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
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const migrated = useRef(false);

  useEffect(() => {
    if (!user) {
      setProducts([]);
      setLoading(false);
      return;
    }

    migrated.current = false;

    const q = query(PRODUCTS_REF(), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Product[];
      setProducts(docs);
      setLoading(false);

      if (!migrated.current) {
        migrated.current = true;
        migrateFromLocalStorage(docs);
      }
    });

    return unsubscribe;
  }, [user]);

  async function addProduct(input: ProductInput): Promise<void> {
    if (!user) return;
    await addDoc(PRODUCTS_REF(), {
      ...input,
      status: ProductStatus.Active,
      createdAt: new Date().toISOString(),
    });
  }

  async function updateProduct(
    id: string,
    updates: Partial<Product>,
  ): Promise<void> {
    if (!user) return;
    await updateDoc(doc(PRODUCTS_REF(), id), updates);
  }

  async function deleteProduct(id: string): Promise<void> {
    if (!user) return;
    await deleteDoc(doc(PRODUCTS_REF(), id));
  }

  async function updateProductStatus(
    id: string,
    status: ProductStatus,
  ): Promise<void> {
    await updateProduct(id, { status });
  }

  async function importProducts(
    incoming: Product[],
    merge: boolean,
  ): Promise<void> {
    if (!user) return;
    const batch = writeBatch(db);

    if (!merge) {
      products.forEach((p) => {
        batch.delete(doc(PRODUCTS_REF(), p.id));
      });
    }

    const existingIds = new Set(products.map((p) => p.id));
    incoming.forEach((p) => {
      if (!merge || !existingIds.has(p.id)) {
        const { id, ...data } = p;
        batch.set(doc(PRODUCTS_REF(), id), data);
      }
    });

    await batch.commit();
  }

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    importProducts,
  };
}
