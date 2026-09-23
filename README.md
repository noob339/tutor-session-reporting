# Tutor Session Reporting

A React + Vite JavaScript foundation for tutor attendance, assigned students, and monthly reports. The interface uses ordinary CSS and fictional sample records based on the supplied reporting form.

## Run locally

Use Node 22.12+ (Node 24 LTS recommended). The existing Node 23.6.0 runtime meets the installed packages' engine requirements; no global tools were changed.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

```sh
npm run lint
npm run build
npm run preview
```

## Current scope

- Attendance: fictional session history, student filter, completed sessions, and TA (Tutor Absent), SA (Student Absent), H (Holiday) codes.
- Students: fictional assignments, achievements, site/day/time schedules, and active/stopped status with a stopped reason.
- Monthly Reports: working month/year and tutor filters over sample data, completed session counts, tutoring hours, absences, and achievements. TA/SA count as absences; holidays are separate. Only completed sessions contribute hours.

Sample records are dated September 2026. Other months show an empty state. All views are read-only previews. There is no login, database reading/writing, permanent saving, session correction, student editing, or deployment configuration yet. Adding credentials does not switch the app out of sample mode.

## Structure

```text
src/
  main.jsx                  React entry point
  App.jsx                   Application shell and three-view navigation
  styles.css                Shared responsive dark-gray styling
  views/
    Attendance.jsx          Session history preview
    Students.jsx            Student roster preview
    MonthlyReports.jsx      Sample report filters and totals
  data/sampleData.js         Fictional data and date formatting
  lib/database.js           Lazy Supabase client boundary
```

The supplied `Student Attendance & Achievement Form.pdf` is retained as the source reference. Temporary PDF renders, dependencies, build output, and real environment files are excluded from Git.

## Next milestone: Supabase

Create a Supabase project, then agree on a small schema for tutor profiles, assigned students, sessions, and dated achievements. Add authentication and row-level security policies before connecting reads/writes: tutors should only access assigned students, while staff need authorized reporting access. Store session duration in minutes; absence and holiday entries should contribute zero hours. Preserve the tutor on dated sessions and achievements so later assignment changes do not alter historic reports.

Copy `.env.example` to `.env.local` and replace its placeholders with the project's URL and browser-safe publishable key. `getDatabaseClient()` returns `null` without usable configuration; preview screens do not call it yet. Implement database operations in `src/lib/database.js` and then connect the views with loading, error, and save feedback.

`VITE_` values are included in the browser bundle. Never put a Supabase service-role key, secret key, database password, or other private credential there. Real `.env` files are ignored by Git.

Netlify deployment is reserved for a later milestone; the eventual build command is `npm run build` and output directory is `dist`.
