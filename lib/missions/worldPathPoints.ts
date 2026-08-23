import type { MissionMode } from "./types";

export interface PathPoint {
  x: number; // percent of image width, 0-100
  y: number; // percent of image height, 0-100
}

/**
 * Hand-traced points (bottom -> top, matching level 1 -> LEVELS_PER_WORLD)
 * following the actual winding path/road drawn in each mode's backdrop
 * image (public/quests/world-{mode}.webp). Picked by eye against each
 * image so a node sits ON the stone path / road / trail rather than
 * floating over sky or rooftops — the exact bug Lynda flagged
 * ("numbers... randomly placed until it goes to the sky").
 *
 * These are shared across all 9 worlds within a mode, same as the
 * backdrop image itself is shared — a world doesn't get its own unique
 * path shape yet (see HANDOVER note on per-world decoration theming).
 * If LEVELS_PER_WORLD (worldConfig.ts) ever changes, these need
 * re-tracing to match the new point count.
 */
export const WORLD_PATH_POINTS: Record<MissionMode, PathPoint[]> = {
  easy: [
    { x: 62, y: 93 },
    { x: 32, y: 84 },
    { x: 52, y: 73 },
    { x: 22, y: 61 },
    { x: 42, y: 50 },
    { x: 52, y: 39 },
    { x: 66, y: 27 },
    { x: 76, y: 13 },
  ],
  medium: [
    { x: 58, y: 94 },
    { x: 35, y: 82 },
    { x: 22, y: 68 },
    { x: 48, y: 58 },
    { x: 58, y: 44 },
    { x: 38, y: 34 },
    { x: 25, y: 20 },
    { x: 15, y: 8 },
  ],
  hard: [
    { x: 28, y: 92 },
    { x: 22, y: 78 },
    { x: 32, y: 68 },
    { x: 22, y: 55 },
    { x: 30, y: 44 },
    { x: 45, y: 33 },
    { x: 62, y: 20 },
    { x: 80, y: 10 },
  ],
};

/** Native pixel size of the 3 backdrop images (all generated at the same
 * size) — used to render the backdrop at its true aspect ratio instead
 * of stretching/cropping it into an arbitrary container height, which is
 * what made the hand-traced percentages above line up with the sky
 * instead of the path in the first version of this component. */
export const WORLD_IMAGE_ASPECT = 898 / 1752;
