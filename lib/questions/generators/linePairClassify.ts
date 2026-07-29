import { pick, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 4 KSSR "Parallel Lines and Perpendicular Lines" — verified against
// the real Y4 textbook ToC (Space, p.201). Word-based answer (not
// numeric), same optionLabels convention as likelihood and
// prime_composite. Perpendicular and parallel are always drawn in their
// canonical (axis-aligned) orientation for visual clarity, matching how
// the real textbook draws them — "neither" gets a random non-90°,
// non-0°/180° tilt for variety.
//
// Retrofitted per the Round 19 content standard: added a targeted pool
// (for guided practice), real-object word_problem framing (still shown
// with the diagram — the object just gives it a Malaysian context), and
// an errorSpotting variant. Deliberately no reverseProblem/"fill" type —
// reversing this concept numerically (e.g. finding a missing angle from
// a perpendicular pair) is Y5/6 angle-property content, out of scope for
// this Y4 topic per the "no higher-year concepts" rule; "fill" has the
// same bilingual-grading risk as asset_liability/insurance_takaful
// (canonical English keys, BM-rendered prompt).
const NEITHER_ANGLES = [30, 40, 60, 120, 140, 150];
const RELATIONSHIPS = ["parallel", "perpendicular", "neither"] as const;

const REAL_OBJECTS = [
  { ms: "dua landasan kereta api", en: "two railway tracks", relationship: "parallel" },
  { ms: "dua tepi jalan raya lurus", en: "two straight road edges", relationship: "parallel" },
  { ms: "gril tingkap yang menegak", en: "the bars of a window grille", relationship: "parallel" },
  { ms: "sudut sehelai kertas", en: "the corner of a sheet of paper", relationship: "perpendicular" },
  { ms: "dinding dan lantai sebuah bilik", en: "a wall and the floor of a room", relationship: "perpendicular" },
  { ms: "tiang bendera dan tanah", en: "a flagpole and the ground", relationship: "perpendicular" },
  { ms: "dua jalan yang bersilang serong, bukan tegak", en: "two roads crossing at a slant, not a right angle", relationship: "neither" },
  { ms: "tangga yang disandarkan condong pada dinding", en: "a ladder leaning at an angle against a wall", relationship: "neither" },
] as const;

function angleFor(relationship: (typeof RELATIONSHIPS)[number]): number {
  return relationship === "perpendicular" ? 90 : relationship === "neither" ? pick(NEITHER_ANGLES) : 0;
}

export function generateLinePairClassify(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "word_problem") ?? "mcq";
  const target = params.target as (typeof RELATIONSHIPS)[number] | undefined;
  const errorSpotting = Boolean(params.errorSpotting);

  // ---- errorSpotting: shown a diagram alongside a claimed (possibly
  // wrong) classification, must give the correct one. The claim is
  // always a plausible near-miss — "neither" diagrams near 90° get
  // wrongly claimed as perpendicular, since that's the real misconception
  // (assuming any steep-looking crossing is a right angle).
  if (errorSpotting) {
    const relationship = pick(RELATIONSHIPS);
    const angleDeg = angleFor(relationship);
    const claimedWrong =
      relationship === "neither" && (angleDeg === 60 || angleDeg === 120)
        ? "perpendicular"
        : relationship === "parallel"
          ? "perpendicular"
          : relationship === "perpendicular"
            ? "parallel"
            : "parallel";
    return {
      prompt: {
        ms: `Ali berkata garis ini ${claimedWrong === "parallel" ? "selari" : claimedWrong === "perpendicular" ? "serenjang" : ""}. Apakah hubungan yang betul antara kedua-dua garis ini?`,
        en: `Ali says these lines are ${claimedWrong}. What is the correct relationship between these two lines?`,
      },
      type: "mcq",
      correctAnswer: relationship,
      context: { relationship, angleDeg, claimedWrong },
      generatorKey: "line_pair_classify",
      difficulty: 3,
      options: shuffleOptions(relationship, RELATIONSHIPS.filter((r) => r !== relationship)),
      diagram: { kind: "line_pair", relationship, angleDeg },
    };
  }

  // ---- word_problem: same diagram, framed around a real Malaysian-
  // classroom-relevant object instead of "these two lines".
  if (type === "word_problem") {
    const relationship = target ?? pick(RELATIONSHIPS);
    const angleDeg = angleFor(relationship);
    const object = pick(REAL_OBJECTS.filter((o) => o.relationship === relationship));
    return {
      prompt: {
        ms: `Rajah di bawah mewakili ${object.ms}. Adakah garis ini selari, serenjang, atau bukan kedua-duanya?`,
        en: `The diagram below represents ${object.en}. Are these lines parallel, perpendicular, or neither?`,
      },
      type: "word_problem",
      correctAnswer: relationship,
      context: { relationship, angleDeg },
      generatorKey: "line_pair_classify",
      difficulty: 2,
      options: shuffleOptions(relationship, RELATIONSHIPS.filter((r) => r !== relationship)),
      diagram: { kind: "line_pair", relationship, angleDeg },
    };
  }

  // ---- base mcq: optionally targeted at one relationship for guided
  // practice, otherwise a random mix for independent practice.
  const relationship = target ?? pick(RELATIONSHIPS);
  const angleDeg = angleFor(relationship);

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
    options: shuffleOptions(relationship, RELATIONSHIPS.filter((r) => r !== relationship)),
    diagram: { kind: "line_pair", relationship, angleDeg },
  };
}
