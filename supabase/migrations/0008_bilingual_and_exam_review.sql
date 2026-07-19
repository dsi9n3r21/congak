-- Congak: bilingual support + exam question-level review data.

alter table students add column language_pref text not null default 'both'
  check (language_pref in ('ms', 'en', 'both'));

-- exams previously only stored the aggregate score/strengths/weaknesses —
-- a parent asking "what did she actually get wrong?" had nothing to read.
-- This stores the real per-question breakdown alongside the summary.
alter table exams add column question_results_json jsonb not null default '[]'::jsonb;
