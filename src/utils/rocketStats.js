import { getInstalledPartsByGroup, PARTS } from '../data/parts.js';

const BASE_STRUCTURAL_MASS = 6500;
const STAGE_STRUCTURAL_MASS = 2200;
const BASE_MOUNT_HEIGHT_M = 2.5;
const BASE_MOUNT_HEIGHT_PX = 24;
const SURPLUS_COST_MULTIPLIER = 0.55;
const SURPLUS_PREP_MULTIPLIER = 0.5;
const GRAVITY = 9.81;
const MIN_TWR = 1.2;

export function canReusePart(key) {
  return Boolean(PARTS[key]?.reusable);
}

export function isPartReused(key, surplusSet) {
  return Boolean(surplusSet?.has(key)) && canReusePart(key);
}

export function getPartCost(key, surplusSet) {
  const part = PARTS[key];
  if (!part) return 0;
  return part.cost * (isPartReused(key, surplusSet) ? SURPLUS_COST_MULTIPLIER : 1);
}

export function getPartPrep(key, surplusSet) {
  const part = PARTS[key];
  if (!part) return 0;
  return part.prep * (isPartReused(key, surplusSet) ? SURPLUS_PREP_MULTIPLIER : 1);
}

export function computeRocketStats(installedSet, surplusSet) {
  const installedKeys = [...installedSet].filter((key) => Boolean(PARTS[key]));
  const byGroup = getInstalledPartsByGroup(installedSet);

  const payload = byGroup.payload?.part ?? null;
  const coreTank = byGroup.coreTank?.part ?? null;
  const coreEngine = byGroup.coreEngine?.part ?? null;
  const upperTank = byGroup.upperTank?.part ?? null;
  const upperEngine = byGroup.upperEngine?.part ?? null;
  const upperSolid = byGroup.upperSolid?.part ?? null;
  const booster = byGroup.booster?.part ?? null;
  const avionics = byGroup.avionics?.part ?? null;
  const stabilizer = byGroup.stabilizer?.part ?? null;
  const fairing = byGroup.fairing?.part ?? null;

  const hasCoreFuelMismatch = Boolean(
    coreTank && coreEngine && coreTank.fuelType !== coreEngine.fuelType
  );
  const hasCoreStage = Boolean(coreTank && coreEngine);
  const hasUpperStage = Boolean(upperSolid || (upperTank && upperEngine));
  const hasBoosterStage = Boolean(booster && hasCoreStage);
  const stages =
    (hasCoreStage ? 1 : 0) + (hasUpperStage ? 1 : 0) + (hasBoosterStage ? 1 : 0);

  const structuralMass =
    installedKeys.length > 0
      ? BASE_STRUCTURAL_MASS + stages * STAGE_STRUCTURAL_MASS
      : 0;

  let partMass = 0;
  let propellantMass = 0;
  let cost = 0;
  let prep = 0;
  let reusedCount = 0;
  let solidCount = 0;

  for (const key of installedKeys) {
    const part = PARTS[key];
    const reused = isPartReused(key, surplusSet);
    partMass += part.mass;
    propellantMass += part.propellantMass || 0;
    cost += getPartCost(key, surplusSet);
    prep += getPartPrep(key, surplusSet);
    if (reused) reusedCount += 1;
    if (part.fuelType === 'solid') solidCount += 1;
  }

  const mass = partMass + structuralMass;

  const payloadMass = payload ? payload.mass : 1200;
  const payloadDvModifier = Math.round((1200 - payloadMass) * 0.45);

  let deltaV = 0;
  if (hasCoreStage && !hasCoreFuelMismatch) {
    deltaV += coreTank.dv + coreEngine.dv + payloadDvModifier;
  } else if (coreEngine && !coreTank) {
    deltaV += coreEngine.dv;
  }

  if (hasCoreStage && !hasCoreFuelMismatch) {
    if (upperSolid) {
      deltaV += upperSolid.dv;
    } else if (upperTank && upperEngine) {
      deltaV += upperTank.dv + upperEngine.dv;
    }
    if (booster) {
      deltaV += booster.dv;
    }
  }

  if (fairing && payload) {
    deltaV += fairing.dv;
  }
  deltaV = Math.max(0, deltaV);

  const thrust =
    (coreEngine ? coreEngine.thrust : 0) +
    (booster && coreEngine ? booster.thrust : 0);
  const twr = thrust > 0 && mass > 0 ? Math.max(0.1, thrust / (mass * GRAVITY)) : 0;

  // Thrust-weighted vacuum Isp across active propulsion units for telemetry/Codex display
  const activeEngines = [
    coreEngine,
    hasCoreStage ? upperEngine : null,
    hasCoreStage ? upperSolid : null,
    hasCoreStage ? booster : null,
  ].filter((unit) => unit && unit.thrust > 0 && unit.ispNumeric > 0);
  const totalEngineThrust = activeEngines.reduce((acc, u) => acc + u.thrust, 0);
  const effectiveIsp =
    totalEngineThrust > 0
      ? Math.round(
          activeEngines.reduce((acc, u) => acc + u.ispNumeric * u.thrust, 0) /
            totalEngineThrust
        )
      : 0;

  const verticalParts = [
    fairing,
    payload,
    avionics,
    upperTank,
    upperEngine,
    upperSolid,
    coreTank,
    coreEngine,
  ].filter(Boolean);

  const coreStackHeightPx =
    (coreTank?.heightPx ?? 0) + (coreEngine?.heightPx ?? 0);
  const boosterOverhangPx =
    booster && booster.heightPx > coreStackHeightPx
      ? booster.heightPx - coreStackHeightPx
      : 0;

  const heightM =
    installedKeys.length > 0
      ? Number(
          (
            BASE_MOUNT_HEIGHT_M +
            verticalParts.reduce((acc, part) => acc + (part.heightM || 0), 0)
          ).toFixed(1)
        )
      : 0;

  const heightPx =
    installedKeys.length > 0
      ? BASE_MOUNT_HEIGHT_PX +
        verticalParts.reduce((acc, part) => acc + (part.heightPx || 0), 0) +
        boosterOverhangPx
      : 0;

  const reliability = Math.min(
    99,
    Math.max(
      65,
      92 +
        (avionics ? 4 : 0) +
        (stabilizer ? 3 : 0) +
        (installedSet.has('tank_finned') ? 2 : 0) -
        reusedCount * 3 -
        solidCount * 2
    )
  );

  return {
    mass,
    propellantMass,
    cost,
    prep,
    deltaV,
    thrust,
    twr,
    effectiveIsp,
    reliability,
    stages,
    heightM,
    heightPx,
    cargo: payload?.cargo ?? 0,
    seats: payload?.seats ?? 0,
    reusedCount,
    solidCount,
    hasCoreFuelMismatch,
  };
}

