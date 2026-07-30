import type { Bilingual, Lang } from "./dictionary";
import { renderMathText } from "@/lib/ui/mathText";

/**
 * Renders per the student's language_pref: 'ms' or 'en' shows just that
 * language; 'both' shows Bahasa Malaysia as the primary line with English
 * underneath in smaller muted text — mirrors how real DLP-transition exam
 * papers print both languages together, rather than a toggle that hides one.
 */
export function Bi({ text, lang, className = "" }: { text: Bilingual; lang: Lang; className?: string }) {
  if (lang === "ms") return <span className={className}>{renderMathText(text.ms)}</span>;
  if (lang === "en") return <span className={className}>{renderMathText(text.en)}</span>;
  return (
    <span className={className}>
      {renderMathText(text.ms)}
      <span className="block text-[0.85em] font-normal italic text-ink/50">{renderMathText(text.en)}</span>
    </span>
  );
}
