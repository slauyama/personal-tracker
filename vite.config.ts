import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const pkg = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("./package.json", import.meta.url)),
    "utf-8",
  ),
);

// Bundled CSS references its icon font with a relative
// url() that Vite can't resolve through the npm package import, so the
// file has to be copied into dist/assets.
function copyMaterialSymbolsFont(): Plugin {
  return {
    name: "copy-material-symbols-font",
    apply: "build",
    closeBundle() {
      const src = fileURLToPath(
        new URL(
          "./node_modules/@slauyama/ui/dist/material-symbols-rounded.woff2",
          import.meta.url,
        ),
      );
      if (!existsSync(src)) return;
      mkdirSync("dist/assets", { recursive: true });
      copyFileSync(src, "dist/assets/material-symbols-rounded.woff2");
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyMaterialSymbolsFont()],
  base: "/personal-tracker/",
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
});
