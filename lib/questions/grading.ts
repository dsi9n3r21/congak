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
 * whitespace, and lowercases. None of Congak's generators ever use a comma
 * as anything other than a thousands separator (checked against every
 * `correctAnswer:` in lib/questions/generators/*.ts — fractions use "/",
 * money uses "RM12.50", no generator emits a comma-joined list), so
 * stripping commas is safe across every topic. */
export function normalizeAnswer(raw: string): string {
  return raw
    .trim()
    .replace(/,/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
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
