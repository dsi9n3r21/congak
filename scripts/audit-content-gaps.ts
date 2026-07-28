import { TOPICS } from "../lib/content/topics";

type Row = {
  id: string;
  title: string;
  year: number;
  tips: number;
  mistakes: number;
  templates: number;
  hasChallenge: boolean;
  score: number; // higher = further from gold standard
};

const rows: Row[] = Object.values(TOPICS).map((t: any) => {
  const tips = t.tips?.length ?? 0;
  const mistakes = t.commonMistakes?.length ?? 0;
  const templates = t.questionTemplates?.length ?? 0;
  const hasChallenge = Boolean(t.challengeExample);
  let score = 0;
  score += Math.max(0, 3 - tips) * 3;
  score += Math.max(0, 4 - mistakes) * 2;
  score += Math.max(0, 4 - templates) * 2;
  if (!hasChallenge) score += 1;
  return { id: t.id.slice(-3), title: t.title.ms, year: t.yearLevel, tips, mistakes, templates, hasChallenge, score };
});

rows.sort((a, b) => b.score - a.score);

console.log(`Total topics: ${rows.length}`);
console.log(`Already at/above gold standard (score 0): ${rows.filter(r => r.score === 0).length}`);
console.log(`\nTop 20 weakest topics:`);
for (const r of rows.slice(0, 20)) {
  console.log(`  ...${r.id}  Y${r.year}  tips=${r.tips} mistakes=${r.mistakes} templates=${r.templates} challenge=${r.hasChallenge}  score=${r.score}  "${r.title}"`);
}

const scoreBuckets: Record<number, number> = {};
for (const r of rows) scoreBuckets[r.score] = (scoreBuckets[r.score] ?? 0) + 1;
console.log(`\nScore distribution:`, scoreBuckets);
