import {
  CENTER_X,
  HULL_HALF,
  HULL_WIDTH,
  RocketPartGraphic,
} from './RocketSvg';

const STANDARD_VIEWBOX = '76 4 108 92';
const WIDE_VIEWBOX = '64 4 132 92';
const RADIAL_VIEWBOX = '46 4 168 92';

const MINI_PREVIEWS = {
  capsule: {
    viewBox: STANDARD_VIEWBOX,
    rect: { x: CENTER_X - HULL_HALF, y: 16, width: HULL_WIDTH, height: 68 },
  },
  capsule_science: {
    viewBox: STANDARD_VIEWBOX,
    rect: { x: CENTER_X - HULL_HALF, y: 16, width: HULL_WIDTH, height: 68 },
  },
  capsule_crew: {
    viewBox: STANDARD_VIEWBOX,
    rect: { x: CENTER_X - HULL_HALF, y: 14, width: HULL_WIDTH, height: 72 },
  },
  capsule_heavy: {
    viewBox: STANDARD_VIEWBOX,
    rect: { x: CENTER_X - HULL_HALF, y: 12, width: HULL_WIDTH, height: 76 },
  },
  upper_tank_liquid: {
    viewBox: STANDARD_VIEWBOX,
    rect: { x: CENTER_X - HULL_HALF, y: 18, width: HULL_WIDTH, height: 64 },
  },
  upper_engine_liquid: {
    viewBox: STANDARD_VIEWBOX,
    rect: { x: CENTER_X - HULL_HALF, y: 20, width: HULL_WIDTH, height: 58 },
  },
  upper_solid_kick: {
    viewBox: STANDARD_VIEWBOX,
    rect: { x: CENTER_X - HULL_HALF, y: 18, width: HULL_WIDTH, height: 64 },
  },
  tank: {
    viewBox: STANDARD_VIEWBOX,
    rect: { x: CENTER_X - HULL_HALF, y: 14, width: HULL_WIDTH, height: 72 },
  },
  tank_cryo_heavy: {
    viewBox: STANDARD_VIEWBOX,
    rect: { x: CENTER_X - HULL_HALF, y: 10, width: HULL_WIDTH, height: 80 },
  },
  tank_finned: {
    viewBox: WIDE_VIEWBOX,
    rect: { x: CENTER_X - HULL_HALF, y: 12, width: HULL_WIDTH, height: 76 },
  },
  tank_solid_core: {
    viewBox: STANDARD_VIEWBOX,
    rect: { x: CENTER_X - HULL_HALF, y: 15, width: HULL_WIDTH, height: 70 },
  },
  engine: {
    viewBox: WIDE_VIEWBOX,
    rect: { x: CENTER_X - 58, y: 18, width: 116, height: 62 },
  },
  engine_heavy_liquid: {
    viewBox: WIDE_VIEWBOX,
    rect: { x: CENTER_X - 58, y: 16, width: 116, height: 66 },
  },
  engine_solid: {
    viewBox: WIDE_VIEWBOX,
    rect: { x: CENTER_X - 58, y: 20, width: 116, height: 56 },
  },
  booster_solid: {
    viewBox: RADIAL_VIEWBOX,
    placement: {
      boosterTop: 15,
      boosterBottom: 86,
      upperStrutY: 44,
      lowerStrutY: 68,
    },
    options: {
      leftX: CENTER_X - 58,
      rightX: CENTER_X + 30,
      coreHalf: 16,
      standalone: true,
    },
  },
  booster_liquid: {
    viewBox: RADIAL_VIEWBOX,
    placement: {
      boosterTop: 10,
      boosterBottom: 90,
      upperStrutY: 42,
      lowerStrutY: 70,
    },
    options: {
      leftX: CENTER_X - 58,
      rightX: CENTER_X + 30,
      coreHalf: 16,
      standalone: true,
    },
  },
  avionics: {
    viewBox: STANDARD_VIEWBOX,
    rect: { x: CENTER_X - HULL_HALF, y: 28, width: HULL_WIDTH, height: 44 },
  },
  stabilizer: {
    viewBox: RADIAL_VIEWBOX,
    placement: {
      finBottom: 82,
      finH: 56,
      finRootHalf: 22,
      finTipHalf: 62,
    },
    options: {
      standalone: true,
    },
  },
  fairing: {
    viewBox: WIDE_VIEWBOX,
    rect: { x: CENTER_X - 48, y: 12, width: 96, height: 76 },
    options: {
      standalone: true,
    },
  },
};

export function PartMiniSvg({ partKey }) {
  const config = MINI_PREVIEWS[partKey];
  if (!config) return null;

  return (
    <svg viewBox={config.viewBox} aria-hidden="true">
      <g stroke="#f6f2ff" strokeWidth="2.2" strokeLinejoin="round">
        <RocketPartGraphic
          partKey={partKey}
          rect={config.rect}
          placement={config.placement}
          isBlueprint
          strokeMain="#f6f2ff"
          strokeAccent="#00f4d6"
          options={config.options}
        />
      </g>
    </svg>
  );
}
