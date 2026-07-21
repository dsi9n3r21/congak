# Congak — Handover Notes (read this first in a new chat)

Malaysian KSSR primary maths PWA (Year 4-6). Next.js 14 App Router + TS +
Tailwind + Supabase, deployed on Vercel at congak.vercel.app (GitHub:
dsi9n3r21/congak). Built with Lynda (parent/dev, non-technical, testing on
her daughter Raida's account, works from VS Code on Windows).

## Current state: fully working end-to-end
Auth (student+parent roles) → profile setup → dashboard → learn → practice
→ quiz → exam → parent linking (6-char code) → parent sees child mastery,
recurring mistakes, exam review, "how to help" tips. Bilingual (BM/EN/both)
throughout. Accessibility toggles (large text, dyslexia font via Lexend,
low distraction) work and persist. Real streak tracking (Malaysia
timezone). PWA installable.

## Migrations: run 0001 through 0018 already (in Supabase SQL Editor, in
order — never skip ahead, each depends on the last). Next new migration
should be **0019**.

## Architecture patterns (follow these for consistency)
- **Bilingual everywhere**: `Bilingual` type = `{ ms: string; en: string }`
  in `lib/i18n/dictionary.ts`. Render via `<Bi text={...} lang={lang} />`
  from `lib/i18n/Bi.tsx` — 'both' mode shows BM primary, EN muted below
  (mirrors real DLP exam paper convention). `lang` comes from
  `student.language_pref` fetched server-side per page (default `'both'`
  when no student row yet, e.g. parent screens always use `'both'`).
  UI chrome strings live in the `UI` dictionary object; content-specific
  text (lessons, question prompts, mistake hints) is inline `Bilingual`
  objects in its own file.
- **Question generators**: `lib/questions/generators/*.ts`, each exports a
  `generate<Name>(params) => GeneratedQuestion`. Registered in
  `lib/questions/index.ts`'s `REGISTRY` map keyed by `generatorKey` string
  (this key is what `question_templates.generator_config_json` /
  `lib/content/topics.ts` reference). **Every MCQ generator MUST have a
  uniqueness-checked padding fallback** (`while (options.length < 3) { if
  (!options.includes(candidate)) push }`) — three separate generators
  shipped without this and produced duplicate/too-few options in
  production before a smoke test caught it. Always smoke-test new
  generators: install `tsx` with `npm install --no-save tsx`, write a
  throwaway script generating each template ~1000x checking option
  uniqueness + correctAnswer-is-in-options, run with `npx tsx`, delete the
  script after. Don't skip this — it has caught real bugs every time.
- **Mistake classification**: `lib/mistakes/classify.ts`, one `case` per
  `generatorKey`, returns `{ mistakeType, hint: Bilingual }`. Rule-based
  and free — no AI call. Feeds `mistake_patterns` table (recurring
  weakness tracking) via the `record_mistake_pattern` Postgres RPC
  (SECURITY DEFINER, atomic upsert+increment).
- **Topics**: single source of truth is `lib/content/topics.ts`
  (`TOPICS` record keyed by UUID). The real `topics` DB table only has
  `id/year_level/strand/title` — required ONLY because
  `practice_sessions`/`quizzes`/`exams` have a FK to `topics(id)`. **Every
  new topic needs a matching migration inserting into the real `topics`
  table**, or saving progress on it will fail with a FK violation.
  `supabase/migrations/0002_seed_content.sql` (the original lesson-content
  seed) is stale/unused — the app never reads it, known and accepted debt,
  don't bother syncing it.
- Topic IDs used so far: `a1000000-0000-0000-0000-000000000001` through
  `...022` (22 topics). Next new topic should start at `...023`.
- **Verify before shipping**: `cd congak && npx tsc --noEmit` (must show
  zero output) before packaging any zip. This has caught real errors
  every round — don't skip it.

