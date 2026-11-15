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
  isCollapsed = false,
  onToggleCollapse,
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
    <section
      className={`assembly-bay-drawer${isCollapsed ? ' is-collapsed' : ' is-open'}`}
      aria-label="Assembly Bay"
    >
      <div className="assembly-title">
        <button
          type="button"
          className="assembly-title-btn"
          aria-expanded={!isCollapsed}
          aria-controls="assembly-bay-body"
          onClick={onToggleCollapse}
        >
          <span className="panel-chevron" aria-hidden="true" />
          <span className="assembly-title-text">ASSEMBLY BAY</span>
          <span className="assembly-count-pill">
            {installedSet.size}/{PART_ORDER.length} MOUNTED
          </span>
        </button>
        {isReturnTarget && (
          <span className={`assembly-drop-badge${isOverBay ? ' over' : ''}`}>
            {isOverBay
              ? `RELEASE TO DETACH ${activeCode}`
              : `DROP HERE TO DETACH ${activeCode}`}
          </span>
        )}
      </div>

      <div
        id="assembly-bay-body"
        className="assembly-drawer-grid"
        aria-hidden={isCollapsed}
        inert={isCollapsed ? true : undefined}
      >
        <div className="assembly-drawer-inner">
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
        </div>
      </div>

      <PartInspector
        partKey={activeDragPart ? null : (inspected?.partKey ?? null)}
        pointer={inspected?.pointer ?? null}
        installedSet={installedSet}
        surplusSet={surplusSet}
      />
    </section>
  );
}
