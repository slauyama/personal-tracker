import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./useAuth";

export interface FirebaseDoc {
  id: string;
  createdAt: string;
}

export interface CollectionHandle<T extends FirebaseDoc> {
  items: T[];
  loading: boolean;
  add: (data: Omit<T, "id" | "createdAt">) => Promise<void>;
  update: (id: string, data: Partial<T>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useFirebaseCollection<T extends FirebaseDoc>(
  collectionName: string,
): CollectionHandle<T> {
  const { user } = useAuth();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const ref = collection(db, collectionName);
    const q = query(ref, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
      setItems(docs);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, collectionName]);

  async function add(data: Omit<T, "id" | "createdAt">): Promise<void> {
    if (!user) return;
    await addDoc(collection(db, collectionName), { ...data, createdAt: new Date().toISOString() });
  }

  async function update(id: string, data: Partial<T>): Promise<void> {
    if (!user) return;
    await updateDoc(doc(collection(db, collectionName), id), data as Record<string, unknown>);
  }

  async function remove(id: string): Promise<void> {
    if (!user) return;
    await deleteDoc(doc(collection(db, collectionName), id));
  }

  return { items, loading, add, update, remove };
}
