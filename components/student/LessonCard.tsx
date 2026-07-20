"use client";

import { useState } from "react";
import clsx from "clsx";
import type { TopicContent } from "@/lib/content/topics";
import type { Lang } from "@/lib/i18n/dictionary";
import { Bi } from "@/lib/i18n/Bi";
import { UI } from "@/lib/i18n/dictionary";

const TAB_KEYS = ["learnTabLearn", "learnTabHowTo", "learnTabTips", "learnTabExample", "learnTabMistakes"] as const;
type TabKey = (typeof TAB_KEYS)[number];

export function LessonCard({ topic, lang }: { topic: TopicContent; lang: Lang }) {
  const [tab, setTab] = useState<TabKey>("learnTabLearn");

  return (
    <div className="rounded-kite bg-white shadow-card">
      <div className="flex gap-1 overflow-x-auto border-b border-kuning-light px-3 pt-3">
        {TAB_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={clsx(
              "whitespace-nowrap rounded-t-lg px-3 py-2 text-sm font-semibold min-h-[44px]",
              tab === key ? "bg-kuning-light text-kuning-dark" : "text-ink/50"
            )}
          >
            <Bi text={UI[key]} lang={lang} />
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === "learnTabLearn" && (
          <p className="whitespace-pre-line font-body text-[15px] leading-relaxed text-ink">
            <Bi text={topic.explanation} lang={lang} />
          </p>
        )}

        {tab === "learnTabHowTo" && (
          <ol className="space-y-2.5">
            {topic.howTo.map((step, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-ink">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-biru-light font-num font-bold text-biru-dark">
                  {i + 1}
                </span>
                <span className="pt-0.5">
                  <Bi text={step} lang={lang} />
                </span>
              </li>
            ))}
          </ol>
        )}

        {tab === "learnTabTips" && (
          <div className="space-y-3">
            {topic.tips.map((tip, i) => (
              <div key={i} className="flex gap-3 rounded-kite bg-pandan-light p-4">
                <span className="text-xl">💡</span>
                <p className="font-body text-[15px] leading-relaxed text-ink">
                  <Bi text={tip} lang={lang} />
                </p>
              </div>
            ))}
          </div>
        )}

        {tab === "learnTabExample" && (
          <div>
            <p className="font-num text-lg font-bold text-biru-dark">{topic.workedExample.problem}</p>
            <ol className="mt-3 space-y-2">
              {topic.workedExample.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink">
                  <span className="font-num font-semibold text-biru">{i + 1}.</span>
                  <Bi text={step} lang={lang} />
                </li>
              ))}
            </ol>
            <p className="mt-4 rounded-lg bg-biru-light px-3 py-2 font-num text-base font-bold text-biru-dark">
              <Bi text={UI.answerLabel} lang={lang} />: {topic.workedExample.answer}
            </p>
          </div>
        )}

        {tab === "learnTabMistakes" && (
          <ul className="space-y-3">
            {topic.commonMistakes.map((m) => (
              <li key={m.mistakeType} className="flex gap-2 rounded-kite bg-saga-light/50 p-3">
                <span className="text-lg">⚠️</span>
                <p className="text-sm text-ink">
                  <Bi text={m.description} lang={lang} />
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
