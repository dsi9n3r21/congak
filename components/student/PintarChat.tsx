"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Lang } from "@/lib/i18n/dictionary";
import { UI } from "@/lib/i18n/dictionary";
import type { PintarAvatarState, PintarChatResponse, PintarHistoryEntry, PintarQuickReply } from "@/lib/pintar/types";
import { Send } from "lucide-react";
import { MathSymbolBar } from "@/components/student/MathSymbolBar";
import { renderMathText } from "@/lib/ui/mathText";
import type { ReactNode } from "react";

interface DisplayMessage {
  role: "user" | "pintar";
  text: string;
}

interface PintarChatProps {
  studentName: string;
  lang: Lang;
  currentTopicTitle: string | null;
  level: number;
  xp: number;
  streakDays: number;
}

// bm/en only — the engine's contract doesn't have a "both" option, so
// "both" (Congak's dual-language mode) falls back to bm as the primary
// language Pintar replies in.
function toEngineLanguage(lang: Lang): "bm" | "en" {
  return lang === "en" ? "en" : "bm";
}

// Internal signal sent as the very first message on mount, so the opening
// line is a real engine reply (using the student's actual name/topic/
// streak) rather than text hardcoded on the Congak side. The engine's
// system prompt recognises this and produces a greeting — nothing about
// it is shown to the student as if they typed it.
const GREETING_TRIGGER = "__greeting__";

// Applies the app's shared stacked-fraction rendering (see
// lib/ui/mathText.tsx) to react-markdown's parsed children — same
// treatment fractions get in the lesson pages and questions, so a
// fraction Pintar writes ("2/5") looks the way it does on a textbook
// page instead of a flat inline slash. Only string children are
// re-typeset; other elements (e.g. **bold** text) pass through
// untouched — bolded fractions are rare enough in practice that this
// doesn't need deeper recursion into nested element children.
function withMathText(children: ReactNode): ReactNode {
  if (typeof children === "string") return renderMathText(children);
  if (Array.isArray(children)) {
    return children.map((child, i) => (typeof child === "string" ? <span key={i}>{renderMathText(child)}</span> : child));
  }
  return children;
}

// Small, self-contained Markdown renderer for chat bubbles — engine replies
// use **bold** and line breaks/lists, so plain-string rendering showed
// literal asterisks with no line breaks. Scoped Tailwind classes per
// element instead of the @tailwindcss/typography plugin, to avoid adding
// a plugin + config change for what's otherwise a small amount of styling.
function PintarMarkdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{withMathText(children)}</p>,
        strong: ({ children }) => <strong className="font-semibold">{withMathText(children)}</strong>,
        ul: ({ children }) => <ul className="mb-2 list-disc space-y-0.5 pl-4 last:mb-0">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 list-decimal space-y-0.5 pl-4 last:mb-0">{children}</ol>,
        li: ({ children }) => <li>{withMathText(children)}</li>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

