// Draws a first-quadrant coordinate grid (0 to gridSize on both axes)
// with one point plotted, plus dashed guide lines from the point down to
// the x-axis and across to the y-axis — the standard way this is taught,
// so the student can trace the point back to its two coordinate values.

const VIEWBOX = 240;
const MARGIN = 30;
const GRID_SIZE_PX = 190;

export function CoordinateGridDiagram({ x, y, gridSize }: { x: number; y: number; gridSize: number }) {
  const step = GRID_SIZE_PX / gridSize;
  const originX = MARGIN;
  const originY = VIEWBOX - MARGIN;

  const pointX = originX + x * step;
  const pointY = originY - y * step;

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
      className="mx-auto h-auto w-full max-w-[240px]"
      role="img"
      aria-label={`Coordinate grid with a point at (${x}, ${y})`}
    >
      {gridLines}

      {/* axes */}
      <line x1={originX} y1={originY} x2={originX + GRID_SIZE_PX} y2={originY} stroke="#1C2541" strokeWidth={2} />
      <line x1={originX} y1={originY} x2={originX} y2={originY - GRID_SIZE_PX} stroke="#1C2541" strokeWidth={2} />

      {/* axis tick numbers, every 2 units to avoid clutter */}
      {Array.from({ length: gridSize + 1 }, (_, i) => i)
        .filter((i) => i % 2 === 0)
        .map((i) => (
          <text key={`xt${i}`} x={originX + i * step} y={originY + 14} fontSize={9} fill="#1C2541" textAnchor="middle">
            {i}
          </text>
        ))}
      {Array.from({ length: gridSize + 1 }, (_, i) => i)
        .filter((i) => i % 2 === 0)
        .map((i) => (
          <text key={`yt${i}`} x={originX - 10} y={originY - i * step + 3} fontSize={9} fill="#1C2541" textAnchor="middle">
            {i}
          </text>
        ))}

      {/* dashed guide lines to each axis */}
      <line x1={pointX} y1={pointY} x2={pointX} y2={originY} stroke="#2E6F9E" strokeWidth={1.5} strokeDasharray="4 3" />
      <line x1={pointX} y1={pointY} x2={originX} y2={pointY} stroke="#2E6F9E" strokeWidth={1.5} strokeDasharray="4 3" />

      {/* the point */}
      <circle cx={pointX} cy={pointY} r={5} fill="#C0392B" />
    </svg>
  );
}
