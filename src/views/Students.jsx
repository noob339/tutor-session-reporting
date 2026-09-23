import { formatDate } from "../data/sampleData.js";
import { useState } from "react";
import StudentDetails from "./StudentDetails.jsx";

const Students = ({
  records,
  preview,
  onSaved,
  onAchievementRemoved,
  onBusyChange,
}) => {
  const { achievements, students, tutors } = records;
  const [selectedId, setSelectedId] = useState("");
  const [busy, setBusy] = useState(false);
  const selected = students.find((student) => student.id === selectedId);
  const selectedAchievements = achievements.filter(
    (achievement) => achievement.studentId === selectedId,
  );
  const handleBusyChange = (value) => {
    setBusy(value);
    onBusyChange(value);
  };
  const handleCloseDetails = () => setSelectedId("");
  const handleEditDetails = (event) => setSelectedId(event.currentTarget.value);
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">PEOPLE & PROGRESS</p>
        <h1>Students</h1>
        <p>Assignments, schedules, and the milestones along the way.</p>
      </div>
      <div className="section-intro">
        <h2>
          {preview ? "Sample student roster" : "Student roster"}{" "}
          <span className="count">{students.length}</span>
        </h2>
        <p>{preview ? "Read-only preview" : "Fictional database records"}</p>
      </div>
      {selected && (
        <StudentDetails
          key={selected.id}
          student={selected}
          tutors={tutors}
          achievements={selectedAchievements}
          onSaved={onSaved}
          onAchievementRemoved={onAchievementRemoved}
          onBusyChange={handleBusyChange}
          onClose={handleCloseDetails}
        />
      )}
      <div className="student-grid">
        {students.map((student) => {
          const milestones = achievements.filter(
            (achievement) => achievement.studentId === student.id,
          );
          return (
            <article key={student.id} className="panel student-card">
              <div className="student-card-header">
                <span className="avatar" aria-hidden="true">
                  {student.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </span>
                <span
                  className={`badge ${student.status === "Active" ? "success" : "neutral"}`}
                >
                  {student.status}
                </span>
              </div>
              <h2>{student.name}</h2>
              <p className="muted">{student.focus}</p>
              <button
                className="secondary-button student-details-button"
                type="button"
                disabled={preview || busy}
                value={student.id}
                onClick={handleEditDetails}
              >
                Edit details for {student.name}
              </button>
              <dl>
                <div>
                  <dt>Assigned tutor</dt>
                  <dd>
                    {tutors.find((tutor) => tutor.id === student.tutorId)
                      ?.name ?? "Unknown tutor"}
                  </dd>
                </div>
                <div>
                  <dt>Tutoring site</dt>
                  <dd>{student.site}</dd>
                </div>
                <div>
                  <dt>Schedule</dt>
                  <dd>{student.schedule}</dd>
                </div>
              </dl>
              {student.stoppedReason && (
                <p className="stopped-note">
                  <strong>Stopped tutoring</strong>
                  <br />
                  {student.stoppedReason}
                  {student.stoppedDate && (
                    <> · {formatDate(student.stoppedDate)}</>
                  )}
                </p>
              )}
              <div className="achievement">
                <h3>Achievements</h3>
                {milestones.length ? (
                  milestones.map((milestone) => (
                    <p key={milestone.id}>
                      {milestone.description}
                      <span>{formatDate(milestone.date)}</span>
                    </p>
                  ))
                ) : (
                  <p className="muted">No achievements recorded.</p>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {!students.length && (
        <p className="empty-state">
          No students available. Run seed.sql in your dedicated demo project to
          add the fictional roster.
        </p>
      )}
    </>
  );
};

export default Students;
