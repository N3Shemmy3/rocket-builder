import { fmt, money } from '../utils/format';

export function TelemetryColumn({
  mission,
  stats,
  surplusCount,
  telemetryLog,
  onLaunch,
  onReset,
}) {
  const metrics = [
    {
      id: 'budget',
      label: 'BUDGET',
      display: `${money(stats.cost)} / ${money(mission.budget)}`,
      value: stats.cost,
      max: mission.budget,
      canExceed: true,
    },
    {
      id: 'prep',
      label: 'PREP TIME',
      display: `${stats.prep.toFixed(1)} / ${mission.deadline}d`,
      value: stats.prep,
      max: mission.deadline,
      canExceed: true,
    },
    {
      id: 'twr',
      label: 'LAUNCH TWR',
      display: stats.twr.toFixed(2),
      value: stats.twr,
      max: 1.5,
      canExceed: false,
    },
    {
      id: 'dv',
      label: 'TOTAL DELTA-V',
      display: `${fmt(stats.deltaV)}m/s`,
      value: stats.deltaV,
      max: mission.deltaV,
      canExceed: false,
    },
  ];

  return (
    <aside className="telemetry-column" aria-label="Mission telemetry">
      <div className="metrics panel-flat">
        {metrics.map((m) => {
          const percent = Math.min(100, (100 * m.value) / m.max);
          const isOver = m.canExceed && m.value > m.max;
          return (
            <div className="metric" key={m.id}>
              <label>
                {m.label}: <span id={`${m.id}-label`}>{m.display}</span>
              </label>
              <div className="meter">
                <span
                  id={`${m.id}-meter`}
                  className={isOver ? 'over' : undefined}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="panel summary">
        <p>
          Reliability:<span id="reliability">{stats.reliability}%</span> |
          Surplus Parts:<span id="surplus-total">{surplusCount}</span>
        </p>
        <p>
          Wet Mass: <span id="total-mass">{fmt(stats.mass)}kg</span>
        </p>
      </div>
      <div className="panel-flat telemetry">
        <h2>TELEMETRY LOG</h2>
        <p id="telemetry-log" aria-live="polite">
          {telemetryLog}
        </p>
      </div>
      <button
        className="launch-button"
        id="launch"
        type="button"
        onClick={onLaunch}
      >
        LAUNCH DECK
      </button>
      <button
        className="reset-button"
        id="reset"
        type="button"
        onClick={onReset}
      >
        RESET BUILD
      </button>
    </aside>
  );
}
