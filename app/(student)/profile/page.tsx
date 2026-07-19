import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";
import { BottomNav } from "@/components/ui/BottomNav";

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: student } = await supabase
    .from("students")
    .select("display_name, year_level, avatar_id, theme, link_code")
    .eq("user_id", user?.id ?? "")
    .single();

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <header className="px-5 pt-6 pb-4 text-center">
        <p className="text-5xl">{student?.avatar_id ?? "🙂"}</p>
        <h1 className="mt-2 font-display text-xl font-bold text-ink">{student?.display_name}</h1>
        <p className="text-xs text-ink/50">Tahun {student?.year_level} · {user?.email}</p>
      </header>

      {student?.link_code && (
        <section className="mx-5 mt-2 rounded-kite border-2 border-dashed border-biru-light bg-biru-light/30 px-5 py-4 text-center">
          <p className="text-xs text-ink/60">Kod Pautan Ibu Bapa</p>
          <p className="mt-1 font-num text-xl font-bold tracking-widest text-biru-dark">{student.link_code}</p>
        </section>
      )}

      {/* Accessibility toggles — wired to the a11y-* body classes in
          globals.css. Kept as a simple static list for now; persisting
          the choice per-student is a fast-follow. */}
      <section className="mx-5 mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Kebolehcapaian</p>
        <div className="rounded-kite bg-white shadow-card divide-y divide-ink/5">
          <p className="px-4 py-3 text-sm text-ink/40">Teks Besar, Fon Mesra Disleksia, dan Mod Kurang Gangguan akan tersedia tidak lama lagi.</p>
        </div>
      </section>

      <section className="mx-5 mt-5">
        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-kite border-2 border-saga-light py-3 font-display font-bold text-saga min-h-[44px]"
          >
            Log Keluar
          </button>
        </form>
      </section>

      <BottomNav />
    </main>
  );
}
