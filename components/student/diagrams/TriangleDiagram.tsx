// Draws a scalene triangle with a dashed altitude line from the apex to
// the base, and a small right-angle marker where the altitude meets it —
// deliberately not a right triangle, so "height" reads as its own concept
// rather than looking like "just multiply the two sides".

const VIEWBOX_W = 220;
const VIEWBOX_H = 200;
const MAX_BASE_PX = 160;
const MAX_HEIGHT_PX = 120;
const ORIGIN = { x: 30, y: 170 };
const FOOT_FRACTION = 0.4; // where the altitude's foot sits along the base

export function TriangleDiagram({ base, height }: { base: number; height: number }) {
  const scale = Math.min(MAX_BASE_PX / base, MAX_HEIGHT_PX / height);
  const baseWidthPx = base * scale;
  const heightPx = height * scale;

  const A = { x: ORIGIN.x, y: ORIGIN.y };
  const B = { x: ORIGIN.x + baseWidthPx, y: ORIGIN.y };
  const F = { x: ORIGIN.x + baseWidthPx * FOOT_FRACTION, y: ORIGIN.y };
  const C = { x: F.x, y: ORIGIN.y - heightPx };

  const markerSize = 10;

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
      className="mx-auto h-auto w-full max-w-[220px]"
      role="img"
      aria-label={`Triangle diagram with base ${base} and height ${height}`}
    >
      {/* triangle outline */}
      <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="#CFE4F2" fillOpacity={0.35} stroke="#1C2541" strokeWidth={3} strokeLinejoin="round" />

      {/* dashed altitude */}
      <line x1={C.x} y1={C.y} x2={F.x} y2={F.y} stroke="#2E6F9E" strokeWidth={2} strokeDasharray="5 4" />

      {/* right-angle marker at the foot of the altitude */}
      <path
        d={`M ${F.x - markerSize} ${F.y} L ${F.x - markerSize} ${F.y - markerSize} L ${F.x} ${F.y - markerSize}`}
        fill="none"
        stroke="#2E6F9E"
        strokeWidth={2}
      />

      {/* labels */}
      <text x={(A.x + B.x) / 2} y={ORIGIN.y + 20} fontSize={13} fill="#1C2541" textAnchor="middle">
        {base} cm
      </text>
      <text x={F.x + 8} y={(C.y + F.y) / 2} fontSize={13} fill="#2E6F9E" textAnchor="start">
        {height} cm
      </text>
    </svg>
  );
}
