import { randInt, shuffleOptions } from "../utils";
import type { GeneratedQuestion, GeneratorParams } from "../types";

// Year 6 KSSR "Prime Numbers and Composite Numbers" — verified against the
// real textbook ToC (Numbers and Operations, p.42). Word-based answer
// (not numeric): correctAnswer/options are canonical keys styled through
// optionLabels.ts (prime/composite/neither), same convention as
// likelihood and angles_classify. 1 is deliberately included sometimes —
// it's neither prime nor composite, a common real misconception the
// actual DSKP calls out.
function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}

export function generatePrimeComposite(_params: GeneratorParams): GeneratedQuestion {
  const includeOne = Math.random() < 0.12;
  const n = includeOne ? 1 : randInt(2, 100);
  const correct: "prime" | "composite" | "neither" = n === 1 ? "neither" : isPrime(n) ? "prime" : "composite";

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
