# Tutor Session Reporting

A React + Vite JavaScript public demo for tutor attendance, student details, and monthly reports. Uses ordinary CSS and the Supabase JavaScript client. All records are fictional.

## Run locally

Use Node 22.12 or later. The existing Node 23.6.0 runtime meets the installed packages' engine requirements; no global tools were changed.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

```sh
npm run lint
npm test
npm run build
npm run preview
```

## Current scope

- Attendance: load history, filter students, save completed sessions and TA (Tutor Absent), SA (Student Absent), H (Holiday) entries, and correct existing records.
- Students: load the roster, update assignments, names, focus, site, schedules, active/stopped status, stopped reason and separate stopped date. Add, correct, and remove dated achievements.
- Monthly Reports: month/year and historical tutor filters, completed session counts, tutoring hours, absences, holidays, and achievements. TA/SA count as absences; holidays are separate. Only completed session minutes contribute hours.

Without configuration (including `.env.example` placeholders), the app shows an explicitly labeled, read-only sample preview dated September 2026. With configuration, all three views use database records. Loading and database failures are visible; there is no silent sample fallback. A successful save requires a returned database row. Failed saves retain entered values. Reload records or refresh the browser to fetch changes from other demo visitors.

Authentication and actual tutor/staff permissions are outside this milestone. Tutor selection is a demo control, **not authorization**. Visitors share and can modify fictional records; do not put real student information in this project. Concurrent corrections currently use last-write-wins. There is no session deletion, tutor/student creation or deletion, automatic realtime subscription, or deployment configuration.

## Structure

```text
src/
  main.jsx                  React entry point
  App.jsx                   Application shell and three-view navigation
                            Shared loading/error state and database records
  styles.css                Shared responsive dark-gray styling
  views/
    Attendance.jsx          Session entry, correction, and history
    Students.jsx            Student roster
    StudentDetails.jsx      Student and achievement editing
    MonthlyReports.jsx      Date/tutor report filters and totals
  data/sampleData.js         Fictional data and date formatting
  lib/database.js           Client, field mapping, validation, and database calls
  lib/reports.js            Date helpers and report calculations
supabase/
  schema.sql                Tables, constraints, grants, and demo RLS policies
  seed.sql                  Stable fictional fixtures
  verify.sql                Transactional SQL permission/constraint checks
tests/reporting.test.js      Mapping, validation, and report regression checks
```

The supplied `Student Attendance & Achievement Form.pdf` is retained as the source reference. Temporary PDF renders, dependencies, build output, and real environment files are excluded from Git.

## Supabase setup

