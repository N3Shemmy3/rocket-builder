import { fmt } from '../utils/format';

export function PadStatus({
  launched,
  mass,
  stages = 0,
  heightM = 0,
  surplusCount,
}) {
  return (
    <div className="upper-build">
      <div className="pad-status">
        <p>
          PAD STATUS: <span id="pad-status">{launched ? 'LAUNCHED' : 'PREPPING'}</span>
        </p>
        <p>
          Wet Mass: <span id="pad-mass">{fmt(mass)}kg</span>
        </p>
        <p>
          Stages: <span id="pad-stages">{stages}</span> | Height:{' '}
          <span id="pad-height">{heightM.toFixed(1)}m</span>
        </p>
        <p>
          Reused Parts: <span id="pad-surplus">{surplusCount}</span>
        </p>
      </div>
    </div>
  );
}
