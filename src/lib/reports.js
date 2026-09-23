export function currentMonth() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
}

export function todayDate() {
  return `${currentMonth()}-${String(new Date().getDate()).padStart(2, "0")}`;
}

export function calculateReport(sessions, achievements, month, tutorId = "") {
  const inReport = (record) =>
    /^\d{4}-\d{2}$/.test(month) &&
    record.date.startsWith(`${month}-`) &&
    (!tutorId || record.tutorId === tutorId);
  const records = sessions.filter(inReport);
  const milestones = achievements.filter(inReport);
  const completed = records.filter((record) => record.status === "completed");
  return {
    records,
    milestones,
    completedCount: completed.length,
    minutes: completed.reduce((total, record) => total + record.minutes, 0),
    absenceCount: records.filter((record) =>
      ["TA", "SA"].includes(record.status),
    ).length,
    holidayCount: records.filter((record) => record.status === "H").length,
  };
}
