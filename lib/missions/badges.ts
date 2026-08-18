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
};
