"use client";

import { useTransition } from "react";
import clsx from "clsx";
import { updateLanguagePref } from "@/lib/actions/profile";
import type { Lang } from "@/lib/i18n/dictionary";

const OPTIONS: { value: Lang; label: string }[] = [
  { value: "ms", label: "BM" },
  { value: "en", label: "EN" },
  { value: "both", label: "BM + EN" },
];

export function LanguageSelector({ current }: { current: Lang }) {
  const [isPending, startTransition] = useTransition();

  function select(value: Lang) {
    const formData = new FormData();
    formData.set("languagePref", value);
    startTransition(() => {
      updateLanguagePref(formData);
    });
  }

  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => select(opt.value)}
          disabled={isPending}
          className={clsx(
            "flex-1 rounded-kite border-2 py-2.5 text-sm font-semibold min-h-[44px] disabled:opacity-50",
            current === opt.value ? "border-kuning bg-kuning-light text-kuning-dark" : "border-ink/10 text-ink/60"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
