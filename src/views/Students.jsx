import {
  achievements,
  formatDate,
  students,
  tutors,
} from "../data/sampleData.js";

export default function Students() {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">PEOPLE & PROGRESS</p>
        <h1>Students</h1>
        <p>Assignments, schedules, and the milestones along the way.</p>
      </div>
      <div className="section-intro">
        <h2>
          Sample student roster <span className="count">{students.length}</span>
        </h2>
        <p>Read-only preview · Updates will be added next.</p>
      </div>
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
              <dl>
                <div>
                  <dt>Assigned tutor</dt>
                  <dd>
                    {tutors.find((tutor) => tutor.id === student.tutorId).name}
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
                  <p className="muted">
                    No achievements recorded in this sample.
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
