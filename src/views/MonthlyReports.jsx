import { useState } from "react";
import { calculateReport, currentMonth } from "../lib/reports.js";
import { formatDate } from "../data/sampleData.js";

export default function MonthlyReports({ records: data, preview }) {
  const { achievements, sessions, students, tutors } = data;
  const [month, setMonth] = useState(() =>
    preview ? "2026-09" : currentMonth(),
  );
  const [tutorId, setTutorId] = useState("");
  const {
    records,
    milestones,
    completedCount,
    minutes,
    absenceCount,
    holidayCount,
  } = calculateReport(sessions, achievements, month, tutorId);
  const hours = minutes / 60;
  const summary = [
    ["Completed sessions", completedCount],
    [
      "Tutoring hours",
      hours.toLocaleString("en-US", { maximumFractionDigits: 2 }),
    ],
    ["Absences", absenceCount],
    ["Achievements", milestones.length],
  ];

  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">THE MONTH AT A GLANCE</p>
        <h1>Monthly Reports</h1>
        <p>See the time, consistency, and progress behind each month.</p>
      </div>
      <div className="panel report-filters">
        <label>
          Month and year
          <input
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            required
          />
        </label>
        <label>
          Tutor
          <select
            value={tutorId}
            onChange={(event) => setTutorId(event.target.value)}
          >
            <option value="">All tutors</option>
            {tutors.map((tutor) => (
              <option key={tutor.id} value={tutor.id}>
                {tutor.name}
              </option>
            ))}
          </select>
        </label>
        <p>
          {preview
            ? "Filters apply to sample data."
            : "Tutor filtering is a demo control, not authorization."}
        </p>
      </div>
      <div aria-live="polite" aria-atomic="true">
        {!month && (
          <p className="empty-state">
            Select a month and year to preview a report.
          </p>
        )}
        <div className="stats-grid">
          {summary.map(([label, value]) => (
            <div className="panel stat" key={label}>
              <p>{label}</p>
              <strong>{value}</strong>
              <span>{preview ? "Sample total" : "Database total"}</span>
            </div>
          ))}
        </div>
        <p className="report-note">
          Absences include TA and SA. Holidays are counted separately:{" "}
          {holidayCount}. Only completed sessions contribute tutoring hours (
          {minutes} minutes).
        </p>
        {month && records.length === 0 && milestones.length === 0 && (
          <p className="empty-state">
            No records for this selection.{preview && " Try September 2026."}
          </p>
        )}
      </div>
      <section className="panel" aria-labelledby="achievements-heading">
        <div className="panel-heading">
          <div>
            <h2 id="achievements-heading">Student achievements</h2>
            <p>Milestones recorded during the selected month</p>
          </div>
          <span className="badge">
            {preview ? "Sample report" : "Database report"}
          </span>
        </div>
        {milestones.length ? (
          <ul className="milestone-list">
            {milestones.map((milestone) => (
              <li key={milestone.id}>
                <span className="milestone-mark" aria-hidden="true">
                  ✓
                </span>
                <div>
                  <h3>
                    {students.find(
                      (student) => student.id === milestone.studentId,
                    )?.name ?? "Unknown student"}
                  </h3>
                  <p>{milestone.description}</p>
                  <p>
                    {formatDate(milestone.date)} ·{" "}
                    {tutors.find((tutor) => tutor.id === milestone.tutorId)
                      ?.name ?? "Unknown tutor"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">No achievements for this selection.</p>
        )}
      </section>
    </>
  );
}
