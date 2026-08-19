-- Congak: Coins — a second, simpler reward currency alongside XP.
-- Unlike XP (which drives level progression via a curve) coins are a
-- flat balance a student accumulates and could later spend (e.g. on
-- Companion Items, once that reward type is designed) — so it's a plain
-- running total, not level-gated.

alter table students add column coins int not null default 0;
