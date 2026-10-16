import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { iconFontSubset } from "@slauyama/ui/vite";

const pkg = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("./package.json", import.meta.url)),
    "utf-8",
  ),
);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), iconFontSubset()],
  base: "/personal-tracker/",
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
});