1. Create a dedicated Supabase demo project with the Data API enabled and `public` exposed.
2. Open **SQL Editor → New query**, paste the entire contents of `supabase/schema.sql`, and click **Run** as the project owner.
3. Open another query, paste all of `supabase/seed.sql`, and click **Run**. A fresh seed contains 2 tutors, 4 students, 8 sessions, and 2 achievements.
4. Find the project URL and browser-safe publishable key in the project **Connect** dialog or project API settings. Copy `.env.example` to `.env.local` and replace both placeholders:

   ```dotenv
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

5. Restart `npm run dev`. The header should say **Supabase demo**. Missing tables, invalid keys, denied access, and network failures should display errors rather than sample records.

Both SQL files can be rerun against this schema. The schema never drops tables or erases records; reruns replace only its named demo policies. It is an initial schema, not an automatic migration for unrelated pre-existing tables or policies. Use a dedicated project. The seed uses stable UUIDs with `ON CONFLICT (id) DO NOTHING`, so it neither duplicates existing records nor overwrites edits. Rerunning it will restore a seeded achievement that a visitor deleted; it is a fixture installer, not a synchronization process.

`schema.sql` enables RLS on all four tables and explicitly revokes default table privileges before granting only these operations to `anon` and `authenticated`:

| Table | Read | Insert | Update | Delete |
| --- | --- | --- | --- | --- |
| tutors | Yes | No | No | No |
| students | Yes | No | Workflow columns only | No |
| sessions | Yes | Session fields only | Session fields only | No |
| student_achievements | Yes | Achievement fields only | Achievement fields only | Yes |

Public callers cannot update IDs or creation timestamps, set creation timestamps on insertion, or truncate these tables. Policies permit all demo rows for each allowed operation; they intentionally provide no tutor-specific isolation. See Supabase's [RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) and [API grants documentation](https://supabase.com/docs/guides/api/securing-your-api).

## Data mapping and reporting

All tables use UUID primary keys and separate `created_at` timestamps. Foreign keys restrict deletion of referenced tutors/students. Database fields are mapped explicitly in `src/lib/database.js`:

| Database field | UI field |
| --- | --- |
| `tutor_id`, `student_id` | `tutorId`, `studentId` |
| `session_date`, `achievement_date` (PostgreSQL `date`) | `date` (`YYYY-MM-DD`) |
| `stopped_reason`, `stopped_date` | `stoppedReason`, `stoppedDate` |
| `created_at` | `createdAt` |
| `minutes`, `status`, `notes`, `name`, `focus`, `site`, `schedule`, `description` | Same names |

Completed sessions require integer minutes from 1 through 1440. TA/SA/H require exactly zero. A stopped student requires a stopped date and nonblank reason; activating a student clears those fields. The stored tutor on sessions and achievements is historical and independent of the student's current assignment. Editing a session preserves that tutor unless the visitor explicitly changes it.

Reports filter on session/achievement dates, not creation timestamps. Hours are the sum of completed minutes divided by 60, with display rounding only. Reads are paginated so reports are not limited to the API's default first page. New entry forms use local calendar dates; seeded records are in September 2026. New entries have a stable UUID across retries to prevent duplicate inserts after an uncertain network result.

## Verification and acceptance

`npm test` checks date boundaries, duration validation, field mapping, historical tutor filtering, corrections between months, and preview save rejection. `npm run lint` and `npm run build` validate the application; they do **not** establish that your hosted Supabase credentials, API, and policies work.

For SQL checks, optionally run all of `supabase/verify.sql` in SQL Editor as the project owner. It creates temporary fictional fixtures, switches to `anon` and `authenticated`, tests allowed and denied operations and constraints, and rolls the transaction back. If a check fails, run `ROLLBACK;` before retrying. These SQL checks do not replace testing through the browser's publishable key.

End-to-end acceptance on your configured project:

1. In Attendance, choose **Record session**. Select a fictional student/tutor, use a known date (for example `2026-09-22`), enter **45** minutes and a recognizable note, and save. Wait for database success.
2. Refresh the browser. Confirm that the session remains in Attendance.
3. Open Monthly Reports and select **September 2026** and the saved tutor. The completed count should increase by 1 and tutoring hours by **0.75** compared with the previous totals. On an untouched seed, all-tutor totals become 6 sessions / 6.75 hours.
4. Edit that session to `2026-10-01` and **30** minutes. Refresh. September should lose that session; October should gain 1 session / 0.5 hours.
5. Record TA, SA, and H entries. They save with zero minutes; TA/SA add absences, H adds a holiday, and none adds hours.
6. Update a student's current tutor and verify older sessions/achievements stay with the historical tutor. Try a student/achievement edit and achievement removal.

Hosted persistence is not verified until the save → refresh → report flow succeeds against your project. Local PostgreSQL checks can validate SQL independently, but cannot verify the hosted Data API or project configuration.

Implementation verification: lint, production build, and all seven regression tests pass. Schema/seed reruns and `verify.sql` passed on an isolated local PostgreSQL instance. Browser checks using a temporary API fixture passed session save → refresh → report (45 added minutes produced 6.75 total hours), correction to an absence, denied-save feedback with retained form values, student updates, and achievement creation/removal. The fixture was used only for verification and is not part of the application. Hosted Supabase verification is still pending project configuration.

`VITE_` values are included in the browser bundle. Use the existing browser-safe publishable key only. Never put a Supabase service-role key, secret key, database password, or other private credential there. Real `.env` files are ignored by Git; do not print or commit `.env.local`.

Netlify deployment is reserved for a later milestone; the eventual build command is `npm run build` and output directory is `dist`.
