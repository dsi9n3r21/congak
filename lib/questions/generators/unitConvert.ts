import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

interface UnitPair {
  big: string; // symbol/abbreviation for the larger unit, e.g. "m", "kg", "yr"
  small: string; // symbol/abbreviation for the smaller unit, e.g. "cm", "g", "mth"
  factor: number; // how many `small` units make 1 `big` unit
}

// Narrative context for the word_problem variant, keyed by "big_small".
// Covers the length/mass/volume pairs and the everyday duration pairs
// actually used by topics today (cm/mm, m/cm, km/m, kg/g, l/ml, day/hr,
// wk/day, hr/min, yr/mth). The more abstract "age" pairs (dec/yr, c/dec)
// deliberately fall back to the plain conversion sentence below instead
// of forcing an awkward "lasts 3 dec" phrasing — still a genuine
// word_problem shape, just without a physical item attached.
const unitContext: Record<string, { ms: string; en: string; kind: "length" | "mass" | "volume" | "duration" }> = {
  cm_mm: { ms: "pensel", en: "pencil", kind: "length" },
  m_cm: { ms: "reben", en: "ribbon", kind: "length" },
  km_m: { ms: "trek larian", en: "running track", kind: "length" },
  kg_g: { ms: "beg tepung", en: "bag of flour", kind: "mass" },
  l_ml: { ms: "botol air", en: "bottle of water", kind: "volume" },
  day_hr: { ms: "penerbangan", en: "flight", kind: "duration" },
  wk_day: { ms: "percutian keluarga", en: "family holiday", kind: "duration" },
  hr_min: { ms: "kelas tuisyen", en: "tuition class", kind: "duration" },
  yr_mth: { ms: "kontrak sewa", en: "rental contract", kind: "duration" },
};

const measurePhrase: Record<"length" | "mass" | "volume" | "duration", { ms: string; en: string }> = {
  length: { ms: "panjangnya", en: "is" },
  mass: { ms: "beratnya", en: "weighs" },
  volume: { ms: "isipadunya", en: "has a volume of" },
  duration: { ms: "berlangsung selama", en: "lasts" },
};

// Which measurement kind each "big_small" pair belongs to — covers every
// pair used across the unit-conversion topics (length, mass, volume,
// duration), so the compound-measurement challenge below always picks
// phrasing that matches the unit (never describes a mass in terms of a
// "piece of wood" or similar mismatch).
const unitKind: Record<string, "length" | "mass" | "volume" | "duration"> = {
  cm_mm: "length",
  m_cm: "length",
  km_m: "length",
  kg_g: "mass",
  l_ml: "volume",
  day_hr: "duration",
  wk_day: "duration",
  hr_min: "duration",
  yr_mth: "duration",
  dec_yr: "duration",
  c_dec: "duration",
};

// Generic subject noun per kind for the compound-measurement challenge
// sentence (paired with `measurePhrase` above for the verb).
const compoundSubject: Record<"length" | "mass" | "volume" | "duration", { ms: string; en: string }> = {
  length: { ms: "Sebatang kayu", en: "A piece of wood" },
  mass: { ms: "Sebuah guni beras", en: "A sack of rice" },
  volume: { ms: "Sebuah tangki air", en: "A water tank" },
  duration: { ms: "Sebuah acara", en: "An event" },
};

/**
 * One generic "convert between two units" generator, reused across many
 * KSSR topics that are all structurally identical — Length (mm/cm/m/km),
 * Mass (g/kg), Volume of Liquid (ml/L), and Time (minutes/hours/days/
 * weeks/months/years/decades/centuries). Rather than one near-duplicate
 * generator file per unit pair, a topic just supplies a `pairs` array and
 * this picks one pair per question. Keeps every conversion always exact
 * (no remainders) — appropriate for the introductory conversion topics
 * this powers; arithmetic ON converted units (add/subtract/etc.) stays in
 * dedicated generators like `length_add_subtract`.
 *
 * Retrofitted per the Round 19 content standard: added a real item-based
 * word_problem (via the `unitContext` lookup above), errorSpotting, and a
 * reverseProblem variant that asks for the conversion factor itself rather
 * than the converted value — the natural "reverse" of applying a factor is
 * recalling/deriving it.
 */
