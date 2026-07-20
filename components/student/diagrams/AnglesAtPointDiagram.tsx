// Draws three angles meeting at a single point, arranged around a full
// circle (360°). Two sectors are labeled with their given degree values;
// the third (whatever's left of the 360°) is marked "?" — this is exactly
// what the question asks the student to find. Same arc-sweep technique as
// AngleDiagram: large-arc-flag = sector > 180°, sweep-flag = 0 always.

const VIEWBOX = 220;
const CENTER = { x: 110, y: 110 };
const RAY_LENGTH = 85;
const ARC_RADIUS = 32;
const LABEL_RADIUS = 52;

function toPoint(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER.x + radius * Math.cos(rad),
    y: CENTER.y - radius * Math.sin(rad),
  };
}

function arcPath(fromDeg: number, toDeg: number, radius: number) {
  const start = toPoint(fromDeg, radius);
  const end = toPoint(toDeg, radius);
  const span = toDeg - fromDeg;
  const largeArcFlag = span > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function midLabel(fromDeg: number, toDeg: number, radius: number, text: string, color: string) {
  const mid = (fromDeg + toDeg) / 2;
  const p = toPoint(mid, radius);
  return (
    <text x={p.x} y={p.y} fontSize={14} fill={color} textAnchor="middle" dominantBaseline="middle" fontWeight={700}>
      {text}
    </text>
  );
}

export function AnglesAtPointDiagram({ angleA, angleB }: { angleA: number; angleB: number }) {
  const rA = angleA; // boundary between sector 1 (a) and sector 2 (b)
  const rB = angleA + angleB; // boundary between sector 2 (b) and sector 3 (unknown)

  const rays = [0, rA, rB];

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      className="mx-auto h-auto w-full max-w-[220px]"
      role="img"
      aria-label={`Three angles meeting at a point: ${angleA} degrees, ${angleB} degrees, and an unknown angle`}
    >
      {/* rays */}
      {rays.map((deg) => {
        const end = toPoint(deg, RAY_LENGTH);
        return <line key={deg} x1={CENTER.x} y1={CENTER.y} x2={end.x} y2={end.y} stroke="#1C2541" strokeWidth={3} strokeLinecap="round" />;
      })}

      {/* sector arcs */}
      <path d={arcPath(0, rA, ARC_RADIUS)} fill="none" stroke="#2E6F9E" strokeWidth={2.5} />
      <path d={arcPath(rA, rB, ARC_RADIUS)} fill="none" stroke="#2E6F9E" strokeWidth={2.5} />
      <path d={arcPath(rB, 360, ARC_RADIUS)} fill="none" stroke="#C0392B" strokeWidth={2.5} strokeDasharray="4 3" />

      {/* labels */}
      {midLabel(0, rA, LABEL_RADIUS, `${angleA}°`, "#2E6F9E")}
      {midLabel(rA, rB, LABEL_RADIUS, `${angleB}°`, "#2E6F9E")}
      {midLabel(rB, 360, LABEL_RADIUS, "?", "#C0392B")}

      {/* center dot */}
      <circle cx={CENTER.x} cy={CENTER.y} r={3.5} fill="#1C2541" />
    </svg>
  );
}
