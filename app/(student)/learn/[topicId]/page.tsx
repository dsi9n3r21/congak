import Link from "next/link";
import { notFound } from "next/navigation";
import { TOPICS } from "@/lib/content/topics";
import { LessonCard } from "@/components/student/LessonCard";
import { BottomNav } from "@/components/ui/BottomNav";
import { Bi } from "@/lib/i18n/Bi";
import { UI } from "@/lib/i18n/dictionary";
import { createClient } from "@/lib/supabase/server";

export default async function LearnTopicPage({ params }: { params: { topicId: string } }) {
  const topic = TOPICS[params.topicId];
  if (!topic) notFound();

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
      <header className="px-5 pt-6 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-kuning-dark">
          <Bi text={topic.strand} lang={lang} />
        </p>
        <h1 className="font-display text-xl font-bold text-ink">
          <Bi text={topic.title} lang={lang} />
        </h1>
      </header>

      <section className="mx-5">
        <LessonCard topic={topic} lang={lang} />
      </section>

      <section className="mx-5 mt-5 flex gap-2">
        <Link
          href={`/practice/${topic.id}`}
          className="flex-1 rounded-kite bg-kuning px-5 py-4 text-center font-display text-base font-bold text-white shadow-card active:scale-[0.98] transition-transform"
        >
          <Bi text={UI.startPractice} lang={lang} /> →
        </Link>
        <Link
          href={`/quiz/${topic.id}`}
          className="flex-1 rounded-kite bg-biru px-5 py-4 text-center font-display text-base font-bold text-white shadow-card active:scale-[0.98] transition-transform"
        >
          <Bi text={UI.startQuiz} lang={lang} /> →
        </Link>
      </section>

      <BottomNav />
    </main>
  );
}
