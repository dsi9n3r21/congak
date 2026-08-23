// Shared answer-comparison logic for Practice (QuestionPlayer), Quiz, and
// Exam. Previously each of the three did its own `raw.trim() ===
// correctAnswer`, which marks a genuinely correct numeric answer wrong the
// moment a student adds thousands-separator commas (e.g. typing "751,162"
// when the stored correctAnswer is "751162") — exactly the format the app's
// own question prompts display large numbers in, so students copying that
// convention got penalised for it. Centralised here so Practice/Quiz/Exam
// can't drift out of sync on what counts as "the same answer" again.

/** Normalises a student or stored answer before comparison: trims outer
 * whitespace, strips thousands-separator commas, collapses internal
 * whitespace, lowercases, and drops a trailing UNIT LABEL directly after
 * a number (e.g. "10080ml" or "10080 mL" -> "10080") when doing so
 * leaves a purely numeric value. Found via a real report: a mission
 * asks "how much water is left" and its own hint text shows the answer
 * WITH a unit ("10080 mL"), so a student typing it back exactly as
 * shown — "10,080mL" — was marked wrong even though the number was
 * correct, because the stored correctAnswer is the bare number "10080"
 * with no unit. The unit-strip only fires when what's left is plain
 * digits (optionally one decimal point): checked against every
 * `correctAnswer:` in lib/missions/missionMath.ts and
 * lib/questions/generators/*.ts, nothing relies on a trailing letter
 * suffix surviving comparison (fractions use "/", money uses a "RM"
 * PREFIX not a suffix, MCQ/word answers don't start with a digit so
 * never match this pattern) — so this is safe across every topic. */
export function normalizeAnswer(raw: string): string {
  let s = raw
    .trim()
    .replace(/,/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
  const withUnitStripped = s.match(/^(\d+(\.\d+)?)\s*[a-z]+$/);
  if (withUnitStripped) s = withUnitStripped[1];
  return s;
}

export function isAnswerCorrect(studentAnswer: string, correctAnswer: string): boolean {
  return normalizeAnswer(studentAnswer) === normalizeAnswer(correctAnswer);
}

/** Formats a stored correctAnswer for display in feedback (e.g. "751162" ->
 * "751,162"). Purely cosmetic — the raw value is still what's stored/graded;
 * this just mirrors the comma-grouping the question prompts themselves
 * already use (see wholeNumbers* generators), so the feedback reads the same
 * way the question did. Leaves non-plain-integer answers (fractions, RM
 * amounts, MCQ option keys, decimals) untouched. */
export function formatAnswerForDisplay(answer: string): string {
  if (/^\d+$/.test(answer) && answer.length > 3) {
    return Number(answer).toLocaleString("en-US");
  }
  return answer;
}
