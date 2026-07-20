import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TOPICS } from "@/lib/content/topics";
import { Bi } from "@/lib/i18n/Bi";
import { UI } from "@/lib/i18n/dictionary";

const lang = "both" as const; // parents see both languages by default — see dashboard page for rationale

interface QuestionReviewEntry {
  topicId: string;
  prompt: { ms: string; en: string };
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  mistakeType: string | null;
  hint: { ms: string; en: string } | null;
}

export default async function ChildDetailPage({ params }: { params: { studentId: string } }) {
  const supabase = createClient();

  // RLS already scopes every query below to children actually linked to the
  // logged-in parent — an unlinked studentId simply returns nothing.
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

  const { data: recentExams } = await supabase
    .from("exams")
    .select("config_json, score, total, question_results_json, time_taken_seconds, created_at")
    .eq("student_id", params.studentId)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: patterns } = await supabase
    .from("mistake_patterns")
    .select("topic_id, mistake_type, frequency")
    .eq("student_id", params.studentId)
    .order("frequency", { ascending: false });

  const masteryByTopic = new Map((mastery ?? []).map((m) => [m.topic_id, m]));
  const weakTopicIds = Object.keys(TOPICS).filter((id) => masteryByTopic.get(id)?.weak_flag);

  return (
    <main className="min-h-screen px-5 pb-10 pt-6">
      <Link href="/parent/dashboard" className="text-sm text-biru">
        ← Kembali / Back
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
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
          <Bi text={UI.topicMastery} lang={lang} />
        </p>
        <div className="space-y-2">
          {Object.values(TOPICS).map((topic) => {
            const m = masteryByTopic.get(topic.id);
            const score = m?.mastery_score ?? 0;
            return (
              <div key={topic.id} className="rounded-kite bg-white p-3 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink"><Bi text={topic.title} lang={lang} /></p>
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

      {/* "How to Help" — this is the direct answer to "what's wrong and how
          do I fix it", using the same tips/common-mistakes content the
          child sees in the Learn screen, filtered to their actual weak
          topics and recorded mistake patterns rather than generic advice. */}
      {weakTopicIds.length > 0 && (
        <section className="mt-6 rounded-kite bg-pandan-light/50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-pandan-dark">
            <Bi text={UI.howToHelp} lang={lang} />
          </p>
          <div className="space-y-3">
            {weakTopicIds.map((topicId) => {
              const topic = TOPICS[topicId];
              const relevantPatterns = (patterns ?? []).filter((p) => p.topic_id === topicId);
              return (
                <div key={topicId} className="rounded-kite bg-white p-3">
                  <p className="text-sm font-semibold text-ink"><Bi text={topic.title} lang={lang} /></p>
                  <p className="mt-1 text-xs text-ink/70"><Bi text={topic.tips[0]} lang={lang} /></p>
                  {relevantPatterns.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {relevantPatterns.map((p) => {
                        const mistakeDesc = topic.commonMistakes.find((cm) => cm.mistakeType === p.mistake_type)?.description;
                        return (
                          <li key={p.mistake_type} className="text-xs text-saga-dark">
                            <span className="font-semibold">{p.frequency}x</span>
                            {mistakeDesc ? <> — <Bi text={mistakeDesc} lang={lang} /></> : ` — ${p.mistake_type}`}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {recentExams && recentExams.length > 0 && (
        <section className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
            <Bi text={UI.recentExams} lang={lang} />
          </p>
          <div className="space-y-2">
            {recentExams.map((exam, i) => {
              const wrongAnswers = ((exam.question_results_json as QuestionReviewEntry[]) ?? []).filter(
                (q) => !q.isCorrect
              );
              return (
                <details key={i} className="rounded-kite bg-white p-3 shadow-card">
                  <summary className="flex cursor-pointer items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {exam.score}/{exam.total} · {new Date(exam.created_at).toLocaleDateString("ms-MY")}
                      </p>
                      <p className="text-xs text-ink/50">
                        {Math.round((exam.score / exam.total) * 100)}% · {Math.round(exam.time_taken_seconds / 60)} min
                      </p>
                    </div>
                    {wrongAnswers.length > 0 && (
                      <span className="text-xs font-semibold text-biru"><Bi text={UI.reviewMistakes} lang={lang} /></span>
                    )}
                  </summary>
                  {wrongAnswers.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-ink/5 pt-3">
                      {wrongAnswers.map((q, j) => (
                        <div key={j} className="rounded-lg bg-saga-light/30 p-2.5 text-xs">
                          <p className="font-semibold text-ink"><Bi text={q.prompt} lang={lang} /></p>
                          <p className="mt-1 text-ink/70">
                            <Bi text={UI.yourAnswer} lang={lang} />: <span className="font-num text-saga-dark">{q.studentAnswer || "—"}</span>
                            {" · "}
                            <Bi text={UI.correctAnswerLabel} lang={lang} />: <span className="font-num text-pandan-dark">{q.correctAnswer}</span>
                          </p>
                          {q.hint && <p className="mt-1 text-ink/60"><Bi text={q.hint} lang={lang} /></p>}
                        </div>
                      ))}
                    </div>
                  )}
                </details>
              );
            })}
          </div>
        </section>
      )}

      {recentQuizzes && recentQuizzes.length > 0 && (
        <section className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
            <Bi text={UI.recentQuizzes} lang={lang} />
          </p>
          <div className="space-y-2">
            {recentQuizzes.map((q, i) => (
              <div key={i} className="flex items-center justify-between rounded-kite bg-white p-3 shadow-card">
                <div>
                  <p className="text-sm font-semibold text-ink"><Bi text={TOPICS[q.topic_id]?.title} lang={lang} /></p>
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
