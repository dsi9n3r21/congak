// Draws a simple bar chart: one bar per category, each labeled with its
// value directly above it (this level of the curriculum tests computing
// with the data — totals, differences — not scale-reading, so the values
// are shown rather than requiring the student to read them off an axis).

const VIEWBOX_W = 260;
const VIEWBOX_H = 200;
const CHART_BOTTOM = 170;
const CHART_TOP = 20;
const BAR_WIDTH = 40;
const GAP = 20;
const COLORS = ["#2E6F9E", "#3A9188", "#C99A2E", "#8A5FA8"];

export function BarChartDiagram({ labels, values }: { labels: string[]; values: number[] }) {
  const maxValue = Math.max(...values);
  const usableHeight = CHART_BOTTOM - CHART_TOP;
  const totalWidth = labels.length * BAR_WIDTH + (labels.length - 1) * GAP;
  const startX = (VIEWBOX_W - totalWidth) / 2;

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
      className="mx-auto h-auto w-full max-w-[280px]"
      role="img"
      aria-label={`Bar chart: ${labels.map((l, i) => `${l} is ${values[i]}`).join(", ")}`}
    >
      {/* baseline */}
      <line x1={20} y1={CHART_BOTTOM} x2={VIEWBOX_W - 20} y2={CHART_BOTTOM} stroke="#1C2541" strokeWidth={2} />

      {labels.map((label, i) => {
        const barHeight = (values[i] / maxValue) * usableHeight;
        const x = startX + i * (BAR_WIDTH + GAP);
        const y = CHART_BOTTOM - barHeight;
        return (
          <g key={label}>
            <rect x={x} y={y} width={BAR_WIDTH} height={barHeight} fill={COLORS[i % COLORS.length]} rx={3} />
            <text x={x + BAR_WIDTH / 2} y={y - 8} fontSize={13} fontWeight={700} fill="#1C2541" textAnchor="middle">
              {values[i]}
            </text>
            <text x={x + BAR_WIDTH / 2} y={CHART_BOTTOM + 18} fontSize={13} fill="#1C2541" textAnchor="middle">
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
