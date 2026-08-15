// Draws the two component rectangles of a composite-area/composite-volume
// problem side by side, each labeled with its own dimensions. Deliberately
// NOT fused into a single interlocking L-polygon: the two rectangles come
// from independent randInt draws (lib/questions/generators/areaComposite.ts),
// so their heights don't reliably line up into a valid L-shape. Showing
// them side by side with a "+" between still matches this topic's own
// pedagogy exactly — "split into rectangle A and rectangle B, find each
// area separately, then add" — without inventing a geometrically invalid
// fused shape.

const GAP_PX = 40;
const MAX_DIM_PX = 110;
const PADDING = 30;

export interface RectanglePart {
  width: number;
  height: number;
  label: string;
}

export function TwoRectanglesDiagram({ a, b }: { a: RectanglePart; b: RectanglePart }) {
  const scale = Math.min(MAX_DIM_PX / Math.max(a.width, b.width), MAX_DIM_PX / Math.max(a.height, b.height));
  const aW = a.width * scale;
  const aH = a.height * scale;
  const bW = b.width * scale;
  const bH = b.height * scale;

  const baseline = PADDING + Math.max(aH, bH);
  const aX = PADDING;
  const aY = baseline - aH;
  const bX = aX + aW + GAP_PX;
  const bY = baseline - bH;

  const viewBoxW = bX + bW + PADDING;
  const viewBoxH = baseline + PADDING;
  const plusX = aX + aW + GAP_PX / 2;
  const plusY = baseline - Math.max(aH, bH) / 2;

  return (
    <svg
      viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
      className="mx-auto h-auto w-full max-w-[280px]"
      role="img"
      aria-label={`${a.label}: ${a.width} by ${a.height}. ${b.label}: ${b.width} by ${b.height}.`}
    >
      <rect x={aX} y={aY} width={aW} height={aH} fill="#CFE4F2" fillOpacity={0.35} stroke="#1C2541" strokeWidth={3} />
      <rect x={bX} y={bY} width={bW} height={bH} fill="#FCE8D8" fillOpacity={0.5} stroke="#1C2541" strokeWidth={3} />

      <text x={plusX} y={plusY} fontSize={20} fill="#1C2541" textAnchor="middle" dominantBaseline="middle" fontWeight={700}>
        +
      </text>

      <text x={aX + aW / 2} y={baseline + 16} fontSize={12} fill="#2E6F9E" textAnchor="middle" fontWeight={700}>
        {a.label}: {a.width}×{a.height}
      </text>
      <text x={bX + bW / 2} y={baseline + 16} fontSize={12} fill="#2E6F9E" textAnchor="middle" fontWeight={700}>
        {b.label}: {b.width}×{b.height}
      </text>
    </svg>
  );
}
