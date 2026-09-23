import { useRef, useState } from "react";
import { attendanceCodes, formatDate } from "../data/sampleData.js";
import { saveSession } from "../lib/database.js";
import { todayDate } from "../lib/reports.js";

const Attendance = ({ records: data, preview, onSaved, onBusyChange }) => {
  const { sessions, students, tutors } = data;
  const [studentId, setStudentId] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const startEntry = (session) => {
    setError("");
    setSuccess("");
    setEditing(Boolean(session));
    const student =
      students.find((item) => item.id === studentId) ?? students[0];
    setDraft(
      session
        ? { ...session }
        : {
            id: crypto.randomUUID(),
            studentId: student?.id ?? "",
            tutorId: student?.tutorId ?? "",
            date: todayDate(),
            status: "completed",
            minutes: 60,
            notes: "",
          },
    );
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.currentTarget;
    setDraft((previous) => ({ ...previous, [name]: value }));
  };

  const handleNewSession = () => startEntry();

  const handleEditSession = (event) => {
    const session = sessions.find(
      (item) => item.id === event.currentTarget.value,
    );
    if (session) startEntry(session);
  };

  const handleStudentChange = (event) => {
    const studentId = event.currentTarget.value;
    setDraft((previous) => ({
      ...previous,
      studentId,
      // Corrections retain the historical tutor until explicitly changed.
      tutorId: editing
        ? previous.tutorId
        : (students.find((item) => item.id === studentId)?.tutorId ?? ""),
    }));
  };

  const handleStatusChange = (event) => {
    const status = event.currentTarget.value;
    setDraft((previous) => ({
      ...previous,
      status,
      minutes: status === "completed" ? previous.minutes || 60 : 0,
    }));
  };

  const handleCancel = () => {
    setDraft(null);
    setError("");
  };

  const handleStudentFilterChange = (event) =>
    setStudentId(event.currentTarget.value);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (preview || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    onBusyChange(true);
    setError("");
    setSuccess("");
    try {
      const saved = await saveSession(draft, editing);
      onSaved("sessions", saved);
      setStudentId("");
      setDraft(null);
      setSuccess(
        `Session ${editing ? "corrected" : "saved"} in the database for ${formatDate(saved.date)}. View ${saved.date.slice(0, 7)} in Monthly Reports.`,
      );
    } catch (failure) {
      setError(failure.message);
    } finally {
      savingRef.current = false;
      setSaving(false);
      onBusyChange(false);
    }
  };
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
      <div className="section-intro">
        <p>
          {preview
            ? "Read-only preview. Configure Supabase to record sessions."
            : "Record a session or correct an existing entry."}
        </p>
        <button
          type="button"
          className="primary-button"
          disabled={preview || saving || !students.length || !tutors.length}
          onClick={handleNewSession}
        >
          Record session
        </button>
      </div>
      {!students.length && (
        <p className="empty-state">
          No students available. Run seed.sql in your demo project to add the
          fictional roster.
        </p>
      )}
      {success && (
        <p className="feedback success-message" role="status">
          {success}
        </p>
      )}
      {draft && (
        <section className="panel entry-panel" aria-labelledby="entry-heading">
          <h2 id="entry-heading">
            {editing ? "Correct attendance record" : "Record attendance"}
          </h2>
          <form onSubmit={handleSubmit}>
            <fieldset disabled={saving} className="form-grid">
              <legend className="sr-only">Session details</legend>
              <label>
                Session student
                <select
                  value={draft.studentId}
                  required
                  onChange={handleStudentChange}
                >
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                      {student.status === "Stopped" ? " (stopped)" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Session tutor (demo control)
                <select
                  value={draft.tutorId}
                  required
                  name="tutorId"
                  onChange={handleFieldChange}
                >
                  {tutors.map((tutor) => (
                    <option key={tutor.id} value={tutor.id}>
                      {tutor.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Session date
                <input
                  type="date"
                  min="0001-01-01"
                  max="9999-12-31"
                  required
                  value={draft.date}
                  name="date"
                  onChange={handleFieldChange}
                />
              </label>
              <label>
                Attendance status
                <select value={draft.status} onChange={handleStatusChange}>
                  {Object.entries(attendanceCodes).map(([code, label]) => (
                    <option key={code} value={code}>
                      {label}
                      {code !== "completed" ? ` (${code})` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Duration (minutes)
                <input
                  type="number"
                  min="1"
                  max="1440"
                  step="1"
                  required
                  disabled={draft.status !== "completed"}
                  value={draft.minutes}
                  name="minutes"
                  onChange={handleFieldChange}
                />
              </label>
              <p className="field-note">
                Completed sessions: 1–1440 whole minutes. Absences and holidays:
                0 minutes.
              </p>
              <label className="full-width">
                Session notes
                <textarea
                  rows="3"
                  value={draft.notes}
                  name="notes"
                  onChange={handleFieldChange}
                />
              </label>
              <div className="form-actions full-width">
                <button className="primary-button" type="submit">
                  {saving
                    ? "Saving…"
                    : editing
                      ? "Save correction"
                      : "Save session"}
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </fieldset>
            {error && (
              <p className="feedback error-message" role="alert">
                {error}
              </p>
            )}
          </form>
        </section>
      )}
      <section className="panel" aria-labelledby="history-heading">
        <div className="panel-heading">
          <div>
            <h2 id="history-heading">Session history</h2>
            <p>
              {preview
                ? "September 2026 · Sample records"
                : "Database records · All dates"}
            </p>
          </div>
          <label>
            Student
            <select value={studentId} onChange={handleStudentFilterChange}>
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
            <caption className="sr-only">
              {preview
                ? "Sample attendance history"
                : "Database attendance history"}
            </caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Student</th>
                <th scope="col">Tutor</th>
                <th scope="col">Status</th>
                <th scope="col">Duration</th>
                <th scope="col">Session notes</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((session) => (
                <tr key={session.id}>
                  <td className="nowrap">{formatDate(session.date)}</td>
                  <td className="student-name">
                    {students.find(
                      (student) => student.id === session.studentId,
                    )?.name ?? "Unknown student"}
                  </td>
                  <td>
                    {tutors.find((tutor) => tutor.id === session.tutorId)
                      ?.name ?? "Unknown tutor"}
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
                  <td>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={preview || saving}
                      value={session.id}
                      onClick={handleEditSession}
                      aria-label={`Edit ${students.find((student) => student.id === session.studentId)?.name ?? "student"} session on ${formatDate(session.date)}`}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!records.length && (
          <p className="empty-state">
            No attendance records for this selection.
          </p>
        )}
        <div className="panel-footer">
          {records.length} {preview ? "sample" : "database"} records{" "}
          <span>
            {preview
              ? "Preview records cannot be changed."
              : "Corrections update the original record. Session deletion is unavailable."}
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
};

export default Attendance;
