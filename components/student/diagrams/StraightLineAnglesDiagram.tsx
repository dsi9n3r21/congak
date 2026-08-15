// Draws a horizontal straight line with a single ray rising from a point
// on it, splitting the line into two angles that must sum to 180°. The
// given angle is labeled with its degree value; the angle being solved
// for is marked "?" — same convention as AnglesAtPointDiagram's unknown
// sector, so the two "find the missing angle" topics read consistently.

const VIEWBOX_W = 260;
const VIEWBOX_H = 150;
const VERTEX = { x: 130, y: 120 };
const LINE_HALF_LENGTH = 100;
const RAY_LENGTH = 90;
const ARC_RADIUS = 34;
const LABEL_RADIUS = 55;

function toPoint(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: VERTEX.x + radius * Math.cos(rad),
    y: VERTEX.y - radius * Math.sin(rad),
  };
}

function arcPath(fromDeg: number, toDeg: number, radius: number) {
  const start = toPoint(fromDeg, radius);
  const end = toPoint(toDeg, radius);
  const largeArcFlag = toDeg - fromDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export function StraightLineAnglesDiagram({ angleA }: { angleA: number }) {
  // The straight line runs along 0°–180°. The ray splits it into angleA
  // (0° to angleA) and the unknown (angleA to 180°).
  const rayEnd = toPoint(angleA, RAY_LENGTH);
  const angleB = 180 - angleA;

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
      className="mx-auto h-auto w-full max-w-[260px]"
      role="img"
      aria-label={`Straight line split into two angles: ${angleA} degrees and an unknown angle`}
    >
      {/* the straight line */}
      <line
        x1={VERTEX.x - LINE_HALF_LENGTH}
        y1={VERTEX.y}
        x2={VERTEX.x + LINE_HALF_LENGTH}
        y2={VERTEX.y}
        stroke="#1C2541"
        strokeWidth={3}
        strokeLinecap="round"
      />

      {/* the ray splitting it */}
      <line x1={VERTEX.x} y1={VERTEX.y} x2={rayEnd.x} y2={rayEnd.y} stroke="#1C2541" strokeWidth={3} strokeLinecap="round" />

      {/* two angle arcs */}
      <path d={arcPath(0, angleA, ARC_RADIUS)} fill="none" stroke="#2E6F9E" strokeWidth={2.5} />
      <path d={arcPath(angleA, 180, ARC_RADIUS)} fill="none" stroke="#C0392B" strokeWidth={2.5} strokeDasharray="4 3" />

      {/* labels */}
      <text
        x={toPoint(angleA / 2, LABEL_RADIUS).x}
        y={toPoint(angleA / 2, LABEL_RADIUS).y}
        fontSize={14}
        fill="#2E6F9E"
        textAnchor="middle"
        dominantBaseline="middle"
        fontWeight={700}
      >
        {angleA}°
      </text>
      <text
        x={toPoint(angleA + angleB / 2, LABEL_RADIUS).x}
        y={toPoint(angleA + angleB / 2, LABEL_RADIUS).y}
        fontSize={14}
        fill="#C0392B"
        textAnchor="middle"
        dominantBaseline="middle"
        fontWeight={700}
      >
        ?
      </text>

      {/* vertex dot */}
      <circle cx={VERTEX.x} cy={VERTEX.y} r={3.5} fill="#1C2541" />
    </svg>
  );
}
