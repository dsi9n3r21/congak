/**
 * Renders the classic "bus stop" long division written method WITH the
 * full subtraction staircase (bring-down digits, subtract, repeat) —
 * matching how it's taught on paper: divisor to the left of a bracket,
 * dividend under the bracket, quotient digits on the roof, and one
 * subtraction + bring-down row pair per step underneath.
 *
 * Works for any whole-number divisor (1 or 2 digits — every division
 * topic in the curriculum uses one or the other) and for a dividend with
 * an optional single decimal point (the quotient's decimal point lands
 * in the same column as the dividend's, per the "divide as usual, put
 * the point back" method — same convention `LongMultiplicationDiagram`
 * and `VerticalArithmetic` use for their own decimal handling).
 *
 * The whole staircase — which digits get consumed per step, where each
 * subtraction and bring-down row lands — is computed here from the raw
 * dividend/divisor, not passed in, so it's always internally consistent.
 */
import { Fragment } from "react";

export interface LongDivisionProps {
  /** Dividend as written in the worked example, e.g. "1288", "738", "7.2".
   * At most one decimal point. */
  dividend: string;
  /** Divisor — a whole number, 1 or 2 digits. */
  divisor: number;
}

interface Step {
  endIndex: number; // index into the digit-only array where this step's number ends
  broughtDown: string; // the digit-only string being divided at this step
  quotientDigit: number;
  product: number;
  remainder: number;
}

function computeSteps(digits: number[], divisor: number): Step[] {
  const steps: Step[] = [];
  let idx = 0;
  let current = 0;
  let currentStr = "";

  while (idx < digits.length) {
    current = current * 10 + digits[idx];
    currentStr += digits[idx];
    idx++;
    if (current >= divisor) break;
  }

  while (true) {
    const quotientDigit = Math.floor(current / divisor);
    const product = quotientDigit * divisor;
    const remainder = current - product;
    steps.push({ endIndex: idx - 1, broughtDown: currentStr, quotientDigit, product, remainder });
    if (idx >= digits.length) break;
    current = remainder * 10 + digits[idx];
    currentStr = String(current);
    idx++;
  }
  return steps;
}

/** Places `value`'s digits into a totalCols-wide row, rightmost digit at
 * displayEndCol, skipping over the decimal-point column if the span
 * would otherwise land on it. */
function placeRow(value: string, displayEndCol: number, totalCols: number, decimalCol: number | null): string[] {
  const cells: string[] = Array(totalCols).fill("");
  let col = displayEndCol;
  for (let i = value.length - 1; i >= 0; i--) {
    while (col === decimalCol) col--;
    if (col < 0) break;
    cells[col] = value[i];
    col--;
  }
  return cells;
}

export function LongDivisionDiagram({ dividend, divisor }: LongDivisionProps) {
  const displayChars = dividend.split("");
  const decimalIdx = displayChars.indexOf(".");
  const decimalCol = decimalIdx === -1 ? null : decimalIdx;

  const digitPositions: number[] = [];
  const digits: number[] = [];
  displayChars.forEach((c, i) => {
    if (c !== ".") {
      digitPositions.push(i);
      digits.push(Number(c));
    }
  });

  const totalCols = displayChars.length;
  const steps = computeSteps(digits, divisor);

  const quotientCells: string[] = Array(totalCols).fill("");
  steps.forEach((s) => {
    quotientCells[digitPositions[s.endIndex]] = String(s.quotientDigit);
  });
  if (decimalCol !== null) quotientCells[decimalCol] = ".";

  interface Row {
    cells: string[];
    sign: string;
    bottomRule: boolean;
    arrowCol: number | null;
  }
  const staircase: Row[] = [];
  steps.forEach((s, i) => {
    const endCol = digitPositions[s.endIndex];
    staircase.push({ cells: placeRow(String(s.product), endCol, totalCols, decimalCol), sign: "\u2212", bottomRule: true, arrowCol: null });
    const next = steps[i + 1];
    if (next) {
      const nextEndCol = digitPositions[next.endIndex];
      staircase.push({
        cells: placeRow(next.broughtDown, nextEndCol, totalCols, decimalCol),
        sign: "",
        bottomRule: false,
        arrowCol: nextEndCol,
      });
    } else {
      const remainderStr = String(s.remainder).padStart(String(s.product).length, "0");
      staircase.push({ cells: placeRow(remainderStr, endCol, totalCols, decimalCol), sign: "", bottomRule: false, arrowCol: null });
    }
  });

  const gridTemplate = `2.2em 1em repeat(${totalCols}, 1.15em)`;

  return (
    <div
      role="img"
      aria-label={`${dividend} \u00f7 ${divisor}, shown as a long division`}
      className="mx-auto inline-grid gap-y-0.5 gap-x-0 rounded-kite border-2 border-biru-light bg-white px-4 py-4 font-num text-lg font-bold text-ink sm:text-xl"
      style={{ gridTemplateColumns: gridTemplate }}
    >
      {/* quotient row (also the bracket roofline, via bottom border) */}
      <span />
      <span />
      {quotientCells.map((c, j) => (
        <span key={`q-${j}`} className="border-b-2 border-ink pb-1 text-center">
          {c || "\u00A0"}
        </span>
      ))}

      {/* divisor + dividend row */}
      <span className="flex items-center justify-end pr-1 text-right">{divisor}</span>
      <span />
      {displayChars.map((c, j) => (
        <span key={`d-${j}`} className={`text-center ${j === 0 ? "border-l-2 border-ink" : ""}`}>
          {c}
        </span>
      ))}

      {/* staircase: subtraction row, optional arrow row, result row — per step */}
      {staircase.map((row, i) => (
        <Fragment key={`row-${i}`}>
          {row.arrowCol !== null && (
            <>
              <span />
              <span />
              {Array.from({ length: totalCols }, (_, j) => (
                <span key={`arrow-${i}-${j}`} className={`text-center text-sm text-saga ${j === 0 ? "border-l-2 border-ink" : ""}`}>
                  {j === row.arrowCol ? "\u2193" : "\u00A0"}
                </span>
              ))}
            </>
          )}
          <span />
          <span className={`text-center ${row.bottomRule ? "border-b-2 border-ink pb-0.5" : ""}`}>{row.sign}</span>
          {row.cells.map((c, j) => (
            <span
              key={`row-${i}-${j}`}
              className={`text-center ${row.bottomRule ? "border-b-2 border-ink pb-0.5" : ""} ${j === 0 ? "border-l-2 border-ink" : ""}`}
            >
              {c || "\u00A0"}
            </span>
          ))}
        </Fragment>
      ))}
    </div>
  );
}
