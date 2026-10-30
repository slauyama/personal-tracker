import { test as setup, expect } from "@playwright/test";
import { cert, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { AUTH_FILE } from "./authFile";

const E2E_UID = "e2e-smoke";

type E2EWindow = Window & { __e2eSignIn: (token: string) => Promise<unknown> };

// The service account must belong to the Firebase project the app under test
// is built against: dev for the local server, prod for the deployed site.
function serviceAccount(): ServiceAccount {
  const json =
    process.env.E2E_SERVICE_ACCOUNT ?? process.env.FIREBASE_DEV_SERVICE_ACCOUNT;
  if (!json) {
    throw new Error(
      "Set E2E_SERVICE_ACCOUNT (or FIREBASE_DEV_SERVICE_ACCOUNT in .env)",
    );
  }
  return JSON.parse(json) as ServiceAccount;
}

setup("sign in", async ({ page }) => {
  const app = initializeApp({ credential: cert(serviceAccount()) });
  const token = await getAuth(app).createCustomToken(E2E_UID);

  await page.goto("./");
  await page.waitForFunction(() => "__e2eSignIn" in window);
  await page.evaluate((t) => (window as E2EWindow).__e2eSignIn(t), token);
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();

  await page.context().storageState({ path: AUTH_FILE, indexedDB: true });
});
