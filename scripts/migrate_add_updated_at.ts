import { initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getEnv } from "./firebase_helpers";

// One-off migration: `updatedAt` is new on both `products` and `transactions`,
// auto-stamped by the app on every create/update going forward. Existing docs
// predate the field, so this backfills `updatedAt = createdAt` for any doc
// that doesn't already have it.
// Safe to review, safe to re-run (skips docs that already have updatedAt).

const BATCH_SIZE = 500;
const COLLECTIONS = ["products", "transactions"];

interface RawDoc {
  createdAt?: string;
  updatedAt?: string;
}

async function backfillCollection(
  db: FirebaseFirestore.Firestore,
  collectionName: string,
) {
  const snapshot = await db.collection(collectionName).get();
  const toBackfill = snapshot.docs.filter(
    (doc) => (doc.data() as RawDoc).updatedAt === undefined,
  );

  console.log(
    `${collectionName}: ${snapshot.size} docs, ${toBackfill.length} missing updatedAt...`,
  );

  for (let i = 0; i < toBackfill.length; i += BATCH_SIZE) {
    const batch = db.batch();
    toBackfill.slice(i, i + BATCH_SIZE).forEach((doc) => {
      const createdAt = (doc.data() as RawDoc).createdAt ?? new Date().toISOString();
      batch.update(doc.ref, { updatedAt: createdAt });
    });
    await batch.commit();
  }
}

async function main() {
  const prodApp = initializeApp({
    credential: cert(
      JSON.parse(getEnv("FIREBASE_PROD_SERVICE_ACCOUNT")) as ServiceAccount,
    ),
  });
  const db = getFirestore(prodApp);

  for (const collectionName of COLLECTIONS) {
    await backfillCollection(db, collectionName);
  }

  console.log("Migration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
