import type { Bilingual } from "@/lib/i18n/dictionary";

export interface BadgeDef {
  id: string;
  name: Bilingual;
  emoji: string;
  /** Missions completed with this badgeId before it's earned. */
  target: number;
  description: Bilingual;
}

export const BADGES: Record<string, BadgeDef> = {
  kindness: {
    id: "kindness",
    name: { ms: "Lencana Kebaikan", en: "Kindness Badge" },
    emoji: "💛",
    target: 5,
    description: { ms: "Selesaikan 5 misi menyelamat.", en: "Complete 5 rescue missions." },
  },
  bridge_builder: {
    id: "bridge_builder",
    name: { ms: "Lencana Pembina Jambatan", en: "Bridge Builder Badge" },
    emoji: "🌉",
    target: 3,
    description: { ms: "Selesaikan 3 misi pembinaan.", en: "Complete 3 builder missions." },
  },
  money_hero: {
    id: "money_hero",
    name: { ms: "Lencana Wira Wang", en: "Money Hero Badge" },
    emoji: "🛒",
    target: 5,
    description: { ms: "Selesaikan 5 misi literasi kewangan.", en: "Complete 5 financial literacy missions." },
  },
  fixer: {
    id: "fixer",
    name: { ms: "Lencana Pembaik", en: "Fixer Badge" },
    emoji: "🔧",
    target: 4,
    description: { ms: "Selesaikan 4 misi ukuran atau pembinaan.", en: "Complete 4 measurement or builder missions." },
  },
  detective: {
    id: "detective",
    name: { ms: "Lencana Detektif", en: "Detective Badge" },
    emoji: "🔍",
    target: 4,
    description: { ms: "Selesaikan 4 misi misteri atau KBAT.", en: "Complete 4 mystery or KBAT missions." },
  },
  time_traveler: {
    id: "time_traveler",
    name: { ms: "Lencana Pengembara Masa", en: "Time Traveler Badge" },
    emoji: "⏰",
    target: 4,
    description: { ms: "Selesaikan 4 misi berkaitan masa.", en: "Complete 4 time-related missions." },
  },
  adventure_champion: {
    id: "adventure_champion",
    name: { ms: "Lencana Juara Pengembaraan", en: "Adventure Champion Badge" },
    emoji: "🏆",
    // One "unit" per full adventure clear (all obstacles on the map, any
    // one mode) — target 1 so it's earned the moment the map is first
    // completed, then can climb past 1 if a student clears it again on a
    // harder mode (record_badge_progress already caps at target but we
    // bump target here per clear via completeAdventureRun, see actions).
    target: 1,
    description: {
      ms: "Selesaikan semua 9 halangan di Peta Pengembaraan dalam satu mod.",
      en: "Clear all 9 obstacles on the Adventure Map in one mode.",
    },
  },
};
