"use client";

import { type HTMLAttributes } from "react";
import { useLiquidGlass } from "./useLiquidGlass";
import type { LiquidGlassOptions } from "./liquidGlassEngine";
import styles from "./LiquidGlass.module.css";

interface LiquidGlassProps extends HTMLAttributes<HTMLDivElement> {
  /** Engine tuning (scale, chroma, radius, blur…). Sensible defaults if omitted. */
  options?: LiquidGlassOptions;
  /** Use the pale-backdrop dressing (dark rim/tint) instead of the dark one. */
  light?: boolean;
}

/**
 * Drop-in liquid-glass surface: a translucent, light-refracting pane.
 *
 * Bundles the refraction engine (via useLiquidGlass) with the CSS dressing, so
 * anything you nest inside sits on real glass. It needs content *behind* it to
 * refract — place it over imagery, a gradient, or scrolling page content, not
 * a flat solid fill.
 *
 * @example
 * <LiquidGlass className="w-80 p-6" options={{ radius: 24 }}>
 *   <h2>Frosted panel</h2>
 *   <p>Sitting on real glass.</p>
 * </LiquidGlass>
 */
export function LiquidGlass({
  options,
  light,
  className,
  children,
  ...rest
}: LiquidGlassProps) {
  const ref = useLiquidGlass<HTMLDivElement>(options);
  const classes = [styles.surface, light && styles.light, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes} {...rest}>
      {children}
    </div>
  );
}

export default LiquidGlass;
