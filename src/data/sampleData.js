// Entirely fictional. Never treat these records as real student information.
export const tutors = [
  { id: "tutor-1", name: "Alex Morgan" },
  { id: "tutor-2", name: "Jordan Lee" },
];

export const students = [
  {
    id: "student-1",
    tutorId: "tutor-1",
    name: "Maya Bennett",
    focus: "Reading & writing",
    site: "Central Library",
    schedule: "Tuesdays · 4:00–5:30 PM",
    status: "Active",
    stoppedReason: "",
  },
  {
    id: "student-2",
    tutorId: "tutor-1",
    name: "Leo Rivera",
    focus: "Mathematics",
    site: "Learning Center",
    schedule: "Thursdays · 3:30–4:30 PM",
    status: "Active",
    stoppedReason: "",
  },
  {
    id: "student-3",
    tutorId: "tutor-2",
    name: "Avery Chen",
    focus: "English language",
    site: "Central Library",
    schedule: "Wednesdays · 5:00–6:00 PM",
    status: "Active",
    stoppedReason: "",
  },
  {
    id: "student-4",
    tutorId: "tutor-2",
    name: "Sam Taylor",
    focus: "Reading & writing",
    site: "Learning Center",
    schedule: "Previously Mondays · 4:00–5:00 PM",
    status: "Stopped",
    stoppedReason: "Moved out of the area · September 15, 2026",
  },
];

export const attendanceCodes = {
  completed: "Completed",
  TA: "Tutor absent",
  SA: "Student absent",
  H: "Holiday",
};

export const sessions = [
  {
    id: "session-1",
    studentId: "student-1",
    tutorId: "tutor-1",
    date: "2026-09-01",
    status: "completed",
    minutes: 90,
    notes: "Reading comprehension and vocabulary.",
  },
  {
    id: "session-2",
    studentId: "student-2",
    tutorId: "tutor-1",
    date: "2026-09-03",
    status: "completed",
    minutes: 60,
    notes: "Practiced fractions and number lines.",
  },
  {
    id: "session-3",
    studentId: "student-4",
    tutorId: "tutor-2",
    date: "2026-09-07",
    status: "H",
    minutes: 0,
    notes: "Site closed for holiday.",
  },
  {
    id: "session-4",
    studentId: "student-1",
    tutorId: "tutor-1",
    date: "2026-09-08",
    status: "completed",
    minutes: 90,
    notes: "Paragraph structure and reading fluency.",
  },
  {
    id: "session-5",
    studentId: "student-3",
    tutorId: "tutor-2",
    date: "2026-09-09",
    status: "completed",
    minutes: 60,
    notes: "Everyday conversation practice.",
  },
  {
    id: "session-6",
    studentId: "student-2",
    tutorId: "tutor-1",
    date: "2026-09-10",
    status: "SA",
    minutes: 0,
    notes: "Student unavailable.",
  },
  {
    id: "session-7",
    studentId: "student-1",
    tutorId: "tutor-1",
    date: "2026-09-15",
    status: "TA",
    minutes: 0,
    notes: "Tutor unavailable.",
  },
  {
    id: "session-8",
    studentId: "student-3",
    tutorId: "tutor-2",
    date: "2026-09-16",
    status: "completed",
    minutes: 60,
    notes: "Reading a short article together.",
  },
];

export const achievements = [
  {
    id: "achievement-1",
    studentId: "student-1",
    tutorId: "tutor-1",
    date: "2026-09-08",
    description: "Completed a first independent reading assignment.",
  },
  {
    id: "achievement-2",
    studentId: "student-3",
    tutorId: "tutor-2",
    date: "2026-09-16",
    description: "Reached a personal conversational English goal.",
  },
];

export function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}
