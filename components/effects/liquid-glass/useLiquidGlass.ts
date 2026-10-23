"use client";

import { useCallback } from "react";
import { liquidGlass, type LiquidGlassOptions } from "./liquidGlassEngine";

/**
 * Attach the liquid-glass refraction effect to an element.
 *
 * Returns a *callback ref* — pass it as `ref` on the element you want to turn
 * into glass. The callback-ref shape (rather than useRef + useEffect) is
 * load-bearing: glass surfaces are very often conditionally rendered (modals,
 * toasts, floating panels), and an effect that ran while the element was still
 * `null` would never re-fire when it later mounts — the engine would silently
 * never start. A callback ref fires on every attach, and its returned cleanup
 * (React 19) tears the filter down on detach.
 *
 * The element still needs its own glass "dressing" — a translucent background,
 * a rounded corner, and the inset highlights — and it needs *something behind
 * it* to refract (imagery, a gradient, page content). See LiquidGlass.module.css
 * for the recipe, or use the <LiquidGlass> wrapper which bundles both.
 *
 * @example
 * const ref = useLiquidGlass<HTMLDivElement>({ scale: -90, radius: 24 });
 * return <div ref={ref} className="my-glass-card">…</div>;
 */
export function useLiquidGlass<T extends HTMLElement = HTMLDivElement>(
  options?: LiquidGlassOptions,
) {
  // Serialize so the ref re-attaches (rebuilding the filter) only when the
  // option *values* change — a fresh same-valued object literal each render
  // must not. Closing over `options` is safe for the same reason: the closure
  // only goes stale when the values are identical anyway.
  const key = JSON.stringify(options ?? {});

  return useCallback(
    (el: T | null) => {
      // Pre-React-19 detach signal; the returned cleanup handles teardown.
      if (!el) return;
      const glass = liquidGlass(el, options);
      return () => glass.destroy();
    },
    // `key` captures the meaningful contents of `options`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
}
