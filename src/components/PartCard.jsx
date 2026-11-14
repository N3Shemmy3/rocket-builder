import { PARTS } from '../data/parts';
import { PartMiniSvg } from './PartMiniSvg';

export function PartCard({
  partKey,
  installed,
  surplus,
  onToggleInstall,
  onToggleSurplus,
  onInspectStart,
  onInspectMove,
  onInspectEnd,
}) {
  const part = PARTS[partKey];

  return (
    <div
      className={`part-card${installed ? ' installed' : ''}`}
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
        aria-label={`${installed ? 'Remove' : 'Install'} ${part.name}`}
        onClick={() => onToggleInstall(partKey)}
      >
        <PartMiniSvg partKey={partKey} code={part.code} />
        <span className="part-code">{part.code}</span>
        <span className="part-state">
          {installed ? 'INSTALLED' : 'AVAILABLE'}
        </span>
      </button>
      <button
        className="part-mode"
        type="button"
        data-action="surplus"
        aria-pressed={surplus}
        aria-label={`Toggle surplus for ${part.name}`}
        onClick={() => onToggleSurplus(partKey)}
      >
        {surplus ? 'SURPLUS' : 'NEW'}
      </button>
    </div>
  );
}