export function generateUnitConvert(params: GeneratorParams): GeneratedQuestion {
  const pairs = (params.pairs as UnitPair[]) ?? [{ big: "m", small: "cm", factor: 100 }];
  const maxBig = Number(params.maxBig ?? 10);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const challenge = Boolean(params.challenge);

  // ---- challenge (TP6 / non-routine): a COMPOUND measurement — e.g.
  // "3 m 45 cm" — converted entirely into the small unit. A genuine
  // second hop past the base skill (which only ever converts a single
  // clean quantity): (1) convert the big-unit part to small units, THEN
  // (2) add on the small-unit remainder — skipping either hop gives a
  // classic wrong answer. Uses the same kind-aware subject/verb phrasing
  // as the word_problem branch below so mass/volume/duration pairs don't
  // get a nonsensical "length of a piece of wood" sentence.
  if (challenge) {
    const { big, small, factor } = pick(pairs);
    const bigVal = randInt(1, Math.max(1, maxBig - 1));
    const smallRemainder = randInt(1, factor - 1);
    const correct = bigVal * factor + smallRemainder;
    const kind = unitKind[`${big}_${small}`] ?? "length";
    const subject = compoundSubject[kind];
    const verb = measurePhrase[kind];
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${subject.ms} ${verb.ms} ${bigVal} ${big} ${smallRemainder} ${small}. Berapakah itu dalam ${small} sahaja?`,
        en: `${subject.en} ${verb.en} ${bigVal} ${big} ${smallRemainder} ${small}. What is that in ${small} only?`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context: { big, small, factor, bigVal, smallRemainder, correct },
      generatorKey: "unit_convert",
      difficulty: 3,
    };
    // Classic non-routine mistake: converts the big-unit part but forgets
    // to add the small-unit remainder.
    const forgotRemainder = String(bigVal * factor);
    // Classic non-routine mistake: forgets to convert at all, just adds
    // the two raw numbers together.
    const forgotConvert = String(bigVal + smallRemainder);
    const distractors = Array.from(new Set([forgotRemainder, forgotConvert])).filter((d) => d !== String(correct));
    question.options = shuffleOptions(String(correct), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, correct + randInt(1, Math.max(2, Math.round(correct * 0.2)))));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- reverseProblem: given a worked example, find the conversion
  // factor itself (rather than a converted value).
  if (reverseProblem) {
    const { big, small, factor } = pick(pairs);
    const bigVal = randInt(2, maxBig);
    const smallVal = bigVal * factor;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `${bigVal} ${big} bersamaan ${smallVal} ${small}. Berapakah bilangan ${small} bagi setiap 1 ${big}?`,
        en: `${bigVal} ${big} equals ${smallVal} ${small}. How many ${small} make up 1 ${big}?`,
      },
      type: "word_problem",
      correctAnswer: String(factor),
      context: { big, small, factor, bigVal, smallVal },
      generatorKey: "unit_convert",
      difficulty: 2,
    };
    // Classic mistake: guessed a different common conversion factor (10/100/1000 confusion).
    const wrongFactorGuess = pick([10, 100, 1000].filter((f) => f !== factor));
    const distractors = Array.from(new Set([String(wrongFactorGuess)])).filter((d) => d !== String(factor));
    question.options = shuffleOptions(String(factor), distractors);
    while (question.options.length < 3) {
      const candidate = String(
        Math.max(1, factor + randInt(1, Math.max(2, Math.round(factor * 0.5))) * (Math.random() > 0.5 ? 1 : -1))
      );
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const { big, small, factor } = pick(pairs);
  const bigVal = randInt(1, maxBig);
  const smallVal = bigVal * factor;
  const bigToSmall = Math.random() > 0.5;
  const correct = bigToSmall ? smallVal : bigVal;

  // ---- errorSpotting: shown the classic "used the wrong conversion
  // factor" mistake, must give the correct answer.
  if (errorSpotting) {
    const wrongFactorGuess = pick([10, 100, 1000].filter((f) => f !== factor));
    const wrongAnswer = bigToSmall ? bigVal * wrongFactorGuess : Math.round(smallVal / wrongFactorGuess);
    if (wrongAnswer !== correct) {
      const question: GeneratedQuestion = {
        prompt: bigToSmall
          ? {
              ms: `Seorang murid menukar ${bigVal} ${big} kepada ${small} dan mendapat ${wrongAnswer} ${small}. Apakah jawapan yang betul?`,
              en: `A student converts ${bigVal} ${big} to ${small} and gets ${wrongAnswer} ${small}. What is the correct answer?`,
            }
          : {
              ms: `Seorang murid menukar ${smallVal} ${small} kepada ${big} dan mendapat ${wrongAnswer} ${big}. Apakah jawapan yang betul?`,
              en: `A student converts ${smallVal} ${small} to ${big} and gets ${wrongAnswer} ${big}. What is the correct answer?`,
            },
        type: "mcq",
        correctAnswer: String(correct),
        context: { big, small, factor, bigVal, smallVal, bigToSmall: bigToSmall ? "yes" : "no", wrongAnswer },
        generatorKey: "unit_convert",
        difficulty: 3,
        options: shuffleOptions(String(correct), [String(wrongAnswer)].filter((d) => d !== String(correct))),
      };
      while (question.options!.length < 3) {
        const candidate = String(Math.max(1, correct + randInt(1, Math.max(2, Math.round(correct * 0.2)))));
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: real item context via `unitContext`, falls back to
  // a plain conversion sentence for pairs not in that lookup.
  if (type === "word_problem") {
    const key = `${big}_${small}`;
    const ctx = unitContext[key];
    const question: GeneratedQuestion = {
      prompt: ctx
        ? bigToSmall
          ? {
              ms: `Sebuah ${ctx.ms} ${measurePhrase[ctx.kind].ms} ${bigVal} ${big}. Berapa ${small} kah itu?`,
              en: `A ${ctx.en} ${measurePhrase[ctx.kind].en} ${bigVal} ${big}. How many ${small} is that?`,
            }
          : {
              ms: `Sebuah ${ctx.ms} ${measurePhrase[ctx.kind].ms} ${smallVal} ${small}. Berapa ${big} kah itu?`,
              en: `A ${ctx.en} ${measurePhrase[ctx.kind].en} ${smallVal} ${small}. How many ${big} is that?`,
            }
        : bigToSmall
          ? { ms: `Satu kuantiti ialah ${bigVal} ${big}. Berapakah dalam ${small}?`, en: `A quantity is ${bigVal} ${big}. How much is that in ${small}?` }
          : { ms: `Satu kuantiti ialah ${smallVal} ${small}. Berapakah dalam ${big}?`, en: `A quantity is ${smallVal} ${small}. How much is that in ${big}?` },
      type: "word_problem",
      correctAnswer: String(correct),
      context: { big, small, factor, bigVal, smallVal, bigToSmall: bigToSmall ? "yes" : "no" },
      generatorKey: "unit_convert",
      difficulty: factor >= 1000 ? 2 : 1,
    };
    const wrongFactorGuess = pick([10, 100, 1000].filter((f) => f !== factor));
    const usedWrongFactor = bigToSmall ? bigVal * wrongFactorGuess : Math.round(smallVal / wrongFactorGuess);
    const wrongDirection = bigToSmall ? Math.round(bigVal / factor) : bigVal * factor;
    const distractors = Array.from(
      new Set([usedWrongFactor, wrongDirection].map(String).filter((d) => d !== String(correct) && Number(d) > 0))
    );
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, correct + randInt(1, Math.max(2, Math.round(correct * 0.2)))));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: bigToSmall
      ? { ms: `${bigVal} ${big} = ? ${small}`, en: `${bigVal} ${big} = ? ${small}` }
      : { ms: `${smallVal} ${small} = ? ${big}`, en: `${smallVal} ${small} = ? ${big}` },
    type,
    correctAnswer: bigToSmall ? String(smallVal) : String(bigVal),
    context: { big, small, factor, bigVal, smallVal, bigToSmall: bigToSmall ? "yes" : "no" },
    generatorKey: "unit_convert",
    difficulty: factor >= 1000 ? 2 : 1,
  };

  if (type === "mcq") {
    // Classic mistake: using the wrong conversion factor — the most common
    // confusions are ×10 vs ×100 vs ×1000, or dividing when you should
    // multiply (and vice versa).
    const wrongFactorGuess = pick([10, 100, 1000].filter((f) => f !== factor));
    const usedWrongFactor = bigToSmall ? bigVal * wrongFactorGuess : Math.round(smallVal / wrongFactorGuess);
    // Classic mistake: applied the conversion in the wrong direction
    // (multiplied when converting big→small should have divided, or
    // vice versa).
    const wrongDirection = bigToSmall ? Math.round(bigVal / factor) : bigVal * factor;
    const distractors = Array.from(
      new Set([usedWrongFactor, wrongDirection].map(String).filter((d) => d !== String(correct) && Number(d) > 0))
    );
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(1, correct + randInt(1, Math.max(2, Math.round(correct * 0.2)))));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
