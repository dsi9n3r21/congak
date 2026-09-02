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

## Migrations: run 0001 through 0040 already (in Supabase SQL Editor, in
order — never skip ahead, each depends on the last). Next new migration
should be **0041**.

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
  `...085` (85 topics). Next new topic should start at `...086`.
- **Verify before shipping**: `cd congak && npx tsc --noEmit` (must show
  zero output) before packaging any zip. This has caught real errors
  every round — don't skip it.

## UI: stacked fraction rendering (not part of the content retrofit numbering)
Lynda flagged that fractions rendered as flat "2/5" text are hard for a
Y4-6 student to parse — they see stacked notation (numerator over a
dividing bar over denominator) on paper and in their textbooks. Added
`lib/ui/mathText.tsx` (`renderMathText`) — a regex-based inline
re-typesetter, not a new content field or schema change. It scans any
string for `\d+/\d+` (optionally preceded by a whole-number part for
mixed numbers like "3 2/7") and swaps each match for a small stacked
`<span>` — everything else in the string renders unchanged.

Wired into every surface that shows fraction text to a student:
`lib/i18n/Bi.tsx` (covers tips/howTo/explanation/mistakes/worked-example
steps/question prompts in one place, since they all route through `Bi`),
`LessonCard.tsx`'s `ExampleCard` (the raw `problem`/`answer` strings,
which are NOT `Bilingual` and bypass `Bi`), and the MCQ option-rendering
in `QuestionPlayer.tsx`, `QuizPlayer.tsx`, and `ExamFlow.tsx` (three
separate components that each render `question.options` independently —
QuizPlayer/ExamFlow don't even use the `OptionLabel` helper
QuestionPlayer has, they render `{opt}` raw, so all three needed the fix
individually). Free-text answer *inputs* are deliberately left alone —
only display surfaces get the stacked treatment, never the field a
student types into.

Verified: regex parsing tested directly against representative content
(bare fractions, mixed numbers, prose with a fraction mid-sentence) and
deliberate near-misses (`1:10` ratio notation, `km/h` units) — no false
positives.

**Real bug Lynda caught via screenshot after this shipped:** the
dividing bar wasn't rendering at all — just two stacked numbers with no
line between them. My first two attempts (thicker height-div, then a
border-based divider) were both treating the symptom. **The actual
cause: `tailwind.config.ts`'s `content` glob only scanned `./app/**` and
`./components/**` — `lib/ui/mathText.tsx` lives under `./lib/`, so
Tailwind's JIT compiler never scanned it, meaning every class used
there (the divider bar, the stacked-fraction layout, all of it) was
silently absent from the compiled CSS.** Fixed by adding
`"./lib/**/*.{ts,tsx}"` to the content array. Proved the fix rather than
assuming it: compiled the actual CSS via `npx tailwindcss -i
./app/globals.css -o out.css` with and without the `lib/` glob —
`.border-t-2` produces zero matches without it, one with it.

**This same bug silently affected `lib/i18n/Bi.tsx` too** — it's also
under `lib/`, predates this session entirely, and its `text-[0.85em]`
class (used for the muted English subtitle line in "both languages"
mode) had the same problem: that exact arbitrary-value class doesn't
appear anywhere under `app/` or `components/`, so it was never generated
either. The English subtitle has likely been rendering at full size
instead of smaller/muted this whole time. Fixed as a side effect of the
same content-glob fix — worth Lynda glancing at the "both languages"
toggle to confirm the subtitle now actually looks smaller/muted.

**Lesson for any future `lib/`-based component with Tailwind classes:**
don't just check that classes look reasonable — compile the actual CSS
and grep for the specific class, the way this was eventually confirmed.
`tsc --noEmit` passing says nothing about whether Tailwind's JIT
actually generated the styles a component depends on.

## Current curriculum coverage (85 topics — see note on the denominator)
**Explicit instruction from Lynda: keep going until the real curriculum is
fully covered.** Standing instruction, not a one-off batch.

**Round 18 (id `...085`) — a curriculum-architect-style brief (elaborate
`learnContent`/`howToSteps`/`workedExamples[]` JSON schema, framed as if a
separate developer would implement it) surfaced one real, previously
undocumented gap: Y5 Time only covered clock-time+duration (`...007`) and
duration+duration (`...043`/`...048`/`...049`/`...064`) — nothing for
**converting between 12-hour and 24-hour format**. The brief's schema
itself didn't match `TopicContent`/the 3 actual question `type`s
(mcq/fill/word_problem) or existing diagram kinds (no clock/timeline
diagram component exists) — adapted the *pedagogy* (misconception-targeted
distractors, multi-step word problems with an irrelevant-info decoy,
bilingual, real Malaysian bus-schedule context) into the real schema
instead of building unrendered fields. New generator
`time_format_convert` in `lib/questions/generators/time.ts` covers both
directions, the noon/midnight special case (0000/1200, the single most
common student mix-up), a bus-schedule word-problem wrapper, an
error-spotting variant, and a reverse problem chained with duration
addition. Smoke-tested 12,000 generations, 0 failures.

**Round 19 (retrofit, in progress) — Lynda sent a "retrofit every topic to
the ...085 gold standard" brief.** Ran `npx tsx scripts/audit-content-gaps.ts`
(kept permanently — re-run it anytime to re-rank topics by gap: tip
count/type, mistake count, template count) and confirmed **all 85 topics
score below the standard** — this predates the brief, it's not new
regression. Retrofitting content fields (explanation/tips/howTo/
workedExample/commonMistakes) is pure content work. Retrofitting
questionTemplates to add misconception-mapped distractors and
challenge/error-spotting/reverse-problem variants requires touching the
underlying generator too — there are 79 distinct generatorKeys across the
85 topics, so this is realistically ~79 small generator upgrades, not a
content-only pass. Doing all 85 in one sitting isn't realistic without
rushing and shipping worse content than the current baseline — retrofitting
in ranked batches instead (worst-scoring first), same "verify every
round" discipline as every other round: `npx tsc --noEmit` clean +
smoke-test (~2000x per template config) before packaging.

Batch 1 done this round: `...056` (Tambah & Tolak Peratus) and `...060`
(Faedah dan Dividen), both previously worst-scoring (score 17). Each got:
full Learn-tab rewrite with a Malaysian scenario opener, 3 typed tips
(mnemonic/warning/shortcut), 4 commonMistakes across ≥2 of the mandated
categories, and questionTemplates expanded to 6 (added errorSpotting +
reverseProblem variants to `generatePercentageAddSubtract` and
`generateDividend`). One real bug caught in `generateDividend`'s original
version along the way: distractor MCQ options were seeded from `Ali` only
with a single weak distractor — now varies names/companies and maps
distractors to `wrong_operation`/`unit_confusion`.

**Post-Round-19 fix:** shipped a broken build. Moved `audit-content-gaps.ts`
into `scripts/` but didn't update its relative import (`./lib/content/topics`
→ needed `../lib/content/topics`) or re-run `npx tsc --noEmit` after the
move — the check I ran right before was against the *old* file location,
so it didn't catch it. **Lesson: re-verify after every file move/rename,
not just after content edits — moving a file changes its relative
imports even when the content is untouched.** Also added
`"scripts"` to `tsconfig.json`'s `exclude` so future dev-only scripts
in that folder never get type-checked as part of the Next.js build
(this only surfaced now because Round 19 was the first time a script was
kept in the repo instead of being deleted after use).

**Batch 2 done:** `...061` (Aset dan Liabiliti), `...068` (Insurans dan
Takaful), `...078` (Garis Selari dan Garis Serenjang), `...083` (Nisbah).
`...083` was a genuine DSKP violation, not just weak content — verified
via web search that Y4's ratio standard (7.2.1) is unitary-only (1:n, up
to 1:1000); the shipped content taught general a:b ratios, which is
actually Y5 content (already correctly covered by `...058`). Rewrote
`write_ratio` and the topic content to teach the real Y4 standard. Also
hit and fixed a real bilingual-grading trap: word-based canonical answers
("asset"/"liability", "insurance"/"takaful") can only ever be MCQ type in
this app — a free-text "fill" blank would mark a BM-typing student wrong,
since grading.ts only lowercases/trims, it never translates BM↔EN. Every
classification generator in this codebase (likelihood, angles_classify,
asset_liability, insurance_takaful) shares this constraint — don't add
"fill" to any of them.

**Batch 3 done:** `...002` (Tambah Pecahan Penyebut Sama), `...032`
(Tambah Tiga Nombor Bulat), `...033` (Tolak Daripada Nombor Bulat). Found
a widespread pattern bug while doing these: several generators
(`whole_numbers_addition_y6`, `whole_numbers_subtraction_y6`, and
probably others not yet audited) had a `questionTemplates` entry typed
`word_problem`, correctly wired through by the runner (`{ ...config,
type }` in `lib/questions/index.ts`), but the generator itself never
branched on it — it just returned the bare equation regardless, so
"word problems" were silently just fill-in equations with no scenario.
Fixed both; **worth checking for this same bug in every remaining
generator during future batches**, not just the ones on the audit's
worst-scoring list — a topic can score fine on the audit (has the right
count of templates) while one of its `word_problem` templates is still
just cosmetic.

**Batch 4 done:** `...005` (Tambah & Tolak Perpuluhan), `...007` (Waktu
dan Masa), `...015` (Jenis-Jenis Sudut). Caught a real bug via the
mandatory smoke test on `time_duration`'s new `errorSpotting` variant:
it always demonstrated the "forgot to carry the hour" mistake regardless
of whether a carry was actually needed by the random duration — when it
wasn't, the "wrong" answer trivially equaled the correct one and the
distractor list collapsed to a single option (386/10,000 failures on
first run). Fixed by resampling the duration until a genuine carry
occurs. Lesson, again: the smoke test isn't a formality — it caught a
real bug here that `tsc` and casual review both missed, exactly like it
was designed to.

**Batch 5 done:** `...039` (Tambah & Tolak Wang). Found and fixed a real
math bug in `money_add_subtract`'s "no-carry" distractor, present since
the retrofit — not a rare edge case, a bug that fires ~50% of the time
(whenever `op === "add"`). The formula was `[floor(a/100)+floor(b/100)]
*100 + [(a%100)+(b%100)]` — this is mathematically IDENTICAL to `a+b`
always (it's just decomposing and recombining by place value; nothing
about it drops a carry), so for addition the "wrong" answer trivially
equaled the correct one on every single generation, not just some.
Fixed by making the addition mistake actually drop the overflow (`%
100` on the cents sum, no `+1` carried into ringgit) instead of silently
preserving it. **Lesson: when constructing a "classic mistake" formula
by decomposing a number into parts and recombining them, check whether
the recombination is actually mathematically distinct from the correct
answer — decomposing and reassembling via place value is a no-op, not a
mistake, unless something is deliberately dropped/altered in between.**
This also means my two immediately-preceding "fixes" for a caught
collapse (the `if (wrongAnswer === correct)` guard, then a broken
"forced pair" formula) were treating a symptom without diagnosing the
cause — worth remembering that a persistent collapse across many
generations is a sign to re-derive the formula, not just special-case
around it. Same 50,000-generation re-verification this time: 0 failures.

**Batch 6 done:** `...035` (Tambah & Tolak Perpuluhan 1dp), `...040`
(Darab & Bahagi Wang), `...041` (Faedah Mudah). No new architectural
bugs this round — `decimal_add_subtract_y4` already used the shared
`finalizeOptions` helper (dedup+pad), so it didn't have the money.ts-
style recombination flaw. Same pattern bug as prior batches did show up
again in `money_multiply_divide` (word_problem config returning the bare
equation) — fixed with real bookstore/canteen scenarios for both
multiply and divide. `simple_interest` was always "Ali" with one
context; added name/context variety plus errorSpotting and reverseProblem
(solving for the rate, still just division — no new formula). One
distractor caught and fixed before shipping: `reverseProblem`'s first
draft used `totalSen × priceSen` as a distractor, which produces a
unit-mismatched, obviously-too-large number rather than a genuine
misconception — replaced with "picked the wrong given value" distractors
instead. 14 topics retrofitted total across 6 batches.

**Batch 7 done:** `...010` (Isipadu Cecair), `...042` (Untung dan Rugi),
`...050` (Diskaun). One real bug this round, genuinely sneaky — worth
remembering the pattern:

`generateDiscount`'s errorSpotting distractor ("gave the discount amount
instead of the final price") failed on **nearly every single generation**
when `discountPct === 50` — not a rare collision, a permanent
mathematical identity: at exactly half off, the amount taken off and the
amount left over are, by definition, the same number, for *any* price.
No amount of resampling the price fixes this — only avoiding that one
percentage does. Caught because the smoke test's failure output was
overwhelmingly `discountPct: 50` once you looked at more than a couple of
examples; fixed by excluding 50% specifically from that one branch's
percent pool (the base mcq/word_problem branches keep using 50% — it's
only a problem for the "what's the classic mistake" framing, not for
the question itself). **General lesson: when a distractor formula
depends on more than one random input, check whether any single input
value creates a structural identity between "correct" and "wrong"
regardless of the others — 50% here, addition's carry in batch 5 — these
aren't edge cases, they're the whole distribution for that slice of the
input space.**

Second, smaller thing worth noting: `generateVolume` was rebuilt this
round with subtraction, context variety, and a reverse-problem variant on
top of the original addition-only version — no bug found in it this
time, but it's new enough code that it's worth an extra look in a future
pass rather than assuming it's as battle-tested as the older generators.
17 topics retrofitted total across 7 batches.

**Batch 8 done:** `...027` (Operasi Bergabung Tanpa Kurungan), `...036`
(Darab Perpuluhan), `...037` (Bahagi Perpuluhan). One real bug this
round: the new `mixed_operations` errorSpotting branch only ever
returned 2 options (`shuffleOptions(correct, [wrongAnswer])` with no
padding) — every other generator in the file pads to at least 3 via a
`while (options.length < 3)` loop, this one branch was written without
it and the smoke test caught it immediately (6 failures in the first
1000 generations). Fixed by adding the same padding loop. 20 topics
retrofitted total across 8 batches.

**Batch 9 done:** `...043` (Tambah & Tolak Masa), `...044` (Tambah & Tolak
Panjang), `...045` (Tukar Unit Panjang). This batch touched `unit_convert`,
a generator shared across many topics (length/mass/volume/time-unit
conversions all reuse it via a `pairs` config) — retrofitting it once
benefits `...046`/`...047` (kg/g, l/ml already covered by its new
`unitContext` lookup) for free when those get picked up. Two more
instances of last round's exact bug class: `time_add_subtract`'s and
`length_add_subtract`'s new errorSpotting branches both returned only 2
options (same `shuffleOptions(correct, [wrong])`-with-no-padding pattern
as `mixed_operations` in batch 8) — the smoke test caught both immediately
(6 failures each in the first 1000 generations). This is now the third
time this exact bug has shown up in a freshly-written errorSpotting
branch; **worth double-checking padding explicitly in every new
errorSpotting/reverseProblem branch going forward, not just relying on
the smoke test to catch it retroactively.** 23 topics retrofitted total
across 9 batches.

**Batch 10 done:** `...046` (Tukar Unit Jisim), `...047` (Tukar Unit
Isipadu Cecair). As predicted, pure `topics.ts` content work — both
already used `unit_convert` with `kg/g`/`l/ml` pairs, which the batch 9
retrofit of that generator already covers via `unitContext`. No generator
changes needed; smoke-tested the exact `factor: 1000` configs anyway
(kg/g and l/ml, all 5 template variants) as a sanity check rather than
assuming coverage from the broader batch 9 test — all clean, zero new
bugs. 28 topics retrofitted total across 10 batches.

