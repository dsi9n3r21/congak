// Draws a first-quadrant coordinate grid with TWO points plotted (unlike
// CoordinateGridDiagram, which only handles one) plus a highlighted
// segment showing the distance between them — horizontal or vertical
// only, matching this topic's own scope (points always share an x or y
// value).

const VIEWBOX = 240;
const MARGIN = 30;
const GRID_SIZE_PX = 190;

export function TwoPointGridDiagram({
  x1,
  y1,
  x2,
  y2,
  gridSize,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  gridSize: number;
}) {
  const step = GRID_SIZE_PX / gridSize;
  const originX = MARGIN;
  const originY = VIEWBOX - MARGIN;

  const toSvg = (x: number, y: number) => ({ x: originX + x * step, y: originY - y * step });
  const pA = toSvg(x1, y1);
  const pB = toSvg(x2, y2);

  const gridLines = [];
  for (let i = 0; i <= gridSize; i++) {
    gridLines.push(
      <line key={`v${i}`} x1={originX + i * step} y1={originY} x2={originX + i * step} y2={originY - GRID_SIZE_PX} stroke="#1C2541" strokeOpacity={0.08} strokeWidth={1} />,
      <line key={`h${i}`} x1={originX} y1={originY - i * step} x2={originX + GRID_SIZE_PX} y2={originY - i * step} stroke="#1C2541" strokeOpacity={0.08} strokeWidth={1} />
    );
  }

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      className="mx-auto h-auto w-full max-w-[260px]"
      role="img"
      aria-label={`Coordinate grid with points A at (${x1}, ${y1}) and B at (${x2}, ${y2})`}
    >
      {gridLines}

      <line x1={originX} y1={originY} x2={originX + GRID_SIZE_PX} y2={originY} stroke="#1C2541" strokeWidth={2} />
      <line x1={originX} y1={originY} x2={originX} y2={originY - GRID_SIZE_PX} stroke="#1C2541" strokeWidth={2} />

      {Array.from({ length: gridSize + 1 }, (_, i) => i)
        .filter((i) => i % 2 === 0)
        .map((i) => (
          <text key={`xt${i}`} x={originX + i * step} y={originY + 14} fontSize={15} fill="#1C2541" textAnchor="middle">
            {i}
          </text>
        ))}
      {Array.from({ length: gridSize + 1 }, (_, i) => i)
        .filter((i) => i % 2 === 0)
        .map((i) => (
          <text key={`yt${i}`} x={originX - 10} y={originY - i * step + 3} fontSize={15} fill="#1C2541" textAnchor="middle">
            {i}
          </text>
        ))}

      {/* the distance segment, highlighted */}
      <line x1={pA.x} y1={pA.y} x2={pB.x} y2={pB.y} stroke="#C0392B" strokeWidth={3} strokeDasharray="6 4" />

      {/* the two points */}
      <circle cx={pA.x} cy={pA.y} r={5} fill="#2E6F9E" />
      <circle cx={pB.x} cy={pB.y} r={5} fill="#2E6F9E" />
      <text x={pA.x + 8} y={pA.y - 8} fontSize={15} fill="#1C2541" fontWeight={700}>
        A
      </text>
      <text x={pB.x + 8} y={pB.y - 8} fontSize={15} fill="#1C2541" fontWeight={700}>
        B
      </text>
    </svg>
  );
}
