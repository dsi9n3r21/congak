import type { LucideIcon } from "lucide-react";
import { Calculator, PieChart, Percent, Divide, Clock, Coins, Ruler, BarChart3, MapPin, Scale, Shapes, Dices } from "lucide-react";

export interface StrandStyle {
  Icon: LucideIcon;
  bg: string; // tailwind gradient classes — solid vivid fill, not a pale tint
  fg: string; // icon color — white against the vivid fill
}

// Keyed by the strand's (tajuk's) English name (stable across the app,
// unlike the Malay name which sometimes varies in wording). Numbers-family
// strands all share blue and differ by icon; Money gets gold since it's
// the most literal fit; Space/Coordinates/Ratio get the warm saga tone
// since that's what's left and reads fine as a warm orange-red in this
// palette. Solid gradient fills (not pale tints) per Lynda's feedback that
// the icons needed to look more vivid/attractive/toy-like for kids.
//
// "Time" and "Probability" were split out of "Measurement" and
// "Statistics" respectively (they're their own tajuk in the real KSSR
// DSKP, just previously bundled together here) — each keeps its parent
// bidang's color family but gets a distinct icon so they're still visually
// told apart within their year-tab list.
const STRAND_STYLES: Record<string, StrandStyle> = {
  "Whole Numbers": { Icon: Calculator, bg: "bg-gradient-to-br from-biru to-biru-dark", fg: "text-paper" },
  "Numbers and Operations": { Icon: Calculator, bg: "bg-gradient-to-br from-biru to-biru-dark", fg: "text-paper" },
  "Fractions": { Icon: PieChart, bg: "bg-gradient-to-br from-biru to-biru-dark", fg: "text-paper" },
  "Decimals": { Icon: Divide, bg: "bg-gradient-to-br from-biru to-biru-dark", fg: "text-paper" },
  "Percentage": { Icon: Percent, bg: "bg-gradient-to-br from-biru to-biru-dark", fg: "text-paper" },
  "Money": { Icon: Coins, bg: "bg-gradient-to-br from-kuning to-kuning-dark", fg: "text-paper" },
  "Time": { Icon: Clock, bg: "bg-gradient-to-br from-pandan to-pandan-dark", fg: "text-paper" },
  "Measurement": { Icon: Ruler, bg: "bg-gradient-to-br from-pandan to-pandan-dark", fg: "text-paper" },
  "Space": { Icon: Shapes, bg: "bg-gradient-to-br from-saga to-saga-dark", fg: "text-paper" },
  "Statistics": { Icon: BarChart3, bg: "bg-gradient-to-br from-ungu to-ungu-dark", fg: "text-paper" },
  "Probability": { Icon: Dices, bg: "bg-gradient-to-br from-ungu to-ungu-dark", fg: "text-paper" },
  "Coordinates": { Icon: MapPin, bg: "bg-gradient-to-br from-saga to-saga-dark", fg: "text-paper" },
  "Ratio": { Icon: Scale, bg: "bg-gradient-to-br from-biru to-biru-dark", fg: "text-paper" },
};

const DEFAULT_STYLE: StrandStyle = { Icon: Calculator, bg: "bg-gradient-to-br from-ink/40 to-ink/60", fg: "text-paper" };

export function getStrandStyle(strandEn: string): StrandStyle {
  return STRAND_STYLES[strandEn] ?? DEFAULT_STYLE;
}
