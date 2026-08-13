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
  const challenge = Boolean(params.challenge);
  const names = ["Ahmad", "Siti", "Vijay", "Mei Ling", "Hakim", "Aminah", "Faisal"];

  // ---- challenge (TP6 / non-routine): how many PRIME numbers are there
  // in a given range? Genuine second hop past the base skill and
  // errorSpotting (both only ever classify ONE number): the student must
  // check EVERY number in the range and COUNT how many are prime,
  // instead of classifying a single number.
  if (challenge) {
    const lo = randInt(10, 30);
    const hi = lo + randInt(8, 15);
    let primeCount = 0;
    let compositeCount = 0;
    for (let n = lo; n <= hi; n++) {
      if (n === 1) continue;
      if (isPrime(n)) primeCount++;
      else compositeCount++;
    }
    const name = pick(names);
    const question: GeneratedQuestion = {
      prompt: {
        ms: `Berapa banyakkah nombor PERDANA antara ${lo} dan ${hi} (termasuk kedua-dua nombor itu)? ${name} perlu menyemak setiap nombor satu demi satu.`,
        en: `How many PRIME numbers are there between ${lo} and ${hi} (inclusive)? ${name} needs to check each number one by one.`,
      },
      type: "word_problem",
      correctAnswer: String(primeCount),
      context: { lo, hi, primeCount, compositeCount },
      generatorKey: "prime_composite",
      difficulty: 3,
    };
    // Classic non-routine mistake: counts the COMPOSITE numbers instead
    // of the prime ones.
    const countedCompositeInstead = compositeCount;
    // Classic non-routine mistake: miscounts by one, missing or
    // double-counting a boundary number.
    const offByOne = primeCount + (Math.random() > 0.5 ? 1 : -1);
    const distractors = Array.from(
      new Set([countedCompositeInstead, offByOne].map(String).filter((d) => d !== String(primeCount) && Number(d) >= 0))
    );
    question.options = shuffleOptions(String(primeCount), distractors.slice(0, 2));
    while (question.options.length < 3) {
      const candidate = String(Math.max(0, primeCount + randInt(1, 3) * (Math.random() > 0.5 ? 1 : -1)));
      if (!question.options.includes(candidate)) question.options.push(candidate);
    }
    return question;
  }

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
