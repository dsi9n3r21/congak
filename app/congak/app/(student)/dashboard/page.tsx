import { BottomNav } from "@/components/ui/BottomNav";

// Placeholder data — replace with Supabase queries (students, topic_mastery, world_progress).
const student = { name: "Aisyah", level: 4, streak: 6, xp: 320, xpToNext: 500 };
const recommended = {
  id: "a1000000-0000-0000-0000-000000000002",
  title: "Tambah Pecahan Penyebut Sama",
  strand: "Pecahan",
};
const weakTopics = ["Pecahan Tak Sama Penyebut", "Perimeter"];

export default function DashboardPage() {
  const xpPct = Math.round((student.xp / student.xpToNext) * 100);

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <header className="px-5 pt-6 pb-4">
        <p className="font-body text-sm text-ink/60">Selamat kembali,</p>
        <h1 className="font-display text-2xl font-bold text-ink">{student.name} 👋</h1>
      </header>

      {/* Streak + level: single glanceable strip, not a dense stat grid */}
      <section className="mx-5 flex items-center justify-between rounded-kite bg-biru shadow-card px-5 py-4 text-paper">
        <div>
          <p className="font-num text-2xl font-bold">{student.streak}</p>
          <p className="text-xs opacity-80">hari berturut-turut 🪁</p>
        </div>
        <div className="h-10 w-px bg-paper/30" />
        <div className="text-right">
          <p className="font-num text-2xl font-bold">Lvl {student.level}</p>
          <div className="mt-1 h-1.5 w-24 rounded-full bg-paper/25">
            <div className="h-1.5 rounded-full bg-kuning" style={{ width: `${xpPct}%` }} />
          </div>
          <p className="mt-0.5 text-[11px] opacity-80 font-num">{student.xp}/{student.xpToNext} XP</p>
        </div>
      </section>

      {/* Single primary action for the day — not a menu of ten options */}
      <section className="mx-5 mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Cadangan hari ini</p>
        <a
          href={`/learn/${recommended.id}`}
          className="block rounded-kite bg-kuning-light px-5 py-4 shadow-card active:scale-[0.98] transition-transform"
        >
          <p className="text-xs font-semibold text-kuning-dark">{recommended.strand}</p>
          <p className="font-display text-lg font-bold text-ink">{recommended.title}</p>
          <p className="mt-1 text-sm text-ink/70">Sambung belajar →</p>
        </a>
      </section>

      {/* Weak topics — collapsed to a simple list, not another chart */}
      {weakTopics.length > 0 && (
        <section className="mx-5 mt-5 rounded-kite border border-saga-light bg-saga-light/40 px-5 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-saga-dark">Perlu perhatian</p>
          <ul className="space-y-1.5">
            {weakTopics.map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm text-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-saga" />
                {t}
              </li>
            ))}
          </ul>
        </section>
      )}

      <BottomNav />
    </main>
  );
}
