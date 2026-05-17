import { type Firestore } from "firebase-admin/firestore";

const BATCH_SIZE = 500;

export function getEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing environment variable: ${key}`);
  return val;
}

export async function deleteCollection(db: Firestore, collectionName: string) {
  const snapshot = await db.collection(collectionName).get();
  if (snapshot.empty) return;

  for (let i = 0; i < snapshot.docs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    snapshot.docs.slice(i, i + BATCH_SIZE).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  console.log(`  Deleted ${snapshot.size} docs from dev/${collectionName}`);
}

export async function copyCollection(
  prodDb: Firestore,
  devDb: Firestore,
  collectionName: string,
) {
  const snapshot = await prodDb.collection(collectionName).get();

  if (snapshot.empty) {
    console.log(`  prod/${collectionName} is empty — skipping`);
    return;
  }

  for (let i = 0; i < snapshot.docs.length; i += BATCH_SIZE) {
    const batch = devDb.batch();
    snapshot.docs.slice(i, i + BATCH_SIZE).forEach((d) => {
      batch.set(devDb.collection(collectionName).doc(d.id), d.data());
    });
    await batch.commit();
  }

  console.log(`  Copied ${snapshot.size} docs to dev/${collectionName}`);
}
