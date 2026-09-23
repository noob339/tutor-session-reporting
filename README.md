# Tutor Session Reporting

A React + Vite application for recording tutoring sessions, updating student details, and reviewing monthly reports. Built with JavaScript, CSS, and Supabase.

This is a public demo with fictional data. Authentication and tutor/staff permissions are outside its scope. Tutor selection is a demo control, not authorization.

## Local setup

Requires Node 22.12 or later.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite, usually http://localhost:5173.

Without Supabase configuration, the app shows a labeled, read-only preview using September 2026 sample records. With configuration, all views load database records. Failed requests show errors and never fall back to sample data.

## Supabase setup

Use a dedicated demo project with the Data API enabled and the `public` schema exposed.

1. In Supabase **SQL Editor → New query**, paste and run [supabase/schema.sql](supabase/schema.sql).
2. In another query, paste and run [supabase/seed.sql](supabase/seed.sql). A fresh seed creates 2 tutors, 4 students, 8 sessions, and 2 achievements.
3. Copy `.env.example` to `.env.local`. Replace the placeholders with your project URL and browser-safe publishable key:

   ```dotenv
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

4. Restart Vite. The header should show **Supabase demo**.

Real environment files are ignored by Git. `VITE_` values are included in the browser bundle; never use a service-role key, secret key, or database password.

The schema can be rerun without dropping tables or deleting records. It is intended for this dedicated schema, not for migrating unrelated existing tables. Seed records use stable UUIDs and `ON CONFLICT DO NOTHING`: reruns preserve edits and do not create duplicates. Rerunning the seed restores any seeded achievement that was deleted.

## Features

- **Attendance:** record completed sessions, tutor absences (TA), student absences (SA), and holidays (H); filter history and correct entries.
- **Students:** update assignments, learning focus, site, schedule, active/stopped status, stopped reason, and stopped date. Add, edit, and remove dated achievements.
- **Monthly Reports:** filter by month/year and historical tutor; review completed sessions, hours, absences, holidays, and achievements.

Successful saves require a returned database record. Failed saves retain form values. Refresh or use **Reload records** to see other visitors' changes. Concurrent corrections use last-write-wins.

## Database rules

All four tables use UUID primary keys and separate creation timestamps. Session and achievement dates are PostgreSQL `date` fields.

Completed sessions require 1–1440 integer minutes. TA, SA, and H require zero minutes. Reports use event dates, sum completed minutes, and divide by 60 for hours. TA/SA count as absences; holidays are separate.

A stopped student requires a date and a nonblank reason. Reactivating a student clears those fields. Sessions and achievements retain their historical tutor when the student's current assignment changes.

RLS is enabled on every table. Grants and operation-specific policies intentionally let demo visitors modify shared fictional records:

| Table | Read | Insert | Update | Delete |
| --- | --- | --- | --- | --- |
| tutors | Yes | No | No | No |
| students | Yes | No | Student details | No |
| sessions | Yes | Session fields | Session fields | No |
| student_achievements | Yes | Achievement fields | Achievement fields | Yes |

Visitors cannot change primary keys or creation timestamps, or truncate tables. These policies do not provide tutor-specific isolation. Use fictional records only.

Database fields are mapped explicitly in `src/lib/database.js`: `tutor_id` → `tutorId`, `student_id` → `studentId`, event dates → `date`, `stopped_reason` → `stoppedReason`, `stopped_date` → `stoppedDate`, and `created_at` → `createdAt`.

## Project structure

- `src/App.jsx`: navigation, shared records, loading and error states.
- `src/views/`: attendance, students, student details, and monthly reports.
- `src/lib/`: database operations and report calculations.
- `src/data/sampleData.js`: fictional preview records.
- `src/styles.css`: shared layout and styling.
- `supabase/`: schema, seed, and SQL checks.
- `tests/`: validation, mapping, and report regression tests.

React components and event handlers use named arrow functions. JSX event attributes reference handlers directly, such as `onClick={handleEditSession}`.

The supplied attendance PDF is retained as the requirements reference.

## Checks

```sh
npm test
npm run lint
npm run build
```

For database permission and constraint checks, run [supabase/verify.sql](supabase/verify.sql) as the project owner in SQL Editor. It uses temporary test records and rolls back its changes. If a check fails, run `ROLLBACK;` before retrying.

To verify your configured project:

1. Save a completed 45-minute session on a known date, then refresh.
2. Confirm the session remains in Attendance and adds one session and 0.75 hours to the correct monthly report.
3. Correct its date to another month and its duration to 30 minutes. Refresh and confirm it moves to that month's report.
4. Save TA, SA, and H entries and confirm they contribute no hours.

Build and local SQL checks do not verify hosted Supabase persistence; the save–refresh–report flow must pass against your project.

For Netlify, use build command `npm run build` and publish directory `dist`. Deployment is not configured yet.
