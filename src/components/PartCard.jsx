import { PARTS } from '../data/parts';
import { PartMiniSvg } from './PartMiniSvg';

const FUEL_BADGE_LABELS = {
  liquid: 'LIQUID',
  solid: 'SOLID',
  capsule: 'CAPSULE',
  none: 'AERO',
};

export function PartCard({
  partKey,
  installed,
  surplus,
  isDragging = false,
  onToggleSurplus,
  onSlotPointerDown,
  onSlotClickHint,
  onInspectStart,
  onInspectMove,
  onInspectEnd,
}) {
  const part = PARTS[partKey];
  const fuelLabel = FUEL_BADGE_LABELS[part.fuelType] ?? 'SYSTEM';
  const isSolid = part.fuelType === 'solid';

  return (
    <div
      className={`part-card${installed ? ' installed' : ''}${
        isDragging ? ' dragging' : ''
      } fuel-${part.fuelType}`}
      data-part={partKey}
      onPointerEnter={(e) => onInspectStart(partKey, e.clientX, e.clientY)}
      onPointerMove={(e) => onInspectMove(partKey, e.clientX, e.clientY)}
      onPointerLeave={onInspectEnd}
      onFocus={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onInspectStart(partKey, rect.right, rect.top);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          onInspectEnd();
        }
      }}
    >
      <button
        className="slot"
        type="button"
        data-action="install"
        aria-pressed={installed}
        aria-label={`${part.name} (${part.code}, ${part.stageRole}, ${fuelLabel}) — ${
          installed
            ? 'Mounted. Drag from rocket to Assembly Bay to remove.'
            : 'Available. Drag onto the launch pad to mount.'
        }`}
        onPointerDown={(e) => onSlotPointerDown?.(partKey, e)}
        onClick={(e) => onSlotClickHint?.(partKey, e)}
      >
        <div className="part-card-badges">
          <span className="part-role-badge">{part.stageRole}</span>
          <span className={`part-fuel-badge fuel-${part.fuelType}`}>
            {fuelLabel}
          </span>
        </div>
        <PartMiniSvg partKey={partKey} code={part.code} />
        <span className="part-code">{part.code}</span>
        <span className="part-name-compact">{part.name}</span>
        <span className="part-short-stat">{part.shortStat}</span>
        <span className="part-state">
          {installed ? 'MOUNTED' : 'AVAILABLE'}
        </span>
      </button>
      {part.reusable ? (
        <button
          className="part-mode"
          type="button"
          data-action="surplus"
          aria-pressed={surplus}
          aria-label={`Toggle reusable refurbished mode for ${part.name}`}
          onClick={() => onToggleSurplus(partKey)}
        >
          {surplus ? 'REUSED (-45%)' : 'NEW'}
        </button>
      ) : (
        <button
          className={`part-mode ${isSolid ? 'solid-locked' : 'standard-locked'}`}
          type="button"
          disabled
          aria-label={
            isSolid
              ? `${part.name} uses solid fuel and is single-use expendable`
              : `${part.name} uses standard fixed procurement`
          }
        >
          {isSolid ? 'SOLID · 1-USE' : 'STANDARD'}
        </button>
      )}
    </div>
  );
}
