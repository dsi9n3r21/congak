"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Bi } from "@/lib/i18n/Bi";
import type { Bilingual, Lang } from "@/lib/i18n/dictionary";

export interface YearTopicItem {
  id: string;
  strand: Bilingual;
  title: Bilingual;
  href: string;
  /** Learn mode: mastery percentage, if the student has attempted this topic. */
  score?: number;
  /** Practice mode: whether topic_mastery flagged this as a weak topic. */
  weak?: boolean;
}

export interface YearGroup {
  year: number;
  topics: YearTopicItem[];
}

// Shared by /learn and /practice: both used to render every year's topics
// stacked as long sections on one page, which got unwieldy once the topic
// count passed 70+. This swaps that for a year tab picker — pick a year,
// see just that year's topics — reusing the exact segmented-button look
// from the Tahun picker on profile setup (border-kuning + bg-kuning-light
// for the selected state) so it doesn't feel like a bolted-on new pattern.
export function TopicYearBrowser({
  groups,
  lang,
  studentYear,
  emptyText,
}: {
  groups: YearGroup[];
  lang: Lang;
  studentYear?: number;
  emptyText: Bilingual;
}) {
  const availableYears = groups.filter((g) => g.topics.length > 0).map((g) => g.year);
  const initialYear = studentYear && availableYears.includes(studentYear) ? studentYear : availableYears[0];
  const [selectedYear, setSelectedYear] = useState<number | undefined>(initialYear);

  const active = groups.find((g) => g.year === selectedYear);

  return (
    <>
      <div className="mx-5 mt-2 flex gap-2">
        {groups.map((g) => (
          <button
            key={g.year}
            type="button"
            disabled={g.topics.length === 0}
            onClick={() => setSelectedYear(g.year)}
            className={clsx(
              "flex-1 rounded-kite border-2 py-3 text-center font-num font-semibold transition-colors min-h-[44px] disabled:opacity-30",
              selectedYear === g.year ? "border-kuning bg-kuning-light text-kuning-dark" : "border-ink/10 text-ink/60"
            )}
          >
            {lang === "en" ? "Year" : "Tahun"} {g.year}
            {studentYear === g.year && (
              <span className="mt-0.5 block text-[9px] font-normal normal-case tracking-normal text-ink/40">
                {lang === "en" ? "your year" : "tahun anda"}
              </span>
            )}
          </button>
        ))}
      </div>

      <section className="mx-5 mt-4">
        {active && active.topics.length > 0 ? (
          <div className="space-y-2">
            {active.topics.map((topic) => (
              <Link
                key={topic.id}
                href={topic.href}
                className="block rounded-kite bg-white p-4 shadow-card active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-kuning-dark">
                      <Bi text={topic.strand} lang={lang} />
                    </p>
                    <p className="font-display text-base font-bold text-ink">
                      <Bi text={topic.title} lang={lang} />
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {topic.weak && (
                      <span className="rounded-full bg-saga-light px-2 py-1 text-[10px] font-semibold text-saga-dark">
                        {lang === "en" ? "Weak" : "Lemah"}
                      </span>
                    )}
                    {topic.score !== undefined && (
                      <p className="font-num text-sm font-bold text-ink/60">{topic.score}%</p>
                    )}
                  </div>
                </div>
                {topic.score !== undefined && (
                  <div className="mt-2 h-1 w-full rounded-full bg-ink/10">
                    <div
                      className={`h-1 rounded-full ${topic.score < 50 ? "bg-saga" : "bg-pandan"}`}
                      style={{ width: `${topic.score}%` }}
                    />
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-ink/40">
            <Bi text={emptyText} lang={lang} />
          </p>
        )}
      </section>
    </>
  );
}
