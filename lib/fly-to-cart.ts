import gsap from "gsap";
import { prefersStill } from "./motion";

const FLIGHT_S = 0.7;

// When a size is picked on a product card: a small copy of the photo arcs up
// into the bag icon, hearts pop out of the button, and the bag bounces.
// Returns how long to wait before opening the cart, so the flight is seen.
// The photo is the card's own unless `from` is given (the home page wheel).
export function flyToCart(button: HTMLElement, from?: HTMLImageElement | null): number {
  if (prefersStill()) return 0;
  const photo =
    from ?? button.closest(".product-card")?.querySelector<HTMLImageElement>(".product-card__photo img");
  if (!photo) return 0;

  const start = photo.getBoundingClientRect();
  const bagButton = document.querySelector<HTMLElement>("[data-cart-button]");
  const bag = bagButton?.getBoundingClientRect();
  const bagVisible = !!bag && bag.bottom > 0 && bag.top < window.innerHeight;
  // Scrolled down past the header: head for the top right corner instead.
  const end = bagVisible
    ? { x: bag.left + bag.width / 2, y: bag.top + bag.height / 2 }
    : { x: window.innerWidth - 40, y: 24 };

  const ghost = document.createElement("img");
  ghost.src = photo.currentSrc || photo.src;
  ghost.alt = "";
  ghost.setAttribute("aria-hidden", "true");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${start.left}px`,
    top: `${start.top}px`,
    width: `${start.width}px`,
    height: `${start.height}px`,
    objectFit: "cover",
    borderRadius: "10px",
    zIndex: "60",
    pointerEvents: "none",
    boxShadow: "0 18px 40px rgb(74 20 32 / 0.3)",
  });
  document.body.appendChild(ghost);

  const dx = end.x - (start.left + start.width / 2);
  const dy = end.y - (start.top + start.height / 2);
  // Different easings for across and up give the flight a curve.
  gsap
    .timeline({ onComplete: () => ghost.remove() })
    .to(ghost, { x: dx, duration: FLIGHT_S, ease: "power1.in" }, 0)
    .to(ghost, { y: dy, duration: FLIGHT_S, ease: "back.in(1.4)" }, 0)
    .to(ghost, { scale: 0.08, borderRadius: "50%", duration: FLIGHT_S, ease: "power2.in" }, 0)
    .to(ghost, { opacity: 0, duration: 0.15 }, FLIGHT_S - 0.12);

  // Hearts from the button, using the cart's existing heart-float animation.
  const origin = button.getBoundingClientRect();
  for (let i = 0; i < 5; i++) {
    const heart = document.createElement("span");
    heart.textContent = "♡";
    heart.className = "heart-float";
    heart.setAttribute("aria-hidden", "true");
    Object.assign(heart.style, {
      position: "fixed",
      left: `${origin.left + origin.width / 2 - 8}px`,
      top: `${origin.top - 4}px`,
      zIndex: "60",
      pointerEvents: "none",
      color: "var(--color-cherry)",
      fontSize: `${16 + Math.random() * 8}px`,
      animationDelay: `${i * 60}ms`,
    });
    heart.style.setProperty("--dx", `${(Math.random() - 0.5) * 120}px`);
    heart.style.setProperty("--rot", `${(Math.random() - 0.5) * 50}deg`);
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1300);
  }

  if (bagVisible && bagButton) {
    gsap.fromTo(
      bagButton,
      { scale: 1 },
      { scale: 1.3, duration: 0.14, yoyo: true, repeat: 1, delay: FLIGHT_S - 0.05, ease: "power2.out", clearProps: "transform" },
    );
  }
  return FLIGHT_S * 1000 + 120;
}
