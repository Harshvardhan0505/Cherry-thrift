// A pair of cherries on a stem, with a leaf.
export function CherryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M16 4c-1 6-5 11-8.5 14.5M16 4c1.5 6 4 10.5 7.5 13.5"
        fill="none"
        stroke="#5f7a4f"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <path d="M16 4c3-3 8-3 10 0-3 2.5-7 2.5-10 0Z" fill="#7d9a6a" />
      <circle cx="8" cy="22" r="6" fill="#b5123e" />
      <circle cx="23.5" cy="21" r="6" fill="#c8204d" />
      <circle cx="6" cy="20" r="1.6" fill="#fff" opacity={0.55} />
      <circle cx="21.5" cy="19" r="1.6" fill="#fff" opacity={0.55} />
    </svg>
  );
}
