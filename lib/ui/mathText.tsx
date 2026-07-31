import { Fragment, type ReactNode } from "react";

/**
 * Re-typesets inline fraction notation the way it's written on paper —
 * numerator over a dividing bar over denominator — instead of a flat
 * "2/5" string. Flat slash notation is genuinely harder for a Year 4-6
 * student to parse as one quantity; stacked notation is what they see
 * in their textbooks and write in their own working, so content authored
 * as "2/5" or "3 2/7" (mixed number) in tips/explanations/questions
 * should render stacked wherever it's shown to the student.
 *
 * Matches an optional whole-number part (the "3 " in a mixed number)
 * followed by num/den, both 1-3 digits — generous enough for anything
 * in the Y4-6 KSSR fraction curriculum, tight enough that it won't
 * false-positive on things like "km/h" (no digits) or ratios written
 * with a colon rather than a slash.
 */
const FRACTION_PATTERN = /(\d+\s+)?(\d{1,3})\/(\d{1,3})/g;

export function renderMathText(text: string): ReactNode {
  if (!text.includes("/")) return text;

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  const re = new RegExp(FRACTION_PATTERN);
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    const [full, wholePart, num, den] = match;
    if (match.index > lastIndex) {
      nodes.push(<Fragment key={`t-${key++}`}>{text.slice(lastIndex, match.index)}</Fragment>);
    }
    nodes.push(
      <span key={`f-${key++}`} className="mx-[2px] inline-flex items-center gap-[3px] align-middle">
        {wholePart && <span>{wholePart.trim()}</span>}
        <span className="inline-flex min-w-[1em] flex-col items-stretch text-center leading-[1.15]">
          <span className="px-[1px] text-[0.78em]">{num}</span>
          <span className="border-t-2 border-current" />
          <span className="px-[1px] text-[0.78em]">{den}</span>
        </span>
      </span>
    );
    lastIndex = match.index + full.length;
  }
  if (lastIndex < text.length) {
    nodes.push(<Fragment key={`t-${key++}`}>{text.slice(lastIndex)}</Fragment>);
  }
  return <>{nodes}</>;
}
