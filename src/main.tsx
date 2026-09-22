import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./index.css";

import App from "./App";

// @slauyama/ui reads document.documentElement's data-theme attribute to pick
// its color tokens (no media-query fallback), so mirror the OS preference
// onto it ourselves and keep it live if that preference changes.
const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
function syncTheme(isDark: boolean) {
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
}
syncTheme(darkMediaQuery.matches);
darkMediaQuery.addEventListener("change", (e) => syncTheme(e.matches));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
