import type { Lang } from "@/lib/i18n/dictionary";
import { Bi } from "@/lib/i18n/Bi";
import { OPTION_LABELS } from "@/lib/questions/optionLabels";
import { formatAnswerForDisplay } from "@/lib/questions/grading";
import { renderMathText } from "@/lib/ui/mathText";

/**
 * Renders one MCQ option's display text: a bilingual label for
 * categorical answers (e.g. "equally_likely" -> "Equally Likely" /
 * "Sama Kemungkinan"), or the formatted raw value for numeric/fraction
 * answers. Shared across every surface that shows MCQ options
 * (QuestionPlayer, QuizPlayer, ExamFlow) so a student never sees a raw
 * storage key on any one of them while another shows the translated
 * label — same class of drift as the missing-diagram bug, fixed the
 * same way (one shared piece instead of three copies).
 */
export function OptionLabel({ value, lang }: { value: string; lang: Lang }) {
  const entry = OPTION_LABELS[value];
  if (!entry) return <>{renderMathText(formatAnswerForDisplay(value))}</>;
  return <Bi text={entry} lang={lang} />;
}

/** Tailwind class for an option button's text style — categorical answers
 * read as regular text (font-body), numeric/fraction answers stay in the
 * monospace "congak" number treatment (font-num). */
export function optionFontClass(value: string): string {
  return OPTION_LABELS[value] ? "font-body" : "font-num";
}
