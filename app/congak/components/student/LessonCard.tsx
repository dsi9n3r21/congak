"use client";

import { useState } from "react";
import clsx from "clsx";
import type { TopicContent } from "@/lib/content/topics";

const TABS = ["Belajar", "Tips", "Contoh", "Kesilapan Lazim"] as const;
type Tab = (typeof TABS)[number];

export function LessonCard({ topic }: { topic: TopicContent }) {
  const [tab, setTab] = useState<Tab>("Belajar");

  return (
    <div className="rounded-kite bg-white shadow-card">
      {/* Tabs scroll horizontally on narrow screens rather than wrapping/shrinking */}
      <div className="flex gap-1 overflow-x-auto border-b border-kuning-light px-3 pt-3">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "whitespace-nowrap rounded-t-lg px-3 py-2 text-sm font-semibold min-h-[44px]",
              tab === t ? "bg-kuning-light text-kuning-dark" : "text-ink/50"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === "Belajar" && (
          <p className="whitespace-pre-line font-body text-[15px] leading-relaxed text-ink">
            {topic.explanation}
          </p>
        )}

        {tab === "Tips" && (
          <div className="flex gap-3 rounded-kite bg-pandan-light p-4">
            <span className="text-xl">💡</span>
            <p className="font-body text-[15px] leading-relaxed text-ink">{topic.tips}</p>
          </div>
        )}

        {tab === "Contoh" && (
          <div>
            <p className="font-num text-lg font-bold text-biru-dark">{topic.workedExample.problem}</p>
            <ol className="mt-3 space-y-2">
              {topic.workedExample.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink">
                  <span className="font-num font-semibold text-biru">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
            <p className="mt-4 rounded-lg bg-biru-light px-3 py-2 font-num text-base font-bold text-biru-dark">
              Jawapan: {topic.workedExample.answer}
            </p>
          </div>
        )}

        {tab === "Kesilapan Lazim" && (
          <ul className="space-y-3">
            {topic.commonMistakes.map((m) => (
              <li key={m.mistakeType} className="flex gap-2 rounded-kite bg-saga-light/50 p-3">
                <span className="text-lg">⚠️</span>
                <p className="text-sm text-ink">{m.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
