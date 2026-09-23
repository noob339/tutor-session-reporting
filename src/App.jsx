import { useState } from "react";
import Attendance from "./views/Attendance.jsx";
import Students from "./views/Students.jsx";
import MonthlyReports from "./views/MonthlyReports.jsx";

const views = { Attendance, Students, "Monthly Reports": MonthlyReports };

export default function App() {
  const [currentView, setCurrentView] = useState("Attendance");
  const View = views[currentView];

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
          <span className="status-dot" /> Sample workspace
          <p>A first look at your tutoring records.</p>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>Learning, one session at a time.</span>
          <span className="badge">Foundation preview</span>
        </header>
        <main id="main-content" tabIndex="-1">
          <div className="sample-banner">
            <strong>Fictional sample data</strong>
            <span>
              Preview only. Records are not saved to a database. Entry and
              editing will be added next.
            </span>
          </div>
          <View />
        </main>
        <footer>
          Tutor Session Reporting <span>Sample period · September 2026</span>
        </footer>
      </div>
    </div>
  );
}
