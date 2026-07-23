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

## Migrations: run 0001 through 0023 already (in Supabase SQL Editor, in
order — never skip ahead, each depends on the last). Next new migration
should be **0024**.

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
  `...033` (33 topics). Next new topic should start at `...034`.
- **Verify before shipping**: `cd congak && npx tsc --noEmit` (must show
  zero output) before packaging any zip. This has caught real errors
  every round — don't skip it.

## Current curriculum coverage (38 topics — see note on the denominator)
**Curriculum source upgraded this round.** Lynda uploaded the actual
official KSSR Mathematics Year 4/5/6 textbooks (`Math.zip` — a teacher had
compared Congak to Delima and suggested this). Their real tables of
contents were extracted directly (`pdftotext` on the ToC pages — the
English headings extract cleanly; some Malay stylized-font headings don't,
but weren't needed). **This replaces the old "~40+ topic" estimate, which
was a rough guess from skimming a different (Pelangi) reference book — the
real curriculum is substantially bigger, especially in three strands
Congak barely touches:**
- **Fractions/Decimals/Percentages** — by far the biggest gap. Real books
  have a full progression each year (fraction multiplication/division,
  mixed numbers, all 4 decimal operations, percentage conversions) — likely
  15-20 sub-topics alone across three years. Congak has 8 after this round.
- **Money** — Y5 adds financial literacy (interest, credit vs. cash). Y6
  gets genuinely advanced: cost/profit/loss, discounts/rebates/vouchers,
  invoices/bills/receipts/tax, interest/dividends, assets/liabilities/
  insurance/takaful. Congak still only has Y4 "giving change" — untouched
  this round.
- **Time / Length/Mass/Volume** — real books cover unit conversions and
  all 4 operations across both, every year. Congak has almost nothing here
  — untouched this round.

**Because of this, stop reporting "X/40 ≈ Y%" — that denominator was
wrong.** The real total is likely 70-100+ sub-topics once Money and
Time/Length/Mass/Volume are properly scoped from the textbooks (not yet
done — only Fractions/Decimals/Percentages has been cross-checked in
detail so far, see below). Until all 8 strands are scoped from the real
books, report progress as "N topics shipped, biggest known gaps are X/Y/Z"
rather than a percentage — a confident-sounding wrong percentage is worse
than no percentage.

**Space and Numbers & Operations are the two strands closest to real
coverage** — Numbers & Operations has all 4 basic operations at every
year level; Space covers most angle/area/perimeter/circle topics the real
books have (Y6 circle radius/diameter and specific-degree angle-drawing
exercises haven't been checked in detail against the real book yet).

| Unit | Y4 | Y5 | Y6 |
|---|---|---|---|
| Numbers & Operations | addition, subtraction, multiplication (1-digit), division (1-digit) | multiplication (2-digit), division (1-digit), addition/subtraction (6-digit) | multiplication (4-digit×2-digit), division (2-digit), mixed operations (BODMAS), addition (3 addends), subtraction (from round number) |
| Fractions | add (same denom), subtract (same denom) | — | divide by whole number |
| Decimals | add/subtract (1dp) | add/subtract (2dp), multiply, divide | — |
| Percentage | — | — | basic (% of quantity) |
| Money | ✓ (change) | — | — |
| Time | — | ✓ (duration) | — |
| Length/Mass/Volume | perimeter | — | volume (liquid) |
| **Space** (polygons/angles/area) | area (rectangle/square), angle types | angles (straight line, at a point), area (composite) | angles (triangle sum), area (triangle), circumference & area of a circle |
| Coordinates/Ratio/Proportion | — | coordinates | ratio (simplify) |
| Data Handling | — | average, bar graphs | — |

Real Y6 Data Handling also includes basic likelihood/probability (certain/
impossible, equally likely) — Congak has none of this, not yet scoped in
detail.

**This round shipped 5 Fractions/Decimals topics** (ids `...034`-`...038`):
Y4 fraction subtraction (same denominator, pairs with existing Y4
addition), Y4 decimal add/subtract **at 1 decimal place** (Y4 had zero
decimal topics before — the pre-existing `decimal_add_subtract` generator
is 2-decimal-place, which is actually Y5 level; kept both as separate
generators rather than unifying with a "places" param, matching how the
whole-number generators are split one-per-year), Y5 decimal multiply/
divide (completing the 4-op set for Y5 decimals), and Y6 "dividing a
fraction by a whole number" (first of four fraction-division sub-topics in
the real Y6 book — proper÷whole, mixed÷whole, proper÷proper, mixed÷
proper — started with the simplest).

**Bug caught by the smoke test this round, fixed before shipping:** the
new decimal generators' distractor logic didn't dedupe against each other
or pad when they collided (e.g. multiplying by a 0.0 decimal made two
"classic mistake" distractors both equal 0.0) — caused ~1% of generated
questions to have fewer than 3 options or duplicates. Added a shared
`finalizeOptions()` helper in `decimals.ts` (dedupes with a `Set`, pads
with small random offsets, capped retry loop) and applied it to all 4
decimal generators, including the pre-existing Y5 one which had the same
latent bug. Re-ran the smoke test across all 38 topics (37,500 generated
questions) afterward — 0 failures. If a future generator's distractor
logic ever produces a collision like this again, reuse `finalizeOptions()`
rather than re-deriving the dedupe/pad logic per generator.

**Diagram infrastructure** (`lib/questions/types.ts` `diagram` field,
`components/student/diagrams/`) has six kinds now: `"angle"`,
`"triangle"`, `"point3"`, `"circle"`, `"bar_chart"`, and
`"coordinate_grid"` (`CoordinateGridDiagram.tsx` — first-quadrant grid,
one plotted point, dashed guide lines to each axis).

**Numbers & Operations Y4/Y5/Y6 gaps shipped this round** — six new
topics, ids `...028`–`...033`, closing the last holes in the four basic
operations across all three years:
- `whole_numbers_multiplication_y4` (id `...028`) — 1-digit multiplier,
  the Y4-appropriate level (Y5 already had 2-digit multiplier).
- `whole_numbers_division_y4` (id `...029`) — 1-digit divisor with a
  smaller quotient range than Y5's (both use a 1-digit divisor; Y4's
  quotient tops out at 99, Y5's at 999 — the only intentional difference).
- `whole_numbers_addition_y5` / `whole_numbers_subtraction_y5` (ids
  `...030`, `...031`) — 6-digit numbers (up to 1,000,000), the Y5-level
  step up from Y4's 5-digit addition/subtraction.
- `whole_numbers_addition_y6` (id `...032`) — **three addends**, not two —
  the Y6-distinctive step up, with its own `forgot_addend` mistake type.
- `whole_numbers_subtraction_y6` (id `...033`) — subtracting from a round
  number (e.g. 500,000) to force a cascading borrow across several zero
  columns in a row — the classic Y6 pain point, distinct from Y5's
  subtraction where the minuend's digits are just random.

With this round, Numbers & Operations now has all four basic operations
present at every year level (Y4/Y5/Y6) — previously only some
year/operation combinations existed. See the coverage table above.

**Reading Coordinates (Y5)** — `coordinates` generator, id `...024`, the
first topic in the Coordinates strand (that strand previously only had Y6
ratio simplification). **Deliberately MCQ-only** — the answer format
`(x, y)` is too fragile for the app's exact-string "fill" grading
(`answer.trim() === correctAnswer`, no internal-whitespace normalization —
a student typing `(3,5)` instead of `(3, 5)` would be marked wrong for a
formatting reason, not a math one). If a future topic needs a
similarly-formatted free-typed answer, either keep it MCQ-only like this
one, or fix the grading to normalize whitespace/punctuation first — that's
a `QuestionPlayer.tsx` change worth doing once, not per-topic.

**Numbers & Operations Y5/Y6 gaps (previous round)** — three topics, ids
`...025`–`...027`: `whole_numbers_division_y5` (1-digit divisor),
`whole_numbers_multiplication_y6` (4-digit×2-digit), and `mixed_operations`
(id `...027`, BODMAS — combined operations without brackets, fixed
pattern `a + b × c` so the "did it left to right" mistake
(`ignored_order_of_operations`) is unambiguous to detect. This was a new
sub-strand within Numbers & Operations, not previously covered at all.

Word-based answers (e.g. angle type names, not numbers) go through
`lib/questions/optionLabels.ts` — see `OPTION_LABELS` for details if
adding another word-based generator.

**Tips & "How To"** — every topic (all 33) has 2+ tips and a 2+ step
general `howTo` method, per teacher feedback. Both fields are required by
TypeScript on `TopicContent`.

**Still open**: Numbers & Operations is now essentially complete for the
four basic operations (see coverage table) — remaining gaps are
Ratio/Proportion (only Y6 ratio simplification — no Y4/Y5 groundwork, no
direct proportion) and Data Handling (median/mode, pictographs). Ask
Lynda what matters most for her daughter's actual upcoming schoolwork
before picking the next one blind.

## Pintar integration (chat assistant, built by Lynda's husband)
Pintar's engine lives on the Basrim server (same architecture as an
existing assistant called Pak Misai) — Congak only owns the frontend side.
Implemented per `pintar-congak-handoff.md` v2 (decisions locked with
Lynda's husband's Claude):

- **`app/(student)/layout.tsx`** — new shared layout, renders `<BottomNav />`
  once. All 9 pre-existing student pages (`dashboard`, `learn`,
  `learn/[topicId]`, `practice`, `practice/[topicId]`, `quiz/[topicId]`,
  `exam`, `quests`, `profile`) had their own `import { BottomNav }` +
  `<BottomNav />` removed — that was 9x duplication before this. Each
  page's own `<main>` wrapper was left untouched (styling varies slightly
  per page); the layout renders `<BottomNav />` as a sibling **after**
  `{children}`, not nested inside — fine visually since `BottomNav` is
  `fixed bottom-0`, but worth knowing if it ever needs to be nested for a
  layout reason later.
