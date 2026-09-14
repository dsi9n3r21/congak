"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Keyboard } from "lucide-react";
import { Bi } from "@/lib/i18n/Bi";
import { UI } from "@/lib/i18n/dictionary";
import type { Lang } from "@/lib/i18n/dictionary";
import { MathSymbolBar } from "@/components/student/MathSymbolBar";
import { WorkingCanvas, type WorkingCanvasHandle } from "@/components/student/WorkingCanvas";

/** The "show your working" block — previously duplicated as a plain
 * typed textarea + MathSymbolBar in QuestionPlayer, QuizPlayer, and
 * ExamFlow separately (identical in all 3, never shared). Consolidated
 * here while adding a free-draw option, so the fix lands everywhere
 * this pattern exists at once instead of 3 separate patches.
 *
 * `workingText` was never read anywhere outside these blocks (not
 * graded, not persisted, not sent with the answer) — purely scratch
 * space, so this component owns all of its own state internally and a
 * parent only needs `resetSignal` (anything that changes identity per
 * new question, e.g. the `question` object itself) to know when to
 * clear it.
 *
 * Defaults to Draw mode: the feedback that led to this (a Year 5
 * student, relayed by a teacher) was specifically that TYPING working
 * out — column addition, long division — feels unnatural, and asked
 * for free-draw as the fallback if a structured number-grid wasn't
 * feasible. Typing remains one tap away for students who prefer it. */
export function WorkingArea({
  lang,
  disabled,
  resetSignal,
}: {
  lang: Lang;
  disabled?: boolean;
  /** Anything whose identity changes when a new question loads (e.g.
   * pass the `question` object itself) — clears both the typed text and
   * the canvas when it changes. */
  resetSignal: unknown;
}) {
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [workingText, setWorkingText] = useState("");
  const workingTextareaRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<WorkingCanvasHandle>(null);

  useEffect(() => {
    setWorkingText("");
    canvasRef.current?.clear();
    // Only reset when the caller's signal changes identity — not on
    // every render, and not when `mode` toggles (switching from Draw to
    // Type mid-question shouldn't wipe what's already there).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  return (
    <div className="mt-5">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="block text-xs font-semibold text-ink/60">
          <Bi text={UI.showWorking} lang={lang} />
        </label>
        <div className="flex overflow-hidden rounded-full border-2 border-ink/10">
          <button
            type="button"
            onClick={() => setMode("draw")}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold ${
              mode === "draw" ? "bg-ungu text-white" : "text-ink/50"
            }`}
          >
            <Pencil size={12} strokeWidth={2.5} />
            <Bi text={{ ms: "Lukis", en: "Draw" }} lang={lang} />
          </button>
          <button
            type="button"
            onClick={() => setMode("type")}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold ${
              mode === "type" ? "bg-ungu text-white" : "text-ink/50"
            }`}
          >
            <Keyboard size={12} strokeWidth={2.5} />
            <Bi text={{ ms: "Taip", en: "Type" }} lang={lang} />
          </button>
        </div>
      </div>

      {mode === "draw" ? (
        <WorkingCanvas ref={canvasRef} lang={lang} disabled={disabled} />
      ) : (
        <>
          <div className="mb-2">
            <MathSymbolBar inputRef={workingTextareaRef} value={workingText} onChange={setWorkingText} disabled={disabled} />
          </div>
          <textarea
            ref={workingTextareaRef}
            value={workingText}
            disabled={disabled}
            onChange={(e) => setWorkingText(e.target.value)}
            placeholder={lang === "en" ? "Work it out here..." : "Buat kira-kira di sini..."}
            rows={10}
            className="w-full min-h-[220px] resize-y rounded-kite border-2 border-ink/10 px-4 py-3 font-num text-base leading-relaxed focus:border-ungu focus:outline-none"
          />
        </>
      )}

      <p className="mt-1 text-[11px] text-ink/40">
        <Bi text={UI.showWorkingHint} lang={lang} />
      </p>
    </div>
  );
}
