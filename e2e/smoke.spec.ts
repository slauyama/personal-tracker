import { test, expect } from "@playwright/test";

const ROUTES = [
  "/",
  "/beauty",
  "/beauty/stats",
  "/dog",
  "/dog/events",
  "/car",
  "/car/repair",
  "/car/gas",
  "/car/insurance",
];

// Firestore streams data over a long-lived connection, so the network never
// goes idle — give snapshots a moment to arrive and render instead.
const SETTLE_MS = 2000;

for (const route of ROUTES) {
  test(`${route} loads without console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(`./#${route}`);
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`#${route}$`));
    await page.waitForTimeout(SETTLE_MS);

    expect(errors).toEqual([]);
  });
}
