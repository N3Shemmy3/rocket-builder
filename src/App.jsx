import { useCallback, useMemo, useState } from 'react';
import { BuildColumn } from './components/BuildColumn';
import { MissionBriefing } from './components/MissionBriefing';
import { TelemetryColumn } from './components/TelemetryColumn';
import { TopBar } from './components/TopBar';
import { MISSIONS } from './data/missions';
import { AUTOFIT_SURPLUS, PART_ORDER, PARTS } from './data/parts';
import { useFlightAnimation } from './hooks/useFlightAnimation';
import { money } from './utils/format';
import { computeRocketStats, validateLaunch } from './utils/rocketStats';

const INITIAL_TELEMETRY =
  '[GO FOR LAUNCH] Configure rocket components or select Auto-Fit Valid Build.';

export function App() {
  const [missionIdx, setMissionIdx] = useState(0);
  const [installed, setInstalled] = useState(() => new Set(['capsule']));
  const [surplus, setSurplus] = useState(() => new Set());
  const [launched, setLaunched] = useState(false);
  const [telemetryLog, setTelemetryLog] = useState(INITIAL_TELEMETRY);
  const [campaign, setCampaign] = useState({
    completed: new Set(),
    rescued: 0,
    delivered: 0,
    reserve: 0,
  });

  const { flight, playFlight, resetFlight } = useFlightAnimation();

  const mission = MISSIONS[missionIdx];
  const stats = useMemo(
    () => computeRocketStats(installed, surplus),
    [installed, surplus]
  );

  const changeMission = useCallback(
    (delta) => {
      const nextIdx = (missionIdx + delta + MISSIONS.length) % MISSIONS.length;
      setMissionIdx(nextIdx);
      setLaunched(false);
      setInstalled(new Set(['capsule']));
      setSurplus(new Set());
      resetFlight();
      setTelemetryLog(
        `[MISSION CONTROL] ${MISSIONS[nextIdx].id} loaded. Awaiting vehicle configuration.`
      );
    },
    [missionIdx, resetFlight]
  );

  const handleToggleInstall = useCallback(
    (key) => {
      const part = PARTS[key];
      const wasInstalled = installed.has(key);

      setInstalled((prev) => {
        const next = new Set(prev);
        if (wasInstalled) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });

      if (wasInstalled) {
        setSurplus((prev) => {
          if (!prev.has(key)) return prev;
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }

      setLaunched(false);
      resetFlight();
      setTelemetryLog(
        `[ASSEMBLY] ${wasInstalled ? 'Removed' : 'Installed'} ${part.code} ${wasInstalled ? 'from' : 'in'} build.`
      );
    },
    [installed, resetFlight]
  );

  const handleToggleSurplus = useCallback(
    (key) => {
      const part = PARTS[key];
      const willBeSurplus = !surplus.has(key);

      setSurplus((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });

      setLaunched(false);
      resetFlight();
      setTelemetryLog(
        `[PROCUREMENT] ${part.code} set to ${willBeSurplus ? 'SURPLUS' : 'FACTORY NEW'}.`
      );
    },
    [surplus, resetFlight]
  );

  const handleAutoFit = useCallback(() => {
    setInstalled(new Set(PART_ORDER));
    setSurplus(new Set(AUTOFIT_SURPLUS));
    setLaunched(false);
    resetFlight();
    setTelemetryLog(
      '[AUTO-FIT] Vehicle assembled. Check budget, prep time, thrust, and delta-V before launch.'
    );
  }, [resetFlight]);

  const handleReset = useCallback(() => {
    setInstalled(new Set(['capsule']));
    setSurplus(new Set());
    setLaunched(false);
    resetFlight();
    setTelemetryLog('[RESET] Assembly returned to initial configuration.');
  }, [resetFlight]);

  const handleLaunch = useCallback(() => {
    if (launched) return;
    const issues = validateLaunch(installed, stats, mission);
    if (issues.length > 0) {
      setTelemetryLog(`[NO GO] ${issues.join('; ')}.`);
      return;
    }

    const activeMissionIdx = missionIdx;
    const activeMission = mission;
    setLaunched(true);
    setTelemetryLog(
      `[LIFTOFF] ${activeMission.id}: Ascent underway. Tracking atmospheric and lunar scenery...`
    );

    playFlight(() => {
      setCampaign((prev) => {
        if (prev.completed.has(activeMissionIdx)) return prev;
        const nextCompleted = new Set(prev.completed);
        nextCompleted.add(activeMissionIdx);
        return {
          completed: nextCompleted,
          delivered: prev.delivered + activeMission.cargo,
          rescued: prev.rescued + (activeMissionIdx === 3 ? 3 : 0),
          reserve: prev.reserve + activeMission.grant,
        };
      });
      setTelemetryLog(
        `[MISSION COMPLETE] ${activeMission.id}: Flight sequence complete. Funding grant ${money(activeMission.grant)} recorded.`
      );
    });
  }, [launched, installed, stats, mission, missionIdx, playFlight]);

  const appClasses = ['app'];
  if (flight.active) appClasses.push('flight-active');
  if (launched) appClasses.push('launched');

  return (
    <div className={appClasses.join(' ')}>
      <TopBar
        completedCount={campaign.completed.size}
        totalMissions={MISSIONS.length}
        rescued={campaign.rescued}
        delivered={campaign.delivered}
        reserve={campaign.reserve}
        onPrevMission={() => changeMission(-1)}
        onNextMission={() => changeMission(1)}
        onAutoFit={handleAutoFit}
      />
      <main className="dashboard">
        <MissionBriefing
          mission={mission}
          missionIndex={missionIdx}
          totalMissions={MISSIONS.length}
        />
        <BuildColumn
          launched={launched}
          stats={stats}
          flight={flight}
          installedSet={installed}
          surplusSet={surplus}
          onToggleInstall={handleToggleInstall}
          onToggleSurplus={handleToggleSurplus}
        />
        <TelemetryColumn
          mission={mission}
          stats={stats}
          surplusCount={surplus.size}
          telemetryLog={telemetryLog}
          onLaunch={handleLaunch}
          onReset={handleReset}
        />
      </main>
    </div>
  );
}

export default App;
