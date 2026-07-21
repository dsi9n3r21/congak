// Draws a circle with its radius marked as a line from the center to the
// edge, labeled with its value. Deliberately simple — this topic is about
// the circumference formula, not about circle geometry itself.

const VIEWBOX = 200;
const CENTER = { x: 100, y: 100 };
const CIRCLE_RADIUS_PX = 75;

export function CircleDiagram({ radius }: { radius: number }) {
  const edge = { x: CENTER.x + CIRCLE_RADIUS_PX, y: CENTER.y };

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      className="mx-auto h-auto w-full max-w-[200px]"
      role="img"
      aria-label={`Circle diagram with radius ${radius}`}
    >
      <circle cx={CENTER.x} cy={CENTER.y} r={CIRCLE_RADIUS_PX} fill="#CFE4F2" fillOpacity={0.35} stroke="#1C2541" strokeWidth={3} />
      <line x1={CENTER.x} y1={CENTER.y} x2={edge.x} y2={edge.y} stroke="#2E6F9E" strokeWidth={2.5} />
      <circle cx={CENTER.x} cy={CENTER.y} r={3.5} fill="#1C2541" />
      <text x={CENTER.x + CIRCLE_RADIUS_PX / 2} y={CENTER.y - 8} fontSize={13} fill="#2E6F9E" textAnchor="middle" fontWeight={700}>
        {radius} cm
      </text>
    </svg>
  );
}
