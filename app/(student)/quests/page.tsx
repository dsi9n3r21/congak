import { createClient } from "@/lib/supabase/server";
import { Bi } from "@/lib/i18n/Bi";
import type { Bilingual } from "@/lib/i18n/dictionary";
import Image from "next/image";

// Still a "coming soon" placeholder — Misi (daily missions/badges) is a
// real feature build (its own migration + daily-reset logic + a design
// decision on what missions actually are), deliberately not started yet.
// This round only restyled the placeholder to match the dashboard's
// visual language, so the app doesn't look broken/unfinished on this tab
// while real Misi is designed. The preview list below is illustrative
// text only — no data backing it, nothing to wire up later beyond
// swapping this whole page for the real thing.
const PREVIEW_ITEMS: { emoji: string; label: Bilingual }[] = [
  { emoji: "🎯", label: { ms: "Misi harian", en: "Daily missions" } },
  { emoji: "🏅", label: { ms: "Lencana pencapaian", en: "Achievement badges" } },
  { emoji: "🗺️", label: { ms: "Peta pengembaraan", en: "Adventure map" } },
  { emoji: "🔥", label: { ms: "Cabaran mingguan", en: "Weekly challenges" } },
];

export default async function QuestsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: student } = await supabase
    .from("students")
    .select("language_pref")
    .eq("user_id", user?.id ?? "")
    .single();
  const lang = student?.language_pref ?? "both";

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <header className="relative overflow-hidden px-5 pt-6 pb-4">
        <div className="decorative absolute right-3 -top-2 h-28 w-28 rounded-full bg-kuning-light/60" />
        <div className="relative z-10 max-w-[70%]">
          <h1 className="font-display text-xl font-bold text-ink">
            {lang === "en" ? "Adventure Mode" : "Mod Pengembaraan"}
          </h1>
          <p className="mt-1 text-xs text-ink/50">
            {lang === "en" ? "Coming soon" : "Akan tiba tidak lama lagi"}
          </p>
        </div>
      </header>

      <section className="relative mx-5 overflow-hidden rounded-kite bg-gradient-to-b from-pandan to-pandan-dark px-5 py-6 text-center text-paper shadow-hero">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
        <div className="relative mx-auto h-32 w-32">
          <Image src="/pintar/reward.png" alt="" fill className="object-contain" />
        </div>
        <h2 className="relative mt-3 font-display text-lg font-bold">
          {lang === "en" ? "Adventure Mode is on its way!" : "Mod Pengembaraan sedang dibina!"}
        </h2>
        <p className="relative mt-1.5 text-sm opacity-90">
          {lang === "en"
            ? "Daily missions, badges, and weekly challenges — built from your own real progress."
            : "Misi harian, lencana, dan cabaran mingguan — dibina daripada kemajuan sebenar anda."}
        </p>
      </section>

      <section className="mx-5 mt-4 grid grid-cols-2 gap-2.5">
        {PREVIEW_ITEMS.map((item) => (
          <div
            key={item.emoji}
            className="flex flex-col items-center gap-1.5 rounded-kite bg-white px-3 py-4 text-center shadow-card opacity-60"
          >
            <span className="text-2xl">{item.emoji}</span>
            <p className="text-xs font-semibold text-ink/60">
              <Bi text={item.label} lang={lang} />
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
