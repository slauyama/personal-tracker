import { initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getEnv } from "./firebase_helpers";

// One-off migration: for every beauty product with purchase info
// (price / dateBought / purchasedAt), create a corresponding doc in the new
// `transactions` collection. Does NOT touch/strip fields on the `products`
// docs — the existing UI still reads price/dateBought/purchasedAt/status
// directly until the follow-up UI phase switches over to `transactions`.
// Safe to review, NOT safe to run twice — running it again will duplicate
// every transaction.

const BATCH_SIZE = 500;

interface RawProduct {
  price?: number | null;
  dateBought?: string;
  purchasedAt?: string;
  createdAt?: string;
}

interface PreparedTransaction {
  productId: string;
  purchaseDate: string;
  price: number | null;
  location: string;
  finishDate: string;
  createdAt: string;
}

function buildTransaction(id: string, data: RawProduct): PreparedTransaction | null {
  const hasPurchaseInfo =
    (data.price != null && data.price !== 0) ||
    !!data.dateBought ||
    !!data.purchasedAt;
  if (!hasPurchaseInfo) return null;

  return {
    productId: id,
    purchaseDate: data.dateBought ?? "",
    price: data.price ?? null,
    location: data.purchasedAt ?? "",
    finishDate: "",
    createdAt: data.createdAt ?? new Date().toISOString(),
  };
}

async function main() {
  const prodApp = initializeApp({
    credential: cert(
      JSON.parse(getEnv("FIREBASE_PROD_SERVICE_ACCOUNT")) as ServiceAccount,
    ),
  });
  const db = getFirestore(prodApp);

  const snapshot = await db.collection("products").get();
  const transactions: PreparedTransaction[] = [];

  for (const doc of snapshot.docs) {
    const transaction = buildTransaction(doc.id, doc.data() as RawProduct);
    if (transaction) transactions.push(transaction);
  }

  console.log(
    `Found ${snapshot.size} products, creating ${transactions.length} transactions...`,
  );

  for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
    const batch = db.batch();
    transactions
      .slice(i, i + BATCH_SIZE)
      .forEach((t) => batch.set(db.collection("transactions").doc(), t));
    await batch.commit();
  }

  console.log("Migration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
