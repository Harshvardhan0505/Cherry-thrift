// Shared by the animations: people who turn off motion in their settings get
// everything in place, without movement.
export const prefersStill = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Set in sessionStorage once the home page intro has played, so it only plays
// once per visit. Read by a script in the root layout before the first paint.
export const INTRO_KEY = "cherry-thrifts-intro";

// How long the intro takes, in ms (matches the CSS in globals.css).
export const INTRO_MS = 1600;
