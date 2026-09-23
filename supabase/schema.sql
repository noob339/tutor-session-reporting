-- Dedicated public demo: fictional records only. No authentication/ownership rules.
-- Run as the project owner in Supabase SQL Editor, before seed.sql.
-- Safe to rerun against this schema; does not drop tables or delete records.
begin;

create table if not exists public.tutors (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.tutors(id) on delete restrict,
  name text not null check (length(trim(name)) > 0),
  focus text not null default '',
  site text not null default '',
  schedule text not null default '',
  status text not null default 'Active' check (status in ('Active', 'Stopped')),
  stopped_reason text not null default '',
  stopped_date date,
  created_at timestamptz not null default now(),
  constraint students_stopped_details check (
    (status = 'Active' and stopped_date is null and stopped_reason = '') or
    (status = 'Stopped' and stopped_date is not null and length(trim(stopped_reason)) > 0)
  )
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,
  -- Historical tutor, deliberately independent of the student's current assignment.
  tutor_id uuid not null references public.tutors(id) on delete restrict,
  session_date date not null,
  status text not null check (status in ('completed', 'TA', 'SA', 'H')),
  minutes integer not null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  constraint sessions_duration check (
    (status = 'completed' and minutes between 1 and 1440) or
    (status in ('TA', 'SA', 'H') and minutes = 0)
  )
);

create table if not exists public.student_achievements (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,
  -- Never derived from the student's current assignment when reporting.
  tutor_id uuid not null references public.tutors(id) on delete restrict,
  achievement_date date not null,
  description text not null check (length(trim(description)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists students_tutor_idx on public.students(tutor_id);
create index if not exists sessions_student_idx on public.sessions(student_id);
create index if not exists sessions_tutor_date_idx on public.sessions(tutor_id, session_date);
create index if not exists achievements_student_idx on public.student_achievements(student_id);
create index if not exists achievements_tutor_date_idx on public.student_achievements(tutor_id, achievement_date);

alter table public.tutors enable row level security;
alter table public.students enable row level security;
alter table public.sessions enable row level security;
alter table public.student_achievements enable row level security;

-- Remove default table privileges (including TRUNCATE, which RLS does not gate).
revoke all on public.tutors, public.students, public.sessions, public.student_achievements
  from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.tutors, public.students, public.sessions, public.student_achievements
  to anon, authenticated;

-- Only workflow columns are writable; IDs/creation timestamps cannot be corrected.
grant insert (id, student_id, tutor_id, session_date, status, minutes, notes)
  on public.sessions to anon, authenticated;
grant update (student_id, tutor_id, session_date, status, minutes, notes)
  on public.sessions to anon, authenticated;
grant update (tutor_id, name, focus, site, schedule, status, stopped_reason, stopped_date)
  on public.students to anon, authenticated;
grant insert (id, student_id, tutor_id, achievement_date, description)
  on public.student_achievements to anon, authenticated;
grant update (student_id, tutor_id, achievement_date, description)
  on public.student_achievements to anon, authenticated;
grant delete on public.student_achievements to anon, authenticated;

-- Operation-specific policies intentionally allow all demo visitors, including
-- signed-out visitors. Tutor selection is NOT authorization.
drop policy if exists demo_tutors_read on public.tutors;
create policy demo_tutors_read on public.tutors for select to anon, authenticated using (true);
drop policy if exists demo_students_read on public.students;
create policy demo_students_read on public.students for select to anon, authenticated using (true);
drop policy if exists demo_students_update on public.students;
create policy demo_students_update on public.students for update to anon, authenticated using (true) with check (true);
drop policy if exists demo_sessions_read on public.sessions;
create policy demo_sessions_read on public.sessions for select to anon, authenticated using (true);
drop policy if exists demo_sessions_insert on public.sessions;
create policy demo_sessions_insert on public.sessions for insert to anon, authenticated with check (true);
drop policy if exists demo_sessions_update on public.sessions;
create policy demo_sessions_update on public.sessions for update to anon, authenticated using (true) with check (true);
drop policy if exists demo_achievements_read on public.student_achievements;
create policy demo_achievements_read on public.student_achievements for select to anon, authenticated using (true);
drop policy if exists demo_achievements_insert on public.student_achievements;
create policy demo_achievements_insert on public.student_achievements for insert to anon, authenticated with check (true);
drop policy if exists demo_achievements_update on public.student_achievements;
create policy demo_achievements_update on public.student_achievements for update to anon, authenticated using (true) with check (true);
drop policy if exists demo_achievements_delete on public.student_achievements;
create policy demo_achievements_delete on public.student_achievements for delete to anon, authenticated using (true);

notify pgrst, 'reload schema';
commit;
