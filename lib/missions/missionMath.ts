/**
 * Mission-specific math generators. These are deliberately separate from
 * `lib/questions/generators/` (the 85-topic curriculum REGISTRY): those
 * generators are tuned for drilling a specific KSSR topic at its own
 * numeric range (e.g. Y5 division dividends run 100-999), which doesn't
 * fit a "1 litre of milk for 5 kittens" story. These generators test the
 * same underlying skill — equal-sharing division, fraction subtraction,
 * multi-item budget subtraction — at ranges that read naturally in a
 * story. See lib/missions/README (HANDOVER.md) for the full reasoning.
 */
import { randInt, pick, gcd } from "@/lib/questions/utils";
import type { Bilingual } from "@/lib/i18n/dictionary";
import type { MissionMathDraw } from "./types";

/** amount ÷ count, exact to 1 decimal place — e.g. "1 litre shared among
 * 5 kittens = 0.2 litre each". Built backwards from a clean tenths-place
 * share so the division is always exact (no repeating decimals to round
 * awkwardly), matching how this is actually taught before long division
 * of decimals is introduced. */
export function generateEqualShare(countOptions: number[] = [2, 4, 5, 8, 10]): MissionMathDraw {
  const count = pick(countOptions);
  const shareTenths = randInt(1, 9); // the answer, in tenths: e.g. 2 -> 0.2
  const amount = (shareTenths * count) / 10;
  const correct = (shareTenths / 10).toFixed(1);
  const amountStr = amount % 1 === 0 ? String(amount) : amount.toFixed(1);

  return {
    questionText: {
      ms: `Jika jumlahnya ${amountStr} dan diagihkan sama rata kepada ${count}, berapakah bahagian masing-masing?`,
      en: `If the total is ${amountStr} and it's shared equally among ${count}, how much does each get?`,
    },
    correctAnswer: correct,
    workingHint: {
      ms: `${amountStr} ÷ ${count} = ${correct}`,
      en: `${amountStr} ÷ ${count} = ${correct}`,
    },
    values: { amount: amountStr, count, correct },
  };
}

/** Same-denominator fraction subtraction, simplified — e.g. "3/4 - 1/4 = 1/2". */
export function generateFractionSubtract(denominatorOptions: number[] = [4, 5, 6, 8, 10, 12]): MissionMathDraw {
  const d = pick(denominatorOptions);
  const a = randInt(2, d - 1);
  const b = randInt(1, a - 1);
  const diffNum = a - b;
  const g = gcd(diffNum, d);
  const simpNum = diffNum / g;
  const simpDen = d / g;
  const correct = simpDen === 1 ? String(simpNum) : `${simpNum}/${simpDen}`;

  return {
    questionText: {
      ms: `Berapakah ${a}/${d} tolak ${b}/${d}?`,
      en: `What is ${a}/${d} minus ${b}/${d}?`,
    },
    correctAnswer: correct,
    workingHint: {
      ms: `${a}/${d} − ${b}/${d} = ${diffNum}/${d}${g > 1 ? ` = ${correct} (dipermudahkan)` : ""}`,
      en: `${a}/${d} − ${b}/${d} = ${diffNum}/${d}${g > 1 ? ` = ${correct} (simplified)` : ""}`,
    },
    values: { a, b, d, correct },
  };
}

export interface BudgetItem {
  name: Bilingual;
  priceRM: number;
}

/** Budget minus 3-4 randomly chosen items from a pool — e.g. "RM50 budget,
 * buys bread/milk/rice/eggs, how much is left?". Guarantees the items
 * chosen never exceed the budget (re-picks the budget up if needed) so
 * the answer is always a sensible non-negative remainder. */
export function generateBudgetSubtract(pool: BudgetItem[], budgetOptions: number[] = [30, 40, 50, 60]): MissionMathDraw {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const itemCount = randInt(3, Math.min(4, pool.length));
  const items = shuffled.slice(0, itemCount);
  const itemsTotal = items.reduce((sum, it) => sum + it.priceRM, 0);
  const budget = budgetOptions.find((b) => b > itemsTotal) ?? Math.ceil(itemsTotal / 10) * 10 + 10;
  const remaining = budget - itemsTotal;

  const listMs = items.map((it) => `${it.name.ms} = RM${it.priceRM}`).join(", ");
  const listEn = items.map((it) => `${it.name.en} = RM${it.priceRM}`).join(", ");

  return {
    questionText: {
      ms: `Bajet: RM${budget}. Belian: ${listMs}. Berapakah baki wang?`,
      en: `Budget: RM${budget}. Items bought: ${listEn}. How much money is left?`,
    },
    correctAnswer: `RM${remaining}`,
    workingHint: {
      ms: `RM${budget} − RM${itemsTotal} = RM${remaining}`,
      en: `RM${budget} − RM${itemsTotal} = RM${remaining}`,
    },
    values: { budget: `RM${budget}`, itemsTotal: `RM${itemsTotal}`, correct: `RM${remaining}`, itemList: listEn },
  };
}
