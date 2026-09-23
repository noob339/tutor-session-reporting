import { useRef, useState } from "react";
import {
  deleteAchievement,
  saveAchievement,
  updateStudent,
} from "../lib/database.js";
import { formatDate } from "../data/sampleData.js";
import { todayDate } from "../lib/reports.js";

const StudentDetails = ({
  student,
  tutors,
  achievements,
  onSaved,
  onAchievementRemoved,
  onBusyChange,
  onClose,
}) => {
  const [draft, setDraft] = useState({ ...student });
  const [milestone, setMilestone] = useState(null);
  const [editingAchievement, setEditingAchievement] = useState(false);
  const [removingId, setRemovingId] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const perform = async (action, message) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    onBusyChange(true);
    setError("");
    setSuccess("");
    try {
      await action();
      setSuccess(message);
    } catch (failure) {
      setError(failure.message);
    } finally {
      busyRef.current = false;
      setBusy(false);
      onBusyChange(false);
    }
  };

  const handleStudentFieldChange = (event) => {
    const { name, value } = event.currentTarget;
    setDraft((previous) => ({ ...previous, [name]: value }));
  };

  const handleAchievementFieldChange = (event) => {
    const { name, value } = event.currentTarget;
    setMilestone((previous) => ({ ...previous, [name]: value }));
  };

  const startAchievement = (record) => {
    setEditingAchievement(Boolean(record));
    setMilestone(
      record
        ? { ...record }
        : {
            id: crypto.randomUUID(),
            studentId: student.id,
            tutorId: student.tutorId,
            date: todayDate(),
            description: "",
          },
    );
    setRemovingId("");
    setError("");
    setSuccess("");
  };

  const handleStudentSubmit = (event) => {
    event.preventDefault();
    perform(async () => {
      const saved = await updateStudent(draft);
      onSaved("students", saved);
      setDraft(saved);
    }, "Student details saved in the database. Historical session and achievement tutors are unchanged.");
  };

  const handleAchievementSubmit = (event) => {
    event.preventDefault();
    perform(async () => {
      const saved = await saveAchievement(milestone, editingAchievement);
      onSaved("achievements", saved);
      setMilestone(null);
    }, "Achievement saved in the database.");
  };

  const handleNewAchievement = () => startAchievement();

  const handleEditAchievement = (event) => {
    const record = achievements.find(
      (item) => item.id === event.currentTarget.value,
    );
    if (record) startAchievement(record);
  };

  const handleRemoveAchievement = (event) => {
    setRemovingId(event.currentTarget.value);
    setMilestone(null);
  };

  const handleConfirmRemoval = () => {
    perform(async () => {
      const id = await deleteAchievement(removingId);
      onAchievementRemoved(id);
      setRemovingId("");
    }, "Achievement removed from the database.");
  };

  const handleKeepAchievement = () => setRemovingId("");
  const handleCancelAchievement = () => setMilestone(null);

  return (
    <section
      className="panel entry-panel"
      aria-labelledby="student-details-heading"
    >
      <div className="section-intro">
        <h2 id="student-details-heading">Details · {student.name}</h2>
        <button
          type="button"
          className="secondary-button"
          disabled={busy}
          onClick={onClose}
        >
          Close details
        </button>
      </div>
      <form onSubmit={handleStudentSubmit}>
        <fieldset disabled={busy} className="form-grid">
          <legend className="sr-only">Student details</legend>
          <label>
            Student name
            <input
              required
              value={draft.name}
              name="name"
              onChange={handleStudentFieldChange}
            />
          </label>
          <label>
            Assigned tutor (demo control)
            <select
              required
              value={draft.tutorId}
              name="tutorId"
              onChange={handleStudentFieldChange}
            >
              {tutors.map((tutor) => (
                <option key={tutor.id} value={tutor.id}>
                  {tutor.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Learning focus
            <input
              value={draft.focus}
              name="focus"
              onChange={handleStudentFieldChange}
            />
          </label>
          <label>
            Tutoring site
            <input
              value={draft.site}
              name="site"
              onChange={handleStudentFieldChange}
            />
          </label>
          <label>
            Schedule (day and time)
            <input
              value={draft.schedule}
              name="schedule"
              onChange={handleStudentFieldChange}
            />
          </label>
          <label>
            Student status
            <select
              value={draft.status}
              name="status"
              onChange={handleStudentFieldChange}
            >
              <option>Active</option>
              <option>Stopped</option>
            </select>
          </label>
          {draft.status === "Stopped" && (
            <>
              <label>
                Stopped date
                <input
                  required
                  type="date"
                  min="0001-01-01"
                  max="9999-12-31"
                  value={draft.stoppedDate ?? ""}
                  name="stoppedDate"
                  onChange={handleStudentFieldChange}
                />
              </label>
              <label>
                Stopped reason
                <input
                  required
                  value={draft.stoppedReason}
                  name="stoppedReason"
                  onChange={handleStudentFieldChange}
                />
              </label>
            </>
          )}
          <div className="form-actions full-width">
            <button className="primary-button" type="submit">
              {busy ? "Saving…" : "Save student details"}
            </button>
          </div>
        </fieldset>
      </form>
      <div className="section-intro achievement-heading">
        <h3>Student achievements</h3>
        <button
          className="secondary-button"
          type="button"
          disabled={busy}
          onClick={handleNewAchievement}
        >
          Add achievement
        </button>
      </div>
      {achievements.length ? (
        <ul className="detail-achievements">
          {achievements.map((record) => (
            <li key={record.id}>
              <p>{record.description}</p>
              <p className="muted">
                {formatDate(record.date)} ·{" "}
                {tutors.find((tutor) => tutor.id === record.tutorId)?.name ??
                  "Unknown tutor"}
              </p>
              <div className="form-actions">
                <button
                  className="secondary-button"
                  type="button"
                  disabled={busy}
                  value={record.id}
                  onClick={handleEditAchievement}
                >
                  Edit achievement
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  disabled={busy}
                  value={record.id}
                  onClick={handleRemoveAchievement}
                >
                  Remove achievement
                </button>
              </div>
              {removingId === record.id && (
                <div className="feedback">
                  <p>Remove this achievement from the shared demo database?</p>
                  <div className="form-actions">
                    <button
                      className="danger-button"
                      type="button"
                      disabled={busy}
                      onClick={handleConfirmRemoval}
                    >
                      Confirm removal
                    </button>
                    <button
                      className="secondary-button"
                      type="button"
                      disabled={busy}
                      onClick={handleKeepAchievement}
                    >
                      Keep achievement
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">No achievements recorded.</p>
      )}
      {milestone && (
        <form className="achievement-editor" onSubmit={handleAchievementSubmit}>
          <h3>
            {editingAchievement ? "Correct achievement" : "New achievement"}
          </h3>
          <fieldset disabled={busy} className="form-grid">
            <legend className="sr-only">Achievement details</legend>
            <label>
              Achievement date
              <input
                type="date"
                min="0001-01-01"
                max="9999-12-31"
                required
                value={milestone.date}
                name="date"
                onChange={handleAchievementFieldChange}
              />
            </label>
            <label>
              Achievement tutor (demo control)
              <select
                required
                value={milestone.tutorId}
                name="tutorId"
                onChange={handleAchievementFieldChange}
              >
                {tutors.map((tutor) => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutor.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="full-width">
              Achievement description
              <textarea
                required
                rows="3"
                value={milestone.description}
                name="description"
                onChange={handleAchievementFieldChange}
              />
            </label>
            <div className="form-actions full-width">
              <button className="primary-button" type="submit">
                {busy ? "Saving…" : "Save achievement"}
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={handleCancelAchievement}
              >
                Cancel achievement
              </button>
            </div>
          </fieldset>
        </form>
      )}
      {error && (
        <p role="alert" className="feedback error-message">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="feedback success-message">
          {success}
        </p>
      )}
    </section>
  );
};

export default StudentDetails;
