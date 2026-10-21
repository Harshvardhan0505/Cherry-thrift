// A skinny satin ribbon bow: open loops, a wrapped knot and long V-cut
// tails, with a soft sheen. `id` keeps its gradients apart from any other bow
// on the page.
const TONES = {
  pink: { hi: "#fff5f7", light: "#ffd6e0", mid: "#f3a0b6", deep: "#cf5a79", edge: "#b44463" },
  cherry: { hi: "#ff9db4", light: "#f2577b", mid: "#c9123f", deep: "#86092f", edge: "#6e0826" },
};

const LOOP_LEFT = "M77 47 C62 30 38 13 21 19 C5 25 7 58 25 63 C42 68 63 60 77 56 Z M72 50 C58 39 40 28 30 31 C19 35 21 52 31 54 C44 56 60 53 72 52 Z";
const LOOP_RIGHT = "M 83 47 C 98 30 122 13 139 19 C 155 25 153 58 135 63 C 118 68 97 60 83 56 Z M 88 50 C 102 39 120 28 130 31 C 141 35 139 52 129 54 C 116 56 100 53 88 52 Z";
const TWIST_LEFT = "M77 47 C70 50 70 54 77 56 C73 52 73 50 77 47 Z";
const TWIST_RIGHT = "M 83 47 C 90 50 90 54 83 56 C 87 52 87 50 83 47 Z";
const TAIL_LEFT =
  "M75 57 C67 80 74 101 60 121 C53 131 47 141 42 158 L51 151 L55 160 C57 144 63 134 69 124 C83 101 76 80 84 59 Z";
const TAIL_RIGHT =
  "M85 57 C95 82 89 104 104 125 C111 135 118 144 125 158 L115 152 L110 160 C108 144 101 135 95 127 C81 104 87 82 77 59 Z";
const KNOT = "M72.5 43 C77 40 83 40 87.5 43 C90 49 90 57 87.5 63 C83 66 77 66 72.5 63 C70 57 70 49 72.5 43 Z";

export function RibbonBow({
  id,
  tone = "pink",
  className,
  style,
}: {
  id: string;
  tone?: keyof typeof TONES;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { hi, light, mid, deep, edge } = TONES[tone];
  const sheen = (
    <>
      <stop offset="0" stopColor={mid} />
      <stop offset=".3" stopColor={light} />
      <stop offset=".45" stopColor={hi} />
      <stop offset=".62" stopColor={mid} />
      <stop offset="1" stopColor={deep} />
    </>
  );
  return (
    <svg viewBox="0 0 160 164" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-a`} x1="0" y1="0" x2="1" y2="1">
          {sheen}
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="1" y1="0" x2="0" y2="1">
          {sheen}
        </linearGradient>
        <linearGradient id={`${id}-t`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={deep} />
          <stop offset=".22" stopColor={mid} />
          <stop offset=".42" stopColor={light} />
          <stop offset=".55" stopColor={hi} />
          <stop offset=".7" stopColor={mid} />
          <stop offset=".86" stopColor={light} />
          <stop offset="1" stopColor={mid} />
        </linearGradient>
        <linearGradient id={`${id}-k`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={deep} />
          <stop offset=".45" stopColor={light} />
          <stop offset=".6" stopColor={hi} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
      </defs>
      <g stroke={edge} strokeWidth={0.8} strokeLinejoin="round">
        <path d={TAIL_LEFT} fill={`url(#${id}-t)`} />
        <path d={TAIL_RIGHT} fill={`url(#${id}-t)`} />
        <path d={LOOP_LEFT} fill={`url(#${id}-a)`} fillRule="evenodd" />
        <path d={LOOP_RIGHT} fill={`url(#${id}-b)`} fillRule="evenodd" />
        <path d={TWIST_LEFT} fill={deep} stroke="none" opacity={0.5} />
        <path d={TWIST_RIGHT} fill={deep} stroke="none" opacity={0.5} />
        <path d={KNOT} fill={`url(#${id}-k)`} />
      </g>
      <g fill="none" stroke="#fff" strokeLinecap="round">
        <path d="M27 22 C38 19 52 27 63 37" strokeWidth={2} opacity={0.6} />
        <path d="M133 22 C122 19 108 27 97 37" strokeWidth={2} opacity={0.45} />
        <path d="M75.5 45 C77.5 51 77.5 57 75.5 62" strokeWidth={1.4} opacity={0.55} />
        <path d="M70 92 C71 102 67 112 61 121" strokeWidth={1.5} opacity={0.4} />
        <path d="M90 92 C89 103 93 113 99 122" strokeWidth={1.5} opacity={0.3} />
      </g>
    </svg>
  );
}
