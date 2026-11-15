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
import { installPartInSet, PARTS } from './data/parts';
import { useFlightAnimation } from './hooks/useFlightAnimation';
import { money } from './utils/format';
import {
  canReusePart,
  computeRocketStats,
  getAutoFitBuild,
  validateLaunch,
} from './utils/rocketStats';

const STORAGE_KEY = 'capricorn_campaign_v1';
const INITIAL_TELEMETRY =
  '[GO FOR LAUNCH] Drag modules from the Assembly Bay onto the launch pad to design your multi-stage vehicle, or select Auto-Fit Valid Build.';

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

  const mission = MISSIONS[missionIdx];
  const { flight, playFlight, resetFlight } = useFlightAnimation(mission);

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

  const stats = useMemo(
    () => computeRocketStats(installed, surplus),
    [installed, surplus]
  );

  const resetLaunchState = useCallback(
    (missionOverride) => {
      setLaunched(false);
      setShowSuccessModal(false);
      resetFlight(missionOverride);
    },
    [resetFlight]
  );

  const changeMission = useCallback(
    (delta) => {
      const nextIdx = (missionIdx + delta + MISSIONS.length) % MISSIONS.length;
      const nextMission = MISSIONS[nextIdx];
      setMissionIdx(nextIdx);
      setInstalled(new Set(['capsule']));
      setSurplus(new Set());
      resetLaunchState(nextMission);
      setTelemetryLog(
        `[MISSION CONTROL] ${nextMission.id} loaded. Awaiting vehicle configuration.`
      );
    },
    [missionIdx, resetLaunchState]
  );

  const applyInstallChange = useCallback(
    (key, shouldInstall, message) => {
      const nextInstalled = shouldInstall
        ? installPartInSet(installed, key)
        : (() => {
            const next = new Set(installed);
            next.delete(key);
            return next;
          })();

      setInstalled(nextInstalled);
      setSurplus((prev) => {
        const next = new Set();
        for (const k of prev) {
          if (nextInstalled.has(k) && canReusePart(k)) {
            next.add(k);
          }
        }
        return next;
      });

      resetLaunchState();
      setTelemetryLog(message);
    },
    [installed, resetLaunchState]
  );

  const handleSetInstalled = useCallback(
    (key, shouldInstall) => {
      const part = PARTS[key];
      const isInstalled = installed.has(key);

      if (shouldInstall) {
        if (isInstalled) {
          setTelemetryLog(
            `[ASSEMBLY] ${part.code} (${part.name}) is already mounted on the vehicle stack.`
          );
          return;
        }
        applyInstallChange(
          key,
          true,
          `[ASSEMBLY] Mounted ${part.code} (${part.name}) onto vehicle stack.`
        );
        return;
      }

      if (!isInstalled) return;
      applyInstallChange(
        key,
        false,
        `[ASSEMBLY] Detached ${part.code} (${part.name}) and returned to Assembly Bay.`
      );
    },
    [installed, applyInstallChange]
  );

  const handleToggleSurplus = useCallback(
    (key) => {
      const part = PARTS[key];
      if (!part) return;
      if (!canReusePart(key)) {
        setTelemetryLog(
          `[PROCUREMENT] ${part.code} (${part.name}) is single-use / non-reusable and cannot be refurbished.`
        );
        return;
      }

      const willBeReused = !surplus.has(key);

      setSurplus((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });

      resetLaunchState();
      setTelemetryLog(
        `[PROCUREMENT] ${part.code} set to ${
          willBeReused
            ? 'REUSED / REFURBISHED (-45% Cost, -50% Prep)'
            : 'FACTORY NEW'
        }.`
      );
    },
    [surplus, resetLaunchState]
  );

  const handleAutoFit = useCallback(() => {
    const { installed: fitInstalled, surplus: fitSurplus } =
      getAutoFitBuild(mission);
    setInstalled(fitInstalled);
    setSurplus(fitSurplus);
    resetLaunchState();
    setTelemetryLog(
      `[AUTO-FIT] Configured valid ${fitInstalled.size}-module vehicle for ${mission.id}. Review fuel staging, height, and delta-V before launch.`
    );
  }, [mission, resetLaunchState]);

  const handleReset = useCallback(() => {
    setInstalled(new Set(['capsule']));
    setSurplus(new Set());
    resetLaunchState();
    setTelemetryLog('[RESET] Assembly returned to initial configuration.');
  }, [resetLaunchState]);

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
    setShowLogoutModal(false);
    resetLaunchState(MISSIONS[0]);
    setTelemetryLog(INITIAL_TELEMETRY);
    setScreen('dashboard');
  }, [resetLaunchState]);

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
      `[LIFTOFF] ${activeMission.id}: Ascent to ${activeMission.altitude} km underway...`
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
        `[MISSION COMPLETE] ${activeMission.id}: Reached ${activeMission.altitude} km target orbit. Funding grant ${money(activeMission.grant)} recorded.`
      );
      setShowSuccessModal(true);
    }, activeMission);
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
              resetLaunchState();
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
              mission={mission}
              launched={launched}
              stats={stats}
              flight={flight}
              installedSet={installed}
              surplusSet={surplus}
              onSetInstalled={handleSetInstalled}
              onToggleSurplus={handleToggleSurplus}
              onTelemetryLog={setTelemetryLog}
            />
            <TelemetryColumn
              mission={mission}
              stats={stats}
              surplusCount={stats.reusedCount}
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
          surplusCount={stats.reusedCount}
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
            resetLaunchState();
            setScreen('start');
          }}
          onPowerDown={() => {
            setShowLogoutModal(false);
            resetLaunchState();
            setScreen('closed');
          }}
          onRebootToStartMenu={() => setScreen('start')}
        />
      )}
    </>
  );
}

export default App;
