import { useLayoutEffect, useRef, useState } from 'react';
import { PARTS } from '../data/parts';
import { fmt, money } from '../utils/format';
import { getPartCost, getPartPrep, isPartReused } from '../utils/rocketStats';

const TOOLTIP_PADDING = 12;

function getFuelLabel(part) {
  if (part.fuelType === 'liquid') return 'LIQUID (REUSABLE)';
  if (part.fuelType === 'solid') return 'SOLID (EXPENDABLE)';
  if (part.fuelType === 'capsule') return 'CAPSULE (REUSABLE)';
  return 'STANDARD HARDWARE';
}

function getProcurementModeLabel(part, reused) {
  if (!part.reusable) {
    return part.fuelType === 'solid'
      ? 'EXPENDABLE (Single-Use Solid)'
      : 'STANDARD HARDWARE';
  }
  return reused
    ? 'REUSED / REFURBISHED (-45% Cost, -50% Prep)'
    : 'FACTORY NEW (Reusable Eligible)';
}

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
  const reused = partKey ? isPartReused(partKey, surplusSet) : false;

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
          <div className="inspector-heading">
            {part.stageRole} // {part.type}
          </div>
          <div className="inspector-inner">
            <h3>{part.name}</h3>
            <p>
              Part ID: {part.code}
              <br />
              Fuel / Class: {getFuelLabel(part)}
              <br />
              Cost: {money(getPartCost(partKey, surplusSet))}
              <br />
              Prep: {getPartPrep(partKey, surplusSet)}d
              <br />
              Mass: {fmt(part.mass)}kg
              {part.propellantMass > 0
                ? ` (${fmt(part.dryMass)}kg dry)`
                : ''}
              <br />
              Delta-V Bonus: {part.dv > 0 ? `+${fmt(part.dv)} m/s` : '0 m/s'}
              <br />
              Thrust: {part.thrust > 0 ? `${fmt(part.thrust / 1000)} kN` : 'N/A'}
              <br />
              Height: {part.heightM > 0 ? `${part.heightM.toFixed(1)}m` : 'Radial / Attachment'}
              <br />
              {part.seats > 0 && (
                <>
                  Crew Seats: {part.seats}
                  <br />
                </>
              )}
              {part.cargo > 0 && (
                <>
                  Cargo: {fmt(part.cargo)}kg
                  <br />
                </>
              )}
              Status: {installed ? 'MOUNTED ON PAD' : 'AVAILABLE'}
              <br />
              Mode: {getProcurementModeLabel(part, reused)}
              <br />
              NASA Ref: {part.nasaAnalog}
              <br />
              System: {part.propellant}
            </p>
            <p className="inspector-help">
              Drag {part.code} onto the launch pad to mount or swap into its
              stage slot, or drag off the rocket to the Assembly Bay to remove.
              {part.reusable
                ? ' Use NEW / REUSED to refurbish liquid/capsule hardware.'
                : ''}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
