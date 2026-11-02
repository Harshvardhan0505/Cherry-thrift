"use client";

import { usePathname, useRouter } from "next/navigation";
import { Suspense, createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { prefersStill } from "@/lib/motion";

// A gust of cherry blossom between the steps of placing an order, like a
// scene change in a film: petals blow in from the top-left, building to a
// flurry, and at its height the page you're leaving dissolves into the next
// one behind them; then the gust passes and the last petals drift away. The
// petals never fill the screen: near ones are big, fast and soft, far ones
// small and slow, so it reads as depth rather than a wall.
//
// The page being left is copied, as it looks, over the screen while the real
// page changes underneath, and that copy is what dissolves. Arrival is "the
// address changed", so it works wherever the step leads.

/** The gust builds for this long before the page can change. */
const BUILD_MS = 450;
/** The old page dissolves into the new one over this long. */
const DISSOLVE_MS = 650;
/** And the gust dies away over this long after. */
const FADE_OUT_MS = 700;
/** If the address never changes (the server is slow or down), give up. */
const GIVE_UP_MS = 9000;

// Blossom shades, base (where the petal joined the flower) to tip: from
// near-white petals to properly pink ones.
const SHADES = [
  { base: "#f2b3c4", mid: "#fde6ec", tip: "#ffffff" },
  { base: "#ec9ab1", mid: "#fad0dc", tip: "#fff5f8" },
  { base: "#e2809d", mid: "#f6b9ca", tip: "#fde5ec" },
  { base: "#e894ab", mid: "#f8c6d3", tip: "#fff1f5" },
];
// How much a petal is curled to one side, for a few that aren't symmetric.
const CURLS = [-0.18, 0, 0.18];
const SPRITE = 96;

// Front and back of a petal, and a soft (out of focus) front for near ones.
type Sprite = { front: HTMLCanvasElement; back: HTMLCanvasElement; soft: HTMLCanvasElement };

type Petal = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 0 = far away, 1 = right by the camera. */
  depth: number;
  size: number;
  rot: number;
  spin: number;
  flip: number;
  phase: number;
  sway: number;
  sprite: number;
  alpha: number;
};

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

// One petal, drawn once and then stamped as many times as needed: a soft oval
// with a small notch at the tip, shaded from a deeper pink at the base to
// near-white at the tip, with a faint vein and edge. The back is paler.
function paintPetal(shade: (typeof SHADES)[number], curl: number, back: boolean, blur = 0) {
  const canvas = document.createElement("canvas");
  canvas.width = SPRITE;
  canvas.height = SPRITE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  // Out of focus: blurred where the browser can (and simply sharp where not).
  if (blur) ctx.filter = `blur(${blur}px)`;
  const s = SPRITE * 0.38;
  ctx.translate(SPRITE / 2, SPRITE / 2);
  ctx.transform(1, 0, curl, 1, 0, 0);
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.82);
  ctx.bezierCurveTo(-s * 0.12, -s * 1.0, -s * 0.45, -s * 1.02, -s * 0.58, -s * 0.62);
  ctx.bezierCurveTo(-s * 0.72, -s * 0.15, -s * 0.42, s * 0.62, 0, s);
  ctx.bezierCurveTo(s * 0.42, s * 0.62, s * 0.72, -s * 0.15, s * 0.58, -s * 0.62);
  ctx.bezierCurveTo(s * 0.45, -s * 1.02, s * 0.12, -s * 1.0, 0, -s * 0.82);
  ctx.closePath();
  const fill = ctx.createLinearGradient(0, s, 0, -s);
  fill.addColorStop(0, shade.base);
  fill.addColorStop(0.35, shade.mid);
  fill.addColorStop(1, shade.tip);
  ctx.globalAlpha = back ? 0.82 : 0.96;
  ctx.fillStyle = fill;
  ctx.fill();
  if (!blur) {
    ctx.globalAlpha = back ? 0.25 : 0.4;
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = shade.base;
    ctx.stroke();
    // The vein, from the base most of the way up.
    ctx.beginPath();
    ctx.moveTo(0, s * 0.9);
    ctx.quadraticCurveTo(s * 0.06, 0, 0, -s * 0.55);
    ctx.globalAlpha = back ? 0.12 : 0.22;
    ctx.stroke();
  }
  return canvas;
}

