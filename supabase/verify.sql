-- Optional regression check: run as project owner AFTER schema.sql.
-- All test fixtures and mutations are rolled back. Does not depend on seed data.
begin;

create function pg_temp.expect_error(command text, expected_state text) returns void
language plpgsql as $$
begin
  execute command;
  raise exception 'Expected SQLSTATE %, but command succeeded: %', expected_state, command;
exception when others then
  if sqlstate <> expected_state then raise; end if;
end;
$$;

insert into public.tutors (id, name) values
  ('f1000000-0000-4000-8000-000000000001', 'SQL check tutor A'),
  ('f1000000-0000-4000-8000-000000000002', 'SQL check tutor B');
insert into public.students (id, tutor_id, name) values
  ('f2000000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000001', 'SQL check student');

do $$
declare role_name text;
begin
  if exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname in ('tutors', 'students', 'sessions', 'student_achievements') and not c.relrowsecurity)
  then raise exception 'RLS must be enabled on all four tables'; end if;

  foreach role_name in array array['anon', 'authenticated'] loop
    execute format('set local role %I', role_name);
    if not exists (select from public.tutors where id = 'f1000000-0000-4000-8000-000000000001')
      or not exists (select from public.students where id = 'f2000000-0000-4000-8000-000000000001')
    then raise exception 'Public read access failed for %', role_name; end if;

    insert into public.sessions (student_id, tutor_id, session_date, status, minutes, notes)
      values ('f2000000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000001', '2026-09-30', 'completed', 1440, 'SQL check');
    update public.sessions set session_date = '2026-10-01', status = 'completed', minutes = 45
      where student_id = 'f2000000-0000-4000-8000-000000000001';
    if not exists (select from public.sessions where student_id = 'f2000000-0000-4000-8000-000000000001' and session_date = '2026-10-01' and minutes = 45)
    then raise exception 'Session correction failed'; end if;

    update public.students set tutor_id = 'f1000000-0000-4000-8000-000000000002',
      site = 'Demo library', schedule = 'Fridays at 4 PM', status = 'Stopped',
      stopped_date = '2026-10-02', stopped_reason = 'Fictional move'
      where id = 'f2000000-0000-4000-8000-000000000001';
    if exists (select from public.sessions where student_id = 'f2000000-0000-4000-8000-000000000001' and tutor_id <> 'f1000000-0000-4000-8000-000000000001')
    then raise exception 'Historical tutor changed with student assignment'; end if;

    insert into public.student_achievements (student_id, tutor_id, achievement_date, description)
      values ('f2000000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000001', '2026-09-30', 'SQL check achievement');
    update public.student_achievements set achievement_date = '2026-10-01', description = 'Corrected milestone'
      where student_id = 'f2000000-0000-4000-8000-000000000001';
    if not exists (select from public.student_achievements where student_id = 'f2000000-0000-4000-8000-000000000001' and description = 'Corrected milestone')
    then raise exception 'Achievement correction/read failed'; end if;
    delete from public.student_achievements where student_id = 'f2000000-0000-4000-8000-000000000001';
    if exists (select from public.student_achievements where student_id = 'f2000000-0000-4000-8000-000000000001')
    then raise exception 'Achievement deletion failed'; end if;

    perform pg_temp.expect_error($q$update public.sessions set minutes = 0 where student_id = 'f2000000-0000-4000-8000-000000000001'$q$, '23514');
    perform pg_temp.expect_error($q$update public.sessions set minutes = 1441 where student_id = 'f2000000-0000-4000-8000-000000000001'$q$, '23514');
    perform pg_temp.expect_error($q$update public.sessions set status = 'TA', minutes = 5 where student_id = 'f2000000-0000-4000-8000-000000000001'$q$, '23514');
    perform pg_temp.expect_error($q$update public.sessions set status = 'invalid' where student_id = 'f2000000-0000-4000-8000-000000000001'$q$, '23514');
    perform pg_temp.expect_error($q$update public.sessions set session_date = '2026-02-30' where student_id = 'f2000000-0000-4000-8000-000000000001'$q$, '22008');
    perform pg_temp.expect_error($q$update public.sessions set tutor_id = 'f1000000-0000-4000-8000-999999999999' where student_id = 'f2000000-0000-4000-8000-000000000001'$q$, '23503');
    perform pg_temp.expect_error($q$update public.students set stopped_date = null where id = 'f2000000-0000-4000-8000-000000000001'$q$, '23514');

    update public.sessions set status = 'TA', minutes = 0 where student_id = 'f2000000-0000-4000-8000-000000000001';
    update public.sessions set status = 'SA' where student_id = 'f2000000-0000-4000-8000-000000000001';
    update public.sessions set status = 'H' where student_id = 'f2000000-0000-4000-8000-000000000001';

    perform pg_temp.expect_error($q$insert into public.tutors(name) values ('Forbidden')$q$, '42501');
    perform pg_temp.expect_error($q$update public.tutors set name = 'Forbidden' where id = 'f1000000-0000-4000-8000-000000000001'$q$, '42501');
    perform pg_temp.expect_error($q$delete from public.tutors where id = 'f1000000-0000-4000-8000-000000000001'$q$, '42501');
    perform pg_temp.expect_error($q$insert into public.students(tutor_id, name) values ('f1000000-0000-4000-8000-000000000001', 'Forbidden')$q$, '42501');
    perform pg_temp.expect_error($q$delete from public.students where id = 'f2000000-0000-4000-8000-000000000001'$q$, '42501');
    perform pg_temp.expect_error($q$delete from public.sessions where student_id = 'f2000000-0000-4000-8000-000000000001'$q$, '42501');
    perform pg_temp.expect_error($q$update public.sessions set created_at = now() where student_id = 'f2000000-0000-4000-8000-000000000001'$q$, '42501');
    perform pg_temp.expect_error($q$update public.students set id = gen_random_uuid() where id = 'f2000000-0000-4000-8000-000000000001'$q$, '42501');
    perform pg_temp.expect_error('truncate public.sessions', '42501');
    raise notice 'Demo read/write permissions and constraints passed for %', role_name;
    reset role;
  end loop;
end;
$$;

rollback;
