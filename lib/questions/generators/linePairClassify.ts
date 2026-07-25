import { pick, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 4 KSSR "Parallel Lines and Perpendicular Lines" — verified against
// the real Y4 textbook ToC (Space, p.201). Word-based answer (not
// numeric), same optionLabels convention as likelihood and
// prime_composite. Perpendicular and parallel are always drawn in their
// canonical (axis-aligned) orientation for visual clarity, matching how
// the real textbook draws them — "neither" gets a random non-90°,
// non-0°/180° tilt for variety.
const NEITHER_ANGLES = [30, 40, 60, 120, 140, 150];

export function generateLinePairClassify(_params: GeneratorParams): GeneratedQuestion {
  const relationship = pick(["parallel", "perpendicular", "neither"] as const);
  const angleDeg = relationship === "perpendicular" ? 90 : relationship === "neither" ? pick(NEITHER_ANGLES) : 0;

  return {
    prompt: {
      ms: "Adakah kedua-dua garis ini selari, serenjang, atau bukan kedua-duanya?",
      en: "Are these two lines parallel, perpendicular, or neither?",
    },
    type: "mcq",
    correctAnswer: relationship,
    context: { relationship, angleDeg },
    generatorKey: "line_pair_classify",
    difficulty: 2,
    options: shuffleOptions(relationship, ["parallel", "perpendicular", "neither"].filter((r) => r !== relationship)),
    diagram: { kind: "line_pair", relationship, angleDeg },
  };
}
