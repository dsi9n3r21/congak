-- Congak: accessibility preferences.
-- The CSS hooks (.a11y-large-text, .a11y-dyslexia-font, .a11y-low-distraction)
-- have existed in globals.css since Phase 0, but nothing ever let a student
-- actually turn them on — the Profile page just showed a "coming soon" note.

alter table students add column a11y_large_text boolean not null default false;
alter table students add column a11y_dyslexia_font boolean not null default false;
alter table students add column a11y_low_distraction boolean not null default false;
