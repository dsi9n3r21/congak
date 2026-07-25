// Draws a pair of lines for classification: parallel (two offset segments
// with matching arrow ticks — the standard textbook notation for
// "parallel"), or two lines crossing through a shared centre point
// (perpendicular gets a right-angle square marker, same convention as
// AngleDiagram; any other crossing angle gets no marker, since only a
// right angle has a special mark in the real textbook).

const VIEWBOX = 220;
const CENTER = { x: 110, y: 110 };
const HALF_LEN = 85;

function toPoint(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER.x + radius * Math.cos(rad), y: CENTER.y - radius * Math.sin(rad) };
}

export function LinePairDiagram({
  relationship,
  angleDeg,
}: {
  relationship: "parallel" | "perpendicular" | "neither";
  /** Angle of the second line from horizontal, 0-180. Ignored for "parallel". */
  angleDeg: number;
}) {
  if (relationship === "parallel") {
    return (
      <svg
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        className="mx-auto h-auto w-full max-w-[220px]"
        role="img"
        aria-label="Two parallel lines"
      >
        <line x1={20} y1={70} x2={200} y2={70} stroke="#1C2541" strokeWidth={3} strokeLinecap="round" />
        <line x1={20} y1={150} x2={200} y2={150} stroke="#1C2541" strokeWidth={3} strokeLinecap="round" />
        <path d="M 100 64 L 112 70 L 100 76" fill="none" stroke="#2E6F9E" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 100 144 L 112 150 L 100 156" fill="none" stroke="#2E6F9E" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  const lineAStart = toPoint(180, HALF_LEN);
  const lineAEnd = toPoint(0, HALF_LEN);
  const lineBStart = toPoint(180 + angleDeg, HALF_LEN);
  const lineBEnd = toPoint(angleDeg, HALF_LEN);
  const isPerpendicular = relationship === "perpendicular";

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      className="mx-auto h-auto w-full max-w-[220px]"
      role="img"
      aria-label={`Two lines crossing at ${angleDeg} degrees`}
    >
      <line x1={lineAStart.x} y1={lineAStart.y} x2={lineAEnd.x} y2={lineAEnd.y} stroke="#1C2541" strokeWidth={3} strokeLinecap="round" />
      <line x1={lineBStart.x} y1={lineBStart.y} x2={lineBEnd.x} y2={lineBEnd.y} stroke="#1C2541" strokeWidth={3} strokeLinecap="round" />
      {isPerpendicular && (
        <path
          d={`M ${CENTER.x + 14} ${CENTER.y} L ${CENTER.x + 14} ${CENTER.y - 14} L ${CENTER.x} ${CENTER.y - 14}`}
          fill="none"
          stroke="#2E6F9E"
          strokeWidth={2.5}
        />
      )}
      <circle cx={CENTER.x} cy={CENTER.y} r={3} fill="#1C2541" />
    </svg>
  );
}
