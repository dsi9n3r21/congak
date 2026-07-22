"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import clsx from "clsx";
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

export function PintarChat({ studentName, lang, currentTopicTitle, level, xp, streakDays }: PintarChatProps) {
  const greeting = (lang === "en" ? UI.pintarGreeting.en : UI.pintarGreeting.ms).replace("{name}", studentName);

  const [messages, setMessages] = useState<DisplayMessage[]>([{ role: "pintar", text: greeting }]);
  const [avatarState, setAvatarState] = useState<PintarAvatarState>("idle");
  const [quickReplies, setQuickReplies] = useState<PintarQuickReply[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // Stable for the life of this page view. Not persisted — Pintar starts a
  // fresh session on every visit for now (see HANDOVER.md: history isn't
  // written to Supabase yet, by design, until it's confirmed to be wanted).
  const sessionIdRef = useRef<string>(typeof crypto !== "undefined" ? crypto.randomUUID() : String(Date.now()));
  // Only real exchanged turns go to the engine — the local greeting above
  // isn't something the engine said, so it's left out of `history`.
  const historyRef = useRef<PintarHistoryEntry[]>([]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;

      setMessages((m) => [...m, { role: "user", text: trimmed }]);
      setQuickReplies([]);
      setInput("");
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
            message: trimmed,
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
        historyRef.current = [
          ...requestHistory,
          { role: "user", text: trimmed },
          { role: "pintar", text: data.reply },
        ];
      } catch {
        setAvatarState("confuse");
        setMessages((m) => [...m, { role: "pintar", text: lang === "en" ? UI.pintarError.en : UI.pintarError.ms }]);
      } finally {
        setSending(false);
      }
    },
    [lang, studentName, currentTopicTitle, level, xp, streakDays, sending]
  );

  return (
    <main className="flex min-h-screen flex-col pb-24 md:pb-8">
      <header className="flex items-center gap-3 px-5 pt-6 pb-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-kite bg-kuning-light">
          <Image src={`/pintar/${avatarState}.png`} alt="Pintar" fill className="object-contain" priority />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Pintar</h1>
          {currentTopicTitle && <p className="text-xs text-ink/50">{currentTopicTitle}</p>}
        </div>
      </header>

      <section className="flex-1 space-y-3 overflow-y-auto px-5">
        {messages.map((m, i) => (
          <div key={i} className={clsx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <p
              className={clsx(
                "max-w-[80%] rounded-kite px-4 py-2.5 text-sm shadow-card font-body",
                m.role === "user" ? "bg-biru text-paper" : "bg-kuning-light text-ink"
              )}
            >
              {m.text}
            </p>
          </div>
        ))}
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
