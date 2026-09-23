import { useState } from "react";
import {
  attendanceCodes,
  formatDate,
  sessions,
  students,
} from "../data/sampleData.js";

export default function Attendance() {
  const [studentId, setStudentId] = useState("");
  const records = sessions
    .filter((session) => !studentId || session.studentId === studentId)
    .toSorted((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">SESSION RECORDS</p>
        <h1>Attendance</h1>
        <p>A clear picture of every tutoring session.</p>
      </div>
      <section className="panel" aria-labelledby="history-heading">
        <div className="panel-heading">
          <div>
            <h2 id="history-heading">Session history</h2>
            <p>September 2026 · Fictional records</p>
          </div>
          <label>
            Student
            <select
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
            >
              <option value="">All students</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="table-scroll">
          <table>
            <caption className="sr-only">Sample attendance history</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Student</th>
                <th scope="col">Status</th>
                <th scope="col">Duration</th>
                <th scope="col">Session notes</th>
              </tr>
            </thead>
            <tbody>
              {records.map((session) => (
                <tr key={session.id}>
                  <td className="nowrap">{formatDate(session.date)}</td>
                  <td className="student-name">
                    {
                      students.find(
                        (student) => student.id === session.studentId,
                      ).name
                    }
                  </td>
                  <td>
                    <span
                      className={`badge ${session.status === "completed" ? "success" : "neutral"}`}
                    >
                      {attendanceCodes[session.status]}
                      {session.status !== "completed" && ` (${session.status})`}
                    </span>
                  </td>
                  <td className="nowrap">
                    {session.status === "completed"
                      ? `${session.minutes} min`
                      : "—"}
                  </td>
                  <td className="muted">{session.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel-footer">
          {records.length} sample records{" "}
          <span>
            Recording sessions and correcting entries are coming next.
          </span>
        </div>
      </section>
      <section className="legend" aria-label="Attendance code reference">
        <h2>Absence codes</h2>
        <p>
          <strong>TA</strong> Tutor absent
        </p>
        <p>
          <strong>SA</strong> Student absent
        </p>
        <p>
          <strong>H</strong> Holiday
        </p>
      </section>
    </>
  );
}
