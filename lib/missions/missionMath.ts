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
import type { MissionMathDraw, MissionMode } from "./types";
import { scaleMax, biasOptions } from "./difficulty";

/**
 * FUSION generators — deliberately different from every generator above:
 * those test ONE KSSR skill (optionally chained with a second, same-
 * family step, e.g. the multi-step budget/discount trio). A fusion
 * generator instead routes the answer through THREE DIFFERENT
 * disciplines in sequence — e.g. number -> geometry -> angle — so a
 * student can't finish it from one skill alone; a wrong intermediate hop
 * (e.g. dividing instead of the area formula) produces a wrong final
 * answer, same "stopped after the first hop" distractor logic the
 * curriculum's own Challenge tier uses. Reserved for Hard mode: this is
 * genuinely harder, not just bigger numbers.
 *
 * This is a first real example (Number -> Geometry -> Angle) proving the
 * pattern for lib/missions/missions.ts's "fusion" mission kind. Next
 * round: more fusion generators covering the other discipline
 * combinations named in the brief (e.g. money+time+measurement).
 */
export function generateFusionAreaAngle(mode: MissionMode = "medium"): MissionMathDraw {
  // Hop 1 (Number + Geometry): a rectangle's area and one side are given;
  // the OTHER side must be found by division — this is the real
  // "area = length x width" formula run backwards, not just a bare
  // division fact.
  const length = randInt(3, scaleMax(9, mode, 4));
  const width = randInt(2, scaleMax(8, mode, 3));
  const area = length * width;

  // Hop 2 (Angle): the found width becomes one of three angles that
  // together complete a straight line (180 degrees) alongside a second,
  // GIVEN angle -- the student must find the third.
  const givenAngle = randInt(20, 130 - width);
  const finalAngle = 180 - width - givenAngle;

  return {
    questionText: {
      ms: `Sebuah tingkap segi empat tepat mempunyai luas ${area} cm² dan panjang ${length} cm. Lebar tingkap itu (dalam cm) menjadi sudut engsel kedua pada rel lurus, bersama satu sudut lagi ${givenAngle}°. Berapakah sudut ketiga yang tinggal?`,
      en: `A rectangular hinge panel has an area of ${area} cm² and a length of ${length} cm. Its width (in cm) becomes the second angle on a straight track, alongside another angle of ${givenAngle}°. What is the third, remaining angle?`,
    },
    correctAnswer: String(finalAngle),
    workingHint: {
      ms: `Langkah 1 (luas): ${area} ÷ ${length} = ${width} cm (lebar). Langkah 2 (sudut): 180° − ${width}° − ${givenAngle}° = ${finalAngle}°`,
      en: `Step 1 (area): ${area} ÷ ${length} = ${width} cm (width). Step 2 (angle): 180° − ${width}° − ${givenAngle}° = ${finalAngle}°`,
    },
    values: { area, length, width, givenAngle, correct: finalAngle },
  };
}

/** amount ÷ count, exact to 1 decimal place — e.g. "1 litre shared among
 * 5 kittens = 0.2 litre each". Built backwards from a clean tenths-place
 * share so the division is always exact (no repeating decimals to round
 * awkwardly), matching how this is actually taught before long division
 * of decimals is introduced. */
