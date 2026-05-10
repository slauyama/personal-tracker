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
import { useAuth } from "../contexts/AuthContext";

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
  importItems: (incoming: T[], merge: boolean) => Promise<void>;
}

export function useFirebaseCollection<T extends FirebaseDoc>(
  collectionName: string,
): CollectionHandle<T> {
  const { user } = useAuth();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const colRef = () => collection(db, collectionName);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems([]);
      setLoading(false);
      return;
    }

    const q = query(colRef(), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
      setItems(docs);
      setLoading(false);
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, collectionName]);

  async function add(data: Omit<T, "id" | "createdAt">): Promise<void> {
    if (!user) return;
    await addDoc(colRef(), { ...data, createdAt: new Date().toISOString() });
  }

  async function update(id: string, data: Partial<T>): Promise<void> {
    if (!user) return;
    await updateDoc(doc(colRef(), id), data);
  }

  async function remove(id: string): Promise<void> {
    if (!user) return;
    await deleteDoc(doc(colRef(), id));
  }

  return { items, loading, add, update, remove };
}
