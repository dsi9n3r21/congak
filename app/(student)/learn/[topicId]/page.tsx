import Link from "next/link";
import { notFound } from "next/navigation";
import { TOPICS } from "@/lib/content/topics";
import { LessonCard } from "@/components/student/LessonCard";
import { BottomNav } from "@/components/ui/BottomNav";

export default function LearnTopicPage({ params }: { params: { topicId: string } }) {
  const topic = TOPICS[params.topicId];
  if (!topic) notFound();

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <header className="px-5 pt-6 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-kuning-dark">{topic.strand}</p>
        <h1 className="font-display text-xl font-bold text-ink">{topic.title}</h1>
      </header>

      <section className="mx-5">
        <LessonCard topic={topic} />
      </section>

      <section className="mx-5 mt-5">
        <Link
          href={`/practice/${topic.id}`}
          className="block rounded-kite bg-kuning px-5 py-4 text-center font-display text-base font-bold text-white shadow-card active:scale-[0.98] transition-transform"
        >
          Mula Latihan →
        </Link>
      </section>

      <BottomNav />
    </main>
  );
}