export function generateEqualShare(
  countOptions: number[] = [2, 4, 5, 8, 10],
  mode: MissionMode = "medium"
): MissionMathDraw {
  const count = pick(biasOptions(countOptions, mode));
  const shareTenths = randInt(1, scaleMax(9, mode, 4)); // the answer, in tenths: e.g. 2 -> 0.2
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
export function generateFractionSubtract(
  denominatorOptions: number[] = [4, 5, 6, 8, 10, 12],
  mode: MissionMode = "medium"
): MissionMathDraw {
  const d = pick(biasOptions(denominatorOptions, mode));
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
export function generateBudgetSubtract(
  pool: BudgetItem[],
  budgetOptions: number[] = [30, 40, 50, 60],
  mode: MissionMode = "medium"
): MissionMathDraw {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const minItems = mode === "easy" ? 2 : 3;
  const maxItems = mode === "hard" ? Math.min(5, pool.length) : Math.min(4, pool.length);
  const itemCount = randInt(minItems, Math.max(minItems, maxItems));
  const items = shuffled.slice(0, itemCount);
  const itemsTotal = items.reduce((sum, it) => sum + it.priceRM, 0);
  const scaledBudgets = mode === "hard" ? budgetOptions.map((b) => b + 20) : budgetOptions;
  const budget = scaledBudgets.find((b) => b > itemsTotal) ?? Math.ceil(itemsTotal / 10) * 10 + 10;
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

export interface UnitPair {
  bigUnit: string;
  smallUnit: string;
  factor: number; // smallUnit per bigUnit, e.g. 1000 for L->mL
  maxBig: number; // upper bound on the bigUnit value (1 decimal place)
}

/** Convert a bigUnit decimal value (1 d.p.) to smallUnit — always exact,
 * since the value is built from tenths and the factor is a power of ten,
 * e.g. "2.5 L -> 2500 mL". */
export function generateUnitConvert(pair: UnitPair, mode: MissionMode = "medium"): MissionMathDraw {
  const tenths = randInt(1, scaleMax(pair.maxBig, mode, 2) * 10);
  const value = tenths / 10;
  const valueStr = value % 1 === 0 ? String(value) : value.toFixed(1);
  const result = Math.round(value * pair.factor);

  return {
    questionText: {
      ms: `${valueStr} ${pair.bigUnit} bersamaan dengan berapa ${pair.smallUnit}?`,
      en: `${valueStr} ${pair.bigUnit} is equal to how many ${pair.smallUnit}?`,
    },
    correctAnswer: String(result),
    workingHint: {
      ms: `${valueStr} ${pair.bigUnit} × ${pair.factor} = ${result} ${pair.smallUnit}`,
      en: `${valueStr} ${pair.bigUnit} × ${pair.factor} = ${result} ${pair.smallUnit}`,
    },
    values: { value: valueStr, bigUnit: pair.bigUnit, smallUnit: pair.smallUnit, correct: result },
  };
}

/** Missing angle in a sum (straight line 180°, right angle 90°, or full
 * turn 360°) — e.g. "one angle is 65° on a straight line, what's the other?" */
export function generateMissingAngle(
  totalOptions: number[] = [90, 180, 360],
  mode: MissionMode = "medium"
): MissionMathDraw {
  const total = pick(totalOptions);
  // Easy keeps the known angle away from the edges (a friendlier split);
  // Hard allows a lopsided split, which is genuinely a bit trickier to
  // eyeball / sanity-check the answer against.
  const margin = mode === "easy" ? Math.round(total * 0.3) : mode === "hard" ? 5 : 10;
  const known = randInt(margin, total - margin);
  const missing = total - known;

  return {
    questionText: {
      ms: `Dua sudut berjumlah ${total}°. Satu sudut ialah ${known}°. Berapakah sudut yang satu lagi?`,
      en: `Two angles add up to ${total}°. One angle is ${known}°. What is the other angle?`,
    },
    correctAnswer: String(missing),
    workingHint: {
      ms: `${total}° − ${known}° = ${missing}°`,
      en: `${total}° − ${known}° = ${missing}°`,
    },
    values: { total, known, correct: missing },
  };
}

export interface DataCategory {
  name: Bilingual;
}

/** Sum of 3 randomly-counted categories, pictograph/tally-style — e.g.
 * "5 apples, 8 mangoes, 6 bananas were counted, how many fruits in total?" */
export function generateDataTotal(categories: DataCategory[], mode: MissionMode = "medium"): MissionMathDraw {
  const shuffled = [...categories].sort(() => Math.random() - 0.5).slice(0, 3);
  const counts = shuffled.map(() => randInt(3, scaleMax(20, mode, 8)));
  const total = counts.reduce((sum, c) => sum + c, 0);

  const listMs = shuffled.map((c, i) => `${c.name.ms}: ${counts[i]}`).join(", ");
  const listEn = shuffled.map((c, i) => `${c.name.en}: ${counts[i]}`).join(", ");

  return {
    questionText: {
      ms: `Data yang dikumpul: ${listMs}. Berapakah jumlah kesemuanya?`,
      en: `Data collected: ${listEn}. What is the total?`,
    },
    correctAnswer: String(total),
    workingHint: {
      ms: `${counts.join(" + ")} = ${total}`,
      en: `${counts.join(" + ")} = ${total}`,
    },
    values: { list: listEn, correct: total },
  };
}

/** Elapsed time in minutes between a start and end 24-hour clock time —
 * built from a random start plus a chosen duration, so the duration is
 * always exact (no clock-arithmetic rounding to fix up). */
export function generateTimeDuration(
  durationOptions: number[] = [15, 30, 45, 60, 90],
  mode: MissionMode = "medium"
): MissionMathDraw {
  const startHour = randInt(6, 18);
  const startMinute = pick([0, 15, 30, 45]);
  const duration = pick(biasOptions(durationOptions, mode));

  const startTotal = startHour * 60 + startMinute;
  const endTotal = startTotal + duration;
  const endHour = Math.floor(endTotal / 60) % 24;
  const endMinute = endTotal % 60;

  const fmt = (h: number, m: number) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const startStr = fmt(startHour, startMinute);
  const endStr = fmt(endHour, endMinute);

  return {
    questionText: {
      ms: `Perjalanan bermula pada ${startStr} dan tamat pada ${endStr}. Berapa minit perjalanan itu mengambil masa?`,
      en: `A journey starts at ${startStr} and ends at ${endStr}. How many minutes did it take?`,
    },
    correctAnswer: String(duration),
    workingHint: {
      ms: `${endStr} − ${startStr} = ${duration} minit`,
      en: `${endStr} − ${startStr} = ${duration} minutes`,
    },
    values: { start: startStr, end: endStr, correct: String(duration) },
  };
}

/** Next term in a simple arithmetic sequence — e.g. "3, 7, 11, 15, 19, ?" */
export function generatePatternMissing(mode: MissionMode = "medium"): MissionMathDraw {
  const start = randInt(2, scaleMax(20, mode, 6));
  const step = randInt(2, scaleMax(9, mode, 3));
  const length = 5;
  const terms = Array.from({ length }, (_, i) => start + step * i);
  const next = start + step * length;

  return {
    questionText: {
      ms: `Apakah nombor seterusnya dalam corak ini? ${terms.join(", ")}, ?`,
      en: `What is the next number in this pattern? ${terms.join(", ")}, ?`,
    },
    correctAnswer: String(next),
    workingHint: {
      ms: `Setiap nombor bertambah ${step}: ${terms[terms.length - 1]} + ${step} = ${next}`,
      en: `Each number increases by ${step}: ${terms[terms.length - 1]} + ${step} = ${next}`,
    },
    values: { sequence: terms.join(", "), step, correct: next },
  };
}

/** a × b, kid-friendly ranges (2-12 each factor) — e.g. "6 rows of 4 gems each". */
export function generateMultiply(maxFactor = 12, mode: MissionMode = "medium"): MissionMathDraw {
  const a = randInt(2, scaleMax(maxFactor, mode, 5));
  const b = randInt(2, scaleMax(maxFactor, mode, 5));
  const correct = a * b;

  return {
    questionText: {
      ms: `Terdapat ${a} kumpulan, setiap satu ada ${b}. Berapakah jumlah kesemuanya?`,
      en: `There are ${a} groups, each with ${b}. What is the total?`,
    },
    correctAnswer: String(correct),
    workingHint: {
      ms: `${a} × ${b} = ${correct}`,
      en: `${a} × ${b} = ${correct}`,
    },
    values: { a, b, correct },
  };
}

/** Same-denominator fraction addition, simplified — e.g. "1/6 + 2/6 = 1/2". */
export function generateFractionAdd(
  denominatorOptions: number[] = [4, 5, 6, 8, 10, 12],
  mode: MissionMode = "medium"
): MissionMathDraw {
  const d = pick(biasOptions(denominatorOptions, mode));
  const a = randInt(1, d - 2);
  const b = randInt(1, d - a - 1);
  const sumNum = a + b;
  const g = gcd(sumNum, d);
  const simpNum = sumNum / g;
  const simpDen = d / g;
  const correct = simpDen === 1 ? String(simpNum) : `${simpNum}/${simpDen}`;

  return {
    questionText: {
      ms: `Berapakah ${a}/${d} tambah ${b}/${d}?`,
      en: `What is ${a}/${d} plus ${b}/${d}?`,
    },
    correctAnswer: correct,
    workingHint: {
      ms: `${a}/${d} + ${b}/${d} = ${sumNum}/${d}${g > 1 ? ` = ${correct} (dipermudahkan)` : ""}`,
      en: `${a}/${d} + ${b}/${d} = ${sumNum}/${d}${g > 1 ? ` = ${correct} (simplified)` : ""}`,
    },
    values: { a, b, d, correct },
  };
}

/** Perimeter of a rectangle — e.g. "8 m long, 5 m wide, how much fencing?" */
export function generatePerimeter(maxSide = 20, mode: MissionMode = "medium"): MissionMathDraw {
  const length = randInt(3, scaleMax(maxSide, mode, 6));
  const width = randInt(2, length);
  const perimeter = 2 * (length + width);

  return {
    questionText: {
      ms: `Panjang ${length} m dan lebar ${width} m. Berapakah jumlah perimeter?`,
      en: `Length ${length} m and width ${width} m. What is the total perimeter?`,
    },
    correctAnswer: String(perimeter),
    workingHint: {
      ms: `2 × (${length} + ${width}) = ${perimeter}`,
      en: `2 × (${length} + ${width}) = ${perimeter}`,
    },
    values: { length, width, correct: perimeter },
  };
}

/** Missing factor in a multiplication — e.g. "? × 6 = 42" -> 7. */
export function generateMissingFactor(maxFactor = 12, mode: MissionMode = "medium"): MissionMathDraw {
  const scaled = scaleMax(maxFactor, mode, 5);
  const known = randInt(2, scaled);
  const missing = randInt(2, scaled);
  const product = known * missing;

  return {
    questionText: {
      ms: `Sebuah nombor didarab dengan ${known} menghasilkan ${product}. Apakah nombor itu?`,
      en: `A number multiplied by ${known} gives ${product}. What is the number?`,
    },
    correctAnswer: String(missing),
    workingHint: {
      ms: `${product} ÷ ${known} = ${missing}`,
      en: `${product} ÷ ${known} = ${missing}`,
    },
    values: { known, product, correct: missing },
  };
}

/**
 * Genuinely multi-step (Hard/Y6) generators — each chains TWO different
 * operations, unlike the single-concept generators above. Every one
 * returns intermediate values in `values` so the mission's workingHint
 * can show both steps explicitly, matching how the curriculum's own
 * "challenge" tier questions are worked through.
 */

/** Sum items, apply a % discount to the total, then find change from a
 * payment amount — chains addition, percentage, and subtraction. */
export function generateMultiStepBudgetDiscount(
  pool: BudgetItem[],
  discountOptions: number[] = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75],
  paymentOptions: number[] = [50, 60, 80, 100, 120]
): MissionMathDraw {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const itemCount = randInt(3, Math.min(5, pool.length));
  const items = shuffled.slice(0, itemCount);
  const itemsTotal = items.reduce((sum, it) => sum + it.priceRM, 0);

  // Work entirely in sen (integer cents) to avoid floating-point drift
  // (e.g. 0.1 + 0.2 !== 0.3) — same reasoning as the curriculum's own
  // formatRM()-based money generators. No divisibility filtering needed:
  // any discount % now produces an exact sen amount via rounding.
  const discountPct = pick(discountOptions);
  const itemsTotalSen = itemsTotal * 100;
  const discountSen = Math.round((itemsTotalSen * discountPct) / 100);
  const finalSen = itemsTotalSen - discountSen;
  const paymentSen = (paymentOptions.find((p) => p * 100 > finalSen) ?? Math.ceil(finalSen / 1000) * 10 + 10) * 100;
  const changeSen = paymentSen - finalSen;

  const fmt = (sen: number) => (sen / 100).toFixed(2);
  const discountAmount = fmt(discountSen);
  const finalPrice = fmt(finalSen);
  const payment = fmt(paymentSen);
  const change = fmt(changeSen);

  const listMs = items.map((it) => `${it.name.ms} = RM${it.priceRM}`).join(", ");
  const listEn = items.map((it) => `${it.name.en} = RM${it.priceRM}`).join(", ");

  return {
    questionText: {
      ms: `Belian: ${listMs}. Diskaun ${discountPct}% dikenakan atas jumlah keseluruhan. Anda bayar dengan RM${payment}. Berapakah baki (bakinya)?`,
      en: `Items bought: ${listEn}. A ${discountPct}% discount applies to the total. You pay with RM${payment}. How much change do you get?`,
    },
    correctAnswer: `RM${change}`,
    workingHint: {
      ms: `Jumlah: RM${itemsTotal}.00. Selepas diskaun ${discountPct}%: RM${itemsTotal}.00 − RM${discountAmount} = RM${finalPrice}. Baki: RM${payment} − RM${finalPrice} = RM${change}`,
      en: `Total: RM${itemsTotal}.00. After ${discountPct}% discount: RM${itemsTotal}.00 − RM${discountAmount} = RM${finalPrice}. Change: RM${payment} − RM${finalPrice} = RM${change}`,
    },
    values: { itemsTotal: `RM${itemsTotal}`, discountPct, finalPrice: `RM${finalPrice}`, payment: `RM${payment}`, correct: `RM${change}` },
  };
}

/** Add two same-denominator fractions, then multiply the sum by a whole
 * number (a "per batch, how much for N batches" style problem) — chains
 * fraction addition and multiplication. */
export function generateMultiStepFractionScale(
  denominatorOptions: number[] = [4, 6, 8, 10, 12],
  multiplierOptions: number[] = [3, 4, 5, 6, 7]
): MissionMathDraw {
  const d = pick(denominatorOptions);
  const a = randInt(1, Math.floor(d / 2) - 1 || 1);
  const b = randInt(1, Math.floor(d / 2) - 1 || 1);
  const sumNum = a + b;
  const multiplier = pick(multiplierOptions);

  // scaled = (sumNum/d) * multiplier, simplified
  const scaledNumRaw = sumNum * multiplier;
  const g1 = gcd(sumNum, d);
  const perBatchNum = sumNum / g1;
  const perBatchDen = d / g1;

  const g2 = gcd(scaledNumRaw, d);
  const finalNum = scaledNumRaw / g2;
  const finalDen = d / g2;
  const whole = Math.floor(finalNum / finalDen);
  const remNum = finalNum - whole * finalDen;
  const correct =
    remNum === 0 ? String(whole) : whole > 0 ? `${whole} ${remNum}/${finalDen}` : `${finalNum}/${finalDen}`;

  return {
    questionText: {
      ms: `Setiap seunit memerlukan ${a}/${d} + ${b}/${d} bahan. Berapakah jumlah bahan diperlukan untuk ${multiplier} unit?`,
      en: `Each unit needs ${a}/${d} + ${b}/${d} of an ingredient. How much is needed for ${multiplier} units?`,
    },
    correctAnswer: correct,
    workingHint: {
      ms: `Seunit: ${a}/${d} + ${b}/${d} = ${perBatchNum}/${perBatchDen}. Untuk ${multiplier} unit: ${perBatchNum}/${perBatchDen} × ${multiplier} = ${correct}`,
      en: `Per unit: ${a}/${d} + ${b}/${d} = ${perBatchNum}/${perBatchDen}. For ${multiplier} units: ${perBatchNum}/${perBatchDen} × ${multiplier} = ${correct}`,
    },
    values: { a, b, d, perBatch: `${perBatchNum}/${perBatchDen}`, multiplier, correct },
  };
}

/** Convert a bigUnit amount to smallUnit, then subtract an amount used —
 * chains unit conversion and subtraction. */
export function generateMultiStepUnitSubtract(pair: UnitPair): MissionMathDraw {
  const tenths = randInt(10, pair.maxBig * 10);
  const value = tenths / 10;
  const valueStr = value % 1 === 0 ? String(value) : value.toFixed(1);
  const totalSmall = Math.round(value * pair.factor);

  // Amount used: a clean fraction of the total so the remainder is a nice number.
  const usedFraction = pick([0.1, 0.2, 0.25, 0.5]);
  const used = Math.round((totalSmall * usedFraction) / 10) * 10; // round to nearest 10 for a clean number
  const remaining = totalSmall - used;

  return {
    questionText: {
      ms: `Terdapat ${valueStr} ${pair.bigUnit}. Selepas ditukar kepada ${pair.smallUnit}, ${used} ${pair.smallUnit} telah digunakan. Berapakah baki?`,
      en: `There are ${valueStr} ${pair.bigUnit}. After converting to ${pair.smallUnit}, ${used} ${pair.smallUnit} was used. How much is left?`,
    },
    correctAnswer: String(remaining),
    workingHint: {
      ms: `${valueStr} ${pair.bigUnit} = ${totalSmall} ${pair.smallUnit}. ${totalSmall} − ${used} = ${remaining} ${pair.smallUnit}`,
      en: `${valueStr} ${pair.bigUnit} = ${totalSmall} ${pair.smallUnit}. ${totalSmall} − ${used} = ${remaining} ${pair.smallUnit}`,
    },
    values: { value: valueStr, bigUnit: pair.bigUnit, smallUnit: pair.smallUnit, totalSmall, used, correct: remaining },
  };
}
