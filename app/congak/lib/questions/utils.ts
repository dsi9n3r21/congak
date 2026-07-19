export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

/** Shuffles the correct answer in among plausible wrong options. */
export function shuffleOptions(correct: string, distractors: string[]): string[] {
  const all = [correct, ...distractors];
  for (let i = all.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
