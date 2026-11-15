import { useEffect } from 'react';
import { fmt, money } from '../utils/format';

export function MissionSuccessModal({
  mission,
  missionIndex,
  totalMissions,
  stats,
  surplusCount,
  completedCount,
  onNextMission,
  onStayOnPad,
  onOpenNasaCodex,
  onCompleteDebrief,
}) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onStayOnPad();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onStayOnPad]);

  const crewRescued = missionIndex === 3 ? 3 : 0;
  const allComplete = completedCount >= totalMissions;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onStayOnPad();
      }}
    >
      <div className="modal-window success-modal">
        <div className="modal-header">
          <div>
            <span className="modal-badge success-badge">
              // ORBITAL INSERTION &amp; MISSION SUCCESSFUL
            </span>
            <h2 id="success-modal-title">
              [{missionIndex + 1}/{totalMissions}] {mission.id}: {mission.name}
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onStayOnPad}
            aria-label="Close mission summary"
          >
            [X]
          </button>
        </div>

        <div className="success-trajectory" aria-hidden="true">
          <div className="trajectory-node">
            <svg viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="24"
                fill="none"
                stroke="#00ffc8"
                strokeWidth="2.5"
              />
              <path
                d="M22 10 C28 19, 22 25, 16 28 C23 34, 21 44, 28 54 M42 14 C35 20, 40 28, 49 30 C43 37, 46 45, 39 52"
                fill="none"
                stroke="#00ffc8"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
            <span>EARTH PAD</span>
          </div>
          <div className="trajectory-arc">
            <span className="trajectory-regime">{mission.orbitalRegime}</span>
            <div className="trajectory-line" />
            <span className="trajectory-alt">
              TARGET ALT: {fmt(mission.altitude)} KM
            </span>
          </div>
          <div className="trajectory-node">
            <svg viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="24"
                fill="none"
                stroke="#bd73fa"
                strokeWidth="2.5"
              />
              <circle
                cx="41"
                cy="31"
                r="7"
                fill="none"
                stroke="#bd73fa"
                strokeWidth="2"
              />
              <circle
                cx="22"
                cy="20"
                r="4"
                fill="none"
                stroke="#bd73fa"
                strokeWidth="2"
              />
              <circle
                cx="23"
                cy="45"
                r="4.5"
                fill="none"
                stroke="#bd73fa"
                strokeWidth="2"
              />
            </svg>
            <span>DESTINATION</span>
          </div>
        </div>

        <div className="success-metrics-grid">
          <div className="success-stat">
            <span>FUNDING GRANT</span>
            <strong className="accent-mint">+{money(mission.grant)}</strong>
          </div>
          <div className="success-stat">
            <span>CARGO DELIVERED</span>
            <strong>{fmt(mission.cargo)} kg</strong>
          </div>
          <div className="success-stat">
            <span>CREW RESCUED</span>
            <strong>
              {crewRescued > 0 ? `${crewRescued} Astronauts` : '0 (Uncrewed)'}
            </strong>
          </div>
          <div className="success-stat">
            <span>VEHICLE WET MASS</span>
            <strong>{fmt(stats.mass)} kg</strong>
          </div>
          <div className="success-stat">
            <span>ACHIEVED DELTA-V</span>
            <strong className="accent-cyan">
              {fmt(stats.deltaV)} / {fmt(mission.deltaV)} m/s
            </strong>
          </div>
          <div className="success-stat">
            <span>LAUNCH TWR</span>
            <strong>{stats.twr.toFixed(2)} (Min 1.20)</strong>
          </div>
          <div className="success-stat">
            <span>FINAL COST</span>
            <strong>
              {money(stats.cost)} / {money(mission.budget)}
            </strong>
          </div>
          <div className="success-stat">
            <span>SYSTEM RELIABILITY</span>
            <strong>
              {stats.reliability}% ({surplusCount} Reused)
            </strong>
          </div>
        </div>

        <div className="nasa-analog-box">
          <div className="nasa-analog-title">NASA HERITAGE &amp; DATASET</div>
          <p>
            <strong>Program Analog:</strong> {mission.nasaAnalog}
          </p>
          <p>
            <strong>Reference Dataset:</strong> {mission.nasaDataset}
          </p>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="modal-btn-primary"
            onClick={onNextMission}
          >
            NEXT MISSION &gt;
          </button>
          {allComplete && (
            <button
              type="button"
              className="modal-btn-mint"
              onClick={onCompleteDebrief}
            >
              COMPLETE CAMPAIGN &amp; DEBRIEF
            </button>
          )}
          <button
            type="button"
            className="modal-btn-secondary"
            onClick={onOpenNasaCodex}
          >
            NASA CODEX
          </button>
          <button
            type="button"
            className="modal-btn-secondary"
            onClick={onStayOnPad}
          >
            STAY ON PAD
          </button>
        </div>
      </div>
    </div>
  );
}
