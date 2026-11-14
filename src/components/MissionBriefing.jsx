import { fmt, money } from '../utils/format';

export function MissionBriefing({ mission, missionIndex, totalMissions }) {
  return (
    <section className="mission-column" aria-label="Mission briefing">
      <div className="panel directive">
        <h2>Mission Directive</h2>
        <p id="mission-title">
          [{missionIndex + 1}/{totalMissions}] {mission.id}: {mission.name}
        </p>
      </div>
      <div className="panel description">
        <p className="purple text-label" id="mission-category">
          CATEGORY: {mission.category}
        </p>
        <p id="mission-description">{mission.description}</p>
      </div>
      <div className="panel constraints">
        <h2>CONTRACT CONSTRAINTS &amp; TARGETS</h2>
        <ul id="constraint-list">
          <li>Required Payload: {mission.payload}</li>
          <li>Min Cargo Capacity: {fmt(mission.cargo)}kg</li>
          <li>Target Orbit Altitude: {fmt(mission.altitude)}km</li>
          <li>Required Orbit Delta-V: {fmt(mission.deltaV)}m/s</li>
          <li className="spacer" />
          <li>Strict Budget Cap: {money(mission.budget)}</li>
          <li>Launch Window Deadline: {mission.deadline}d</li>
          <li>Completion Funding Grant: {money(mission.grant)}</li>
        </ul>
        <p className="tip">
          TIP: Toggle [SURPLUS] on parts to cut cost by 45% and prep time by
          50%, or click [Auto-Fit Valid Build] in the top-right!
        </p>
      </div>
    </section>
  );
}
