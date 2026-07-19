"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";
import { updateAccessibilityPref } from "@/lib/actions/profile";
import { Bi } from "@/lib/i18n/Bi";
import type { Lang } from "@/lib/i18n/dictionary";

interface Props {
  lang: Lang;
  initial: {
    a11y_large_text: boolean;
    a11y_dyslexia_font: boolean;
    a11y_low_distraction: boolean;
  };
}

const TOGGLES = [
  { field: "a11y_large_text" as const, label: { ms: "Teks Besar", en: "Large Text" } },
  { field: "a11y_dyslexia_font" as const, label: { ms: "Fon Mesra Disleksia", en: "Dyslexia-Friendly Font" } },
  { field: "a11y_low_distraction" as const, label: { ms: "Mod Kurang Gangguan", en: "Low Distraction Mode" } },
];

export function AccessibilityToggles({ lang, initial }: Props) {
  const [state, setState] = useState(initial);
  const [isPending, startTransition] = useTransition();

  function toggle(field: keyof typeof initial) {
    const next = !state[field];
    setState((s) => ({ ...s, [field]: next })); // optimistic — body class updates on next navigation via revalidatePath
    startTransition(() => {
      updateAccessibilityPref(field, next);
    });
  }

  return (
    <div className="rounded-kite bg-white shadow-card divide-y divide-ink/5">
      {TOGGLES.map((t) => (
        <button
          key={t.field}
          onClick={() => toggle(t.field)}
          disabled={isPending}
          className="flex w-full items-center justify-between px-4 py-3 text-left min-h-[44px] disabled:opacity-60"
        >
          <span className="text-sm text-ink"><Bi text={t.label} lang={lang} /></span>
          <span
            className={clsx(
              "relative h-6 w-11 rounded-full transition-colors",
              state[t.field] ? "bg-kuning" : "bg-ink/15"
            )}
          >
            <span
              className={clsx(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                state[t.field] ? "translate-x-5" : "translate-x-0.5"
              )}
            />
          </span>
        </button>
      ))}
    </div>
  );
}
