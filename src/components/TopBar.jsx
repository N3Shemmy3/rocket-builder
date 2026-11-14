import { fmt, money } from '../utils/format';

export function TopBar({
  completedCount,
  totalMissions,
  rescued,
  delivered,
  reserve,
  onPrevMission,
  onNextMission,
  onAutoFit,
}) {
  return (
    <header className="topbar">
      <div className="brand">
        <div>NASA: Capricorn</div>
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
      </nav>
    </header>
  );
}
