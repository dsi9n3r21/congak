import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 6 KSSR "Distance Between Two Coordinates" — restricted to
// horizontal or vertical distance (two points sharing an x or y
// coordinate), matching the real book's own "Horizontal Distance and
// Vertical Distance" sub-topics. Pure arithmetic (absolute difference) —
// doesn't need the CoordinateGridDiagram, unlike the Y5 "reading
// coordinates" topic which is about plotting/reading a single point.
//
// Retrofitted per the Round 19 content standard: added a real streetlamp
// word_problem, errorSpotting (the documented "added instead of
// subtracted" mistake), and a reverseProblem variant that finds point B's
// coordinates given point A, the shared axis, and the distance between
// them (constrained so B is further from the origin, keeping the answer
// unambiguous).
export function generateCoordinateDistance(params: GeneratorParams): GeneratedQuestion {
  const maxCoord = Number(params.maxCoord ?? 12);
  const type = (params.type as "mcq" | "fill" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const reverseProblem = Boolean(params.reverseProblem);
  const scaled = Boolean(params.scaled);
  const challenge = Boolean(params.challenge);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // ---- challenge (TP6 / non-routine): a two-leg L-shaped journey
  // (vertical leg then horizontal leg) with a map scale — find the TOTAL
  // real distance walked. Genuine second hop past the "scaled" branch
  // (which only ever scales ONE grid distance): (1) find each leg's grid
  // distance and add them together, THEN (2) multiply the combined grid
  // distance by the scale.
  if (challenge) {
    const scaleUnitMeters = pick([50, 100, 150, 200, 250]);
    const x1 = randInt(0, maxCoord);
    let y1 = randInt(0, maxCoord);
    let y2 = randInt(0, maxCoord);
    while (y2 === y1) y2 = randInt(0, maxCoord);
    let x3 = randInt(0, maxCoord);
    while (x3 === x1) x3 = randInt(0, maxCoord);
    const leg1Grid = Math.abs(y2 - y1);
    const leg2Grid = Math.abs(x3 - x1);
    const totalGrid = leg1Grid + leg2Grid;
    const totalReal = totalGrid * scaleUnitMeters;
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Pada peta sebuah taman (skala: 1 unit mewakili ${scaleUnitMeters} m), ${name} berjalan dari pintu masuk A(${x1}, ${y1}) ke gerai makanan B(${x1}, ${y2}), kemudian dari gerai makanan itu ke taman permainan C(${x3}, ${y2}). Berapakah JUMLAH jarak sebenar yang dilalui ${name}, dalam m?`,
        en: `On a park map (scale: 1 unit represents ${scaleUnitMeters} m), ${name} walks from the entrance A(${x1}, ${y1}) to the food stall B(${x1}, ${y2}), then from the food stall to the playground C(${x3}, ${y2}). What is the TOTAL real distance ${name} walked, in m?`,
      },
      type: "word_problem",
      correctAnswer: String(totalReal),
      context: { leg1Grid, leg2Grid, totalGrid, scaleUnitMeters, totalReal },
      generatorKey: "coordinate_distance",
      difficulty: 3,
    };
    // Classic non-routine mistake: stops after the first leg, gives only
    // that leg's real distance.
    const stoppedAtFirstLeg = leg1Grid * scaleUnitMeters;
    // Classic mistake: adds the grid distances but forgets to apply the
    // scale at all.
    const forgotScale = totalGrid;
    const distractors = Array.from(
      new Set([stoppedAtFirstLeg, forgotScale].map(String).filter((d) => d !== String(totalReal)))
    );
    question.options = shuffleOptions(String(totalReal), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, totalReal + randInt(1, 4) * scaleUnitMeters * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  // ---- scaled: converts the grid distance into a real-world distance
  // using a map scale ("1 unit represents X m") — this is the actual
  // KSSR Year 6 content standard (SK 7.1, SP 7.1.1, "jarak sebenar" /
  // real distance), not just an exam-writer's embellishment. The plain
  // grid-difference question above is the foundational first step; this
  // is the terminal skill the real textbook and UASA papers test.
  if (scaled) {
    const scaleUnitMeters = Number(params.scaleUnitMeters ?? pick([50, 100, 150, 200, 250, 500]));
    const unit = (params.unit as "m" | "km") ?? (scaleUnitMeters >= 200 ? "km" : "m");
    const horizontal = Math.random() > 0.5;
    const fixed = randInt(0, maxCoord);
    let coord1 = randInt(0, maxCoord);
    let coord2 = randInt(0, maxCoord);
    while (coord2 === coord1) coord2 = randInt(0, maxCoord);
    const pointA = horizontal ? `(${coord1}, ${fixed})` : `(${fixed}, ${coord1})`;
    const pointB = horizontal ? `(${coord2}, ${fixed})` : `(${fixed}, ${coord2})`;
    const gridDistance = Math.abs(coord1 - coord2);
    const realMeters = gridDistance * scaleUnitMeters;
    // Real UASA/textbook answers are commonly decimal km (e.g. "0.5 km"),
    // so no need to force round-thousands here — round to 2 dp is enough.
    const correctValue = unit === "km" ? Math.round((realMeters / 1000) * 100) / 100 : realMeters;
    const correct = String(correctValue);
    const context = { coord1, coord2, fixed, gridDistance, scaleUnitMeters, unit, correctValue };

    // ---- errorSpotting: shown the classic "forgot to apply the scale"
    // mistake (gave the raw grid distance as the final answer).
    if (errorSpotting && String(gridDistance) !== correct) {
      const name = pick(names);
      const question: GeneratedQuestion = {
        prompt: {
          ms: `Titik A ialah ${pointA} dan titik B ialah ${pointB}. Skala: 1 unit mewakili ${scaleUnitMeters} m. ${name} mengira jarak sebenar antara A dan B sebagai ${gridDistance} ${unit} (terlupa guna skala). Apakah jawapan yang betul, dalam ${unit}?`,
          en: `Point A is at ${pointA} and point B is at ${pointB}. Scale: 1 unit represents ${scaleUnitMeters} m. ${name} calculated the real distance between A and B as ${gridDistance} ${unit} (forgot to apply the scale). What is the correct answer, in ${unit}?`,
        },
        type: "mcq",
        correctAnswer: correct,
        context,
        generatorKey: "coordinate_distance",
        difficulty: 3,
        options: shuffleOptions(correct, [String(gridDistance)].filter((d) => d !== correct)),
      };
      while (question.options!.length < 3) {
        const bump = unit === "km" ? randInt(1, 4) * 0.5 : randInt(scaleUnitMeters / 5, scaleUnitMeters);
        const candidate = String(Math.max(0, correctValue + bump * (Math.random() > 0.5 ? 1 : -1)));
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }

    const promptBase = {
      ms: `Titik A ialah ${pointA} dan titik B ialah ${pointB}. Skala: 1 unit mewakili ${scaleUnitMeters} m. Berapakah jarak sebenar antara A dan B, dalam ${unit}?`,
      en: `Point A is at ${pointA} and point B is at ${pointB}. Scale: 1 unit represents ${scaleUnitMeters} m. What is the real distance between A and B, in ${unit}?`,
    };
    const question: GeneratedQuestion = {
      prompt:
        type === "word_problem"
          ? {
              ms: `Dua tiang lampu terletak pada ${horizontal ? "jalan" : "lorong"} yang sama, pada koordinat ${pointA} dan ${pointB} di peta. Skala peta: 1 unit mewakili ${scaleUnitMeters} m. Berapakah jarak sebenar antara kedua-dua tiang lampu, dalam ${unit}?`,
              en: `Two streetlamps sit on the same ${horizontal ? "street" : "lane"}, at coordinates ${pointA} and ${pointB} on the map. Map scale: 1 unit represents ${scaleUnitMeters} m. What is the real distance between the two streetlamps, in ${unit}?`,
            }
          : promptBase,
      type,
      correctAnswer: correct,
      context,
      generatorKey: "coordinate_distance",
      difficulty: 3,
    };

    if (type === "mcq" || type === "word_problem") {
      // Classic mistake: forgot to apply the scale at all.
      const forgotScale = String(gridDistance);
      // Classic mistake: applied the scale but didn't convert m to km
      // (or vice versa) when the question asked for the other unit.
      const wrongUnitConversion =
        unit === "km" ? String(realMeters) : String(Math.round((realMeters / 1000) * 100) / 100);
      const distractors = Array.from(
        new Set([forgotScale, wrongUnitConversion].filter((d) => d !== correct))
      );
      question.options = shuffleOptions(correct, distractors);
      while (question.options.length < 3) {
        const bump = unit === "km" ? randInt(1, 4) * 0.5 : randInt(scaleUnitMeters / 5, scaleUnitMeters);
        const candidate = String(Math.max(0, correctValue + bump * (Math.random() > 0.5 ? 1 : -1)));
        if (!question.options.includes(candidate)) question.options.push(candidate);
      }
    }

    return question;
  }

  // ---- reverseProblem: given point A, the shared axis, and the distance
  // to point B, find B's coordinates (B constrained to be further from
  // the origin, so the answer is unambiguous).
  if (reverseProblem) {
    const horizontal = Math.random() > 0.5;
    const fixed = randInt(0, maxCoord);
    const coord1 = randInt(0, Math.max(0, maxCoord - 3));
    const distance = randInt(1, Math.max(1, maxCoord - coord1));
    const coord2 = coord1 + distance;
    const pointA = horizontal ? `(${coord1}, ${fixed})` : `(${fixed}, ${coord1})`;
    const correctPointB = horizontal ? `(${coord2}, ${fixed})` : `(${fixed}, ${coord2})`;
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Titik A ialah ${pointA}. Titik B berkongsi nilai ${horizontal ? "y" : "x"} yang sama dengan A, dan jaraknya daripada A ialah ${distance}. Titik B lebih jauh daripada asalan (0, 0) berbanding A. Apakah koordinat titik B?`,
        en: `Point A is at ${pointA}. Point B shares the same ${horizontal ? "y" : "x"}-value as A, and is a distance of ${distance} from A. Point B is further from the origin (0, 0) than A. What are point B's coordinates?`,
      },
      type: "word_problem",
      correctAnswer: correctPointB,
      context: { coord1, coord2, fixed, distance, horizontal: horizontal ? "yes" : "no" },
      generatorKey: "coordinate_distance",
      difficulty: 3,
    };
    // Classic mistake: subtracted instead of added, placing B closer to the origin.
    const closerToOrigin = horizontal
      ? `(${Math.max(0, coord1 - distance)}, ${fixed})`
      : `(${fixed}, ${Math.max(0, coord1 - distance)})`;
    // Classic mistake: put the distance on the wrong axis.
    const wrongAxis = horizontal ? `(${coord1}, ${fixed + distance})` : `(${fixed + distance}, ${coord1})`;
    const distractors = Array.from(new Set([closerToOrigin, wrongAxis].filter((d) => d !== correctPointB)));
    question.options = shuffleOptions(correctPointB, distractors.slice(0, 2));
    while (question.options.length < 3) {
      const bump = randInt(1, 4);
      const candidate = horizontal ? `(${coord2 + bump}, ${fixed})` : `(${fixed}, ${coord2 + bump})`;
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const horizontal = Math.random() > 0.5;
  const fixed = randInt(0, maxCoord);
  let coord1 = randInt(0, maxCoord);
  let coord2 = randInt(0, maxCoord);
  while (coord2 === coord1) coord2 = randInt(0, maxCoord);

  const pointA = horizontal ? `(${coord1}, ${fixed})` : `(${fixed}, ${coord1})`;
  const pointB = horizontal ? `(${coord2}, ${fixed})` : `(${fixed}, ${coord2})`;
  const correct = Math.abs(coord1 - coord2);

  // ---- errorSpotting: shown the documented "added instead of subtracted"
  // mistake, must give the correct answer.
  if (errorSpotting) {
    const name = pick(names);
    const wrongAnswer = coord1 + coord2;
    if (wrongAnswer !== correct) {
      const question: GeneratedQuestion = {
        prompt: {
          ms: `Titik A ialah ${pointA} dan titik B ialah ${pointB}. ${name} mengira jarak antara A dan B dan mendapat ${wrongAnswer}. Apakah jawapan yang betul?`,
          en: `Point A is at ${pointA} and point B is at ${pointB}. ${name} calculated the distance between A and B and got ${wrongAnswer}. What is the correct answer?`,
        },
        type: "mcq",
        correctAnswer: String(correct),
        context: { coord1, coord2, fixed, correct, horizontal: horizontal ? "yes" : "no", wrongAnswer },
        generatorKey: "coordinate_distance",
        difficulty: 3,
        options: shuffleOptions(String(correct), [String(wrongAnswer)]),
      };
      while (question.options!.length < 3) {
        const candidate = String(Math.max(0, correct + randInt(1, 4) * (Math.random() > 0.5 ? 1 : -1)));
        if (!question.options!.includes(candidate)) question.options!.push(candidate);
      }
      return question;
    }
  }

  // ---- word_problem: streetlamps-on-the-same-street scenario, real-world
  // framing for horizontal/vertical coordinate distance.
  if (type === "word_problem") {
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Dua tiang lampu terletak pada ${horizontal ? "jalan" : "lorong"} yang sama. Tiang lampu A ialah ${pointA} dan tiang lampu B ialah ${pointB}. Berapakah jarak antara kedua-dua tiang lampu itu?`,
        en: `Two streetlamps are on the same ${horizontal ? "street" : "lane"}. Streetlamp A is at ${pointA} and streetlamp B is at ${pointB}. What is the distance between the two streetlamps?`,
      },
      type: "word_problem",
      correctAnswer: String(correct),
      context: { coord1, coord2, fixed, correct, horizontal: horizontal ? "yes" : "no" },
      generatorKey: "coordinate_distance",
      difficulty: 2,
    };
    const addedInstead = coord1 + coord2;
    const distractors = Array.from(new Set([String(addedInstead)].filter((d) => d !== String(correct))));
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, correct + randInt(1, 4) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

  const question: GeneratedQuestion = {
    prompt: {
      ms: `Titik A ialah ${pointA} dan titik B ialah ${pointB}. Berapakah jarak antara A dan B?`,
      en: `Point A is at ${pointA} and point B is at ${pointB}. What is the distance between A and B?`,
    },
    type,
    correctAnswer: String(correct),
    context: { coord1, coord2, fixed, correct, horizontal: horizontal ? "yes" : "no" },
    generatorKey: "coordinate_distance",
    difficulty: 2,
  };

  if (type === "mcq") {
    // Classic mistake: added the two coordinates instead of finding the
    // difference.
    const addedInstead = coord1 + coord2;
    const distractors = Array.from(new Set([String(addedInstead)].filter((d) => d !== String(correct))));
    question.options = shuffleOptions(String(correct), distractors);
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, correct + randInt(1, 4) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
  }

  return question;
}
