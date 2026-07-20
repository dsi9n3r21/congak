"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import clsx from "clsx";
import { generateQuestion } from "@/lib/questions";
import { classifyMistake } from "@/lib/mistakes/classify";
import { startPracticeSession, recordAttempt } from "@/lib/actions/practice";
import type { GeneratedQuestion } from "@/lib/questions/types";
import type { TopicContent } from "@/lib/content/topics";
import type { Bilingual, Lang } from "@/lib/i18n/dictionary";
import { UI } from "@/lib/i18n/dictionary";
import { Bi } from "@/lib/i18n/Bi";
import { OPTION_LABELS } from "@/lib/questions/optionLabels";
import { AngleDiagram } from "@/components/student/diagrams/AngleDiagram";

type Status = "answering" | "correct" | "incorrect";

export function QuestionPlayer({ topic, lang }: { topic: TopicContent; lang: Lang }) {
  const [templateIndex, setTemplateIndex] = useState(0);
  const [question, setQuestion] = useState<GeneratedQuestion>(() => generateFromTemplate(topic, 0));
  const [status, setStatus] = useState<Status>("answering");
  const [inputValue, setInputValue] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [mistakeHint, setMistakeHint] = useState<Bilingual | null>(null);
  const [stats, setStats] = useState({ correct: 0, attempted: 0 });
  const sessionIdRef = useRef<string | null>(null);
  const questionStartRef = useRef<number>(Date.now());

  useEffect(() => {
    startPracticeSession(topic.id).then((id) => {
      sessionIdRef.current = id;
    });
  }, [topic.id]);

  const currentAnswer = question.type === "mcq" ? selected : inputValue;

  const submit = useCallback(() => {
    if (!currentAnswer) return;
    const isCorrect = currentAnswer.trim() === question.correctAnswer;
    const timeTakenSeconds = Math.round((Date.now() - questionStartRef.current) / 1000);

    setStats((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), attempted: s.attempted + 1 }));

    let mistakeType: string | null = null;
    let hint: Bilingual | null = null;
    if (!isCorrect) {
      const classification = classifyMistake(question, currentAnswer);
      mistakeType = classification.mistakeType;
      hint = classification.hint;
    }

    // Fire-and-forget: don't block the feedback UI on the write. If there's
    // no active session (e.g. not logged in), this silently no-ops rather
    // than breaking the practice flow.
    if (sessionIdRef.current) {
      recordAttempt({
        sessionId: sessionIdRef.current,
        topicId: topic.id,
        question,
        studentAnswer: currentAnswer,
        isCorrect,
        mistakeType,
        timeTakenSeconds,
      }).catch(() => {
        // Swallow — practice should keep working even if persistence fails.
      });
    }

    if (isCorrect) {
      setStatus("correct");
      setMistakeHint(null);
    } else {
      setMistakeHint(hint);
      setStatus("incorrect");
    }
  }, [currentAnswer, question, topic.id]);

  const nextQuestion = useCallback(
    (sameTemplate: boolean) => {
      const nextIndex = sameTemplate
        ? templateIndex
        : (templateIndex + 1) % topic.questionTemplates.length;
      setTemplateIndex(nextIndex);
      setQuestion(generateFromTemplate(topic, nextIndex));
      setStatus("answering");
      setInputValue("");
      setSelected(null);
      setMistakeHint(null);
      questionStartRef.current = Date.now();
    },
    [templateIndex, topic]
  );

  return (
    <div>
      {/* Session progress — small and out of the way, not a dashboard */}
      <p className="mb-3 text-xs font-num text-ink/50">
        {stats.correct}/{stats.attempted}
      </p>

      <div className="rounded-kite bg-white p-5 shadow-card">
        <p className="font-display text-lg font-bold leading-snug text-ink">
          <Bi text={question.prompt} lang={lang} />
        </p>

        {question.diagram?.kind === "angle" && (
          <div className="mt-4">
            <AngleDiagram degrees={question.diagram.degrees} />
          </div>
        )}

        {question.type === "mcq" && question.options && (
          <div className="mt-5 grid grid-cols-1 gap-2.5">
            {question.options.map((opt) => (
              <button
                key={opt}
                disabled={status !== "answering"}
                onClick={() => setSelected(opt)}
                className={clsx(
                  "rounded-kite border-2 px-4 py-3 text-left text-base min-h-[44px] transition-colors",
                  OPTION_LABELS[opt] ? "font-body" : "font-num",
                  selected === opt && status === "answering" && "border-biru bg-biru-light",
                  selected !== opt && "border-ink/10",
                  status === "correct" && opt === question.correctAnswer && "border-pandan bg-pandan-light",
                  status === "incorrect" && opt === selected && "border-saga bg-saga-light",
                  status === "incorrect" && opt === question.correctAnswer && "border-pandan bg-pandan-light"
                )}
              >
                <OptionLabel value={opt} lang={lang} />
              </button>
            ))}
          </div>
        )}

        {question.type !== "mcq" && (
          <input
            type="text"
            value={inputValue}
            disabled={status !== "answering"}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={lang === "en" ? "Type your answer..." : "Taip jawapan..."}
            className="mt-5 w-full rounded-kite border-2 border-ink/10 px-4 py-3 font-num text-base focus:border-biru focus:outline-none"
          />
        )}

        {status === "answering" && (
          <button
            onClick={submit}
            disabled={!currentAnswer}
            className="mt-5 w-full rounded-kite bg-kuning py-3 font-display font-bold text-white disabled:opacity-40 min-h-[44px]"
          >
            <Bi text={UI.checkAnswer} lang={lang} />
          </button>
        )}
      </div>

      {status === "correct" && (
        <div className="mt-4 rounded-kite bg-pandan-light p-4">
          <p className="font-display font-bold text-pandan-dark">
            <Bi text={UI.correctFeedback} lang={lang} /> 🎉
          </p>
          <button
            onClick={() => nextQuestion(false)}
            className="mt-3 w-full rounded-kite bg-pandan py-3 font-display font-bold text-white min-h-[44px]"
          >
            <Bi text={UI.nextQuestion} lang={lang} /> →
          </button>
        </div>
      )}

      {status === "incorrect" && (
        <div className="mt-4 rounded-kite border border-biru-light bg-biru-light/40 p-4">
          <p className="font-display text-sm font-bold text-biru-dark">
            🦉 <Bi text={UI.professorNombor} lang={lang} />
          </p>
          {mistakeHint && <p className="mt-1 text-sm text-ink"><Bi text={mistakeHint} lang={lang} /></p>}
          <p className="mt-2 text-xs text-ink/60">
            <Bi text={UI.actualAnswer} lang={lang} />:{" "}
            <span className={clsx("font-semibold", OPTION_LABELS[question.correctAnswer] ? "font-body" : "font-num")}>
              <OptionLabel value={question.correctAnswer} lang={lang} />
            </span>
          </p>
          <button
            onClick={() => nextQuestion(true)}
            className="mt-3 w-full rounded-kite bg-biru py-3 font-display font-bold text-white min-h-[44px]"
          >
            <Bi text={UI.tryPro} lang={lang} /> →
          </button>
        </div>
      )}
    </div>
  );
}

function OptionLabel({ value, lang }: { value: string; lang: Lang }) {
  const entry = OPTION_LABELS[value];
  if (!entry) return <>{value}</>;
  return <Bi text={entry} lang={lang} />;
}

function generateFromTemplate(topic: TopicContent, index: number): GeneratedQuestion {
  const template = topic.questionTemplates[index];
  return generateQuestion(template.generatorKey, template.config, template.type);
}
