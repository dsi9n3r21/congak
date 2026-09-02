import type { Bilingual } from "@/lib/i18n/dictionary";
import type { MissionCategory } from "./types";

/** How many level nodes each world's scrollable path shows. Originally
 * 8 — changed to 5 after Lynda repeatedly found "8 levels" vs "9
 * worlds" confusing to keep straight at a glance (two similar numbers,
 * shown close together in the flow). 5 is deliberately far enough from
 * 9 that the two can't be mixed up, and as a side effect it also means
 * far less title repetition on the map for a category with only 1-2
 * authored missions (5 slots to fill instead of 8). A level isn't tied
 * to one specific mission — tapping it draws a random mission+variant
 * from that category (same "unlimited via randomization" approach the
 * obstacle model already used), so this is a game-feel choice, not a
 * content-count ceiling. */
export const LEVELS_PER_WORLD = 5;

/** Per Lynda's brief: each category becomes its own named "world". */
export const WORLD_NAME: Record<MissionCategory, Bilingual> = {
  number: { ms: "Hutan Nombor", en: "Number Forest" },
  fraction: { ms: "Lembah Pecahan", en: "Fraction Valley" },
  money: { ms: "Pasar Wang", en: "Money Market" },
  measurement: { ms: "Kampung Ukuran", en: "Measurement Village" },
  geometry: { ms: "Kuil Geometri", en: "Geometry Temple" },
  data: { ms: "Bandar Data", en: "Data Town" },
  time: { ms: "Stesen Masa", en: "Time Station" },
  kbat: { ms: "Perpustakaan KBAT", en: "KBAT Library" },
  real_life: { ms: "Bandar Kehidupan Sebenar", en: "Real Life City" },
};
