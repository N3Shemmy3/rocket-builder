import { fmt, money } from '../utils/format';
import { CollapsiblePanel } from './CollapsiblePanel';

export function MissionBriefing({
  mission,
  missionIndex,
  totalMissions,
  onOpenNasaCodex,
  openPanels,
  onTogglePanel,
}) {
  return (
    <div className="mission-panels" aria-label="Mission briefing">
      <CollapsiblePanel
        id="mission-directive"
        title="MISSION DIRECTIVE"
        badge={`[${missionIndex + 1}/${totalMissions}] ${mission.id}`}
        badgeTone="purple"
        isOpen={openPanels.directive}
        onToggle={() => onTogglePanel('directive')}
        className="directive-panel"
      >
        <p id="mission-title" className="directive-title">
          [{missionIndex + 1}/{totalMissions}] {mission.id}: {mission.name}
        </p>
        <p className="purple text-label directive-category" id="mission-category">
          CATEGORY: {mission.category}
        </p>
        <p id="mission-description" className="directive-desc">
          {mission.description}
        </p>
        <div className="mission-nasa-tag">
          <span>ORBIT: {mission.orbitalRegime}</span>
          <span>NASA ANALOG: {mission.nasaAnalog}</span>
          <button
            type="button"
            className="mission-codex-link"
            onClick={onOpenNasaCodex}
          >
            Open NASA Dataset Reference &gt;
          </button>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel
        id="contract-constraints"
        title="CONTRACT CONSTRAINTS & TARGETS"
        badge={`${fmt(mission.altitude)}km`}
        badgeTone="cyan"
        isOpen={openPanels.constraints}
        onToggle={() => onTogglePanel('constraints')}
        className="constraints-panel"
      >
        <ul id="constraint-list" className="constraints-list">
          <li>Required Payload: {mission.payload}</li>
          <li>Min Cargo Capacity: {fmt(mission.cargo)}kg</li>
          {mission.requiredSeats > 0 && (
            <li>Required Crew Capacity: {mission.requiredSeats} Astronauts</li>
          )}
          <li>Target Orbit Altitude: {fmt(mission.altitude)}km</li>
          <li>Required Orbit Delta-V: {fmt(mission.deltaV)}m/s</li>
          <li className="spacer" />
          <li>Strict Budget Cap: {money(mission.budget)}</li>
          <li>Launch Window Deadline: {mission.deadline}d</li>
          <li>Completion Funding Grant: {money(mission.grant)}</li>
        </ul>
        <p className="tip">
          TIP: Toggle [REUSED] on liquid-fuel parts &amp; capsules to cut cost
          by 45% and prep time by 50%. Pair Solid SRBs or Upper Stages to reach
          higher Delta-V!
        </p>
      </CollapsiblePanel>
    </div>
  );
}
