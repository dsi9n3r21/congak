/**
 * Renders the classic "stack and multiply column by column" written
 * method for whole-number multiplication — the format every Malaysian
 * primary textbook uses — as a companion to VerticalArithmetic (which
 * only handles +/−). Multiplication needed its own layout because of
 * partial products: a 1-digit multiplier is a single row (no partial
 * products needed, same shape as add/subtract), but a 2-digit multiplier
 * needs two partial-product rows — the tens-digit row shifted one column
 * left — summed underneath.
 *
 * Only supports whole-number operands with a multiplier up to 2 digits
 * (every whole-number multiplication topic in the curriculum today:
 * ×1-digit, ×2-digit, 4-digit×2-digit). Decimal and fraction
 * multiplication use different methods entirely and aren't handled here.
 */
import { Fragment } from "react";

export interface LongMultiplicationProps {
  /** Exact operand strings from the topic's own worked example, e.g.
   * "1245" and "4". Digits only, no decimal point. */
  multiplicand: string;
  multiplier: string;
  /** The exact result string from the same worked example. */
  result: string;
}

function cellsFor(str: string, totalWidth: number, trailingBlanks = 0): string[] {
  const padded = str.padStart(Math.max(0, totalWidth - trailingBlanks), "\u00A0");
  return [...padded.split(""), ...Array(trailingBlanks).fill("\u00A0")];
}

export function LongMultiplicationDiagram({ multiplicand, multiplier, result }: LongMultiplicationProps) {
  const totalWidth = Math.max(multiplicand.length, result.length, multiplier.length + multiplicand.length);
  const multiplierDigits = multiplier.split("").reverse(); // ones digit first

  const partials = multiplierDigits.map((d) => String(Number(multiplicand) * Number(d)));
  const needsPartialRows = multiplierDigits.length > 1;

  const rows: { cells: string[]; operatorCell: string; rule?: boolean }[] = [
    { cells: cellsFor(multiplicand, totalWidth), operatorCell: "" },
    { cells: cellsFor(multiplier, totalWidth), operatorCell: "\u00d7", rule: true },
  ];

  if (needsPartialRows) {
    multiplierDigits.forEach((_, i) => {
      rows.push({ cells: cellsFor(partials[i], totalWidth, i), operatorCell: "" });
    });
    rows[rows.length - 1].rule = true;
  }

  rows.push({ cells: cellsFor(result, totalWidth), operatorCell: "" });

  const templateColumns = `1.5em repeat(${totalWidth}, 1ch)`;

  return (
    <div
      role="img"
      aria-label={`${multiplicand} \u00d7 ${multiplier} = ${result}, shown as a long multiplication`}
      className="mx-auto inline-grid justify-center gap-x-0 gap-y-1.5 rounded-kite border-2 border-biru-light bg-white px-5 py-4 font-num text-lg font-bold text-ink sm:text-xl"
      style={{ gridTemplateColumns: templateColumns }}
    >
      {rows.map((row, i) => (
        <Fragment key={i}>
          <span className="text-center">{row.operatorCell}</span>
          {row.cells.map((c, j) => (
            <span key={j} className="text-center">
              {c}
            </span>
          ))}
          {row.rule && (
            <div className="border-t-2 border-ink" style={{ gridColumn: `1 / span ${totalWidth + 1}` }} />
          )}
        </Fragment>
      ))}
    </div>
  );
}
