"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Star } from "lucide-react";
import { Bi } from "@/lib/i18n/Bi";
import type { Bilingual, Lang } from "@/lib/i18n/dictionary";
import { getStrandStyle } from "@/lib/content/strandStyle";

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
// see just that year's topics. Year pills and topic-card icon badges now
// match Lynda's reference design: selected year is a solid purple pill
// with a star mark for "your year" (was a yellow outline before), and
// each topic gets a colored icon square keyed to its strand instead of a
// plain text label.
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
        {groups.map((g) => {
          const isSelected = selectedYear === g.year;
          const isStudentYear = studentYear === g.year;
          return (
            <button
              key={g.year}
              type="button"
              disabled={g.topics.length === 0}
              onClick={() => setSelectedYear(g.year)}
              className={clsx(
                "flex-1 rounded-kite border-2 py-2.5 text-center font-num font-semibold transition-colors min-h-[44px] disabled:opacity-30",
                isSelected ? "border-ungu bg-ungu text-paper shadow-card" : "border-ink/10 text-ink/60"
              )}
            >
              <span className="inline-flex items-center gap-1">
                {lang === "en" ? "Year" : "Tahun"} {g.year}
                {isStudentYear && <Star size={12} className={isSelected ? "fill-kuning-light text-kuning-light" : "fill-kuning text-kuning"} />}
              </span>
              {isStudentYear && (
                <span className={clsx("mt-0.5 block text-[9px] font-normal normal-case tracking-normal", isSelected ? "text-paper/80" : "text-ink/40")}>
                  {lang === "en" ? "your year" : "tahun anda"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <section className="mx-5 mt-4">
        {active && active.topics.length > 0 ? (
          <div className="space-y-2">
            {active.topics.map((topic) => {
              const { Icon, bg, fg } = getStrandStyle(topic.strand.en);
              return (
                <Link
                  key={topic.id}
                  href={topic.href}
                  className="flex items-center gap-3 rounded-kite bg-white p-4 shadow-card active:scale-[0.98] transition-transform"
                >
                  <span className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-kite", bg)}>
                    <Icon size={20} className={fg} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-ink/50">
                      <Bi text={topic.strand} lang={lang} />
                    </p>
                    <p className="truncate font-display text-base font-bold text-ink">
                      <Bi text={topic.title} lang={lang} />
                    </p>
                    {topic.score !== undefined && (
                      <div className="mt-1.5 h-1 w-full rounded-full bg-ink/10">
                        <div
                          className={`h-1 rounded-full ${topic.score < 50 ? "bg-saga" : "bg-pandan"}`}
                          style={{ width: `${topic.score}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="shrink-0">
                    {topic.weak && (
                      <span className="rounded-full bg-saga-light px-2 py-1 text-[10px] font-semibold text-saga-dark">
                        {lang === "en" ? "Weak" : "Lemah"}
                      </span>
                    )}
                    {topic.weak === false && (
                      <span className="rounded-full bg-pandan-light px-2 py-1 text-[10px] font-semibold text-pandan-dark">
                        {lang === "en" ? "Good" : "Baik"}
                      </span>
                    )}
                    {topic.score !== undefined && (
                      <p className="text-right font-num text-sm font-bold text-ink/60">{topic.score}%</p>
                    )}
                  </div>
                </Link>
              );
            })}
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
