import type { MissionMode } from "./types";

/**
 * One shared scale factor per mode, applied consistently across every
 * generator instead of each one inventing its own easy/hard tuning.
 * ~0.6x on Easy (smaller, friendlier numbers), 1x on Medium (unchanged —
 * this is the existing tuning every mission already shipped with), ~1.6x
 * on Hard (bigger numbers, same skill). Kept as a single lookup so a
 * future mode (e.g. an in-between tier) is a one-line change.
 */
const SCALE: Record<MissionMode, number> = { easy: 0.6, medium: 1, hard: 1.6 };

export function scaleFactor(mode: MissionMode = "medium"): number {
  return SCALE[mode];
}

/** Scales an integer upper bound by mode, keeping a sane floor so Easy
 * never collapses a range to something degenerate (e.g. maxFactor=12 on
 * Easy -> 7, not 2). */
export function scaleMax(base: number, mode: MissionMode = "medium", floor = 3): number {
  return Math.max(floor, Math.round(base * scaleFactor(mode)));
}

/** Picks the harder end of an options array on Hard, the easier end on
 * Easy, and leaves Medium as-is — for option arrays like discount% or
 * duration presets where "scale the number" doesn't apply directly. */
export function biasOptions<T>(options: T[], mode: MissionMode = "medium"): T[] {
  if (options.length < 3) return options;
  const third = Math.max(1, Math.floor(options.length / 3));
  if (mode === "easy") return options.slice(0, options.length - third);
  if (mode === "hard") return options.slice(third);
  return options;
}
