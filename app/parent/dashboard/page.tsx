import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LinkChildForm } from "@/components/parent/LinkChildForm";
import { logout } from "@/lib/actions/auth";
import { Bi } from "@/lib/i18n/Bi";
import { UI } from "@/lib/i18n/dictionary";

interface LinkedChild {
  id: string;
  display_name: string;
  year_level: number;
  xp: number;
  level: number;
  streak_count: number;
}

// Parents don't have their own language_pref (only students do) — 'both'
// is the safest default so a parent unfamiliar with either language alone
// still gets the full picture.
const lang = "both" as const;

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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink"><Bi text={UI.parentDashboard} lang={lang} /></h1>
          <p className="mt-1 text-sm text-ink/60">{user?.email}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-kite border-2 border-ink/10 px-3 py-2 text-xs font-semibold text-ink/60 min-h-[44px]"
          >
            <Bi text={UI.logout} lang={lang} />
          </button>
        </form>
      </div>

      <div className="mt-5 rounded-kite border-2 border-dashed border-biru-light bg-biru-light/30 p-4">
        <p className="text-sm font-semibold text-ink"><Bi text={UI.linkChildTitle} lang={lang} /></p>
        <p className="mt-0.5 text-xs text-ink/60"><Bi text={UI.linkChildSub} lang={lang} /></p>
        <LinkChildForm />
      </div>

      <section className="mt-6 space-y-3">
        {children.length === 0 && (
          <p className="text-sm text-ink/50"><Bi text={UI.noChildrenYet} lang={lang} /></p>
        )}
        {children.map((child, i) => (
          <Link
            key={child.id}
            href={`/parent/child/${child.id}`}
            className="block rounded-kite bg-white p-4 shadow-card active:scale-[0.98] transition-transform"
          >
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
                {weakCounts[i]} <Bi text={UI.topicsNeedingAttention} lang={lang} />
              </p>
            )}
          </Link>
        ))}
      </section>
    </main>
  );
}
