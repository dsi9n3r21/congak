/**
 * Renders the classic "stack the numbers, line up the decimal points,
 * add/subtract column by column" written method — the format every
 * Malaysian primary maths textbook uses for addition and subtraction,
 * distinct from the plain "12.50 + 3.20 = 15.70" inline text a worked
 * example's `problem` field shows. Add this alongside that text (not
 * instead of it) wherever a worked example is addition or subtraction.
 *
 * Each operand and the result get padded to a shared column grid:
 * missing decimal digits are padded with an explicit trailing "0" (the
 * mathematically correct thing to do — 8.8 becomes 8.80 to line up with
 * 6.16, never blank), while missing integer digits are padded with a
 * blank so nothing looks like a false leading zero.
 *
 * Only handles 2-3 operands with a single +/− operator, which is every
 * addition/subtraction worked example in the curriculum today. Doesn't
 * attempt long multiplication or long division — those use a
 * structurally different layout (partial products / bus-stop division)
 * and would need their own component if wanted later.
 */
export interface VerticalArithmeticProps {
  /** Exact operand strings from the topic's own worked example — e.g.
   * ["12.50", "3.20"] or ["45230", "5820", "1200"]. Never invent
   * different numbers than what the surrounding text already says. */
  operands: string[];
  operator: "+" | "\u2212";
  /** The exact result string from the same worked example. */
  result: string;
  /** Shown before every row's digits, e.g. "RM" for money topics. */
  prefix?: string;
}

function splitNumber(value: string): { intPart: string; decPart: string } {
  const [intPart, decPart = ""] = value.split(".");
  return { intPart, decPart };
}

export function VerticalArithmetic({ operands, operator, result, prefix }: VerticalArithmeticProps) {
  const allRows = [...operands, result];
  const split = allRows.map(splitNumber);
  const maxIntLen = Math.max(...split.map((s) => s.intPart.length));
  const maxDecLen = Math.max(...split.map((s) => s.decPart.length));
  const hasDecimal = maxDecLen > 0;

  function cellsFor(intPart: string, decPart: string): string[] {
    const cells = intPart.padStart(maxIntLen, "\u00A0").split("");
    if (hasDecimal) {
      cells.push(".");
      cells.push(...decPart.padEnd(maxDecLen, "0").split(""));
    }
    return cells;
  }

  const digitColumnCount = maxIntLen + (hasDecimal ? 1 + maxDecLen : 0);
  const templateColumns = `${prefix ? "auto " : ""}1.5em repeat(${digitColumnCount}, 1ch)`;

  return (
    <div
      role="img"
      aria-label={`${operands.join(` ${operator} `)} = ${result}, shown as a vertical column sum`}
      className="mx-auto inline-grid justify-center gap-x-0 gap-y-1.5 rounded-kite border-2 border-biru-light bg-white px-5 py-4 font-num text-lg font-bold text-ink sm:text-xl"
      style={{ gridTemplateColumns: templateColumns }}
    >
      {operands.map((op, rowIndex) => {
        const { intPart, decPart } = split[rowIndex];
        const isLastOperand = rowIndex === operands.length - 1;
        return (
          <RowCells
            key={rowIndex}
            prefix={prefix}
            operatorCell={isLastOperand ? operator : ""}
            cells={cellsFor(intPart, decPart)}
          />
        );
      })}
      {/* Rule above the result, spanning every column including the
          operator/prefix cells. */}
      <div
        className="border-t-2 border-ink"
        style={{ gridColumn: `1 / span ${digitColumnCount + 1 + (prefix ? 1 : 0)}` }}
      />
      <RowCells prefix={prefix} operatorCell="" cells={cellsFor(split[operands.length].intPart, split[operands.length].decPart)} />
    </div>
  );
}

function RowCells({ prefix, operatorCell, cells }: { prefix?: string; operatorCell: string; cells: string[] }) {
  return (
    <>
      {prefix && <span className="pr-1 text-right text-ink/50">{prefix}</span>}
      <span className="text-center">{operatorCell}</span>
      {cells.map((c, i) => (
        <span key={i} className="text-center">
          {c}
        </span>
      ))}
    </>
  );
}
