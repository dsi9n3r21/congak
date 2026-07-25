import type { LucideIcon } from "lucide-react";
import { Calculator, PieChart, Percent, Divide, Clock, Coins, Ruler, BarChart3, MapPin, Scale } from "lucide-react";

export interface StrandStyle {
  Icon: LucideIcon;
  bg: string; // tailwind bg-* class, tinted (e.g. bg-biru/15)
  fg: string; // tailwind text-* class for the icon itself
}

// Keyed by the strand's English name (stable across the app, unlike the
// Malay name which sometimes varies in wording). Numbers-family strands
// all share blue and differ by icon; Money gets gold since it's the most
// literal fit; Space/Coordinates/Ratio get the warm saga tone since
// that's what's left and reads fine as a warm orange-red in this palette.
const STRAND_STYLES: Record<string, StrandStyle> = {
  "Whole Numbers": { Icon: Calculator, bg: "bg-biru/15", fg: "text-biru-dark" },
  "Numbers and Operations": { Icon: Calculator, bg: "bg-biru/15", fg: "text-biru-dark" },
  "Fractions": { Icon: PieChart, bg: "bg-biru/15", fg: "text-biru-dark" },
  "Decimals": { Icon: Divide, bg: "bg-biru/15", fg: "text-biru-dark" },
  "Percentage": { Icon: Percent, bg: "bg-biru/15", fg: "text-biru-dark" },
  "Measurement": { Icon: Clock, bg: "bg-pandan/15", fg: "text-pandan-dark" },
  "Money": { Icon: Coins, bg: "bg-kuning/20", fg: "text-kuning-dark" },
  "Space": { Icon: Ruler, bg: "bg-saga/15", fg: "text-saga-dark" },
  "Statistics": { Icon: BarChart3, bg: "bg-ungu/15", fg: "text-ungu-dark" },
  "Coordinates": { Icon: MapPin, bg: "bg-saga/15", fg: "text-saga-dark" },
  "Ratio": { Icon: Scale, bg: "bg-biru/15", fg: "text-biru-dark" },
};

const DEFAULT_STYLE: StrandStyle = { Icon: Calculator, bg: "bg-ink/10", fg: "text-ink/60" };

export function getStrandStyle(strandEn: string): StrandStyle {
  return STRAND_STYLES[strandEn] ?? DEFAULT_STYLE;
}