- **`app/(student)/pintar/page.tsx`** — new 6th tab, added to `BottomNav`'s
  `TABS` array (🧠 icon). Dedicated route, no modal/portal, per the locked
  decision — gets `<BottomNav />` for free via the shared layout.
- **`lib/content/recommended.ts`** — `getRecommendedTopic()` extracted
  from what used to be inline logic in `dashboard/page.tsx`. Both
  `dashboard/page.tsx` and `pintar/page.tsx` now call this one function.
- **`app/api/pintar/route.ts`** — Congak's own API route that proxies to
  Pintar's engine. **This exists specifically so the shared secret
  (`PINTAR_API_KEY`) never reaches the browser** — the browser only ever
  calls `/api/pintar` (same-origin, no CORS needed for that hop); this
  route attaches the `x-pintar-key` header server-side before forwarding
  to `https://basrim.com.my/pintar-engine/chat`. Don't change this to a
  direct client-side fetch to the Basrim domain — that would expose the
  key in the browser's network tab to anyone who opens devtools.
- **`PINTAR_ENGINE_URL` and `PINTAR_API_KEY`** — added to `.env.example`
  as blank placeholders only (never commit the real key). **Real values
  need to be set in Vercel's env vars (Production + Preview) — this
  hasn't been done yet, ask Lynda to add them, or do it for her if she
  shares Vercel access.** The actual key value was shared in chat, not
  committed anywhere in the repo.
