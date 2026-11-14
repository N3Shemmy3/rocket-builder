import { PARTS } from '../data/parts';

const BASE_STRUCTURAL_MASS = 13050;
const SURPLUS_COST_MULTIPLIER = 0.55;
const SURPLUS_PREP_MULTIPLIER = 0.5;
const GRAVITY = 9.81;
const MIN_TWR = 1.2;

export function getPartCost(key, surplusSet) {
  return PARTS[key].cost * (surplusSet.has(key) ? SURPLUS_COST_MULTIPLIER : 1);
}

export function getPartPrep(key, surplusSet) {
  return PARTS[key].prep * (surplusSet.has(key) ? SURPLUS_PREP_MULTIPLIER : 1);
}

export function computeRocketStats(installedSet, surplusSet) {
  const installedKeys = [...installedSet];
  const mass =
    installedKeys.reduce((acc, key) => acc + PARTS[key].mass, 0) +
    BASE_STRUCTURAL_MASS;
  const cost = installedKeys.reduce(
    (acc, key) => acc + getPartCost(key, surplusSet),
    0
  );
  const prep = installedKeys.reduce(
    (acc, key) => acc + getPartPrep(key, surplusSet),
    0
  );
  const hasEngine = installedSet.has('engine');
  const hasTank = installedSet.has('tank');
  const deltaV = hasEngine && hasTank ? 9600 : hasEngine ? 2800 : 0;
  const twr = hasEngine ? Math.max(0.1, 540000 / (mass * GRAVITY)) : 0;
  const reliability = Math.max(70, 96 - surplusSet.size * 3);

  return { mass, cost, prep, deltaV, twr, reliability };
}

export function validateLaunch(installedSet, stats, mission) {
  const issues = [];
  if (!installedSet.has('capsule')) issues.push('payload missing');
  if (!installedSet.has('engine') || !installedSet.has('tank')) {
    issues.push('propulsion incomplete');
  }
  if (stats.cost > mission.budget) issues.push('budget exceeded');
  if (stats.prep > mission.deadline) issues.push('prep deadline exceeded');
  if (stats.twr < MIN_TWR) issues.push('insufficient thrust');
  if (stats.deltaV < mission.deltaV) issues.push('insufficient delta-V');
  return issues;
}
