/*!
 * liquid-glass engine — Apple-style liquid glass refraction for any element.
 *
 * TypeScript ES-module port of deepika-builds/liquid-glass (MIT).
 * https://github.com/deepika-builds/liquid-glass
 *
 * The engine owns the SVG filter, the displacement map, the backdrop-filter
 * wiring, resize handling, and the frosted-blur fallback for browsers that
 * can't do SVG-filtered backdrops (Safari, Firefox). Visual dressing (tint,
 * inner highlight, glare, shadows) stays in CSS — see LiquidGlass.module.css.
 *
 * Chromium (Chrome/Edge/Arc/Brave) gets real edge refraction. Safari and
 * Firefox silently no-op SVG-filtered backdrops, so they get a frosted blur.
 *
 * Client-only: every entry point touches `document`/`navigator`/`CSS`, so
 * support detection is lazy (never runs at import time) — this module is safe
 * to import into a "use client" component that Next still renders on the
 * server for SSR.
 */

const SVG_NS = "http://www.w3.org/2000/svg";
let uid = 0;
let svgDefs: SVGDefsElement | null = null;
let cachedSupport: boolean | null = null;

export interface LiquidGlassOptions {
  /** Displacement strength. Negative = magnifying bulge. Default -112. */
  scale?: number;
  /** Per-channel scale stagger; 0 disables the prism fringe. Default 6. */
  chroma?: number;
  /** Neutral inset as a fraction of the smaller side. Default 0.07. */
  border?: number;
  /** Edge-curvature softness (px) of the map's gray inset. Default 12. */
  mapBlur?: number;
  /** Backdrop blur (px) behind the glass interior. Default 3. */
  blur?: number;
  /** Backdrop saturation boost. Default 1.5. */
  saturate?: number;
  /** Corner radius override (px). Defaults to the element's border-radius. */
  radius?: number | null;
  /** Frosted blur (px) where refraction is unsupported. Default 16. */
  fallbackBlur?: number;
}

export interface LiquidGlassHandle {
  /** Whether real refraction is active (false = frosted fallback). */
  supported: boolean;
  /** Rebuild the displacement map — call after a manual resize. */
  refresh: () => void;
  /** Tear down the filter, observer, and inline styles. */
  destroy: () => void;
}

type Required_ = Required<LiquidGlassOptions>;

const DEFAULTS: Required_ = {
  scale: -112,
  chroma: 6,
  border: 0.07,
  mapBlur: 12,
  blur: 3,
  saturate: 1.5,
  radius: null,
  fallbackBlur: 16,
};

// Chromium can apply SVG filters via backdrop-filter; Safari and Firefox
// silently no-op, so they get the frosted fallback instead. Evaluated lazily
// and cached so it never touches browser globals during SSR.
function isSupported(): boolean {
  if (cachedSupport !== null) return cachedSupport;
  if (
    typeof window === "undefined" ||
    typeof navigator === "undefined" ||
    typeof CSS === "undefined"
  ) {
    return false; // SSR — don't cache; the client re-checks.
  }
  const ua = navigator.userAgent;
  const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua);
  const isFirefox = /Firefox/.test(ua);
  if (isSafari || isFirefox) return (cachedSupport = false);
  if (!CSS.supports("backdrop-filter", "url(#lg)")) return (cachedSupport = false);
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 4;
    c.getContext("2d")!.getImageData(0, 0, 1, 1);
    return (cachedSupport = true);
  } catch {
    return (cachedSupport = false);
  }
}

function ensureDefs(): SVGDefsElement {
  if (svgDefs) return svgDefs;
  const svg = document.createElementNS(SVG_NS, "svg");
  // width/height 0 keeps it renderable (display:none would break feImage).
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.setAttribute("aria-hidden", "true");
  svg.style.position = "absolute";
  svgDefs = document.createElementNS(SVG_NS, "defs");
  svg.appendChild(svgDefs);
  document.body.appendChild(svg);
  return svgDefs;
}

// Displacement map, gradient-difference method: a red left->right ramp
// encodes X displacement, a blue top->bottom ramp encodes Y ("difference"
// keeps both since the channels are disjoint). A blurred, inset 50%-gray
// rounded rect neutralizes the interior, confining the refraction bulge to an
// edge band whose curvature is set by the blur radius.
function makeMap(
  w: number,
  h: number,
  radius: number,
  border: number,
  mapBlur: number,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  const gx = ctx.createLinearGradient(0, 0, w, 0);
  gx.addColorStop(0, "rgb(0,0,0)");
  gx.addColorStop(1, "rgb(255,0,0)");
  ctx.fillStyle = gx;
  ctx.fillRect(0, 0, w, h);

  const gy = ctx.createLinearGradient(0, 0, 0, h);
  gy.addColorStop(0, "rgb(0,0,0)");
  gy.addColorStop(1, "rgb(0,0,255)");
  ctx.globalCompositeOperation = "difference";
  ctx.fillStyle = gy;
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = "source-over";
  const inset = border * Math.min(w, h);
  ctx.filter = "blur(" + mapBlur + "px)";
  ctx.fillStyle = "rgba(128,128,128,0.93)";
  ctx.beginPath();
  ctx.roundRect(inset, inset, w - inset * 2, h - inset * 2, Math.max(radius - inset, 2));
  ctx.fill();
  ctx.filter = "none";
  return canvas.toDataURL();
}

