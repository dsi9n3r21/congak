// Draws a simple pictograph: one row per category, made of `iconCount`
// identical squares, plus a key caption ("[icon] = N units") — the real
// pedagogical point of a pictograph is reading/applying that scale
// (unlike a bar chart, where the value is just shown directly), so the
// key is the one thing NOT given as a plain number anywhere else.

const VIEWBOX_W = 260;
const ROW_HEIGHT = 34;
const ICON_SIZE = 18;
const ICON_GAP = 6;
const LABEL_COL_W = 30;
const COLORS = ["#2E6F9E", "#3A9188", "#C99A2E", "#8A5FA8"];

export function PictographDiagram({
  segments,
  unitsPerIcon,
}: {
  segments: { label: string; iconCount: number }[];
  unitsPerIcon: number;
}) {
  const chartHeight = segments.length * ROW_HEIGHT + 40;

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_W} ${chartHeight}`}
      className="mx-auto h-auto w-full max-w-[280px]"
      role="img"
      aria-label={`Pictograph: ${segments.map((s) => `${s.label} has ${s.iconCount} icons`).join(", ")}, each icon represents ${unitsPerIcon} units`}
    >
      {segments.map((seg, i) => {
        const y = i * ROW_HEIGHT + 10;
        return (
          <g key={seg.label}>
            <text x={10} y={y + ICON_SIZE - 3} fontSize={17} fontWeight={700} fill="#1C2541">
              {seg.label}
            </text>
            {Array.from({ length: seg.iconCount }).map((_, j) => (
              <rect
                key={j}
                x={LABEL_COL_W + j * (ICON_SIZE + ICON_GAP)}
                y={y}
                width={ICON_SIZE}
                height={ICON_SIZE}
                rx={3}
                fill={COLORS[i % COLORS.length]}
              />
            ))}
          </g>
        );
      })}
      <g>
        <rect x={10} y={chartHeight - 24} width={14} height={14} rx={2} fill="#1C2541" />
        <text x={30} y={chartHeight - 13} fontSize={15} fill="#1C2541">
          = {unitsPerIcon} unit{unitsPerIcon === 1 ? "" : "s"}
        </text>
      </g>
    </svg>
  );
}
