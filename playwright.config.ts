import { defineConfig, devices } from "@playwright/test";
import { AUTH_FILE } from "./e2e/authFile";

// Locally, credentials come from .env; in CI they're passed as env vars.
try {
  process.loadEnvFile();
} catch {
  // no .env
}

// Defaults to the local dev server; CI points this at the deployed Pages URL.
const baseURL = process.env.BASE_URL ?? "http://localhost:5173/personal-tracker/";

export default defineConfig({
  testDir: "e2e",
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "smoke",
      testMatch: /\.spec\.ts/,
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"], storageState: AUTH_FILE },
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: "npm run dev", url: baseURL, reuseExistingServer: true },
});
