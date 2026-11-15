import { useEffect } from 'react';
import { PART_ORDER } from '../data/parts';
import { money } from '../utils/format';
import { RocketSvg } from './RocketSvg';

export function StartMenu({
  commanderName,
  onCommanderNameChange,
  completedCount,
  totalMissions,
  reserve,
  onStart,
  onNewCampaign,
  onOpenNasaCodex,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  const fullPreviewSet = new Set(PART_ORDER);

  return (
    <div className="start-menu-screen" role="main" aria-label="Start menu">
      <div className="start-frame">
        <div className="start-meta-row">
          <span>NASA SPACE APPS CHALLENGE</span>
          <span>nasa 2026 space</span>
        </div>

        <div className="start-hero">
          <div className="start-brand-lockup">
            {/* <span className="start-badge">//CAPRICORN</span> */}
            <span className="start-sub-badge">//ASTRIX FLIGHT SYSTEMS</span>
          </div>
          <h1 className="start-title">NASA: CAPRICORN — MISSION CONTROL</h1>
          <p className="start-subtitle">
            Assemble flight-ready launch vehicles, balance NASA delta-V,
            thrust-to-weight, and procurement trade-offs, and guide orbital
            payloads from launch pad to lunar transfer.
          </p>

          <div className="start-visual-strip" aria-hidden="true">
            <svg
              className="celestial-emblem"
              viewBox="0 0 120 120"
              aria-hidden="true"
            >
              <circle
                cx="60"
                cy="60"
                r="46"
                fill="none"
                stroke="#00ffc8"
                strokeWidth="3"
              />
              <path
                d="M42 18 C52 34, 42 46, 30 50 C44 62, 40 82, 54 102 M78 24 C66 36, 74 52, 92 56 C80 68, 86 84, 72 98"
                fill="none"
                stroke="#00ffc8"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <div className="start-rocket-preview">
              <RocketSvg installed={fullPreviewSet} blueprintMode="blueprint" />
            </div>
            <svg
              className="celestial-emblem"
              viewBox="0 0 120 120"
              aria-hidden="true"
            >
              <circle
                cx="60"
                cy="60"
                r="46"
                fill="none"
                stroke="#bd73fa"
                strokeWidth="3"
              />
              <circle
                cx="76"
                cy="58"
                r="13"
                fill="none"
                stroke="#bd73fa"
                strokeWidth="2.5"
              />
              <ellipse
                cx="42"
                cy="36"
                rx="9"
                ry="5"
                transform="rotate(-25 42 36)"
                fill="none"
                stroke="#bd73fa"
                strokeWidth="2.5"
              />
              <ellipse
                cx="42"
                cy="86"
                rx="10"
                ry="5"
                transform="rotate(20 42 86)"
                fill="none"
                stroke="#bd73fa"
                strokeWidth="2.5"
              />
              <circle
                cx="54"
                cy="62"
                r="5"
                fill="none"
                stroke="#bd73fa"
                strokeWidth="2"
              />
            </svg>
          </div>

          <div className="start-commander-box">
            <label htmlFor="commander-callsign">FLIGHT DIRECTOR CALLSIGN</label>
            <input
              id="commander-callsign"
              type="text"
              maxLength={24}
              value={commanderName}
              onChange={(e) => onCommanderNameChange(e.target.value)}
              placeholder="CDR. VANCE"
            />
          </div>

          {completedCount > 0 && (
            <div className="start-saved-pill">
              SAVED CAMPAIGN: {completedCount}/{totalMissions} COMPLETED |
              RESERVE: {money(reserve)}
            </div>
          )}

          <div className="start-actions">
            <button
              type="button"
              className="start-primary-btn"
              id="start-mission-btn"
              onClick={onStart}
            >
              {completedCount > 0 ? 'RESUME CAMPAIGN' : 'ENTER MISSION CONTROL'}
            </button>
            <button
              type="button"
              className="start-secondary-btn"
              onClick={onOpenNasaCodex}
            >
              NASA ENGINEERING DATABASE &amp; RESOURCES
            </button>
            {completedCount > 0 && (
              <button
                type="button"
                className="start-danger-btn"
                onClick={onNewCampaign}
              >
                NEW CAMPAIGN (RESET PROGRESS)
              </button>
            )}
          </div>
        </div>

        <div className="start-footer">
          <span className="start-prompt">press [ENTER] or click to start</span>
          <span className="start-version">v-0.02 alpha</span>
        </div>
      </div>
    </div>
  );
}
