"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bi } from "@/lib/i18n/Bi";
import type { Lang } from "@/lib/i18n/dictionary";
import type { MissionMode } from "@/lib/missions/types";
import { restartWorld } from "@/lib/actions/missions";

export function ReplayWorldButton({ mode, category, lang }: { mode: MissionMode; category: string; lang: Lang }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  return (
    <div>
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setError(false);
            const result = await restartWorld(mode, category).catch(() => ({ ok: false }));
            if (!result.ok) {
              setError(true);
              return;
            }
            router.refresh();
          })
        }
        className="mt-3 w-full min-h-[44px] rounded-kite bg-white py-2.5 font-display text-sm font-bold text-ungu-dark disabled:opacity-60"
      >
        <Bi text={{ ms: "Main Semula Dunia Ini", en: "Replay This World" }} lang={lang} />
      </button>
      {error && (
        <p className="mt-1.5 text-center text-xs text-white/90">
          <Bi text={{ ms: "Gagal — cuba lagi.", en: "Couldn't restart — try again." }} lang={lang} />
        </p>
      )}
    </div>
  );
}