## Current curriculum coverage (22 of ~40+ real KSSR sub-topics)
Verified against a real Pelangi Publishing reference book structure
(8 units per year, each with 10-16 sub-skills — see chat history for the
full unit list if needed, or ask Lynda to re-share the anyflip.com link:
https://anyflip.com/ekbvw/vshm/basic).

| Unit | Y4 | Y5 | Y6 |
|---|---|---|---|
| Numbers & Operations | addition, subtraction | multiplication (2-digit) | division (2-digit) |
| Fractions/Decimals/% | fractions (add) | decimals (add/sub) | percentage |
| Money | ✓ (change) | — | — |
| Time | — | ✓ (duration) | — |
| Length/Mass/Volume | perimeter | — | volume (liquid) |
| **Space** (polygons/angles/area) | area (rectangle/square), angle types (acute/right/obtuse/reflex) | angles (straight line, at a point), area (composite) | angles (triangle sum), area (triangle), circumference & area of a circle |
| Coordinates/Ratio/Proportion | — | — | ratio (simplify) |
| Data Handling | — | average | — |

**Diagram infrastructure** (`lib/questions/types.ts` `diagram` field,
`components/student/diagrams/`) has four kinds: `"angle"`, `"triangle"`,
`"point3"`, `"circle"`. Space unit is complete — see prior rounds in this
doc's history if you need the details.

**Numbers & Operations expanded this round** — previously only had
Y4 addition. Added: `whole_numbers_subtraction` (Y4, id `...020`, mirrors
the addition generator's column/borrow pattern), `whole_numbers_multiplication`
(Y5, id `...021`, multiplies by a 2-digit number, models the classic
"forgot to shift the tens partial product" mistake), and
`whole_numbers_division` (Y6, id `...022`, divides by a 2-digit divisor —
kept exact/no-remainder at this level, since remainders-as-decimals is a
separate teaching decision worth its own topic later). All three follow
the existing `whole_numbers_addition` conventions closely: same equation-style
prompt format (`a op b = ?`), same `noCarryAdd`-style mirrored helper
functions duplicated between the generator and `classify.ts` (needed so
`classify.ts` can detect the mistake pattern from a free-typed "fill"
answer, not just an MCQ pick — same as the existing addition topic).

Word-based answers (e.g. angle type names, not numbers) go through
`lib/questions/optionLabels.ts` — `correctAnswer`/`options` stay as plain
canonical keys (`"acute"`, `"right"`, ...) for grading, and
`QuestionPlayer` looks each key up in `OPTION_LABELS` to render the
translated word, falling back to the raw string for numeric generators.
Reuse this map (add new keys) for any future word-based generator.

**Tips & "How To"** — every topic (all 22) has 2+ tips and a 3+ step
general `howTo` method, per teacher feedback. See `lib/content/topics.ts`
`TopicContent` — both fields are required by TypeScript, so a new topic
missing either won't compile.

**Numbers & Operations still open**: Y5/Y6 need more than one topic each
in a real curriculum (this unit typically has the most sub-skills of any
unit — think rounding, negative numbers, index notation depending on
year). What's here now is a solid start (one topic per year, all three
basic operations besides addition covered), not full coverage. Next
round could either go deeper here or move to Coordinates/Ratio/Proportion
or Data Handling, which are equally thin — worth asking Lynda which
matters most for her daughter's actual upcoming schoolwork.

## Known deferred items (don't start these unprompted)
- **Visual look-and-feel / branding polish**: Lynda explicitly asked to
  defer this until "everything is running smoothly" — she shared two
  screenshot references (a gamified dashboard mockup + a scores/leaderboard
  mockup with mascot character, national/state/school rankings,
  multi-subject tabs for Matematik/Sains/Bahasa Inggeris, certificates,
  rewards store). Multi-subject and leaderboards are much bigger scope
  (new content domains, cross-student ranking infra) — flagged as
  separate future decisions, not folded into current math-only build.
- Story Adventure / gamification (`/quests` route currently shows an
  honest "coming soon" placeholder, not a 404).
- Professor Nombor's hints are rule-based text (from classify.ts), not a
  real OpenAI call yet — `OPENAI_API_KEY` still blank in Vercel env vars.
- Teacher/school accounts, subscriptions/billing — untouched, later SaaS
  phase per original PRD.
- Bottom nav labels are BM-only by design (space constraint on 5 compact
  tabs) — everywhere else respects `language_pref`.

## Deployment gotchas already hit (avoid repeating)
- Vercel: watch for **duplicate projects** (auto-suffixed like
  `congak-mhpl`) if reconnecting the repo — caused a real outage from
  missing env vars on the wrong project. Confirm only one project exists.
- **PWA service worker caches aggressively** — after any deploy, if
  changes don't appear, test in incognito first before assuming the build
  failed.
- Supabase auto-enables RLS on new tables by default with zero policies
  (denies everything) — always add explicit policies in the same
  migration that creates a table, for insert/select/update as needed, not
  just select.
- Once had a **stray nested `app/congak/` folder** inside the repo (from a
  bad drag-and-drop file replace) serving stale code and breaking the
  build — if a build error path looks like `./app/congak/app/...`
  (doubled), that's the signature of this happening again.

## Workflow with Lynda
Non-technical, testing on Windows/VS Code, deploys via GitHub push →
Vercel auto-deploy. Always: (1) fix/build the feature, (2) run
`npx tsc --noEmit` clean, (3) zip with
`zip -r congak-scaffold.zip congak -x "*/node_modules/*" -x "*/.next/*" -x "*/.git/*"`,
(4) `present_files`, (5) tell her exactly which new migration number(s) to
run and in what order. She replaces files by extracting the zip and
overwriting her local folder (not touching `node_modules`/`.env.local`),
then `git add . && git commit -m "..." && git push`.
