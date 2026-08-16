// Draws a simple pie chart: one sector per category, sized by its
// fraction of the whole and labeled directly on the sector with its
// letter and fraction (e.g. "A 1/4") — mirrors how these appear in the
// real textbook, so no angle-reading is required, only the fraction.

const VIEWBOX_W = 260;
const VIEWBOX_H = 220;
const CENTER_X = 130;
const CENTER_Y = 110;
const RADIUS = 90;
const COLORS = ["#2E6F9E", "#3A9188", "#C99A2E", "#8A5FA8"];

function polarToCartesian(angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER_X + RADIUS * Math.cos(rad), y: CENTER_Y + RADIUS * Math.sin(rad) };
}

export function PieChartDiagram({
  segments,
}: {
  segments: { label: string; numerator: number; denominator: number }[];
}) {
  let cumulativeAngle = 0;

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
      className="mx-auto h-auto w-full max-w-[280px]"
      role="img"
      aria-label={`Pie chart: ${segments.map((s) => `${s.label} is ${s.numerator}/${s.denominator}`).join(", ")}`}
    >
      {segments.map((seg, i) => {
        const fraction = seg.numerator / seg.denominator;
        const startAngle = cumulativeAngle;
        const sweepAngle = fraction * 360;
        const endAngle = startAngle + sweepAngle;
        cumulativeAngle = endAngle;

        const start = polarToCartesian(startAngle);
        const end = polarToCartesian(endAngle);
        const largeArcFlag = sweepAngle > 180 ? 1 : 0;
        const path = `M ${CENTER_X} ${CENTER_Y} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;

        const midAngle = startAngle + sweepAngle / 2;
        const labelPos = polarToCartesian(midAngle);
        // Pull the label in toward the center a bit so it sits inside the slice.
        const labelX = CENTER_X + (labelPos.x - CENTER_X) * 0.62;
        const labelY = CENTER_Y + (labelPos.y - CENTER_Y) * 0.62;

        return (
          <g key={seg.label}>
            <path d={path} fill={COLORS[i % COLORS.length]} stroke="#F5F0E6" strokeWidth={2} />
            <text x={labelX} y={labelY - 6} fontSize={16} fontWeight={700} fill="#F5F0E6" textAnchor="middle">
              {seg.label}
            </text>
            <text x={labelX} y={labelY + 10} fontSize={15} fill="#F5F0E6" textAnchor="middle">
              {seg.numerator}/{seg.denominator}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
