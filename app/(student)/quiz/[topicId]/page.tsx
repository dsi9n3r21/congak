import { notFound } from "next/navigation";
import { TOPICS } from "@/lib/content/topics";
import { QuizPlayer } from "@/components/student/QuizPlayer";
import { BottomNav } from "@/components/ui/BottomNav";

export default function QuizTopicPage({ params }: { params: { topicId: string } }) {
  const topic = TOPICS[params.topicId];
  if (!topic) notFound();

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <header className="px-5 pt-6 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-kuning-dark">{topic.strand}</p>
        <h1 className="font-display text-xl font-bold text-ink">Kuiz: {topic.title}</h1>
      </header>

      <section className="mx-5">
        <QuizPlayer topic={topic} />
      </section>

      <BottomNav />
    </main>
  );
}
