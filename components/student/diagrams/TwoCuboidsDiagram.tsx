// Draws two cuboids side by side, each labeled with its own dimensions —
// same reasoning as TwoRectanglesDiagram: the two cuboids' dimensions
// come from independent randInt draws (volumeComposite.ts), so they
// won't reliably fuse into one valid composite solid. Showing them side
// by side with a "+" matches the topic's own pedagogy: "split into
// Cuboid A and Cuboid B, find each volume separately, then add."

import { CuboidDiagram } from "./CuboidDiagram";

export interface CuboidPart {
  length: number;
  width: number;
  height: number;
  label: string;
}

export function TwoCuboidsDiagram({ a, b }: { a: CuboidPart; b: CuboidPart }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="flex flex-col items-center gap-1">
        <CuboidDiagram length={a.length} width={a.width} height={a.height} />
        <span className="text-xs font-bold text-biru">
          {a.label}: {a.length}×{a.width}×{a.height}
        </span>
      </div>
      <span className="text-xl font-bold text-ink">+</span>
      <div className="flex flex-col items-center gap-1">
        <CuboidDiagram length={b.length} width={b.width} height={b.height} />
        <span className="text-xs font-bold text-biru">
          {b.label}: {b.length}×{b.width}×{b.height}
        </span>
      </div>
    </div>
  );
}
