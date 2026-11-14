import { AssemblyBay } from './AssemblyBay';
import { FlightScene } from './FlightScene';
import { PadStatus } from './PadStatus';

export function BuildColumn({
  launched,
  stats,
  flight,
  installedSet,
  surplusSet,
  onToggleInstall,
  onToggleSurplus,
}) {
  return (
    <section className="build-column" aria-label="Rocket assembly">
      <PadStatus
        launched={launched}
        mass={stats.mass}
        surplusCount={surplusSet.size}
      />
      <FlightScene flight={flight} installed={installedSet} />
      <AssemblyBay
        installedSet={installedSet}
        surplusSet={surplusSet}
        onToggleInstall={onToggleInstall}
        onToggleSurplus={onToggleSurplus}
      />
    </section>
  );
}