- **`components/student/PintarChat.tsx`** — the chat UI, Client Component.
  Local greeting bubble on mount (not sent to the engine — see comment in
  the file for why), then a normal send/receive loop against
  `/api/pintar`. `sessionId` is a fresh `crypto.randomUUID()` per page
  load — **not persisted**, matching the locked "start stateless" decision.
  If Lynda wants chat history to survive a refresh later, that's a new
  Supabase table + migration (next one would be `0023`), deliberately not
  built yet.
- **`public/pintar/*.png`** — the 6 avatar-state images (idle, thinking,
  showing, correct, wrong, confuse) from Lynda's husband, used directly
  via `next/image` — first use of `next/image` in this app (everywhere
  else so far has had no images at all).
- **Two contract fields Congak can't populate accurately yet, flagged
  in-code, not silently faked:**
  - `context.xpToday` — Congak only tracks a running total (`students.xp`),
    no daily tracking table exists. Currently sends total `xp` as a
    stopgap. If Pintar's engine actually uses this number to talk about
    "today," it'll be wrong until a real daily-XP table is built.
  - `context.currentLevel` — sent as `` `Tahap ${level}` ``, no `/10` — the
    handoff doc's example (`"Tahap 2/10"`) implies a level cap that doesn't
    exist in Congak's data model (XP-threshold leveling, uncapped).
  - `language` — contract wants `"bm" | "en"`, Congak's own `language_pref`
    has a third value (`"both"`, dual-language display). `"both"` maps to
    `"bm"` for the engine call.
