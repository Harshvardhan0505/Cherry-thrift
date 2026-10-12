import type { ReactNode } from "react";
import type { Art } from "@/lib/products";

const INK = "#3B0A18";
const GOLD = "#E3B55F";

const shade = { fill: INK, fillOpacity: 0.16 };
const seam = {
  fill: "none",
  stroke: INK,
  strokeOpacity: 0.26,
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

type Shape = {
  // Outline that takes the fabric colour and pattern.
  body: string;
  // Drawn behind the body in the fabric colour (straps, handles, back neck).
  under?: (color: string) => ReactNode;
  // Shading, seams and trims drawn on top.
  over?: ReactNode;
};

const shapes: Record<Art["kind"], Shape> = {
  tee: {
    body: "M112 70 Q150 98 188 70 L236 90 L276 142 L242 168 L222 146 L222 300 Q150 310 78 300 L78 146 L58 168 L24 142 L64 90 Z",
    under: (color) => (
      <>
        <path d="M112 70 Q150 58 188 70 Q150 98 112 70 Z" fill={color} />
        <path d="M112 70 Q150 58 188 70 Q150 98 112 70 Z" {...shade} />
        <rect x="141" y="72" width="18" height="7" rx="1" fill="#fff" />
      </>
    ),
    over: (
      <>
        <path d="M112 70 Q150 98 188 70" {...seam} strokeWidth={5} />
        <path d="M78 146 L86 116 M222 146 L214 116" {...seam} />
        <path d="M30 136 L62 160 M270 136 L238 160" {...seam} />
        <path d="M80 290 Q150 300 220 290" {...seam} />
      </>
    ),
  },
  cami: {
    body: "M98 118 Q150 152 202 118 L210 200 L216 300 Q150 310 84 300 L90 200 Z",
    under: (color) => (
      <>
        <path
          d="M100 122 L113 48 M200 122 L187 48"
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
        />
        <path d="M100 122 L113 48 M200 122 L187 48" {...seam} />
      </>
    ),
    over: (
      <>
        <path d="M98 118 Q150 152 202 118" {...seam} strokeWidth={4} />
        <path d="M150 136 L150 300" {...seam} strokeOpacity={0.12} />
        <path d="M86 290 Q150 300 214 290" {...seam} />
      </>
    ),
  },
  longsleeve: {
    body: "M114 66 Q150 92 186 66 L232 84 L272 272 L240 280 L218 156 L218 300 Q150 308 82 300 L82 156 L60 280 L28 272 L68 84 Z",
    under: (color) => (
      <>
        <path d="M114 66 Q150 55 186 66 Q150 92 114 66 Z" fill={color} />
        <path d="M114 66 Q150 55 186 66 Q150 92 114 66 Z" {...shade} />
        <rect x="141" y="68" width="18" height="7" rx="1" fill="#fff" />
      </>
    ),
    over: (
      <>
        <path d="M114 66 Q150 92 186 66" {...seam} strokeWidth={5} />
        <path d="M82 156 L90 118 M218 156 L210 118" {...seam} />
        <path d="M31 260 L63 268 M269 260 L237 268" {...seam} />
        <path d="M84 290 Q150 298 216 290" {...seam} />
      </>
    ),
  },
  maxi: {
    body: "M106 40 L194 40 L198 56 C214 150 240 250 256 320 Q150 342 44 320 C60 250 86 150 102 56 Z",
    over: (
      <>
        <path d="M106 40 L194 40 L198 56 L102 56 Z" {...shade} />
        <path d="M126 58 C120 160 102 260 96 328" {...seam} />
        <path d="M150 58 L150 334" {...seam} />
        <path d="M174 58 C180 160 198 260 204 328" {...seam} />
        <path d="M112 58 C104 150 80 250 68 324" {...seam} strokeOpacity={0.14} />
        <path d="M188 58 C196 150 220 250 232 324" {...seam} strokeOpacity={0.14} />
      </>
    ),
  },
  mini: {
    body: "M96 106 L204 106 L207 124 C216 168 228 214 236 250 Q150 266 64 250 C72 214 84 168 93 124 Z",
    over: (
      <>
        <path d="M96 106 L204 106 L207 124 L93 124 Z" {...shade} />
        <path d="M150 124 L150 258" {...seam} />
        <path d="M104 132 Q112 152 132 154 M196 132 Q188 152 168 154" {...seam} />
        {[115, 148, 181, 214].map((y) => (
          <circle key={y} cx="150" cy={y} r="4.5" fill={GOLD} />
        ))}
      </>
    ),
  },
  pleated: {
    body: "M104 62 L196 62 L199 78 L246 296 L222 288 L198 300 L174 290 L150 302 L126 290 L102 300 L78 288 L54 296 L101 78 Z",
    over: (
      <>
        <path d="M104 62 L196 62 L199 78 L101 78 Z" {...shade} />
        <path
          d="M114 78 L78 288 M126 78 L102 300 M138 78 L126 290 M150 78 L150 302 M162 78 L174 290 M174 78 L198 300 M186 78 L222 288"
          {...seam}
        />
        <path
          d="M114 78 L78 288 L102 300 L126 78 Z M138 78 L126 290 L150 302 L150 78 Z M162 78 L174 290 L198 300 L174 78 Z M186 78 L222 288 L246 296 L199 78 Z"
          fill={INK}
          fillOpacity={0.07}
        />
      </>
    ),
  },
  shoulder: {
    body: "M70 160 L230 160 Q244 160 246 176 L254 282 Q255 302 235 302 L65 302 Q45 302 46 282 L54 176 Q56 160 70 160 Z",
    under: (color) => (
      <>
        <path
          d="M92 172 C92 38 208 38 208 172"
          fill="none"
          stroke={color}
          strokeWidth={11}
        />
        <path
          d="M92 172 C92 38 208 38 208 172"
          fill="none"
          stroke={INK}
          strokeOpacity={0.2}
          strokeWidth={11}
        />
      </>
    ),
    over: (
      <>
        <path d="M55 170 L245 170 L241 214 Q150 252 59 214 Z" {...shade} />
        <path d="M59 214 Q150 252 241 214" {...seam} />
        <path d="M56 286 Q150 294 244 286" {...seam} strokeOpacity={0.14} />
        <circle cx="150" cy="233" r="9" fill={GOLD} />
        <circle cx="150" cy="233" r="4" fill={INK} fillOpacity={0.25} />
      </>
    ),
  },
  tote: {
    body: "M52 150 L248 150 L234 312 L66 312 Z",
    under: (color) => (
      <>
        <path
          d="M96 152 C96 36 204 36 204 152"
          fill="none"
          stroke={color}
          strokeWidth={9}
        />
        <path
          d="M96 152 C96 36 204 36 204 152"
          fill="none"
          stroke={INK}
          strokeOpacity={0.28}
          strokeWidth={9}
        />
        <path
          d="M110 152 C110 62 190 62 190 152"
          fill="none"
          stroke={color}
          strokeWidth={9}
        />
        <path
          d="M110 152 C110 62 190 62 190 152"
          fill="none"
          stroke={INK}
          strokeOpacity={0.1}
          strokeWidth={9}
        />
      </>
    ),
    over: (
      <>
        <path d="M52 150 L248 150 L246 172 L54 172 Z" {...shade} />
        <path d="M68 300 L232 300" {...seam} strokeOpacity={0.14} />
        <path d="M104 150 L104 184 L116 184 L116 150 M184 150 L184 184 L196 184 L196 150" {...seam} />
      </>
    ),
  },
  straight: {
    body: "M92 28 L208 28 L210 46 L220 332 L162 332 L150 132 L138 332 L80 332 L90 46 Z",
    over: (
      <>
        <path d="M92 28 L208 28 L210 46 L90 46 Z" {...shade} />
        <path d="M150 46 L150 104 Q150 116 139 116" {...seam} />
        <path d="M96 48 Q104 82 132 86 M204 48 Q196 82 168 86" {...seam} />
        <path d="M81 320 L138 320 M162 320 L219 320" {...seam} />
        <path d="M112 26 L112 48 M188 26 L188 48" {...seam} strokeWidth={5} />
        <circle cx="150" cy="37" r="4.5" fill={GOLD} />
      </>
    ),
  },
  flare: {
    body: "M92 28 L208 28 L210 46 L208 200 L242 332 L168 332 L150 132 L132 332 L58 332 L92 200 L90 46 Z",
    over: (
      <>
        <path d="M92 28 L208 28 L210 46 L90 46 Z" {...shade} />
        <path d="M150 46 L150 104 Q150 116 139 116" {...seam} />
        <path d="M96 48 Q104 82 132 86 M204 48 Q196 82 168 86" {...seam} />
        <path d="M61 320 L133 320 M167 320 L239 320" {...seam} />
        <path d="M112 26 L112 48 M188 26 L188 48" {...seam} strokeWidth={5} />
        <circle cx="150" cy="37" r="4.5" fill={GOLD} />
      </>
    ),
  },
};

export function Garment({
  art,
  id,
  className,
}: {
  art: Art;
  id: string;
  className?: string;
}) {
  const shape = shapes[art.kind];
  const patternId = `pattern-${id}`;
  const accent = art.accent ?? "#fff";

  return (
    <svg viewBox="0 0 300 360" className={className} aria-hidden="true">
      {art.pattern === "dots" && (
        <pattern id={patternId} width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="3.5" fill={accent} />
          <circle cx="20" cy="20" r="3.5" fill={accent} />
        </pattern>
      )}
      {art.pattern === "stripes" && (
        <pattern id={patternId} width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="8" fill={accent} fillOpacity={0.75} />
        </pattern>
      )}
      {shape.under?.(art.color)}
      <path d={shape.body} fill={art.color} />
      {art.pattern && <path d={shape.body} fill={`url(#${patternId})`} />}
      {shape.over}
    </svg>
  );
}
