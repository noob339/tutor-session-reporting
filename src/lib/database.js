import { createClient } from "@supabase/supabase-js";

let client;
const env = import.meta.env ?? {};

export function isDatabaseConfigured() {
  return Boolean(
    env.VITE_SUPABASE_URL?.trim() &&
    env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() &&
    !env.VITE_SUPABASE_URL.includes("your-project") &&
    env.VITE_SUPABASE_PUBLISHABLE_KEY !== "your-publishable-key",
  );
}

export function getDatabaseClient() {
  if (!isDatabaseConfigured()) return null;
  if (!client) {
    try {
      client = createClient(
        env.VITE_SUPABASE_URL.trim(),
        env.VITE_SUPABASE_PUBLISHABLE_KEY.trim(),
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        },
      );
    } catch {
      throw new Error(
        "Invalid Supabase configuration. Check the project URL and publishable key in .env.local, then restart Vite.",
      );
    }
  }
  return client;
}

// Database snake_case -> UI camelCase. Event dates remain date-only strings.
export const mapTutor = (row) => ({
  id: row.id,
  name: row.name,
  createdAt: row.created_at,
});
export const mapStudent = (row) => ({
  id: row.id,
  tutorId: row.tutor_id,
  name: row.name,
  focus: row.focus,
  site: row.site,
  schedule: row.schedule,
  status: row.status,
  stoppedReason: row.stopped_reason,
  stoppedDate: row.stopped_date,
  createdAt: row.created_at,
});
export const mapSession = (row) => ({
  id: row.id,
  studentId: row.student_id,
  tutorId: row.tutor_id,
  date: row.session_date,
  status: row.status,
  minutes: row.minutes,
  notes: row.notes,
  createdAt: row.created_at,
});
export const mapAchievement = (row) => ({
  id: row.id,
  studentId: row.student_id,
  tutorId: row.tutor_id,
  date: row.achievement_date,
  description: row.description,
  createdAt: row.created_at,
});

function requireDatabase() {
  const database = getDatabaseClient();
  if (!database)
    throw new Error(
      "Preview mode cannot save records. Configure Supabase first.",
    );
  return database;
}

function databaseError(error, action) {
  if (error.code === "23505")
    return new Error(
      `${action}: this record already exists. Reload records to check whether an earlier save completed.`,
    );
  if (error.code === "23503")
    return new Error(
      `${action}: the selected student or tutor no longer exists. Reload records and try again.`,
    );
  if (["23514", "22007", "22008"].includes(error.code))
    return new Error(
      `${action}: database validation failed. Check the date, status, duration, and stopped details.`,
    );
  if (error.code === "PGRST116")
    return new Error(
      `${action}: no matching record was returned. It may have been removed or access may be denied. Reload records.`,
    );
  if (["42501", "PGRST301", "PGRST303"].includes(error.code))
    return new Error(
      `${action}: database access was denied. Check the publishable key and run schema.sql to install the demo grants and policies.`,
    );
  // Do not display raw request details, which can contain configuration values.
  return new Error(
    `${action}. Check your connection, Supabase configuration, and that schema.sql has run. If this was a save, reload records before retrying: the server may have received it.`,
  );
}

async function resultOf(query, action) {
  try {
    const result = await query.abortSignal(AbortSignal.timeout(15000));
    if (result.error) throw databaseError(result.error, action);
    return result;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith(action)) throw error;
    throw databaseError({}, action);
  }
}

// Page through the API rather than silently truncating reports at its row limit.
async function readAll(table) {
  const rows = [];
  let total;
  do {
    const { data, count } = await resultOf(
      requireDatabase()
        .from(table)
        .select("*", { count: "exact" })
        .order("id")
        .range(rows.length, rows.length + 499),
      `Could not load ${table}`,
    );
    total = count;
    if (!data?.length) {
      if (rows.length < total)
        throw new Error(
          `Could not load ${table}: incomplete response. Reload records.`,
        );
      break;
    }
    rows.push(...data);
  } while (rows.length < total);
  return rows;
}

export async function loadRecords() {
  const [tutors, students, sessions, achievements] = await Promise.all([
    readAll("tutors"),
    readAll("students"),
    readAll("sessions"),
    readAll("student_achievements"),
  ]);
  return {
    tutors: tutors.map(mapTutor),
    students: students.map(mapStudent),
    sessions: sessions.map(mapSession),
    achievements: achievements.map(mapAchievement),
  };
}

export function validateDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.slice(0, 4) === "0000")
    throw new Error("Choose a valid date.");
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value)
    throw new Error("Choose a valid date.");
  return value;
}

export function sessionToRow(record) {
  const minutes = Number(record.minutes);
  if (!record.studentId || !record.tutorId)
    throw new Error("Choose a student and a tutor.");
  if (!["completed", "TA", "SA", "H"].includes(record.status))
    throw new Error("Choose a valid attendance status.");
  if (
    !Number.isInteger(minutes) ||
    (record.status === "completed"
      ? minutes < 1 || minutes > 1440
      : minutes !== 0)
  ) {
    throw new Error(
      "Completed sessions require 1–1440 whole minutes. Absences and holidays require zero minutes.",
    );
  }
  return {
    student_id: record.studentId,
    tutor_id: record.tutorId,
    session_date: validateDate(record.date),
    status: record.status,
    minutes,
    notes: record.notes.trim(),
  };
}

export async function saveSession(record, isEditing = false) {
  const row = sessionToRow(record);
  const table = requireDatabase().from("sessions");
  const query = isEditing
    ? table.update(row).eq("id", record.id)
    : table.insert({ id: record.id, ...row });
  const { data } = await resultOf(
    query.select().single(),
    "Could not save session",
  );
  return mapSession(data);
}

export async function updateStudent(record) {
  if (!record.name.trim() || !record.tutorId)
    throw new Error("Enter a name and select an assigned tutor.");
  if (!["Active", "Stopped"].includes(record.status))
    throw new Error("Choose a valid student status.");
  if (record.status === "Stopped" && !record.stoppedReason.trim())
    throw new Error("Enter a stopped-tutoring reason.");
  const row = {
    tutor_id: record.tutorId,
    name: record.name.trim(),
    focus: record.focus.trim(),
    site: record.site.trim(),
    schedule: record.schedule.trim(),
    status: record.status,
    stopped_reason:
      record.status === "Stopped" ? record.stoppedReason.trim() : "",
    stopped_date:
      record.status === "Stopped" ? validateDate(record.stoppedDate) : null,
  };
  const { data } = await resultOf(
    requireDatabase()
      .from("students")
      .update(row)
      .eq("id", record.id)
      .select()
      .single(),
    "Could not save student",
  );
  return mapStudent(data);
}

export async function saveAchievement(record, isEditing = false) {
  if (!record.studentId || !record.tutorId || !record.description.trim())
    throw new Error("Choose a student, tutor, and enter an achievement.");
  const row = {
    student_id: record.studentId,
    tutor_id: record.tutorId,
    achievement_date: validateDate(record.date),
    description: record.description.trim(),
  };
  const table = requireDatabase().from("student_achievements");
  const query = isEditing
    ? table.update(row).eq("id", record.id)
    : table.insert({ id: record.id, ...row });
  const { data } = await resultOf(
    query.select().single(),
    "Could not save achievement",
  );
  return mapAchievement(data);
}

export async function deleteAchievement(id) {
  const { data } = await resultOf(
    requireDatabase()
      .from("student_achievements")
      .delete()
      .eq("id", id)
      .select("id")
      .single(),
    "Could not remove achievement",
  );
  return data.id;
}
