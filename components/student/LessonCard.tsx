"use client";

import { useState } from "react";
import clsx from "clsx";
import type { TopicContent } from "@/lib/content/topics";
import type { Lang, Bilingual } from "@/lib/i18n/dictionary";
import { Bi } from "@/lib/i18n/Bi";
import { UI } from "@/lib/i18n/dictionary";
import { renderMathText } from "@/lib/ui/mathText";
import { QuestionDiagram } from "@/components/student/diagrams/QuestionDiagram";
import type { DiagramSpec } from "@/lib/questions/types";

const TAB_KEYS = ["learnTabLearn", "learnTabHowTo", "learnTabTips", "learnTabExample", "learnTabMistakes"] as const;
type TabKey = (typeof TAB_KEYS)[number];

export function LessonCard({ topic, lang }: { topic: TopicContent; lang: Lang }) {
  const [tab, setTab] = useState<TabKey>("learnTabLearn");

  // Explanation text carries an "everyday example" as a second paragraph
  // (separated by a blank line) in most topics — split it out into its own
  // highlighted callout instead of letting it run on as more plain text.
  const explanationText = lang === "ms" ? topic.explanation.ms : topic.explanation.en;
  const [leadParagraph, ...restParagraphs] = explanationText.split("\n\n");

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
          <div className="space-y-4">
            <p className="whitespace-pre-line font-body text-[15px] leading-relaxed text-ink">{leadParagraph}</p>
            {restParagraphs.map((para, i) => (
              <div key={i} className="rounded-kite bg-kuning-light/50 p-4">
                <p className="whitespace-pre-line font-body text-[15px] leading-relaxed text-ink">{para}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "learnTabHowTo" && (
          <ol className="space-y-3">
            {topic.howTo.map((step, i) => (
              <li key={i} className="flex items-start gap-3 rounded-kite bg-paper px-4 py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-biru-light font-num font-bold text-biru-dark">
                  {i + 1}
                </span>
                <span className="pt-1 font-body text-[15px] leading-relaxed text-ink">
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
          <div className="space-y-6">
            <ExampleCard
              label={topic.moreExamples?.length ? (lang === "ms" ? "Contoh 1" : "Example 1") : undefined}
              example={topic.workedExample}
              lang={lang}
            />
            {topic.moreExamples?.map((ex, i) => (
              <ExampleCard
                key={i}
                label={lang === "ms" ? `Contoh ${i + 2}` : `Example ${i + 2}`}
                example={ex}
                lang={lang}
              />
            ))}
          </div>
        )}

        {tab === "learnTabMistakes" && (
          <ul className="space-y-5">
            {topic.commonMistakes.map((m) => (
              <li key={m.mistakeType}>
                <div className="flex gap-2 rounded-t-kite bg-saga-light/50 p-3">
                  <span className="text-lg">⚠️</span>
                  <p className="text-sm font-semibold text-ink">
                    <Bi text={m.description} lang={lang} />
                  </p>
                </div>
                {m.wrongSteps && m.correctSteps && (
                  <div className="grid gap-3 rounded-b-kite border border-t-0 border-saga-light/50 p-3 sm:grid-cols-2">
                    <div className="rounded-kite border-2 border-saga bg-saga-light/40 p-3">
                      <p className="mb-2 flex items-center gap-1.5 font-display text-sm font-bold text-saga-dark">
                        ❌ <Bi text={UI.mistakeWrongWay} lang={lang} />
                      </p>
                      <ol className="space-y-1.5">
                        {m.wrongSteps.map((step, i) => (
                          <li key={i} className="font-num text-sm leading-relaxed text-ink">
                            <Bi text={step} lang={lang} />
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="rounded-kite border-2 border-pandan bg-pandan-light/40 p-3">
                      <p className="mb-2 flex items-center gap-1.5 font-display text-sm font-bold text-pandan-dark">
                        ✅ <Bi text={UI.mistakeRightWay} lang={lang} />
                      </p>
                      <ol className="space-y-1.5">
                        {m.correctSteps.map((step, i) => (
                          <li key={i} className="font-num text-sm leading-relaxed text-ink">
                            <Bi text={step} lang={lang} />
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ExampleCard({
  label,
  example,
  lang,
}: {
  label?: string;
  example: { problem: Bilingual; steps: Bilingual[]; answer: string | number; diagram?: DiagramSpec };
  lang: Lang;
}) {
  return (
    <div>
      {label && <p className="mb-2 font-display text-sm font-bold text-biru-dark">{label}</p>}
      <div className="rounded-kite border-2 border-biru-light bg-biru-light/40 px-4 py-5 text-center">
        <p className="font-num text-xl font-bold tracking-wide text-biru-dark sm:text-2xl">
          <Bi text={example.problem} lang={lang} />
        </p>
        {example.diagram && (
          <div className="flex justify-center">
            <QuestionDiagram diagram={example.diagram} />
          </div>
        )}
      </div>
      <ol className="mt-4 space-y-3">
        {example.steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3 rounded-kite bg-paper px-4 py-3.5 shadow-card">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-biru font-num text-sm font-bold text-white">
              {i + 1}
            </span>
            <span className="pt-0.5 font-num text-[15px] font-semibold leading-relaxed text-ink">
              <Bi text={step} lang={lang} />
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-5 flex items-center justify-between rounded-kite bg-biru px-4 py-3.5">
        <span className="font-body text-sm font-semibold text-white/80">
          <Bi text={UI.answerLabel} lang={lang} />
        </span>
        <span className="font-num text-xl font-extrabold text-white">{renderMathText(String(example.answer))}</span>
      </div>
    </div>
  );
}
