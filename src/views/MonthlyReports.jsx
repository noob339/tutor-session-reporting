import { useState } from "react";
import {
  achievements,
  sessions,
  students,
  tutors,
} from "../data/sampleData.js";

export default function MonthlyReports() {
  const [month, setMonth] = useState("2026-09");
  const [tutorId, setTutorId] = useState("");
  const inReport = (record) =>
    month &&
    record.date.startsWith(`${month}-`) &&
    (!tutorId || record.tutorId === tutorId);
  const records = sessions.filter(inReport);
  const milestones = achievements.filter(inReport);
  const completed = records.filter((record) => record.status === "completed");
  const absences = records.filter((record) =>
    ["TA", "SA"].includes(record.status),
  );
  const holidays = records.filter((record) => record.status === "H");
  const hours =
    completed.reduce((total, record) => total + record.minutes, 0) / 60;
  const summary = [
    ["Completed sessions", completed.length],
    [
      "Tutoring hours",
      hours.toLocaleString("en-US", { maximumFractionDigits: 2 }),
    ],
    ["Absences", absences.length],
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
        <p>Filters apply to fictional sample data.</p>
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
              <span>Sample total</span>
            </div>
          ))}
        </div>
        <p className="report-note">
          Absences include TA and SA. Holidays are counted separately:{" "}
          {holidays.length}. Only completed sessions contribute tutoring hours.
        </p>
        {month && records.length === 0 && milestones.length === 0 && (
          <p className="empty-state">
            No sample records for this selection. Try September 2026.
          </p>
        )}
      </div>
      <section className="panel" aria-labelledby="achievements-heading">
        <div className="panel-heading">
          <div>
            <h2 id="achievements-heading">Student achievements</h2>
            <p>Milestones recorded during the selected month</p>
          </div>
          <span className="badge">Sample report</span>
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
                    {
                      students.find(
                        (student) => student.id === milestone.studentId,
                      ).name
                    }
                  </h3>
                  <p>{milestone.description}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">
            No sample achievements for this selection.
          </p>
        )}
      </section>
    </>
  );
}
