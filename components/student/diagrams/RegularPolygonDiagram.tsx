// Draws a regular polygon with `sides` sides, inscribed in a circle, with
// one interior angle marked by a small arc and labeled with its degree
// value. Works for any side count >= 3 without special-casing — vertex
// positions come straight from evenly dividing 360° by the side count.

const VIEWBOX = 220;
const CENTER = { x: 110, y: 110 };
const RADIUS = 80;
const ARC_RADIUS = 18;

function vertex(i: number, sides: number) {
  // Start at the top and go clockwise, matching how polygons are usually drawn.
  const angle = -90 + (360 / sides) * i;
  const rad = (angle * Math.PI) / 180;
  return { x: CENTER.x + RADIUS * Math.cos(rad), y: CENTER.y + RADIUS * Math.sin(rad) };
}

export function RegularPolygonDiagram({ sides, eachAngle }: { sides: number; eachAngle: number }) {
  const points = Array.from({ length: sides }, (_, i) => vertex(i, sides));
  const pointsStr = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Mark the interior angle at vertex 0, between the edges to vertex
  // (sides-1) and vertex 1.
  const v0 = points[0];
  const prev = points[sides - 1];
  const next = points[1];
  const toPrevAngle = (Math.atan2(prev.y - v0.y, prev.x - v0.x) * 180) / Math.PI;
  const toNextAngle = (Math.atan2(next.y - v0.y, next.x - v0.x) * 180) / Math.PI;

  function toPoint(fromAngleDeg: number, radius: number) {
    const rad = (fromAngleDeg * Math.PI) / 180;
    return { x: v0.x + radius * Math.cos(rad), y: v0.y + radius * Math.sin(rad) };
  }
  const arcStart = toPoint(toPrevAngle, ARC_RADIUS);
  const arcEnd = toPoint(toNextAngle, ARC_RADIUS);
  let sweep = toNextAngle - toPrevAngle;
  if (sweep < 0) sweep += 360;
  const largeArcFlag = sweep > 180 ? 1 : 0;
  const labelMid = toPoint(toPrevAngle + sweep / 2, ARC_RADIUS + 16);

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      className="mx-auto h-auto w-full max-w-[240px]"
      role="img"
      aria-label={`Regular polygon with ${sides} sides, one interior angle marked ${eachAngle} degrees`}
    >
      <polygon points={pointsStr} fill="#CFE4F2" fillOpacity={0.35} stroke="#1C2541" strokeWidth={3} strokeLinejoin="round" />

      <path
        d={`M ${arcStart.x} ${arcStart.y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 ${largeArcFlag} 1 ${arcEnd.x} ${arcEnd.y}`}
        fill="none"
        stroke="#C0392B"
        strokeWidth={2.5}
      />
      <text x={labelMid.x} y={labelMid.y} fontSize={15} fill="#C0392B" textAnchor="middle" dominantBaseline="middle" fontWeight={700}>
        {eachAngle}°
      </text>
    </svg>
  );
}
