import Link from "next/link";
import { Coffee, Mail } from "lucide-react";
import { Bi } from "@/lib/i18n/Bi";
import type { Lang } from "@/lib/i18n/dictionary";
import { COFFEE } from "@/lib/content/coffeeCopy";

/** Small support footer: a link to /coffee, and the feedback email.
 * Used on the public marketing homepage and the parent dashboard —
 * deliberately NOT on student-facing screens, since the "support us
 * financially" and "email us feedback" asks are really for the adult
 * in the relationship, not the child using the app. */
export function SupportFooter({ lang = "both" }: { lang?: Lang }) {
  return (
    <section className="mx-5 mt-8 flex flex-col items-center gap-3 border-t border-ink/10 pt-6 text-center">
      <Link
        href="/coffee"
        className="inline-flex items-center gap-1.5 rounded-full bg-kuning-light px-4 py-2 text-sm font-bold text-kuning-dark"
      >
        <Coffee size={16} strokeWidth={2.5} />
        <Bi text={{ ms: "Belanja Congak Kopi", en: "Buy Congak a Coffee" }} lang={lang} />
      </Link>
      <p className="flex items-center gap-1.5 text-xs text-ink/50">
        <Mail size={13} strokeWidth={2.5} />
        <a href={`mailto:${COFFEE.feedbackEmail}`} className="underline">
          {COFFEE.feedbackEmail}
        </a>
      </p>
    </section>
  );
}