export function validateLaunch(installedSet, stats, mission) {
  const issues = [];
  const byGroup = getInstalledPartsByGroup(installedSet);
  const payload = byGroup.payload?.part ?? null;
  const coreTank = byGroup.coreTank?.part ?? null;
  const coreEngine = byGroup.coreEngine?.part ?? null;
  const upperTank = byGroup.upperTank?.part ?? null;
  const upperEngine = byGroup.upperEngine?.part ?? null;
  const booster = byGroup.booster?.part ?? null;

  if (!payload) {
    issues.push('payload missing');
  } else {
    if (mission.cargo > 0 && stats.cargo < mission.cargo) {
      issues.push(`insufficient cargo capacity (${stats.cargo}/${mission.cargo}kg)`);
    }
    if ((mission.requiredSeats || 0) > 0 && stats.seats < mission.requiredSeats) {
      issues.push(`crew capsule required (${mission.requiredSeats} seats)`);
    }
  }

  if (!coreTank || !coreEngine) {
    issues.push('core propulsion incomplete');
  } else if (coreTank.fuelType !== coreEngine.fuelType) {
    issues.push('core tank/engine fuel mismatch');
  }

  if ((upperTank && !upperEngine) || (!upperTank && upperEngine)) {
    issues.push('upper stage incomplete');
  }

  if (booster && (!coreTank || !coreEngine)) {
    issues.push('boosters require core stage');
  }

  if (stats.cost > mission.budget) issues.push('budget exceeded');
  if (stats.prep > mission.deadline) issues.push('prep deadline exceeded');
  if (stats.twr < MIN_TWR) issues.push('insufficient thrust (TWR < 1.20)');
  if (stats.deltaV < mission.deltaV) issues.push('insufficient delta-V');

  return issues;
}

const MISSION_AUTOFIT_BUILDS = {
  'OP-01': {
    installed: ['capsule', 'tank', 'engine', 'avionics', 'stabilizer', 'fairing'],
    reusable: ['capsule', 'tank', 'engine'],
  },
  'OP-02': {
    installed: [
      'capsule_science',
      'upper_solid_kick',
      'tank',
      'engine',
      'booster_solid',
      'avionics',
      'stabilizer',
      'fairing',
    ],
    reusable: ['capsule_science', 'tank', 'engine'],
  },
  'OP-03': {
    installed: [
      'capsule_science',
      'tank',
      'engine',
      'avionics',
      'stabilizer',
      'fairing',
    ],
    reusable: ['capsule_science', 'tank', 'engine'],
  },
  'OP-04': {
    installed: [
      'capsule_crew',
      'tank',
      'engine',
      'booster_solid',
      'avionics',
      'stabilizer',
      'fairing',
    ],
    reusable: ['capsule_crew', 'tank', 'engine'],
  },
  'OP-05': {
    installed: [
      'capsule_heavy',
      'upper_solid_kick',
      'tank_cryo_heavy',
      'engine_heavy_liquid',
      'booster_solid',
      'avionics',
      'stabilizer',
      'fairing',
    ],
    reusable: ['capsule_heavy', 'tank_cryo_heavy', 'engine_heavy_liquid'],
  },
};

export function getAutoFitBuild(mission) {
  const preset = MISSION_AUTOFIT_BUILDS[mission?.id] ?? MISSION_AUTOFIT_BUILDS['OP-01'];
  return {
    installed: new Set(preset.installed),
    surplus: new Set(preset.reusable.filter((key) => canReusePart(key))),
  };
}
