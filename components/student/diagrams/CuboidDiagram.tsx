// Draws a simple isometric-style cuboid (3D box) with its three
// dimensions labeled — the top and right faces are parallelograms
// (skewed) to give the 3D impression, using a fixed skew rather than a
// true isometric projection, which keeps the label placement simple and
// the box readable at small sizes.

const SKEW_X = 26;
const SKEW_Y = 14;
const MAX_DIM_PX = 100;
const PADDING = 34;

export function CuboidDiagram({
  length,
  width,
  height,
  unit = "cm",
}: {
  length: number;
  width: number;
  height: number;
  unit?: string;
}) {
  const scale = Math.min(MAX_DIM_PX / length, MAX_DIM_PX / height);
  const L = length * scale; // front-face width
  const H = height * scale; // front-face height
  const D = Math.min(width * scale * 0.6, SKEW_X * 2.2); // depth, compressed so it never dwarfs L/H
  const depthShiftY = D * (SKEW_Y / SKEW_X);

  const fx = PADDING + SKEW_X;
  const fy = PADDING + SKEW_Y;

  // Front face corners
  const A = { x: fx, y: fy + H }; // bottom-left
  const B = { x: fx + L, y: fy + H }; // bottom-right
  const C = { x: fx + L, y: fy }; // top-right
  const Dp = { x: fx, y: fy }; // top-left

  // Back-shifted counterparts (shifted right + up by the depth skew)
  const shift = (p: { x: number; y: number }) => ({ x: p.x + D, y: p.y - depthShiftY });
  const B2 = shift(B);
  const C2 = shift(C);
  const D2 = shift(Dp);

  const viewBoxW = B2.x + PADDING;
  const viewBoxH = A.y + PADDING + 20;

  return (
    <svg
      viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
      className="mx-auto h-auto w-full max-w-[240px]"
      role="img"
      aria-label={`Cuboid: length ${length}, width ${width}, height ${height} ${unit}`}
    >
      {/* top face */}
      <polygon
        points={`${Dp.x},${Dp.y} ${C.x},${C.y} ${C2.x},${C2.y} ${D2.x},${D2.y}`}
        fill="#CFE4F2"
        fillOpacity={0.6}
        stroke="#1C2541"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* right face */}
      <polygon
        points={`${B.x},${B.y} ${C.x},${C.y} ${C2.x},${C2.y} ${B2.x},${B2.y}`}
        fill="#CFE4F2"
        fillOpacity={0.35}
        stroke="#1C2541"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* front face */}
      <polygon
        points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${Dp.x},${Dp.y}`}
        fill="#CFE4F2"
        fillOpacity={0.5}
        stroke="#1C2541"
        strokeWidth={3}
        strokeLinejoin="round"
      />

      {/* labels */}
      <text x={(A.x + B.x) / 2} y={A.y + 16} fontSize={11} fill="#2E6F9E" textAnchor="middle" fontWeight={700}>
        {length} {unit}
      </text>
      <text x={A.x - 8} y={(A.y + Dp.y) / 2} fontSize={11} fill="#2E6F9E" textAnchor="end" dominantBaseline="middle" fontWeight={700}>
        {height} {unit}
      </text>
      <text x={(B.x + B2.x) / 2 + 4} y={(B.y + B2.y) / 2 - 4} fontSize={11} fill="#2E6F9E" textAnchor="start" fontWeight={700}>
        {width} {unit}
      </text>
    </svg>
  );
}
