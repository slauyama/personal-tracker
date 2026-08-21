import { initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getEnv } from "./firebase_helpers";

// One-off migration: `notes` is moving from `products` to `transactions`.
// For every product with non-empty notes, copies them onto that product's
// most recent transaction (by purchaseDate, falling back to createdAt).
// Does NOT strip `notes` off the product docs — the app has already
// stopped reading/writing product.notes, so the leftover field is inert.
// Safe to review, safe to re-run (each run just re-sets the same value
// unless product notes changed in between).

const BATCH_SIZE = 500;

interface RawProduct {
  notes?: string;
}

interface RawTransaction {
  productId: string;
  purchaseDate?: string;
  createdAt?: string;
  notes?: string;
}

function mostRecent(
  transactions: { id: string; data: RawTransaction }[],
): { id: string; data: RawTransaction } {
  return transactions.reduce((latest, t) => {
    const latestKey = latest.data.purchaseDate || latest.data.createdAt || "";
    const key = t.data.purchaseDate || t.data.createdAt || "";
    return key > latestKey ? t : latest;
  });
}

async function main() {
  const prodApp = initializeApp({
    credential: cert(
      JSON.parse(getEnv("FIREBASE_PROD_SERVICE_ACCOUNT")) as ServiceAccount,
    ),
  });
  const db = getFirestore(prodApp);

  const [productsSnapshot, transactionsSnapshot] = await Promise.all([
    db.collection("products").get(),
    db.collection("transactions").get(),
  ]);

  const transactionsByProduct = new Map<
    string,
    { id: string; data: RawTransaction }[]
  >();
  for (const doc of transactionsSnapshot.docs) {
    const data = doc.data() as RawTransaction;
    const list = transactionsByProduct.get(data.productId) ?? [];
    list.push({ id: doc.id, data });
    transactionsByProduct.set(data.productId, list);
  }

  const updates: { transactionId: string; notes: string }[] = [];
  let skippedNoTransaction = 0;

  for (const doc of productsSnapshot.docs) {
    const notes = ((doc.data() as RawProduct).notes ?? "").trim();
    if (!notes) continue;

    const transactions = transactionsByProduct.get(doc.id);
    if (!transactions || transactions.length === 0) {
      skippedNoTransaction++;
      console.warn(`  Product ${doc.id} has notes but no transactions — skipping`);
      continue;
    }

    const target = mostRecent(transactions);
    updates.push({ transactionId: target.id, notes });
  }

  const updatedIds = new Set(updates.map((u) => u.transactionId));
  const backfillIds = transactionsSnapshot.docs
    .filter((doc) => !updatedIds.has(doc.id) && (doc.data() as RawTransaction).notes === undefined)
    .map((doc) => doc.id);

  console.log(
    `Found ${productsSnapshot.size} products, ${updates.length} notes to migrate, ` +
      `${backfillIds.length} transactions to backfill with notes: "", ${skippedNoTransaction} skipped (no transaction)...`,
  );

  const writes = [
    ...updates.map((u) => ({ id: u.transactionId, notes: u.notes })),
    ...backfillIds.map((id) => ({ id, notes: "" })),
  ];

  for (let i = 0; i < writes.length; i += BATCH_SIZE) {
    const batch = db.batch();
    writes
      .slice(i, i + BATCH_SIZE)
      .forEach((w) =>
        batch.update(db.collection("transactions").doc(w.id), {
          notes: w.notes,
        }),
      );
    await batch.commit();
  }

  console.log("Migration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
