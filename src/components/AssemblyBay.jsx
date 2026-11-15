import { useState } from 'react';
import { PART_CATEGORIES, PART_ORDER, PARTS } from '../data/parts';
import { PartCard } from './PartCard';
import { PartInspector } from './PartInspector';

export function AssemblyBay({
  installedSet,
  surplusSet,
  bayRef,
  activeDragPart = null,
  dragSource = null,
  isOverBay = false,
  inspected = null,
  onToggleSurplus,
  onSlotPointerDown,
  onSlotClickHint,
  onInspectStart,
  onInspectMove,
  onInspectEnd,
  onNativeDragOver,
  onNativeDrop,
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const isReturnTarget = Boolean(activeDragPart) && dragSource === 'rocket';
  const activeCode = activeDragPart ? PARTS[activeDragPart]?.code : null;

  const visibleParts = PART_ORDER.filter((key) => {
    if (activeCategory === 'all') return true;
    return PARTS[key]?.category === activeCategory;
  });

  return (
    <>
      <div className="assembly-title">
        <span>ASSEMBLY BAY</span>
        {isReturnTarget && (
          <span className={`assembly-drop-badge${isOverBay ? ' over' : ''}`}>
            {isOverBay
              ? `RELEASE TO DETACH ${activeCode}`
              : `DROP HERE TO DETACH ${activeCode}`}
          </span>
        )}
      </div>
      <div
        className="bay-category-tabs"
        role="tablist"
        aria-label="Filter parts by rocket stage or category"
      >
        {PART_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={activeCategory === cat.id}
            className={`bay-tab${activeCategory === cat.id ? ' active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div
        ref={bayRef}
        className="assembly-bottom"
        data-drop-active={isReturnTarget ? 'true' : undefined}
        data-drop-over={isReturnTarget && isOverBay ? 'true' : undefined}
        onDragOver={(e) => onNativeDragOver?.(e, 'bay')}
        onDrop={(e) => onNativeDrop?.(e, 'bay')}
      >
        <div
          className="slots"
          id="part-slots"
          role="group"
          aria-label="Available rocket parts"
        >
          {visibleParts.map((key) => (
            <PartCard
              key={key}
              partKey={key}
              installed={installedSet.has(key)}
              surplus={surplusSet.has(key)}
              isDragging={activeDragPart === key}
              onToggleSurplus={onToggleSurplus}
              onSlotPointerDown={onSlotPointerDown}
              onSlotClickHint={onSlotClickHint}
              onInspectStart={onInspectStart}
              onInspectMove={onInspectMove}
              onInspectEnd={onInspectEnd}
            />
          ))}
        </div>
      </div>
      <PartInspector
        partKey={activeDragPart ? null : (inspected?.partKey ?? null)}
        pointer={inspected?.pointer ?? null}
        installedSet={installedSet}
        surplusSet={surplusSet}
      />
    </>
  );
}
