import { useLayoutEffect, type CSSProperties } from "react";
import { useLocation } from "react-router-dom";

/** Animation styles, defined in index.css under html[data-nav-transition]. */
export type NavTransition = "slide-forward" | "slide-back" | "container";

// Give up waiting for a route change that never lands (e.g. navigate(-1) with
// no history), so the page isn't left frozen on the old snapshot.
const MAX_WAIT_MS = 500;

let resolvePending: (() => void) | null = null;

/**
 * Lets a pending transition capture the new page once the route has
 * committed. Mount once, above every route.
 */
export function useCommitNavTransition() {
  const { key } = useLocation();
  useLayoutEffect(() => {
    resolvePending?.();
    resolvePending = null;
  }, [key]);
}

/**
 * Style for a product image (alongside the `product-image` class) so the
 * list card and detail page images morph into each other.
 */
export function productImageTransitionStyle(productId: string): CSSProperties {
  return { "--product-image-name": `product-${productId}` } as CSSProperties;
}

/**
 * Runs `navigate` inside a View Transition styled by `kind`. Navigates
 * instantly where View Transitions are unsupported or reduced motion is on.
 * Browser back/forward bypass this and stay instant.
 */
export function navigateWithTransition(
  kind: NavTransition,
  navigate: () => void,
) {
  const root = document.documentElement;
  if (
    !("startViewTransition" in document) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    navigate();
    return;
  }

  root.dataset.navTransition = kind;
  const transition = document.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        resolvePending = resolve;
        navigate();
        setTimeout(resolve, MAX_WAIT_MS);
      }),
  );
  transition.finished.finally(() => {
    if (root.dataset.navTransition === kind) delete root.dataset.navTransition;
  });
}