function paintSprites(): Sprite[] {
  return SHADES.flatMap((shade) =>
    CURLS.map((curl) => ({
      front: paintPetal(shade, curl, false),
      back: paintPetal(shade, curl, true),
      soft: paintPetal(shade, curl, false, 4),
    })),
  );
}

// A still copy of the page as it looks right now, to sit over the screen
// while the real page changes underneath. It's the page's own markup (so the
// same styles apply), with what a plain copy loses put back: canvas pictures,
// typed text, and the exact image each <img> is showing.
function copyPage(): HTMLDivElement {
  const ghost = document.createElement("div");
  ghost.setAttribute("aria-hidden", "true");
  ghost.inert = true;
  Object.assign(ghost.style, {
    position: "fixed",
    inset: "0",
    zIndex: "94",
    overflow: "hidden",
    pointerEvents: "none",
    background: getComputedStyle(document.body).backgroundColor,
  });
  const page = document.createElement("div");
  page.className = document.body.className;
  Object.assign(page.style, {
    position: "absolute",
    left: `${-window.scrollX}px`,
    top: `${-window.scrollY}px`,
    width: `${document.documentElement.clientWidth}px`,
    minHeight: `${window.innerHeight}px`,
  });

  for (const child of Array.from(document.body.children)) {
    if (!(child instanceof HTMLElement)) continue;
    if (child.tagName === "SCRIPT" || child.tagName === "NEXTJS-PORTAL" || child.hasAttribute("data-transition-skip")) {
      continue;
    }
    const copy = child.cloneNode(true) as HTMLElement;
    copy.querySelectorAll("[data-transition-skip], script").forEach((el) => el.remove());

    const canvases = child.querySelectorAll("canvas");
    copy.querySelectorAll("canvas").forEach((canvas, i) => {
      try {
        canvas.getContext("2d")?.drawImage(canvases[i], 0, 0);
      } catch {
        // A canvas that can't be read stays blank for the moment it's shown.
      }
    });
    const fields = child.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
    copy.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea").forEach((field, i) => {
      field.value = fields[i]?.value ?? field.value;
    });
    const images = child.querySelectorAll("img");
    copy.querySelectorAll("img").forEach((img, i) => {
      const shown = images[i]?.currentSrc;
      if (shown) {
        img.removeAttribute("srcset");
        img.removeAttribute("sizes");
        img.src = shown;
      }
      img.loading = "eager";
    });
    page.appendChild(copy);
  }
  ghost.appendChild(page);
  return ghost;
}

type Engine = {
  running: boolean;
  start: number;
  last: number;
  frame: number;
  w: number;
  h: number;
  dpr: number;
  /** Petal size, in CSS pixels, for one at middle distance. */
  base: number;
  carry: number;
  /** The next page is here (or the step went nowhere): the old one can dissolve. */
  ready: boolean;
  dissolveAt: number | null;
  dissolvedAt: number | null;
  petals: Petal[];
  sprites: Sprite[];
  ghost: HTMLDivElement | null;
  ctx: CanvasRenderingContext2D | null;
  root: HTMLDivElement | null;
};

function blowIn(e: Engine, t: number) {
  const { w, h } = e;
  // Mostly middle distance, with a few far off and a few right by the camera.
  const depth = Math.random() ** 1.6;
  const size = e.base * (0.6 + depth * 1.4) * (0.85 + Math.random() * 0.3);
  // From the top-left: along the top edge or down the left, starting near the
  // corner and widening as the gust gets going.
  const reach = 0.3 + 0.7 * clamp01(t / 600);
  const fromTop = Math.random() < w / (w + h);
  const x = fromTop ? (Math.random() * 1.1 - 0.1) * w * reach : -size;
  const y = fromTop ? -size : (Math.random() * 1.1 - 0.1) * h * reach;
  // The wind: down and to the right, a little flatter than diagonal; near
  // petals rush past, far ones drift.
  const angle = 0.55 + (Math.random() - 0.5) * 0.45;
  const speed = Math.hypot(w, h) * (0.28 + depth * 0.55) * (0.85 + Math.random() * 0.3);
  e.petals.push({
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    depth,
    size,
    rot: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * (3 + depth * 5),
    flip: 2.5 + Math.random() * 4,
    phase: Math.random() * Math.PI * 2,
    sway: size * (1.5 + Math.random() * 2),
    sprite: Math.floor(Math.random() * e.sprites.length),
    // Far petals are a little hazy.
    alpha: 0.7 + depth * 0.3,
  });
}

