import type { Bilingual } from "../i18n/dictionary";

// Some generators (e.g. angle classification) produce word-based answers
// instead of numbers. correctAnswer/options stay as stable canonical keys
// (so grading is a plain string comparison, same as everything else) and
// this map supplies the bilingual label to display for each key.
// Numeric-answer generators never appear here — QuestionPlayer falls back
// to rendering the raw string when a key has no entry.
export const OPTION_LABELS: Record<string, Bilingual> = {
  acute: { ms: "Sudut Tirus", en: "Acute" },
  right: { ms: "Sudut Tegak", en: "Right Angle" },
  obtuse: { ms: "Sudut Cakah", en: "Obtuse" },
  reflex: { ms: "Sudut Refleks", en: "Reflex" },
  certain: { ms: "Pasti", en: "Certain" },
  impossible: { ms: "Mustahil", en: "Impossible" },
  equally_likely: { ms: "Sama Kemungkinan", en: "Equally Likely" },
  more_likely: { ms: "Lebih Berkemungkinan", en: "More Likely" },
  less_likely: { ms: "Kurang Berkemungkinan", en: "Less Likely" },
  asset: { ms: "Aset", en: "Asset" },
  liability: { ms: "Liabiliti", en: "Liability" },
};
