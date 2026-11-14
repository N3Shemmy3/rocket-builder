import { useCallback, useState } from 'react';
import { PART_ORDER } from '../data/parts';
import { PartCard } from './PartCard';
import { PartInspector } from './PartInspector';

export function AssemblyBay({
  installedSet,
  surplusSet,
  onToggleInstall,
  onToggleSurplus,
}) {
  const [inspected, setInspected] = useState(null);

  const handleInspectStart = useCallback((partKey, x, y) => {
    setInspected({ partKey, pointer: { x, y } });
  }, []);

  const handleInspectMove = useCallback((partKey, x, y) => {
    setInspected({ partKey, pointer: { x, y } });
  }, []);

  const handleInspectEnd = useCallback(() => {
    setInspected(null);
  }, []);

  return (
    <>
      <div className="assembly-title">ASSEMBLY BAY</div>
      <div className="assembly-bottom">
        <div
          className="slots"
          id="part-slots"
          role="group"
          aria-label="Available rocket parts"
        >
          {PART_ORDER.map((key) => (
            <PartCard
              key={key}
              partKey={key}
              installed={installedSet.has(key)}
              surplus={surplusSet.has(key)}
              onToggleInstall={onToggleInstall}
              onToggleSurplus={onToggleSurplus}
              onInspectStart={handleInspectStart}
              onInspectMove={handleInspectMove}
              onInspectEnd={handleInspectEnd}
            />
          ))}
        </div>
      </div>
      <PartInspector
        partKey={inspected?.partKey ?? null}
        pointer={inspected?.pointer ?? null}
        installedSet={installedSet}
        surplusSet={surplusSet}
      />
    </>
  );
}
