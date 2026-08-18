import type { LucideIcon } from "lucide-react";
import { Calculator, PieChart, Coins, Ruler, Shapes, BarChart3, Clock, Brain, Globe2 } from "lucide-react";
import type { Bilingual } from "@/lib/i18n/dictionary";
import type { MissionCategory } from "./types";

export interface MissionCategoryStyle {
  Icon: LucideIcon;
  bg: string;
  fg: string;
  label: Bilingual;
}

// Same solid-gradient convention as lib/content/strandStyle.ts, one entry
// per category from the mission brief.
export const MISSION_CATEGORY_STYLES: Record<MissionCategory, MissionCategoryStyle> = {
  number: { Icon: Calculator, bg: "bg-gradient-to-br from-biru to-biru-dark", fg: "text-paper", label: { ms: "Pengembaraan Nombor", en: "Number Adventures" } },
  fraction: { Icon: PieChart, bg: "bg-gradient-to-br from-ungu to-ungu-dark", fg: "text-paper", label: { ms: "Pengembaraan Pecahan", en: "Fraction Adventures" } },
  money: { Icon: Coins, bg: "bg-gradient-to-br from-kuning to-kuning-dark", fg: "text-paper", label: { ms: "Pengembaraan Wang", en: "Money Adventures" } },
  measurement: { Icon: Ruler, bg: "bg-gradient-to-br from-pandan to-pandan-dark", fg: "text-paper", label: { ms: "Pengembaraan Ukuran", en: "Measurement Adventures" } },
  geometry: { Icon: Shapes, bg: "bg-gradient-to-br from-saga to-saga-dark", fg: "text-paper", label: { ms: "Pengembaraan Geometri", en: "Geometry Adventures" } },
  data: { Icon: BarChart3, bg: "bg-gradient-to-br from-ungu to-ungu-dark", fg: "text-paper", label: { ms: "Pengembaraan Data", en: "Data Adventures" } },
  time: { Icon: Clock, bg: "bg-gradient-to-br from-pandan to-pandan-dark", fg: "text-paper", label: { ms: "Pengembaraan Masa", en: "Time Adventures" } },
  kbat: { Icon: Brain, bg: "bg-gradient-to-br from-saga to-saga-dark", fg: "text-paper", label: { ms: "Pengembaraan KBAT", en: "KBAT Adventures" } },
  real_life: { Icon: Globe2, bg: "bg-gradient-to-br from-biru to-biru-dark", fg: "text-paper", label: { ms: "Pengembaraan Kehidupan Sebenar", en: "Real-Life Adventures" } },
};