**Batch 11 done:** `...048` (Tukar Unit Masa), `...049` (Tukar Unit Masa
Lanjutan) — closes out the unit-conversion cluster (`...043`–`...049`,
7 topics, batches 9–11). Decided to add real narrative context rather
than leave the time-unit pairs on the generic fallback: extended
`unit_convert`'s `unitContext`/`measurePhrase` with a new `"duration"`
kind ("berlangsung selama" / "lasts") and item nouns for `day/hr`
(flight), `wk/day` (family holiday), `hr/min` (tuition class), `yr/mth`
(rental contract) — spot-checked the actual generated sentences ("A
flight lasts 2 day. How many hr is that?") to confirm the phrasing reads
naturally before shipping, not just that it type-checked. Deliberately
left `dec/yr` and `c/dec` on the generic fallback — "a historic building
lasts 3 century" doesn't fit the same phrasing pattern as the others,
and forcing an "age" framing into the same template would've read worse
than the plain fallback sentence. No new bugs this round — the
padding-loop bug that hit 3 batches running (mixed_operations,
time_add_subtract, length_add_subtract) never applies to `unit_convert`
since its errorSpotting/reverseProblem branches always had a full 3+
option padding loop from the start. 30 topics retrofitted total across
11 batches.

**Batch 12 done:** `...052` (Peratus Suatu Kuantiti (Asas)), `...053`
(Tukar Pecahan dan Peratus), `...055` (Tukar Perpuluhan dan Peratus). Not
one shared generator this time — three separate ones (`percentage_of_quantity`,
`fractions_percentage_convert`, `decimal_percentage_convert`), each retrofitted
individually. Found another instance of the "prompt never branches on `type`"
bug (same class as an earlier round): `percentage_of_quantity`'s word_problem
config silently rendered the identical bare "Find X% of Y" prompt as mcq —
fixed with a real rotten-items-in-a-basket word_problem. Also found and fixed
a smaller correctness gap while retrofitting it: its `type` union was typed
`"mcq" | "word_problem"`, missing `"fill"`, even though a `fill` template now
exists for it in `topics.ts` — widened to match the other generators. No
options-padding bugs this round — all three generators' new errorSpotting/
reverseProblem branches were written with the padding loop from the start,
and the smoke test came back clean on the first pass for all 15 variants (3
topics × 5 templates). 33 topics retrofitted total across 12 batches.

**Batch 13 done:** `...051` (Kebarangkalian), `...074` (Nombor Perdana dan
Nombor Gubahan). Both are categorical-answer generators (likelihood
category / prime-composite-neither, not a number) — no `reverseProblem`
possible for either, same reasoning already established in
`angles_classify.ts`: added `word_problem` (sweets-jar re-skin for
likelihood, locker-numbers framing for prime/composite) and
`errorSpotting` (the single most-documented misconception for each —
"equally likely without checking counts", "1 is prime") instead. First
pass only wrote 3 `commonMistakes` each on the assumption that matched
the categorical-generator precedent — audit still scored them at 3, not
gold, because the `mistakes>=4` threshold is universal regardless of
category; confirmed by checking `...015` (angles_classify's topic) has 4
mistakes too. Added a 4th mistake to each and re-ran the audit to
confirm score 1. Also caught a missing `pick` import in
`primeComposite.ts` — `tsc` caught it immediately, fixed before the
smoke test. 35 topics retrofitted total across 13 batches.

**Batch 14 done:** `...069` (Panjang dan Jisim Bergabung), `...070`
(Panjang dan Isipadu Bergabung), `...071` (Jisim dan Isipadu Bergabung).
Wrote `combined_length_mass` in full, then mirrored the exact structure
to the other two — worked well, all three retrofits were nearly
mechanical once the first was right. Found two real **pre-existing**
bugs while retrofitting (not introduced this round, but caught because
touching the file triggered the mandatory smoke test):
1. The base generator's `word_problem` type never got `options` at
   all — the option-building block was gated `if (type === "mcq")` only,
   so every `word_problem` template for these three topics has been
   silently rendering with zero answer choices since whenever they were
   first written. This is now the **third** distinct instance of the
   "output silently doesn't branch on `type` the way `topics.ts` expects"
   bug family (earlier ones: `percentage_of_quantity`'s word_problem
   prompt in batch 12, `mixed_operations` originally). Worth explicitly
   checking this shape — a `type`-gated block that only fires for one
   type when `topics.ts` configures several — whenever retrofitting an
   old, not-yet-audited generator, not just the ones already flagged by
   the audit script.
2. All three errorSpotting branches were missing the options-padding
   loop (the by-now-familiar bug from batches 8–9) — fixed the same way.
   Widened the base options guard to `type === "mcq" || type ===
   "word_problem"` and added the padding loop to all three errorSpotting
   branches; smoke test came back clean after the fix (15/15 variants).
38 topics retrofitted total across 14 batches.

**Batch 15 done:** `...057` (Bahagi Nombor Bercampur Dengan Nombor Bulat),
`...062` (Bahagi Pecahan Dengan Pecahan), `...063` (Bahagi Nombor
Bercampur Dengan Pecahan) — the fraction-division family (three separate
generators across two files, `fractionsDivide.ts` and
`fractionsDivideMixed.ts`, not shared code, but structurally similar
enough that the same word_problem/errorSpotting/reverseProblem shape
worked for all three). Word problems: flour-bag sharing for
mixed÷whole, paint-jar "how many bottles fit" for fraction÷fraction,
ribbon-cutting for mixed÷fraction — all genuine real-world framings of
what fraction division actually means, not generic restatements.
reverseProblem for each multiplies back to find the original total
given the per-unit result — same "reverse of the base division" shape
used in batch 14. No bugs this round — all three generators were written
fresh with the padding loop and the `type === "mcq" || type ===
"word_problem"` options guard from the start, informed directly by the
two bugs found last round. 41 topics retrofitted total across 15
batches.

**Batch 16 done:** `...065` (Jarak Antara Dua Koordinat), `...082`
(Membaca Koordinat) — the coordinates pair. `...065` (`coordinate_distance`)
is numeric so got a full reverseProblem (given point A, the shared axis,
and the distance, find point B — constrained so B is further from the
origin, keeping the answer unambiguous). `...082` (`coordinates`) reads a
single point off a diagram — deliberately skipped reverseProblem there,
documented in the generator's own comment: this app's MCQ/text-option
architecture has no way to offer several diagram images as answer
choices, so there's no clean numeric "reverse" the way there is for
`coordinate_distance`, same reasoning as `angles_classify.ts`. Read the
"Round 17" note first as planned — confirmed `...082`'s Y4 distinctness
constraint (grid-reading only, no ratio/proportion content) wasn't
touched by this retrofit. No new bugs this round — both generators
written with the padding loop and widened `type` guard from the start;
065's 5 variants and 082's 4 variants (no reverseProblem there) all came
back clean on the first smoke test pass. 43 topics retrofitted total
across 16 batches. **Investigated the score-11 anomaly noticed above:**
it's `...066` (Mod, Julat, Median, dan Min, Y5 statistics) — tips=3,
mistakes=1, templates=2, so it got a partial pass at some point (same
shape as `...051`/`...074` in batch 13) but was never finished. Wasn't
on the "remaining baseline" radar because its score (11) sits just
above the score-14 baseline tier this round's search was focused on —
worth occasionally checking for partial-pass stragglers like this, not
just the literal baseline score.

**Batch 17 done:** `...058` (Perkadaran Untuk Cari Nilai), `...066` (Mod,
Julat, Median, dan Min), `...084` (Kadaran) — folded the score-11
straggler in as planned. Two more pre-existing instances of the
"`word_problem` template configured in `topics.ts` but the generator
never actually gives it options" bug (now the family's most common
recurring issue by count): `proportion.ts` gated options `if (type ===
"mcq")` only, same as `combinedMeasurement.ts` in batch 14; and
`unitaryProportion.ts` was worse — it ignored `params` entirely and
hard-coded `type: "mcq"` on every return, so its `word_problem` template
had *always* rendered as mcq-typed output regardless of what
`topics.ts` asked for. Both fixed. Kept `...084`'s unitary-method
framing (price-per-item, never revealing a bare ratio) fully intact
through every new variant, including a reverseProblem that stays in that
same framing (given the group price and a total spent, find how many
items were bought — still requires finding the one-item price first,
just applied via division instead of the base's multiplication) rather
than reaching for a generic ratio-style reverse that would have blurred
the deliberate Y4/Y5 distinction documented in the "Round 17" note
below. `...066`'s reverseProblem is a genuine "find the missing value
given the mean" question — a real, common exam format, not an arbitrary
inversion. 46 topics retrofitted total across 17 batches — the score-14
baseline tier is down to 5 topics, all confirmed one-offs with no shared
generators.

## Bug fix (post-batch-23): Pintar chat fractions rendered as flat text, and a note on "sentence style" replies

Lynda reported that Pintar's replies don't show fractions/math notation
the way a teacher writes them, and that responses come back as one
flowing sentence with no line breaks or step-by-step structure.

**Fraction rendering (fixed on the Congak side):** `PintarChat.tsx`
renders Pintar's replies through a small custom `PintarMarkdown`
component wrapping `react-markdown`. That component had never been
wired into `lib/ui/mathText.tsx`'s `renderMathText` — the same stacked
numerator/bar/denominator renderer used everywhere else in the app
(lessons, questions, worked examples). So a fraction like "2/5" in a
Pintar reply rendered as flat inline text via plain markdown, while the
exact same "2/5" elsewhere in the app renders stacked like a textbook.
Fixed by applying `renderMathText` to the `p`/`strong`/`li` children in
`PintarMarkdown`'s component overrides — only string children are
re-typeset, so bolded fractions (rare) pass through unstacked, which is
an acceptable gap for now. `tsc --noEmit` clean after the change.

**"Sentence style" / no step breakdown (NOT fixed — needs the engine
side):** `PintarMarkdown` already fully supports `**bold**`, line
breaks between paragraphs, and both numbered (`1. `) and bulleted (`- `)
lists with proper spacing (`mb-2`, `space-y-0.5` etc.) — this was
verified by reading the component, not assumed. If the engine's replies
actually contained that markdown structure, it would render with clear
steps and spacing already. The fact that replies come back as one
undifferentiated sentence strongly suggests the *engine itself* isn't
formatting its output with markdown structure (numbered steps, blank
lines between paragraphs) — that's server-side behavior on the Basrim
engine, not something fixable from the Congak repo. Told Lynda this
split plainly rather than guessing at a Congak-side fix for a
problem that's actually upstream; her husband's Claude instance would
need to adjust the engine's system prompt/output format to produce
structured markdown (e.g. explicitly instructing it to use numbered
steps and blank lines between them) for this to change.

## Bug fix (post-batch-18): worked-example "problem" statement ignored language setting

Lynda reported (with a screenshot) that on the Belajar (Learn) tab's
"Example" section, the problem statement stayed in Malay even with the
student's language set to English, while the steps below it correctly
switched to English. Root cause: `workedExample.problem` (and
`moreExamples[].problem`) were typed as plain `string` in
`TopicContent`, not `Bilingual` — every one of the 85 topics had its
problem statement authored in Malay only, since that's the language
used when writing content, and `ExampleCard` in `LessonCard.tsx`
rendered it directly via `renderMathText(example.problem)` with no
`lang`-awareness at all, unlike every other field on that screen (all
of which go through `<Bi text={...} lang={lang} />`). This affected
every topic that has a worked example, i.e. all 85 — not a scope issue
specific to Simple Interest, that screenshot just happened to be the
one Lynda tested.

Fix: changed `problem` to `Bilingual` in the `TopicContent` interface
(both `workedExample` and `moreExamples`), updated `ExampleCard` to
render it through `<Bi text={example.problem} lang={lang} />`, and
bulk-converted all 86 `problem:` fields across `topics.ts` (85 topics ×
1 `workedExample` each, plus 1 topic with a `moreExamples` entry) from
plain strings to `{ ms, en }` pairs. Did this as one script pass keyed
on exact match position (not string search-and-replace) to avoid any
collision between duplicate problem strings across different topics —
verified the replacement count matched the scan count (86) before and
after. 37 of the 86 are pure math/symbolic ("32450 + 18600", "3/8 +
2/8") where `ms` and `en` are identical by design (nothing to
translate, not a residual bug — same non-issue confirmed during the
copyright/translation-quality check earlier in this round); the other
49 contain real Malay sentences and got proper English translations
(e.g. "RM500 pada 4% setahun selama 2 tahun" → "RM500 at 4% per year
for 2 years" — the exact one from the screenshot). `example.answer`
was deliberately left as plain `string | number`, not `Bilingual` — it's
either a bare number or a short unit-suffixed string (`"26 cm"`,
`"RM53.00"`) where the unit abbreviations are identical in both
languages, so there's nothing to actually translate there. `tsc
--noEmit` clean across the whole file after the change; re-ran the
audit script too (unaffected, as expected — this is a rendering/schema
fix, not a content-completeness change, so the score distribution
`{ '1': 51, '12': 34 }` is unchanged).

**Also worth knowing:** while investigating, checked whether Pintar
(the AI chat tutor) respects language preference — found that when a
student's `language_pref` is `"both"` (the default), Pintar's live AI
responses come back Malay-only because `toEngineLanguage()` in
`PintarChat.tsx` collapses `"both"` down to `"bm"` before calling the
AI, while the rest of the UI in `"both"` mode shows Malay-with-English-
underneath everywhere else. Did NOT fix this — flagging it here since
it's the opposite-direction version of the same class of bug (bilingual
inconsistency), but Pintar's actual response-generation logic lives on
the Basrim server, outside this repo, so only the `toEngineLanguage()`
call site here could be touched, and it wasn't clear that was the
actually wrong side of the inconsistency without checking what the
Basrim server expects. Worth a deliberate decision (not a quick fix)
on whether `"both"` should mean "AI replies in both languages" or "AI
replies in Malay, rest of UI shows both" before touching it.

**Batch 18 done — closes the original baseline tier entirely:**
`...059` (Invois, Resit, dan Cukai Perkhidmatan), `...064` (Tambah &
Tolak Masa Unit Lebih Besar), `...067` (Beli Secara Tunai atau Ansuran),
`...075` (Sudut Pedalaman Poligon Sekata), `...079` (Isi Padu Kuboid) —
5 topics, 5 separate generators, no shared code, done as one batch since
each was small and the pattern is now fully mechanical. Two more
instances of the "`word_problem` template configured but the generator
never gives it options" bug (`service_tax`, `credit_vs_cash` — same
`if (type === "mcq")`-only gating as every prior instance), and
`time_unit_add_subtract` had BOTH recurring bugs at once — bare-equation
prompt AND missing options — fixed with a real building-age word_problem
plus the options guard. Every generator got a genuine reverseProblem:
service_tax and credit_vs_cash divide back through the tax/instalment
math; time_unit_add_subtract mirrors time_add_subtract's "find one
duration given the total and the other"; regular_polygon_angles goes
sides→angle in reverse (given one interior angle, find how many sides);
volume_cuboid divides the volume back through two known dimensions to
find the third. All 25 variants (5 topics × 5 templates) came back clean
on the first smoke test pass. **51 topics retrofitted total across 18
batches — every topic at or below the original baseline score (14) is
now cleared.**

**Phase transition:** the audit's score distribution is now a clean
`{ '1': 51, '12': 34 }` — no more stragglers or partial passes hiding
between tiers (unlike the `...066` surprise before batch 17). The
remaining 34 all sit at exactly tips=2, mistakes=2, templates=2 — a more
uniform, lighter-weight starting point than the batches 1-18 baseline
(which started at tips=2, mistakes=1, templates=2). Expect these to go
faster per-topic on average: one more tip and two more mistakes needed
per topic (vs. the original one more tip and three more mistakes), and
still 3 more templates each (word_problem, errorSpotting, reverseProblem
— same shape as every batch so far). Spot-checked the first 20 in the
audit output — spans nearly every strand (Tambah/Tolak, Peratus, Nisbah,
Luas, Sudut, Graf, Koordinat) with no obvious generator-sharing cluster
in that sample; worth checking `generatorKey`s per-topic same as recent
batches rather than assuming.

**Batch 19 done — first batch of the score-12 tier:** `...001` (Tambah
Dalam Lingkungan 100 000), `...004` (Perimeter Bentuk Mudah), `...020`
(Tolak Nombor Bulat Hingga 100000). All three already had a
`workedExample` with detailed step-by-step carry/borrow arithmetic and
2 tips — just needed a 3rd tip, 2 more `commonMistakes`, and 3 more
templates (word_problem/errorSpotting/reverseProblem) each, confirming
this tier really is lighter-weight than the original baseline. Found a
genuine new bug while retrofitting `perimeter.ts`: all three of its
distractor-padding loops (`errorSpotting`, `word_problem`, and the base
`mcq` branch) pushed a random candidate straight onto `options` with no
`!includes()` duplicate check — the one padding-loop shape that had
survived every prior round unnoticed because this specific generator
hadn't been touched since the original build. The smoke test caught it
immediately (6 duplicate-option failures in the errorSpotting variant on
the first 1000-iteration run) — fixed all three occurrences in the same
file, not just the new one, since the same broken pattern was already
sitting in the two branches I hadn't touched. 54 topics retrofitted
total across 19 batches.

**Batch 20 done:** `...006` (Peratus Asas), `...011` (Luas Segi Empat
Tepat & Segi Empat Sama), `...016` (Luas Segi Tiga). `...006` was pure
content work as predicted — `percentage_of_quantity` already had full
word_problem/errorSpotting/reverseProblem support from batch 12, so this
one only needed a 3rd tip, 2 more mistakes, and 3 more templates in
`topics.ts`, no generator changes. `...011` needed the full generator
retrofit. `...016` had the by-now-familiar bug pattern: `word_problem`
was declared in the type union but the prompt never branched on it AND
options were gated `if (type === "mcq")` only — so any word_problem
template configured for this topic had been rendering with zero
scenario and zero options. Fixed with a real cloth-cutting word_problem
(matches the topic's own explanation text) plus the options guard.
57 topics retrofitted total across 20 batches. **Noticed while
auditing:** `...024` is ALSO titled "Membaca Koordinat" (Y5) — a
separate topic from `...082`'s "Membaca Koordinat" (Y4) that was
retrofitted in batch 16. Worth checking `...024`'s `generatorKey` next
time; if it's the same `coordinates` generator, that's another likely
pure-content-work topic like `...006` turned out to be.

**Batch 21 done:** `...024` (Membaca Koordinat, Y5), `...012` (Sudut
Pada Garis Lurus), `...014` (Jumlah Sudut Dalam Segi Tiga). `...024`
confirmed as a duplicate-title, pure-content-work topic exactly as
predicted — same `coordinates` generator as `...082` (batch 16), just a
4-template categorical shape (no reverseProblem, same as `...082`), used
a park-map word_problem framing distinct from `...082`'s treasure-map to
avoid the two topics feeling identical to a student who's done both.
`...014` had the by-now-standard bug: `word_problem` declared in the
type union but never wired to a real prompt or options. Both angle
generators got genuinely different reverseProblems rather than the same
subtraction relabelled: `...012` gives the *difference* between the two
angles (not either angle) and asks for the smaller one — a small
simultaneous-equation step, appropriately harder than the base skill;
`...014` gives the third angle plus one of the other two and asks for
the missing one — same computation, different unknown, consistent with
how other reverseProblems in this project reframe which value isn't
given rather than inventing an unrelated harder skill. 60 topics
retrofitted total across 21 batches.

**Batch 22 done — closes the angle cluster and the circle cluster:**
`...017` (Sudut Pada Satu Titik), `...018` (Lilitan Bulatan), `...019`
(Luas Bulatan). All three distinct generators, no sharing. `...017`
mirrors `...014`'s reverseProblem shape (given the third angle plus one
of the other two, find the missing one). `...018`/`...019` are a
genuine matched pair — same `PI = 3.142` constant, same "confused with
the other circle formula" classic mistake in both directions
(circumference↔area), and their reverseProblems are deliberately built
from a known integer radius rather than computed via runtime division/
square-root, so the "correct" answer is always exact instead of
depending on rounding — `...019`'s reverse in particular would need a
square root at runtime otherwise (area → radius), which risks an ugly
non-terminating decimal; sidestepping that by generating the radius
first and presenting the area second keeps the answer clean while still
being a genuine "find the radius" question from the student's
perspective. 63 topics retrofitted total across 22 batches.

**Batch 23 done:** `...030` (Tambah Nombor Bulat Hingga 1,000,000),
`...031` (Tolak Nombor Bulat Hingga 1,000,000), `...028` (Darab Dengan
Nombor 1 Digit). Confirmed `...030`/`...031` are genuinely SEPARATE
generator files (`wholeNumbersAdditionY5.ts`/`wholeNumbersSubtractionY5.ts`),
not the same functions as batch 19's `...001`/`...020` reused with a
different config — mirrored the same retrofit shape (word_problem,
errorSpotting, reverseProblem) but used a warehouse-inventory scenario
scaled up from the Y4 versions' bookshop/egg-shop framing, so the two
year levels don't feel like copy-pasted duplicates to a student who's
done both. Also confirmed the whole multiplication/division cluster
(`...021`/`...022`/`...025`/`...026`/`...028`/`...029`) is six
genuinely separate generator files despite the similar naming — no
shared code there either. 66 topics retrofitted total across 23
batches — only 19 remain, all confirmed one-offs (score distribution
is now purely `{ '1': 66, '12': 19 }`, no more hidden clusters left to
discover in this tier).

**Batch 24 done:** `...003` (Kira Baki Wang — Money Change, Y4), `...008`
(Purata/Average, Y5), `...009` (Nisbah Mudah/Simple Ratio, Y6) — three
unrelated one-off topics, no shared generators between them, each
retrofitted independently. `money.ts`'s `generateMoneyChange` gained
`errorSpotting` (classic RM1 borrow-slip mistake) and `reverseProblem`
(given price + change, find the amount paid) branches, plus real `fill`
type support (previously only mcq/word_problem existed). `average.ts`'s
`generateAverage` gained real Malaysian word-problem contexts (test
scores, goals, pocket money — previously bare "find the average of X, Y,
Z" for every type) plus `errorSpotting`/`reverseProblem` (find a missing
value given the average and the rest of the set). `ratio.ts`'s
`generateSimplifyRatio` gained `errorSpotting` (partial simplification —
divided by 2 but not the full GCD) and `reverseProblem`, the latter a
genuine "share a total in a ratio" word problem (e.g. boys:girls given a
class total) rather than a re-skinned simplification question — this is
the first ratio topic where the reverse direction actually differs in
kind from the base question, not just in framing.

**`classify.ts` note for this batch:** all three retrofitted cases now
branch on `question.correctAnswer` (via `.includes(":")` for
simplify_ratio, or a direct value comparison for money_change/average)
rather than assuming the original single-answer shape, since
`reverseProblem` questions ask for a genuinely different quantity
(amount paid / missing value / one ratio part) than the base question
(change / average / simplified ratio) but share the same `context`
object shape. Two new mistakeTypes added: `ratio_scaling_error` +
`ratio_part_swapped` for ratio's reverseProblem, `forgot_subtract_known_values`
for average's reverseProblem, `wrong_operation` reused (already existed
elsewhere) for money_change's reverseProblem.

69 topics retrofitted total across 24 batches — 16 remain, all confirmed
one-offs (score distribution now `{ '1': 69, '12': 16 }`).

**Batch 25 done — closes out the multiplication/division family
entirely:** `...021` (Darab Dengan Nombor 2 Digit, Y5), `...022`
(Bahagi Dengan Nombor 2 Digit, Y6), `...025` (Bahagi Dengan Nombor 1
Digit, Y5), `...026` (Darab Nombor 4 Digit Dengan Nombor 2 Digit, Y6),
`...029` (Bahagi Dengan Nombor 1 Digit, Y4) — five separate generators
(`wholeNumbersMultiplication`, `wholeNumbersMultiplicationY6`,
`wholeNumbersDivision`, `wholeNumbersDivisionY5`,
`wholeNumbersDivisionY4`), confirmed structurally near-identical before
starting, retrofitted in one pass using the same shape across all five:
a real word_problem context (factory-production for the two
multiplication generators, equal-sharing for the three division ones —
each with its own distinct name pool + item pool per topic so they
don't feel copy-pasted, e.g. Y4 division uses biskut/stiker/belon while
Y5 division uses gula-gula/pensel warna/guli), `errorSpotting` (forgot-
shift for multiplication, subtracted-instead-of-divided for division),
and a `reverseProblem` that's the genuine inverse operation rather than
a re-skin: multiplication's reverse divides back through the total to
find the daily rate; division's reverse finds the divisor itself (the
"how many groups" framing) given the dividend and quotient.

**`classify.ts` note for this batch:** all five cases now open with a
guard comparing `Number(question.correctAnswer)` against the base-case
`correct` context field — if they differ (meaning this is a
reverseProblem question asking for a different quantity), it skips the
distractor-formula checks and returns a generic `calculation_error`
with a hint naming which operation the reverse question actually needs,
rather than risking a false match against a distractor formula that
was never computed for that question. Same pattern as batch 24. One new
mistakeType added to all five topics: `multiplied_instead_of_divided`,
describing the reverseProblem-specific error of multiplying back
through the total instead of dividing.

**Audit note:** the scorer needs `mistakes >= 4` to reach score 1 (gold)
— `mistakes >= 3` still leaves 2 points on the table (`Math.max(0, 4 -
mistakes) * 2`). Don't stop at 3 commonMistakes per topic; always check
the score, not just that it dropped.

74 topics retrofitted total across 25 batches — 11 remain, all confirmed
one-offs (score distribution now `{ '1': 74, '12': 11 }`).

**Batch 26 done — the "composite shapes" three-way cluster confirmed
and closed out:** `...013` (Luas Bentuk Gubahan — Area, Y5), `...080`
(Isi Padu Bentuk Gubahan — Volume, Y5), `...081` (Perimeter Bentuk
Gubahan, Y5) — three separate generators (`areaComposite`,
`volumeComposite`, `perimeterComposite`) as suspected, no sharing, but
genuinely worth doing together since they're the same "split into
parts, combine" shape at 2D/3D/perimeter respectively. Each gained a
real word-problem framing (garden plot for area, storage tank for
volume, perimeter kept its existing garden framing), `errorSpotting`
(forgot-the-second-part for area/volume, notch-reduces-perimeter for
perimeter — reusing the mistake that was already `classify.ts`'s
primary check for each), and a `reverseProblem` that solves for a
missing dimension given the total (area/volume) or a missing bounding-
rectangle side (perimeter) — genuinely different arithmetic direction
in each case, not just a re-skinned prompt.

`classify.ts` note: same guard pattern as batches 24-25 — each case now
opens by comparing `Number(question.correctAnswer)` against the
base-case `correct` context field, falling back to a generic
`calculation_error` with an operation-specific hint when they differ
(i.e. a reverseProblem question). Remembered the batch-25 gotcha this
time and added 4 commonMistakes to each topic from the start, not 2.

77 topics retrofitted total across 26 batches — **8 remain**, all
confirmed one-offs (score distribution now `{ '1': 77, '12': 8 }`).

**Batch 27 done — PROJECT COMPLETE. All 85 topics now at gold
standard.** The final 8: `...023` (bar graphs, Y5), `...034` (subtract
same-denom fractions, Y4), `...038` (divide fraction by whole, Y6),
`...054` (multiply fractions, Y5), `...072` (pie charts, Y6), `...073`
(time zones, Y6), `...076` (compound interest, Y5), `...077`
(pictographs, Y4) — 8 separate generators, confirmed no sharing.

Two things worth flagging for whoever reads this next:

1. **The diagram/categorical topics (`bar_graph`, `pie_chart`,
   `pictograph`) DID support reverseProblem naturally** — the earlier
   worry in this file turned out unfounded. Each had a genuine reverse
   direction: bar_graph finds a missing bar given the total and the
   other three; pie_chart finds the total surveyed given one sector's
   actual count and its fraction (dividing back through the
   multiplication); pictograph finds how many icons to draw given an
   actual total and the key (also dividing back). All three already had
   a `variant` field in their context (`"total"`/`"difference"` for
   bar_graph, `"count"`/`"difference"` for the other two) from their
   original implementation, so the reverseProblem branch just added a
   third variant value (`"reverse"`) — `classify.ts` guards on that
   directly instead of comparing `correctAnswer` against a `correct`
   field like the numeric topics do. Same idea, cheaper check.

2. **`fractionsSubtract.ts` had a real bug**, not just a missing
   feature: its mcq branch built distractors but never had the
   uniqueness-guaranteed fallback loop every other generator has, so it
   could silently return fewer than 3 options for unlucky
   numerator/denominator combinations. Fixed as part of this retrofit.
   Worth a quick audit of any pre-Round-19 generator not yet touched by
   this project for the same gap — this project is now complete, but if
   new sub-topics get added later using an old generator as a template,
   check it has the fallback loop before copying its shape.

`classify.ts` note: fraction/money/time/graph cases all follow the same
guard pattern established across batches 24-27 — check whether
`question.correctAnswer` matches the base-case shape (either by direct
comparison to a `correct` context field, or a format check like
`.startsWith("GMT")` for time_zones, or a `variant === "reverse"` check
for the three diagram topics) before running the base-case distractor
checks, falling back to a generic `calculation_error` with an
operation-specific hint otherwise.

**85/85 topics retrofitted — 0 remain.** Final audit: `Score
distribution: { '1': 85 }`. Every topic has ≥3 tips (including one
explicit "DON'T do this" worked counter-example), ≥4 commonMistakes,
and ≥4 questionTemplates spanning mcq/fill/word_problem/errorSpotting/
reverseProblem (or the diagram-topic equivalent). `npx tsc --noEmit`
clean throughout. No DB/UI schema changes were needed for any of this
across all 27 batches — `challengeExample` from the original brief was
folded into `questionTemplates`' `reverseProblem`/`errorSpotting`
configs instead of a new object field, since that's how `...085` (the
original hand-written gold-standard reference topic) already worked and
needed no type changes to extend to the other 84.

**If new topics get added to the curriculum in future**, use any topic
from this file as the template — the shape is now consistent
end-to-end: generator (base case + errorSpotting + reverseProblem, each
type branch with a uniqueness-guaranteed options fallback) →
`classify.ts` case (with a reverseProblem/variant guard before the
base-case distractor checks) → content (`explanation`, 3 `tips`
including one DON'T example, 4 `howTo` steps ending in a self-check,
`workedExample`, 4 `commonMistakes`, 5 `questionTemplates`). Run
`scripts/audit-content-gaps.ts` after any addition to confirm it scores
1, and smoke-test all 5 generator branches at ~1000x before shipping —
that's what caught the missing-options-fallback bug in
`fractionsSubtract.ts` above, and it'll catch the next one too.
**Round 17 (ids `...082`-`...084`) — Lynda asked directly whether Year 4
Coordinates/Ratio/Proportion were covered. They weren't, at all** — only
Y5/Y6 versions existed, despite the real Y4 textbook explicitly listing
this as Topic 7 back in round 14's scoping pass. That gap slipped through
because round 14 only cross-checked Space and Data Handling for Y4, not
Coordinates/Ratio/Proportion specifically — a good reminder that
"scoped this year's ToC" doesn't mean "cross-checked every strand," and
it's worth taking Lynda's specific questions seriously even after a year
was marked as scoped. Added all three, each deliberately distinct from
its later-year sibling so the progression makes sense:
- **Reading Coordinates** (`coordinates` generator, reused with a smaller
  `gridSize: 6` config — no new generator code needed) — Y5's version
  uses a bigger default grid.
- **Ratio** (new `write_ratio` generator) — write a ratio from a
  real scenario (e.g. "6 apples and 3 oranges — write the ratio"),
  distinct from Y6's "Simple Ratio" (simplifying to simplest form).
- **Proportion** (new `unitary_proportion` generator) — the unitary
  method: price-per-item scaling ("2 pencils cost RM4, how much do 5
  cost?"), distinct from Y5's ratio-based proportion.

**Same round, a big visual pass** (Lynda: "the cosmetics doesn't look
quite soothing for kids yet. Placement of the new character needs to be
big, icons need to look attractive and engaging"):
- **`learn/[topicId]/page.tsx` had been completely missed** in every
  earlier visual round — no header treatment, no mascot, and its Quiz
  button was still blue (`bg-biru`) instead of purple. Fixed all three
  (header blob + mascot, `bg-ungu` Quiz button).
- **Mascot made substantially bigger** across Dashboard (24→36 units),
  Learn index (20→32), Learn per-topic (28→32), Practice index (20→32),
  and Quests hero (24→32) — repositioned as a real focal presence, not a
  small corner decoration.
- **Icons switched from pale flat tints (`bg-{color}/22`) to vivid solid
  gradient fills (`bg-gradient-to-br from-{color} to-{color}-dark`) with
  white icons** — both `strandStyle.ts` (topic list icon squares) and
  every icon badge on the Dashboard (Target/Trophy/AlertTriangle/Lock/
  Timer). Reads much more toy-like/saturated than the previous pastel
  tint approach. `BottomNav`'s active-tab backdrop got the same
  treatment.
- **Background softened**: `body` went from a flat `bg-paper` fill to a
  gentle warm vertical gradient (cream → soft peach, `background-
  attachment: fixed`) in `globals.css` — direct response to "not
  soothing enough."
- **Housekeeping while touching every header's decorative blob div**:
  none of them had the existing `decorative` class that the
  low-distraction accessibility toggle depends on to hide non-essential
  visual elements — added it everywhere so that toggle actually works
  against the new decorative elements instead of silently missing them.
- Quiz's math symbol bar — Lynda asked again, but this was already done
  in an earlier round (confirmed still present, no changes needed).

**Round 16 (ids `...079`-`...081`):** Closed the last two open items from
round 12-15's scoping.

Checked first: Y5's "distance from the origin" coordinate sub-skill —
turned out NOT to be a real gap. The existing `coordinate_distance`
generator (Y6) already produces origin-based cases naturally, since one
of its two randomised coordinates can land on 0 — Y5's version is just a
simpler stepping-stone toward the same general skill Y6 already covers.
No new topic needed.

Then built the composite-shapes trio, which needed a real prerequisite
first:
- **Volume of a Cuboid** (`volume_cuboid`, Y4 Space, real ToC p.209) —
  Congak had NO solid-volume concept at all before this (only liquid
  volume in ml/L). Basic l × w × h.
- **Volume of Composite Shapes** (`volume_composite`, Y5 Space, real ToC
  p.217-224) — two cuboids combined, same "split it, calculate each
  part, add" pattern as the existing `area_composite`.
- **Perimeter of Composite Shapes** (`perimeter_composite`, Y5 Space,
  real ToC p.217) — uses the L-shape bounding-box invariant: cutting a
  rectangular notch out of a corner doesn't change the perimeter (the
  removed outer length reappears as an equal inner length). The notch
  dimensions are given so the shape reads as genuinely composite, but
  they're a deliberate red herring — the real skill is realizing they
  don't matter. Verified this invariant holds with a smoke test before
  shipping (2000 iterations, always checked against the direct formula).

None of these three needed a new diagram — text-only, matching
`area_composite`'s existing precedent.

**This closes every gap that was confirmed open as of round 15.** No
newly-discovered gaps this round. Same caveat as always: this was
targeted spot-checking against ToC lines that looked unfamiliar, not a
mechanical leaf-by-leaf diff of all three books against all 81 topics —
don't claim 100% coverage to Lynda without that caveat. If continuing
this thread, the next step would be that exhaustive diff rather than
another round of spot-checks, since the "obvious" gaps have now all been
found and closed.

**Round 15 (id `...078`):** Shipped Parallel Lines and Perpendicular
Lines (`line_pair_classify`, Y4 Space, real ToC p.201) — the one Y4 gap
flagged at the end of round 14. Added `LinePairDiagram.tsx` (parallel:
offset lines with arrow-tick marks; perpendicular: crossing lines with a
right-angle square marker, same convention as `AngleDiagram`; neither:
crossing at a random other angle), the EIGHTH diagram kind. Word-based
answer via the existing `optionLabels` convention (parallel/
perpendicular/neither), same pattern as `likelihood`/`prime_composite`.

**Remaining known open items** (none newly discovered this round — see
round 14's entry below for how these were found): Perimeter/Volume of
Composite Shapes (Y5 — Volume needs a cuboid-volume prerequisite that
doesn't exist yet), Y5's standalone simpler Prime Numbers (lower
priority), Y5's origin-distance coordinate sub-skill (not yet checked
against the existing coordinates topic). Same caveat as before: these
were found via targeted spot-checks against ToC lines that looked
unfamiliar, not an exhaustive leaf-by-leaf audit — don't quote a
percentage-complete to Lynda without that caveat.

**Round 14 (id `...077`):** Closed the one blind spot flagged at the end
of round 12-13 — Year 4's ToC topics 5-8 are now decoded and scoped
(same `pdfplumber` CID-offset method). **All three years' full ToCs are
now confirmed scoped against Congak's topic list — not just spot-checked.**
Found two real Y4 gaps: Parallel/Perpendicular Lines (Space) and
Pictographs (Data Handling). Shipped Pictographs (`pictograph`) — added
`PictographDiagram.tsx` (icon rows + a key caption), the SEVENTH diagram
kind. Deliberately distinct from `bar_graph`: the real skill being tested
is applying the key (each icon = N units), so the actual unit count is
never shown directly, only icon counts + the key — get the key wrong and
every answer is wrong, which is exactly the point.

**Parallel/Perpendicular Lines (Y4 Space) was a confirmed real gap here —
shipped in round 15 (id `...078`), see above.**

**Honest state of "how much more until complete":** all three years are
now ToC-scoped, so there's no more blind spots at the topic-heading
level. What's NOT done is an exhaustive leaf-by-leaf diff of literally
every sub-bullet against all 77 Congak topics — gaps have been found by
targeted `grep` checks against specific ToC lines that looked
unfamiliar, not a mechanical line-for-line audit. Don't quote a
percentage to Lynda without caveating that. Known open items so far:
Parallel/Perpendicular Lines (Y4), Perimeter/Volume of Composite Shapes
(Y5 — Volume needs a cuboid-volume prerequisite that doesn't exist yet),
Y5's standalone simpler Prime Numbers, Y5's origin-distance coordinate
sub-skill (not yet checked against the existing coordinates topic).

**Rounds 12-13 (ids `...074`-`...076`) — first rounds with `Math.zip`
(the real KSSR textbooks) actually available.** Extracted the real ToC
for all three years. Y4 and Y5's ToC pages use an obfuscated custom font
that garbles plain `pdftotext` output — solved by reading raw `(cid:N)`
tokens via `pdfplumber` and solving a small linear offset per document
(uppercase/digits use one offset, lowercase another; ranges don't overlap
so decoding is unambiguous once solved). Y6's ToC happened to extract
cleanly with no decoding needed. If a future round needs to re-derive
this: open the PDF with `pdfplumber`, call `page.extract_text()` on the
ToC page, and solve the offset from a known word like "PREFACE" (always
the first ToC entry) — full method is in the round 12 chat transcript.
Note: some headings render with each letter doubled/quadrupled in the
raw CID text (e.g. "NNUUMMBBEERRSS") — that's the source PDF drawing
bold/stylized headers as overlapping glyph repeats, not a decode bug.

**Verified against the real book — already correct, no changes needed:**
Y6 combined measurement (length+mass, length+volume, mass+volume), Y6
time zones, Y6 pie charts, Y6 likelihood, division of fractions, Y5
simple interest, Y5 mode/range/median/mean, Y5 area of composite shapes.

**Shipped this round:**
- Prime Numbers and Composite Numbers (`prime_composite`, Y6 Numbers,
  real ToC p.42)
- Interior Angles of Regular Polygons (`regular_polygon_angles`, Y6
  Space, real ToC p.168-177) — Regular Heptagon deliberately excluded,
  its interior angle (900/7 ≈ 128.57°) isn't a clean quiz answer and the
  real book covers it as a hands-on measuring exercise anyway
- Compound Interest (`compound_interest`, Y5 Money) — the real ToC lists
  it as "Simple Interest and Compound Interest" together; Simple was
  already covered, this was the missing sibling. Computed year-by-year
  on the running total (matching how the real primary curriculum
  presents it), not the closed-form exponential formula.

**Confirmed real gaps found but NOT yet built:**
- Perimeter of Composite Shapes and Volume of Composite Shapes (Y5
  Space, real ToC p.217-224) — Area of Composite Shapes is covered,
  these two siblings aren't. **Volume of Composite Shapes needs a
  prerequisite that doesn't exist yet: Congak has NO basic solid-cuboid
  volume topic at all (only liquid volume in ml/L).** Scope basic cuboid
  volume (l × w × h) first, then composite. Perimeter of an orthogonal
  composite (L-shape) shape has a neat property worth using: if the
  shape is a bounding rectangle with a rectangular notch removed, the
  perimeter always equals 2×(overall length + overall width) regardless
  of notch size — but the real book's exercises may instead label every
  edge directly, which would need a proper diagram (composite shapes
  don't have one yet either). Scope the exact real-book exercise format
  before building.
- Y5 also has its own simpler "Prime Numbers" (no composite pairing) —
  lower priority since Y6's version already covers the underlying
  concept.
- Y5 Coordinates also covers "Horizontal Distance and Vertical Distance
  from the Origin" and "...Between Two Coordinates" as separate named
  sub-skills from general distance-between-coordinates — not yet checked
  whether Congak's existing coordinates topic already covers this
  distinction or would need a variant.

**The round before that (id `...073`):** Time Zones (`time_zones`, Y6 Measurement)
— this was flagged several rounds back as the one remaining Y6 Time
sub-topic once "combined measurement" was done. **Important caveat: this
round did NOT have `Math.zip` (the real KSSR textbooks) available in its
session** — only the scaffold zip was uploaded this time, not the source
PDFs. Built this topic from general, well-documented KSSR-level knowledge
of GMT time-zone problems (non-DST cities with fixed offsets — Kuala
Lumpur, Tokyo, Dubai, Moscow, Cairo, Karachi — so the offsets are always
correct) rather than the exact textbook wording. It should be pedagogically
sound, but if Lynda wants exact-textbook fidelity checked, re-upload
`Math.zip` next round and cross-check this topic (and the ones below)
against it.

**Also discovered this round: the "still not scoped in detail" section
further down this file is stale** — it still lists several things as gaps
that have since been shipped (Y6 Money's discount/invoice/interest/asset-
liability/insurance-takaful content, Y6 combined measurement, Y6 pie
charts). Don't trust that section's specifics without cross-checking the
live topic list first (`grep "yearLevel:" lib/content/topics.ts` or
similar) — it was accurate when written but has drifted since.

**Real remaining gaps, per that same stale section, still believed open
(unverified against the real book this round):** Y5/Y6 Time's fuller
addition/subtraction across every converted unit; Coordinates/Ratio/
Proportion depth (real books apparently have more than the current
distance-between-coordinates + simple-ratio + proportion-to-find-a-value);
the rest of Fractions/Decimals/Percentages (division-of-fractions
variants, a fuller percentage progression). **Next round: re-upload
`Math.zip` and re-run the `pdftotext` ToC extraction described below
before picking what to build — don't build blind from a stale gap list
again if the real source is available.**

**The round before that (id `...072`):** Reading Pie Charts (`pie_chart`, Y6
Statistics) — the one known gap that needed an actual new diagram kind.
Added `PieChartDiagram.tsx` (SVG sectors sized by fraction, wired into
`QuestionPlayer.tsx` under `diagram.kind === "pie_chart"`) and a new
`{ kind: "pie_chart"; segments: {label,numerator,denominator}[] }` variant
on `GeneratedQuestion["diagram"]` in `lib/questions/types.ts`. Sectors are
labeled with generic A/B/C/D + their fraction directly on the slice (same
"keep raw SVG text language-neutral" convention as `bar_graph`'s labels —
the actual scenario wording lives in the bilingual `prompt`, not the SVG).
Two variants, mirroring `bar_graph`'s total/difference split: `count`
(total × one group's fraction) and `difference` (between the
highest- and lowest-count groups). Fractions are drawn from a fixed list
of 5 "nice" sets (denominators 6, 8, 12) that always sum to a whole, with
the pupil total always a multiple of that denominator so every answer is
a whole number — no rounding edge cases to worry about.

**Now-exhausted list of known content gaps** — every gap that was
previously flagged (pie charts, and before that all three combined-
measurement pairings) has been built. If nothing new comes to mind, the
next round should be a fresh pass through the real textbook/DSKP looking
for anything not yet covered, rather than assuming coverage is complete.

**The round before that (ids `...070`-`...071`):** completed the Y6 "combined
measurement" set — Combined Length and Volume (`combined_length_volume`,
garden hose + fertiliser bottle, divided among equal garden sections) and
Combined Mass and Volume (`combined_mass_volume`, recipe's flour + milk,
divided into equal batches). Both follow the exact `combined_length_mass`
pattern from the round before (mixed-up-quantity + gave-total distractors,
same single-correctAnswer constraint). No new diagram needed. This closes
out all three real-book combined-measurement pairings (length+mass,
length+volume, mass+volume).

**Still not touched by any round:** pie charts (Y5/Y6 Data Handling —
needs a new diagram kind, unlike everything built so far — this is now
the only remaining known gap besides re-verifying Space's Y6 circle
radius/diameter and specific-degree angle-drawing exercises against the
real textbook).

**The round before that (ids `...068`-`...069`):** closed two more previously-flagged
gaps. Y6 Money "Insurance and Takaful" (`insurance_takaful`) — third
word-answer/non-arithmetic generator (alongside `likelihood` and
`asset_liability`); distinguishes the two by stated operating principle
(Shariah/mutual-contribution/no-riba vs. conventional/fixed-premium/
company-run) rather than anything guessable from context, since that's
what the real lesson is actually teaching. Y6 "Combined Length and Mass"
(`combined_length_mass`) — first of the Y6 "combined measurement"
problems (a rope's length AND a parcel's mass both divided by the same
number of pieces in one scenario; asks for just one of the two results to
keep a single `correctAnswer`, same constraint every other generator has).

**Still not touched by any round:** pie charts (Y5/Y6 Data Handling —
needs a new diagram kind, unlike everything built so far); Length/Mass/
Volume "combined" problems beyond the one length+mass pairing just added
(length+volume, mass+volume also exist in the real Y6 book).

**The round before that (ids `...066`-`...067`):** Y5 Data Handling "Mode, Range,
Median, and Mean" — one generator (`mode_range_median_mean`) builds a
5-value dataset and asks for any one of the four measures; the other three
computed values double as distractors, which naturally tests the specific
mistake of confusing one statistic for another rather than just testing
arithmetic. Also picked up Y5 Money "Purchasing Via Cash or Instalment"
(`credit_vs_cash`) — previously flagged as needing scoping since it's a
comparison (instalment total vs. cash price), not a single clean
operation; turned out fine as a straightforward "find the difference"
generator once the instalment total is computed.

**Still not touched by any round:** Y6 Money insurance/takaful
(vocabulary-heavy, more categories than the clean binary `asset_liability`
used — needs real scoping, not a quick reuse); Y5/Y6 Length/Mass/Volume
"combined" problems (Y6 shifts from single-unit arithmetic to composite
problems mixing two units); pie charts (Y5/Y6 Data Handling — needs a new
diagram kind, more setup than `mode_range_median_mean` needed).

**The round before that (ids `...062`-`...065`):** completed all 4 KSSR
fraction-division sub-topics (`fractions_divide_by_fraction` and
`fractions_divide_mixed_by_fraction` — "flip and multiply" — join the
proper÷whole and mixed÷whole ones from earlier rounds). Added a generic
`time_unit_add_subtract` generator (years/months, decades/years — same
one-generator-many-configs pattern as `unit_convert`) for Y5's bigger-unit
time arithmetic. Added Y6 "Distance Between Two Coordinates", restricted
to horizontal/vertical-only pairs (two points sharing an x or y value) so
it's pure arithmetic — no new diagram needed, unlike the Y5 "reading
coordinates" topic.

**Still not touched by any round:** Y5 Money "credit vs. cash purchasing"
(comparison-based, needs scoping — not a clean arithmetic generator); Y6
Money insurance/takaful (vocabulary-heavy, more categories than the clean
binary `asset_liability` used); Y5/Y6 Length/Mass/Volume "combined"
problems (Y6 real book shifts from single-unit arithmetic to composite
problems mixing two units, e.g. length-and-mass together); Data Handling
beyond `likelihood` (pie charts, mode/range/median/mean are in the real
Y5/Y6 books, not built).

**The round before that (ids `...058`-`...061`):** first real content in
Coordinates/Ratio/Proportion since the strand's initial 2 topics — Y5
"Proportion to Find a Value" (given a ratio and one known quantity, scale
to find the other). Also 3 more Y6 Money topics from the real book's
richer content: service tax (invoice/receipt), dividend, and asset vs.
liability (Congak's second word-answer, non-arithmetic generator
alongside `likelihood` — binary this time, only 2 valid categories, so
`asset_liability`'s options array is 2 items, not the usual 3 — the smoke
test needed a per-generator minimum-options exception for this, not a
blanket "always ≥3" rule).

**Still not touched by any round yet:** Y6 Coordinates (distance between
two coordinates — needs a diagram, more setup than the arithmetic-only
topics above), Y5/Y6 Time's full unit-conversion-then-arithmetic depth
(Congak has conversion topics and Y4-level add/subtract, but not
Y5/Y6-level "add 2 decades 3 years to 1 decade 8 years" style problems),
Y5 Money "credit vs. cash purchasing" (comparison-based, not a clean
arithmetic generator — needs scoping), Y6 Money insurance/takaful
(heavily vocabulary/conceptual, similar challenge to asset/liability but
likely needs more categories than a clean binary).

**The round before that (ids `...052`-`...057`):** pushed further into Fractions/
Decimals/Percentages, still the biggest known gap. Added Y4 percentage of
a quantity (reused the existing `percentage_of_quantity` generator with a
simpler config — no new code), Y4 fraction↔percentage conversion, Y5
fraction multiplication, a reusable Y5/Y6 decimal↔percentage converter
(`decimal_percentage_convert`, same one-generator-many-configs approach as
`unit_convert`), Y6 percentage add/subtract, and Y6 "dividing a mixed
number by a whole number" (third of four fraction-division sub-topics —
see `...038` for the first, `...057` for the second: proper÷whole is done,
mixed÷whole is done, proper÷proper and mixed÷proper are not).

**Recurring bug pattern, now familiar — check this first when a new
generator's `tsc` fails:** storing a `boolean` directly in a generator's
`context` object fails type-checking (`context` is typed
`Record<string, string | number>`, no boolean). Fix is always the same:
store `"yes"/"no"` (or similar) instead of `true/false`, and cast
accordingly in the matching `classify.ts` case if it reads that field.
Hit this again this round (2 more instances) — same fix as the
`whole_numbers_addition_y6`/`profit_loss` cases from earlier rounds.

**Two rounds before that (ids `...045`-`...051`):** introduced a generic reusable
`unit_convert` generator (`lib/questions/generators/unitConvert.ts`) —
Length/Mass/Volume-of-Liquid/Time conversions are all structurally
identical (multiply or divide by a fixed factor, e.g. 1000 g = 1 kg), so
one generator with a `pairs` config array now powers 5 topics instead of
5 near-duplicate files. Also added Y6 Money "Discount" and Y6 Data
Handling "Likelihood" (first non-arithmetic, word-answer Data Handling
topic — bag-of-coloured-marbles scenarios, reuses the `OPTION_LABELS`
convention from `angles_classify`, canonical keys `certain`/`impossible`/
`equally_likely`/`more_likely`/`less_likely`).

**Still not scoped in detail (do this before building):** Y5/Y6 Time's
full addition/subtraction across every converted unit (the real Y5 book
has this for hours/days/months/years/decades/centuries, not just the
Y4-level hours-and-minutes Congak has); Y6 Money's remaining rich content
(invoices/bills/receipts/tax, interest/dividends, assets/liabilities/
insurance/takaful, credit vs. cash purchasing); Coordinates/Ratio/
Proportion (only has Y5 coordinates + Y6 ratio-simplify — real books have
distance-between-coordinates, ratio-between-two-quantities, and
proportion-to-find-a-value, each with more depth); the rest of
Fractions/Decimals/Percentages (still the single biggest gap — division
of fractions has 3 more variants beyond what's built, percentages need
a full progression, not just one basic topic). Re-run the `pdftotext`
ToC extraction (see below) for the exact section a future round is about
to build, rather than assuming the summary above is complete — it's a
summary, not the source of truth.
**Curriculum source upgraded two rounds ago.** Lynda uploaded the actual
official KSSR Mathematics Year 4/5/6 textbooks (`Math.zip` — a teacher had
compared Congak to Delima and suggested this). Their real tables of
contents were extracted directly (`pdftotext` on the ToC pages — the
English headings extract cleanly; some Malay stylized-font headings don't,
but weren't needed). **This replaces the old "~40+ topic" estimate, which
was a rough guess from skimming a different (Pelangi) reference book — the
real curriculum is substantially bigger, especially in three strands
Congak barely touches:**
- **Fractions/Decimals/Percentages** — still the biggest gap even after 5
  new topics two rounds ago. Real books have a full progression each year
  (fraction multiplication/division, mixed numbers, all 4 decimal
  operations, percentage conversions) — likely 15-20 sub-topics alone
  across three years. Congak has 8.
- **Money** — partially closed this round (4 new topics — see below), but
  Y6 real content is still far ahead of Congak: discounts/rebates/
  vouchers, invoices/bills/receipts/tax, interest/dividends, assets/
  liabilities/insurance/takaful are all untouched. Y5's "credit vs. cash
  purchasing" sub-topic also untouched.
- **Time / Length/Mass/Volume** — partially closed this round (2 new
  topics — see below), but real books cover a LOT more: unit conversions
  (mm↔cm↔m↔km, g↔kg, ml↔L, and for time: minutes↔hours↔days↔weeks↔
  months↔years↔decades↔centuries) and all 4 operations at each
  conversion level, every year. Y6 also shifts from single-unit operations
  to *combined* measurement problems (e.g. "length and mass together") —
  none of that exists in Congak yet. Y6 Time is comparatively light in the
  real book (just "time zones"), so that one's a smaller lift once picked
  up.

**Because of this, stop reporting "X/40 ≈ Y%" — that denominator was
wrong.** The real total is likely 70-100+ sub-topics even after this
round's additions. Until all 8 strands are scoped from the real books in
full detail, report progress as "N topics shipped, biggest known gaps are
X/Y/Z" rather than a percentage — a confident-sounding wrong percentage is
worse than no percentage.

**Space and Numbers & Operations are still the two strands closest to
real coverage** — Numbers & Operations has all 4 basic operations at
every year level; Space covers most angle/area/perimeter/circle topics
the real books have (Y6 circle radius/diameter and specific-degree
angle-drawing exercises haven't been checked in detail against the real
book yet).

| Unit | Y4 | Y5 | Y6 |
|---|---|---|---|
| Numbers & Operations | addition, subtraction, multiplication (1-digit), division (1-digit) | multiplication (2-digit), division (1-digit), addition/subtraction (6-digit) | multiplication (4-digit×2-digit), division (2-digit), mixed operations (BODMAS), addition (3 addends), subtraction (from round number) |
| Fractions | add (same denom), subtract (same denom) | — | divide by whole number |
| Decimals | add/subtract (1dp) | add/subtract (2dp), multiply, divide | — |
| Percentage | — | — | basic (% of quantity) |
| Money | ✓ (change), add/subtract, multiply/divide | simple interest | profit & loss |
| Time | add/subtract (hours/min) | ✓ (duration) | — |
| Length/Mass/Volume | perimeter, length add/subtract (m/cm) | — | volume (liquid) |
| **Space** (polygons/angles/area) | area (rectangle/square), angle types | angles (straight line, at a point), area (composite) | angles (triangle sum), area (triangle), circumference & area of a circle |
| Coordinates/Ratio/Proportion | — | coordinates | ratio (simplify) |
| Data Handling | — | average, bar graphs | — |

Real Y6 Data Handling also includes basic likelihood/probability (certain/
impossible, equally likely) — Congak has none of this, not yet scoped in
detail.

**This round shipped 6 Money/Time/Length topics** (ids `...039`-`...044`):
Y4 money add/subtract and multiply/divide (RM/sen, same base-100 carry
pattern as the pre-existing `money_change` generator), Y5 simple interest
(`I = P × R × T ÷ 100` — first "financial literacy" topic, distinct from
pure arithmetic drills), Y6 profit & loss (cost price vs. selling price),
Y4 time add/subtract (hours/minutes, base-60 carrying — distinct from the
pre-existing `time_duration`, which does clock-time-plus-duration, not
duration-plus-duration), and Y4 length add/subtract (metres/centimetres,
base-100 carrying, same pattern as money). New file: `length.ts` (first
Length/Mass/Volume arithmetic generator — `perimeter.ts` existed but
computes perimeter, not unit-conversion arithmetic).

**Answer-format decision worth knowing:** `time_add_subtract`'s answer
format is deliberately language-neutral (`"2j 45m"`, not spelled-out
"jam"/"minit" or "hours"/"minutes") — the question PROMPT is bilingual as
usual, but MCQ options/fill answers are a single string shown regardless
of `language_pref`, so spelling them out in Malay words would look wrong
to an English-preference student. `length_add_subtract` didn't need this
distinction since "m"/"cm" abbreviations are identical in both languages.
If a future generator's answer needs to show words (not just numbers/
units), check this before hardcoding one language into the answer string.

**The round before this one shipped 5 Fractions/Decimals topics** (ids `...034`-`...038`):
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
  Opening greeting is a REAL engine reply now (see "Post-launch fixes"
  below — this wasn't true at first), then a normal send/receive loop
  against `/api/pintar`. `sessionId` is a fresh `crypto.randomUUID()` per
  page load — **not persisted**, matching the locked "start stateless"
  decision. If Lynda wants chat history to survive a refresh later, that's
  a new Supabase table + migration (next one would be `0024`), deliberately
  not built yet.
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

### Post-launch fixes (after Pintar's engine went live and got real testing)
Three issues found once Lynda's husband's side actually tested against
the live engine — all frontend-only, per his handoff doc, no API contract
changes needed:

1. **Markdown wasn't rendered.** The engine's `reply` string uses
   `**bold**` and line breaks/lists, but `PintarChat` rendered it as a
   plain string, so students saw literal asterisks with no formatting.
   Fixed by installing `react-markdown` + `remark-gfm` and rendering every
   `pintar`-role message through a small `PintarMarkdown` wrapper
   component (in `PintarChat.tsx`) instead of a raw string. Deliberately
   did NOT add the `@tailwindcss/typography` plugin for this — styled the
   handful of elements that actually show up (`p`, `strong`, `ul`, `ol`,
   `li`) with scoped Tailwind classes via `components={}` instead, to
   avoid a new plugin + config change for a small amount of styling.
2. **Header subtitle showed the raw current-topic string** (e.g. "Tambah
   Pecahan Penyebut Sama") instead of a fixed tagline — looked like a
   copy-paste from a lesson-page component that never got swapped out.
   Fixed: subtitle is now a static bilingual string (`UI.pintarTagline`,
   "Pembimbing Matematik Anda" / "Your Maths Guide"), not bound to
   `currentTopicTitle` at all. `currentTopicTitle` is still sent to the
   engine in `context.currentTopic` — it just isn't displayed in the
   header anymore.
3. **The opening greeting was hardcoded, not a real Pintar reply.** Meant
   it couldn't reflect persona/tone changes on the engine side, and
   couldn't reference the student's actual topic/streak. Fixed: on mount,
   `PintarChat` now calls `/api/pintar` with an internal trigger message
   (`GREETING_TRIGGER = "__greeting__"`, a constant in `PintarChat.tsx`) —
   the engine's `system-prompt.js` (on Lynda's husband's side) recognises
   this and generates a real opening line. The trigger itself is never
   shown as if the student typed it (`showUserBubble: false` — `callEngine`
   was refactored out of `send` specifically to support this silent-first-
   call case). The resulting pintar reply IS added to `historyRef` for
   subsequent turns, so later messages have a coherent history where
   Pintar spoke first.
4. **Math symbol toolbar** (kids' request from the spring cleaning event,
   `pintar_math_symbols_addon.md`) — a row of tappable buttons (+ − × ÷ =
   ½ ⅓ ¼ ¾ % ° √ π) that insert at the current cursor position, for
   symbols a touchscreen keyboard doesn't have. Built as one shared
   `components/student/MathSymbolBar.tsx` (takes `inputRef`/`value`/
   `onChange`/optional `disabled`) rather than duplicating it — Lynda
   asked for it in Pintar's chat input specifically, but the same need
   (typing `÷`, `½`, etc.) applies anywhere a student types a numeric
   answer, so it's wired into all three fill-in-the-blank inputs:
   `PintarChat.tsx`, `QuestionPlayer.tsx` (Latihan), and `ExamFlow.tsx`
   (Exam). Deliberately NOT added to `QuizPlayer.tsx` — Lynda's request
   named Latihan and Exam specifically, not Quiz; add it there too if she
   wants it, same pattern. No engine-side change needed — Gemini/Groq/
   OpenRouter already read/write these symbols fine as plain unicode text.

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

**Still needed**: same restyle treatment for `quiz` — its per-topic page
(no index/landing page like learn/practice have) uses `QuizPlayer.tsx`
for the actual in-question UI, which is a bigger lift than the header
touch-ups below (styling the question card, options, feedback states) —
left for a future round. A real "Skor" personal-stats page and real Misi
(daily missions/badges) are separate future scope, not visual-only.

**Round after the initial dashboard restyle — asked directly "Misi or
cosmetics first?", recommended cosmetics** (lower risk, no new backend
decisions, and directly serves the reason Lynda started visual polish
early — a consistent look for whoever's testing it next). Misi needs a
missions table + migration + daily-reset logic + a real design
conversation with Lynda about what missions actually are — that's a
feature build, not a quick add, so it waits.

Shipped this round:
- **`profile/page.tsx`** — full restyle: header is now a gradient hero
  card (same `biru` gradient + decorative blob as the dashboard's level
  card), avatar in a rounded badge. Link-code/language/accessibility
  sections wrapped in `shadow-card` white cards instead of bare sections.
- **`quests/page.tsx`** — full restyle of the "coming soon" placeholder:
  gradient hero (this one `pandan`, not `biru`, to visually distinguish
  it) + a 2×2 grid of dimmed preview cards (daily missions, badges,
  adventure map, weekly challenges) so it reads as "on the way" rather
  than "broken tab". Still honestly a placeholder — no real data behind
  any of it, nothing new to wire up beyond swapping this whole page out
  once Misi is actually built.
- **`learn/page.tsx`, `practice/page.tsx`, `exam/page.tsx`** — header-only
  touch-up (added the same decorative blob + `relative overflow-hidden`
  wrapper as the dashboard's header), no content changes. Exam's blob
  uses `saga-light` instead of `kuning-light` to match its existing red
  exam-mode theming rather than copy-pasting the same color everywhere.

**UX change (separate from the visual restyle above):** `learn` and
`practice` used to stack all 3 years' topics as long sections on one
page — unwieldy once the topic count passed 70+. Replaced with a shared
`components/student/TopicYearBrowser.tsx` client component: three
"Tahun 4/5/6" segmented buttons (same look as the existing Tahun picker
on profile setup — border-kuning + bg-kuning-light when selected), click
one to see just that year's topics. Defaults to the student's own year.
This is a structural fix, not a re-skin — it still uses the OLD (pre-
restyle) card look, so it still needs the same dashboard-style visual
pass as the rest of `learn`/`practice` whenever that round happens.

**Next round: Lynda shared a much more detailed reference
(`Congak_interface_design.png` — a full 11-panel style guide: dashboard,
Learn/Practice topic lists, Adventure Mode, Pintar chat, an XP/streak/
badges panel, 4 mascot poses, a colour/type/icon style guide, a buttons/
components reference, motivational message cards, and a decorative
background banner) and said explicitly: "the cosmetic still needs a lot
of work, I want it to look like the attached file." This is a stronger,
more specific signal than the earlier screenshots, including on the one
point where Claude had previously overridden the mockup on its own
judgment — so this round FOLLOWED it, rather than repeating the earlier
"keep the existing palette" reasoning. That earlier reasoning made sense
when there was no explicit reference to follow; it doesn't apply once
Lynda has pointed at a specific detailed design and said "this one."**

**Palette change:** added `ungu` (purple, `#6D4AC4`/`#4A2F8F`/`#E7E0FA`)
to `tailwind.config.ts` as a new primary accent — used for level/XP,
Pintar chat, selected states — alongside the existing kuning/biru/saga/
pandan (kuning still carries CTAs and everyday warmth, so the whole app
doesn't go purple). Installed `lucide-react` for real line icons,
replacing emoji throughout the touched files (emoji elsewhere is still
emoji — not yet swapped everywhere).

**Shipped this round**, matching the reference's icon-square + purple
language:
- **`BottomNav.tsx`** — lucide icons (Home/BookOpen/PencilLine/Compass/
  MessageCircle/User), purple when active, was emoji before.
- **`dashboard/page.tsx`** — level/XP hero card switched from `biru` to
  `ungu` gradient (reference shows purple, not blue); Target/Trophy/
  AlertTriangle/Lock/Timer/Flame/Star lucide icons replacing emoji
  throughout. Deliberately did NOT add the reference's "View stats" link
  next to the streak — there's no Skor/stats page built yet, and a link
  to nowhere is worse than no link.
- **`lib/content/strandStyle.ts`** (new) — maps each topic strand to a
  consistent icon + tinted color square (Numbers-family strands →
  Calculator/blue, Measurement → Clock/teal-green, Money → Coins/gold,
  Space → Ruler/warm red-orange, Statistics → BarChart3/purple,
  Coordinates → MapPin, Ratio → Scale), matching the reference's
  per-topic colored icon squares in the Learn/Practice lists.
- **`TopicYearBrowser.tsx`** — topic cards now show the icon square from
  `strandStyle.ts` instead of a plain text strand label. Year pills:
  selected year is now a solid purple pill (was a yellow-outline pill),
  with a small star mark for "your year" — matches the reference's
  "Year 5 ⭐ Your year" treatment. Also fixed a real bug while doing this:
  `practice/page.tsx` was defaulting every topic without mastery data to
  `weak: false`, which would have shown a false "Good" badge on topics
  the student has never attempted — changed to `weak: boolean | undefined`
  so untried topics show no badge at all, matching the reference's
  "Weak"/"Good" pills only appearing where there's real signal.
- **`learn/page.tsx`, `practice/page.tsx` headers** — added the Pintar
  mascot image (`showing.png` for Learn, `correct.png` for Practice —
  picked by filename semantics since these exact poses aren't confirmed
  against the reference's illustrated mascot art, which Congak doesn't
  have as real assets, only the 6 chat-reaction PNGs Lynda's husband
  made).
- **`PintarChat.tsx`** — user bubble switched from `biru` to `ungu`; added
  an "Online" status dot next to Pintar's name (reference shows this);
  send button switched from a text pill to a purple circular icon button
  (lucide `Send`), matching the reference's circular arrow-send button.

**Confirmed NOT done — real gaps against the reference, needs its own
round(s):**
- **Badges** (First Steps / Quick Thinker / Fraction Fan hexagons) — no
  backend at all (same gap flagged for Misi/rewards earlier). Don't
  fabricate placeholder badge data; this needs a real achievements table
  + criteria design with Lynda first.
- **Weekly streak view** (M T W T F S dots with checkmarks) — Congak
  only stores a running `streak_count`, not per-day history, so there's
  nothing to render a real week view from yet. Would need a
  `streak_days` (or similar) table.
- **Adventure Mode's illustrated island/map background** — the reference
  shows real illustrated scenery (islands, castle, clouds); this round's
  `quests/page.tsx` restyle used flat gradient + lucide icons instead,
  not custom illustration — a real illustrated background is a bigger
  asset-creation task, not a code change.
- **4 mascot poses shown in the reference's "Character - Pintar" panel**
  (walking/waving, reading with glasses, question-mark, trophy) don't
  exist as real assets — Congak only has the 6 chat-state PNGs
  (idle/thinking/showing/correct/wrong/confuse). Reused those by
  best-guess filename semantics where mascot images were added this
  round; asking Lynda's husband for the exact 4 poses (or confirming the
  existing 6 are meant to double as these) would remove the guessing.
- **Motivational message cards** ("Great job! You're on fire!" etc.) —
  not yet added anywhere; would need a small rotating-message component,
  probably shown after a correct/streak answer in Practice/Quiz/Exam.
- **`QuizPlayer.tsx`** — still fully untouched, same gap as last round.
- **Style guide as a living reference** — the reference's own panel 8
  (colours/type/icons swatch) is itself a nice idea to keep somewhere in
  the codebase (e.g. a `/dev/style-guide` route) so future rounds have a
  single place to check tokens against — not built, just noted as a
  good idea worth doing once the palette settles further.

**Round after that — 4 specific UX requests from Lynda, all shipped:**
1. **More space for subjective (fill-in) answers, with clear
   "show working" instruction.** Split the single answer box into TWO
   fields everywhere a student types an answer (`QuestionPlayer.tsx`/
   Latihan, `ExamFlow.tsx`/Exam, `QuizPlayer.tsx`/Quiz — Quiz got the
   MathSymbolBar for the first time here too, extending the earlier
   Latihan/Exam-only scoping since consistency matters more now that
   Lynda's asking about the subjective-answer experience broadly): a
   large `<textarea rows={5}>` labeled "Show your working" (explicitly
   marked optional/ungraded — `UI.showWorkingHint`), and the existing
   small graded answer field, now labeled "Final answer". **Important
   architectural note for future rounds: the working-space text is
   LOCAL COMPONENT STATE ONLY — never sent to the server, never
   persisted, never graded.** This was a deliberate choice: the actual
   grading logic does an exact string match against `correctAnswer`, so
   letting students type free-form reasoning INTO the graded field would
   break every mistake-classifier and mastery calculation in the app.
   Two separate fields preserves grading correctness while still giving
   real scratch space. If Lynda wants working shown to teachers later,
   that needs a real `working_text` column + a teacher-facing view — a
   new feature, not a styling tweak.
2. **Enter goes down, not send** — for Pintar's chat input specifically
   (the word "send" in the request pointed there, not the subjective
   answer boxes, which don't have a "send" concept — they use a button).
   Switched `PintarChat.tsx`'s input from a single-line `<input>` to an
   auto-growing `<textarea rows={1} className="max-h-[120px] ...">` that
   grows with content up to 120px then scrolls. Since forms only
   auto-submit on Enter for single-line inputs (never textareas), this
   was enough on its own — Enter now inserts a newline, only the circular
   send button actually sends. Height resets to auto after sending.
   `MathSymbolBar`'s `inputRef` prop type was generalized from
   `RefObject<HTMLInputElement>` to `RefObject<HTMLInputElement |
   HTMLTextAreaElement>` to support this (both element types share the
   same `selectionStart`/`selectionEnd`/`setSelectionRange` API, so the
   insert-at-cursor logic needed no changes, just the type).
3. **Bigger math symbol buttons** — `MathSymbolBar.tsx`: `min-w-[36px]`
   → `min-w-[48px]`, `text-sm` → `text-lg`, more padding. Also switched
   its active-tap tint from `kuning-light` to `ungu-light` to match the
   purple sweep.
4. **Finished the purple sweep** on the three question-answering
   surfaces while in there for the above — `QuestionPlayer.tsx`,
   `ExamFlow.tsx`, and `QuizPlayer.tsx` all had leftover `biru` (blue)
   selected-option borders, input focus rings, progress bars, and
   feedback-panel colors from before `ungu` existed; all switched to
   `ungu` now, so Practice/Exam/Quiz all read consistently purple like
   the rest of the app.

**Round after that — 3 more visual requests plus a curriculum check:**

1. **New mascot character.** Lynda uploaded a 12-pose sprite sheet of a
   new red-panda/fox character (replacing the earlier cat) on a black
   background. Cropped and chroma-keyed each pose to a transparent PNG
   (`PIL`/`numpy`, soft alpha ramp on brightness to avoid JPEG-compression
   halos around the edges — see round's chat transcript for the exact
   script if this needs redoing). Mapped 6 poses onto the EXISTING
   filenames (`idle`/`thinking`/`showing`/`correct`/`wrong`/`confuse`) so
   every existing reference in the app picked up the new character with
   ZERO code changes, plus 2 new ones (`reward.png` — treasure chest,
   used on the Quests hero; `studying.png` — hugging books, used on
   Learn's header instead of reusing `showing.png`). **Caveat: `wrong`
   and `confuse` were the hardest to map — the sprite sheet is all happy/
   cheerful poses, no sad or frustrated one, so those two are best-guess
   (sleeping/tired for `wrong`, magnifying-glass for `confuse`). Ask
   Lynda to confirm or provide a better-fitting pose for those two
   specifically if it comes up.**
2. **Gradients + icons made "more 3D-ish."** Two changes:
   - Widened the light→dark contrast on every gradient-card color pair
     in `tailwind.config.ts` (`ungu`/`pandan`/`biru` DEFAULT brightened
     slightly, `dark` variants darkened further) so the existing 2-stop
     gradients read as more dramatic without restructuring the token
     system. Added a `shadow-hero` boxShadow (deeper drop shadow + an
     inset white top-edge highlight) and a `pointer-events-none` sheen
     overlay div (`from-white/25 to-transparent`, top half only) on all
     three gradient hero cards (dashboard level/XP, quests, profile) for
     a glossy/embossed look. `saga`/`kuning` dark variants darkened too,
     for the same visual family even though they're not used in
     gradients yet — also improves text contrast anywhere `-dark` is
     used for text, so this was a safe change everywhere.
   - Icons "more 3D and prominent": lucide is a flat outline set with no
     true 3D variant, so faked it the way most kid-friendly game UIs do:
     colored rounded-square/circle backdrops behind icons (bumped from
     10-11px squares to 11-12px, `shadow-sm`/`shadow-card` added),
     bigger icon sizes throughout (`BottomNav`, dashboard icons,
     `TopicYearBrowser` strand squares), bolder `strokeWidth` (2.25-2.5
     instead of default 2), and the active bottom-nav tab now gets a
     solid filled purple square behind it instead of just a color tint.
3. **Checked against the real KSSR curriculum site** (`bpk.moe.gov.my`
   itself blocks automated fetching — used a third-party mirror instead:
   a "Panitia Matematik" Google Sites page links directly to the
   official DSKP PDFs, hosted as flipbooks on `anyflip.com`, one level
   removed from the blocked domain). **Confirmed the DSKP's own
   "Bidang Pembelajaran → Tajuk" table matches exactly what was already
   built against via `Math.zip`'s textbook ToCs**: Nombor dan Operasi →
   Nombor Bulat/Pecahan-Perpuluhan-Peratus/Wang; Sukatan dan Geometri →
   Masa dan Waktu/Ukuran dan Sukatan/Ruang; Perkaitan dan Algebra →
   Koordinat-Nisbah-Kadaran; Statistik dan Kebarangkalian → Pengurusan
   Data/Kebolehjadian. Also directly confirmed the DSKP's own wording for
   Y6 Space says "poligon sekata **hingga lapan sisi**" (regular polygons
   **up to eight sides**) — validates the earlier decision to cap
   `regular_polygon_angles` at octagon and skip heptagon. **This was a
   spot-check against the DSKP's top-level structure and a couple of
   specific content standards, not an exhaustive standard-by-standard
   diff** — that would mean fetching and reading all ~50-80 pages of
   each of the three DSKP documents individually, which wasn't done here.
   If Lynda wants that level of certainty, it's a bigger dedicated task,
   not a quick check.

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

## Curriculum hierarchy added post-launch — Bidang → Tajuk (main topics → sub-topics)
Lynda asked whether the app matched how the real KSSR textbooks organize
content — they don't use one flat topic list, they group into **4 Bidang
Pembelajaran (learning areas)**, each containing several **Tajuk
(sub-topics)**. Verified this against multiple official DSKP Matematik
KSSR (Semakan 2017) sources for Tahun 4-6 (all consistent):

1. **Nombor dan Operasi** (Numbers and Operations) — Nombor Bulat dan
   Operasi Asas; Pecahan, Perpuluhan dan Peratus; Wang
2. **Sukatan dan Geometri** (Measurement and Geometry) — Masa dan Waktu;
   Ukuran dan Sukatan; Ruang
3. **Perkaitan dan Algebra** (Relationship and Algebra) — Koordinat,
   Nisbah dan Kadaran
4. **Statistik dan Kebarangkalian** (Statistics and Probability) —
   Pengurusan Data; Kebolehjadian

Our existing `strand` field on every topic (e.g. "Wang", "Ruang",
"Statistik") already *was* the Tajuk level — it just had no parent Bidang
grouping, and a few topics had gotten bundled into the wrong Tajuk along
the way. Fixed both:

- **Added `bidang: Bilingual` to every topic** in `lib/content/topics.ts`
  (`TopicContent` interface + all 85 entries), sourced from a new `BIDANG`
  const with the 4 canonical values above. Verified programmatically
  after: `{ numbersOperations: 42, measurementGeometry: 30,
  relationshipAlgebra: 7, statisticsProbability: 6 }`, 85 total, 0
  missing — matches the real curriculum's topic distribution shape.
- **Split 2 Tajuk that were incorrectly merged:**
  - Time topics (`...007`, `...043`, `...048`, `...049`, `...064`,
    `...073`, `...085` — 7 total) were tagged `strand: "Measurement"`
    alongside length/mass/volume topics. Real DSKP has "Masa dan Waktu"
    as its own Tajuk, separate from "Ukuran dan Sukatan" — split them out.
  - `...051` (Likelihood) was tagged `strand: "Statistics"`. Real DSKP
    has "Kebolehjadian" (Probability) as a separate Tajuk from
    "Pengurusan Data" (which the other 5 stats topics correctly map to)
    — split it out to its own `strand: "Probability"`.
  - `...074` (Prime/Composite Numbers) had `strand: "Numbers and
    Operations"` (the Bidang name, not a Tajuk) — relabeled to `strand:
    "Whole Numbers"`, which is where it actually belongs (Tajuk "Nombor
    Bulat dan Operasi Asas").
- **`lib/content/strandStyle.ts`**: added icon/color entries for the 2
  new Tajuk values (`Time` → Clock, `Probability` → Dices), and swapped
  `Space`'s icon to `Shapes` and `Measurement`'s to `Ruler` since `Clock`
  moved to `Time` and both used to share one bucket.
- **`components/student/TopicYearBrowser.tsx`** (shared by `/learn` and
  `/practice`): now groups each year's topics into Bidang sections
  (uppercase small-caps headers) in fixed curriculum order — Numbers &
  Operations → Measurement & Geometry → Relationship & Algebra →
  Statistics & Probability — instead of one flat list. Topic cards
  underneath are unchanged (still show Tajuk as the small label + colored
  icon). `YearTopicItem` gained a `bidang: Bilingual` field;
  `app/(student)/learn/page.tsx` and `.../practice/page.tsx` both pass
  `topic.bidang` through when building `YearGroup`s.
- **Topic detail page headers** (`/learn/[topicId]`, `/practice/[topicId]`,
  `/quiz/[topicId]`) now show a `Bidang › Tajuk` breadcrumb instead of
  just the Tajuk, for consistency with the list view — cheap, same label
  slot, no layout change.
- **Not touched:** `supabase/migrations/0002_seed_content.sql` — per the
  note already at the top of `topics.ts`, that seed file is a known stale
  duplicate no screen actually reads from; `topics.ts` is the single
  source of truth. If content ever moves into the DB for real, the
  `bidang` column will need adding there too — flagging so it isn't
  missed.

Verified: `npx tsc --noEmit` clean. No new migration needed (code-only).

## UASA-alignment audit — how our question standards compare to real exam papers
Lynda asked whether our exercise/quiz/exam question standards are on par
with real UASA (Ujian Akhir Sesi Akademik) papers. Read three full real
sample papers — MathsCatch/Cikgu Gorgeous practice papers for Tahun 4, 5,
and 6, sourced via Studocu/PDFCoffee/AnyFlip since the original Scribd
link was JS-gated. Findings, cross-checked against the actual generator
code rather than assumed:

**On par:** paper structure (Bahagian A short items + Bahagian B word
problems maps onto mcq/fill vs word_problem), and a long list of direct
topic-for-topic matches — number-in-words, rounding, number lines,
fraction↔percent, percentage-of-quantity, ratio, composite-shape
area/volume, profit/loss, time zones, angles in regular polygons, pie
charts (including the "one sector missing, work it out from 100%"
pattern, which is exactly our `pie_chart` reverseProblem). The
reverseProblem pattern built across the whole retrofit — "given a total
and one part, find the other" — turns out to be genuinely the same shape
real UASA word problems use.

**Fixed this session — verified against DSKP, not just the exam paper:**
`...065` (Distance Between Two Coordinates, Y6) only ever computed the
raw grid-unit difference between two points. Real Y6 papers (and the
DSKP itself — SK 7.1 Koordinat pada Sukuan Pertama, SP 7.1.1, textbook
pages 187-190, confirmed via multiple independent PBD worksheet sources)
consistently apply a map scale ("1 unit mewakili 150 m") to convert that
grid distance into a REAL distance in m or km — this is the actual
terminal Y6 skill, not an exam-writer's embellishment on top of the
"real" content. Fixed in `lib/questions/generators/coordinateDistance.ts`:
added a `scaled` config branch that multiplies the grid distance by a
configurable scale (`scaleUnitMeters`, defaults picked from
`[50,100,150,200,250,500]`) and expresses the answer in `m` or `km` per
config, plus an `errorSpotting` variant for the "forgot to apply the
scale" mistake (now `commonMistakes`' primary entry — was previously not
covered at all). `classify.ts`'s case now guards on
`ctx.scaleUnitMeters !== undefined` before the plain-grid checks, same
pattern as every other reverseProblem/variant guard in this project.
Rewrote topic 065's `explanation`/`tips`/`howTo`/`workedExample` to teach
both steps (grid distance → apply scale) instead of just the first one.
`questionTemplates` now mixes 2 plain-grid templates (the foundational
step, still worth practicing alone) with 2 scaled templates and keeps
errorSpotting + reverseProblem — 6 total, still gold per the audit
script. Smoke-tested all 11 branches (plain × 5, scaled × 6) at 1000x —
100% pass; also ran a few samples through the real `generateQuestion`
dispatcher end-to-end (not just the raw generator function) to confirm
the actual `questionTemplates` configs work, since this is the first
retrofit where a topic's templates were restructured rather than just
extended.

**Bigger structural gaps — not fixed this session, need a dedicated
pass, documented here so the plan doesn't get lost:**

1. **Real papers routinely blend 2-3 skills into ONE question** — a
   mixed number, a decimal, and a whole number combined in the same
   expression; a fraction-of-a-quantity chained into a subtraction
   chained into a multiplication. Every one of our 85 generators is
   deliberately single-skill (right call for *practice/mastery* mode —
   you want to isolate what's being tested when a student is drilling a
   specific topic), but it means no single Congak question replicates
   that layered complexity real Bahagian B items have.

2. **Bahagian B's actual structure is "one scenario → a)/b)/c)/d)/e)
   escalating sub-questions"**, often reusing numbers or an answer from
   an earlier part in a later part. Checked `ExamFlow.tsx`:
   `buildExamQuestions()` assembles N fully independent questions
   cycling through topic generators (`topicIds[i % topicIds.length]`) —
   there's no "one scenario, multiple linked parts" mode. This is the
   single biggest structural difference from a real paper's Bahagian B,
   not a content-quality issue — our exam mode is closer to "a longer
   Bahagian A" than a real mixed paper.

   These two are really the same underlying gap (a real Bahagian B
   *is* the blended-multi-skill scenario), and best tackled together as
   one feature rather than two separate patches:
   - A new content shape for **scenario topics**: one real-world setup
     (e.g. a school sports day, a family budget, a factory's weekly
     output) with 3-5 linked parts, each part pulling one arithmetic
     step but drawing numbers from the same scenario and sometimes from
     a previous part's answer.
   - A new generator pattern: probably a `generateScenario(seed)` that
     returns an ordered list of `{ prompt, correctAnswer, dependsOn }`
     parts sharing one random seed, rather than the current
     `GeneratedQuestion` single-object shape — this is a real schema
     change, not just a new generatorKey, so it needs its own design
     pass before writing code.
   - A new exam/practice UI flow that renders one scenario card with
     multiple sub-answer fields instead of the current one-question-at-
     a-time flow — also a real UI change, not a content tweak.
   - Suggest scoping this as its own multi-batch project the same way
     the content retrofit was, starting with 2-3 scenario topics as a
     proof of shape before generalizing.

3. **Some real questions are open-ended/justification-based**
   ("is this event likely or not, and why", "which item was NOT sold,
   and why do you think so") — not answerable in mcq/fill/word_problem
   format without free-text grading, which this app doesn't have.
   Recommend accepting this as a known gap rather than chasing it —
   it's a format constraint of a digital auto-graded app, not a content
   quality issue.

4. **Chart construction** (draw/complete a bar or pie chart from a data
   table) appears in real Bahagian B. Not replicable without a
   drawing/labeling UI — same accepted-gap reasoning as #3.

## Workflow with Lynda
Non-technical, testing on Windows/VS Code, deploys via GitHub push →
Vercel auto-deploy. Always: (1) fix/build the feature, (2) run
`npx tsc --noEmit` clean, (3) zip with
`zip -r congak-scaffold.zip congak -x "*/node_modules/*" -x "*/.next/*" -x "*/.git/*"`,
(4) `present_files`, (5) tell her exactly which new migration number(s) to
run and in what order. She replaces files by extracting the zip and
overwriting her local folder (not touching `node_modules`/`.env.local`),
then `git add . && git commit -m "..." && git push`.

## Round 20 — Challenge tier (TP6 / non-routine), evidence-based scoping

Lynda pushed back on the "Scenario Mode" plan from the UASA audit above,
asking whether Malaysian classroom practice materials (not just exam
papers) already use mixed-skill questions — and if so, at what stage.
Investigated properly rather than guessing from instructional theory.

### The evidence
Malaysia's own official assessment framework already answers this: every
DSKP content standard is scored on 6 tiers, **Tahap Penguasaan (TP1-6)**,
worded almost identically across every topic:

- **TP1** Tahu — state/name/recognize a fact
- **TP2** Tahu dan Faham — explain the steps, convert, represent
- **TP3** Boleh Buat — determine whether an answer is *reasonable*
- **TP4** Solve **routine** daily-life problems using the skill
- **TP5** Solve routine problems using **multiple strategies**
- **TP6** Solve **non-routine** problems **creatively and innovatively**

Found real PBD (classroom-based assessment) worksheets — Penerbit Ilmu
Bakti, tied to specific textbook page ranges, used as ongoing weekly
practice, NOT exam papers — for Y4, Y5, and Y6. Every one had a "TP4,
TP5" section with genuinely layered word problems (a Y5 worksheet chained
a fraction subtraction → decimal conversion → division in one question;
a Y4 worksheet blended multiplication and division in one word problem).
So multi-step application is standard weekly practice, introduced right
alongside basic recall for the same topic — not deferred to exam season.

Critical nuance though: TP4-5's "integration" is almost always *multiple
steps within one topic* (fraction → decimal → unit conversion, all still
"fractions/decimals/measurement"), not *combining unrelated topics*. The
deeply cross-topic blending seen in the UASA papers (mixed number +
decimal + whole number in one expression) is TP6 territory — and TP6
items are visibly rarer in real worksheets, usually one item per
worksheet, explicitly labeled "KBAT" (Kemahiran Berfikir Aras Tinggi).

### What this changes about the architecture
Mapped our existing question types onto TP1-6 and found we already cover
5 of 6 tiers better than expected:
- mcq/fill → TP1-2 ✅
- errorSpotting ("this answer is wrong, what's correct?") → TP3's
  "determine reasonableness" ✅ almost exactly
- word_problem + reverseProblem → TP4-5's routine multi-step application ✅

**The only genuinely missing tier is TP6** — and it's the smallest tier
in real materials, not the biggest. That de-risks the whole plan: normal
practice materials do NOT use linked multi-part scenarios for TP6 either
— a KBAT item is still one self-contained question, just non-routine.
So the earlier "Scenario Mode" idea (new schema, new UI, multi-part
linked questions) is correctly scoped to **Exam Mode's Bahagian B
simulation only** — a separate, later, exam-specific effort. Challenge
tier for Exercise Mode is a much lighter addition: **a new `challenge`
boolean config per generator**, no new question shape, no new UI.

### The Challenge tier pattern (proven on 2 pilots this round)
A `challenge: true` config flag added to a generator, alongside the
existing `errorSpotting`/`reverseProblem` flags, that produces a genuine
**two-hop** question: compute an intermediate value using the topic's
core skill, then feed that into a second closely-related step, with only
the FINAL result as `correctAnswer`. Still one `GeneratedQuestion`, one
prompt, one answer — no multi-part UI needed. The natural "wrong"
distractor is always **stopping after the first hop** — this is the
actual, authentic TP6 failure mode (matches real classroom mistakes),
tracked as a new `stopped_at_intermediate_step`-style mistakeType.

Piloted on 2 topics, chosen for having a natural, well-motivated 2-hop
shape rather than a forced one:

- **`...003` money_change**: buy item A, get change, spend part of that
  change on item B, ask what's left. `finalSen = paidSen - price1Sen -
  price2Sen`, with "stopped after the first purchase"
  (`change1Sen`) as the primary distractor. Falls through to the base
  case on the rare item pairing where the second item doesn't fit the
  first change (~10% of draws) rather than retrying combinations.
- **`...008` average**: given the old average, a NEW value is added to
  the set — find the NEW average. Requires undoing the average
  (`average × count = sum`), adding the new value, re-averaging. The
  natural distractor is `(oldAverage + newValue) / 2` — naively
  averaging the average, the actual classic student misconception (the
  old average represents several values, not one). Derives the new
  value algebraically from a chosen target new-average rather than
  retrying random values until one divides cleanly — the first attempt
  at this (retry-based) only hit the challenge branch 16% of the time;
  the algebraic version hits ~75%.

Both wired end-to-end: `classify.ts` gets a guard (`ctx.finalSen !==
undefined` / `ctx.newAverage !== undefined`) before the base-case checks,
same pattern as every reverseProblem/variant guard elsewhere in this
project. Content updated: 1 new tip (framed as "Challenge:"), 1 new
`commonMistakes` entry, 1 new `questionTemplates` entry with
`challenge: true`. Smoke-tested at 1000x for actual-challenge hit rate
(not just pass rate — a `challenge: true` config that silently falls
through to the base case 90% of the time would be a much sneakier bug
than a crash) — 003 hits ~90%, 008 hits ~75% after the algebraic fix.
Also ran both topics' full `questionTemplates` through the real
`generateQuestion` dispatcher end-to-end, not just the raw generator
functions.

**Audit script repurposed to track this rollout**, same role it played
for the whole 27-batch content retrofit: `scripts/audit-content-gaps.ts`
had a dormant `hasChallenge` check against a `challengeExample` field
that was never implemented (a leftover from the original brief — folded
into `questionTemplates` configs instead, see the note near the top of
`topics.ts`). Repurposed it to check for a real `challenge: true` in any
of a topic's `questionTemplates` instead. This means "gold" now has two
levels: **score ≤1** = still the full Round 19 content-retrofit bar
(≥3 tips, ≥4 mistakes, ≥4 templates); **score 0** = that bar PLUS a
Challenge-tier template. Current state: `{ '0': 2, '1': 83 }` — 83
topics still need a Challenge-tier pass.

### Rollout plan for the remaining 83 topics
Same batch-by-batch workflow as the content retrofit: pick a natural
2-hop shape per topic (don't force one if it doesn't fit — a small
number of topics may end up genuinely single-hop-only, e.g. "name this
angle type" has no natural second hop, and that's fine, not every topic
needs one), implement, smoke-test at 1000x checking BOTH pass rate and
actual-challenge hit rate, wire the `classify.ts` guard, add the tip/
mistake/template, run the audit script, ship. Natural next candidates
with an obvious 2-hop shape (not yet started):
- `...054`/`...038` fractions (a fraction operation feeding into a
  second fraction or whole-number step — matches the exact Y5 PBD
  pattern found: fraction subtraction → division → unit conversion)
- `...006` percentage (percentage-of-remainder chains — "X% sold, of
  what's left, Y% sold again" — matches the Y5 UASA cascading-percentage
  pattern and the government-aid-30%-of-total pattern)
- `...072` pie_chart / `...023` bar_graph (find one sector/bar, then use
  it to answer a second question about the data — e.g. "how many more
  than double the smallest")
- `...021`/`...022` multiplication/division (the existing reverseProblem
  daily-rate framing extends naturally to "find the daily rate, then use
  it to project a different number of days")

Topics where forcing a 2-hop doesn't make sense and shouldn't be forced:
pure classification/reading topics (angle-type naming, coordinate
reading without computation) — same "don't force reverseProblem where it
doesn't fit" judgment call already made for some topics during the
Round 19 retrofit.

### Round 20, batch 2 — 3 more topics: percentage, multiplication, bar graphs
`...006` (Peratus Asas), `...021` (Darab Dengan Nombor 2 Digit),
`...023` (Membaca Graf Palang) — all wired end-to-end (generator +
`classify.ts` guard + tip/mistake/questionTemplate), smoke-tested at
1000x for pass rate AND actual-challenge hit rate, then re-verified via
the real `generateQuestion` dispatcher across all of each topic's
`questionTemplates` (18 configs total, 300x each, 100% pass).

- **`...006` percentage**: cascading two-cut percentage chain — "X% sold
  in the morning, Y% of what's LEFT sold in the afternoon, how many
  remain" — directly matches the real PBD/UASA cascading-percentage
  pattern found during the UASA audit. Hit rate 706/1000 (the rest fall
  through to the base case when no second percentage divides the
  remainder cleanly — acceptable, not worth forcing).
- **`...021` multiplication**: extends the existing reverseProblem
  "find the daily rate" framing — hop 1 finds the rate, hop 2 projects
  it over a DIFFERENT number of days. Hit rate 1000/1000 (no fallthrough
  condition needed here, any two distinct day-counts work).
- **`...023` bar_graph**: "how much more is the highest group than
  DOUBLE the lowest group" — genuinely dependent two-hop (identify both
  bars, then double one before subtracting), a real step beyond the
  existing plain-difference variant. Hit rate 767/1000.

Score distribution now `{ '0': 5, '1': 80 }` — 80 topics left for the
Challenge-tier pass. All 85 still at least the Round-19 gold bar.

### Round 20, batch 3 — 3 more: division, fraction division, pie charts
`...022` (Bahagi Dengan Nombor 2 Digit), `...038` (Bahagi Pecahan Dengan
Nombor Bulat), `...072` (Membaca Carta Pai) — all wired end-to-end,
smoke-tested at 1000x for pass rate + hit rate, then re-verified via the
real dispatcher across all 18 template configs (300x each, 100% pass).

- **`...022` division**: rejected the first design (same dividend
  re-divided by a second random divisor) because the hit rate would
  depend on the SAME number happening to factor cleanly two different
  ways — instead built the challenge dividend from scratch as
  `divisor × divisor2 × k`, guaranteeing a clean split both ways by
  construction. "Regroup the same total into a different number of
  classes" — 1000/1000 hit rate, no fallthrough needed at all.
- **`...038` fractions_divide_by_whole**: rejected doing this for
  `...054` fractions_multiply instead, because that shape reduces to a
  fraction ADDITION with different denominators (a genuinely different,
  untaught sub-skill) once you actually work through the numbers.
  `...038` avoids that trap: a share divided again by a second whole
  number stays within the same repeated-division skill throughout (the
  denominator just keeps multiplying) — 1000/1000 hit rate.
- **`...072` pie_chart**: same "highest vs double-lowest" shape as
  `...023` bar_graph from batch 2, kept deliberately consistent across
  the two categorical-data topics. 602/1000 hit rate (falls through when
  doubling the lowest sector already exceeds the highest one, which
  happens more often here than in bar_graph since pie sectors are more
  skewed by design).

**Note for future batches**: before committing to a challenge shape,
actually multiply/add the numbers through by hand (or in the design
notes) to check it doesn't secretly require an unrelated skill — this is
what caught the fractions_multiply trap above before writing any code.

Score distribution now `{ '0': 8, '1': 77 }` — 77 topics left. All 85
still at least the Round-19 gold bar.

### Round 20, batch 4 — 3 more: Y4 mult/div pair + mode/range/median/mean
`...028` (Darab Dengan Nombor 1 Digit, Y4), `...029` (Bahagi Dengan
Nombor 1 Digit, Y4), `...066` (Mod, Julat, Median, dan Min, Y5) — all
wired end-to-end, smoke-tested at 1000x, re-verified via the real
dispatcher across all 18 template configs (300x each, 100% pass).

- **`...028`/`...029`**: straight ports of `...021`/`...022`'s
  challenge shapes (daily-rate projection / regroup-by-construction)
  down to Y4's 1-digit multiplier/divisor range. Both 1000/1000 hit
  rate — worth doing the Y5/Y6 versions of a shape first, then porting
  down to Y4, since the hard design work (avoiding a low-hit-rate
  fallthrough) is already solved.
- **`...066` mode/range/median/mean**: "a 6th score joins and becomes a
  new extreme — what's the new range?" First version collapsed to a
  score of exactly 0 far too often when the new value was meant to be a
  new minimum (a small `currentMin` left almost no headroom before
  hitting the `Math.max(0, ...)` floor) — caught this by actually
  reading the sample prompts during smoke-testing, not just the pass/
  fail numbers. Fixed by only offering the "new minimum" branch when
  there's enough room below the current minimum, else always adding a
  new maximum instead. 1000/1000 hit rate after the fix, healthy
  variety in the sample prompts on the retest.

**Note for future batches**: a hit-rate check confirms the challenge
branch fires, but doesn't catch a branch that fires "too easily" into a
degenerate case (like everything collapsing to a score of 0) — always
eyeball a handful of actual sample prompts during smoke-testing, not
just the pass-rate number.

Score distribution now `{ '0': 11, '1': 74 }` — 74 topics left. All 85
still at least the Round-19 gold bar.

### Round 20, batch 5 — 3 more: whole-number addition/subtraction + same-denominator fractions
`...001` (Tambah Dalam Lingkungan 100,000, Y4), `...020` (Tolak Nombor
Bulat Hingga 100000, Y4), `...002` (Tambah Pecahan Penyebut Sama, Y4) —
all wired end-to-end, smoke-tested at 1000x, re-verified via the real
dispatcher across all 18 template configs (300x each, 100% pass).

- **`...001`/`...020`**: two/three sequential events (two deliveries
  arrive; two sales happen), question asks for the running total/
  remainder after all of them — same "don't stop after the first hop"
  shape used throughout this round, applied to plain whole-number add/
  subtract for the first time. 1000/1000 hit rate both ways, no
  fallthrough needed for addition (any two numbers work); subtraction
  guards against the rare case where there's nothing meaningful left
  after the first deduction to take a second one from.
- **`...002` fractions_same_denominator**: THREE same-denominator
  portions added in sequence (an extra portion eaten at "night" on top
  of "lunch" and "evening"), respecting the file's own documented
  constraint that every sum in this generator must stay a proper
  fraction (this generator explicitly never introduces improper
  fractions/mixed numbers, since the app has no mixed-number grading
  convention anywhere) — the third portion is only drawn small enough
  that the running total still fits under the denominator. 474/1000 hit
  rate (falls through often on tight denominators with little room left
  after two portions — acceptable, matches the same trade off as
  `...072` pie_chart from batch 3).

`...001` and `...020` also had a **pre-existing gap** worth noting: their
`classify.ts` cases had no guard at all for their existing reverseProblem
variant (a bug that predates this round, not introduced by it) — the
reverseProblem context uses different field names (`total` instead of
`correct` for addition, `remaining` instead of `correct` for
subtraction) that silently fell through to a generic hint. Fixed both
while adding the challenge guard, since it was directly adjacent code.

Score distribution now `{ '0': 14, '1': 71 }` — 71 topics left. All 85
still at least the Round-19 gold bar.

### Round 20, batch 6 — 3 more: Y5 division, Y6 multiplication, Y5 addition
`...025` (Bahagi Dengan Nombor 1 Digit, Y5), `...026` (Darab Nombor 4 Digit
Dengan Nombor 2 Digit, Y6), `...030` (Tambah Nombor Bulat Hingga 1,000,000,
Y5) — all wired end-to-end, smoke-tested at 1000x for pass rate + hit rate
(all three: 1000/1000 both), then re-verified via the real `generateQuestion`
dispatcher across all 18 template configs (300x each, 100% pass).

- **`...025` division**: same "regroup the same total into a different
  number of students" shape as `...022`, ported down to 1-digit divisors
  (dividend built as `divisor × divisor2 × k` for a guaranteed clean split
  both ways). 1000/1000 hit rate, no fallthrough needed.
- **`...026` multiplication**: same "daily-rate-then-project-to-a-
  different-day-count" shape as `...021`, ported up to Y6's 4-digit ×
  2-digit range. 1000/1000 hit rate.
- **`...030` addition**: same "second delivery arrives, don't stop after
  the first" shape as `...001`, ported up to Y5's 6-digit range. 1000/1000
  hit rate.

All three were straight ports of an already-solved Y4/Y5/2-digit shape to
a sibling Y5/Y6/1-digit topic — same "solve the hard design work once,
then port down/up" approach validated in batch 4.

**Bonus fix**: `...030`'s `classify.ts` case had the exact same
pre-existing gap batch 5 found in `...001`/`...020` — its reverseProblem
variant's context shape has `total` (no `correct` field), but the case
destructured `correct` unconditionally, so reverseProblem wrong-answers
silently fell through to a generic "add again" hint instead of the
correct "subtract back" one. Fixed while adding the challenge guard,
since it was directly adjacent code. Worth grep-checking any topic not
yet touched by this round for the same pattern before assuming its
classify case is complete.

Score distribution now `{ '0': 17, '1': 68 }` — 68 topics left. All 85
still at least the Round-19 gold bar.

### Round 20, batch 7 — 3 more: Y5 subtraction, Y6 add-three, Y6 round-number subtraction
`...031` (Tolak Nombor Bulat Hingga 1,000,000, Y5), `...032` (Tambah Tiga
Nombor Bulat, Y6), `...033` (Tolak Daripada Nombor Bulat, Y6) — all wired
end-to-end, smoke-tested at 1000x for pass rate + hit rate (all three
1000/1000 both), then re-verified via the real `generateQuestion`
dispatcher across all 18 template configs (300x each, 100% pass after
the errorSpotting fix below).

- **`...031` subtraction**: same "second deduction, keep going" shape as
  `...020`, ported up to Y5's 6-digit range. 1000/1000 hit rate, no
  fallthrough needed at these number sizes.
- **`...032` add-three-numbers**: rather than force a same-shape 3-number
  variant, extended the topic's own native skill — a genuinely FOURTH
  figure turns up after the three-month subtotal is computed, so the
  challenge exercises "don't stop at the taught three-number shape" on
  top of the three-number skill itself, not a different operation.
  1000/1000 hit rate, no fallthrough.
- **`...033` subtract-from-round-number**: designed carefully so BOTH
  hops actually exercise the topic's distinctive skill — phase 1 computes
  `target − produced1` (the cascading-zero-borrow this topic is about),
  phase 2 is an ordinary subtraction on that intermediate. First draft
  mislabeled which variable was "given" vs "computed" and would have
  skipped the borrow skill on the second hop entirely — caught by
  re-reading the prompt against the arithmetic before smoke-testing, not
  after. 1000/1000 hit rate once corrected.

**Two pre-existing bugs found and fixed while in this code**:
1. `...031`'s `classify.ts` case had the same gap batches 5/6 found
   elsewhere — its reverseProblem context has `remaining` (no `correct`),
   but the case destructured `correct` unconditionally. Fixed with a
   `remaining !== undefined` guard, same pattern as before.
2. **New bug family, distinct from the classify gaps**: `wholeNumbersAdditionY6.ts`
   and `wholeNumbersSubtractionY6.ts`'s `errorSpotting` branches were
   missing the mandatory options-padding loop entirely (documented in
   this file's own "Architecture patterns" section as a MUST) — they
   returned only 2 raw options (correct + 1 distractor) via
   `shuffleOptions`, which does not pad. This had been silently failing
   the "3+ unique options" contract in production since these two
   generators were first written, not something introduced by this
   batch. Caught by the batch's own smoke test (0/300 pass on both
   templates) rather than by inspection — worth remembering that the
   full-dispatcher re-verify step catches bugs in *untouched* templates
   on a topic too, not just the ones being changed. Fixed both by adding
   the standard padding loop; re-verified 300/300 after.

Score distribution now `{ '0': 20, '1': 65 }` — 65 topics left. All 85
still at least the Round-19 gold bar.

### Round 20, batch 8 — 3 more: Y4 fraction subtraction, Y4 & Y5 decimal add/subtract
`...034` (Tolak Pecahan Penyebut Sama, Y4), `...035` (Tambah & Tolak
Perpuluhan 1dp, Y4), `...005` (Tambah & Tolak Perpuluhan, Y5) — all wired
end-to-end, smoke-tested at 1000x for pass rate + hit rate (all three
1000/1000 both), then re-verified via the real `generateQuestion`
dispatcher across all 18 template configs (300x each, 100% pass).

- **`...034` fraction subtraction**: same "three portions, don't stop
  after two" shape as `...002` (fractions_same_denominator's addition
  challenge), ported to subtraction — a second slice is eaten after the
  first, asking what's left after both. Falls through to the base case
  on the rare draw where nothing's left after the first bite for a
  second bite to come from. 1000/1000 hit rate.
- **`...035` / `...005` decimal add/subtract**: same "third
  session/item, keep going" shape as `...001`/`...030`'s addition
  chains, ported to 1dp running-distance and 2dp shopping contexts
  respectively (reusing each topic's own existing word-problem framing
  rather than inventing a new scenario). Both 1000/1000 hit rate, no
  fallthrough needed since a third decimal draw is always well-formed.

**Scope note, not fixed this batch**: both decimal `classify.ts` cases
(`decimal_add_subtract` and `decimal_add_subtract_y4`) turned out to be
far more simplistic than every other case in this file — they don't
destructure `question.context` at all and always return the same
generic `decimal_point_misalignment` hint regardless of what the actual
mistake was, for base/errorSpotting/reverseProblem alike. This is a
pre-existing simplification, not something introduced by this batch.
Added a proper `finalTotal !== undefined` challenge guard to each (so
the new challenge-tier questions at least get a correct hint), but did
NOT expand these into full context-aware classify cases for the
base/reverseProblem paths too — that's a real gap worth a dedicated
pass, but it's a different kind of fix (retrofitting an under-built
classify case) than this round's actual mandate (adding challenge
branches), and doing it as a drive-by here risked scope creep without
the same 1000x verification rigor the rest of this file gets. Flagging
for a future batch rather than quietly leaving it undiscovered.

Score distribution now `{ '0': 23, '1': 62 }` — 62 topics left. All 85
still at least the Round-19 gold bar.

### Round 20, batch 9 — 3 more: perimeter, area, circumference (measurement→cost)
`...004` (Perimeter Bentuk Mudah, Y4), `...011` (Luas Segi Empat Tepat &
Segi Empat Sama, Y4), `...018` (Lilitan Bulatan, Y6) — a new shape family
for this round: the topic's own measurement skill (perimeter/area/
circumference) feeds into a real cost calculation via a cost-per-unit
rate, rather than a second measurement step. All three reused an example
scenario already sitting in the topic's own `explanation` text (Pak Ali's
fencing, the grass-planting plot, the circular pond needing a fence) —
no new framing invented. All wired end-to-end, smoke-tested at 1000x for
pass rate + hit rate (all three 1000/1000 both — no fallthrough needed,
since a random cost-per-unit rate is always well-formed), then
re-verified via the real `generateQuestion` dispatcher across all 18
template configs (300x each, 100% pass).

- **`...004` perimeter → fencing cost**: perimeter × cost-per-metre.
  Distractor: stops at the perimeter itself (`RM${perimeter}`), forgetting
  to price it.
- **`...011` area → grass cost**: area × cost-per-square-metre. Same
  distractor shape.
- **`...018` circumference → fencing cost**: circumference × cost-per-
  metre, reusing the circular-pond example already in this topic's
  explanation almost verbatim.

All three classify.ts cases needed the same fix before adding the
challenge guard: they destructured `{ length, width, correct }` (or
`{ radius, correct }`) unconditionally with no reverseProblem/challenge
context check at all — for the challenge branch specifically this would
have meant `correct` reading as `undefined` and the mistake hint always
falling through to a generic "try again" message. Added a
`totalCost !== undefined` guard before the unconditional destructure in
all three, following the same pattern used everywhere else in this file.

Score distribution now `{ '0': 26, '1': 59 }` — 59 topics left. All 85
still at least the Round-19 gold bar.

### Round 20, batch 10 — 3 more: liquid volume, triangle area, circle area
`...010` (Isipadu Cecair, Y6), `...016` (Luas Segi Tiga, Y6), `...019`
(Luas Bulatan, Y6) — all wired end-to-end, smoke-tested at 1000x for
pass rate + hit rate (all three 1000/1000 both), then re-verified via
the real `generateQuestion` dispatcher across all 18 template configs
(300x each, 100% pass after the volume errorSpotting fix below).

- **`...010` volume**: a genuine second event — poured IN, then poured
  OUT — rather than the measurement→cost family (this topic is already
  about combining two quantities, so the natural TP6 step is a third
  quantity/event, matching `...001`/`...030`'s sequential-events shape).
  1000/1000 hit rate; `mlC` draw is bounded so a valid pour-out amount is
  always available, no fallthrough needed.
- **`...016` / `...019` triangle & circle area**: continued the
  measurement→cost family from batch 9 — area × cost-per-square-
  centimetre, framed as buying cloth / covering a tabletop with canvas
  (both already the topic's own explanation scenario). Both 1000/1000.

**Third occurrence of the missing-options-padding bug**, this time in
`volume.ts`'s errorSpotting branch — same family first caught in batch 7
(`wholeNumbersAdditionY6`/`wholeNumbersSubtractionY6`). Pre-existing,
caught by the batch's own dispatcher smoke test (0/300) on an untouched
template, not by inspection. Fixed with the same padding-loop pattern.
Worth explicitly checking every `errorSpotting` branch across the
remaining ~56 topics for this exact shape before assuming it's fine —
three unrelated generators have now shipped with it, so it's likely not
the last.

All three classify.ts cases needed the same context-guard fix already
routine by this point: unconditional `{ ..., correct }` destructure with
no check for the new challenge context shape, fixed by adding a
`totalCost`/`finalMl` guard before it, following the established pattern.

Score distribution now `{ '0': 29, '1': 56 }` — 56 topics left. All 85
still at least the Round-19 gold bar.

### Round 20, batch 11 — 3 more: money add/subtract, money multiply/divide, decimal multiply
`...039` (Tambah & Tolak Wang, Y4), `...040` (Darab & Bahagi Wang, Y4),
`...036` (Darab Perpuluhan, Y5) — all wired end-to-end, smoke-tested at
1000x for pass rate + hit rate (all three 1000/1000 both), then
re-verified via the real `generateQuestion` dispatcher across all 18
template configs (300x each, 100% pass).

- **`...039` money add/subtract**: same "third item, keep going" shape as
  `...001`/`...005`/`...035`'s addition chains, ported to a Malaysian
  shopping-list context (sayur/ikan/beras/buah-buahan/roti).
- **`...040` money multiply/divide**: same "rate, then project to a
  DIFFERENT quantity" shape as `...021`/`...026`'s daily-rate-projection,
  ported to a unit-price context (buy N items, then asked about a
  different quantity M at the same unit price).
- **`...036` decimal multiply**: same shape again, ported to a
  bottles-of-liquid context already sitting in the topic's own
  explanation text.

**Proactive bug sweep, prompted by batch 10's note that 3 unrelated
generators had now shipped with the missing-options-padding bug.**
Wrote a quick awk scan across every `generators/*.ts` file for
`if (errorSpotting)` blocks with no `while (question.options...` padding
loop before their `return`. It flagged ~19 hits across many files;
triaged by shape rather than fixing blind:
- `decimals.ts`'s 4 hits were FALSE POSITIVES — that file already has
  its own `finalizeOptions()` helper that pads internally, the scan just
  doesn't recognize that pattern.
- `money.ts`'s 6 hits (across 5 `if (errorSpotting)` blocks — `money_
  multiply_divide` has two separate `return`s, multiply and divide) were
  ALL REAL: `money_add_subtract`, `money_multiply_divide` (both
  branches), `simple_interest`, `profit_loss`, `discount`. Fixed all six
  with the standard padding loop, whether or not the topic got a
  challenge branch this batch (`simple_interest`/`profit_loss`/
  `discount` — topics `...041`/`...042`/`...050` — did NOT get challenge
  branches this batch, just the padding fix).
- Did NOT triage the remaining ~9 hits (angles/coordinates/likelihood/
  linePair/primeComposite/writeRatio/time) this batch — those are mostly
  small-fixed-label classification questions (e.g. "acute"/"obtuse"/
  "right") that plausibly don't need numeric padding at all, unlike the
  quantity-based money/decimal/whole-number generators where every
  confirmed hit so far has been real. Worth a dedicated triage pass
  before assuming they're fine, but distinguishing "fine by design" from
  "actually broken" for each needs reading the surrounding code, not
  just the awk signal — flagging rather than rubber-stamping.

Both classify.ts cases (`money_add_subtract`, `money_multiply_divide`)
were the same bare generic-fallback shape found in batch 8's decimal
cases (no context destructuring, one hint for everything). Added proper
challenge guards to both (imported `formatRM` from money.ts into
classify.ts for this), same scope decision as batch 8: fix the new
challenge path properly, leave the pre-existing base/reverseProblem
under-specification as a flagged gap rather than a drive-by rewrite.

Score distribution now `{ '0': 32, '1': 53 }` — 53 topics left. All 85
still at least the Round-19 gold bar.

### Padding-bug triage — finished the sweep batch 11 started
Went back through the ~9 untriaged hits from batch 11's awk scan
(anglesClassify/coordinates/fractions/insuranceTakaful/likelihood/
linePairClassify/primeComposite/writeRatio, plus assetLiability caught
in the same pass) before starting new topics, per that batch's own
note. Read each block's actual code rather than trusting the signal:

- **Real bugs, fixed**: `angles_classify`'s errorSpotting only offered 2
  options (`obtuse`/`right`) when there are 4 valid angle-type labels —
  now draws a third distinct type. `write_ratio`'s errorSpotting only
  offered 2 options with no padding — added the standard loop. (`time_
  duration`'s errorSpotting was also real and fixed in the same pass,
  found while re-scanning `time.ts` for the batch 12 work below — same
  missing-padding shape.)
- **False positives, no fix needed**: `assetLiability`, `insuranceTakaful`
  (genuine binary classification, 2 options is correct by design),
  `likelihood`, `linePairClassify`, `primeComposite` (all draw from a
  small FIXED label set via `.filter(r => r !== correct)`, always
  produces the full remaining set, no padding possible or needed),
  `fractions.ts`'s same-denominator addition (always yields exactly 2
  unique numeric distractors by construction, no collision possible).
- **Different bug, flagged not fixed**: `coordinates.ts`'s errorSpotting
  has an outer `if (wrongAnswer !== correct)` guard with no `else` —
  when the point lies on the diagonal (x === y), the block silently
  falls through and returns whatever the base/word_problem logic
  produces instead of an actual error-spotting question. Rare (only
  diagonal grid points trigger it) and not the padding-bug family, so
  left as a flagged edge case rather than fixed inline this batch.

This confirms the padding bug is a real, recurring pattern specifically
in numeric-quantity generators (money/decimal/time/whole-number), not
in the small-fixed-label classification generators — worth remembering
that distinction so future scans can be triaged faster.

### Round 20, batch 12 — 3 more: decimal divide, simple interest, time add/subtract
`...037` (Bahagi Perpuluhan, Y5), `...041` (Faedah Mudah, Y5), `...043`
(Tambah & Tolak Masa, Y4) — all wired end-to-end, smoke-tested at 1000x
for pass rate + hit rate (all three 1000/1000 both), then re-verified
via the real `generateQuestion` dispatcher across all 18 template
configs (300x each, 100% pass).

- **`...037` decimal divide**: same "regroup the same total into a
  different number of pieces" shape as `...022`/`...025`, ported to
  decimals — a rope is cut into N pieces, then the SAME rope is re-cut
  into a different number of pieces. Built as `divisor1 × divisor2 × k`
  (in tenths) so it divides cleanly both ways by construction, matching
  the whole-number division challenge's approach.
- **`...041` simple interest**: didn't port an existing shape — instead
  turned the topic's own already-documented `commonMistakes` entry
  ("confuses principal with interest, reports the total instead of just
  the interest") into the actual challenge question: find the interest,
  then add it to the principal for the TOTAL amount in the account.
  Arguably a better fit than porting a foreign shape, since it's a
  mistake real students already demonstrably make on this exact topic.
- **`...043` time add/subtract**: same "third item, keep going" shape as
  the addition-chain family, ported to time — a third subject is studied
  after the first two, reusing the topic's own explanation-text scenario
  (Ahmad studying Maths then Science) almost verbatim, just extended by
  one subject.

Both `money.ts`'s `simple_interest` and `time.ts`'s `time_add_subtract`
classify.ts cases were the same bare generic-fallback shape found
repeatedly since batch 8 (no context destructuring, one hint for
everything) — added proper challenge guards to both, same scope
decision as before: fix the new challenge path, leave the pre-existing
base-case under-specification as a flagged gap. Had to export
`formatDurationNeutral` from `time.ts` (previously module-private) to
reuse it in classify.ts's new time_add_subtract guard — same pattern as
importing `formatRM` from `money.ts` in batch 11.

Score distribution now `{ '0': 35, '1': 50 }` — 50 topics left. All 85
still at least the Round-19 gold bar.

### Round 20, batch 13 — 3 more: profit/loss, length add/subtract, discount
`...042` (Untung dan Rugi, Y6), `...044` (Tambah & Tolak Panjang, Y4),
`...050` (Diskaun, Y6) — all wired end-to-end, smoke-tested at 1000x for
pass rate + hit rate (all three 1000/1000 both), then re-verified via
the real `generateQuestion` dispatcher across all 18 template configs
(300x each, 100% pass after the pluralization fix below).

- **`...042` profit/loss**: same "rate, then project to a quantity" shape
  as `money_multiply_divide`/`decimal_multiply` — per-item profit/loss is
  known, question asks about the total across several identical items
  sold, not just one.
- **`...044` length add/subtract**: same "third piece, keep going" shape
  as `time_add_subtract`/the addition-chain family, ported to length — a
  third piece is joined after the first two.
- **`...050` discount**: a genuinely different, real-world non-routine
  shape — a SECOND, stacked discount applied to the already-discounted
  price (not the original). The natural non-routine mistake here is
  adding the two percentages into one flat discount off the original
  price, which is qualitatively different from a "stopped at the first
  step" mistake — both distractors are offered (stopped-at-first-discount,
  and added-the-percentages).

**Bug introduced and caught by the batch's own sample-prompt read, not
by the pass-rate number**: `profit_loss`'s challenge branch was the
first place in that generator that ever needed a plural noun form (base/
errorSpotting/reverseProblem all talk about one item at a time); reusing
the existing `itemsEn` map with naive `${itemsEn[item]}s` concatenation
produced "watchs" for the watch item. Added a proper `itemsEnPlural` map
and fixed it — 1000/1000 pass rate would never have caught this since
it's a grammar defect, not a correctness one, which is exactly why this
project's process insists on reading sample prompts, not just checking
the pass/hit numbers.

**Flagged, not fixed**: while reading discount's sample prompts, noticed
its pre-existing base-case word_problem wording ("A shoes costs RM54")
mishandles the one item in its list that's inherently plural in English
("kasut" → "shoes"). This predates this batch — the challenge branch
reused the exact same wording pattern already established by the base
case rather than introducing a new one. Didn't fix it here since it
would mean auditing every generator's items list for singular/plural-
safe English wording, which is a separate, broader cleanup than this
round's mandate.

Both `length.ts`'s `length_add_subtract` and `money.ts`'s `profit_loss`/
`discount` classify.ts cases needed the now-familiar guard: unconditional
context destructure with no check for the new challenge shape. Fixed all
three following the established pattern; `discount`'s base case was
already properly context-aware (unlike several other money.ts cases
found in this state in batches 8/11/12), so only the challenge guard was
needed there, not a full rebuild.

Score distribution now `{ '0': 38, '1': 47 }` — 47 topics left, just
under 45% still to go. All 85 still at least the Round-19 gold bar.

### Round 20, batch 14 — 3 more: time duration, simplify ratio, fraction multiply
`...007` (Waktu dan Masa, Y5), `...009` (Nisbah Mudah, Y6), `...054`
(Darab Pecahan, Y5) — all wired end-to-end, smoke-tested at 1000x for
pass rate + hit rate, then re-verified via the real `generateQuestion`
dispatcher across all 18 template configs (300x each, 100% pass).

- **`...007` time duration**: same "second class, keep going" shape as
  the addition-chain family, framed as a schedule (this topic's own
  daily-life shape) — a second class starts right after the first ends.
  1000/1000 hit rate.
- **`...054` fraction multiply**: same "rate, then project to a
  DIFFERENT quantity" shape as the whole-number/money/decimal
  multiplication challenges — per-loaf flour amount known, question asks
  about a different number of loaves. 1000/1000 hit rate.
- **`...009` simplify ratio**: a different shape from either family —
  share a total in a ratio to find BOTH actual parts, then find the
  DIFFERENCE between them (a genuine second hop past the topic's own
  reverseProblem skill, not a repeat of it).

**Caught by the batch's OWN hit-rate check, not by a separate audit**:
`...009`'s first draft used a `simplifiedA !== simplifiedB` guard and
fell through to the (non-challenge) base case whenever that was false —
which, since `baseA`/`baseB` are drawn independently from 1-6, happens
~1 in 6 times (matches observed 824/1000 hit rate almost exactly). That
fallback rate is far higher than every other challenge branch shipped
so far (which fall through only on genuine edge cases, <1% of draws),
so it wasn't treated as an acceptable "rare degenerate case" — fixed by
resampling locally within the challenge branch (bounded retry loop)
until the ratio parts differ, instead of silently downgrading to a
different question type. Re-verified at 1000/1000 after the fix. Worth
noting as a threshold: a documented fallback is fine when it's a true
edge case (a handful of batches have used this pattern safely), but a
~17% fallback rate means the challenge template just doesn't reliably
test the challenge skill — that's a bug, not a documented exception.

Both `time.ts`'s `time_duration` and `lib/questions/generators/ratio.ts`'s
`simplify_ratio` classify.ts cases got the now-standard challenge guard
before their existing checks. `fractions_multiply`'s case needed the
guard placed carefully since its reverseProblem check itself relies on
`correctNum`/`correctDenom` being defined — added an explicit
`!== undefined` check there so the challenge context (which has neither
field) doesn't fall through into a broken reverseProblem branch first.

Score distribution now `{ '0': 41, '1': 44 }` — 44 topics left, just
under half the curriculum done. All 85 still at least the Round-19 gold
bar.

### Round 20, batch 15 — 3 more: angles on a straight line, area of composite shapes, sum of angles in a triangle
`...012` (Sudut Pada Garis Lurus, Y5), `...013` (Luas Bentuk Gubahan, Y5),
`...014` (Jumlah Sudut Dalam Segi Tiga, Y6) — all wired end-to-end,
smoke-tested at 1000x for pass rate + hit rate (all three 1000/1000
both), then re-verified via the real `generateQuestion` dispatcher
across all 18 template configs (300x each, 100% pass).

- **`...012` angles on a straight line**: extends the base two-angle
  case to THREE angles on the line, where the second is a multiple of
  the third. Genuine second hop past the existing reverseProblem (which
  only ever used a difference between two angles): subtract the given
  angle from 180 degrees to get the combined remainder, THEN split that
  remainder by the ratio to isolate the smallest angle.
- **`...014` sum of angles in a triangle**: an isosceles triangle, given
  only the apex angle — find each of the two equal base angles. Same
  two-hop shape (subtract from 180 degrees, then divide by the count)
  applied to a genuinely different triangle case than reverseProblem's
  "third angle given the other two."
- **`...013` area of composite shapes**: a deliberately different shape
  from every existing branch — SUBTRACTION instead of addition. A
  rectangular pond cut out of the middle of a rectangular garden; find
  the remaining (non-pond) area. Every other branch here teaches "split
  into rectangles and ADD"; this is the "cut a shape OUT and SUBTRACT"
  variant, matching the discount topic's precedent (batch 13) for using
  a genuinely different shape rather than porting an existing one.

No bugs found this batch — all three generators clean on first
implementation (1000/1000 pass+hit, no fallback-rate issues, no
plural/wording defects on sample-prompt read).

All three `classify.ts` cases (`angles_straight_line`, `area_composite`,
`angles_triangle_sum`) got the now-standard challenge guard, checking a
distinguishing context field (`multiple`, `outerArea`, `apex`
respectively) before falling through to the existing base-case
destructure — same pattern as `area_triangle`/`circumference`'s
`totalCost` guard.

Score distribution now `{ '0': 44, '1': 41 }` — 41 topics left, just
over half the curriculum done. All 85 still at least the Round-19 gold
bar.

### Round 20, batch 16 — 3 more: angles at a point, combined operations, converting units of length
`...017` (Sudut Pada Satu Titik, Y5), `...027` (Operasi Bergabung Tanpa
Kurungan, Y6), `...045` (Tukar Unit Panjang, Y4) — all wired end-to-end,
smoke-tested at 1000x for pass rate + hit rate (all three 1000/1000
both), then re-verified via the real `generateQuestion` dispatcher
across all 18 template configs (300x each, 100% pass).

- **`...017` angles at a point**: ports the batch 15 "one angle given,
  other two in a ratio" shape from the straight-line case to the
  360°-total point case. Base skill and reverseProblem both give TWO of
  the three angles directly; the challenge gives only ONE, requiring
  (1) subtract from 360° THEN (2) split the remainder by the ratio.
- **`...027` combined operations without brackets**: extends the base
  "a + b×c" (one multiplication term) to "a + b×c + d×e" (two
  multiplication terms to evaluate and combine) — a real second gift on
  top of the first, so stopping after the first multiplication or
  forgetting to multiply the second term are both genuine, distinct
  wrong answers rather than a repeat of the base left-to-right mistake.
- **`...045` converting units of length**: a COMPOUND measurement ("4 m
  13 cm" converted entirely to cm) — the base generator only ever
  converts a single clean quantity. Genuine second hop: (1) convert the
  big-unit part, THEN (2) add the small-unit remainder; skipping either
  gives a distinct classic wrong answer (forgot the remainder / forgot
  to convert at all). `unit_convert` is shared across 5 topics
  (045-049, differing only by `pairs` config) — only 045 got the
  challenge template this batch, following the established one-topic-
  at-a-time rollout pattern for shared generators; 046-049 remain open
  for a future batch (same generator, no new code needed, just add the
  template + config to each topic).

No bugs found this batch — all three generators clean on first
implementation (1000/1000 pass+hit, no fallback-rate issues, no
plural/wording defects on sample-prompt read).

All three `classify.ts` cases (`angles_at_point`, `mixed_operations`,
`unit_convert`) got the now-standard challenge guard, checking a
distinguishing context field (`multiple`, `d`, `smallRemainder`
respectively) before falling through to the existing base-case
destructure.

Score distribution now `{ '0': 47, '1': 38 }` — 38 topics left, over
half the challenge-tier rollout done. All 85 still at least the
Round-19 gold bar.

### Round 20, batch 17 — 3 more: converting units of mass, volume of liquid, time (all `unit_convert`, zero new generator code)
`...046` (Tukar Unit Jisim, Y5), `...047` (Tukar Unit Isipadu Cecair,
Y5), `...048` (Tukar Unit Masa, Y4) — the challenge branch for
`unit_convert` already existed from batch 16 (topic `...045`), so this
batch was pure template wiring: added a `challenge: true` config to
each topic's `questionTemplates` using that topic's own `pairs`.
Smoke-tested at 500x per template across all 15 templates on the three
topics (100% pass), plus `classifyMistake` sanity-checked on every
challenge sample.

**Bug found and fixed during smoke-test review**: the batch 16
`unit_convert` challenge sentence was hardcoded as "the length of a
piece of wood is X big Y small" regardless of unit kind — so mass,
volume, and duration pairs produced nonsense ("a piece of wood is 2 kg
71 g", "a piece of wood is 1 wk 4 day"). This wasn't caught in batch 16
because topic 045 (length) was the only one exercising it and length
happens to match the hardcoded wording. Fixed by adding a `unitKind`
lookup (covering all 11 pairs used across every unit-conversion topic:
length/mass/volume/duration) and a `compoundSubject` map, reusing the
verb phrasing already in `measurePhrase`. Re-verified all four kinds
(length/mass/volume/duration) read naturally after the fix — this is
the kind of bug the "read the sample prompts, don't just check
pass/hit counts" step in the smoke test is specifically for; worth
remembering for any future generator that's shared across topics with
different real-world units.

`unit_convert` now has the challenge template on 4 of its 5 topics
(045-048); `...049` (Tukar Unit Masa Lanjutan — hr/min, yr/mth, dec/yr,
c/dec) is the last one left, same zero-new-code wiring next time.

Score distribution now `{ '0': 50, '1': 35 }` — 35 topics left, well
past the halfway mark. All 85 still at least the Round-19 gold bar.

### Round 20, batch 18 — 3 more: converting units of time (advanced), percentage of a quantity, converting fractions and percentages
`...049` (Tukar Unit Masa Lanjutan, Y5), `...052` (Peratus Suatu
Kuantiti Asas, Y4), `...053` (Tukar Pecahan dan Peratus, Y4).
Smoke-tested at 1000x for the challenge branch on each generator (all
1000/1000), then re-verified via the real `generateQuestion` dispatcher
across all 17 template configs (400x each, 100% pass), plus
`classifyMistake` sanity-checked on every challenge sample.

- **`...049`**: zero new code — same `unit_convert` compound-measurement
  challenge from batches 16-18, just added the template with this
  topic's own `pairs` (hr/min, yr/mth, dec/yr, c/dec). `unit_convert`
  now has the challenge template on all 5 of its topics (045-049) —
  that generator's rollout is complete.
- **`...052`**: zero new code — `percentage_of_quantity`'s cascading-
  percentage challenge branch (two sequential percentage cuts, second
  cut off the REMAINDER not the original) and its `classify.ts` guard
  already existed from an earlier round (built for topic `...006`,
  which shares the same generator) but had never been wired into
  `...052`'s own `questionTemplates`. Pure template wiring.
- **`...053`**: genuine new generator work. The base skill converts a
  fraction to a percentage by scaling the denominator to 100; the
  challenge gives the fraction UNSIMPLIFIED with a denominator that
  does NOT divide evenly into 100 (e.g. 42/50 stays fine, but something
  like 51/75 needs simplifying to 17/25 before the taught method
  applies at all). Genuine second hop: (1) simplify to lowest terms,
  THEN (2) scale the simplified denominator to 100. Distractors: used
  the unsimplified numerator directly, or tried scaling the
  unsimplified denominator with a rounded (wrong) factor. Also gave the
  existing `fractions_percentage_convert` classify.ts case (previously
  a single generic fallback with no context destructuring at all) its
  first real challenge guard.

No bugs found this batch — all clean on first implementation. Also
reinstalled `node_modules` this session (had been stripped for the
batch-17 zip export) — worth remembering that `npx tsc --noEmit` will
throw a wall of unrelated "Cannot find module" errors if `node_modules`
isn't present; that's an environment issue, not a code regression, and
`npm install` clears it immediately.

Score distribution now `{ '0': 53, '1': 32 }` — 32 topics left, nearly
two-thirds of the challenge-tier rollout done. All 85 still at least
the Round-19 gold bar.

### Round 20, batch 19 — 3 more: converting decimals and percentages, adding & subtracting percentages, proportion to find a value
`...055` (Tukar Perpuluhan dan Peratus, Y5), `...056` (Tambah & Tolak
Peratus, Y6), `...058` (Perkadaran Untuk Cari Nilai, Y5) — all genuine
new generator work this batch. Smoke-tested at 1000x for the challenge
branch on each (all 1000/1000), then re-verified via the real
`generateQuestion` dispatcher across all 18 template configs (400x
each, 100% pass), plus `classifyMistake` sanity-checked on every
challenge sample.

- **`...055` decimals and percentages**: two decimal scores from two
  attempts at the same test — find the percentage-POINT improvement.
  Genuine second hop past the base skill (single conversion) and
  reverseProblem (convert-then-complement): (1) subtract the two
  decimals, THEN (2) convert the difference to a percentage.
  Distractors: subtracted but forgot to convert to %, or converted the
  second score alone and ignored the first attempt.
- **`...056` adding & subtracting percentages**: THREE chained
  percentage changes (price rises twice, then falls once) instead of
  two. Genuine second hop: combine the first two, then apply the third
  — stopping after the first two rises or skipping the middle value are
  both distinct classic wrong answers.
- **`...058` proportion**: extends the base two-part ratio (cats:dogs)
  to a THREE-part ratio (cats:dogs:rabbits) given only the TOTAL, not a
  directly-known part. Genuine second hop: (1) sum all three ratio
  numbers to get total ratio units, THEN (2) divide the total by that
  to get the scale factor, THEN (3) multiply by the target's ratio
  number. Distractors: split the total evenly across 3 species
  (ignoring the ratio), or gave the whole total as the answer.

No bugs found this batch — all three generators clean on first
implementation, sample prompts read naturally on review.

All three `classify.ts` cases (`decimal_percentage_convert`,
`percentage_add_subtract`, `proportion`) got the now-standard challenge
guard. Worth noting: `decimal_percentage_convert` and
`percentage_add_subtract` previously had NO context destructuring at
all — every wrong answer on those two topics (across every existing
template, not just the new challenge one) fell through to one generic
hint. The challenge guard added real per-mistake hints for the new
branch; the base/reverseProblem/errorSpotting branches on those two
topics still share the old generic fallback, which is out of scope for
this batch but worth flagging for a future "hint quality" pass if one
ever happens.

Score distribution now `{ '0': 56, '1': 29 }` — 29 topics left.

### Round 20, batch 20 — 3 more: dividing a mixed number by a whole number, dividing a fraction by a fraction, dividing a mixed number by a fraction
`...057` (Bahagi Nombor Bercampur Dengan Nombor Bulat, Y6), `...062`
(Bahagi Pecahan Dengan Pecahan, Y6), `...063` (Bahagi Nombor Bercampur
Dengan Pecahan, Y6). Smoke-tested at 1000x for the challenge branch on
each (all 1000/1000), then re-verified via the real `generateQuestion`
dispatcher across all 18 template configs (400x each, 100% pass), plus
`classifyMistake` sanity-checked on every challenge sample.

All three reuse the "compound sharing" challenge shape that
`fractions_divide_by_whole` (a sibling topic in the same fraction-
division family) already had from an earlier round: the quotient from
the first division is itself divided AGAIN by a second whole number —
genuine second hop past both the base skill and reverseProblem, which
only ever do one division. Ported to each topic's own real-world frame:
- **`...057`**: flour/rice/sugar divided into containers, then each
  container's contents divided again into small bags.
- **`...062`**: paint/juice/oil filling bottles (fraction ÷ fraction),
  then all the filled bottles packed again into boxes.
- **`...063`**: ribbon/rope/wire cut into pieces (mixed ÷ fraction),
  then all the pieces shared again among students.

Same distractor shape throughout: "stopped after the first division"
(gave the intermediate quotient as the final answer). All three
`classify.ts` cases got the guard, checking `finalNum !== undefined`
before falling through to the existing base-case logic — same idiom as
`fractions_divide_by_whole`'s pre-existing guard, which this batch's
guards were modeled on directly.

No bugs found this batch — all three generators clean on first
implementation, sample prompts read naturally.

Score distribution now `{ '0': 59, '1': 26 }` — 26 topics left.

### Round 20, batch 21 — 3 more: invoice/receipt/service tax, interest and dividend, adding & subtracting time (bigger units)
`...059` (Invois, Resit, dan Cukai Perkhidmatan, Y6), `...060` (Faedah
dan Dividen, Y6), `...064` (Tambah & Tolak Masa - Unit Lebih Besar,
Y5) — all genuine new generator work. Smoke-tested at 1000x for the
challenge branch on each (all 1000/1000), then re-verified via the
real `generateQuestion` dispatcher across all 19 template configs
(400x each, 100% pass), plus `classifyMistake` sanity-checked on every
challenge sample.

- **`...059` service tax**: a discount is applied FIRST, then service
  tax is charged on the DISCOUNTED price — a real Malaysian retail
  order-of-operations non-routine skill. Genuine second hop past the
  base skill and reverseProblem (both only ever tax a given amount
  once): (1) subtract the discount, THEN (2) add tax calculated on
  the discounted price. Distractors: taxed the ORIGINAL price instead
  of the discounted one (classic order-of-operations slip), or stopped
  after the discount and forgot the tax entirely.
- **`...060` dividend**: shares in TWO different companies with
  DIFFERENT dividend rates — find the combined total. Genuine second
  hop past the base skill and reverseProblem (both only involve one
  company): find each company's dividend separately, then add.
  Distractors: stopped after the first company, or summed the share
  counts but only applied the first company's rate.
- **`...064` adding & subtracting time (bigger units)**: THREE
  durations chained (a building's age, then two separate renovations)
  instead of two. Genuine second hop past the base skill and
  reverseProblem (both only ever combine two durations): add the first
  two with regrouping, then add the third with regrouping again.
  Distractors: stopped after the first two additions, or added all
  three durations' big/small parts separately without ever regrouping
  the small-unit overflow.

No bugs found this batch — all three generators clean on first
implementation, sample prompts read naturally (checked the discount+tax
arithmetic and the three-way time addition by hand against samples).

All three `classify.ts` cases (`service_tax`, `dividend`,
`time_unit_add_subtract`) got the now-standard challenge guard,
checking a distinguishing context field (`discountPct`, `shares1`,
`cSmall` respectively) before falling through to the existing base-case
logic.

Score distribution now `{ '0': 62, '1': 23 }` — 23 topics left, nearly
three-quarters of the challenge-tier rollout done.

### Round 20, batch 22 — 3 more: asset and liability, distance between two coordinates, purchasing via cash or instalment
`...061` (Aset dan Liabiliti, Y6), `...065` (Jarak Antara Dua
Koordinat, Y6), `...067` (Beli Secara Tunai atau Ansuran, Y5) — all
genuine new generator work. Smoke-tested at 1000x for the challenge
branch on each (all 1000/1000), then re-verified via the real
`generateQuestion` dispatcher across all 20 template configs (400x
each, 100% pass), plus `classifyMistake` sanity-checked on every
challenge sample.

- **`...061` asset and liability**: a short list of items, each with a
  RM value — find the NET WORTH (assets minus liabilities). Genuine
  second hop past the base skill, reverseProblem, and word_problem (all
  three only ever COUNT items, never use a value): classify each item,
  sum the asset values, sum the liability values, then subtract.
  Distractors: added everything together instead of subtracting, or
  gave the asset total alone.
- **`...065` distance between two coordinates**: a two-leg L-shaped
  journey (vertical leg then horizontal leg) with a map scale — find
  the TOTAL real distance walked. Genuine second hop past the "scaled"
  branch (which only ever scales ONE grid distance): find each leg's
  grid distance, add them, THEN multiply by the scale. Distractors:
  stopped after the first leg, or added the grid distances but forgot
  to apply the scale at all.
- **`...067` purchasing via cash or instalment**: TWO different stores'
  instalment plans for the same item — find the price difference
  between the two plans. Genuine second hop past the base skill and
  reverseProblem (both only ever compare ONE instalment plan against
  cash, never two plans against each other): find each store's total,
  then subtract. Distractors: gave one store's total instead of the
  difference, or added both totals together.

One false alarm during this batch's own smoke-test review (not a code
bug): the scratch harness required every MCQ to have ≥3 options, but
`asset_liability`'s binary classification branches (`pool: "asset"`,
`pool: "liability"`, base `{}`, `errorSpotting`) have always
legitimately offered only 2 options (asset vs. liability) — that's
pre-existing and correct, not something this batch touched. Fixed the
harness's check, not the generator, and confirmed 400/400 across every
template afterward. Worth remembering for future smoke scripts touching
binary-classification generators (this one, `angles_classify`,
`likelihood`, `line_pair_classify`) — don't assume every MCQ needs 3+
options.

Also worth noting for `coordinate_distance`: the challenge context and
the existing "scaled" branch's context BOTH carry a `scaleUnitMeters`
field, so the `classify.ts` guard for the new challenge branch had to
be checked (via a more specific field, `leg1Grid`) BEFORE the existing
`scaleUnitMeters` check, not after — a preexisting field name collision
across branches that's worth checking for whenever adding a challenge
branch to a generator that already has other named branches.

Score distribution now `{ '0': 65, '1': 20 }` — 20 topics left, over
three-quarters of the challenge-tier rollout done.

### Round 20, batch 23 — 3 more: insurance and takaful, combined length and mass, time zones
`...068` (Insurans dan Takaful, Y6), `...069` (Panjang dan Jisim
Bergabung, Y6), `...073` (Zon Waktu, Y6) — all genuine new generator
work. Smoke-tested at 1000x for the challenge branch on each (all
1000/1000), then re-verified via the real `generateQuestion` dispatcher
across all 19 template configs (400x each, 100% pass), plus
`classifyMistake` sanity-checked on every challenge sample.

- **`...068` insurance and takaful**: a short list of plans, each with a
  coverage VALUE — find the TOTAL coverage of the TAKAFUL plans only.
  Genuine second hop past the base skill, reverseProblem, and
  word_problem (all three only ever COUNT plans, never use a value):
  classify each plan, then sum only the takaful ones' values. Same
  "classify + sum a subset" shape as `asset_liability`'s net-worth
  challenge from batch 22, ported to this topic's classification pair.
  Distractors: summed every plan's value (forgot to filter), or summed
  the wrong (insurance) group entirely.
- **`...069` combined length and mass**: TWO ropes, each with its own
  length and mass, are COMBINED and then cut into equal pieces. Genuine
  second hop past the base skill and reverseProblem (both only ever
  involve ONE rope): add the two ropes' lengths (or masses) together,
  THEN divide by the pieces. Distractors: used only Rope A's value
  (forgot to combine with Rope B), or answered with the other
  quantity's per-piece value (reusing the base's existing "mixed up
  which quantity" mistake).
- **`...073` time zones**: a flight departs one city at a given LOCAL
  time and takes several hours to reach another city — find the LOCAL
  ARRIVAL time. Genuine second hop past the base skill and both
  existing branches (which only ever apply a GMT offset to a
  stationary time): add the flight duration to departure time, THEN
  adjust for the GMT offset difference. Distractors: added the flight
  duration but forgot the timezone shift, or applied the timezone
  shift but forgot to add the flight duration.

No bugs found this batch — all three generators clean on first
implementation, sample prompts read naturally and arithmetic checked
by hand against samples (e.g. KL→Moscow flight: depart 08:00 GMT+8,
9hr flight, GMT+3 → land 12:00 local, confirmed correct).

All three `classify.ts` cases got the now-standard challenge guard,
each checked BEFORE the pre-existing branch logic using a distinguishing
context field (`totalTakaful`, `lengthACm`, `flightHours`
respectively).

Score distribution now `{ '0': 68, '1': 17 }` — 17 topics left, exactly
80% of the challenge-tier rollout done.

### Round 20, batch 24 — 3 more: combined length and volume, combined mass and volume, compound interest
`...070` (Panjang dan Isipadu Bergabung, Y6), `...071` (Jisim dan
Isipadu Bergabung, Y6), `...076` (Faedah Kompaun, Y5). Smoke-tested at
1000x for the challenge branch on each (all 1000/1000), then
re-verified via the real `generateQuestion` dispatcher across all 18
template configs (400x each, 100% pass), plus `classifyMistake`
sanity-checked on every challenge sample.

- **`...070`/`...071`**: directly ported the "combine two items, then
  divide" shape from `combined_length_mass` (topic 069, batch 23) to
  its two sibling generators in the same file — two gardens' hoses and
  fertiliser bottles combined for 070, two batters' flour and milk
  combined for 071. Same distractor shape both times: used only the
  first item's value (forgot to combine), or answered with the other
  quantity's per-piece value (reusing each generator's existing
  "mixed up which quantity" mistake).
- **`...076` compound interest**: find the interest earned in the FINAL
  year ALONE, not the total across all years. Genuine second hop past
  the base skill (total) and reverseProblem (year 1 alone): compound
  the amount through the earlier years first, THEN calculate just the
  final year's interest on that grown amount. Distractors: gave the
  total compound interest instead of isolating the final year, or
  calculated the final year's interest on the ORIGINAL principal
  instead of the grown amount. Hand-verified one sample by hand (RM700
  @ 8%: year 1 → RM756, year 2 interest = RM756 × 8% = RM60.48,
  matched the generator's output).

No bugs found this batch — all three clean on first implementation.
Worth noting for `compound_interest`'s `classify.ts` case: the new
challenge context and the existing reverseProblem context both carry a
`principalRM` field, so the challenge guard had to be checked BEFORE
the reverseProblem check (same field-collision pattern flagged in
batch 22 for `coordinate_distance` — worth checking for on every batch
now, not just when it's bitten before).

Score distribution now `{ '0': 71, '1': 14 }` — 14 topics left.

### Round 20, batch 25 — 3 more: volume of a cuboid, volume of composite shapes, perimeter of composite shapes
`...079` (Isi Padu Kuboid, Y4), `...080` (Isi Padu Bentuk Gubahan, Y5),
`...081` (Perimeter Bentuk Gubahan, Y5). Smoke-tested at 1000x for the
challenge branch on each (all 1000/1000), then re-verified via the
real `generateQuestion` dispatcher across all 18 template configs
(400x each, 100% pass), plus `classifyMistake` sanity-checked on every
challenge sample.

- **`...079` volume of a cuboid**: how many SMALL cuboid boxes fit
  exactly into a LARGE cuboid box? Genuine second hop past the base
  skill and reverseProblem (both only involve ONE cuboid): find the
  small box's volume, find the large box's volume, THEN divide.
  Distractors: gave the large box's volume directly (forgot to
  divide), or scaled by only ONE dimension's ratio (forgot the other
  two dimensions also scaled up).
- **`...080` volume of composite shapes**: ported `area_composite`'s
  batch-15 "subtraction instead of addition" shape to 3D — a
  rectangular storage compartment cut out of a solid cuboid block;
  find the remaining solid volume. Every other branch here teaches
  "split into cuboids and ADD"; this is the "cut a cuboid OUT and
  SUBTRACT" variant. Distractors: forgot to subtract the cut-out, or
  added it instead of subtracting.
- **`...081` perimeter of composite shapes**: a genuinely different
  geometric case from the base skill's key insight (a CORNER notch
  never changes a rectangle's perimeter) — a notch cut into the
  MIDDLE of one side instead, which DOES add to the perimeter (2× the
  notch's depth). This directly tests whether the student
  over-generalizes the base topic's own "notch doesn't matter" rule to
  a case where it doesn't apply — a rich, well-motivated non-routine
  distinction rather than just a bigger version of the same skill.
  Distractors: over-applied the corner-notch rule (gave the unchanged
  perimeter), or added the notch's WIDTH instead of its DEPTH.

No bugs found this batch — all three generators clean on first
implementation, sample prompts read naturally and the perimeter
arithmetic checked by hand (14m×11m rectangle, 3m-deep notch: 2×(14+11)
+ 2×3 = 50+6 = 56, matched the sample).

All three `classify.ts` cases got the now-standard challenge guard,
checked BEFORE the pre-existing branch logic using a distinguishing
context field (`boxesCount`, `bigVolume`, `notchDepth` respectively).

Score distribution now `{ '0': 74, '1': 11 }` — 11 topics left.

### Round 20, batch 26 — 3 more: interior angles of regular polygons, prime and composite numbers, 12-hour and 24-hour time
`...074` (Nombor Perdana dan Nombor Gubahan, Y6), `...075` (Sudut
Pedalaman Poligon Sekata, Y6), `...085` (Format 12 Jam dan 24 Jam, Y5).
Smoke-tested at 1000x for the challenge branch on each (all
1000/1000), then re-verified via the real `generateQuestion` dispatcher
across all 17 template configs (400x each, 100% pass), plus
`classifyMistake` checked on EVERY template's wrong answer this batch
(not just the challenge branch — see below).

- **`...075` interior angles of regular polygons**: a classic tiling
  problem — TWO different regular polygons meet at a common point;
  find the GAP angle needed to complete 360° around that point.
  Genuine second hop past the base skill and reverseProblem (both only
  ever involve ONE polygon): find each polygon's interior angle, add
  them, THEN subtract from 360°. Distractors: stopped after adding
  both angles (forgot the 360° subtraction), or used only one polygon.
- **`...074` prime and composite numbers**: how many PRIME numbers are
  there in a given range? Genuine second hop past the base skill and
  errorSpotting (both only ever classify ONE number): check every
  number in the range and count. Distractors: counted the composite
  numbers instead, or miscounted by one (a plausible boundary slip).
- **`...085` 12-hour and 24-hour time**: a two-leg bus journey WITH A
  TRANSFER — ride, wait through a layover, ride again — find the final
  arrival time. Genuine second hop past the existing reverseProblem
  (which already adds one duration to a departure time — itself a
  compound skill): add the first leg, THEN the layover, THEN the
  second leg. Distractors: stopped at the transfer station (forgot the
  layover and second leg), or added both legs but skipped the layover
  wait.

**Found and fixed a real pre-existing gap while adding `...085`'s
challenge**: `time_format_convert` had NO `classify.ts` case at all —
every wrong answer on ANY of its 6 existing templates (base to24/to12,
bus-schedule word problems, errorSpotting, reverseProblem) fell through
to the generic `"unknown"` mistakeType with a useless "check your
answer again" hint. Added a full case covering all of them: the
noon/midnight swap, added-12-to-a.m., forgot-to-add-12-for-p.m., and
wrong-a.m./p.m.-period mistakes for the base branches, plus the new
transfer-journey challenge. Verified with a stricter smoke check this
batch — classify EVERY template's wrong answer, not just the challenge
one, and flag any `"unknown"` result — confirming zero unknowns
remain on any of the three topics' templates. `to12String` had to be
exported from `time.ts` and imported into `classify.ts` to support this.

Also had to fix a copy-paste typo caught before the smoke run: the
Malay prompt for the new time_format_convert challenge briefly
duplicated the departure timestamp mid-sentence ("... penumpang" vs
"... ${to24String(...)} penumpang") — fixed before running any tests,
not a shipped bug.

Score distribution now `{ '0': 77, '1': 8 }` — 8 topics left.

### Round 20, batch 27 — 3 more: likelihood, reading pictographs, reading coordinates
`...051` (Kebarangkalian, Y6), `...077` (Membaca Piktograf, Y4),
`...024` (Membaca Koordinat, Y5). Smoke-tested at 1000x for the
challenge branch on each (all 1000/1000), then re-verified via the
real `generateQuestion` dispatcher across all 16 template configs
(400x each, 100% pass), plus `classifyMistake` checked on every
template's wrong answer (not just the challenge branch).

- **`...051` likelihood**: WITHOUT REPLACEMENT — a marble is already
  picked and not put back, then ask about the likelihood of picking
  that same colour again. Genuine second hop past the base skill and
  errorSpotting (both only ever classify from a STATIC count): update
  the count after the first pick, THEN classify using the NEW counts.
  Distractor: classified using the ORIGINAL (pre-removal) counts — the
  single most natural non-routine mistake for this skill.
- **`...077` reading pictographs**: find the COMBINED total for TWO
  different sellers. Genuine second hop past the base "count" variant
  (one seller) and "difference" variant (subtract, not add): apply the
  key to each seller's icon count, then add both totals. Distractors:
  summed the icon counts directly (forgot the key entirely), or
  stopped after converting just the first seller.
- **`...024` reading coordinates**: find the MIDPOINT between two
  named points, given as coordinates in the question text — no diagram
  needed, following `coordinate_distance`'s precedent for text-based
  challenge scenarios on diagram-dependent topics. Genuine second hop:
  add both x-values and halve, then do the same for y. Distractors:
  added but forgot to halve, or used only the first point.

**Bug caught and fixed during this batch's own smoke-test review**:
the coordinates challenge's random point generation could place point
B outside the stated `gridSize` bound (e.g. `gridSize: 10` but a
sampled y-coordinate of 11) — an off-by-construction bug in how the
delta and starting point were sized independently instead of jointly.
Fixed by picking the delta first and bounding the starting point
against it, verified the fix keeps every coordinate within
`gridSize - 1` for all three gridSize configs in use (6, 10, 12) with
a re-run smoke check.

All three `classify.ts` cases (`likelihood`, `pictograph`,
`coordinates`) got the now-standard challenge guard, checked before
the pre-existing branch logic using a distinguishing context field
(`newCountA`, `variant === "challenge"`, `x1` respectively).

Note: `coordinates`' challenge is only wired on topic `...024` (Y5,
gridSize 10) this batch — the sibling topic `...082` (Y4, same
generator, gridSize 6) shares the exact same code path and could get
the template added with zero new work in a future batch, same pattern
as the `unit_convert` staged rollout.

Score distribution now `{ '0': 80, '1': 5 }` — only 5 topics left.

### Round 20, batch 28 — 3 more: types of angles, reading coordinates (Y4), proportion — 83/85 DONE, 2 intentionally out of scope
`...015` (Jenis-Jenis Sudut, Y4), `...082` (Membaca Koordinat, Y4),
`...084` (Kadaran, Y4). Smoke-tested at 1000x for the challenge branch
on each (all 1000/1000), then re-verified via the real
`generateQuestion` dispatcher across all 16 template configs (400x
each, 100% pass), plus `classifyMistake` checked on every template's
wrong answer.

- **`...082`**: zero new code — same `coordinates` midpoint challenge
  from batch 27's topic `...024`, just wired onto this Y4 sibling with
  its own `gridSize: 6` config.
- **`...015` types of angles**: two angles lie on a straight line — given
  the FIRST angle's exact degree, classify the TYPE (not degree) of the
  SECOND angle. Text-based, no diagram. Genuine second hop past the
  base skill and errorSpotting (both only ever classify a directly-shown
  angle): subtract from 180°, THEN classify the result. Distractor:
  classified the FIRST (given) angle instead of computing and
  classifying the second one.
- **`...084` proportion**: TWO different items, each with its own group
  price — find the combined cost of new quantities of BOTH. Stays
  firmly within the Y4 unitary method (same skill, applied twice + a
  sum — no new maths content, just chained): find each item's one-item
  price, scale it, then add. Distractors: stopped after the first item,
  or skipped the unit step for both items (the base skill's own classic
  mistake, applied twice).

**Two topics intentionally left at score 1 (no challenge), not a gap**:
`...078` (Parallel and Perpendicular Lines) and `...083` (Ratio, Y4)
both have explicit code comments documenting a deliberate "no
higher-year concepts" scope boundary — `line_pair_classify.ts` states
outright that reversing this Y4 concept numerically is Y5/6 content,
and `write_ratio.ts` states that general a:b ratio comparison
(topic `...058`) and ratio simplification (topic `...009`, "Nisbah
Mudah") are explicitly OTHER topics' territory, both of which already
have challenge tiers from earlier rounds. Forcing a numeric non-routine
challenge onto either `...078` or `...083` would duplicate/conflict
with those already-covered topics and violate the scope boundary a
previous round deliberately encoded. Recommend leaving these two as-is
unless the DSKP curriculum boundary itself is revisited.

No bugs found this batch — all three generators clean on first
implementation.

Score distribution now `{ '0': 83, '1': 2 }` — Challenge-tier rollout
is functionally COMPLETE. The 2 remaining topics are an intentional,
documented exception, not unfinished work.

### Post-rollout: confirmed 078/083 are on par, and a UI change — collapsible Bidang sections
Two follow-ups after the batch 28 wrap-up:

1. **Confirmed `...078` and `...083` meet the same gold-standard bar as
   every other topic** — directly checked their live `tips`/`commonMistakes`/
   `questionTemplates` counts (3/4/5, same floor every other topic clears)
   plus `workedExample`/`howTo` presence. They're only missing the extra
   Challenge (TP6) question, by the documented scope decision — nothing
   about their base content quality is behind.

2. **`TopicYearBrowser.tsx`** (shared by `/learn` and `/practice`): each
   Bidang section (the 4 KSSR learning-area groupings within a year) now
   collapses into a dropdown/accordion instead of always showing every
   topic expanded. Tap the Bidang header to toggle it open/closed — a
   topic count and a rotating chevron sit on the header. The first
   section for the student's year starts open on load so the page isn't
   entirely collapsed; every other section starts closed. Nothing else
   changed — same topic cards, same year-tab picker, same styling tokens
   (`rounded-kite`, `shadow-card`, `ungu`) as the rest of the app.
   `tsc --noEmit` clean. (`npm run build` fails in this sandbox only
   because Google Fonts is unreachable — unrelated to this change,
   confirmed by checking the failure is 100% font-fetch errors in
   `app/layout.tsx`, nothing from the touched file.)

### Bug fix: diagrams and categorical-answer labels missing from Quiz, Exam, and the Learn tab
User-reported: the "Reading Coordinates" quiz and Learn tab showed no
grid image at all — just the question text. Investigating turned up a
much bigger, systemic issue than just this one topic.

**Root cause**: three separate components each independently
re-implement the "show a generated question" UI —
`QuestionPlayer.tsx` (`/practice`), `QuizPlayer.tsx` (`/quiz`), and
`ExamFlow.tsx` (`/exam`). Only `QuestionPlayer` ever got diagram
rendering added; the other two never got it ported over, and both
also independently missed rendering categorical MCQ answers (e.g.
`"equally_likely"`, `"perpendicular"`, `"asset"`) through their
bilingual display labels — showing the raw internal key instead. A
fourth spot, the parent-facing wrong-answer review
(`app/parent/child/[studentId]/page.tsx`), had the same raw-key label
bug too.

**Blast radius (confirmed via script, not guessed)**: 10 topics can
show a diagram — Types of Angles, Area of a Triangle, Angles at a
Point, Circumference of a Circle, Area of a Circle, Reading Bar
Graphs, Reading Coordinates, Reading Pie Charts, Reading Pictographs,
Parallel/Perpendicular Lines — and every one of them was silently
missing its diagram in Quiz and Exam mode. Roughly 7 more topics
(everything with a categorical MCQ answer) were showing raw storage
keys instead of translated labels in the same two modes, plus on the
parent review page.

**Fix — eliminated the whole bug class, not just patched the symptom**:
- Added `components/student/diagrams/QuestionDiagram.tsx`: single
  source of truth for "which component renders which `diagram.kind`".
  All three players now import this instead of keeping their own copy
  of the switch, so a new diagram kind (or a fix to an existing one)
  only ever needs to be added once.
- Added `components/student/OptionLabel.tsx`: same idea for MCQ option
  display — `OptionLabel` (bilingual label lookup) and
  `optionFontClass` (font-body for categorical, font-num for
  numeric/fraction), shared by all three players AND the parent
  review page.
- Refactored `QuestionPlayer.tsx` to use both shared pieces too (it
  had its own inline copies before — now there's exactly one copy of
  each, not four).
- Fixed `QuizPlayer.tsx`, `ExamFlow.tsx`, and
  `app/parent/child/[studentId]/page.tsx` to use them.
- Extracted the `diagram` union out of `GeneratedQuestion` into its own
  exported `DiagramSpec` type in `lib/questions/types.ts` so it can be
  reused outside the question-generation path.

**Learn tab now shows diagrams too**: extended `TopicContent`'s
`workedExample` (and `moreExamples`) shape with an optional `diagram`
field, and added one to all 11 topic entries that can show a diagram
(includes both `...024` and `...082`, the two "Reading Coordinates"
topics for Y5/Y4) — matching the exact numbers already in each
example's own problem/steps text, never a different illustrative
example. `LessonCard.tsx`'s Example tab renders it via the same shared
`QuestionDiagram` component.

**Verification**: `tsc --noEmit` clean throughout. A scripted check
confirmed: all 509 question templates across all 85 topics still
generate cleanly (no regression from the type change), all 11
worked-example diagrams carry the right data, and every diagram kind
any generator can actually produce is handled by `QuestionDiagram`
(zero unhandled kinds).

**Noted but not fixed (separate, smaller issue, flagged for later)**:
topic `...015`'s (Types of Angles) worked-example step text reads
"the angle crosses but has no square marker (□)" — that phrasing
belongs to the line-pair topic's diagram (two crossing lines), not a
single angle wedge, and looks like a copy-paste artifact from an
earlier round. Doesn't affect correctness (the numbers/answer are
right) but the step reads oddly next to the actual angle diagram now
shown. Worth a follow-up content fix.

### New: public marketing homepage at "/"
`app/page.tsx` used to be a 3-line unconditional redirect to
`/dashboard` — there was no page a parent or student could land on
before logging in. Built out per the homepage redesign brief (v2):
positions Congak as "AI Math Coach for Malaysian Primary Students"
rather than a worksheet site, for both the student and parent audience
the brief calls out.

**New files**:
- `lib/content/homepageCopy.ts` — all bilingual marketing copy, kept
  separate from `lib/i18n/dictionary.ts` (UI) since none of it is
  reused elsewhere, same reasoning UI's own file header already gives
  for content-specific text.
- `components/home/Homepage.tsx` — the actual page: nav, hero (mascot +
  floating streak/XP chips instead of a worksheet image), trust
  checklist, 3 value-prop cards, Meet Pintar AI (with a small mocked
  chat exchange), gamification cards, a parent-dashboard preview built
  from the same visual language as the real one (mastery bars, weak-
  topic chip), a How It Works stepper using the `.benang-trail` kite-
  string motif from `globals.css` (defined a while back, never actually
  used anywhere until now), a "By the Numbers" stat strip, and a final
  CTA.
- `app/page.tsx` now checks auth server-side: no session → render the
  new homepage; a `students` row for this user → `/dashboard`; a
  `parent_links` row → `/parent/dashboard`; logged in but neither
  (mid-signup) → `/profile/setup`. Same two lookups the real dashboard
  pages already use to tell student vs. parent apart, so this can't
  drift out of sync with how auth actually works elsewhere.

**Two intentional departures from the brief's copy, both for
honesty, documented in `homepageCopy.ts`'s header comment**:
- "Thousands of questions" → "Unlimited practice questions". True and
  stronger: every question is randomly generated fresh from a
  generator, not drawn from a fixed bank.
- The brief's placeholder stats ("10,000+ Questions Completed", "95%
  Student Satisfaction") were fabricated numbers with nothing behind
  them. Swapped for real, verifiable facts instead: 85 KSSR-aligned
  topics, unlimited questions, Years 4/5/6 covered. Swap in real
  usage/satisfaction numbers once they exist — flagged in the code
  comment so this isn't forgotten.

Also softened two Parent Dashboard feature descriptions to match what
the app actually does today rather than the brief's exact wording:
"Study Recommendations" → described as the tips/common-mistake
breakdowns that already exist per weak topic (real), and "Exam
Readiness" → described as exam history/scores over time (real) rather
than implying a computed readiness verdict (doesn't exist yet).

**Not yet live, included per the brief anyway (flagged, not hidden)**:
the Gamification section's "Unlock Badges" card describes a feature
that isn't real yet — `/quests` is still a "coming soon" placeholder
(noted in this file previously). Streaks, XP, and Level Up are all
genuinely live already (`students.xp/level/streak_count`,
`updateStreak()`). Worth deciding whether to build Misi before this
section goes live publicly, or soften that one card's wording, once
ready to actually launch this page.

**Verification**: `tsc --noEmit` clean. `npm run build` gets through
webpack compilation of every file (including all three new ones) and
only fails at the font-fetch step in `app/layout.tsx` — this sandbox
has no network access to fonts.googleapis.com, confirmed identical to
the exact same failure point on unrelated earlier builds. Not a code
issue.

### New: standard vertical/column written method for addition & subtraction
User request: the Learn tab's worked examples only ever showed the
inline text form ("12.50 + 3.20 = 15.70" plus prose steps) — no
stacked column layout with digits and decimal points lined up, which
is the standard method every Malaysian primary maths textbook actually
teaches (see the user-supplied reference: line up decimal points,
subtract like whole numbers, pad missing decimal places with a zero).

**New**: `components/student/diagrams/VerticalArithmetic.tsx` — renders
2-3 operands stacked with digits/decimal points aligned in a CSS grid
(one grid column per character, monospace `font-num`), the operator on
the last operand's row, a rule above the answer, and an optional
`prefix` (e.g. "RM" for money topics) shown before every row. Missing
integer digits pad with a blank (no false leading zeros); missing
decimal digits pad with an explicit "0" — matching the correct
convention from the reference image (8.8 becomes 8.800 to line up with
6.156), not just visual filler.

Extended `DiagramSpec` (in `lib/questions/types.ts`) with a new
`vertical_arithmetic` kind and wired it into the shared
`QuestionDiagram` switch from the earlier diagram-fix work, so it's
available everywhere a diagram can show (Learn tab today; practice/
quiz/exam for free if a generator ever wants to attach one).

**Content**: added a `diagram` to the worked example of all 10
addition/subtraction topics under Numbers and Operations — Addition
Within 100,000 (`...001`), Calculating Change (`...003`), Adding &
Subtracting Decimals both versions (`...005`, `...035`), Subtracting
Whole Numbers both ranges (`...020`, `...031`), Adding Whole Numbers up
to 1,000,000 (`...030`), Adding Three Whole Numbers (`...032`, the one
3-operand case), Subtracting from a Round Number (`...033`), and Adding
& Subtracting Money (`...039`, uses the `prefix: "RM"` option) — every
one using the exact operand/result numbers already in that topic's own
`problem`/`steps`/`answer` text, never a different illustrative
example.

**Deliberately out of scope this pass**: multiplication and division.
Long multiplication (partial products with column shifting) and long
division (the bracket/"bus-stop" method) use structurally different
vertical layouts from addition/subtraction — worth their own dedicated
component if wanted, not shoehorned into this one. Topics `...021`,
`...026`, `...028` (multiplication) and `...022`, `...025`, `...029`,
`...037` (division) are the candidates for a follow-up.

**Verification**: `tsc --noEmit` clean. Verified the alignment logic
directly against all 10 real data sets (every operand row and the
result row come out to identical rendered width, confirming the
columns genuinely line up — including the 3-operand case). A full
`npm run build` confirms webpack/SWC compiles `VerticalArithmetic.tsx`
and every touched file with zero errors; the only failure is the same
pre-existing Google-Fonts-unreachable issue in `app/layout.tsx` that
every build in this sandbox hits, unrelated to this change. (Note for
future sessions: testing a `.tsx` diagram component directly through
the `tsx` CLI needs `React.createElement` or an explicit `import React`
in the test script — `tsx`'s own JSX transform differs from Next's
SWC pipeline and doesn't auto-detect the automatic runtime the same
way; this is a test-harness quirk, not something to fix in the
component itself, since every other diagram component has the same
shape and compiles fine in the real build.)

## Combined Operations (topic 027) — fixed to cover all six KSSR pairs

Topic 027 "Operasi Bergabung Tanpa Kurungan" previously only tested one
operand pair (add & multiply, `a + b × c`) even though the real KSSR Y6
textbook chapter covers six: Tambah & Tolak, Darab & Bahagi, Tambah &
Darab, Tolak & Darab, Tambah & Bahagi, Tolak & Bahagi. Lynda flagged this
after testing — noticed several combined-operation questions didn't match
the KSSR order-of-operations rules — and pointed at the textbook chapter
via three anyflip mirrors (blocked from direct fetch as usual; identified
the chapter's exact sub-skill breakdown via search snippets from other
mirrors of the same official Y6 textbook instead).

**What changed** — `lib/questions/generators/mixedOperations.ts` rewritten
around a `pattern` config (`add_subtract`, `multiply_divide`,
`add_multiply` [default, unchanged from before], `subtract_multiply`,
`add_divide`, `subtract_divide`). Each pattern computes both the correct
KSSR-rule answer and the classic wrong answer in `context.correct` /
`context.wrong`:
- the four mixed-precedence patterns (×/÷ paired with +/−): wrong = naive
  left-to-right instead of doing ×/÷ first
- the two equal-precedence patterns (+/− together, ×/÷ together): wrong =
  incorrectly grouping the last two operands as if one operator had higher
  precedence — the mirror-image misconception (over-applying "×÷ first"
  where it doesn't apply)

`lib/mistakes/classify.ts`'s `mixed_operations` case generalized to check
`context.wrong` directly instead of re-deriving the old `(a+b)*c`-specific
formula — now pattern-agnostic for base/errorSpotting/word_problem/
reverseProblem, while the existing two-multiplication `challenge` branch
(needs `context.d`) is untouched.

`reverseProblem` and `challenge` are only offered for the four
mixed-precedence patterns (`add_multiply`, `subtract_multiply`,
`add_divide`, `subtract_divide`) — solving for the starting amount `a` is
a clean single algebraic step there. The two equal-precedence patterns
don't have a natural reverse/challenge shape without a bigger redesign, so
topics.ts only gives them mcq/fill/word_problem/errorSpotting templates.
Topic's `questionTemplates` grew from 6 to 29 entries to cover all six
patterns. Explanation/tips text broadened to state the equal-precedence
left-to-right rule alongside the existing ×÷-first rule.

Verified: `tsc --noEmit` clean. Smoke-tested every pattern × every
question type at 1000x (mcq/fill/word_problem/errorSpotting) and
reverseProblem/challenge at 1000x where offered — 0 bad draws across all
of it (no negative/non-finite answers, no <3-option MCQs, no missing
correct-answer-in-options, no wrong===correct collisions checked
separately at 2000x per pattern). Also ran the real `questionTemplates`
array from topics.ts through the generator at 300x per template (29
templates) — 0 failures. `audit-content-gaps.ts` still runs clean, no
regression to topic 027's score.

## Diagram QC pass — Lynda caught worked examples with no visual (Round 2)

Lynda pushed back hard on the previous round: the order-of-operations fix
was real but narrow, and missed what she'd actually noticed testing the
app — multiplication worked examples still show as one inline line
instead of the column method, and several geometry/measurement worked
examples describe a shape ("Rectangle A: 6cm×3cm, Rectangle B: 4cm×2cm",
"one angle is 65° on a straight line") with zero visual to go with it.
She asked for a full QC pass across every topic, "as if from the Ministry
of Education."

**Audit method** — scripted check across all 85 topics: does
`workedExample.problem`/`explanation` reference shape/angle/diagram-ish
keywords AND have no `workedExample.diagram`? Found **10** topics: 004
(Perimeter of Simple Shapes), 011 (Area of Rectangles & Squares), 012
(Angles on a Straight Line), 013 (Area of Composite Shapes), 014 (Sum of
Angles in a Triangle), 065 (Distance Between Two Coordinates), 075
(Interior Angles of Regular Polygons), 079 (Volume of a Cuboid), 080
(Volume of Composite Shapes), 081 (Perimeter of Composite Shapes).

**Fixed this round** (4 of the 10, plus the multiplication visual):
- New `StraightLineAnglesDiagram` — two angles on a line, one labeled,
  one "?" → wired to topic 012.
- New `TriangleAnglesDiagram` — triangle with two angles labeled, third
  "?" → topic 014.
- New `TwoRectanglesDiagram` — two independently-sized rectangles drawn
  side by side (NOT fused into one L-polygon, since `areaComposite.ts`
  draws the two rectangles' dimensions independently via separate
  `randInt` calls — they won't reliably interlock into a valid L, so
  forcing a fused polygon would sometimes draw something that doesn't
  match the numbers) → topic 013.
- New `NotchedRectangleDiagram` — a REAL L-polygon (big rectangle minus a
  corner notch), unlike the above, because `perimeterComposite.ts`'s
  whole pedagogical point is "the notch doesn't change the perimeter" —
  the student needs to see one connected L-shape with the missing corner,
  not two separate boxes → topic 081.
- New `LongMultiplicationDiagram` — the actual "stack and multiply column
  by column" written method, structurally different from
  `VerticalArithmetic` (+/− only): handles a 1-digit multiplier as a
  single row (no partial products needed), and a 2-digit multiplier as
  two shifted partial-product rows summed underneath (the tens-digit
  row's rightmost digit lands one column left of the ones column, via a
  `trailingBlanks` padding parameter, not by literally writing a trailing
  zero — matches how it's drawn on paper). Wired to all four whole-number
  multiplication worked examples: topic 021 (245×23), topic 026
  (3450×34), topic 028 (1245×4), and topic 040 (money ×, using the
  sen-converted whole numbers 450×3 the worked example's own steps
  already convert to — decimal operands aren't supported by this
  component, same scoping decision as `VerticalArithmetic`).

All four new SVG diagram kinds added to `GeneratedQuestion["diagram"]` in
`lib/questions/types.ts` and wired into `QuestionDiagram.tsx`'s
dispatcher (the shared switch every surface — practice/quiz/exam — reads
from, so no risk of the quiz/exam desync bug from earlier rounds).

**Still open — NOT fixed yet, flagged for the next round**: topics 004 +
011 need a plain labeled-rectangle diagram (straightforward, lowest
priority since a rectangle is easy to picture without one); 065 needs a
coordinate-grid variant that plots TWO points and the distance between
them (current `CoordinateGridDiagram` only plots one point); 075 needs a
regular-polygon (pentagon/hexagon/etc.) diagram; 079 and 080 need a 3D
cuboid diagram (and a composite-cuboid variant) — meaningfully more
involved than the 2D shapes since it needs an isometric-style projection.
None of these are built yet.

Verified: `tsc --noEmit` clean. `npm run build` — webpack compiles clean
through every touched file; the only failure is the pre-existing
Google-Fonts network fetch in `app/layout.tsx` (unrelated, same
sandbox-has-no-internet issue as every previous round). Hand-verified the
long-multiplication row/shift math against all four worked examples with
a standalone script (partial products sum to the exact worked-example
result, shift lands in the correct column) — all four OK.

## Diagram QC pass, part 2 — the remaining 6 topics

Finished the punch list from the previous round. All 6 remaining topics
(004, 011, 065, 075, 079, 080) now have diagrams, closing out the full
audit — the scripted check that found 10 gaps now finds 0.

**New components:**
- `RectangleDiagram` — plain labeled rectangle → topics 004 (perimeter,
  8×5) and 011 (area, 7×4).
- `TwoPointGridDiagram` — coordinate grid with TWO plotted points and the
  distance between them highlighted (existing `CoordinateGridDiagram`
  only ever plotted one point, since it was built for the Y4 "reading
  coordinates" topic) → topic 065. Worth noting: `coordinateDistance.ts`
  has a code comment saying this topic deliberately doesn't need a
  diagram since it's "pure arithmetic." Built one anyway — Lynda's QC
  request was about visual scaffolding for the shape/scenario being
  described, not just whether the arithmetic itself needs a picture, and
  a two-point grid genuinely helps a student see which axis matches
  before subtracting.
- `RegularPolygonDiagram` — any n-sided regular polygon (vertices evenly
  spaced on a circle, so it isn't hardcoded to hexagons), with one
  interior angle arc-marked and labeled → topic 075 (hexagon, 120° each).
- `CuboidDiagram` — isometric-style 3D box (front/top/right faces as
  three polygons sharing edges, fixed skew rather than true isometric
  projection to keep labels simple) with length/width/height labeled →
  topic 079 (5×3×2).
- `TwoCuboidsDiagram` — two `CuboidDiagram`s side by side with a "+",
  same reasoning as `TwoRectanglesDiagram` from part 1: `volumeComposite.ts`
  draws its two cuboids' dimensions from independent `randInt` calls, so
  they won't reliably fuse into one valid composite solid → topic 080
  (4×3×2 + 3×2×2).

All five wired into `GeneratedQuestion["diagram"]` and
`QuestionDiagram.tsx`'s shared dispatcher, same pattern as part 1.

Verified: `tsc --noEmit` clean. Re-ran the same audit script from part 1
— **0 topics remaining** with visual content and no diagram (was 10,
then 6, now 0). Independently checked the trickier geometry by hand: regular
polygon side lengths are equal for n=3,4,5,6,8 (max deviation 0.0000px —
floating-point exact, not just visually close), and the cuboid's
top/front/right face polygons share their edges exactly (computed the
shared corner points directly rather than trusting the visual). Full
`npm run build` — webpack compiles every touched file with zero errors;
only the pre-existing Google Fonts network failure remains (same
sandbox-has-no-internet issue noted in every prior round, unrelated to
any of this work).

This closes out the diagram-QC arc across both rounds. Nothing currently
flagged as missing a diagram; next content gaps (if any) would need a
fresh audit pass, since this one only checked "worked example references
a shape/angle with no diagram" — it wouldn't catch other kinds of gaps.

## Division + mobile font-size fix

Lynda flagged two things: division was never touched (only multiplication
got the vertical-method treatment last round), and the number labels
inside diagrams — she called out Volume of Composite Shapes specifically
— are too small to read on a phone. She also attached a reference image
(the classic "bus stop" long division staircase: quotient on the roof,
subtraction + bring-down rows underneath) as a sample in case the anyflip
links didn't load, which they hadn't (same bot-detection block as every
previous round).

**Division** — new `LongDivisionDiagram`, matching the reference image
exactly: divisor + bracket, quotient digits on the roofline, and a full
subtraction/bring-down staircase underneath (not just a bare quotient —
Lynda's sample specifically showed the working, not just the answer).
Works for any 1- or 2-digit divisor and an optional single decimal point
in the dividend (quotient's decimal point lands in the same column as
the dividend's, same convention as the other written-method components).
The whole staircase is computed from the raw dividend + divisor inside
the component — not hand-fed — via the standard algorithm: accumulate
leading digits until they exceed the divisor, divide, subtract, bring
down the next digit, repeat. Verified this against 5 cases with a
standalone script before wiring it in: the reference image's own example
(13032 ÷ 24 = 543) plus the actual 4 division worked examples this round
uses. All 5 matched exactly, including the exact subtraction/bring-down
values and column positions shown in Lynda's image. Wired to all 4
whole-number/decimal division worked examples: topic 022 (1288÷23, the
2-digit-divisor topic — its own worked-example text uses an "estimate
and multiply-check" method rather than a staircase, but Lynda's reference
image itself uses a 2-digit divisor with the full staircase, so this
topic gets the same staircase diagram as the others rather than a
different treatment), topic 025 (738÷6), topic 029 (84÷4), and the
decimal division topic (7.2÷3).

**Mobile font-size fix** — every diagram component (both the ones built
across this whole diagram-QC arc AND the pre-existing ones from earlier
rounds — AngleDiagram, TriangleDiagram, CircleDiagram, CoordinateGridDiagram,
BarChart/PieChart/Pictograph, LinePairDiagram) had SVG label `fontSize`
values in the 9–14px range. Since these are SVG user-units scaled by the
`viewBox`-to-rendered-width ratio, and every diagram is capped at a
fairly narrow `max-w`, actual rendered size on a phone (where the
container is often narrower than that cap, or — worse — split by a flex
layout) could shrink well below the nominal value. Bumped every fontSize
up (roughly 9→12, 11→14, 12→15, 13→16, 14→17) across every diagram file,
and increased padding/max-width modestly on the ones with labels close to
the shape's edge so bigger text doesn't clip.

The specific bug behind Lynda's Volume of Composite Shapes example:
`TwoCuboidsDiagram` placed two full SVGs side by side in a plain
`flex` row with no responsive handling — on a phone-width container,
flexbox squeezes both SVGs to roughly half width each, which (per the
viewBox-scaling issue above) shrinks their internal text far below the
already-small nominal size. Changed it to stack vertically by default
(`flex-col`) and only go side by side from the `sm` breakpoint up
(`sm:flex-row`), so each cuboid gets its full width — and therefore
full-size labels — on a phone. `TwoRectanglesDiagram` (topic 013) didn't
have this specific bug since it's one single SVG containing both
rectangles rather than two flexed SVGs, but got the general font-size
bump along with everything else.

Verified: `tsc --noEmit` clean. `npm run build` clean (only the
pre-existing unrelated font-fetch failure). Long-division logic
hand-verified against 5 cases including Lynda's own reference image
before wiring into content — exact match on quotient, every subtraction
row, and every bring-down row.

## Discount + Service Tax — missing the TP5/TP6 combined-expression method

Lynda asked if it was intentional that Y6 Discount still shows the
step-by-step "linear" method rather than an order-of-operations
combined expression, drawing the comparison to the topic-027 fix. It
wasn't intentional — checked the official KSSR PBD module answer keys
(Modul Lengkap PBD 2024 Matematik Tahun 6, via anyflip) and confirmed
real TP3-level answers use the two-step method (find the discount/tax
amount, then add or subtract it) while TP5-level answers collapse it
into ONE expression: `(100 − discount%)% × original price` for
discount, and the mirror-image `(100 + tax%)% × invoice amount` for
service tax. Our content only ever showed the TP3-style two-step
version, at every difficulty tier.

Checked every other Y6/Y5 money-percentage topic for the same pattern
before scoping the fix: Profit & Loss (042) doesn't apply — it's a
plain difference, no percentage combine involved. Simple Interest (041)
already presents P×R×T÷100 as one combined expression, no gap. Interest
& Dividend (060) is a single multiplication, no gap. Compound Interest
(076) genuinely can't collapse into one expression — the whole point is
recalculating from a new total each year — so the sequential steps are
correct there, not a gap. Discount (050) and Service Tax (059) were the
only two with the gap, since they're structurally identical (percentage
of a price, then combined with the original by + or −).

**Fix**: for both topics, added the TP5/TP6-style combined expression as
an explicit "fast way" alongside the existing step-by-step method —
explanation now introduces it right after the two-step version, framed
in the same order-of-operations language as topic 027 ("brackets first,
then × or ÷"); the worked example gets an extra step showing the
combined expression evaluating to the identical answer; and a new tip on
each topic spells out the order-of-operations mechanics and explicitly
names the "Combined Operations" topic as the same underlying skill. The
existing two-step method, questionTemplates, and the `discount`/
`service_tax` generators in money.ts were untouched — this is a content
depth addition (showing the shortcut a TP5/TP6 student would use), not a
change to how questions are generated or graded, since both methods
produce the identical numeric answer.

Verified: `tsc --noEmit` clean, `npm run build` clean (only the
pre-existing unrelated font-fetch failure). Hand-checked both combined
expressions arithmetically match the existing worked-example answers:
(100−25)%×RM80 = 75%×80 = RM60 ✓ (discount), (100+6)%×RM50 = 106%×50 =
RM53 ✓ (service tax).

## Mission Engine — Adventure Mode (v1, real vertical slice)

Lynda brought a full "Math Adventure Mission Engine" brief: math embedded
in stories (rescue/exploration/mystery/builder/financial-literacy/time
missions across 9 categories, dynamically generated so the same skill
gets a different story each time), with Pintar as narrator, and a 7-stage
flow (story → challenge → math problem → decision → outcome → reward →
reflection). Confirmed we'd continue in this session rather than
starting fresh.

**Architecture call**: checked the codebase first — every existing
migration keeps inserting rows into a `topics`/`question_templates` DB
table, but nothing in the live app actually SELECTs from either; all real
lesson content lives in `lib/content/topics.ts` (code), and the DB tables
only exist as FK anchors for `attempts`/`practice_sessions`. Missions
follow the same split: story/theme content in code
(`lib/missions/missions.ts`), new DB tables only for genuinely new
student STATE (badge progress, mission completions) — no `missions`
content table, matching why there's no such table for topics either.

**"Dynamic generation" without a live AI call**: the brief's example —
"today 5 kittens sharing milk, tomorrow 4 puppies sharing food, same
concept, different story" — is satisfied two ways that combine on every
play: (1) each `MissionTemplate` has 3 `MissionVariant`s (different
character/setting/theme text), one picked at random; (2) each variant's
`generateMath()` redraws fresh numbers every time. A `fillTemplate()`
helper substitutes `{tokens}` (from the story) and `{values}` (from the
math draw) into the same bilingual strings, so the story and the actual
question always agree on the numbers — no separate AI narration call
needed for core gameplay, keeping it as fast/offline-safe as every other
part of the app.

**Why mission math isn't the existing 85-topic REGISTRY generators**:
tried this first, but those are tuned for curriculum drilling at their
own ranges (e.g. Y5 division dividends run 100-999) — "1 litre of milk
for 5 kittens = 0.2L" needs small, story-appropriate numbers instead.
Built 3 small dedicated generators in `lib/missions/missionMath.ts`
instead — `generateEqualShare` (exact-to-1-decimal-place division, built
backwards from a clean tenths-place answer so it's always exact, not
rounded), `generateFractionSubtract` (same-denominator, simplified via
gcd), `generateBudgetSubtract` (budget minus 3-4 randomly chosen
items, guaranteed non-negative remainder) — each still testing a real
KSSR skill, just at mission-appropriate scale. Smoke-tested 2000 draws
each (0 failures) plus 100 draws × every variant × every mission (900
total) confirming no `{token}` is ever left unresolved.

**What shipped** (first vertical slice — the 3 example missions from the
brief, fully playable end to end):
- `lib/missions/types.ts` — `MissionTemplate`/`MissionVariant`/
  `MissionMathDraw` types + `fillTemplate()`
- `lib/missions/missionMath.ts` — the 3 dedicated generators
- `lib/missions/missions.ts` — Lost Kittens (number/rescue, Y4), Bridge to
  Fraction Valley (fraction/builder, Y5), Grocery Challenge
  (money/financial_literacy, Y4) — 3 story variants each
- `lib/missions/badges.ts` — Kindness (5 rescue missions), Bridge Builder
  (3 builder missions), Money Hero (5 financial-literacy missions)
- `lib/missions/categoryStyle.ts` — icon/gradient per category, same
  convention as `lib/content/strandStyle.ts`
- `supabase/migrations/0041_missions.sql` — `student_badges` +
  `mission_completions`, RLS matching the existing per-student/
  linked-parent policy pattern, plus an atomic `record_badge_progress`
  SQL function (upsert-and-increment, same race-avoidance reasoning as
  `record_mistake_pattern` in migration 0004)
- `lib/actions/missions.ts` — `completeMission()`: logs the completion,
  awards XP on the SAME level curve as practice sessions (`level*125`;
  deliberately its own small copy of that curve rather than
  importing/exporting practice.ts's private helper, to keep the mission
  feature self-contained from the existing practice code path), and
  progresses the tied badge with "just earned" detection for a one-time
  celebration
- `components/student/MissionPlayer.tsx` — the 7-stage flow as a client
  component: intro → challenge+question (combined into one screen with
  the challenge text as a lead-in, rather than a separate tap, for
  pacing) → outcome → reward → reflection. Wrong answers don't reveal the
  answer and move on (unlike QuestionPlayer) — they show an encouraging
  retry message and let the student try again, with a hint appearing
  after the 2nd miss; this is deliberately different from
  QuestionPlayer's practice-mode behavior since a mission should feel
  like "help the kittens," not "get graded." Reuses Pintar's existing
  mascot expression images (`/pintar/*.png`) per stage.
- Real Adventure Mode UI replacing the old placeholder: `/quests` (category
  grid, only showing the 3 categories that currently have missions — the
  other 6 are named in a "coming soon" note, not hidden entirely),
  `/quests/category/[category]` (mission list), `/quests/[missionId]`
  (the player)

**Explicitly deferred, not started** — flagging clearly since the brief
is large: the other 6 categories (measurement, geometry, data, time,
kbat, real_life) and more missions per category — pure content work from
here, zero engine changes needed, just more `MissionTemplate` entries.
Coins, Scholar Cards, Companion Items, and Tree Growth Points from the
brief's reward list — only XP + Badges shipped this round; the other
three would each need their own data model decision (is a "Scholar Card"
a collectible with rarity tiers? are Companion Items cosmetic?) better
made with Lynda's input than guessed. Adventure map visualization
(spec mentions "unlock regions") — not built; missions are flat category
lists for now. Pintar giving LIVE narrated encouragement via the real
Pintar engine (vs. this round's pre-written story text) — the story
text IS static content matching how the rest of the app works, but a
future version could pipe mission context to the actual Pintar engine
for live narration, which would need coordinating with the husband's
Basrim-side engine.

Verified: `tsc --noEmit` clean. `npm run build` clean (only the
pre-existing unrelated font-fetch failure). All 3 math generators
smoke-tested at 2000 draws each; all 3 missions × 3 variants smoke-tested
at 100 draws each confirming full template resolution; XP level-curve
and badge "just-earned" detection logic hand-verified against edge cases
(multi-level XP jumps, exact badge-target crossing, repeat completions
after a badge is already earned) with standalone scripts before shipping.

## Mission Engine — all 9 categories now live

Continued straight from the v1 vertical slice: added one mission per
remaining category, so all 9 from the brief now have at least one
playable mission.

**5 new mission-math generators** in `lib/missions/missionMath.ts`,
each smoke-tested at 2000 draws (0 failures):
- `generateUnitConvert` — bigUnit decimal (1 d.p.) → smallUnit, built so
  the conversion is always exact (e.g. "2.5 L → 2500 mL"), parameterized
  by unit pair so the same function covers L→mL and kg→g
- `generateMissingAngle` — two angles summing to 90°/180°/360°, find the
  missing one
- `generateDataTotal` — sum of 3 randomly-counted categories from a
  themed pool (pictograph/tally style)
- `generateTimeDuration` — elapsed minutes between a start and end
  24-hour time, built backwards from a chosen duration so it's always
  exact (no clock-arithmetic to double-check)
- `generatePatternMissing` — next term in a 5-term arithmetic sequence

**6 new missions**, one per remaining category: The Leaky Water Tank
(measurement/builder, unit conversion), The Mysterious Angle Door
(geometry/mystery, angle sums), The Village Data Puzzle (data/mystery,
totaling), The Great Train Schedule (time/time_travel, elapsed time),
Pattern Detective (kbat/mystery, sequences), School Trip Planning
(real_life/financial_literacy, reuses `generateBudgetSubtract` with a
new camping-gear item pool rather than a new generator, since it's the
same underlying skill as Grocery Challenge just themed differently —
proves the math generators are reusable across missions, not
one-generator-per-mission).

**3 new badges**: Fixer (measurement/builder missions, target 4),
Detective (mystery/KBAT missions, target 4), Time Traveler (time
missions, target 4) — alongside the existing Kindness/Bridge
Builder/Money Hero from v1.

Updated the `/quests` landing page's footer note now that all 9
categories are live (was "more coming soon", now a plain encouragement
line) — the category grid itself needed no code change, it already
derives its list from whatever's in `MISSIONS`.

Verified: `tsc --noEmit` clean. `npm run build` clean (only the
pre-existing unrelated font-fetch failure). All 9 missions × every
variant smoke-tested at 200 draws each (3,400 total draws across the
whole mission set) confirming zero unresolved `{tokens}` and zero empty
answers — on top of each new generator's own 2000-draw correctness check
before it was wired into any mission content.

Still deferred from the original brief, unchanged from v1: more missions
per category (each category has 1-3 now, brief implies a much larger
pool over time — pure content work, zero engine changes needed), Coins/
Scholar Cards/Companion Items/Tree Growth Points rewards, adventure map
visualization, live Pintar-engine narration.

## Mission Engine — Coins reward + Exploration mission type + dashboard

Lynda agreed to work concurrently: she applies migration 0041 and tests
on a real device while this round kept building on the code side (no DB
access needed for any of it).

- **Coins**: 2nd reward currency alongside XP, since the brief lists it
  and it's simple enough (a flat running total, no level curve) to build
  without needing a design conversation first — unlike Scholar Cards/
  Companion Items, which do. `students.coins` (migration 0042 — kept
  separate from 0041 since that adds new tables and this alters an
  existing one). Awarded as half the mission's XP, rounded
  (`Math.round(xpEarned / 2)`) — no separate per-mission config to keep
  in sync with `rewardXp`. `mission_completions.coins_earned` added
  directly into migration 0041 (safe to edit in place since Lynda
  confirmed she hadn't applied it yet) rather than as a 3rd migration.
  `completeMission()` now returns `coinsEarned`; `MissionPlayer`'s reward
  screen shows it; the dashboard's existing streak footer strip (which
  already had the icon+number+label pattern for the streak count) got a
  coin count added the same way — the natural, lowest-risk place for it
  since it's the same footer, not a new card.
- **Treasure Cave** (number/exploration, Y4): new mission using a new
  `generateMultiply` generator (a×b, factors 2-12) — the "exploration"
  mission kind from the brief hadn't been used by any mission yet; now
  all 6 kinds (rescue/exploration/mystery/builder/financial_literacy/
  time_travel) have at least one mission.

10 missions total now, all 9 categories and all 6 kinds covered.

Verified: `tsc --noEmit` clean, full `npm run build` clean (only the
pre-existing unrelated font-fetch failure). `generateMultiply`
smoke-tested at 2000 draws (0 failures); all 10 missions × every variant
re-verified at 150 draws each after this round's additions, confirming
no `{token}` regressions from the new imports/content.

Still waiting on Lynda's side: apply migration 0041 (now includes the
`coins_earned` column) AND migration 0042 to the real Supabase project,
then real-device testing. Everything else from the last handover entry
(more missions per category, Scholar Cards/Companion Items/Tree Growth
Points, adventure map, live Pintar narration) still stands as deferred.

## Mission Engine — content breadth pass (17 missions)

Kept going on content while Lynda applies the migrations on her side.
Added a 2nd mission to 7 of the 8 categories that only had one
(measurement is the one still at 1 — no natural 2nd theme picked yet,
easy to add later).

**3 new generators**, smoke-tested at 2000 draws each (0 failures):
`generateFractionAdd` (mirror of the existing subtract one), `generatePerimeter`
(rectangle, `2×(l+w)`, width capped at length so it never draws backwards),
`generateMissingFactor` (`? × known = product`, find the missing factor).

**7 new missions**: Potion Ingredients (fraction/mystery), Market Bargain
(money/rescue, new toy-market item pool), Fence the Garden
(geometry/builder), Weather Watcher (data/exploration, new weather
category pool), Festival Countdown (time/time_travel), Number Riddle
(kbat/mystery), Family Budget Planner (real_life/financial_literacy, new
household-bills item pool with larger budget options since bills run
higher than grocery items).

17 missions total now, spanning all 9 categories × all 6 kinds. Full
smoke test re-run across every mission × every variant (150 draws each,
2,700+ draws) plus new checks: badge-id references all resolve to a real
`BADGES` entry, and mission IDs are confirmed unique across the whole set
(both would silently break at runtime otherwise — worth checking now
that the content list has grown past a size where a duplicate/typo is
easy to eyeball-miss).

Verified: `tsc --noEmit` clean, full `npm run build` clean (only the
pre-existing unrelated font-fetch failure).

Unchanged from previous entries: still waiting on Lynda to apply
migrations 0041+0042 and real-device test; Scholar Cards/Companion
Items/Tree Growth Points, adventure map, and live Pintar narration still
not started.

## Mission Engine — pre-launch bug hunt (found 3 real ones)

Migrations applied to the real Supabase project — mission engine can't
be played yet (code not deployed), which was expected. Used the wait to
do something that's been overdue: a rigorous re-review of
`MissionPlayer.tsx` and the migration↔action mapping, since that flow
had never been clicked through by a human. First, cross-checked
`0041_missions.sql`/`0042_mission_coins.sql` against `lib/actions/missions.ts`
line by line — every table, column, and RPC function name/parameter
matches exactly, no drift. Then read through the whole client component
looking for what a real click-through would surface. Found 3 real bugs:

1. **Silent reward failure.** If `completeMission()` returned `{ok:
   false}` (not thrown — e.g. an auth hiccup) rather than throwing, the
   old code treated it identically to a genuine zero-reward success: the
   student saw a normal reward screen with 0 XP/coins and no
   explanation, and their completion was silently lost with nothing
   telling them to retry. Now checks `result.ok` explicitly and shows a
   real retry screen ("Couldn't save your reward — check your connection
   and try again") instead of a false celebration.
2. **No way to type °, fractions, or other math symbols.** The question
   input was a plain `<input>` with no way to enter symbols a phone
   keyboard doesn't have a dedicated key for. The rest of the app solves
   this with `MathSymbolBar` (already used in Practice/Quiz/Exam's
   fill-in inputs) — missed wiring it into `MissionPlayer` originally.
   Added it, same pattern as `QuestionPlayer.tsx`.
3. **`generateMissingAngle`'s answer required typing "115°" including the
   degree symbol** to match — inconsistent with the established
   curriculum convention (checked `anglesStraightLine.ts` and every other
   angle generator: they all store a bare `String(correct)` with no unit
   suffix, since the degree symbol is informational in the question text,
   not something students should have to reproduce exactly to be marked
   correct). Fixed to match: `correctAnswer` is now a bare number; the °
   still shows in the question and hint text, just isn't compared
   against.

Also added, while in there: Enter-key submits the answer (previously
only the button worked — a real gap for a math app on mobile, where
Enter/Go is the expected submit gesture), and a brief "Saving your
reward..." loading state instead of the reward numbers populating a
moment after the screen already appeared.

Checked but NOT changed, deliberately: the `RM11` (no space)
answer-matching format used by every money-related mission — this
matches the exact convention every money topic in the main curriculum
already uses (`formatRM()` in `lib/questions/generators/money.ts`), so
it's a pre-existing, consistent, app-wide behavior rather than something
specific to missions. Flagging it here rather than unilaterally
"fixing" only the mission corner of an app-wide pattern.

Verified: `tsc --noEmit` clean, full `npm run build` clean (only the
pre-existing unrelated font-fetch failure). Re-ran the full 17-mission ×
every-variant smoke test (150 draws each) after the angle fix to confirm
no regression; `generateMissingAngle` re-verified at 2000 draws
specifically checking the degree symbol no longer appears in
`correctAnswer`.

Still waiting on Lynda's side: deploy the latest code, then real-device
test. Everything else from prior entries (more measurement missions,
Scholar Cards/Companion Items/Tree Growth Points, adventure map, live
Pintar narration) still stands.

## FIXED: production crash on every mission page

Lynda deployed and hit `Application error: a server-side exception has
occurred` on every single mission — confirmed the pattern (all mission
topics, same generic error) pointed straight at one root cause without
needing the actual Vercel logs, though I gave her instructions to pull
them in case this diagnosis was wrong.

**Root cause**: `app/(student)/quests/[missionId]/page.tsx` (a Server
Component) was passing the entire `mission` object as a prop into
`<MissionPlayer mission={mission} />` (a Client Component). Next.js
serializes props across that server→client boundary, and functions
aren't serializable — every `MissionVariant.generateMath` is a function,
so this crashed on literally every mission, every time, matching exactly
what Lynda saw.

This is exactly the failure mode `lib/content/topics.ts` was already
designed to avoid: topic content references its generator by a plain
STRING key (`generatorKey`) resolved through a separate REGISTRY lookup,
never embedding an actual function in the content object itself —
`practice/[topicId]/page.tsx` can safely pass a whole `topic` object
across the boundary because of that. `MissionTemplate` didn't follow that
pattern (each variant's math logic was a literal function reference), so
it broke where topics never could.

**Fix**: `MissionPlayer` now takes `missionId` (a plain string) instead
of the full `mission` object, and re-resolves it itself via
`getMissionById()` — same static content, just resolved with a
non-null-assertion-guarded lookup on the client side instead of crossing
the boundary as a prop. Safe because `page.tsx` already calls
`notFound()` server-side if the id doesn't resolve, so `MissionPlayer`
is never mounted with a ba id in practice. `page.tsx` itself is
unchanged otherwise — it still resolves the mission server-side to
render the header (title/emoji/category), which is all plain
serializable data and was never the problem.

Worth noting for next time: this class of bug is invisible to both
`tsc --noEmit` and `npm run build` in Next 14 — it's a pure runtime
serialization failure, not a type or compile error, which is exactly why
it slipped through every verification pass in this repo until an actual
deploy hit it. No amount of additional static checking in this sandbox
would have caught it; it needed either very deliberate reasoning about
RSC serialization rules specifically, or a real runtime test — this round
was the former, prompted by Lynda's real deploy surfacing it.

Verified: `tsc --noEmit` clean, `npm run build` clean (only the
pre-existing unrelated font-fetch failure — same as always, and
consistent with the bug being invisible to build-time checks as
explained above). Cannot verify the runtime fix itself from this
sandbox — that needs Lynda's next deploy + a real click-through.

## Mission Engine v1 — CONFIRMED WORKING IN PRODUCTION

Lynda confirmed the crash fix worked and missions are playable end to
end on the real deployed app. Closing out this build session here.

**Final state of what shipped, all confirmed live:**
- 17 missions across all 9 categories from the brief (number ×2,
  fraction ×2, money ×2, measurement ×1, geometry ×2, data ×2, time ×2,
  kbat ×2, real_life ×2) and all 6 mission kinds (rescue, exploration,
  mystery, builder, financial_literacy, time_travel)
- Full 7-stage flow: story intro → challenge+question (combined into one
  screen) → outcome → reward → reflection, with Pintar narrating via his
  existing mascot expressions at every stage
- Dynamic generation on every play: each mission has 1-3 story variants
  (different characters/settings) picked at random, and each variant's
  math is freshly randomized — proven across 2,700+ smoke-test draws
  with zero unresolved template tokens or bad answers
- Real rewards wired to the database: XP (same level curve as practice
  sessions), Coins (a 2nd currency, half the XP amount), and 3 badges
  with progress tracking (Kindness, Bridge Builder, Money Hero, Fixer,
  Detective, Time Traveler — 6 total)
- `/quests` → category grid → mission list → player, all real routes
- Answer input uses the same MathSymbolBar as the rest of the app (for
  °, fractions, etc.), Enter-to-submit, and a proper retry flow if saving
  a completion genuinely fails rather than a false celebration

**Bugs found and fixed along the way** (all documented in detail in
their own sections above): the RSC serialization crash (functions
crossing the server→client boundary — the one that blocked launch),
silent reward-save failures, missing math-symbol input support, and an
angle-answer format inconsistent with the curriculum's own convention.

**Deliberately not built — the honest remaining scope from the original
brief**, in rough priority order if picked back up later:
1. A 2nd measurement mission (the one category still at 1) — quick,
   pure content work
2. More missions per category generally — the brief implies a much
   larger library over time; 17 is a solid working set, not the ceiling
3. Coins, Scholar Cards, Companion Items, Tree Growth Points as a full
   reward economy — only XP + Coins + Badges exist; Scholar Cards and
   Companion Items specifically need Lynda's design input (rarity
   tiers? cosmetic vs functional?) before they're buildable, not
   something to guess at
4. Adventure map / "unlock regions" visualization — missions are flat
   category lists right now
5. Live Pintar-engine narration replacing the pre-written story text —
   needs coordination with the husband's Basrim-side engine on what
   context can be exchanged

This is a good, real stopping point: the core engine is proven correct
in production, not just in a sandbox. Everything from here is additive
content/features on a foundation that's now been validated end to end.

## Mission Engine — genuinely multi-step Hard/Y6 missions

Lynda asked whether all 7 stages and all 3 levels (Easy/Medium/Hard =
Y4/Y5/Y6) were done. Stages: yes. Levels: technically yes but lopsided
(9/5/3), and — the real finding — the 3 existing Y6 missions were
correctly *themed* Hard (KBAT/real-life) but weren't actually
mathematically multi-step; they used the same single-concept generators
as the Y4 missions, just with bigger numbers. Flagged it, she said to
fix it.

**3 new generators that genuinely chain two different operations**,
each returning intermediate values so the workingHint can show every
step (matching how the curriculum's own challenge-tier questions work),
smoke-tested at 3000 draws each (0 failures):
- `generateMultiStepBudgetDiscount` — sum items → apply a % discount to
  the total → find change from a payment. Chains addition, percentage,
  subtraction. The discount % is filtered to ones that divide the total
  cleanly (no fractional sen) rather than just picking any % and
  rounding, so the intermediate discount amount is always exact.
- `generateMultiStepFractionScale` — add two same-denominator fractions
  (a "per unit" amount), then multiply by a whole number of units.
  Simplifies at both stages independently (the gcd of the per-unit sum
  is not generally the same as the gcd after scaling).
- `generateMultiStepUnitSubtract` — convert a bigUnit amount to
  smallUnit, then subtract an amount used. The "amount used" is derived
  as a clean fraction of the converted total (rounded to the nearest 10)
  rather than picked independently, so it can never exceed the total and
  the remainder is always a tidy number.

**3 new Y6 missions**, each using its own multi-step generator: The
Merchant's Bargain (money/financial_literacy — discount+change), Recipe
Scaling (fraction/builder — add+multiply), The Great Leak (measurement/
mystery — convert+subtract, which also happens to give measurement its
2nd mission, closing that earlier-flagged gap as a side effect).

20 missions total now. Level distribution: Y4=9, Y5=5, Y6=6 (still
Y4-heavy, but Y6 at least doubled and — more importantly — now actually
earns its "Hard" label mathematically, not just narratively).

Verified: `tsc --noEmit` clean, full `npm run build` clean (only the
pre-existing unrelated font-fetch failure). All 20 missions × every
variant re-verified at 150 draws each; the 3 new multi-step generators
each independently verified at 3000 draws checking every intermediate
value in the chain (not just the final answer) — e.g. for the discount
mission, confirmed the discount amount is always a whole number of sen,
the post-discount price matches item-total-minus-discount exactly, the
payment always exceeds the final price, and change is never negative.

## Hard actually hard now + navigation fix + a self-caught bug

Lynda tested the new Hard missions herself: "Hard is not really hard."
Right diagnosis on inspection: the challenge text was literally spelling
out the algorithm ("total, subtract discount, then find change... THREE
steps") — turning a multi-step reasoning problem into a checklist.
Real KBAT difficulty requires the student to figure out what operations
are needed, not be handed the sequence.

**Fix**: rewrote all 3 Hard missions' challenge text to describe the
situation and ask for the end result, without prescribing the method —
"How much change will be received after this purchase and payment?"
instead of "work out the total, subtract the discount, then find
change." The workingHint (shown only after getting it wrong) still walks
through the full solution — scaffolding after a genuine attempt, not
before one. Also widened the numeric ranges: discount % pool went from
4 round options (10/20/25/50) to 10 more varied ones, item prices went
up, fraction denominators/multipliers widened, unit-convert range nearly
doubled.

**Widening the numbers surfaced a real bug the smoke test caught
immediately**: the discount generator picked a random discount % and
then filtered for ones that divided the (now much less round, often odd)
item total with zero fractional sen — and its fallback for "no discount
% divides cleanly" was a hardcoded 10%, which itself often didn't divide
cleanly either. 704 failures out of 3000 draws on the first re-run.
Root cause was the "require an exactly whole-RM discount" constraint
itself — unnecessary, since sen amounts are completely normal in real
money math (the rest of the app already handles them via `formatRM()`).
Rewrote the whole function to work in integer sen throughout (matching
how the curriculum's own money generators avoid floating-point drift),
removing the fragile divisibility filter and its broken fallback
entirely. Re-verified clean at 5000 draws.

**Also fixed a navigation annoyance** Lynda flagged: finishing a mission
and tapping "More missions" went to the top-level category grid, forcing
an extra tap to re-pick the same category to see its other mission. Now
returns to that mission's own category listing instead — the top-level
grid is still one tap away via the "← All categories" link already on
that page if the student wants to switch subjects.

Verified: `tsc --noEmit` clean, full `npm run build` clean (only the
pre-existing unrelated font-fetch failure). All 20 missions × every
variant re-verified at 300 draws each (6000 total) with a check
specifically added this round for floating-point-artifact answers (e.g.
"RM16.099999999999998") on top of the usual token-resolution checks —
0 failures across the board after the fix.

## Round: Adventure Map overhaul (mode selection, obstacle-course reframe, mega badge, fusion questions)

Lynda's brief: missions felt capped at "2 games per topic"; wanted the
Quests homepage turned into a visual A-to-B map where each category is an
obstacle Pintar must clear, a mega reward at the end, an Easy/Medium/Hard
mode picker, "Play again" available even after 100%-ing everything,
genuinely randomised/unique questions, and harder questions that combine
multiple disciplines (e.g. number + angle + geometry in one problem) —
framed so a kid could learn just from playing missions, without ever
touching Latihan/Peperiksaan.

**Key reframe: the "only 2 games" ceiling was a perception problem, not
a content-size problem.** Every mission already re-rolls its own numbers
via Math.random on each play (that was the whole point of the original
Mission Engine design) — what was missing was (a) the category page
literally listing "N missions" like a fixed menu, inviting the "only 2"
read, and (b) `restart()` silently pinning the SAME story variant across
replays (a real bug — only the math re-rolled, not the visible story).
Fixed both instead of trying to author hundreds more missions: category
pages now open on ONE big "Start Challenge" card (a mission picked at
random from the category, server-side, fresh every visit) with the
mission list demoted to "or try a different story" underneath; restart()
now also rerolls to a different variant than just played. Between random
variant × random math draw × (now) mode-scaled ranges, replaying the
same obstacle repeatedly no longer looks identical.

**MissionMode (easy/medium/hard)** — NEW, independent of `yearLevel`
(the KSSR grade a mission's content belongs to; unchanged, no longer
mislabeled as difficulty on the category page, which previously showed
Y4/5/6 as literal "Mudah/Sederhana/Sukar" — confusing, since a Y4 student
on "Hard" would have jumped to Y6 content). Mode is carried as a
`?mode=` query param through map -> category -> mission (no new student
column needed for v1). `lib/missions/difficulty.ts` holds one shared
scale factor per mode (0.6x/1x/1.6x) plus `biasOptions()` for
options-array generators (discount %, duration presets) — applied inside
each generator's own random ranges rather than a generic wrapper, since
the "sane floor" per generator differs (e.g. angle margins vs multiply
factors). Threaded through 11 of the ~15 mission generators this round
(equal-share, fraction ±, budget-subtract, unit-convert, missing-angle,
data-total, time-duration, pattern, multiply, perimeter, missing-factor)
— NOT yet threaded through the 3 existing multi-step generators
(budget-discount, fraction-scale, unit-subtract), which are reserved as
part of Hard mode's "prefer chained missions" strategy instead. Smoke-
tested the touched generators at 5000 draws/mode via a throwaway script
(not committed) — 0 bad draws (checked: integer/positive answers where
expected, angle sums stay in 0-180 range, budget remainders never
negative).

**Fusion questions (multi-discipline)** — new category of generator,
deliberately distinct from the existing multi-step ones: those chain two
steps of the SAME family (e.g. discount then change, both money); fusion
chains DIFFERENT disciplines end-to-end into one final answer. Shipped
one real example, `generateFusionAreaAngle` (Number -> Geometry -> Angle:
divide to find a rectangle's missing side from its area, then that side
becomes one of three angles summing to a straight line — find the
third). 15,000-draw smoke test, 0 bad draws. This is a template, not
full coverage — extending to more discipline combinations (the brief
specifically asked for number+angle+geometry, which this covers; other
combos like money+time+measurement are natural next candidates) is
scoped as future work, same as how the original multi-step trio started
with 3 examples before any retrofit pass.

**Adventure Map homepage** (`app/(student)/quests/page.tsx`, fully
rewritten) — SVG winding path (hand-placed points, not computed) from A
to B with one node per category (9 total), green checkmark on cleared
nodes, Pintar's marker positioned at the furthest-cleared node, a locked
chest at B that becomes 🏆 once every category is cleared for the
selected mode. Mode-selector pills at the top double as the page's own
`?mode=` navigation. The tappable category grid is kept BELOW the map
(with a ✅ badge on cleared ones) as the actual navigation — the SVG is
the illustration, the grid is what's actually reliable to tap on mobile.
Known v1 limitation: the Pintar marker's percentage-based positioning
assumes the SVG fills its container edge-to-edge; the section's `p-3`
padding means the marker sits very slightly off from the literal node —
close enough to read correctly, worth a proper coordinate fix if it
looks off on a real device.

**Mega badge + run tracking** — new `adventure_champion` badge
(badges.ts) and new migration `0043_adventure_map.sql`: `adventure_runs`
table (one row per student+mode, `categories_cleared text[]`) plus two
Postgres functions, `clear_adventure_obstacle` (atomic append-and-check,
same race-safety pattern as the existing `record_badge_progress`) and
`restart_adventure_run` (resets `categories_cleared` for "Play again"
after a full clear, without touching the badge already earned).
`completeMission` (lib/actions/missions.ts) now accepts an optional
`mode` and calls `clear_adventure_obstacle` when present, returning a
new `adventureCompleted` flag; MissionPlayer shows a distinct gold/purple
mega-reward screen (🏆 Adventure Champion) instead of the normal reward
screen when that flag comes back true, and its "More missions" button
becomes "Back to map" in that case. New `restartAdventure` action +
`ReplayAdventureButton` client component wire up "Play Adventure Again",
shown on the map once every category is cleared for the current mode —
satisfies "let them replay even after finishing everything" without
touching the badge they already earned (target climbs by 1 each clear
instead of capping at 1, so replaying keeps progressing it rather than
becoming a no-op).

**Stuck-help link** — after a 2nd wrong attempt in MissionPlayer, added
"Ask Pintar" (-> /pintar) and "Review this topic" (-> /learn, not a
specific topic — missions aren't currently mapped 1:1 to a curriculum
topic id, so this points at the Belajar tab in general rather than
guessing) alongside the existing worked-hint text.

**NOT done yet, flagged for a future round** (parity with how big
features have always been staged here): migrations 0041/0042/0043 all
need to be applied to the real Supabase project + real-device test
before any of this is live (same "code deployed but not yet playable
until migration applied" gap as every prior mission-engine round);
difficulty-mode scaling not yet threaded through the 3 existing
multi-step generators; only 1 fusion generator exists as a proof of
concept, not a full retrofit; Pintar map marker's exact pixel alignment
worth revisiting on a real phone.

Verified: `tsc --noEmit` clean across the whole project (baseline-only
pre-existing errors — missing lucide-react/react-markdown/remark-gfm
type declarations in this sandbox's partial `node_modules`, and one
`globals.css` import — all present before this round's changes, none
introduced by it). `next build` in this sandbox fails only on the same
pre-existing Google Fonts network-fetch error noted in earlier rounds
(no internet access to fonts.googleapis.com here) plus the same missing
`react-markdown` package — both environment limitations, not code
issues; every touched generator additionally smoke-tested standalone via
a throwaway tsx script (not committed) across all 3 modes with 0 bad
draws.

## Round: Adventure Map UX fix — map IS the navigation (per Lynda's written spec + 3 world reference images)

Follow-up to the previous round: Lynda sent a written UX spec plus 3
reference images (Fun Park / Cityscape / Volcano-mountain) after seeing
the first map version, flagging that the previous build still made
students pick a topic manually — the spec's core line: *"I have a
mission to complete, let's start!" not "which topic do I want to
click?"*. This round changes the actual interaction logic, not just
adds a button on top of the old flow (which the spec explicitly called
out not to do).

**Sequential node progression, not free-pick.** Previously all 9
category tiles were independently tappable in any order. Now the 9
categories ARE the numbered 1-9 nodes on the map, unlocked strictly in
sequence — node N only opens once node N-1 is cleared. `clearedCount` is
now derived as the longest cleared PREFIX of the fixed category order
(`lib/missions/categoryStyle.ts`'s key order), not just `clearedSet.size`
— so a student can't appear "ahead" from an out-of-order clear.

**"START YOUR JOURNEY" / "MULA PENGEMBARAAN"** — new hero CTA sitting
directly above the map. It (and tapping the current/pulsing node) both
skip straight to a mission page: `/quests/page.tsx` now picks the next
uncleared category's mission itself (server-side, same random-pick logic
that used to live on the category page) and links directly to
`/quests/[missionId]`. The category-listing page
(`app/(student)/quests/category/[category]/page.tsx`) still exists
(kept, not deleted — the Today's Focus chips and mission's own back-link
don't currently deep-link to it, but nothing else in the codebase should
break by its continued existence) but is no longer part of the primary
flow per the spec's "topics should not dominate" instruction.

**Topics demoted to metadata.** The old grid-of-9-category-cards under
the map is replaced with a "Today's Focus" row of small read-only pill
labels (cleared = green, current = gold, locked = muted grey text) —
informational, not tappable. The mission page header now leads with
"Mission N" (the node number) before the topic name, matching the
spec's "MISSION 1 / Multiplication ⭐ 10 XP" example.

**Map feels alive** — per the spec's list: cleared nodes show ✓ on a
green circle; the current node pulses (`animate-pulse` + a translucent
`animate-ping` ring) in gold; locked nodes render at reduced opacity in
grey and are plain (non-interactive) SVG, not links; path segments
before the current node render as a solid brighter gold line, segments
after as a dashed faded white line — so "how far I've come" reads at a
glance. Pintar's marker sits at the furthest-cleared node (point A if
nothing cleared yet). The reward screen (non-mega) now also names the
NEXT node's category ("Next stop: Fractions") computed server-side from
the fixed sequence — a step toward the "Pintar as coach" framing without
building a real adaptive recommender (see below).

**Three difficulty worlds** — the 3 reference images Lynda provided
(Fun Park for Easy, Cityscape for Medium, Volcano/mountain for Hard) are
now the actual map backdrops, saved as `public/quests/world-{easy,
medium,hard}.webp`. Converted from the uploaded PNGs (~2.6MB each) to
WEBP at quality 72 (~210-230KB each) — an ~92% size cut, since these load
on every visit to the Quests homepage and the originals would have been
a real mobile-data/LCP cost. The same 1-9 node path coordinates overlay
all three backdrops (hand-placed to roughly track a visible trail in
each image); swapping `mode` swaps both the backdrop image and which
world it visually is, while the underlying progression logic is
identical across all three, exactly as the spec asked.

**Deliberately NOT built this round** (flagged, not silently skipped):
the spec's item 4 ("system determines the mission based on year level,
KSSR coverage, previous performance, current progression, difficulty,
topics needing reinforcement") is a real adaptive-recommendation engine
— what's shipped is the simpler, honest version of that: a FIXED
category sequence plus a random mission pick within the current
category, which delivers the "the system decides, not the student"
FEELING the spec is really after, without the performance-tracking
infrastructure a true adaptive engine would need (that's a much bigger
scoped feature — recommend treating it as its own future round rather
than folding it in here silently). The path coordinates are hand-placed
against the reference art at one viewport reference size — worth a
real-device check since portrait screen aspect ratios vary. The old
"or try a different story" mission list on the category page (from the
previous round) is still there but is now dead-flow from the main map —
not removed in case it's still useful as a deep link, flagged for Lynda
to say whether to delete it outright.

Verified: `tsc --noEmit` clean project-wide (same pre-existing baseline
errors as noted in every prior round, none new). Multi-discipline
(fusion) question work from the previous round is unchanged/untouched
this round, per Lynda's note to keep building on it — next round's
natural continuation is more fusion generators (money+time+measurement
etc.) rather than more map polish.

## Round: Scene art wired in + a real difficulty-mode bug caught + "Pintar walks to the next stop"

Lynda delivered 29 scene illustrations as 3 contact-sheet grids (10+10+9
panels) matching the checklist from the previous round's reply exactly.
Processed and wired them in, and caught a real correctness bug from two
rounds ago while doing it.

**29 scenes cropped, matched, and wired.** Split each grid into its
cells (uniform grid, ~0.8% inset to clear the panel borders — verified
clean via contact-sheet review, no gutter bleed). Matched every cell to
its mission+variant by content (kittens/numbered trees -> Lost Kittens
variant 0 "Number Forest", grocery store interior -> Grocery Challenge
variant 1, etc.) — all 29 confirmed against the variant `tokens` Claude
had extracted from missions.ts, not guessed from filenames. Resized
each to a 1000px-longest-side WEBP at quality 78 (~2.36MB total for all
29, ~81KB average) — kept each image's NATIVE aspect ratio rather than
force-cropping every one to an identical size: the three source grids
have different aspect ratios (landscape ~1.6:1, ~1.25:1, and portrait
~0.67:1), so a uniform hard crop would have cut real content out of
whichever set didn't match; the mission intro screen instead uses a
fixed `aspect-[4/3]` card with `object-cover`, letting CSS handle
consistent on-screen framing per source image instead of baking in a
lossy crop. Added optional `image?: string` to `MissionVariant`
(`lib/missions/types.ts`) with a doc comment reinforcing the
variant-not-per-question rule from the earlier design conversation.
Files live at `public/missions/scenes/{mission-id}-{variantIndex}.webp`.
MissionPlayer's intro screen now shows the scene as a banner with
Pintar's sprite overlapping its bottom edge (`-mt-16` pull); falls back
to the original plain layout when `variant.image` is undefined, so
nothing broke for the (currently zero, but future-proofed) case of an
unillustrated variant.

**Bug caught while wiring images in: difficulty-mode scaling from 2
rounds ago was never actually taking effect.** `lib/missions/types.ts`
and `missionMath.ts` were correctly updated back then so each generator
ACCEPTS a `mode` parameter — but every call site in `missions.ts` was
still `generateMath: () => generateEqualShare([5, 4, 8])`, an arrow
function that takes NO parameters and therefore silently ignores the
`mode` argument MissionPlayer passes in. Every mission has been running
at Medium's number ranges regardless of the selected mode this whole
time. Root cause: the earlier round's smoke test called the generator
functions directly (`generateMissingAngle([...], mode)`) to verify the
math itself was sound, but never exercised the actual
`variant.generateMath(mode)` call chain the app uses at runtime — so the
wiring gap was invisible to that test. Fixed via a scripted pass over
all 26 `generateMath: () => generateXxx(...)` call sites for the 12
mode-aware generators, rewriting them to `generateMath: (mode) =>
generateXxx(..., mode)` (3 `generateBudgetSubtract` call sites needed a
manual follow-up fix — mode landed in the wrong positional argument
slot since that generator takes an optional `budgetOptions` array before
`mode`). The 3 existing multi-step generators are untouched/still not
mode-aware, consistent with the standing note that Hard mode is meant to
prefer them as-is rather than also scaling their numbers.

**Verification this round is stronger than before, specifically to
close the gap that let the bug through**: a new smoke test now calls
`variant.generateMath(mode)` through the REAL mission objects (every
mission x every variant x every mode x 20-30 draws = 1740-2610 draws
across different runs), not the raw generator functions in isolation —
0 failures. A separate check confirmed all 29 `image` paths resolve to
an actual file on disk. `tsc --noEmit` clean project-wide (same
pre-existing baseline noise as every prior round).

**"Pintar walks to the next stop"** — Lynda asked whether Pintar could
visibly be at node 1 when the journey starts, then move to the next
node right after finishing one, before the next question. Full
persistent-map-during-a-question is a bigger layout refactor (would need
the map to live in a shared Next.js layout instead of unmounting on
every route change) — flagged, not attempted this round. What's shipped
instead: a new `PintarWalkStrip` component on the (non-mega) reward
screen — a compact 1-9 dot row that shows Pintar sitting at the
just-cleared node for a beat ("Obstacle N cleared!"), then animates one
step forward ("Heading to Obstacle N+1...") via a CSS transition, right
at the moment finishing a mission would naturally prompt it. Wired via
new `nodeNumber`/`totalNodes` props threaded from
`/quests/[missionId]/page.tsx` (same node-order computation already
used for the "Mission N" header and "Next stop" label) through to
MissionPlayer. Purely visual — doesn't touch the actual server-side
unlock state in `adventure_runs`, just previews the move that's about to
happen once the student taps through to the map.

**Flagged, not built this round**: persistent-map full architecture
(map stays mounted and Pintar's marker animates in place across a route
change, instead of the reward-screen preview strip shipped here) — real
option if Lynda wants the fuller version later; worth prototyping as its
own round given the layout refactor involved. Multi-discipline (fusion)
question set is still just the 1 example from 2 rounds ago — Lynda's
asked to keep building these out, next natural round.

## Round: Scrollable per-world adventure paths (Candy Crush / Duolingo-style redesign)

Lynda reported level 1-3 nodes on the top map were partially hidden
behind the bottom nav and the Pintar avatar, and that the map felt like
a static poster rather than a journey — with a detailed spec asking for
a scrollable, camera-following, parallax multi-level map per category
("world"), matching Candy Crush / Duolingo / Royal Match / Monopoly Go
world-map conventions.

**Root cause of the hiding bug, found before any redesign work**: the
top map's `VIEW_H` constant was declared as 1752 but the actual
`<svg viewBox>` and container `aspectRatio` both hardcoded `1400`
instead of referencing it — so `PATH_POINTS` for levels 1 and 2 (y=1620,
y=1480) sat OUTSIDE the visible viewBox entirely and were clipped at the
container edge, right where the fixed bottom nav sits. This is
superseded by the full redesign below rather than patched in place.

**Architecture change: categories are now actual multi-level "worlds",
not single 1-question obstacles.** Each of the 9 categories (matching
Lynda's requested names exactly — Number Forest, Fraction Valley, Money
Market, Measurement Village, Geometry Temple, Data Town, Time Station,
KBAT Library, Real Life City, see `lib/missions/worldConfig.ts`) now has
its own `LEVELS_PER_WORLD = 8` scrollable path at `/quests/world/
[category]`. A level isn't a specific authored mission — same
"unlimited via randomization" approach as before, just now expressed as
8 numbered stops instead of 1. New migration `0044_world_levels.sql`
adds a `world_levels` table (student+mode+category → cleared_count) and
`clear_world_level`/`restart_world` functions, layered UNDER the
existing `adventure_runs` (0043): `completeMission` now calls
`clear_world_level` first, and only calls the existing
`clear_adventure_obstacle` (marking the whole category "cleared" on the
top map) once a world's 8th level clears — so the mega
`adventure_champion` badge now requires walking all 9 worlds fully
(9×8 = 72 completions for a full clear), not 9. The old
`/quests/category/[category]` obstacle-briefing page is deleted
(fully superseded, not just demoted this time).

**New `AdventurePath` component** (`components/student/AdventurePath.tsx`)
is the actual game-map: an `overflow-y-auto` scroll container (not a
fixed-size static SVG) tall enough for all 8 levels plus safe-area
padding, path drawn bottom-up (level 1 lowest) with alternating
left/right zig-zag. Requirement-by-requirement: (1) scrollable — yes,
native touch/drag scroll on its own container; (2) auto-focus — a
`useEffect` calls `scrollIntoView({ block: "center" })` on the current
node's ref on mount; (3) node size +20% (72px, up from ~60px) with
spacing that keeps every node clear of the next; (4) parallax — two
decorative layers (clouds, leaves) translate at 0.15x/0.35x of
`scrollTop`, updated via an rAF-throttled scroll handler; (5) completed
path segments render solid gold with a `drop-shadow` glow, the current
node pulses (`animate-pulse` + an `animate-ping` ring), locked nodes sit
at 50% opacity and aren't links; (6) — see architecture note above;
(7) camera — same as (2); (8) safe area — level 1 sits with **268px**
of clearance above the container's bottom edge (verified numerically,
see below), well over the requested 120px minimum, and the component
never positions a node outside its own scrollable bounds (unlike the
old bug).

**Wiring**: the world page picks a random mission from the category
(same pattern as the old obstacle page) and only the CURRENT node is a
real link (`/quests/[missionId]?...&category=X&level=N`); cleared/locked
nodes are inert in this v1 — replaying a specific old level isn't
supported yet, only replaying the whole world via the new
`ReplayWorldButton` once it's fully cleared (mirrors the existing
`ReplayAdventureButton` pattern for the whole map). The mission page and
`MissionPlayer` now speak in "Level N of 8" / world-name terms instead
of the old "Mission N of 9" node language; the `PintarWalkStrip` from
the previous round is repointed at level-within-world progress
(genuinely more fitting now that there ARE multiple levels to walk
between) and a distinct small "🏆 World complete!" banner replaces it
once level 8 clears. The top-level `/quests` page is now a "choose your
world" list (9 world cards, sequential lock same as before, progress
shown as X/8) rather than attempting a second complex scrollable view —
kept simpler by design, since the interesting map experience now lives
one level down, per world.

**Verified**: node placement math checked numerically outside the
browser (level 1: top=956, bottom edge=1028, clearance to container
bottom=268px, well past the 120px ask; level 8 sits at top=32, both
within the container's own height, nothing clipped). `tsc --noEmit`
clean project-wide (one stale `.next/types` reference to the deleted
category route, cleared by removing `.next/types` — not a real error).
Mission generator smoke test re-run post-refactor: 1305 draws, 0
failures — confirms the world/level plumbing didn't disturb the
generator-wiring fix from the previous round.

**Not done this round, flagged**: replaying a specific already-cleared
level (only whole-world replay exists); the parallax decoration set is
simple (clouds + leaves) rather than being per-world (Number Forest vs
Money Market currently share the same decorative sprites, just a
different backdrop photo) — theming the parallax elements per world is
a natural next polish pass; migrations 0043 AND 0044 both need applying
to the real Supabase project before any of this is live, same standing
gap as every round since the map work started.

## Round: Real bug found — PintarChat never included the student's own messages in history

Lynda relayed a bug report (from her husband's side, diagnosing via a
pasted transcript) that Pintar loses all context after a short reply
like "ok", even defaulting to an unrelated exercise, and even when
directly asked "can you help me answer my question". Correctly
identified as a `history`-construction bug on the Congak side, since
Pintar's engine is intentionally stateless and depends entirely on
Congak resending the full conversation every request.

**Root cause, confirmed exactly**: `PintarChat.tsx`'s `callEngine`
function updated `historyRef.current` after every response with:
```
historyRef.current = [...requestHistory, { role: "pintar", text: data.reply }];
```
This appends ONLY the assistant's own reply — the student's message
that PROMPTED that reply (`message`, sent as its own top-level request
field) was never added to the `history` array at any point, for any
turn. So `history` silently accumulated exclusively Pintar's own past
replies. By the third turn in the reported transcript (student says
"ok" after asking a multiplication/division question), the `history`
sent to the engine was just two consecutive `role: "pintar"` entries —
the actual question was nowhere in it. Simulated both the buggy and
fixed logic against the exact reported transcript to confirm: under the
old code, the student's "3567 multiply with 25...divide by 15?" message
never appears in any `history` payload sent to the engine, at any
point — not "gets lost after a few turns", literally never recorded
once.

**Fix**: same location, now conditionally includes the student's own
message in the appended slice, keyed off the existing `showUserBubble`
flag so the internal `__greeting__` trigger (not something the student
said) doesn't get recorded as a fake user turn:
```
historyRef.current = showUserBubble
  ? [...requestHistory, { role: "user", text: message }, { role: "pintar", text: data.reply }]
  : [...requestHistory, { role: "pintar", text: data.reply }];
```

Verified: `tsc --noEmit` shows no new errors in `PintarChat.tsx` beyond
the pre-existing sandbox baseline (missing `react-markdown`/
`remark-gfm`/`lucide-react` type declarations, and the known
`children`-implicit-any lines). Re-ran the exact transcript through both
the old and new logic in a standalone simulation — confirms the fix
correctly preserves the student's question in `history` from that point
on, where the old code never did.

Server-side engine now has a "which question were you asking about?"
fallback per Lynda's husband's note — that's damage control on his end
and should stay regardless of this fix (a real product safety net for
any future context gaps, not a substitute for sending correct history).

## Round: Three bugs from real usage — grading, journey wording, path placement

Lynda played through the app herself and sent 3 screenshots. All three
were real, fixed for real:

**1a. Correct answer marked wrong.** "The Great Leak" mission asks for
water remaining after a conversion+subtraction; its own hint text shows
the answer WITH a unit ("11200 - 1120 = 10080 mL"), so Lynda typed
"10,080mL" — matching exactly what the app itself showed her — and it
was marked wrong. Root cause: `lib/questions/grading.ts`'s
`normalizeAnswer` already stripped thousands-commas but never stripped a
trailing unit suffix, and the generator's stored `correctAnswer` is the
bare number ("10080") with no unit. Fixed by extending
`normalizeAnswer` to drop a trailing unit label (e.g. "ml", "cm") ONLY
when what's left is purely numeic — checked against every
`correctAnswer:` across both `lib/missions/missionMath.ts` and
`lib/questions/generators/*.ts` first to confirm nothing relies on a
trailing letter surviving comparison (fractions use "/", money uses a
"RM" PREFIX not suffix, so unaffected). Verified with 10 hand-picked
cases including the exact reported input, a wrong-number case (must
still fail), and the RM-prefix case (intentionally still fails — a
prefix/suffix mismatch is a different bug, out of scope here, and
"fixing" it by guessing would risk accepting wrong answers).

**1b. "Ask Pintar" lost the question.** The link went to a bare
`/pintar` with no context, so the specific problem the student was
stuck on had to be retyped from memory. Fixed: the link now carries the
actual question text as `?ask=` (`/pintar?ask=<encoded question>`); the
Pintar page reads it and passes it to `PintarChat` as a new
`initialQuestion` prop, which — after the normal greeting — sends it as
a real first message automatically, so a student lands in Pintar's chat
with their actual stuck problem already asked, not an empty box.

**2. "Start Your Journey" never changed to "Continue" once worlds were
already cleared.** Cosmetic but confusing — 3/9 worlds ticked done and
the button still read like day one. Fixed: the top map now computes
`hasAnyProgress` (any world fully cleared, OR the current world already
has 1+ levels done) and swaps the label to "CONTINUE YOUR
JOURNEY"/"TERUSKAN PENGEMBARAAN" once that's true. The href/behavior
was already correct (always resumes at the true next level) — this was
purely a wording fix, not a progress-tracking bug.

**3. Level nodes floating disconnected from the artwork's path
("until it goes to the sky").** The previous `AdventurePath` positioned
nodes via an abstract alternating-percentage zig-zag with NO relationship
to what's actually drawn in the backdrop image, and displayed that
backdrop with `object-cover` inside an arbitrary-height scroll
container — so even hand-picked coordinates couldn't have lined up with
the art, since the image itself was being stretched/cropped
unpredictably relative to any fixed percentage grid. Fixed properly, not
patched: new `lib/missions/worldPathPoints.ts` hand-traces 8 points
(percent of image width/height) actually walking the visible stone
path/road/trail in each of the 3 backdrop images (viewed each image
directly to trace them), and `AdventurePath` now renders the backdrop at
its TRUE native aspect ratio (`898/1752`, `object-contain` in an
aspect-ratio box, no crop/stretch) so those percentages land exactly
where traced. Nodes and connecting path lines both now read off the same
`pathPoints` array. Kept a generic zig-zag as a fallback (only used if a
future mode/point-count doesn't have traced points yet) rather than
crashing.

Verified: `tsc --noEmit` clean (one shifted-line-number instance of the
pre-existing `ReactMarkdown` children-any warning, not new). Re-ran the
mission-generator smoke test (1305 draws, 0 bad) plus a new pass
confirming `isAnswerCorrect` still accepts every mission's exact
`correctAnswer` against itself post-fix (0 mismatches) — guards against
the unit-stripping change accidentally breaking a different answer
format.

**Not done / flagged**: replaying one specific already-cleared level
still isn't supported (only whole-world replay); the hand-traced path
points are eyeballed against the artwork, not pixel-measured — worth a
quick look on a real device per world/mode combination; the RM-prefix
vs unit-suffix answer-format inconsistency between generators (money
bakes "RM" into the front of `correctAnswer`, measurement doesn't put
anything on the number) is still there, just not making anything wrong
right now — a future consistency pass could standardize this rather
than only special-casing the suffix direction.

## Round: Path placement (properly this time), the real level/topic mismatch, and a much simpler homepage

Lynda pushed back that the map still pointed at trees/sky, asked for a
clear explanation of how missions actually work because "the map says
level 2 but inside you're already at topic 5", asked for topic titles
to live beside the map numbers instead of in a big list, and asked for
the whole Quests homepage simplified to 3 big Easy/Medium/Hard buttons
with a small world visual on each and a big Pintar.

**Path placement, done properly this time.** Previous round's points
were eyeballed without a reference grid and were visibly wrong. This
round: generated a 10%-gridline overlay on each of the 3 backdrop images
first, read pixel-accurate percentages directly off the grid, then
rendered the 8 traced points BACK onto each image as a visual proof
(dots + connecting lines) and viewed the result before shipping —
caught and fixed one remaining bad point this way (medium mode's level
8 landed in open sky between buildings; moved it onto the "KEEP GOING"
billboard rooftop, a real landmark). All 24 points (3 modes × 8 levels)
now sit on an actual path/road/bridge/log/landmark in every backdrop,
verified by eye against the rendered proof images before delivery, not
just described in a code comment.

**The real cause of "map says level 2, inside I'm on topic 5"**: found
and fixed a second real bug, not just a documentation gap. The world
page picked which mission to show for the "current" level via
`missions[Math.floor(Math.random() * missions.length)]` — a fresh
random pick on EVERY page load, with no relationship to the level
number at all. So revisiting "Level 2" could show a completely
different mission than it did last time, and there was never a stable
answer to "what is level 2" — explaining exactly the confusion
reported. Fixed by making the mission assignment a pure function of
level number: `missions[(levelNumber - 1) % missions.length]`, cycling
through a category's mission pool deterministically. A category with
only 1 mission shows that mission at every level (still fresh numbers
each time via `generateMath`); a category with 3 missions cycles
1-2-3-1-2-3-1-2 across the 8 levels. Level N is now always the same
mission, every visit — the map and "what's inside" can no longer
disagree.

**Topic titles moved onto the map itself, list removed from the
homepage.** `AdventurePath` now takes an optional `levelLabels` array
(now populated for real, using the deterministic mapping above) and
renders each level's mission title as a small pill beside its node —
placed on whichever side has more room so it doesn't run off the image
edge. The homepage's big "list all 9 worlds with progress" section is
gone entirely.

**Homepage rebuilt around 3 big mode cards.** Replaced the old
mode-pill-row + separate journey-CTA + world-list stack with: a large
Pintar image up top (the "attract attention" ask), then 3 full-width
mode cards (Easy/Medium/Hard), each showing a thumbnail of that mode's
actual world backdrop, worlds-cleared progress (e.g. "3/9 worlds"), and
a Start/Continue/Replay label that's accurate per mode (computed by
querying `adventure_runs` and `world_levels` across all 3 modes in one
pass, so every card's progress is real without needing a mode selected
first). Tapping a card goes straight to that mode's next-uncleared
world — no intermediate "choose a world" screen, consistent with the
"system decides, student doesn't browse a list" principle from the
very first UX-fix round. `MODE_ACCENT` was initially written with a
`merah` color token that doesn't exist in `tailwind.config` (checked
against the real token list before shipping — `saga` is the actual
red-family token) — caught and fixed before delivery, not a customer-
facing miss.

**Known trade-off, flagged**: the old single "Play Adventure Again"
mega-button (replaying the ENTIRE map — all 9 worlds — at once after a
full clear) no longer has a homepage entry point now that the world
list is gone; `ReplayAdventureButton` still exists and works, just
isn't wired into the new homepage. Replaying is still possible per-world
via each world page's own "Replay This World" button, just not as one
single mega-action anymore — worth a decision from Lynda on whether
that mega-replay button should come back somewhere (e.g. on a mode
card, once nesting a button inside a `<Link>` card is worked out) or is
fine to leave as per-world only.

Verified: `tsc --noEmit` clean. Mission-generator smoke test re-run
(870 draws, 0 bad) after the deterministic-level and homepage changes.

## Round: Progress not saving — traced to a likely un-applied migration, plus two real UI fixes

Lynda sent 2 screenshots: homepage shows Easy at "3/9 worlds" but the
Measurement Village map (Easy) shows "0/8 levels" and resets to level 1
every time she reopens it after playing. Also flagged the 8-vs-9 number
proximity being confusing, and level labels repeating on the map.

**Most likely root cause — NOT something fixable from this side alone.**
Checked every RPC function name between `lib/actions/missions.ts` and
both `0043_adventure_map.sql` / `0044_world_levels.sql` — all match
exactly, no typo. The far more likely explanation: migration
`0044_world_levels.sql` (the one that creates `world_levels` and the
`clear_world_level`/`restart_world` functions) has probably not been
applied to the real Supabase project yet — flagged as an outstanding
step in every round since it was written, still outstanding. If that
migration isn't applied, `supabase.rpc("clear_world_level", ...)` fails
because the function doesn't exist — but Supabase's JS client doesn't
throw on this, it returns `{ data: null, error }`, and the code was
previously destructuring only `data`, silently ignoring `error`. Net
effect: a level "completes" visually in the moment (XP/reward screen
shows, `PintarWalkStrip` animates forward) because that part of
`completeMission` doesn't depend on `world_levels` — but nothing was
ever actually saved to `world_levels`, so the next page load reads
`cleared_count = 0` again. This exactly matches "moves to next number,
then resets to 1 when reopened." Separately, the homepage's "3/9" for
Easy is very likely LEFT OVER from the OLD single-obstacle-per-category
system (before levels existed at all) — those 3 categories were marked
cleared via `clear_adventure_obstacle` directly, in an earlier round,
before `world_levels` existed. So "3/9 worlds done" and "Measurement
Village 0/8" can both be true and non-contradictory: 3 categories
finished under the old system, and the 4th (first one played under the
NEW system) can't save progress if 0044 was never applied.

**Fixed the SILENT part of this regardless** (this was a real gap worth
closing even once the migration question is confirmed): both
`clear_world_level` and `clear_adventure_obstacle` calls in
`completeMission` now log their `error` to the server console instead of
discarding it, tagged with which migration file to check. Same for the
`world_levels` read on the world page (skips logging the expected
"no rows yet" case — `PGRST116` — so a normal first-time visit to a
world doesn't spam the log, but anything else, like the table not
existing, now shows up). None of this changes what the student sees;
it means the NEXT time something like this happens, Vercel's function
logs will say exactly which migration to check instead of nothing at
all.

**Fixed for real, no DB dependency**: (1) level labels beside map nodes
now show ONLY on the current/next node, not on every cleared and locked
one — with as few as 1-2 authored missions per category cycling across
8 levels, showing all 8 labels was an obviously-repetitive wall of
duplicate text (exactly what the screenshot showed); (2) the world
page's level readout changed from "0/8 levels" to "Level 1 of 8" —
different phrasing from the homepage's "3/9 worlds" specifically so the
two numbers read as clearly different things at a glance instead of two
similar-looking fractions sitting near each other in the flow.

**Needs Lynda to confirm, next message**: whether migrations 0043 and
especially 0044 have actually been run against the production Supabase
project. This can't be verified from the code side — if 0044 hasn't
been applied, that's very likely the entire explanation for progress not
saving, and applying it (Supabase dashboard -> SQL Editor -> paste
0044's contents -> Run) should fix it immediately, with the new logging
now in place as a safety net if something else is also wrong.

Verified: `tsc --noEmit` clean.

## Round: Found the real cause — stale service worker cache, not a save failure

Lynda ran the diagnostic query from last round. Result: `world_levels`
showed `number` at 1 and `measurement` at a full 8 — real, persisted,
correct data. This conclusively rules out the "migration not applied /
RPC silently failing" theory from last round: saving works and always
has (at least since these rows were written).

**Real root cause, found via `next.config.js`**: this app is a PWA
(`next-pwa`) with an active service worker in production
(`disable: process.env.NODE_ENV === "development"`). The custom
`runtimeCaching` array (added for lesson content + images) REPLACES
`next-pwa`'s built-in default caching rules entirely rather than merging
with them — so whatever sensible default behavior it normally ships for
plain page navigations was silently gone, with no rule covering regular
page loads at all. Net effect: reopening the installed app could serve
an OLD cached HTML snapshot of a page instead of asking the server for
current data — matching "closes and reopens, map shows old progress"
exactly, and very plausibly ALSO explaining why the map still looked
wrong even after 2 rounds of path-point fixes that were verified correct
by rendering them onto the actual images before shipping: she may have
been looking at a cached page from BEFORE those fixes, not the current
one.

**Fix**: added an explicit `runtimeCaching` rule matching navigation
requests (`request.mode === "navigate"`, i.e. real page loads) with a
`NetworkFirst` strategy — tries the live network first (5s timeout),
only falls back to a cached copy if genuinely offline. Existing
`StaleWhileRevalidate` (lesson content) and `CacheFirst` (images) rules
left untouched — those are fine for slow-changing content, this was
specifically about pages showing live, per-student progress.

Verified: `next.config.js` loads without error (`node -c` + a direct
`require()` check — config isn't TypeScript so `tsc` doesn't cover it).

**Not yet confirmed**: whether this was the ONLY issue, or whether the
homepage's world-count and the map's path placement need a fresh look
once this deploys and Lynda does a hard reload — asked her to check
after deploying, since a stale service worker can't be fully ruled out
as "definitely the whole story" without seeing it fixed live.

## Round: Actually re-checked the screenshot, found real remaining issues, fixed them

Lynda pushed back on the previous round's "looks correct" assessment.
Right call — I'd described the screenshot from memory instead of
inspecting it closely, and there WERE real problems in it.

**Path placement — genuinely still wrong, but only at the very top of
each world.** Zoomed into all 3 panels of her screenshot pixel-by-pixel.
Levels 1-7 in each world were correctly on-path. Level 8 (the final
node before reaching "B") was NOT: Number Forest's landed in open sky
above the mountain peaks, Easy's sat at balloon-height above the Fun
Park sign instead of on the ground, Medium's sat just above the "KEEP
GOING" billboard instead of on it. All three re-traced against the grid
overlay again and re-verified by rendering the corrected points back
onto the actual images before shipping this time (same discipline as
before, just re-applied more carefully to the one node that was still
off). This is presumably also why my "already correct" read last round
was wrong — I described the panels from memory/general impression
rather than zooming into the specific area she was pointing at.

**The recurring "8 vs 9" / "homepage says 4, inside says 1" confusion —
addressed with a real design change, not just another explanation.**
For context (not a bug, but worth being explicit about since it's come
up twice): "4/9 worlds" and "Level 1 of 8" were never contradicting each
other — 4 WHOLE worlds cleared out of 9 total, and the 5th world hasn't
been started yet, so Level 1 there is exactly correct. But two numbers
that close together, shown in different corners of the flow, are a
legitimate readability problem regardless of being "technically
correct" — a student (or a parent skimming quickly) shouldn't have to
puzzle through this each time. Fixed by changing
`LEVELS_PER_WORLD` from 8 to 5 (`lib/missions/worldConfig.ts`) — a
number nobody could mistake for "9". Side benefits: less title
repetition on the map (5 slots to fill from a category's mission pool
instead of 8, so a 2-mission category now only repeats once instead of
three times), and each world completes faster, which is probably better
pacing for a Year 4-6 audience anyway. `WORLD_PATH_POINTS` re-derived to
exactly 5 points per mode (a verified-on-path subset of the previous 8,
re-rendered onto the images to confirm before shipping, not just
trusted by inheritance). Existing saved progress is unaffected —
`clearedCount` is read via `Math.min(saved_count, LEVELS_PER_WORLD)`,
so a student who'd already hit 8/8 under the old system now correctly
reads as complete (capped at 5/5), nothing lost or corrupted.

Verified: `tsc --noEmit` clean. New standalone check confirms
`WORLD_PATH_POINTS[mode].length === LEVELS_PER_WORLD` for all 3 modes
(would have caught the very type of mismatch `AdventurePath`'s fallback
logic is designed to survive, but shouldn't be relied upon silently).

## Round: New public "Buy Congak a Coffee" support page

Lynda wants to distribute Congak widely and is preparing for real
hosting + Pintar API-token costs at scale. Asked for a new public page
with her Touch 'n Go eWallet QR code, explaining Congak is free and
inviting optional support — explicitly asked for better copy than her
own draft.

Shipped `/coffee` (`app/coffee/page.tsx`, public — no auth, matches the
pattern of the existing root marketing `app/page.tsx`), with copy in
`lib/content/coffeeCopy.ts` following the same bilingual-content-file
convention as `homepageCopy.ts`. Her QR card image saved as
`public/support/tng-qr.webp` (converted from the uploaded JPG, ~55KB).

Copy leans on being explicit and repeated about "optional" (said twice,
not buried in fine print) and honest about where the money actually
goes (hosting + Pintar's per-use AI tokens, not vague "support us")
rather than generic charity-page language — matches the standing project
value of not overselling/fabricating claims (same principle documented
in `homepageCopy.ts`'s own header comment about swapping placeholder
stats for real ones).

**Not done, flagged**: no link to `/coffee` was added anywhere else in
the app (nav, footer, dashboard) — Lynda's ask was specifically for the
page itself, presumably to link directly when sharing Congak. Worth a
follow-up if she wants it discoverable from inside the app too (e.g. a
small link in the parent dashboard or homepage footer).

Verified: `tsc --noEmit` clean.

## Round: Coffee page linked in-app, feedback email added

Follow-up to the `/coffee` page: Lynda asked for it to be linked from
inside the app too, plus a feedback email (razsoulconsultancy@gmail.com)
with a line inviting people to share thoughts — asked for a rephrase of
her own draft.

**Feedback line, rephrased**: her draft ("Share us your thought so we
can make Congak better together") became "Found a bug, or have an idea
to make Congak better? We'd genuinely love to hear it." — more natural
English/BM phrasing, same warm intent, plus gives people concrete
categories (bug vs idea) rather than an open-ended "thoughts" which is
harder to actually act on when replying to an email.

**Where it's linked**: deliberately NOT on student-facing screens —
"support us financially" and "email us feedback" are asks for the
adult, not the child playing missions. Added to: (1) the public
marketing homepage's existing footer (`components/home/Homepage.tsx`) —
a "Support Us" link alongside the existing Login/Sign up links, plus
the feedback email; (2) the parent dashboard
(`app/parent/dashboard/page.tsx`), which had no footer at all before —
added a new shared `SupportFooter` component
(`components/shared/SupportFooter.tsx`) for this, coffee link + email,
reusable if a 3rd surface wants it later. The `/coffee` page itself also
got its own feedback section (same copy, same email) so it doesn't only
sell the coffee ask without also inviting the "or just tell us what's
wrong" option.

Verified: `tsc --noEmit` clean.
