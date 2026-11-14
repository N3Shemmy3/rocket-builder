import { useLayoutEffect, useRef, useState } from 'react';
import { PARTS } from '../data/parts';
import { fmt, money } from '../utils/format';
import { getPartCost, getPartPrep } from '../utils/rocketStats';

const TOOLTIP_PADDING = 12;

export function PartInspector({
  partKey,
  pointer,
  installedSet,
  surplusSet,
}) {
  const inspectorRef = useRef(null);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const visible = Boolean(partKey);

  useLayoutEffect(() => {
    if (!visible || !inspectorRef.current) return;
    const w = inspectorRef.current.offsetWidth;
    const h = inspectorRef.current.offsetHeight;
    const px = pointer?.x ?? 0;
    const py = pointer?.y ?? 0;
    const left = Math.min(
      Math.max(TOOLTIP_PADDING, px + 18),
      Math.max(TOOLTIP_PADDING, window.innerWidth - w - TOOLTIP_PADDING)
    );
    const top = Math.min(
      Math.max(TOOLTIP_PADDING, py + 12),
      Math.max(TOOLTIP_PADDING, window.innerHeight - h - TOOLTIP_PADDING)
    );
    setPosition({ left, top });
  }, [visible, partKey, pointer]);

  const part = partKey ? PARTS[partKey] : null;
  const installed = partKey ? installedSet.has(partKey) : false;
  const surplus = partKey ? surplusSet.has(partKey) : false;

  return (
    <div
      ref={inspectorRef}
      className={`part-inspector${visible ? ' visible' : ''}`}
      id="part-inspector"
      role="tooltip"
      aria-hidden={!visible}
      style={
        visible
          ? { left: `${position.left}px`, top: `${position.top}px` }
          : undefined
      }
    >
      {part && (
        <>
          <div className="inspector-heading">{part.type}</div>
          <div className="inspector-inner">
            <h3>{part.name}</h3>
            <p>
              Part ID: {part.code}
              <br />
              Cost: {money(getPartCost(partKey, surplusSet))}
              <br />
              Prep: {getPartPrep(partKey, surplusSet)}d
              <br />
              Mass: {fmt(part.mass)}kg
              <br />
              Seats: {part.seats}
              <br />
              Cargo: {fmt(part.cargo)}kg
              <br />
              Status: {installed ? 'INSTALLED' : 'AVAILABLE'}
              <br />
              Mode: {surplus ? 'SURPLUS' : 'FACTORY NEW'}
            </p>
            <p className="inspector-help">
              Click the part to {installed ? 'remove' : 'install'} it. Use
              NEW/SURPLUS to change procurement mode.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
