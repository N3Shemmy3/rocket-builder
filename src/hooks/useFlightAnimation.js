import { useCallback, useEffect, useRef, useState } from 'react';
import { FLIGHT_DURATION, FLIGHT_STAGES, WORLD_TRAVEL } from '../data/flightStages';

const INITIAL_FLIGHT = {
  active: false,
  phase: 'pad',
  phaseLabel: FLIGHT_STAGES[0].label,
  progress: 0,
  altitude: 0,
  cameraY: WORLD_TRAVEL,
  rocketTransform: '',
};

function getPhaseAndAltitude(progress) {
  const phase =
    progress < 0.22
      ? 'pad'
      : progress < 0.48
        ? 'sky'
        : progress < 0.75
          ? 'space'
          : 'moon';

  const altitude =
    progress < 0.22
      ? (progress / 0.22) * 10
      : progress < 0.48
        ? 10 + ((progress - 0.22) / 0.26) * 130
        : progress < 0.75
          ? 140 + ((progress - 0.48) / 0.27) * 100000
          : 100140 + ((progress - 0.75) / 0.25) * 284260;

  return { phase, altitude };
}

export function useFlightAnimation() {
  const [flight, setFlight] = useState(INITIAL_FLIGHT);
  const frameRef = useRef(null);
  const onDoneRef = useRef(null);

  const cancelFrame = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const resetFlight = useCallback(() => {
    cancelFrame();
    onDoneRef.current = null;
    setFlight(INITIAL_FLIGHT);
  }, [cancelFrame]);

  const playFlight = useCallback(
    (onDone) => {
      cancelFrame();
      onDoneRef.current = onDone;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min(1, (now - start) / FLIGHT_DURATION);
        const { phase, altitude } = getPhaseAndAltitude(progress);
        const stage =
          FLIGHT_STAGES.find((s) => s.name === phase) || FLIGHT_STAGES[0];
        const cameraY = WORLD_TRAVEL * (1 - Math.max(0, Math.min(1, progress)));

        if (progress < 1) {
          const yOffset = -8 - Math.sin(progress * 24) * 5;
          const scale = 1 - Math.min(0.25, progress * 0.25);
          setFlight({
            active: true,
            phase,
            phaseLabel: stage.label,
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
            phaseLabel: stage.label,
            progress: 1,
            altitude,
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
