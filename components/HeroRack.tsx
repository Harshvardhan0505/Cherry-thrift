const HANGER = "#33141C";
const INK = "#3B0A18";

// Rail centre line and the top of each skirt's waistband, in viewBox units.
const RAIL_Y = 60;
const WAIST_Y = 86;
const WAIST = 58;

type Skirt = {
  x: number;
  color: string;
  length: number;
  flare: number;
  tilt: number;
  dots?: boolean;
  tiers?: number[];
};

const skirts: Skirt[] = [
  { x: 152, color: "#6A1B36", length: 520, flare: 150, tilt: -1.5 },
  { x: 264, color: "#FFF6EE", length: 468, flare: 136, tilt: 1, tiers: [0.36, 0.68] },
  { x: 376, color: "#C2183F", length: 552, flare: 164, tilt: -0.5 },
  { x: 488, color: "#EE7FA0", length: 498, flare: 142, tilt: 1.5 },
  { x: 600, color: "#2B1B22", length: 540, flare: 158, tilt: -1 },
  { x: 712, color: "#E4467A", length: 482, flare: 134, tilt: 0.5, dots: true },
  { x: 824, color: "#FFF1E2", length: 558, flare: 164, tilt: -1.5, tiers: [0.5] },
  { x: 936, color: "#8E2343", length: 508, flare: 146, tilt: 1 },
  { x: 1046, color: "#D9567C", length: 534, flare: 152, tilt: -0.5 },
];

const FOLDS = 6;

function skirtBody({ length, flare }: Skirt) {
  const hem = WAIST_Y + 16 + length;
  const step = (2 * flare) / FOLDS;
  const scallops = Array.from({ length: FOLDS }, () => `q ${-step / 2} 12 ${-step} 0`).join(" ");
  return [
    `M ${-WAIST} ${WAIST_Y} L ${WAIST} ${WAIST_Y} L ${WAIST + 2} ${WAIST_Y + 16}`,
    `C ${WAIST + 14} ${WAIST_Y + length * 0.4} ${flare - 10} ${WAIST_Y + length * 0.8} ${flare} ${hem}`,
    scallops,
    `C ${-flare + 10} ${WAIST_Y + length * 0.8} ${-WAIST - 14} ${WAIST_Y + length * 0.4} ${-WAIST - 2} ${WAIST_Y + 16} Z`,
  ].join(" ");
}

function HangingSkirt({ skirt, index }: { skirt: Skirt; index: number }) {
  const body = skirtBody(skirt);
  const top = WAIST_Y + 16;
  const hem = top + skirt.length;
  const clipId = `rack-clip-${index}`;

  return (
    <g transform={`translate(${skirt.x} ${RAIL_Y}) rotate(${skirt.tilt})`}>
      <path d={body} fill={INK} fillOpacity={0.14} transform="translate(12 8)" />

      {/* Hanger: hook over the rail, clip bar and two clips */}
      <path
        d="M -13 9 C -21 -27 17 -31 14 2 C 13 18 0 26 0 46 L 0 66"
        fill="none"
        stroke={HANGER}
        strokeWidth={4.5}
        strokeLinecap="round"
      />
      <path d="M -50 68 L 50 68" stroke={HANGER} strokeWidth={5} strokeLinecap="round" />

      <clipPath id={clipId}>
        <path d={body} />
      </clipPath>
      <path d={body} fill={skirt.color} />
      {skirt.dots && <path d={body} fill="url(#rack-dots)" />}
      <g clipPath={`url(#${clipId})`}>
        {Array.from({ length: FOLDS - 1 }, (_, i) => {
          const t = (i + 1) / FOLDS;
          const waistX = -WAIST + 2 * WAIST * t;
          const hemX = -skirt.flare + 2 * skirt.flare * t;
          return (
            <path
              key={i}
              d={`M ${waistX} ${top} C ${waistX} ${top + skirt.length * 0.4} ${hemX} ${top + skirt.length * 0.7} ${hemX} ${hem + 12}`}
              fill="none"
              stroke={INK}
              strokeOpacity={0.16}
              strokeWidth={3}
            />
          );
        })}
        {skirt.tiers?.map((t) => {
          const y = top + skirt.length * t;
          return (
            <path
              key={t}
              d={`M ${-skirt.flare} ${y} Q 0 ${y + 16} ${skirt.flare} ${y}`}
              fill="none"
              stroke={INK}
              strokeOpacity={0.2}
              strokeWidth={3}
            />
          );
        })}
        <path d={body} fill="url(#rack-volume)" />
      </g>
      <path
        d={`M ${-WAIST} ${WAIST_Y} L ${WAIST} ${WAIST_Y} L ${WAIST + 2} ${top} L ${-WAIST - 2} ${top} Z`}
        fill={INK}
        fillOpacity={0.18}
      />

      <rect x={-44} y={62} width={11} height={34} rx={2} fill={HANGER} />
      <rect x={33} y={62} width={11} height={34} rx={2} fill={HANGER} />
    </g>
  );
}

export function HeroRack({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 760"
      className={className}
      style={{ overflow: "visible" }}
      role="img"
      aria-label="Long skirts in shades of cherry, pink and cream hanging on a wooden rail"
    >
      <defs>
        <linearGradient id="rack-rail" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FBEAD2" />
          <stop offset="0.5" stopColor="#EDD0A6" />
          <stop offset="1" stopColor="#D6AE80" />
        </linearGradient>
        <linearGradient id="rack-volume" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.22" />
          <stop offset="0.3" stopColor="#000" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="0.72" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.24" />
        </linearGradient>
        <pattern id="rack-dots" width="34" height="34" patternUnits="userSpaceOnUse">
          <circle cx="9" cy="9" r="4.5" fill="#fff" />
          <circle cx="26" cy="26" r="4.5" fill="#fff" />
        </pattern>
      </defs>

      {/* The rail runs well past the viewBox so it always spans the page. */}
      <rect x={-4000} y={RAIL_Y + 13} width={9200} height={12} fill={INK} fillOpacity={0.08} />
      <rect x={-4000} y={RAIL_Y - 13} width={9200} height={26} fill="url(#rack-rail)" />

      {skirts.map((skirt, index) => (
        <HangingSkirt key={skirt.x} skirt={skirt} index={index} />
      ))}
    </svg>
  );
}
