-- Fictional September 2026 records. Run after schema.sql as the project owner.
-- Stable IDs + DO NOTHING preserve existing records and user edits on rerun.
-- A deleted seeded achievement will be reinserted if you deliberately rerun this file.
begin;

insert into public.tutors (id, name) values
  ('10000000-0000-4000-8000-000000000001', 'Alex Morgan'),
  ('10000000-0000-4000-8000-000000000002', 'Jordan Lee')
on conflict (id) do nothing;

insert into public.students (id, tutor_id, name, focus, site, schedule, status, stopped_reason, stopped_date) values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Maya Bennett', 'Reading & writing', 'Central Library', 'Tuesdays · 4:00–5:30 PM', 'Active', '', null),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'Leo Rivera', 'Mathematics', 'Learning Center', 'Thursdays · 3:30–4:30 PM', 'Active', '', null),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', 'Avery Chen', 'English language', 'Central Library', 'Wednesdays · 5:00–6:00 PM', 'Active', '', null),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000002', 'Sam Taylor', 'Reading & writing', 'Learning Center', 'Previously Mondays · 4:00–5:00 PM', 'Stopped', 'Moved out of the area', '2026-09-15')
on conflict (id) do nothing;

insert into public.sessions (id, student_id, tutor_id, session_date, status, minutes, notes) values
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '2026-09-01', 'completed', 90, 'Reading comprehension and vocabulary.'),
  ('30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', '2026-09-03', 'completed', 60, 'Practiced fractions and number lines.'),
  ('30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000002', '2026-09-07', 'H', 0, 'Site closed for holiday.'),
  ('30000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '2026-09-08', 'completed', 90, 'Paragraph structure and reading fluency.'),
  ('30000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', '2026-09-09', 'completed', 60, 'Everyday conversation practice.'),
  ('30000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', '2026-09-10', 'SA', 0, 'Student unavailable.'),
  ('30000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '2026-09-15', 'TA', 0, 'Tutor unavailable.'),
  ('30000000-0000-4000-8000-000000000008', '20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', '2026-09-16', 'completed', 60, 'Reading a short article together.')
on conflict (id) do nothing;

insert into public.student_achievements (id, student_id, tutor_id, achievement_date, description) values
  ('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '2026-09-08', 'Completed a first independent reading assignment.'),
  ('40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', '2026-09-16', 'Reached a personal conversational English goal.')
on conflict (id) do nothing;

commit;
