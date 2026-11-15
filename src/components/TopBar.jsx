import { fmt, money } from '../utils/format';

export function TopBar({
  commanderName,
  completedCount,
  totalMissions,
  rescued,
  delivered,
  reserve,
  onPrevMission,
  onNextMission,
  onAutoFit,
  onOpenNasaCodex,
  onOpenStartMenu,
  onOpenLogout,
}) {
  const director = commanderName?.trim() || 'CDR. VANCE';

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-title-row">
          <span>NASA: Capricorn</span>
          <span className="brand-director-pill">DIR: {director}</span>
        </div>
        <small id="campaign-line">
          Campaign: {completedCount}/{totalMissions} Completed | Astronauts
          Rescued: {rescued} | Cargo Delivered: {fmt(delivered)}kg | Agency
          Reserve: {money(reserve)}
        </small>
      </div>
      <nav className="top-actions" aria-label="Mission navigation">
        <button id="prev-mission" type="button" onClick={onPrevMission}>
          Prev Mission &lt;
        </button>
        <button id="next-mission" type="button" onClick={onNextMission}>
          Next Mission &gt;
        </button>
        <button id="autofit" type="button" onClick={onAutoFit}>
          Auto-Fit Valid Build
        </button>
        <button
          id="nasa-codex-btn"
          type="button"
          className="nav-accent-btn"
          onClick={onOpenNasaCodex}
        >
          NASA Codex
        </button>
        <button id="menu-btn" type="button" onClick={onOpenStartMenu}>
          Start Menu
        </button>
        <button
          id="logout-btn"
          type="button"
          className="nav-danger-btn"
          onClick={onOpenLogout}
        >
          Logout
        </button>
      </nav>
    </header>
  );
}
