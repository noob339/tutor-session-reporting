import test from "node:test";
import assert from "node:assert/strict";
import { calculateReport } from "../src/lib/reports.js";
import {
  mapSession,
  mapAchievement,
  mapStudent,
  sessionToRow,
  validateDate,
  getDatabaseClient,
  saveSession,
} from "../src/lib/database.js";
import { sessions, achievements } from "../src/data/sampleData.js";

test("September fixture separates absences, holidays, and completed minutes", () => {
  const report = calculateReport(sessions, achievements, "2026-09");
  assert.equal(report.completedCount, 5);
  assert.equal(report.minutes, 360);
  assert.equal(report.absenceCount, 2);
  assert.equal(report.holidayCount, 1);
  assert.equal(report.milestones.length, 2);
});

test("reports use event month and historical tutor, not creation date or current assignment", () => {
  const session = mapSession({
    id: "session",
    student_id: "student",
    tutor_id: "historical",
    session_date: "2026-01-31",
    created_at: "2026-02-01T00:00:00Z",
    minutes: 75,
    status: "completed",
    notes: "",
  });
  const milestone = mapAchievement({
    id: "achievement",
    student_id: "student",
    tutor_id: "historical",
    achievement_date: "2026-01-31",
    created_at: "2026-02-02T00:00:00Z",
    description: "Goal",
  });
  const student = mapStudent({
    id: "student",
    tutor_id: "new-tutor",
    status: "Stopped",
    stopped_date: "2026-02-01",
    stopped_reason: "Moved",
  });
  assert.equal(student.tutorId, "new-tutor");
  assert.equal(student.stoppedDate, "2026-02-01");
  assert.equal(
    calculateReport([session], [milestone], "2026-01", "historical").minutes,
    75,
  );
  assert.equal(
    calculateReport([session], [milestone], "2026-01", "historical").milestones
      .length,
    1,
  );
  assert.equal(
    calculateReport([session], [milestone], "2026-01", student.tutorId).minutes,
    0,
  );
  assert.equal(
    calculateReport([session], [milestone], "2026-02").completedCount,
    0,
  );
});

test("correcting the date and minutes moves a record into the right monthly report", () => {
  const corrected = sessions.map((record, index) =>
    index === 0 ? { ...record, date: "2026-10-01", minutes: 45 } : record,
  );
  assert.equal(
    calculateReport(corrected, achievements, "2026-09").minutes,
    270,
  );
  assert.equal(calculateReport(corrected, achievements, "2026-10").minutes, 45);
  assert.equal(
    calculateReport(corrected, achievements, "2026-10").completedCount,
    1,
  );
});

test("empty filters and tutor subsets do not leak totals", () => {
  assert.equal(calculateReport(sessions, achievements, "").minutes, 0);
  assert.equal(
    calculateReport(sessions, achievements, "2027-09").records.length,
    0,
  );
  const report = calculateReport(sessions, achievements, "2026-09", "tutor-2");
  assert.equal(report.minutes, 120);
  assert.equal(report.absenceCount, 0);
  assert.equal(report.holidayCount, 1);
});

test("session payload validates minute boundaries and maps database columns", () => {
  const record = { ...sessions[0], minutes: "45", date: "2026-09-30" };
  assert.deepEqual(sessionToRow(record), {
    student_id: "student-1",
    tutor_id: "tutor-1",
    session_date: "2026-09-30",
    status: "completed",
    minutes: 45,
    notes: record.notes,
  });
  for (const minutes of [0, -1, 1441, 1.5, "", "invalid"])
    assert.throws(() => sessionToRow({ ...record, minutes }));
  for (const minutes of [1, 1440])
    assert.equal(sessionToRow({ ...record, minutes }).minutes, minutes);
  for (const status of ["TA", "SA", "H"]) {
    assert.equal(sessionToRow({ ...record, status, minutes: 0 }).minutes, 0);
    assert.throws(() => sessionToRow({ ...record, status, minutes: 1 }));
  }
});

test("dates reject rollover and invalid calendar values", () => {
  assert.equal(validateDate("2024-02-29"), "2024-02-29");
  for (const value of [
    "2026-02-29",
    "2026-04-31",
    "2026-13-01",
    "",
    "0000-01-01",
  ])
    assert.throws(() => validateDate(value));
});

test("missing configuration cannot silently save preview records", async () => {
  assert.equal(getDatabaseClient(), null);
  await assert.rejects(saveSession(sessions[0]), /Preview mode cannot save/);
});
