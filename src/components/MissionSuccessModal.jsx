import { useEffect } from 'react';
import { fmt, money } from '../utils/format';

const DESTINATION_LABELS = {
  station: 'ISS HORIZON-1',
  'lunar-relay': 'LUNAR RELAY',
  aurora: 'POLAR ORBIT',
  rescue: 'CREW CAPSULE',
  outpost: 'FRONTIER OUTPOST',
};

function DestinationIcon({ sceneType }) {
  switch (sceneType) {
    case 'station':
      return (
        <svg viewBox="0 0 64 64">
          {/* Central truss */}
          <line
            x1="6"
            y1="32"
            x2="58"
            y2="32"
            stroke="#bd73fa"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Solar array wings */}
          <g fill="none" stroke="#bd73fa" strokeWidth="1.8">
            <rect x="9" y="13" width="6" height="15" rx="1" />
            <rect x="9" y="36" width="6" height="15" rx="1" />
            <rect x="17" y="13" width="6" height="15" rx="1" />
            <rect x="17" y="36" width="6" height="15" rx="1" />
            <rect x="41" y="13" width="6" height="15" rx="1" />
            <rect x="41" y="36" width="6" height="15" rx="1" />
            <rect x="49" y="13" width="6" height="15" rx="1" />
            <rect x="49" y="36" width="6" height="15" rx="1" />
          </g>
          {/* Pressurized core & docking port */}
          <rect
            x="26"
            y="24"
            width="12"
            height="16"
            rx="2"
            fill="#0c0712"
            stroke="#bd73fa"
            strokeWidth="2.2"
          />
          <rect
            x="29"
            y="40"
            width="6"
            height="7"
            fill="none"
            stroke="#00ffc8"
            strokeWidth="1.8"
          />
          <circle cx="32" cy="52" r="2.2" fill="#00ffc8" />
        </svg>
      );
    case 'lunar-relay':
      return (
        <svg viewBox="0 0 64 64">
          {/* Cratered lunar body */}
          <circle
            cx="40"
            cy="40"
            r="15"
            fill="none"
            stroke="#bd73fa"
            strokeWidth="2.3"
          />
          <circle
            cx="45"
            cy="37"
            r="3.8"
            fill="none"
            stroke="#bd73fa"
            strokeWidth="1.6"
          />
          <circle
            cx="35"
            cy="45"
            r="2.6"
            fill="none"
            stroke="#bd73fa"
            strokeWidth="1.6"
          />
          {/* Relay satellite */}
          <rect
            x="15"
            y="14"
            width="10"
            height="10"
            rx="1.5"
            fill="none"
            stroke="#bd73fa"
            strokeWidth="2"
          />
          <rect
            x="6"
            y="17"
            width="9"
            height="4"
            fill="none"
            stroke="#bd73fa"
            strokeWidth="1.6"
          />
          <rect
            x="25"
            y="17"
            width="9"
            height="4"
            fill="none"
            stroke="#bd73fa"
            strokeWidth="1.6"
          />
          {/* Relay signal arcs */}
          <path
            d="M15 28 Q20 33 25 28"
            fill="none"
            stroke="#00ffc8"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M11 33 Q20 40 29 33"
            fill="none"
            stroke="#00ffc8"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.75"
          />
        </svg>
      );
    case 'aurora':
      return (
        <svg viewBox="0 0 64 64">
          {/* Aurora ribbons */}
          <path
            d="M10 22 Q22 10 34 20 T54 14"
            fill="none"
            stroke="#00ffc8"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M12 30 Q24 20 36 28 T52 23"
            fill="none"
            stroke="#bd73fa"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Polar Earth limb */}
          <path
            d="M10 50 Q32 33 54 50"
            fill="none"
            stroke="#bd73fa"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M16 54 Q32 42 48 54"
            fill="none"
            stroke="#bd73fa"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.65"
          />
          {/* Science probe */}
          <circle cx="32" cy="14" r="2.5" fill="#00ffc8" />
        </svg>
      );
    case 'rescue':
      return (
        <svg viewBox="0 0 64 64">
          {/* Distress / rendezvous reticle */}
          <circle
            cx="32"
            cy="33"
            r="23"
            fill="none"
            stroke="#bd73fa"
            strokeWidth="2"
            strokeDasharray="5 4"
          />
          {/* Crew capsule */}
          <path
            d="M32 16 L43 35 H21 Z"
            fill="none"
            stroke="#bd73fa"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <rect
            x="23"
            y="35"
            width="18"
            height="8"
            fill="none"
            stroke="#bd73fa"
            strokeWidth="2"
          />
          {/* Beacon */}
          <circle cx="32" cy="12" r="2.5" fill="#00ffc8" />
        </svg>
      );
    case 'outpost':
      return (
        <svg viewBox="0 0 64 64">
          {/* Frontier ground horizon */}
          <line
            x1="8"
            y1="49"
            x2="56"
            y2="49"
            stroke="#bd73fa"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
          {/* Habitat domes */}
          <path
            d="M13 49 A12 11 0 0 1 37 49"
            fill="none"
            stroke="#bd73fa"
            strokeWidth="2.3"
          />
          <path
            d="M35 49 A9 8 0 0 1 51 49"
            fill="none"
            stroke="#bd73fa"
            strokeWidth="2.1"
          />
          {/* Comms mast */}
          <line
            x1="25"
            y1="38"
            x2="25"
            y2="20"
            stroke="#bd73fa"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M19 23 Q25 17 31 23"
            fill="none"
            stroke="#00ffc8"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="25" cy="15" r="2.2" fill="#00ffc8" />
        </svg>
      );
    default:
      return (
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
      );
  }
}

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
  const sceneType = mission.flightProfile?.sceneType;
  const destinationLabel = DESTINATION_LABELS[sceneType] || 'DESTINATION';

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
            <DestinationIcon sceneType={sceneType} />
            <span>{destinationLabel}</span>
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
