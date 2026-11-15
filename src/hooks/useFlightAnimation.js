import { useCallback, useEffect, useRef, useState } from 'react';
import { getMissionFlightProfile, WORLD_TRAVEL } from '../data/flightStages';

function createInitialFlight(mission) {
  const profile = getMissionFlightProfile(mission);
  return {
    active: false,
    phase: 'pad',
    phaseLabel: profile.stages.pad,
    progress: 0,
    altitude: 0,
    cameraY: WORLD_TRAVEL,
    rocketTransform: '',
  };
}

function getPhaseAndAltitude(progress, profile) {
  const [padTop, skyTop, spaceTop, targetAlt] = profile.altitudeWaypoints;

  if (progress < 0.22) {
    return {
      phase: 'pad',
      altitude: (progress / 0.22) * padTop,
    };
  }
  if (progress < 0.48) {
    return {
      phase: 'sky',
      altitude: padTop + ((progress - 0.22) / 0.26) * (skyTop - padTop),
    };
  }
  if (progress < 0.75) {
    return {
      phase: 'space',
      altitude: skyTop + ((progress - 0.48) / 0.27) * (spaceTop - skyTop),
    };
  }
  return {
    phase: 'moon',
    altitude: spaceTop + ((progress - 0.75) / 0.25) * (targetAlt - spaceTop),
  };
}

export function useFlightAnimation(mission) {
  const [flight, setFlight] = useState(() => createInitialFlight(mission));
  const frameRef = useRef(null);
  const onDoneRef = useRef(null);
  const missionRef = useRef(mission);
  missionRef.current = mission;

  const cancelFrame = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const resetFlight = useCallback(
    (missionOverride) => {
      cancelFrame();
      onDoneRef.current = null;
      setFlight(createInitialFlight(missionOverride ?? missionRef.current));
    },
    [cancelFrame]
  );

  const playFlight = useCallback(
    (onDone, missionOverride) => {
      cancelFrame();
      onDoneRef.current = onDone;
      const profile = getMissionFlightProfile(
        missionOverride ?? missionRef.current
      );
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min(1, (now - start) / profile.durationMs);
        const { phase, altitude } = getPhaseAndAltitude(progress, profile);
        const phaseLabel = profile.stages[phase] || profile.stages.pad;
        const cameraY =
          WORLD_TRAVEL * (1 - Math.max(0, Math.min(1, progress)));

        if (progress < 1) {
          const yOffset = -8 - Math.sin(progress * 24) * 5;
          const scale = 1 - Math.min(0.25, progress * 0.25);
          setFlight({
            active: true,
            phase,
            phaseLabel,
            progress,
            altitude,
            cameraY,
            rocketTransform: `translateY(${yOffset}px) scale(${scale})`,
          });
          frameRef.current = requestAnimationFrame(tick);
        } else {
          frameRef.current = null;
          setFlight({
            active: false,
            phase,
            phaseLabel,
            progress: 1,
            altitude: profile.altitudeWaypoints[3],
            cameraY: 0,
            rocketTransform: 'translateY(-8px) scale(.75)',
          });
          const callback = onDoneRef.current;
          onDoneRef.current = null;
          if (callback) callback();
        }
      };

      frameRef.current = requestAnimationFrame(tick);
    },
    [cancelFrame]
  );

  useEffect(() => cancelFrame, [cancelFrame]);

  return { flight, playFlight, resetFlight };
}