function stop(e: Engine) {
  e.running = false;
  e.petals = [];
  e.ghost?.remove();
  e.ghost = null;
  if (e.root) e.root.style.display = "none";
}

function frame(e: Engine, now: number) {
  const ctx = e.ctx;
  if (!ctx || !e.running) return;
  // The first frame's timestamp can fall just before the start: never let
  // time run backwards.
  const dt = Math.min(0.05, Math.max(0, (now - e.last) / 1000));
  e.last = now;
  const t = Math.max(0, now - e.start);
  const { w, h, dpr } = e;

  // The page change, once the gust has built and the next page is here: the
  // old page softens and fades away behind the petals.
  if (e.ready && e.dissolveAt === null && t >= BUILD_MS) e.dissolveAt = now;
  if (e.dissolveAt !== null && e.ghost) {
    const d = smooth((now - e.dissolveAt) / DISSOLVE_MS);
    e.ghost.style.opacity = String(1 - d);
    e.ghost.style.filter = `blur(${(d * 6).toFixed(2)}px)`;
    e.ghost.style.transform = `scale(${1 + d * 0.02})`;
    if (d >= 1) {
      e.ghost.remove();
      e.ghost = null;
      e.dissolvedAt = now;
    }
  }

  // How hard the wind is blowing: building, holding while the page changes,
  // then dying away.
  const strength =
    e.dissolvedAt === null ? smooth(t / BUILD_MS) : 1 - smooth((now - e.dissolvedAt) / FADE_OUT_MS);
  const peakRate = Math.min(700, Math.max(320, Math.sqrt((w * h) / (1440 * 900)) * 650));
  e.carry += peakRate * strength * dt;
  while (e.carry >= 1) {
    e.carry -= 1;
    blowIn(e, t);
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w * dpr, h * dpr);
  const kept: Petal[] = [];
  for (const p of e.petals) {
    p.phase += p.flip * dt;
    p.rot += p.spin * dt;
    // Sideways flutter on top of the drift, and a little gravity.
    p.x += (p.vx + Math.sin(p.phase * 0.6) * p.sway) * dt;
    p.y += (p.vy + Math.cos(p.phase * 0.45) * p.sway * 0.4) * dt;
    p.vy += 18 * dt;
    if (p.x > w + p.size || p.y > h + p.size) continue;
    kept.push(p);
    // Tumbling: squashed edge-on as it turns, showing its paler back half the time.
    const turn = Math.cos(p.phase);
    const squash = 0.25 + 0.75 * Math.abs(turn);
    const sprite = e.sprites[p.sprite];
    const image = p.depth > 0.78 ? sprite.soft : turn >= 0 ? sprite.front : sprite.back;
    const cos = Math.cos(p.rot) * dpr;
    const sin = Math.sin(p.rot) * dpr;
    ctx.setTransform(cos, sin, -sin * squash, cos * squash, p.x * dpr, p.y * dpr);
    ctx.globalAlpha = p.alpha;
    ctx.drawImage(image, -p.size / 2, -p.size / 2, p.size, p.size);
  }
  e.petals = kept;

  if (e.dissolvedAt !== null && strength <= 0 && kept.length === 0) {
    stop(e);
    return;
  }
  e.frame = requestAnimationFrame((next) => frame(e, next));
}