- **`.gitignore` added** — didn't exist before at all. Added now
  specifically because this round introduces a real secret
  (`PINTAR_API_KEY`) — if Lynda ever creates a local `.env.local` and
  pushes to git without this, it would get committed.

## Visual restyle (in progress — dashboard done, other screens not yet)
Lynda decided to start visual polish early (not waiting for full
feature-completeness as originally planned) to get feedback from a few
teachers and students — framed to them as work-in-progress. Reference:
two screenshots she shared (a gamified dashboard mockup + a scores/
leaderboard mockup with mascot character, national/state/school rankings,
multi-subject tabs, certificates, rewards store).

**Scope decision, discussed with Lynda directly:** the leaderboard mockup
mixes two very different things —
- "Skor" (personal stats: today/this year/accuracy/streak) — real data,
  buildable anytime.
- "Carta Bulanan" / "Carta Sekolah" (rankings against other real students
  nationally) — Congak has no other schools/families in it at all right
  now (single-tenant), so this is either fake data shown to a child as if
  real (explicitly declined — not something to build even as a
  placeholder) or genuine multi-tenant infra, which is the deferred SaaS
  phase, not a quick add.
- Misi (quests) — currently a "coming soon" placeholder — CAN be built
  without other students (daily missions/badges from the student's own
  real activity data), but wasn't in scope for this round either.

**This round shipped: dashboard restyle only** (`dashboard/page.tsx`),
matching the reference mockup's visual language while keeping Congak's
existing "wau kite" brand palette (kuning/biru/saga/pandan) rather than
switching to the mockup's purple/lavender — that palette choice was
already a deliberate decision documented in `tailwind.config.ts`, not
something to abandon for one screenshot. Card-by-card mapping:
- Hero (level + XP) → gradient `biru` → `biru-dark`, was flat `bg-biru`
  before. Added a presentational-only level-tier label ("Pelajar Baru" →
  "Juara Congak" by level range, in `dashboard/page.tsx` — not stored
  anywhere, purely cosmetic).
- "Cadangan hari ini" (recommended topic) → `pandan` (green) themed now,
  was `kuning-light` before.
- "Perlu perhatian" (weak topics) → unchanged `saga` (red), already
  matched.
- Parent link code → unchanged `biru`, already matched.
- Exam CTA → switched from `saga` to `kuning` theming to better match the
  mockup's orange, and to keep `saga` reserved strictly for alerts per
  its documented role ("errors, needs improvement, alerts").
- Added the Pintar `idle.png` mascot to the header as a decorative image
  (first use of `next/image` outside `PintarChat.tsx`).

**Deliberately NOT added:** the mockup's "Kumpul XP, buka ganjaran!"
(rewards teaser) card — there's no rewards/badges backend at all (checked
migrations, nothing exists), so a card promising a reward store that
doesn't exist would be a dead end for Raida to tap. Also didn't fabricate
an "XP Hari Ini" (today's XP) number — the mockup shows a daily XP goal,
but Congak only tracks a running total (`students.xp`), no daily table
exists (same gap already flagged for Pintar's `xpToday` field). The hero
card shows real total-XP-toward-next-level progress instead, honestly
labeled "XP Kamu" (Your XP) rather than implying it's today's.

**Still needed**: same restyle treatment for `learn`, `practice`, `quiz`,
`exam`, `quests`, `profile` — none of those have been touched yet, so the
app currently looks inconsistent (new dashboard, old-style everywhere
else). A real "Skor" personal-stats page and real Misi (daily missions/
badges) are separate future scope, not visual-only.

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
- Bottom nav labels are BM-only by design (space constraint on 6 compact
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