export function PintarChat({ studentName, lang, currentTopicTitle, level, xp, streakDays }: PintarChatProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [avatarState, setAvatarState] = useState<PintarAvatarState>("thinking");
  const [quickReplies, setQuickReplies] = useState<PintarQuickReply[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Stable for the life of this page view. Not persisted — Pintar starts a
  // fresh session on every visit for now (see HANDOVER.md: history isn't
  // written to Supabase yet, by design, until it's confirmed to be wanted).
  const sessionIdRef = useRef<string>(typeof crypto !== "undefined" ? crypto.randomUUID() : String(Date.now()));
  const historyRef = useRef<PintarHistoryEntry[]>([]);
  // StrictMode/dev double-invokes effects — guard against firing the
  // greeting call twice.
  const greetedRef = useRef(false);

  // `visibleToUser` controls whether the message shows up as a chat bubble
  // — the greeting trigger produces a real pintar reply that IS shown, but
  // isn't preceded by a fake user bubble for "__greeting__" itself.
  const callEngine = useCallback(
    async (message: string, { showUserBubble }: { showUserBubble: boolean }) => {
      if (showUserBubble) setMessages((m) => [...m, { role: "user", text: message }]);
      setQuickReplies([]);
      setAvatarState("thinking");
      setSending(true);

      const requestHistory = [...historyRef.current];

      try {
        const res = await fetch("/api/pintar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            studentName,
            language: toEngineLanguage(lang),
            message,
            context: {
              currentTopic: currentTopicTitle ?? "",
              currentLevel: `Tahap ${level}`,
              // No daily-XP tracking exists in Congak yet (only a running
              // total) — sending total xp as a stopgap until that's built.
              xpToday: xp,
              streakDays,
            },
            history: requestHistory,
          }),
        });

        if (!res.ok) throw new Error("bad response");

        const data: PintarChatResponse = await res.json();
        setMessages((m) => [...m, { role: "pintar", text: data.reply }]);
        setAvatarState(data.avatarState);
        setQuickReplies(data.quickReplies ?? []);
        historyRef.current = [...requestHistory, { role: "pintar", text: data.reply }];
      } catch {
        setAvatarState("confuse");
        setMessages((m) => [...m, { role: "pintar", text: lang === "en" ? UI.pintarError.en : UI.pintarError.ms }]);
      } finally {
        setSending(false);
      }
    },
    [lang, studentName, currentTopicTitle, level, xp, streakDays]
  );

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;
      setInput("");
      if (inputRef.current) inputRef.current.style.height = "auto";
      callEngine(trimmed, { showUserBubble: true });
    },
    [callEngine, sending]
  );

  useEffect(() => {
    if (greetedRef.current) return;
    greetedRef.current = true;
    callEngine(GREETING_TRIGGER, { showUserBubble: false });
    // Only ever run once per mount — callEngine is intentionally omitted
    // from deps here (it's recreated when props change, but re-greeting on
    // every prop change would restart the conversation).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex min-h-screen flex-col pb-24 md:pb-8">
      <header className="flex items-center gap-3 px-5 pt-6 pb-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-kite bg-kuning-light">
          <Image src={`/pintar/${avatarState}.png`} alt="Pintar" fill className="object-contain" priority />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-display text-xl font-bold text-ink">Pintar</h1>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-pandan">
              <span className="h-1.5 w-1.5 rounded-full bg-pandan" />
              {lang === "en" ? "Online" : "Dalam Talian"}
            </span>
          </div>
          <p className="text-xs text-ink/50">
            {lang === "en" ? UI.pintarTagline.en : UI.pintarTagline.ms}
          </p>
        </div>
      </header>

      <section className="flex-1 space-y-3 overflow-y-auto px-5">
        {messages.map((m, i) => (
          <div key={i} className={clsx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={clsx(
                "max-w-[80%] rounded-kite px-4 py-2.5 text-sm shadow-card font-body",
                m.role === "user" ? "bg-ungu text-paper" : "bg-kuning-light text-ink"
              )}
            >
              {m.role === "pintar" ? <PintarMarkdown text={m.text} /> : m.text}
            </div>
          </div>
        ))}
        {messages.length === 0 && sending && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-kite bg-kuning-light px-4 py-2.5 text-sm text-ink/50 shadow-card font-body">
              …
            </div>
          </div>
        )}
      </section>

      {quickReplies.length > 0 && (
        <div className="flex flex-wrap gap-2 px-5 pt-3">
          {quickReplies.map((qr) => (
            <button
              key={qr.value}
              onClick={() => send(qr.value)}
              disabled={sending}
              className="rounded-kite border-2 border-kuning-light bg-paper px-3 py-1.5 text-xs font-semibold text-kuning-dark active:scale-[0.97] transition-transform disabled:opacity-50"
            >
              {qr.label}
            </button>
          ))}
        </div>
      )}

      <div className="px-5 pt-2">
        <MathSymbolBar inputRef={inputRef} value={input} onChange={setInput} disabled={sending} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-end gap-2 px-5 pt-3"
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            const el = e.target;
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
          }}
          placeholder={lang === "en" ? UI.pintarPlaceholder.en : UI.pintarPlaceholder.ms}
          disabled={sending}
          rows={1}
          className="max-h-[120px] flex-1 resize-none overflow-y-auto rounded-kite border border-ink/10 bg-paper px-4 py-2.5 text-sm font-body text-ink outline-none focus:border-ungu disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          aria-label={lang === "en" ? UI.pintarSend.en : UI.pintarSend.ms}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ungu text-paper disabled:opacity-40 active:scale-[0.97] transition-transform"
        >
          <Send size={18} />
        </button>
      </form>
    </main>
  );
}
