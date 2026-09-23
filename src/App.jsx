import { useEffect, useState } from "react";
import Attendance from "./views/Attendance.jsx";
import Students from "./views/Students.jsx";
import MonthlyReports from "./views/MonthlyReports.jsx";
import { isDatabaseConfigured, loadRecords } from "./lib/database.js";
import * as sampleData from "./data/sampleData.js";

const views = { Attendance, Students, "Monthly Reports": MonthlyReports };

export default function App() {
  const [currentView, setCurrentView] = useState("Attendance");
  const [preview] = useState(() => !isDatabaseConfigured());
  const [records, setRecords] = useState(() => (preview ? sampleData : null));
  const [loadError, setLoadError] = useState("");
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const View = views[currentView];

  useEffect(() => {
    if (preview) return;
    let ignore = false;
    loadRecords()
      .then((data) => {
        if (!ignore) setRecords(data);
      })
      .catch((error) => {
        if (!ignore) setLoadError(error.message);
      });
    return () => {
      ignore = true;
    };
  }, [preview, reload]);

  function refreshRecords() {
    setRecords(null);
    setLoadError("");
    setReload((value) => value + 1);
  }

  function recordSaved(collection, record) {
    setRecords((previous) => ({
      ...previous,
      [collection]: previous[collection].some((item) => item.id === record.id)
        ? previous[collection].map((item) =>
            item.id === record.id ? record : item,
          )
        : [...previous[collection], record],
    }));
  }

  function achievementRemoved(id) {
    setRecords((previous) => ({
      ...previous,
      achievements: previous.achievements.filter((item) => item.id !== id),
    }));
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            t.
          </span>
          <span>
            Tutor Session
            <br />
            <strong>Reporting</strong>
          </span>
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Main navigation">
          {Object.keys(views).map((name, index) => (
            <button
              key={name}
              type="button"
              disabled={busy}
              aria-current={currentView === name ? "page" : undefined}
              onClick={() => setCurrentView(name)}
            >
              <span className="nav-number" aria-hidden="true">
                0{index + 1}
              </span>
              {name}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="status-dot" />{" "}
          {preview ? "Sample workspace" : "Public demo"}
          <p>Fictional records only. No sign-in required.</p>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>Learning, one session at a time.</span>
          <span className="badge">
            {preview ? "Offline preview" : "Supabase demo"}
          </span>
        </header>
        <main id="main-content" tabIndex="-1">
          <div className="sample-banner">
            <strong>
              {preview
                ? "Fictional sample data · Preview only"
                : "Public demo · Fictional records"}
            </strong>
            <span>
              {preview
                ? "Supabase configuration is missing. These sample records cannot be saved."
                : "Visitors can edit shared demo records. Tutor selection is a demo control, not authorization."}
            </span>
          </div>
          {!preview && (
            <div className="data-toolbar">
              <button
                type="button"
                className="secondary-button"
                disabled={busy || (!records && !loadError)}
                onClick={refreshRecords}
              >
                Reload records
              </button>
            </div>
          )}
          {loadError ? (
            <section className="panel empty-state" role="alert">
              <h2>Database records could not be loaded</h2>
              <p>{loadError}</p>
              <p>
                No sample fallback is being shown. Use Reload records to retry.
              </p>
            </section>
          ) : !records ? (
            <p className="empty-state" role="status">
              Loading database records…
            </p>
          ) : (
            <View
              records={records}
              preview={preview}
              onSaved={recordSaved}
              onAchievementRemoved={achievementRemoved}
              onBusyChange={setBusy}
            />
          )}
        </main>
        <footer>
          Tutor Session Reporting{" "}
          <span>
            {preview
              ? "Sample period · September 2026"
              : "Shared fictional demo data"}
          </span>
        </footer>
      </div>
    </div>
  );
}
