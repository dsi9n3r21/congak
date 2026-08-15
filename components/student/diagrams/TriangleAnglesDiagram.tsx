// Draws a triangle with two known interior angles labeled and the third
// (the one being solved for) marked "?". Deliberately a different shape
// from TriangleDiagram (which shows base/height for area) — this one is
// about the three angles, not the sides, so it's drawn closer to
// equilateral-looking with angle arcs at each vertex instead.

const VIEWBOX_W = 220;
const VIEWBOX_H = 200;
const A = { x: 30, y: 175 };
const B = { x: 190, y: 175 };
const C = { x: 105, y: 25 };
const ARC_RADIUS = 26;

function angleAt(vertex: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }) {
  const a1 = Math.atan2(-(p1.y - vertex.y), p1.x - vertex.x);
  const a2 = Math.atan2(-(p2.y - vertex.y), p2.x - vertex.x);
  return { a1: (a1 * 180) / Math.PI, a2: (a2 * 180) / Math.PI };
}

function toPoint(vertex: { x: number; y: number }, angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: vertex.x + radius * Math.cos(rad), y: vertex.y - radius * Math.sin(rad) };
}

function labelPoint(vertex: { x: number; y: number }, a1: number, a2: number, radius: number) {
  let mid = (a1 + a2) / 2;
  if (Math.abs(a1 - a2) > 180) mid += 180; // take the short way round
  return toPoint(vertex, mid, radius);
}

export function TriangleAnglesDiagram({ angleA, angleB }: { angleA: number; angleB: number }) {
  const anglesA = angleAt(A, B, C);
  const anglesB = angleAt(B, C, A);
  const anglesC = angleAt(C, A, B);

  const labelA = labelPoint(A, anglesA.a1, anglesA.a2, ARC_RADIUS + 10);
  const labelB = labelPoint(B, anglesB.a1, anglesB.a2, ARC_RADIUS + 10);
  const labelC = labelPoint(C, anglesC.a1, anglesC.a2, ARC_RADIUS + 6);

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
      className="mx-auto h-auto w-full max-w-[220px]"
      role="img"
      aria-label={`Triangle with two known angles ${angleA} degrees and ${angleB} degrees, third angle unknown`}
    >
      <polygon
        points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
        fill="#CFE4F2"
        fillOpacity={0.35}
        stroke="#1C2541"
        strokeWidth={3}
        strokeLinejoin="round"
      />

      <text x={labelA.x} y={labelA.y} fontSize={14} fill="#2E6F9E" textAnchor="middle" dominantBaseline="middle" fontWeight={700}>
        {angleA}°
      </text>
      <text x={labelB.x} y={labelB.y} fontSize={14} fill="#2E6F9E" textAnchor="middle" dominantBaseline="middle" fontWeight={700}>
        {angleB}°
      </text>
      <text x={labelC.x} y={labelC.y} fontSize={14} fill="#C0392B" textAnchor="middle" dominantBaseline="middle" fontWeight={700}>
        ?
      </text>
    </svg>
  );
}
