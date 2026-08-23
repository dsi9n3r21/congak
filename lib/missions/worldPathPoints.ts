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
    { x: 45, y: 95 }, // stone patch, bottom center
    { x: 30, y: 80 }, // ON the wooden bridge over the stream
    { x: 63, y: 71 }, // stones right of the pond, near the lamp post
    { x: 14, y: 60 }, // stones near the "You can do it, Pintar!" sign
    { x: 46, y: 52 }, // stones right of the pond, upper path
    { x: 22, y: 41 }, // stones near the butterfly, left path
    { x: 50, y: 31 }, // stones near the picnic table
    { x: 32, y: 21 }, // stones near the Fun Park sign / playground junction
  ],
  medium: [
    { x: 45, y: 94 }, // bottom crosswalk
    { x: 22, y: 82 }, // road bend near the canal bridge
    { x: 15, y: 68 }, // on the stone bridge over the canal
    { x: 40, y: 60 }, // road curving toward the roundabout
    { x: 63, y: 54 }, // at the roundabout, by the fountain
    { x: 45, y: 42 }, // road curving back left, below the purple building
    { x: 30, y: 32 }, // monorail track, near the purple building base
    { x: 48, y: 25 }, // the "KEEP GOING" billboard, on the purple building roof
  ],
  hard: [
    { x: 25, y: 90 }, // dirt path near the "Keep going, Pintar!" sign
    { x: 18, y: 78 }, // on the wooden bridge over the stream
    { x: 27, y: 66 }, // dirt path near the fallen-log area
    { x: 48, y: 57 }, // ON the fallen log, crossing the stream
    { x: 62, y: 45 }, // base of the waterfall, right side
    { x: 68, y: 30 }, // climbing the glacier/waterfall edge
    { x: 72, y: 18 }, // upper glacier stream
    { x: 78, y: 9 }, // near the flag and cabin at the top
  ],
};

/** Native pixel size of the 3 backdrop images (all generated at the same
 * size) — used to render the backdrop at its true aspect ratio instead
 * of stretching/cropping it into an arbitrary container height, which is
 * what made the hand-traced percentages above line up with the sky
 * instead of the path in the first version of this component. */
export const WORLD_IMAGE_ASPECT = 898 / 1752;
