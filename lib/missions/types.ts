import type { Bilingual } from "@/lib/i18n/dictionary";

export type MissionCategory =
  | "number"
  | "fraction"
  | "money"
  | "measurement"
  | "geometry"
  | "data"
  | "time"
  | "kbat"
  | "real_life";

export type MissionKind = "rescue" | "exploration" | "mystery" | "builder" | "financial_literacy" | "time_travel";

/**
 * Difficulty mode, chosen once per adventure run — independent of
 * `yearLevel` (which is the KSSR grade the mission's content belongs to).
 * A Y4 student picks Easy/Medium/Hard the same way an adult picks a game
 * difficulty; it scales the NUMBERS and how much the challenge text gives
 * away, not the grade the skill comes from. See lib/missions/difficulty.ts.
 */
export type MissionMode = "easy" | "medium" | "hard";

/**
 * One playable draw of a mission's math: the actual numbers for this
 * attempt, already substituted into the question text. `values` holds
 * every named number/word this draw used (e.g. { count: 5, amount: 1,
 * correct: "0.2" }) so the SAME values can also be substituted into the
 * story text via fillTemplate — the story and the question always agree
 * on the numbers because they're filled from one source.
 */
export interface MissionMathDraw {
  questionText: Bilingual;
  correctAnswer: string;
  options?: string[]; // present for mcq-style missions
  workingHint: Bilingual; // shown after an incorrect attempt — the worked calculation
  values: Record<string, string | number>;
}

/**
 * One "skin" for a mission — same underlying math, different characters/
 * setting. `generateMath` is params-aware so a variant can bias the
 * numbers to fit its theme (e.g. "8 birds" wants a different count range
 * than "4 puppies") while staying the same KSSR skill as every other
 * variant of the same mission.
 */
export interface MissionVariant {
  /** Bilingual character/setting names available to {tokens} in this
   * variant's story text, e.g. { character: "kittens", place: "Number Forest" }. */
  tokens: Record<string, Bilingual>;
  intro: Bilingual;
  challenge: Bilingual;
  outcomeSuccess: Bilingual;
  outcomeRetry: Bilingual;
  reflection: Bilingual;
  /** `mode` defaults to "medium" inside each generator so every existing
   * call site (and every mission that hasn't opted into scaling yet)
   * keeps working unchanged. */
  generateMath: (mode?: MissionMode) => MissionMathDraw;
}

export interface MissionTemplate {
  id: string;
  category: MissionCategory;
  kind: MissionKind;
  yearLevel: 4 | 5 | 6;
  title: Bilingual;
  skillTag: Bilingual; // the KSSR skill this mission practises, shown on the mission card
  emoji: string;
  rewardXp: number;
  badgeId?: string;
  variants: MissionVariant[]; // one is picked at random each time the mission is played
}

/** Simple {token} substitution, run independently over the ms/en text.
 * Values can be plain numbers/strings or Bilingual objects (in which case
 * the matching-language half is used). Missing tokens are left as-is
 * rather than throwing, so a mission with an unused token in one variant
 * doesn't break — better a visible {typo} in dev than a crash for a kid
 * mid-mission. */
export function fillTemplate(
  text: Bilingual,
  values: Record<string, string | number | Bilingual>
): Bilingual {
  const fill = (s: string, lang: "ms" | "en") =>
    s.replace(/\{(\w+)\}/g, (match, key) => {
      const v = values[key];
      if (v === undefined) return match;
      if (typeof v === "object") return String(v[lang]);
      return String(v);
    });
  return { ms: fill(text.ms, "ms"), en: fill(text.en, "en") };
}
