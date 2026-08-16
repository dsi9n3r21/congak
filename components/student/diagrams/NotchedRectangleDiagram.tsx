// Draws the actual L-shape this topic is about: a big rectangle
// (outerWidth × outerHeight) with a smaller rectangular notch
// (notchWidth × notchHeight) cut from the top-right corner. Unlike
// TwoRectanglesDiagram, this genuinely needs to be one connected L
// polygon — the whole point of the topic is that a student can SEE the
// notch and still recognise the perimeter equals the original
// rectangle's, so a "two separate boxes" rendering would defeat the
// pedagogy here.

const MAX_W_PX = 170;
const MAX_H_PX = 130;
const PADDING = 38;

export function NotchedRectangleDiagram({
  outerWidth,
  outerHeight,
  notchWidth,
  notchHeight,
}: {
  outerWidth: number;
  outerHeight: number;
  notchWidth: number;
  notchHeight: number;
}) {
  const scale = Math.min(MAX_W_PX / outerWidth, MAX_H_PX / outerHeight);
  const W = outerWidth * scale;
  const H = outerHeight * scale;
  const nw = notchWidth * scale;
  const nh = notchHeight * scale;

  const left = PADDING;
  const top = PADDING;
  const right = left + W;
  const bottom = top + H;

  // L-shape polygon, notch cut from the top-right corner, traced clockwise.
  const points = [
    [left, top],
    [right - nw, top],
    [right - nw, top + nh],
    [right, top + nh],
    [right, bottom],
    [left, bottom],
  ]
    .map((p) => p.join(","))
    .join(" ");

  const viewBoxW = right + PADDING;
  const viewBoxH = bottom + PADDING + 20;

  return (
    <svg
      viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
      className="mx-auto h-auto w-full max-w-[300px]"
      role="img"
      aria-label={`L-shape: overall ${outerWidth} by ${outerHeight}, with a ${notchWidth} by ${notchHeight} notch cut from one corner`}
    >
      <polygon points={points} fill="#CFE4F2" fillOpacity={0.35} stroke="#1C2541" strokeWidth={3} strokeLinejoin="round" />

      {/* overall width, along the bottom */}
      <text x={(left + right) / 2} y={bottom + 18} fontSize={15} fill="#2E6F9E" textAnchor="middle" fontWeight={700}>
        {outerWidth}
      </text>
      {/* overall height, along the left side */}
      <text x={left - 10} y={(top + bottom) / 2} fontSize={15} fill="#2E6F9E" textAnchor="end" dominantBaseline="middle" fontWeight={700}>
        {outerHeight}
      </text>
      {/* notch width, dashed marker above the cut */}
      <text x={right - nw / 2} y={top - 6} fontSize={17} fill="#C0392B" textAnchor="middle" fontWeight={700}>
        {notchWidth}
      </text>
      {/* notch height, to the right of the cut */}
      <text x={right + 8} y={top + nh / 2} fontSize={17} fill="#C0392B" textAnchor="start" dominantBaseline="middle" fontWeight={700}>
        {notchHeight}
      </text>
    </svg>
  );
}
