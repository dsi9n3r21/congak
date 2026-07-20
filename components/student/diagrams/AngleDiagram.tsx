// Draws a single angle as two rays from a shared vertex, with an arc marking
// the angle between them. Works for acute/right/obtuse/reflex without special
// casing: ray A is fixed at 0°, ray B is at `degrees`, and the arc is traced
// by sweeping from A to B — the SVG large-arc-flag naturally becomes 1 once
// degrees passes 180°, which is exactly what a reflex angle looks like.
//
// Convention: angle 0° = pointing right (3 o'clock), increasing
// counterclockwise, matching how angles are normally drawn in textbooks.

const VIEWBOX = 220;
const VERTEX = { x: 40, y: 180 };
const RAY_LENGTH = 150;
const ARC_RADIUS = 42;

function toPoint(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: VERTEX.x + radius * Math.cos(rad),
    y: VERTEX.y - radius * Math.sin(rad),
  };
}

export function AngleDiagram({ degrees }: { degrees: number }) {
  const rayAEnd = toPoint(0, RAY_LENGTH);
  const rayBEnd = toPoint(degrees, RAY_LENGTH);
  const arcStart = toPoint(0, ARC_RADIUS);
  const arcEnd = toPoint(degrees, ARC_RADIUS);
  const largeArcFlag = degrees > 180 ? 1 : 0;
  const isRightAngle = degrees === 90;

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      className="mx-auto h-auto w-full max-w-[220px]"
      role="img"
      aria-label={`Angle diagram showing ${degrees} degrees`}
    >
      {/* rays */}
      <line x1={VERTEX.x} y1={VERTEX.y} x2={rayAEnd.x} y2={rayAEnd.y} stroke="#1C2541" strokeWidth={3} strokeLinecap="round" />
      <line x1={VERTEX.x} y1={VERTEX.y} x2={rayBEnd.x} y2={rayBEnd.y} stroke="#1C2541" strokeWidth={3} strokeLinecap="round" />

      {/* angle marker: small square for exactly 90°, arc otherwise */}
      {isRightAngle ? (
        <path
          d={`M ${VERTEX.x + 16} ${VERTEX.y} L ${VERTEX.x + 16} ${VERTEX.y - 16} L ${VERTEX.x} ${VERTEX.y - 16}`}
          fill="none"
          stroke="#2E6F9E"
          strokeWidth={2.5}
        />
      ) : (
        <path
          d={`M ${arcStart.x} ${arcStart.y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 ${largeArcFlag} 0 ${arcEnd.x} ${arcEnd.y}`}
          fill="none"
          stroke="#2E6F9E"
          strokeWidth={2.5}
        />
      )}

      {/* vertex dot */}
      <circle cx={VERTEX.x} cy={VERTEX.y} r={3.5} fill="#1C2541" />
    </svg>
  );
}
