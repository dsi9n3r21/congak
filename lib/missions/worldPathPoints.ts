import type { MissionMode } from "./types";

export interface PathPoint {
  x: number; // percent of image width, 0-100
  y: number; // percent of image height, 0-100
}

/**
 * Hand-traced points (bottom -> top, matching level 1 -> LEVELS_PER_WORLD)
 * following the actual winding path/road drawn in each mode's backdrop
 * image (public/quests/world-{mode}.webp). Picked by eye against each
 * image, verified by rendering the points back onto the actual artwork
 * before shipping — so a node sits ON the stone path / road / trail
 * rather than floating over sky or rooftops.
 *
 * These are shared across all 9 worlds within a mode, same as the
 * backdrop image itself is shared — a world doesn't get its own unique
 * path shape yet (see HANDOVER note on per-world decoration theming).
 * 5 points per mode (matches LEVELS_PER_WORLD in worldConfig.ts) — if
 * that ever changes, these need re-tracing to match the new count.
 */
export const WORLD_PATH_POINTS: Record<MissionMode, PathPoint[]> = {
  easy: [
    { x: 45, y: 95 }, // stone patch, bottom center
    { x: 63, y: 71 }, // stones right of the pond, near the lamp post
    { x: 46, y: 52 }, // stones right of the pond, upper path
    { x: 22, y: 41 }, // stones near the butterfly, left path
    { x: 24, y: 29 }, // path near the Fun Park sign entrance, ground level
  ],
  medium: [
    { x: 45, y: 94 }, // bottom crosswalk
    { x: 15, y: 68 }, // on the stone bridge over the canal
    { x: 63, y: 54 }, // at the roundabout, by the fountain
    { x: 45, y: 42 }, // road curving back left, below the purple building
    { x: 48, y: 30 }, // directly on the "KEEP GOING" billboard
  ],
  hard: [
    { x: 25, y: 90 }, // dirt path near the "Keep going, Pintar!" sign
    { x: 27, y: 66 }, // dirt path near the fallen-log area
    { x: 62, y: 45 }, // base of the waterfall, right side
    { x: 68, y: 30 }, // climbing the glacier/waterfall edge
    { x: 86, y: 20 }, // directly on the cabin and flag at the top
  ],
};

/** Native pixel size of the 3 backdrop images (all generated at the same
 * size) — used to render the backdrop at its true aspect ratio instead
 * of stretching/cropping it into an arbitrary container height, which is
 * what made the hand-traced percentages above line up with the sky
 * instead of the path in the first version of this component. */
export const WORLD_IMAGE_ASPECT = 898 / 1752;
