import { createClient } from "@/lib/supabase/server";
import { LinkChildForm } from "@/components/parent/LinkChildForm";

interface LinkedChild {
  id: string;
  display_name: string;
  year_level: number;
  xp: number;
  level: number;
  streak_count: number;
}

export default async function ParentDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: links } = await supabase
    .from("parent_links")
    .select("students(id, display_name, year_level, xp, level, streak_count)")
    .eq("parent_user_id", user?.id ?? "");

  const children = (links ?? [])
    .map((l) => l.students as unknown as LinkedChild)
    .filter(Boolean);

  // Weak-topic counts fetched separately per child — small dataset (2-3
  // strands at MVP scope), so N queries here is fine; revisit with a
  // single aggregated RPC once topic count grows.
  const weakCounts = await Promise.all(
    children.map(async (child) => {
      const { count } = await supabase
        .from("topic_mastery")
        .select("*", { count: "exact", head: true })
        .eq("student_id", child.id)
        .eq("weak_flag", true);
      return count ?? 0;
    })
  );

  return (
    <main className="min-h-screen px-5 pb-10 pt-6">
      <h1 className="font-display text-2xl font-bold text-ink">Papan Pemuka Ibu Bapa</h1>
      <p className="mt-1 text-sm text-ink/60">{user?.email}</p>

      <div className="mt-5">
        <LinkChildForm />
      </div>

      <section className="mt-6 space-y-3">
        {children.length === 0 && (
          <p className="text-sm text-ink/50">Belum ada anak dipautkan lagi.</p>
        )}
        {children.map((child, i) => (
          <div key={child.id} className="rounded-kite bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-lg font-bold text-ink">{child.display_name}</p>
                <p className="text-xs text-ink/50">Tahun {child.year_level}</p>
              </div>
              <div className="text-right">
                <p className="font-num text-lg font-bold text-kuning-dark">Lvl {child.level}</p>
                <p className="text-xs text-ink/50 font-num">{child.streak_count} hari berturut-turut</p>
              </div>
            </div>
            {weakCounts[i] > 0 && (
              <p className="mt-2 rounded-lg bg-saga-light/50 px-3 py-1.5 text-xs text-saga-dark">
                {weakCounts[i]} topik memerlukan perhatian
              </p>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
