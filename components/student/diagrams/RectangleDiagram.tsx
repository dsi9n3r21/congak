// Draws a plain labeled rectangle (or square when width === height) —
// the simplest 2D shape in the curriculum, used by both the perimeter
// and area "simple shapes" topics before composite shapes are introduced.

const MAX_DIM_PX = 160;
const PADDING = 38;

export function RectangleDiagram({ width, height, unit = "cm" }: { width: number; height: number; unit?: string }) {
  const scale = Math.min(MAX_DIM_PX / width, MAX_DIM_PX / height);
  const w = width * scale;
  const h = height * scale;

  const left = PADDING;
  const top = PADDING;
  const viewBoxW = left + w + PADDING;
  const viewBoxH = top + h + PADDING + 20;

  return (
    <svg
      viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
      className="mx-auto h-auto w-full max-w-[240px]"
      role="img"
      aria-label={`Rectangle ${width} by ${height} ${unit}`}
    >
      <rect x={left} y={top} width={w} height={h} fill="#CFE4F2" fillOpacity={0.35} stroke="#1C2541" strokeWidth={3} />

      <text x={left + w / 2} y={top + h + 18} fontSize={16} fill="#2E6F9E" textAnchor="middle" fontWeight={700}>
        {width} {unit}
      </text>
      <text
        x={left - 10}
        y={top + h / 2}
        fontSize={16}
        fill="#2E6F9E"
        textAnchor="end"
        dominantBaseline="middle"
        fontWeight={700}
      >
        {height} {unit}
      </text>
    </svg>
  );
}
