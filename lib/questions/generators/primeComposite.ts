import { pick, randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 6 KSSR "Prime Numbers and Composite Numbers" — verified against the
// real textbook ToC (Numbers and Operations, p.42). Word-based answer
// (not numeric): correctAnswer/options are canonical keys styled through
// optionLabels.ts (prime/composite/neither), same convention as
// likelihood and angles_classify. 1 is deliberately included sometimes —
// it's neither prime nor composite, a common real misconception the
// actual DSKP calls out.
//
// Retrofitted per the Round 19 content standard: added a real locker-
// numbers word_problem framing and an errorSpotting variant targeting the
// single most common documented mistake (treating 1 as prime). No
// reverseProblem — there's no numeric reverse for a categorical
// classification, same reasoning as angles_classify.ts.
function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}

export function generatePrimeComposite(params: GeneratorParams): GeneratedQuestion {
  const type = (params.type as "mcq" | "word_problem") ?? "mcq";
  const errorSpotting = Boolean(params.errorSpotting);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // ---- errorSpotting: shown the single most common documented mistake —
  // claiming 1 is prime — must give the correct classification.
  if (errorSpotting) {
    const name = pick(names);
    return {
      prompt: {
        ms: `${name} berkata 1 ialah nombor perdana kerana hanya boleh dibahagi dengan 1 dan dirinya sendiri. ${name} silap. Adakah 1 sebenarnya nombor perdana, nombor gubahan, atau bukan kedua-duanya?`,
        en: `${name} says 1 is a prime number because it can only be divided by 1 and itself. ${name} is wrong. Is 1 actually prime, composite, or neither?`,
      },
      type: "mcq",
      correctAnswer: "neither",
      context: { n: 1, correct: "neither" },
      generatorKey: "prime_composite",
      difficulty: 3,
      options: shuffleOptions("neither", ["prime", "composite"]),
    };
  }

  const includeOne = Math.random() < 0.12;
  const n = includeOne ? 1 : randInt(2, 100);
  const correct: "prime" | "composite" | "neither" = n === 1 ? "neither" : isPrime(n) ? "prime" : "composite";

  // ---- word_problem: locker-numbers scenario — a genuine, if lightly
  // contrived, everyday framing for a pure number-theory classification.
  if (type === "word_problem") {
    const name = pick(names);
    return {
      prompt: {
        ms: `Loker sekolah ${name} bernombor ${n}. Cikgu berkata nombor loker yang perdana akan mendapat stiker istimewa. Adakah loker ${name} akan mendapat stiker itu? (Jawab: perdana, gubahan, atau bukan kedua-duanya)`,
        en: `${name}'s school locker is numbered ${n}. The teacher says lockers with a prime number get a special sticker. Will ${name}'s locker get the sticker? (Answer: prime, composite, or neither)`,
      },
      type: "word_problem",
      correctAnswer: correct,
      context: { n, correct },
      generatorKey: "prime_composite",
      difficulty: 2,
      options: shuffleOptions(correct, ["prime", "composite", "neither"].filter((c) => c !== correct)),
    };
  }

  return {
    prompt: {
      ms: `Adakah ${n} nombor perdana, nombor gubahan, atau bukan kedua-duanya?`,
      en: `Is ${n} a prime number, a composite number, or neither?`,
    },
    type: "mcq",
    correctAnswer: correct,
    context: { n, correct },
    generatorKey: "prime_composite",
    difficulty: 2,
    options: shuffleOptions(correct, ["prime", "composite", "neither"].filter((c) => c !== correct)),
  };
}
