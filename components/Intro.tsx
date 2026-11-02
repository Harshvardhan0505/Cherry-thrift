import { IntroDone } from "./motion/IntroDone";

// The home page's opening: a blush screen where a cherry draws itself in,
// then the screen parts like curtains onto the hero. Pure CSS (globals.css),
// so it covers the page from the first paint; it's skipped once seen in this
// visit, and for people who turn off motion. It never blocks clicks.
export function Intro() {
  return (
    <div className="intro" aria-hidden="true">
      <div className="intro__panel intro__panel--left" />
      <div className="intro__panel intro__panel--right" />
      <div className="intro__mark">
        <svg viewBox="0 0 64 64" width="76" height="76" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <g className="intro__lines" stroke="var(--color-cherry)" strokeWidth="2.2">
            <path pathLength={1} d="M33 9c-3 11-8 21-14 27" />
            <path pathLength={1} d="M33 9c3 11 8 20 13 25" />
            <path pathLength={1} d="M33 9c5-5 13-5 18 0-6 3-13 3-18 0Z" />
            <circle pathLength={1} cx="18" cy="45" r="9.5" />
            <circle pathLength={1} cx="46" cy="43" r="9.5" />
          </g>
          <g className="intro__fill" fill="var(--color-cherry)">
            <circle cx="18" cy="45" r="9.5" />
            <circle cx="46" cy="43" r="9.5" />
          </g>
        </svg>
        <p className="intro__name">Cherry Thrifts</p>
      </div>
      <IntroDone />
    </div>
  );
}
