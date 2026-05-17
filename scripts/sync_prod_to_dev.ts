import { initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { copyCollection, deleteCollection, getEnv } from "./firebase_helpers";

const COLLECTIONS = [
  "products",
  // add new collections here as the app grows
];

async function main() {
  const prodApp = initializeApp(
    {
      credential: cert(
        JSON.parse(getEnv("FIREBASE_PROD_SERVICE_ACCOUNT")) as ServiceAccount,
      ),
    },
    "prod",
  );
  const devApp = initializeApp(
    {
      credential: cert(
        JSON.parse(getEnv("FIREBASE_DEV_SERVICE_ACCOUNT")) as ServiceAccount,
      ),
    },
    "dev",
  );

  const prodDb = getFirestore(prodApp);
  const devDb = getFirestore(devApp);

  for (const col of COLLECTIONS) {
    console.log(`\nSyncing ${col}...`);
    await deleteCollection(devDb, col);
    await copyCollection(prodDb, devDb, col);
  }

  console.log("\nSync complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
