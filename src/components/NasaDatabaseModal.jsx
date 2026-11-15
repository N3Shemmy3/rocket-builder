import { useEffect, useState } from 'react';
import {
  NASA_DELTA_V_MAP,
  NASA_SE_PRINCIPLES,
  NASA_VEHICLES,
  SPACE_APPS_RESOURCES,
} from '../data/nasaResources';
import { fmt } from '../utils/format';

const G0 = 9.80665;
const VAC_ISP_S = 348;
const TANK_PROPELLANT_KG = 22000;

const TABS = [
  { id: 'deltav', label: 'DELTA-V & PHYSICS' },
  { id: 'vehicles', label: 'NASA VEHICLES' },
  { id: 'systems', label: 'SYSTEMS ENG.' },
  { id: 'resources', label: 'SPACE APPS RESOURCES' },
];

export function NasaDatabaseModal({
  stats,
  installedSet,
  mission,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState('deltav');

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const hasTank = installedSet?.has('tank') ?? false;
  const hasEngine = installedSet?.has('engine') ?? false;
  const wetMass = stats?.mass ?? 14250;
  const propMass = hasTank ? TANK_PROPELLANT_KG : 0;
  const dryMass = Math.max(50, wetMass - propMass);
  const effectiveIsp = hasEngine ? VAC_ISP_S : 0;
  const tsiolkovskyDv =
    hasEngine && hasTank
      ? Math.round(effectiveIsp * G0 * Math.log(wetMass / dryMass))
      : 0;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nasa-codex-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-window nasa-modal">
        <div className="modal-header">
          <div>
            <span className="modal-badge">
              // NASA SPACE APPS 2026 ENGINEERING CODEX
            </span>
            <h2 id="nasa-codex-title">
              NASA DATASETS &amp; MISSION DESIGN REFERENCE
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close NASA database"
          >
            [X]
          </button>
        </div>

        <div className="codex-tabs" role="tablist" aria-label="NASA Codex sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`codex-tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="codex-body" role="tabpanel">
          {activeTab === 'deltav' && (
            <div className="codex-section">
              <div className="tsiolkovsky-card">
                <div className="tsiolkovsky-header">
                  <strong>LIVE TSIOLKOVSKY ROCKET EQUATION</strong>
                  <code>Δv = Isp · g₀ · ln(m₀ / mf)</code>
                </div>
                <p className="tsiolkovsky-sub">
                  Active Target: <strong>{mission?.id}</strong> (
                  {mission?.orbitalRegime}) — Required Δv:{' '}
                  <strong>{fmt(mission?.deltaV ?? 0)} m/s</strong>
                </p>
                <div className="tsiolkovsky-grid">
                  <div>
                    <span>WET MASS (m₀)</span>
                    <strong>{fmt(wetMass)} kg</strong>
                  </div>
                  <div>
                    <span>DRY MASS (mf)</span>
                    <strong>{fmt(dryMass)} kg</strong>
                  </div>
                  <div>
                    <span>VACUUM Isp</span>
                    <strong>{effectiveIsp > 0 ? `${effectiveIsp} s` : '0 s'}</strong>
                  </div>
                  <div>
                    <span>EQUATION Δv</span>
                    <strong className="accent-cyan">
                      {fmt(tsiolkovskyDv)} m/s
                    </strong>
                  </div>
                  <div>
                    <span>SIMULATED Δv</span>
                    <strong className="accent-mint">
                      {fmt(stats?.deltaV ?? 0)} m/s
                    </strong>
                  </div>
                </div>
              </div>

              <h3>NASA / JPL HORIZONS ORBITAL DELTA-V BUDGETS</h3>
              <div className="codex-table-wrap">
                <table className="codex-table">
                  <thead>
                    <tr>
                      <th>Orbital Leg</th>
                      <th>Typical Δv</th>
                      <th>Min TWR</th>
                      <th>Engineering Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {NASA_DELTA_V_MAP.map((row) => (
                      <tr key={row.leg}>
                        <td>{row.leg}</td>
                        <td className="accent-cyan">{row.deltaV}</td>
                        <td>{row.twr}</td>
                        <td>{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'vehicles' && (
            <div className="codex-section">
              <h3>NASA LAUNCH SERVICES PROGRAM &amp; PARTNER FLEET</h3>
              <div className="codex-table-wrap">
                <table className="codex-table">
                  <thead>
                    <tr>
                      <th>Vehicle / Spacecraft</th>
                      <th>NASA Program</th>
                      <th>LEO Payload</th>
                      <th>TLI Payload</th>
                      <th>Liftoff Thrust</th>
                      <th>Wet Mass</th>
                    </tr>
                  </thead>
                  <tbody>
                    {NASA_VEHICLES.map((v) => (
                      <tr key={v.vehicle}>
                        <td className="accent-cyan">{v.vehicle}</td>
                        <td>{v.program}</td>
                        <td>{v.leoPayload}</td>
                        <td>{v.tliPayload}</td>
                        <td>{v.thrust}</td>
                        <td>{v.wetMass}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'systems' && (
            <div className="codex-section">
              <h3>NASA SYSTEMS ENGINEERING TRADE-OFFS</h3>
              <div className="principles-grid">
                {NASA_SE_PRINCIPLES.map((item) => (
                  <article className="principle-card" key={item.title}>
                    <span className="principle-ref">{item.reference}</span>
                    <h4>{item.title}</h4>
                    <p>{item.summary}</p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="codex-section">
              <h3>OFFICIAL NASA &amp; SPACE APPS 2026 RESOURCES</h3>
              <div className="resources-list">
                {SPACE_APPS_RESOURCES.map((res) => (
                  <a
                    key={res.url}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-link-card"
                  >
                    <div className="resource-top">
                      <span className="resource-category">{res.category}</span>
                      <span className="resource-open">OPEN ↗</span>
                    </div>
                    <h4>{res.title}</h4>
                    <p>{res.summary}</p>
                    <span className="resource-url">{res.url}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="modal-btn-primary"
            onClick={onClose}
          >
            CLOSE CODEX
          </button>
        </div>
      </div>
    </div>
  );
}
