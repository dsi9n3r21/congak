"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { generateQuestion } from "@/lib/questions";
import { submitQuiz, type QuizResult } from "@/lib/actions/quiz";
import type { GeneratedQuestion } from "@/lib/questions/types";
import type { TopicContent } from "@/lib/content/topics";

const QUIZ_LENGTH = 5;

function buildQuizQuestions(topic: TopicContent): GeneratedQuestion[] {
  const questions: GeneratedQuestion[] = [];
  for (let i = 0; i < QUIZ_LENGTH; i++) {
    const template = topic.questionTemplates[i % topic.questionTemplates.length];
    questions.push(generateQuestion(template.generatorKey, template.config, template.type));
  }
  return questions;
}

export function QuizPlayer({ topic }: { topic: TopicContent }) {
  const questions = useMemo(() => buildQuizQuestions(topic), [topic]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentValue, setCurrentValue] = useState("");
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const startRef = useRef(Date.now());

  const question = questions[index];
  const isLast = index === questions.length - 1;

  async function handleNext() {
    if (!currentValue) return;
    const updatedAnswers = [...answers, currentValue];

    if (!isLast) {
      setAnswers(updatedAnswers);
      setCurrentValue("");
      setIndex((i) => i + 1);
      return;
    }

    setSubmitting(true);
    const timeTakenSeconds = Math.round((Date.now() - startRef.current) / 1000);
    const quizAnswers = questions.map((q, i) => ({ question: q, studentAnswer: updatedAnswers[i] }));
    const res = await submitQuiz(topic.id, quizAnswers, timeTakenSeconds);
    setResult(res);
    setSubmitting(false);
  }

  if (result) {
    return <QuizResults topic={topic} result={result} />;
  }

  return (
    <div>
      <p className="mb-3 text-xs font-num text-ink/50">
        Soalan {index + 1}/{questions.length}
      </p>
      <div className="mb-4 h-1.5 w-full rounded-full bg-ink/10">
        <div
          className="h-1.5 rounded-full bg-biru transition-all"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="rounded-kite bg-white p-5 shadow-card">
        <p className="font-display text-lg font-bold leading-snug text-ink">{question.prompt}</p>

        {question.type === "mcq" && question.options ? (
          <div className="mt-5 grid grid-cols-1 gap-2.5">
            {question.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setCurrentValue(opt)}
                className={`rounded-kite border-2 px-4 py-3 text-left font-num text-base min-h-[44px] ${
                  currentValue === opt ? "border-biru bg-biru-light" : "border-ink/10"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            placeholder="Taip jawapan..."
            className="mt-5 w-full rounded-kite border-2 border-ink/10 px-4 py-3 font-num text-base focus:border-biru focus:outline-none"
          />
        )}

        <button
          onClick={handleNext}
          disabled={!currentValue || submitting}
          className="mt-5 w-full rounded-kite bg-kuning py-3 font-display font-bold text-white disabled:opacity-40 min-h-[44px]"
        >
          {submitting ? "Menyemak..." : isLast ? "Hantar Kuiz" : "Seterusnya →"}
        </button>
      </div>
    </div>
  );
}

function QuizResults({ topic, result }: { topic: TopicContent; result: QuizResult }) {
  const minutes = Math.floor(result.timeTakenSeconds / 60);
  const seconds = result.timeTakenSeconds % 60;

  return (
    <div>
      <div className="rounded-kite bg-white p-6 text-center shadow-card">
        <p className="text-4xl">{result.accuracy >= 80 ? "🏆" : result.accuracy >= 50 ? "👍" : "💪"}</p>
        <p className="mt-2 font-display text-2xl font-bold text-ink">
          {result.score}/{result.total} Betul
        </p>
        <p className="mt-1 font-num text-lg font-semibold text-biru-dark">{result.accuracy}% Ketepatan</p>
        <p className="mt-1 text-xs text-ink/50 font-num">
          Masa: {minutes}m {seconds}s
        </p>
      </div>

      {result.mistakeBreakdown.length > 0 && (
        <div className="mt-4 rounded-kite bg-saga-light/40 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-saga-dark">Analisis Topik</p>
          <ul className="space-y-2">
            {result.mistakeBreakdown.map((m) => (
              <li key={m.mistakeType} className="text-sm text-ink">
                <span className="font-semibold">{m.count}x</span> — {m.hint}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Link
          href={`/practice/${topic.id}`}
          className="flex-1 rounded-kite bg-biru py-3 text-center font-display font-bold text-white min-h-[44px]"
        >
          Latihan Lagi
        </Link>
        <Link
          href="/dashboard"
          className="flex-1 rounded-kite border-2 border-ink/10 py-3 text-center font-display font-bold text-ink min-h-[44px]"
        >
          Ke Papan Pemuka
        </Link>
      </div>
    </div>
  );
}
