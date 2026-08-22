import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./useAuth";

export interface PriceCheck {
  id: string;
  productId: string;
  retailer: string;
  price: number;
  url: string;
  date: string;
}

export function usePriceChecks(productId: string | undefined) {
  const { user } = useAuth();
  const [priceChecks, setPriceChecks] = useState<PriceCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !productId) return;

    const q = query(
      collection(db, "priceChecks"),
      where("productId", "==", productId),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPriceChecks(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as PriceCheck[],
      );
      setLoading(false);
    });

    return unsubscribe;
  }, [user, productId]);

  return { priceChecks, loading };
}