type PageTransition = {
  /** Starts the gust, going to `href` underneath. */
  go: (href: string) => void;
  /** Starts the gust for a step that navigates by itself (a form that redirects). */
  cover: () => void;
  /** Lets the gust pass: the step didn't go anywhere (wrong log in details). */
  uncover: () => void;
};

const Context = createContext<PageTransition | null>(null);

export function usePageTransition(): PageTransition {
  const value = useContext(Context);
  if (!value) throw new Error("usePageTransition must be used inside PageTransitionProvider");
  return value;
}

// Reports the address as it changes. On its own, inside <Suspense>, because
// reading the address on pages with dynamic routes must be.
function AddressWatcher({ onChange }: { onChange: (pathname: string) => void }) {
  const pathname = usePathname();
  useEffect(() => onChange(pathname), [pathname, onChange]);
  return null;
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Where the transition started, while one is under way.
  const coveredOn = useRef<string | null>(null);
  const giveUp = useRef(0);
  const engine = useRef<Engine>({
    running: false,
    start: 0,
    last: 0,
    frame: 0,
    w: 0,
    h: 0,
    dpr: 1,
    base: 24,
    carry: 0,
    ready: false,
    dissolveAt: null,
    dissolvedAt: null,
    petals: [],
    sprites: [],
    ghost: null,
    ctx: null,
    root: null,
  });

  // The old page can dissolve now (as soon as the gust has built).
  const release = useCallback(() => {
    if (coveredOn.current === null) return;
    coveredOn.current = null;
    clearTimeout(giveUp.current);
    engine.current.ready = true;
    if (rootRef.current) rootRef.current.style.pointerEvents = "none";
  }, []);

  const cover = useCallback(() => {
    if (prefersStill() || coveredOn.current !== null) return;
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    coveredOn.current = window.location.pathname;

    const e = engine.current;
    cancelAnimationFrame(e.frame);
    e.ghost?.remove();
    e.ghost = copyPage();
    document.body.appendChild(e.ghost);

    // Soft petals don't need full sharpness, and it cuts the drawing on retina screens.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    e.w = window.innerWidth;
    e.h = window.innerHeight;
    e.dpr = dpr;
    canvas.width = Math.round(e.w * dpr);
    canvas.height = Math.round(e.h * dpr);
    e.ctx = canvas.getContext("2d");
    // The petal pictures are painted once, the first time they're needed.
    if (e.sprites.length === 0) e.sprites = paintSprites();
    // Generous petals: about 17px far away to 55px close up on a laptop.
    e.base = Math.min(30, Math.max(18, Math.hypot(e.w, e.h) / 60));
    e.carry = 0;
    e.ready = false;
    e.dissolveAt = null;
    e.dissolvedAt = null;
    e.petals = [];
    e.running = true;
    e.start = performance.now();
    e.last = e.start;
    e.root = root;
    root.style.display = "block";
    // Blocks clicks while the page changes underneath.
    root.style.pointerEvents = "auto";
    e.frame = requestAnimationFrame((now) => frame(e, now));
    clearTimeout(giveUp.current);
    giveUp.current = window.setTimeout(release, GIVE_UP_MS);
  }, [release]);

  const go = useCallback(
    (href: string) => {
      cover();
      router.push(href);
    },
    [cover, router],
  );

  // The next page is here, under the copy: let it paint, then dissolve.
  const arrived = useCallback(
    (pathname: string) => {
      if (coveredOn.current === null || pathname === coveredOn.current) return;
      requestAnimationFrame(() => requestAnimationFrame(release));
    },
    [release],
  );

  useEffect(() => {
    const e = engine.current;
    return () => {
      clearTimeout(giveUp.current);
      cancelAnimationFrame(e.frame);
      e.ghost?.remove();
    };
  }, []);

  const value = useMemo(() => ({ go, cover, uncover: release }), [go, cover, release]);

  return (
    <Context.Provider value={value}>
      {children}
      <Suspense fallback={null}>
        <AddressWatcher onChange={arrived} />
      </Suspense>
      <div ref={rootRef} data-transition-skip aria-hidden="true" className="fixed inset-0 z-[95] hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>
    </Context.Provider>
  );
}
