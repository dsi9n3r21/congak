import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TOPICS } from "@/lib/content/topics";

export default async function ChildDetailPage({ params }: { params: { studentId: string } }) {
  const supabase = createClient();

  // RLS (parents_view_linked_students / mastery_visible_to_student_and_parent /
  // parents_view_linked_quizzes / parents_view_linked_mistake_patterns) already
  // scopes every one of these queries to children actually linked to the
  // logged-in parent — an unlinked studentId simply returns nothing below,
  // so there's no separate authorization check needed here.
  const { data: student } = await supabase
    .from("students")
    .select("display_name, year_level, xp, level, streak_count, avatar_id")
    .eq("id", params.studentId)
    .single();

  if (!student) notFound();

  const { data: mastery } = await supabase
    .from("topic_mastery")
    .select("topic_id, mastery_score, weak_flag")
    .eq("student_id", params.studentId);

  const { data: recentQuizzes } = await supabase
    .from("quizzes")
    .select("topic_id, score, accuracy, time_taken, created_at")
    .eq("student_id", params.studentId)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: patterns } = await supabase
    .from("mistake_patterns")
    .select("topic_id, mistake_type, frequency")
    .eq("student_id", params.studentId)
    .order("frequency", { ascending: false })
    .limit(5);

  const masteryByTopic = new Map((mastery ?? []).map((m) => [m.topic_id, m]));

  return (
    <main className="min-h-screen px-5 pb-10 pt-6">
      <Link href="/parent/dashboard" className="text-sm text-biru">
        ← Kembali
      </Link>

      <header className="mt-3 flex items-center gap-3">
        <span className="text-4xl">{student.avatar_id ?? "🙂"}</span>
        <div>
          <h1 className="font-display text-xl font-bold text-ink">{student.display_name}</h1>
          <p className="text-xs text-ink/50">
            Tahun {student.year_level} · Lvl {student.level} · {student.streak_count} hari berturut-turut
          </p>
        </div>
      </header>

      <section className="mt-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Penguasaan Topik</p>
        <div className="space-y-2">
          {Object.values(TOPICS).map((topic) => {
            const m = masteryByTopic.get(topic.id);
            const score = m?.mastery_score ?? 0;
            return (
              <div key={topic.id} className="rounded-kite bg-white p-3 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">{topic.title}</p>
                  <p className="font-num text-xs font-semibold text-ink/60">{score}%</p>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-ink/10">
                  <div
                    className={`h-1.5 rounded-full ${m?.weak_flag ? "bg-saga" : "bg-pandan"}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {patterns && patterns.length > 0 && (
        <section className="mt-6 rounded-kite bg-saga-light/40 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-saga-dark">Kesilapan Berulang</p>
          <ul className="space-y-1.5">
            {patterns.map((p) => (
              <li key={`${p.topic_id}-${p.mistake_type}`} className="text-sm text-ink">
                <span className="font-semibold">{p.frequency}x</span> — {TOPICS[p.topic_id]?.title ?? p.topic_id}
              </li>
            ))}
          </ul>
        </section>
      )}

      {recentQuizzes && recentQuizzes.length > 0 && (
        <section className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Kuiz Terkini</p>
          <div className="space-y-2">
            {recentQuizzes.map((q, i) => (
              <div key={i} className="flex items-center justify-between rounded-kite bg-white p-3 shadow-card">
                <div>
                  <p className="text-sm font-semibold text-ink">{TOPICS[q.topic_id]?.title ?? q.topic_id}</p>
                  <p className="text-xs text-ink/50">{new Date(q.created_at).toLocaleDateString("ms-MY")}</p>
                </div>
                <p className="font-num text-sm font-bold text-biru-dark">{q.accuracy}%</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
