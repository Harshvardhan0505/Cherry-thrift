'use client';

// The home page's opening section: the skirt-rail photo cut into the wall,
// the rail of skirts and the blossom branch, with "Thrifted, not basic" set
// between the wall and the rail. Each layer drifts at its own speed as the
// page scrolls, so the line sinks behind the skirts. Lenis smooths the scroll.
//
// Adapted from Osmo's parallax resource: uses `lenis` (the renamed
// `@studio-freight/lenis`), cleans up its ticker on unmount, and stays still
// for reduced motion.

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

// Back to front. Each moves by a share of its own height, so the numbers
// aren't comparable directly: the text layer is one screen tall and the
// photo layers about 1.4 screens. In pixels the text drops about twice as far
// as the rail (0.75 × 1 vs 0.25 × 1.4 screens), which tucks it behind the
// hangers and skirts.
const LAYERS = [
  { layer: "1", yPercent: 70 },
  { layer: "2", yPercent: 75 },
  { layer: "3", yPercent: 25 },
  { layer: "4", yPercent: 10 }
];

// Each layer is taller than the section and starts above it, leaving room to drift down.
const layerBox = "pointer-events-none absolute left-0 top-[-17.5%] h-[117.5%] w-full";

// Each word clips its letters as they rise; a little room below and to the
// right keeps descenders and the italic's lean from being cut off.
const wordMask = "-mb-[0.14em] -mr-[0.08em] inline-block overflow-hidden pb-[0.14em] pr-[0.08em] align-bottom";

// The opening line's letters, rising in turn. It's CSS rather than GSAP, so it
// plays as soon as the page appears, before the JavaScript has loaded.
function Letters({ text, start }: { text: string; start: number }) {
  return text.split("").map((char, i) => (
    <span
      key={i}
      className={`hero-char ${char === "," ? "-ml-[0.03em]" : ""}`}
      style={{ "--i": start + i } as React.CSSProperties}
    >
      {char}
    </span>
  ));
}

export function ParallaxComponent() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const triggerElement = parallaxRef.current?.querySelector('[data-parallax-layers]');
    let tl: gsap.core.Timeline | null = null;

    if (triggerElement) {
      tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: "0% 0%",
          end: "100% 0%",
          scrub: 0
        }
      });

      LAYERS.forEach((layerObj, idx) => {
        tl!.to(
          triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
          {
            yPercent: layerObj.yPercent,
            ease: "none"
          },
          idx === 0 ? undefined : "<"
        );
      });
    }

    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => { lenis.raf(time * 1000); };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      // Only this section's own scroll effect: the page has others (the card reveals).
      tl?.scrollTrigger?.kill();
      tl?.kill();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return (
    // The wall's own colour behind everything, so nothing flashes while the photos load.
    <div className="relative w-full overflow-hidden bg-[#69644d]" ref={parallaxRef}>
      <section aria-labelledby="parallax-title" className="relative z-[2] flex min-h-svh items-center justify-center px-[1em]">
        <div className="absolute left-0 top-0 h-[120%] w-full">
          <div data-parallax-layers className="absolute inset-0 overflow-hidden">
            <div data-parallax-layer="1" className={layerBox}>
              <Image src="/photos/rail-wall.webp" alt="" fill sizes="100vw" loading="eager" fetchPriority="high" className="object-cover" />
            </div>
            {/* Starts below the site header and is sized so the whole line fits on
                the wall above the rail (about a quarter of the way down) at any
                screen height; it only sinks behind the rail once you scroll. */}
            <div
              data-parallax-layer="2"
              className="absolute left-0 top-0 flex h-svh w-full justify-center px-4 pt-[max(104px,13.5svh)] md:pt-[max(96px,10.5svh)]"
            >
              <h1
                id="parallax-title"
                className="relative whitespace-nowrap text-center font-serif text-[length:min(11vw,6svh)] leading-none text-blush md:text-[length:min(8vw,11svh)]"
              >
                <span className="sr-only">Thrifted, not basic</span>
                {/* The letters rise in from behind each word, and "not basic"
                    follows after a beat. The comma is pulled in tight to
                    "Thrifted"; the switch to italic carries the pause instead. */}
                <span aria-hidden="true">
                  <span className={wordMask}><Letters text="Thrifted," start={0} /></span>{" "}
                  <em className="text-petal">
                    <span className={wordMask}><Letters text="not" start={13} /></span>{" "}
                    <span className={wordMask}><Letters text="basic" start={16} /></span>
                  </em>
                </span>
              </h1>
            </div>
            <div data-parallax-layer="3" className={layerBox}>
              <Image
                src="/photos/rail-skirts.webp"
                alt="Long skirts in cream, navy polka dot, grey, red gingham, blush, cherry red and sage on a wooden rail"
                fill
                sizes="100vw"
                loading="eager"
                fetchPriority="high"
                className="object-cover"
              />
            </div>
            <div data-parallax-layer="4" className={layerBox}>
              <Image src="/photos/rail-blossom.webp" alt="" fill sizes="100vw" loading="eager" className="object-cover" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
