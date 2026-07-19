import { notFound } from "next/navigation";
import { TOPICS } from "@/lib/content/topics";
import { QuestionPlayer } from "@/components/student/QuestionPlayer";
import { BottomNav } from "@/components/ui/BottomNav";

export default function PracticeTopicPage({ params }: { params: { topicId: string } }) {
  const topic = TOPICS[params.topicId];
  if (!topic) notFound();

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <header className="px-5 pt-6 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-kuning-dark">{topic.strand}</p>
        <h1 className="font-display text-xl font-bold text-ink">{topic.title}</h1>
      </header>

      <section className="mx-5">
        <QuestionPlayer topic={topic} />
      </section>

      <BottomNav />
    </main>
  );
}
