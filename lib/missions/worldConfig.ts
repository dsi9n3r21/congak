import type { Bilingual } from "@/lib/i18n/dictionary";
import type { MissionCategory } from "./types";

/** How many level nodes each world's scrollable path shows. A level
 * isn't tied to one specific mission — tapping it draws a random
 * mission+variant from that category (same "unlimited via
 * randomization" approach the obstacle model already used), so 8 is a
 * game-feel choice (Candy-Crush-ish path length), not a content-count
 * ceiling. */
export const LEVELS_PER_WORLD = 8;

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
