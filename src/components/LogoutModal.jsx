import { useEffect } from 'react';
import { MISSIONS } from '../data/missions';
import { fmt, money } from '../utils/format';

export function LogoutModal({
  mode,
  commanderName,
  completedSet,
  rescued,
  delivered,
  reserve,
  onResumeDashboard,
  onReturnToStartMenu,
  onPowerDown,
  onRebootToStartMenu,
}) {
  useEffect(() => {
    if (mode !== 'confirm') return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') onResumeDashboard();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mode, onResumeDashboard]);

  const completedCount = completedSet.size;
  const director = commanderName.trim() || 'CDR. VANCE';

  if (mode === 'closed') {
    return (
      <div
        className="terminal-closed-screen"
        role="main"
        aria-label="Session terminated"
      >
        <div className="closed-frame">
          <div className="start-meta-row">
            <span>NASA: CAPRICORN // TELEMETRY ARCHIVED</span>
            <span>nasa 2026 space</span>
          </div>
          <div className="closed-hero">
            <span className="start-badge">//CAPRICON</span>
            <h1>// SESSION TERMINATED</h1>
            <p className="closed-subtitle">
              Flight Director <strong>{director}</strong> signed off. Campaign
              telemetry and mission grants have been archived locally.
            </p>

            <div className="debrief-summary-grid">
              <div className="debrief-stat">
                <span>MISSIONS COMPLETED</span>
                <strong className="accent-mint">
                  {completedCount} / {MISSIONS.length}
                </strong>
              </div>
              <div className="debrief-stat">
                <span>ASTRONAUTS RESCUED</span>
                <strong>{rescued}</strong>
              </div>
              <div className="debrief-stat">
                <span>CARGO DELIVERED</span>
                <strong>{fmt(delivered)} kg</strong>
              </div>
              <div className="debrief-stat">
                <span>AGENCY RESERVE</span>
                <strong className="accent-cyan">{money(reserve)}</strong>
              </div>
            </div>

            <div className="closed-actions">
              <button
                type="button"
                className="start-primary-btn"
                onClick={onRebootToStartMenu}
              >
                REBOOT TO START MENU
              </button>
              <button
                type="button"
                className="start-secondary-btn"
                onClick={onResumeDashboard}
              >
                RE-ENTER MISSION CONTROL
              </button>
            </div>
          </div>
          <div className="start-footer">
            <span className="start-prompt">console standing by</span>
            <span className="start-version">v-0.02 alpha</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onResumeDashboard();
      }}
    >
      <div className="modal-window logout-modal">
        <div className="modal-header">
          <div>
            <span className="modal-badge">
              // FLIGHT DIRECTOR SHIFT DEBRIEF
            </span>
            <h2 id="logout-modal-title">
              CLOSE SESSION — {director}
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onResumeDashboard}
            aria-label="Cancel logout"
          >
            [X]
          </button>
        </div>

        <div className="debrief-summary-grid">
          <div className="debrief-stat">
            <span>MISSIONS COMPLETED</span>
            <strong className="accent-mint">
              {completedCount} / {MISSIONS.length}
            </strong>
          </div>
          <div className="debrief-stat">
            <span>ASTRONAUTS RESCUED</span>
            <strong>{rescued}</strong>
          </div>
          <div className="debrief-stat">
            <span>CARGO DELIVERED</span>
            <strong>{fmt(delivered)} kg</strong>
          </div>
          <div className="debrief-stat">
            <span>AGENCY RESERVE</span>
            <strong className="accent-cyan">{money(reserve)}</strong>
          </div>
        </div>

        <div className="debrief-missions-list">
          <h3>CAMPAIGN MANIFEST</h3>
          <div className="debrief-badges">
            {MISSIONS.map((m, idx) => {
              const done = completedSet.has(idx);
              return (
                <div
                  key={m.id}
                  className={`debrief-mission-badge${done ? ' done' : ''}`}
                >
                  <span>{m.id}</span>
                  <small>{m.name}</small>
                  <strong>{done ? 'COMPLETED' : 'PENDING'}</strong>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="modal-btn-primary"
            onClick={onResumeDashboard}
          >
            RESUME MISSION CONTROL
          </button>
          <button
            type="button"
            className="modal-btn-secondary"
            onClick={onReturnToStartMenu}
          >
            RETURN TO START MENU
          </button>
          <button
            type="button"
            className="modal-btn-danger"
            onClick={onPowerDown}
          >
            END SESSION &amp; POWER DOWN
          </button>
        </div>
      </div>
    </div>
  );
}
