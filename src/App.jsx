import { useCallback, useEffect, useMemo, useState } from 'react';
import { BuildColumn } from './components/BuildColumn';
import { LogoutModal } from './components/LogoutModal';
import { MissionBriefing } from './components/MissionBriefing';
import { MissionSuccessModal } from './components/MissionSuccessModal';
import { NasaDatabaseModal } from './components/NasaDatabaseModal';
import { StartMenu } from './components/StartMenu';
import { TelemetryColumn } from './components/TelemetryColumn';
import { TopBar } from './components/TopBar';
import { MISSIONS } from './data/missions';
import { AUTOFIT_SURPLUS, PART_ORDER, PARTS } from './data/parts';
import { useFlightAnimation } from './hooks/useFlightAnimation';
import { money } from './utils/format';
import { computeRocketStats, validateLaunch } from './utils/rocketStats';

const STORAGE_KEY = 'capricorn_campaign_v1';
const INITIAL_TELEMETRY =
  '[GO FOR LAUNCH] Configure rocket components or select Auto-Fit Valid Build.';

function loadSavedState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      commanderName:
        typeof parsed.commanderName === 'string'
          ? parsed.commanderName
          : 'CDR. VANCE',
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      rescued: Number(parsed.rescued) || 0,
      delivered: Number(parsed.delivered) || 0,
      reserve: Number(parsed.reserve) || 0,
    };
  } catch {
    return null;
  }
}

export function App() {
  const saved = useMemo(() => loadSavedState(), []);

  const [screen, setScreen] = useState('start');
  const [commanderName, setCommanderName] = useState(
    () => saved?.commanderName ?? 'CDR. VANCE'
  );
  const [missionIdx, setMissionIdx] = useState(0);
  const [installed, setInstalled] = useState(() => new Set(['capsule']));
  const [surplus, setSurplus] = useState(() => new Set());
  const [launched, setLaunched] = useState(false);
  const [telemetryLog, setTelemetryLog] = useState(INITIAL_TELEMETRY);
  const [campaign, setCampaign] = useState(() => ({
    completed: new Set(saved?.completed ?? []),
    rescued: saved?.rescued ?? 0,
    delivered: saved?.delivered ?? 0,
    reserve: saved?.reserve ?? 0,
  }));

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showNasaModal, setShowNasaModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { flight, playFlight, resetFlight } = useFlightAnimation();

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          commanderName,
          completed: [...campaign.completed],
          rescued: campaign.rescued,
          delivered: campaign.delivered,
          reserve: campaign.reserve,
        })
      );
    } catch {
      // Ignore storage failures in restricted contexts.
    }
  }, [commanderName, campaign]);

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
      setShowSuccessModal(false);
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
      setShowSuccessModal(false);
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
      setShowSuccessModal(false);
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
    setShowSuccessModal(false);
    resetFlight();
    setTelemetryLog(
      '[AUTO-FIT] Vehicle assembled. Check budget, prep time, thrust, and delta-V before launch.'
    );
  }, [resetFlight]);

  const handleReset = useCallback(() => {
    setInstalled(new Set(['capsule']));
    setSurplus(new Set());
    setLaunched(false);
    setShowSuccessModal(false);
    resetFlight();
    setTelemetryLog('[RESET] Assembly returned to initial configuration.');
  }, [resetFlight]);

  const handleNewCampaign = useCallback(() => {
    setCampaign({
      completed: new Set(),
      rescued: 0,
      delivered: 0,
      reserve: 0,
    });
    setMissionIdx(0);
    setInstalled(new Set(['capsule']));
    setSurplus(new Set());
    setLaunched(false);
    setShowSuccessModal(false);
    setShowLogoutModal(false);
    resetFlight();
    setTelemetryLog(INITIAL_TELEMETRY);
    setScreen('dashboard');
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
    setShowSuccessModal(false);
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
      setShowSuccessModal(true);
    });
  }, [launched, installed, stats, mission, missionIdx, playFlight]);

  const appClasses = ['app'];
  if (flight.active) appClasses.push('flight-active');
  if (launched) appClasses.push('launched');

  return (
    <>
      {screen === 'start' && (
        <StartMenu
          commanderName={commanderName}
          onCommanderNameChange={setCommanderName}
          completedCount={campaign.completed.size}
          totalMissions={MISSIONS.length}
          reserve={campaign.reserve}
          onStart={() => setScreen('dashboard')}
          onNewCampaign={handleNewCampaign}
          onOpenNasaCodex={() => setShowNasaModal(true)}
        />
      )}

      {screen === 'dashboard' && (
        <div className={appClasses.join(' ')}>
          <TopBar
            commanderName={commanderName}
            completedCount={campaign.completed.size}
            totalMissions={MISSIONS.length}
            rescued={campaign.rescued}
            delivered={campaign.delivered}
            reserve={campaign.reserve}
            onPrevMission={() => changeMission(-1)}
            onNextMission={() => changeMission(1)}
            onAutoFit={handleAutoFit}
            onOpenNasaCodex={() => setShowNasaModal(true)}
            onOpenStartMenu={() => {
              resetFlight();
              setLaunched(false);
              setScreen('start');
            }}
            onOpenLogout={() => setShowLogoutModal(true)}
          />
          <main className="dashboard">
            <MissionBriefing
              mission={mission}
              missionIndex={missionIdx}
              totalMissions={MISSIONS.length}
              onOpenNasaCodex={() => setShowNasaModal(true)}
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
      )}

      {screen === 'closed' && (
        <LogoutModal
          mode="closed"
          commanderName={commanderName}
          completedSet={campaign.completed}
          rescued={campaign.rescued}
          delivered={campaign.delivered}
          reserve={campaign.reserve}
          onResumeDashboard={() => setScreen('dashboard')}
          onReturnToStartMenu={() => setScreen('start')}
          onPowerDown={() => setScreen('closed')}
          onRebootToStartMenu={() => setScreen('start')}
        />
      )}

      {screen === 'dashboard' && showSuccessModal && (
        <MissionSuccessModal
          mission={mission}
          missionIndex={missionIdx}
          totalMissions={MISSIONS.length}
          stats={stats}
          surplusCount={surplus.size}
          completedCount={campaign.completed.size}
          onNextMission={() => changeMission(1)}
          onStayOnPad={() => setShowSuccessModal(false)}
          onOpenNasaCodex={() => setShowNasaModal(true)}
          onCompleteDebrief={() => {
            setShowSuccessModal(false);
            setShowLogoutModal(true);
          }}
        />
      )}

      {showNasaModal && (
        <NasaDatabaseModal
          stats={stats}
          installedSet={installed}
          mission={mission}
          onClose={() => setShowNasaModal(false)}
        />
      )}

      {screen === 'dashboard' && showLogoutModal && (
        <LogoutModal
          mode="confirm"
          commanderName={commanderName}
          completedSet={campaign.completed}
          rescued={campaign.rescued}
          delivered={campaign.delivered}
          reserve={campaign.reserve}
          onResumeDashboard={() => setShowLogoutModal(false)}
          onReturnToStartMenu={() => {
            setShowLogoutModal(false);
            resetFlight();
            setLaunched(false);
            setScreen('start');
          }}
          onPowerDown={() => {
            setShowLogoutModal(false);
            resetFlight();
            setLaunched(false);
            setScreen('closed');
          }}
          onRebootToStartMenu={() => setScreen('start')}
        />
      )}
    </>
  );
}

export default App;
