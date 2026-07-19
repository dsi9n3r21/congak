"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { TOPICS, type TopicContent } from "@/lib/content/topics";
import { generateQuestion } from "@/lib/questions";
import { submitExam, type ExamResult } from "@/lib/actions/exam";
import type { GeneratedQuestion } from "@/lib/questions/types";

const DURATION_OPTIONS = [
  { minutes: 5, questionCount: 6 },
  { minutes: 10, questionCount: 10 },
  { minutes: 15, questionCount: 16 },
];

type Phase = "setup" | "active" | "results";

interface ExamQuestion {
  topicId: string;
  question: GeneratedQuestion;
}

function buildExamQuestions(topicIds: string[], count: number): ExamQuestion[] {
  const questions: ExamQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const topicId = topicIds[i % topicIds.length];
    const topic = TOPICS[topicId];
    const template = topic.questionTemplates[i % topic.questionTemplates.length];
    questions.push({
      topicId,
      question: generateQuestion(template.generatorKey, template.config, template.type),
    });
  }
  return questions;
}

export function ExamFlow() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [selectedTopics, setSelectedTopics] = useState<string[]>(Object.keys(TOPICS));
  const [duration, setDuration] = useState(DURATION_OPTIONS[1]);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentValue, setCurrentValue] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const startRef = useRef(Date.now());
  const answersRef = useRef<string[]>([]);

  const finishExam = useCallback(
    async (finalAnswers: string[]) => {
      setSubmitting(true);
      const timeTakenSeconds = Math.round((Date.now() - startRef.current) / 1000);
      // Blank/unanswered questions (from timeout) count as wrong, not skipped.
      const examAnswers = questions.map((q, i) => ({
        topicId: q.topicId,
        question: q.question,
        studentAnswer: finalAnswers[i] ?? "",
      }));
      const res = await submitExam(selectedTopics, examAnswers, timeTakenSeconds);
      setResult(res);
      setPhase("results");
      setSubmitting(false);
    },
    [questions, selectedTopics]
  );

  // Countdown — auto-submits whatever's been answered so far when it hits 0.
  useEffect(() => {
    if (phase !== "active") return;
    if (secondsLeft <= 0) {
      finishExam(answersRef.current);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, secondsLeft, finishExam]);

  function startExam() {
    if (selectedTopics.length === 0) return;
    const qs = buildExamQuestions(selectedTopics, duration.questionCount);
    setQuestions(qs);
    setSecondsLeft(duration.minutes * 60);
    startRef.current = Date.now();
    answersRef.current = [];
    setIndex(0);
    setAnswers([]);
    setCurrentValue("");
    setPhase("active");
  }

  function handleNext() {
    if (!currentValue) return;
    const updated = [...answers, currentValue];
    answersRef.current = updated;

    if (index === questions.length - 1) {
      finishExam(updated);
      return;
    }
    setAnswers(updated);
    setCurrentValue("");
    setIndex((i) => i + 1);
  }

  const timeDisplay = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [secondsLeft]);

  if (phase === "setup") {
    return (
      <div className="rounded-kite bg-white p-5 shadow-card">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Pilih Topik</p>
        <div className="space-y-2">
          {Object.values(TOPICS).map((t) => (
            <label key={t.id} className="flex items-center gap-2 rounded-kite border-2 border-ink/10 px-3 py-2.5">
              <input
                type="checkbox"
                checked={selectedTopics.includes(t.id)}
                onChange={(e) =>
                  setSelectedTopics((prev) =>
                    e.target.checked ? [...prev, t.id] : prev.filter((id) => id !== t.id)
                  )
                }
                className="h-4 w-4"
              />
              <span className="text-sm text-ink">{t.title}</span>
            </label>
          ))}
        </div>

        <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-ink/50">Tempoh Masa</p>
        <div className="flex gap-2">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.minutes}
              onClick={() => setDuration(opt)}
              className={`flex-1 rounded-kite border-2 py-2.5 text-sm font-semibold min-h-[44px] ${
                duration.minutes === opt.minutes ? "border-kuning bg-kuning-light" : "border-ink/10 text-ink/60"
              }`}
            >
              {opt.minutes} min
            </button>
          ))}
        </div>

        <button
          onClick={startExam}
          disabled={selectedTopics.length === 0}
          className="mt-5 w-full rounded-kite bg-saga py-3 font-display font-bold text-white disabled:opacity-40 min-h-[44px]"
        >
          Mula Peperiksaan →
        </button>
      </div>
    );
  }

  if (phase === "active") {
    const q = questions[index];
    return (
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-num text-ink/50">
            Soalan {index + 1}/{questions.length}
          </p>
          <p className={`font-num text-sm font-bold ${secondsLeft < 30 ? "text-saga" : "text-biru-dark"}`}>
            ⏱ {timeDisplay}
          </p>
        </div>

        <div className="rounded-kite bg-white p-5 shadow-card">
          <p className="font-display text-lg font-bold leading-snug text-ink">{q.question.prompt}</p>

          {q.question.type === "mcq" && q.question.options ? (
            <div className="mt-5 grid grid-cols-1 gap-2.5">
              {q.question.options.map((opt) => (
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
            {submitting ? "Menyemak..." : index === questions.length - 1 ? "Hantar" : "Seterusnya →"}
          </button>
        </div>
      </div>
    );
  }

  // phase === "results"
  const r = result!;
  const minutes = Math.floor(r.timeTakenSeconds / 60);
  const seconds = r.timeTakenSeconds % 60;

  return (
    <div>
      <div className="rounded-kite bg-white p-6 text-center shadow-card">
        <p className="text-4xl">{r.score / r.total >= 0.7 ? "🏆" : "📘"}</p>
        <p className="mt-2 font-display text-2xl font-bold text-ink">
          {r.score}/{r.total} Betul
        </p>
        <p className="mt-1 text-xs text-ink/50 font-num">
          Masa: {minutes}m {seconds}s
        </p>
      </div>

      {r.strengths.length > 0 && (
        <div className="mt-4 rounded-kite bg-pandan-light p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-pandan-dark">Kekuatan</p>
          <ul className="space-y-1 text-sm text-ink">
            {r.strengths.map((id) => (
              <li key={id}>✓ {TOPICS[id]?.title ?? id}</li>
            ))}
          </ul>
        </div>
      )}

      {r.weaknesses.length > 0 && (
        <div className="mt-4 rounded-kite bg-saga-light/40 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-saga-dark">Perlu Ditambah Baik</p>
          <ul className="space-y-1 text-sm text-ink">
            {r.weaknesses.map((id) => (
              <li key={id}>△ {TOPICS[id]?.title ?? id}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 rounded-kite bg-biru-light/40 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-biru-dark">Cadangan Pembelajaran</p>
        <div className="space-y-2">
          {r.recommendedPath.map((id) => (
            <Link
              key={id}
              href={`/practice/${id}`}
              className="block rounded-kite bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-card"
            >
              {TOPICS[id]?.title ?? id} →
            </Link>
          ))}
        </div>
      </div>

      <Link
        href="/dashboard"
        className="mt-4 block rounded-kite border-2 border-ink/10 py-3 text-center font-display font-bold text-ink min-h-[44px]"
      >
        Ke Papan Pemuka
      </Link>
    </div>
  );
}