// Three displacement passes at staggered scales (R strongest), channels
// isolated with feColorMatrix and recombined with screen blends — the faint
// prism fringe at the rim.
function buildFilter(id: string, scales: number[]): {
  filter: SVGFilterElement;
  feImage: SVGFEImageElement;
} {
  const filter = document.createElementNS(SVG_NS, "filter");
  filter.setAttribute("id", id);
  filter.setAttribute("x", "0");
  filter.setAttribute("y", "0");
  filter.setAttribute("width", "100%");
  filter.setAttribute("height", "100%");
  // Load-bearing: filters default to linearRGB, which re-maps the map's
  // neutral gray 128 to ~0.216 and injects a constant phantom displacement.
  filter.setAttribute("color-interpolation-filters", "sRGB");

  const feImage = document.createElementNS(SVG_NS, "feImage");
  feImage.setAttribute("x", "0");
  feImage.setAttribute("y", "0");
  feImage.setAttribute("result", "map");
  feImage.setAttribute("preserveAspectRatio", "none");
  filter.appendChild(feImage);

  const keep = [
    "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
    "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
    "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0",
  ];
  const channels: string[] = [];
  for (let i = 0; i < 3; i++) {
    const disp = document.createElementNS(SVG_NS, "feDisplacementMap");
    disp.setAttribute("in", "SourceGraphic");
    disp.setAttribute("in2", "map");
    disp.setAttribute("scale", String(scales[i]));
    disp.setAttribute("xChannelSelector", "R");
    disp.setAttribute("yChannelSelector", "B");
    disp.setAttribute("result", "d" + i);
    filter.appendChild(disp);

    const cm = document.createElementNS(SVG_NS, "feColorMatrix");
    cm.setAttribute("in", "d" + i);
    cm.setAttribute("type", "matrix");
    cm.setAttribute("values", keep[i]);
    cm.setAttribute("result", "c" + i);
    filter.appendChild(cm);
    channels.push("c" + i);
  }

  const blend1 = document.createElementNS(SVG_NS, "feBlend");
  blend1.setAttribute("in", channels[0]);
  blend1.setAttribute("in2", channels[1]);
  blend1.setAttribute("mode", "screen");
  blend1.setAttribute("result", "c01");
  filter.appendChild(blend1);

  const blend2 = document.createElementNS(SVG_NS, "feBlend");
  blend2.setAttribute("in", "c01");
  blend2.setAttribute("in2", channels[2]);
  blend2.setAttribute("mode", "screen");
  filter.appendChild(blend2);

  ensureDefs().appendChild(filter);
  return { filter, feImage };
}

function resolveRadius(
  el: HTMLElement,
  w: number,
  h: number,
  override: number | null,
): number {
  if (override != null) return override;
  const raw = getComputedStyle(el).borderTopLeftRadius || "0px";
  const v = parseFloat(raw) || 0;
  return raw.trim().endsWith("%") ? (v / 100) * Math.min(w, h) : v;
}

/**
 * Apply liquid glass to an element. Call inside an effect (client-only) and
 * call the returned `destroy()` on cleanup.
 */
export function liquidGlass(el: HTMLElement, opts?: LiquidGlassOptions): LiquidGlassHandle {
  const o: Required_ = { ...DEFAULTS, ...opts };

  if (!isSupported()) {
    const frosted = "blur(" + o.fallbackBlur + "px) saturate(" + o.saturate + ")";
    el.style.backdropFilter = frosted;
    el.style.setProperty("-webkit-backdrop-filter", frosted);
    el.classList.add("lg-fallback");
    return {
      supported: false,
      refresh: () => {},
      destroy: () => {
        el.style.backdropFilter = "";
        el.style.removeProperty("-webkit-backdrop-filter");
        el.classList.remove("lg-fallback");
      },
    };
  }

  const id = "lg-filter-" + ++uid;
  const scales = [o.scale, o.scale + o.chroma, o.scale + 2 * o.chroma];
  const parts = buildFilter(id, scales);

  function refresh() {
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (!w || !h) return;
    const radius = resolveRadius(el, w, h, o.radius);
    parts.feImage.setAttribute("href", makeMap(w, h, radius, o.border, o.mapBlur));
    parts.feImage.setAttribute("width", String(w));
    parts.feImage.setAttribute("height", String(h));
  }

  refresh();
  el.style.backdropFilter =
    "url(#" + id + ") blur(" + o.blur + "px) saturate(" + o.saturate + ")";

  let timer: ReturnType<typeof setTimeout> | null = null;
  const ro = new ResizeObserver(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(refresh, 120);
  });
  ro.observe(el);

  return {
    supported: true,
    refresh,
    destroy: () => {
      ro.disconnect();
      if (timer) clearTimeout(timer);
      parts.filter.remove();
      el.style.backdropFilter = "";
    },
  };
}
