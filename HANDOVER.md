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

## Migrations: run 0001 through 0038 already (in Supabase SQL Editor, in
order — never skip ahead, each depends on the last). Next new migration
should be **0039**.

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
  `...081` (81 topics). Next new topic should start at `...082`.
- **Verify before shipping**: `cd congak && npx tsc --noEmit` (must show
  zero output) before packaging any zip. This has caught real errors
  every round — don't skip it.

## Current curriculum coverage (81 topics — see note on the denominator)
**Explicit instruction from Lynda: keep going until the real curriculum is
fully covered.** Standing instruction, not a one-off batch.

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

## Workflow with Lynda
Non-technical, testing on Windows/VS Code, deploys via GitHub push →
Vercel auto-deploy. Always: (1) fix/build the feature, (2) run
`npx tsc --noEmit` clean, (3) zip with
`zip -r congak-scaffold.zip congak -x "*/node_modules/*" -x "*/.next/*" -x "*/.git/*"`,
(4) `present_files`, (5) tell her exactly which new migration number(s) to
run and in what order. She replaces files by extracting the zip and
overwriting her local folder (not touching `node_modules`/`.env.local`),
then `git add . && git commit -m "..." && git push`.
