import { fmt, money } from '../utils/format';
import { CollapsiblePanel } from './CollapsiblePanel';

export function TelemetryColumn({
  mission,
  stats,
  surplusCount,
  telemetryLog,
  launched,
  launchIssues,
  onLaunch,
  onReset,
  openPanels,
  onTogglePanel,
}) {
  const isReady = !launched && launchIssues.length === 0;
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

  const launchButtonClass = [
    'launch-button',
    launched ? 'is-launched' : isReady ? 'is-ready' : 'is-not-ready',
  ].join(' ');

  const launchTitle = launched
    ? 'FLIGHT IN PROGRESS'
    : isReady
      ? 'LAUNCH ROCKET'
      : 'NOT READY — HOLD';

  const launchSubtitle = launched
    ? 'ASCENT TELEMETRY ACTIVE'
    : isReady
      ? 'GO FOR LAUNCH · ALL SYSTEMS NOMINAL'
      : `${launchIssues.length} CHECK${launchIssues.length > 1 ? 'S' : ''} FAILED: ${launchIssues[0].toUpperCase()}`;

  return (
    <div className="telemetry-panels" aria-label="Mission telemetry">
      <CollapsiblePanel
        id="requirement-tracker"
        title="MISSION REQUIREMENT TRACKER"
        badge={isReady ? 'ALL GO' : launched ? 'ACTIVE' : `${launchIssues.length} HOLD`}
        badgeTone={isReady ? 'mint' : launched ? 'cyan' : 'danger'}
        isOpen={openPanels.tracker}
        onToggle={() => onTogglePanel('tracker')}
        className="tracker-panel"
      >
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
        <div className="summary">
          <p>
            Reliability: <span id="reliability">{stats.reliability}%</span> |
            Reused Parts: <span id="surplus-total">{surplusCount}</span>
          </p>
          <p>
            Wet Mass: <span id="total-mass">{fmt(stats.mass)}kg</span> | Height:{' '}
            <span id="total-height">{stats.heightM.toFixed(1)}m</span> (
            {stats.stages} {stats.stages === 1 ? 'Stage' : 'Stages'})
          </p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel
        id="telemetry-log-panel"
        title="TELEMETRY LOG"
        badge={launched ? 'LIVE' : 'IDLE'}
        badgeTone={launched ? 'mint' : 'purple'}
        isOpen={openPanels.telemetry}
        onToggle={() => onTogglePanel('telemetry')}
        className="telemetry-panel"
      >
        <div className="telemetry">
          <p id="telemetry-log" aria-live="polite">
            {telemetryLog}
          </p>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel
        id="launch-control-panel"
        title="LAUNCH DECK"
        badge={launched ? 'LAUNCHED' : isReady ? 'READY' : 'NOT READY'}
        badgeTone={launched ? 'cyan' : isReady ? 'mint' : 'danger'}
        isOpen={openPanels.launch}
        onToggle={() => onTogglePanel('launch')}
        className="launch-panel"
      >
        <div className="launch-controls">
          <button
            className={launchButtonClass}
            id="launch"
            type="button"
            data-ready={isReady ? 'true' : 'false'}
            aria-disabled={!isReady && !launched}
            onClick={onLaunch}
          >
            <span className="launch-btn-title">{launchTitle}</span>
            <span className="launch-btn-sub">{launchSubtitle}</span>
          </button>
          <button
            className="reset-button"
            id="reset"
            type="button"
            onClick={onReset}
          >
            RESET BUILD
          </button>
        </div>
      </CollapsiblePanel>
    </div>
  );
}
