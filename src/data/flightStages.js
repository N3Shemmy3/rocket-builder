export const DEFAULT_FLIGHT_DURATION = 12000;
export const FLIGHT_DURATION = DEFAULT_FLIGHT_DURATION;
export const WORLD_TRAVEL = 1860;

export const FLIGHT_STAGES = [
  { name: 'pad', label: '01 / LAUNCH SITE', alt: 0 },
  { name: 'sky', label: '02 / ASCENT THROUGH SKY', alt: 20 },
  { name: 'space', label: '03 / UPPER ATMOSPHERE & SPACE', alt: 140 },
  { name: 'moon', label: '04 / TARGET ORBIT', alt: 400 },
];

export function getMissionFlightProfile(mission) {
  const targetAlt = mission?.altitude ?? 400;
  const fallbackWaypoints = [
    Math.round(targetAlt * 0.03),
    Math.round(targetAlt * 0.25),
    Math.round(targetAlt * 0.68),
    targetAlt,
  ];
  const profile = mission?.flightProfile;

  return {
    durationMs: profile?.durationMs ?? DEFAULT_FLIGHT_DURATION,
    sceneType: profile?.sceneType ?? 'station',
    altitudeWaypoints: profile?.altitudeWaypoints ?? fallbackWaypoints,
    stages: {
      pad: profile?.stages?.pad ?? FLIGHT_STAGES[0].label,
      sky: profile?.stages?.sky ?? FLIGHT_STAGES[1].label,
      space: profile?.stages?.space ?? FLIGHT_STAGES[2].label,
      moon: profile?.stages?.moon ?? FLIGHT_STAGES[3].label,
    },
  };
}
