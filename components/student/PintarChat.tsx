"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Lang } from "@/lib/i18n/dictionary";
import { UI } from "@/lib/i18n/dictionary";
import type { PintarAvatarState, PintarChatResponse, PintarHistoryEntry, PintarQuickReply } from "@/lib/pintar/types";

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
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        ul: ({ children }) => <ul className="mb-2 list-disc space-y-0.5 pl-4 last:mb-0">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 list-decimal space-y-0.5 pl-4 last:mb-0">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
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
          <h1 className="font-display text-xl font-bold text-ink">Pintar</h1>
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
                m.role === "user" ? "bg-biru text-paper" : "bg-kuning-light text-ink"
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 px-5 pt-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={lang === "en" ? UI.pintarPlaceholder.en : UI.pintarPlaceholder.ms}
          disabled={sending}
          className="flex-1 rounded-kite border border-ink/10 bg-paper px-4 py-2.5 text-sm font-body text-ink outline-none focus:border-biru disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-kite bg-kuning px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-40 active:scale-[0.97] transition-transform"
        >
          {lang === "en" ? UI.pintarSend.en : UI.pintarSend.ms}
        </button>
      </form>
    </main>
  );
}
