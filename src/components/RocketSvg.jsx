import { installPartInSet, PARTS } from '../data/parts';

export const SVG_WIDTH = 260;
export const SVG_HEIGHT = 476;
export const CENTER_X = 130;
export const PAD_BASE_Y = 456;
export const HULL_HALF = 36;
export const HULL_WIDTH = HULL_HALF * 2;

function resolveStackParts(installedSet) {
  const byGroup = {};
  for (const key of installedSet) {
    const part = PARTS[key];
    if (part && !byGroup[part.slotGroup]) {
      byGroup[part.slotGroup] = { key, part };
    }
  }
  return byGroup;
}

function computeStackLayout(installedSet) {
  const byGroup = resolveStackParts(installedSet);
  const placements = {};
  let curY = PAD_BASE_Y;

  if (byGroup.coreEngine) {
    const { key, part } = byGroup.coreEngine;
    const h = part.heightPx;
    placements[key] = {
      key,
      part,
      rect: { x: CENTER_X - 58, y: curY - h, width: 116, height: h },
    };
    curY -= h;
  }

  const coreTankBottom = curY;
  let coreTankTop = curY;

  if (byGroup.coreTank) {
    const { key, part } = byGroup.coreTank;
    const h = part.heightPx;
    coreTankTop = curY - h;
    placements[key] = {
      key,
      part,
      rect: { x: CENTER_X - HULL_HALF, y: coreTankTop, width: HULL_WIDTH, height: h },
    };
    curY -= h;
  }

  if (byGroup.booster) {
    const { key, part } = byGroup.booster;
    const h = part.heightPx;
    const boosterBottom = PAD_BASE_Y - 2;
    const boosterTop = boosterBottom - h;
    const bodyTop = boosterTop + 22;
    const bodyBottom = boosterBottom - 12;
    const upperStrutY = byGroup.coreTank
      ? Math.min(bodyBottom - 24, Math.max(bodyTop + 10, coreTankTop + 14))
      : bodyTop + 14;
    const lowerStrutY = byGroup.coreTank
      ? Math.max(upperStrutY + 16, Math.min(bodyBottom - 12, coreTankBottom - 10))
      : bodyBottom - 16;

    placements[key] = {
      key,
      part,
      rect: { x: CENTER_X - 96, y: boosterTop, width: 192, height: h },
      boosterBottom,
      boosterTop,
      upperStrutY,
      lowerStrutY,
    };
  }

  if (byGroup.stabilizer) {
    const { key, part } = byGroup.stabilizer;
    const boosterPlacement = byGroup.booster
      ? placements[byGroup.booster.key]
      : null;

    if (boosterPlacement) {
      const finBottom = boosterPlacement.boosterBottom - 12;
      const finH = 56;
      const finRootHalf = 88;
      const finTipHalf = 114;
      placements[key] = {
        key,
        part,
        rect: {
          x: CENTER_X - 116,
          y: finBottom - finH,
          width: 232,
          height: finH,
        },
        finBottom,
        finH,
        finRootHalf,
        finTipHalf,
      };
    } else {
      const finBottom = byGroup.coreTank ? coreTankBottom : PAD_BASE_Y;
      const finH = 60;
      const finRootHalf = HULL_HALF;
      const finTipHalf = 74;
      placements[key] = {
        key,
        part,
        rect: {
          x: CENTER_X - 78,
          y: finBottom - finH,
          width: 156,
          height: finH,
        },
        finBottom,
        finH,
        finRootHalf,
        finTipHalf,
      };
    }
  }

  if (byGroup.upperSolid) {
    const { key, part } = byGroup.upperSolid;
    const h = part.heightPx;
    placements[key] = {
      key,
      part,
      rect: { x: CENTER_X - HULL_HALF, y: curY - h, width: HULL_WIDTH, height: h },
    };
    curY -= h;
  } else {
    if (byGroup.upperEngine) {
      const { key, part } = byGroup.upperEngine;
      const h = part.heightPx;
      placements[key] = {
        key,
        part,
        rect: { x: CENTER_X - HULL_HALF, y: curY - h, width: HULL_WIDTH, height: h },
      };
      curY -= h;
    }
    if (byGroup.upperTank) {
      const { key, part } = byGroup.upperTank;
      const h = part.heightPx;
      placements[key] = {
        key,
        part,
        rect: { x: CENTER_X - HULL_HALF, y: curY - h, width: HULL_WIDTH, height: h },
      };
      curY -= h;
    }
  }

  if (byGroup.avionics) {
    const { key, part } = byGroup.avionics;
    const h = part.heightPx;
    placements[key] = {
      key,
      part,
      rect: { x: CENTER_X - HULL_HALF, y: curY - h, width: HULL_WIDTH, height: h },
    };
    curY -= h;
  }

  let payloadRect = null;
  if (byGroup.payload) {
    const { key, part } = byGroup.payload;
    const h = part.heightPx;
    payloadRect = { x: CENTER_X - HULL_HALF, y: curY - h, width: HULL_WIDTH, height: h };
    placements[key] = {
      key,
      part,
      rect: payloadRect,
    };
    curY -= h;
  }

  if (byGroup.fairing) {
    const { key, part } = byGroup.fairing;
    if (payloadRect) {
      const top = payloadRect.y - part.heightPx;
      const bottom = payloadRect.y + payloadRect.height;
      placements[key] = {
        key,
        part,
        rect: {
          x: CENTER_X - 48,
          y: top,
          width: 96,
          height: bottom - top,
        },
        hasPayload: true,
      };
      curY = Math.min(curY, top);
    } else {
      const h = 76;
      placements[key] = {
        key,
        part,
        rect: { x: CENTER_X - 48, y: curY - h, width: 96, height: h },
        hasPayload: false,
      };
      curY -= h;
    }
  }

  const topY = Object.values(placements).reduce(
    (minY, item) => Math.min(minY, item.rect.y),
    PAD_BASE_Y - 12
  );

  return { placements, topY, hasParts: Object.keys(placements).length > 0 };
}

function RocketPartGroup({
  partKey,
  rect,
  interactive,
  isDragTarget,
  isOverTargetSlot,
  dragSource,
  isHovered,
  onPartPointerDown,
  onPartPointerEnter,
  onPartPointerMove,
  onPartPointerLeave,
  hitArea,
  children,
}) {
  const part = PARTS[partKey];

  const classNames = [
    'rocket-part-group',
    'installed',
    interactive ? 'interactive' : '',
    isDragTarget ? 'drag-target' : '',
    isDragTarget && isOverTargetSlot ? 'drag-target-over' : '',
    isDragTarget && dragSource === 'rocket' ? 'dragging-from-rocket' : '',
    isHovered ? 'rocket-part-hovered' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <g
      data-rocket-part={partKey}
      className={classNames}
      aria-label={interactive ? `${part.name} (${part.code}) mounted` : undefined}
      onPointerDown={
        interactive ? (e) => onPartPointerDown?.(partKey, e) : undefined
      }
      onPointerEnter={
        interactive ? (e) => onPartPointerEnter?.(partKey, e) : undefined
      }
      onPointerMove={
        interactive ? (e) => onPartPointerMove?.(partKey, e) : undefined
      }
      onPointerLeave={
        interactive ? (e) => onPartPointerLeave?.(partKey, e) : undefined
      }
    >
      {children}
      <rect
        data-slot-bounds={partKey}
        x={rect.x}
        y={rect.y}
        width={rect.width}
        height={rect.height}
        fill="none"
        stroke="none"
        pointerEvents="none"
      />
      {interactive && hitArea}
      {isDragTarget && dragSource === 'rocket' && (
        <rect
          className="rocket-drop-reticle"
          x={rect.x - 3}
          y={rect.y - 3}
          width={rect.width + 6}
          height={rect.height + 6}
          rx="4"
          fill="#ffae70"
          fillOpacity={0.1}
          stroke="#ffae70"
          strokeWidth="2"
          strokeDasharray="6 4"
          pointerEvents="none"
        />
      )}
    </g>
  );
}

export function RocketGradientDefs() {
  return (
    <defs>
      <linearGradient id="rocket-metal" x1="0" x2="1">
        <stop stopColor="#474050" />
        <stop offset=".35" stopColor="#d2c9d2" />
        <stop offset=".65" stopColor="#716674" />
        <stop offset="1" stopColor="#28212f" />
      </linearGradient>
      <linearGradient id="capsule-metal" x1="0" x2="1">
        <stop stopColor="#655970" />
        <stop offset=".4" stopColor="#dcd2e2" />
        <stop offset="1" stopColor="#3c3245" />
      </linearGradient>
      <linearGradient id="skirt-metal" x1="0" x2="1">
        <stop stopColor="#4c7371" />
        <stop offset=".4" stopColor="#9cd0c9" />
        <stop offset="1" stopColor="#2b4546" />
      </linearGradient>
      <linearGradient id="solid-metal" x1="0" x2="1">
        <stop stopColor="#5e3d2f" />
        <stop offset=".4" stopColor="#c7a08d" />
        <stop offset="1" stopColor="#382219" />
      </linearGradient>
      <linearGradient id="exhaust-flame" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fff6c0" />
        <stop offset="45%" stopColor="#f5a061" />
        <stop offset="100%" stopColor="#f5a061" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="exhaust-core" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="60%" stopColor="#fff6c0" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#fff6c0" stopOpacity="0" />
      </linearGradient>
    </defs>
  );
}

function renderExhaustPlume(id, cx, topY, halfW, length) {
  const midY = topY + length * 0.35;
  const tipY = topY + length;
  const innerMidY = topY + length * 0.25;
  const innerTipY = topY + length * 0.62;
  return (
    <g
      key={id}
      className="svg-launch-flame"
      style={{ transformOrigin: `${cx}px ${topY}px` }}
    >
      <polygon
        points={`${cx - halfW * 0.65},${topY} ${cx + halfW * 0.65},${topY} ${cx + halfW},${midY} ${cx},${tipY} ${cx - halfW},${midY}`}
        fill="url(#exhaust-flame)"
      />
      <polygon
        points={`${cx - halfW * 0.32},${topY} ${cx + halfW * 0.32},${topY} ${cx + halfW * 0.45},${innerMidY} ${cx},${innerTipY} ${cx - halfW * 0.45},${innerMidY}`}
        fill="url(#exhaust-core)"
      />
    </g>
  );
}

function renderLaunchFlames(coreEngineEntry, boosterEntry) {
  const plumes = [];

  if (coreEngineEntry) {
    const { key, rect } = coreEngineEntry;
    const bellBottom = rect.y + rect.height;
    if (key === 'engine_heavy_liquid') {
      plumes.push(
        renderExhaustPlume('core-left', CENTER_X - 37, bellBottom - 4, 10, 66),
        renderExhaustPlume('core-center', CENTER_X, bellBottom, 16, 86),
        renderExhaustPlume('core-right', CENTER_X + 37, bellBottom - 4, 10, 66)
      );
    } else if (key === 'engine_solid') {
      plumes.push(
        renderExhaustPlume('core-solid', CENTER_X, bellBottom, 24, 92)
      );
    } else {
      plumes.push(
        renderExhaustPlume('core-liquid', CENTER_X, bellBottom, 18, 84)
      );
    }
  }

  if (boosterEntry) {
    const { boosterBottom } = boosterEntry;
    plumes.push(
      renderExhaustPlume('booster-left', CENTER_X - 74, boosterBottom, 10, 72),
      renderExhaustPlume('booster-right', CENTER_X + 74, boosterBottom, 10, 72)
    );
  }

  if (plumes.length === 0) return null;
  return (
    <g stroke="none" aria-hidden="true">
      {plumes}
    </g>
  );
}

function renderCoreEngine(key, rect, isBlueprint, strokeMain, strokeAccent) {
  const { y, height } = rect;
  const code = PARTS[key].code;

  if (key === 'engine_heavy_liquid') {
    const skirtH = 26;
    const bellTop = y + skirtH;
    const bellBottom = y + height;
    return (
      <>
        <path
          d={`M${CENTER_X - HULL_HALF} ${y} L${CENTER_X - 54} ${bellTop} H${CENTER_X + 54} L${CENTER_X + HULL_HALF} ${y} Z`}
          fill={isBlueprint ? '#09020a' : 'url(#skirt-metal)'}
        />
        <path
          d={`M${CENTER_X - 42} ${bellTop} L${CENTER_X - 50} ${bellBottom - 4} H${CENTER_X - 24} L${CENTER_X - 28} ${bellTop} Z`}
          fill={isBlueprint ? '#140f1b' : '#c48663'}
        />
        <path
          d={`M${CENTER_X - 14} ${bellTop} L${CENTER_X - 22} ${bellBottom} H${CENTER_X + 22} L${CENTER_X + 14} ${bellTop} Z`}
          fill={isBlueprint ? '#140f1b' : '#c48663'}
        />
        <path
          d={`M${CENTER_X + 28} ${bellTop} L${CENTER_X + 24} ${bellBottom - 4} H${CENTER_X + 50} L${CENTER_X + 42} ${bellTop} Z`}
          fill={isBlueprint ? '#140f1b' : '#c48663'}
        />
        <path
          d={`M${CENTER_X - HULL_HALF} ${y} H${CENTER_X + HULL_HALF}`}
          stroke={strokeAccent}
          strokeWidth="1.6"
          opacity="0.85"
        />
        <path
          d={`M${CENTER_X - HULL_HALF} ${y + 12} H${CENTER_X + HULL_HALF}`}
          stroke={strokeAccent}
          strokeWidth="1.4"
          opacity="0.8"
        />
        <text
          x={CENTER_X}
          y={y + 20}
          fontSize="10.5"
          fontFamily="monospace"
          textAnchor="middle"
          stroke="none"
          fill={isBlueprint ? '#00f4d6' : '#0e1d20'}
        >
          {code}
        </text>
      </>
    );
  }

  if (key === 'engine_solid') {
    const collarH = 20;
    const bellTop = y + collarH;
    const bellBottom = y + height;
    return (
      <>
        <path
          d={`M${CENTER_X - HULL_HALF} ${y} L${CENTER_X - 42} ${bellTop} H${CENTER_X + 42} L${CENTER_X + HULL_HALF} ${y} Z`}
          fill={isBlueprint ? '#160d09' : 'url(#solid-metal)'}
        />
        <path
          d={`M${CENTER_X - 26} ${bellTop} L${CENTER_X - 46} ${bellBottom} H${CENTER_X + 46} L${CENTER_X + 26} ${bellTop} Z`}
          fill={isBlueprint ? '#1a100c' : '#856556'}
        />
        <path
          d={`M${CENTER_X - HULL_HALF} ${y} H${CENTER_X + HULL_HALF}`}
          stroke="#ffae70"
          strokeWidth="1.6"
          opacity="0.85"
        />
        <path
          d={`M${CENTER_X - 34} ${bellTop + 12} H${CENTER_X + 34} M${CENTER_X - 18} ${bellTop + 4} L${CENTER_X - 28} ${bellBottom - 4} M${CENTER_X + 18} ${bellTop + 4} L${CENTER_X + 28} ${bellBottom - 4}`}
          stroke="#ffae70"
          strokeWidth="1.4"
          opacity="0.8"
        />
        <text
          x={CENTER_X}
          y={y + 14}
          fontSize="10"
          fontFamily="monospace"
          textAnchor="middle"
          stroke="none"
          fill="#ffae70"
        >
          {code}
        </text>
      </>
    );
  }

  // Default E-001 Vulcan Liquid Engine
  const skirtH = 32;
  const bellTop = y + skirtH;
  const bellBottom = y + height;
  return (
    <>
      <path
        d={`M${CENTER_X - HULL_HALF} ${y} L${CENTER_X - 56} ${bellTop} H${CENTER_X + 56} L${CENTER_X + HULL_HALF} ${y} Z`}
        fill={isBlueprint ? '#09020a' : 'url(#skirt-metal)'}
      />
      <path
        d={`M${CENTER_X - 24} ${bellTop} L${CENTER_X - 34} ${bellBottom} H${CENTER_X + 34} L${CENTER_X + 24} ${bellTop} Z`}
        fill={isBlueprint ? '#140f1b' : '#c48663'}
      />
      <path
        d={`M${CENTER_X - HULL_HALF} ${y} H${CENTER_X + HULL_HALF}`}
        stroke={strokeAccent}
        strokeWidth="1.6"
        opacity="0.85"
      />
      <path
        d={`M${CENTER_X + 32} ${y + 5} L${CENTER_X + 48} ${bellTop - 4} M${CENTER_X - 18} ${bellTop + 4} L${CENTER_X - 25} ${bellBottom - 4} M${CENTER_X + 18} ${bellTop + 4} L${CENTER_X + 25} ${bellBottom - 4}`}
        stroke={strokeAccent}
        strokeWidth="1.4"
        opacity="0.75"
      />
      <text
        x={CENTER_X}
        y={y + 21}
        fontSize="10.5"
        fontFamily="monospace"
        textAnchor="middle"
        stroke="none"
        fill={isBlueprint ? '#00f4d6' : '#0e1d20'}
      >
        {code}
      </text>
    </>
  );
}

function renderCoreTank(key, rect, isBlueprint, strokeMain) {
  const { x, y, width, height } = rect;
  const code = PARTS[key].code;
  const isSolid = key === 'tank_solid_core';
  const isHeavy = key === 'tank_cryo_heavy';
  const isFinned = key === 'tank_finned';
  const badgeColor = isSolid ? '#ffae70' : isFinned ? '#00f4d6' : '#bd73fa';
  const finTopY = y + height * 0.24;
  const finBottomY = y + height * 0.70;
  const finInnerTopY = finTopY + (finBottomY - finTopY) * 0.4;

  return (
    <>
      {isFinned && (
        <>
          <path
            d={`M${x - 2} ${finTopY} L${x - 28} ${finBottomY} H${x - 2} Z`}
            fill={isBlueprint ? '#0d0715' : '#2a2235'}
            stroke={strokeMain}
            strokeWidth="2"
          />
          <path
            d={`M${x - 5} ${finInnerTopY} L${x - 19} ${finBottomY - 5} H${x - 5} Z`}
            fill="#00f4d6"
            stroke="none"
            opacity="0.9"
          />
          <path
            d={`M${x + width + 2} ${finTopY} L${x + width + 28} ${finBottomY} H${x + width + 2} Z`}
            fill={isBlueprint ? '#0d0715' : '#2a2235'}
            stroke={strokeMain}
            strokeWidth="2"
          />
          <path
            d={`M${x + width + 5} ${finInnerTopY} L${x + width + 19} ${finBottomY - 5} H${x + width + 5} Z`}
            fill="#00f4d6"
            stroke="none"
            opacity="0.9"
          />
          <rect
            x={x - 2}
            y={(finTopY + finBottomY) / 2 - 4}
            width="2"
            height="8"
            fill={strokeMain}
            stroke="none"
          />
          <rect
            x={x + width}
            y={(finTopY + finBottomY) / 2 - 4}
            width="2"
            height="8"
            fill={strokeMain}
            stroke="none"
          />
        </>
      )}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={
          isBlueprint
            ? isSolid
              ? '#150d0c'
              : '#09020a'
            : isSolid
              ? 'url(#solid-metal)'
              : 'url(#rocket-metal)'
        }
      />
      {isSolid ? (
        <>
          <path
            d={`M${x} ${y + height * 0.28} H${x + width} M${x} ${y + height * 0.56} H${x + width} M${x} ${y + height * 0.82} H${x + width}`}
            stroke="#ffae70"
            strokeWidth="1.8"
            opacity="0.8"
          />
          <path
            d={`M${x + 10} ${y + 10} V${y + height - 10}`}
            stroke={strokeMain}
            strokeWidth="1.4"
            strokeDasharray="4 4"
            opacity="0.6"
          />
        </>
      ) : (
        <>
          <path
            d={`M${x + 7} ${y + 18} V${y + height * 0.55} M${x + 7} ${y + height * 0.62} V${y + height - 10}`}
            stroke={strokeMain}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.82"
          />
          {isHeavy && (
            <>
              <path
                d={`M${x} ${y + height * 0.33} H${x + width} M${x} ${y + height * 0.67} H${x + width}`}
                stroke="#bd73fa"
                strokeWidth="1.3"
                opacity="0.7"
              />
              {[0.18, 0.82].map((ratio) => {
                const cy = y + height * ratio;
                return (
                  <path
                    key={ratio}
                    d={`M${CENTER_X} ${cy - 7} L${CENTER_X + 8} ${cy} L${CENTER_X} ${cy + 7} L${CENTER_X - 8} ${cy} Z`}
                    fill="#bd73fa"
                    stroke="none"
                    opacity="0.65"
                  />
                );
              })}
            </>
          )}
          {isFinned && (
            <>
              <rect
                x={CENTER_X - 11}
                y={y - 1}
                width="22"
                height="2"
                fill={strokeMain}
                stroke="none"
              />
              <rect
                x={CENTER_X - 11}
                y={y + height - 1}
                width="22"
                height="2"
                fill={strokeMain}
                stroke="none"
              />
              <path
                d={`M${x} ${y + height * 0.33} H${x + width} M${x} ${y + height * 0.67} H${x + width}`}
                stroke="#00f4d6"
                strokeWidth="1.4"
                opacity="0.75"
              />
              {[0.17, 0.83].map((ratio) => {
                const cy = y + height * ratio;
                return (
                  <path
                    key={ratio}
                    d={`M${CENTER_X} ${cy - 7} L${CENTER_X + 8} ${cy} L${CENTER_X} ${cy + 7} L${CENTER_X - 8} ${cy} Z`}
                    fill="#00f4d6"
                    stroke="none"
                    opacity="0.72"
                  />
                );
              })}
            </>
          )}
        </>
      )}
      <rect
        x={CENTER_X - 24}
        y={y + height / 2 - 11}
        width="48"
        height="22"
        fill={isBlueprint ? '#1b1126' : isSolid ? '#331d12' : '#b679ed'}
        stroke={badgeColor}
        strokeWidth="1.4"
      />
      <text
        x={CENTER_X}
        y={y + height / 2 + 4}
        fontFamily="monospace"
        textAnchor="middle"
        fontSize="10.5"
        fill={isBlueprint ? badgeColor : '#100916'}
        stroke="none"
      >
        {code}
      </text>
    </>
  );
}

function renderUpperStage(key, rect, isBlueprint, strokeAccent) {
  const { x, y, width, height } = rect;
  const code = PARTS[key].code;

  if (key === 'upper_solid_kick') {
    const skirtH = 16;
    const casingH = height - skirtH;
    const skirtTop = y + casingH;
    return (
      <>
        <rect
          x={x}
          y={y}
          width={width}
          height={casingH}
          fill={isBlueprint ? '#160d09' : 'url(#solid-metal)'}
        />
        <rect
          x={x}
          y={skirtTop}
          width={width}
          height={skirtH}
          fill={isBlueprint ? '#0d0712' : '#231829'}
        />
        <path
          d={`M${x} ${y + height} L${x + 12} ${skirtTop} M${x + width} ${y + height} L${x + width - 12} ${skirtTop}`}
          stroke="#ffae70"
          strokeWidth="1.2"
          opacity="0.7"
        />
        <path
          d={`M${CENTER_X - 18} ${skirtTop} L${CENTER_X - 26} ${y + height} H${CENTER_X + 26} L${CENTER_X + 18} ${skirtTop} Z`}
          fill={isBlueprint ? '#1a100c' : '#856556'}
        />
        <path
          d={`M${x} ${y + 8} H${x + width}`}
          stroke="#ffae70"
          strokeWidth="1.3"
          opacity="0.75"
        />
        <text
          x={CENTER_X}
          y={y + casingH / 2 + 4}
          fontFamily="monospace"
          textAnchor="middle"
          fontSize="10"
          fill="#ffae70"
          stroke="none"
        >
          {code}
        </text>
      </>
    );
  }

  if (key === 'upper_engine_liquid') {
    const collarH = 12;
    const bellTop = y + collarH;
    const bellBottom = y + height - 1;
    const bellH = bellBottom - bellTop;
    return (
      <>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={isBlueprint ? '#09040f' : '#1f1828'}
        />
        <rect
          x={x}
          y={y}
          width={width}
          height={collarH}
          fill={isBlueprint ? '#120a1d' : '#4a3d52'}
        />
        <path
          d={`M${x} ${y + height} L${x + 14} ${bellTop} M${x + width} ${y + height} L${x + width - 14} ${bellTop}`}
          stroke={strokeAccent}
          strokeWidth="1.2"
          strokeDasharray="3 2"
          opacity="0.7"
        />
        <path
          d={`M${CENTER_X - 14} ${bellTop} L${CENTER_X - 26} ${bellBottom} H${CENTER_X + 26} L${CENTER_X + 14} ${bellTop} Z`}
          fill={isBlueprint ? '#140f1b' : '#9cd0c9'}
        />
        <path
          d={`M${CENTER_X - 17} ${bellTop + bellH * 0.28} H${CENTER_X + 17} M${CENTER_X - 23} ${bellBottom - 3} H${CENTER_X + 23}`}
          stroke={strokeAccent}
          strokeWidth="1"
          opacity="0.5"
        />
        <text
          x={CENTER_X}
          y={bellTop + bellH * 0.66}
          fontFamily="monospace"
          textAnchor="middle"
          fontSize="9.5"
          fill={isBlueprint ? '#00f4d6' : '#10181f'}
          stroke="none"
        >
          {code}
        </text>
      </>
    );
  }

  // upper_tank_liquid U-001
  return (
    <>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={isBlueprint ? '#0b0412' : 'url(#rocket-metal)'}
      />
      <path
        d={`M${x} ${y + 12} H${x + width} M${x} ${y + height - 12} H${x + width}`}
        stroke="#bd73fa"
        strokeWidth="1.2"
        opacity="0.7"
      />
      <path
        d={`M${x + 7} ${y + 15} V${y + height - 15}`}
        stroke="#bd73fa"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
      />
      <rect
        x={CENTER_X - 22}
        y={y + height / 2 - 9}
        width="44"
        height="18"
        fill={isBlueprint ? '#191026' : '#b679ed'}
        stroke="#bd73fa"
        strokeWidth="1.2"
      />
      <text
        x={CENTER_X}
        y={y + height / 2 + 3.5}
        fontFamily="monospace"
        textAnchor="middle"
        fontSize="10"
        fill={isBlueprint ? '#bd73fa' : '#100916'}
        stroke="none"
      >
        {code}
      </text>
    </>
  );
}

function renderBoosters(key, placement, isBlueprint, options = {}) {
  const { boosterTop, boosterBottom } = placement;
  const isLiquid = key === 'booster_liquid';
  const code = PARTS[key].code;
  const accent = isLiquid ? '#00f4d6' : '#ffae70';
  const leftX = options.leftX ?? CENTER_X - 88;
  const rightX = options.rightX ?? CENTER_X + 60;
  const coreHalf = options.coreHalf ?? HULL_HALF;
  const bWidth = 28;
  const noseH = 22;
  const nozzleH = 12;
  const bodyTop = boosterTop + noseH;
  const bodyBottom = boosterBottom - nozzleH;
  const upperStrutY = placement.upperStrutY ?? bodyTop + 14;
  const lowerStrutY = placement.lowerStrutY ?? bodyBottom - 16;

  return (
    <>
      {options.standalone && (
        <rect
          x={CENTER_X - coreHalf}
          y={bodyTop - 4}
          width={coreHalf * 2}
          height={bodyBottom - bodyTop + 10}
          fill="none"
          stroke="#79737c"
          strokeWidth="1.2"
          strokeDasharray="3 3"
          opacity="0.7"
        />
      )}
      {[leftX, rightX].map((bx, idx) => {
        const strutX1 = idx === 0 ? bx + bWidth : CENTER_X + coreHalf;
        const strutX2 = idx === 0 ? CENTER_X - coreHalf : bx;
        return (
          <g key={bx}>
            <path
              d={`M${strutX1} ${upperStrutY} H${strutX2} M${strutX1} ${lowerStrutY} H${strutX2}`}
              stroke={accent}
              strokeWidth="2"
              opacity="0.85"
            />
            <path
              d={`M${bx + bWidth / 2} ${boosterTop} L${bx + bWidth} ${bodyTop} H${bx} Z`}
              fill={isBlueprint ? '#120a18' : isLiquid ? 'url(#capsule-metal)' : 'url(#solid-metal)'}
            />
            <rect
              x={bx}
              y={bodyTop}
              width={bWidth}
              height={bodyBottom - bodyTop}
              fill={isBlueprint ? (isLiquid ? '#0a0714' : '#170d0a') : isLiquid ? 'url(#rocket-metal)' : 'url(#solid-metal)'}
            />
            <path
              d={`M${bx} ${bodyTop + 18} H${bx + bWidth} M${bx} ${bodyBottom - 18} H${bx + bWidth}`}
              stroke={accent}
              strokeWidth="1.2"
              opacity="0.75"
            />
            <path
              d={`M${bx + 5} ${bodyBottom} L${bx + 1} ${boosterBottom} H${bx + bWidth - 1} L${bx + bWidth - 5} ${bodyBottom} Z`}
              fill={isBlueprint ? '#140f1b' : '#856556'}
            />
          </g>
        );
      })}
      <rect
        x={leftX + 1}
        y={(bodyTop + bodyBottom) / 2 - 8}
        width={bWidth - 2}
        height="16"
        fill="#09020a"
        stroke={accent}
        strokeWidth="1"
      />
      <text
        x={leftX + bWidth / 2}
        y={(bodyTop + bodyBottom) / 2 + 3}
        fill={accent}
        fontFamily="monospace"
        fontSize="8.5"
        stroke="none"
        textAnchor="middle"
      >
        {code}
      </text>
      <rect
        x={rightX + 1}
        y={(bodyTop + bodyBottom) / 2 - 8}
        width={bWidth - 2}
        height="16"
        fill="#09020a"
        stroke={accent}
        strokeWidth="1"
      />
      <text
        x={rightX + bWidth / 2}
        y={(bodyTop + bodyBottom) / 2 + 3}
        fill={accent}
        fontFamily="monospace"
        fontSize="8.5"
        stroke="none"
        textAnchor="middle"
      >
        {code}
      </text>
    </>
  );
}

function renderPayload(key, rect, isBlueprint, strokeMain, strokeAccent) {
  const { x, y, width, height } = rect;
  const code = PARTS[key].code;

  if (key === 'capsule_science') {
    const coneH = height <= 56 ? 22 : 24;
    const adapterH = 10;
    const busTop = y + coneH;
    const busBottom = y + height - adapterH;
    const busH = busBottom - busTop;
    const badgeY = busTop + Math.max(2, (busH - 17) / 2);
    return (
      <>
        <path
          d={`M${CENTER_X} ${y} L${x + width - 6} ${busTop} H${x + 6} Z`}
          fill={isBlueprint ? '#09020a' : 'url(#capsule-metal)'}
        />
        <rect
          x={x + 6}
          y={busTop}
          width={width - 12}
          height={busH}
          fill={isBlueprint ? '#09020a' : '#8e829b'}
        />
        <rect
          x={x + 1}
          y={busTop + 2}
          width="5"
          height={Math.max(8, busH - 4)}
          fill={isBlueprint ? '#0d1c1b' : '#254a46'}
          stroke="#16ec8b"
          strokeWidth="1.2"
        />
        <rect
          x={x + width - 6}
          y={busTop + 2}
          width="5"
          height={Math.max(8, busH - 4)}
          fill={isBlueprint ? '#0d1c1b' : '#254a46'}
          stroke="#16ec8b"
          strokeWidth="1.2"
        />
        <path
          d={`M${x + 6} ${busBottom} L${x} ${y + height} H${x + width} L${x + width - 6} ${busBottom} Z`}
          fill={isBlueprint ? '#140f1b' : '#4a3d52'}
        />
        <rect
          x={CENTER_X - 21}
          y={badgeY}
          width="42"
          height="17"
          fill="#141e2c"
          stroke="#16ec8b"
          strokeWidth="1.2"
        />
        <text
          x={CENTER_X}
          y={badgeY + 12}
          fill="#16ec8b"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="10"
          stroke="none"
        >
          {code}
        </text>
      </>
    );
  }

  if (key === 'capsule_crew') {
    const domeH = 34;
    return (
      <>
        <path
          d={`M${x} ${y + domeH} C${x} ${y + 10} ${CENTER_X - 18} ${y} ${CENTER_X} ${y} C${CENTER_X + 18} ${y} ${x + width} ${y + 10} ${x + width} ${y + domeH} Z`}
          fill={isBlueprint ? '#09020a' : 'url(#capsule-metal)'}
        />
        <rect
          x={x}
          y={y + domeH}
          width={width}
          height={height - domeH}
          fill={isBlueprint ? '#09020a' : '#8e829b'}
        />
        <circle
          cx={CENTER_X}
          cy={y + 19}
          r="7"
          fill="#141e2c"
          stroke={strokeAccent}
          strokeWidth="1.4"
        />
        <rect
          x={CENTER_X - 24}
          y={y + domeH + 8}
          width="48"
          height="20"
          fill="#141e2c"
          stroke={strokeAccent}
          strokeWidth="1.2"
        />
        <text
          x={CENTER_X}
          y={y + domeH + 22}
          fill={strokeAccent}
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="10.5"
          stroke="none"
        >
          {code}
        </text>
      </>
    );
  }

  if (key === 'capsule_heavy') {
    const capH = 8;
    const adapterH = 10;
    const barrelTop = y + capH;
    const barrelBottom = y + height - adapterH;
    return (
      <>
        <path
          d={`M${x} ${y} H${x + width} L${x + width + 3} ${barrelTop} V${barrelBottom} L${x + width} ${y + height} H${x} L${x - 3} ${barrelBottom} V${barrelTop} Z`}
          fill={isBlueprint ? '#09020a' : 'url(#capsule-metal)'}
        />
        <path
          d={`M${x - 3} ${y + 14} H${x + width + 3} M${x - 3} ${barrelBottom} H${x + width + 3}`}
          stroke={strokeAccent}
          strokeWidth="1.4"
          opacity="0.85"
        />
        <rect
          x={CENTER_X - 24}
          y={y + height / 2 - 10}
          width="48"
          height="22"
          fill="#141e2c"
          stroke={strokeAccent}
          strokeWidth="1.2"
        />
        <text
          x={CENTER_X}
          y={y + height / 2 + 5}
          fill={strokeAccent}
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="10.5"
          stroke="none"
        >
          {code}
        </text>
      </>
    );
  }

  // Default C-001 Hermes Supply Pod
  const coneH = 32;
  return (
    <>
      <path
        d={`M${CENTER_X} ${y} L${x + width} ${y + coneH} H${x} Z`}
        fill={isBlueprint ? '#09020a' : 'url(#capsule-metal)'}
      />
      <rect
        x={x}
        y={y + coneH}
        width={width}
        height={height - coneH}
        fill={isBlueprint ? '#09020a' : '#8e829b'}
      />
      <path
        d={`M${CENTER_X - 2} ${y + 8} L${CENTER_X - 15} ${y + 26}`}
        stroke={strokeMain}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.85"
      />
      <rect
        x={CENTER_X - 24}
        y={y + coneH + 6}
        width="48"
        height="20"
        fill="#141e2c"
        stroke={strokeAccent}
        strokeWidth="1.2"
      />
      <text
        x={CENTER_X}
        y={y + coneH + 20}
        fill={strokeAccent}
        textAnchor="middle"
        fontFamily="monospace"
        fontSize="10.5"
        stroke="none"
      >
        {code}
      </text>
    </>
  );
}

function renderAvionics(rect, isBlueprint) {
  const { x, y, width, height } = rect;
  return (
    <>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={isBlueprint ? '#0d0713' : '#4a3d52'}
      />
      <path
        d={`M${x} ${y + 8} H${x + width} M${x} ${y + height - 8} H${x + width}`}
        stroke="#e7bc7c"
        strokeWidth="1.2"
        opacity="0.7"
      />
      <circle
        cx={x + 12}
        cy={y + height / 2}
        r="3.5"
        fill="#e7bc7c"
        stroke="none"
      />
      <text
        x={CENTER_X + 4}
        y={y + height / 2 + 3.5}
        fill="#e7bc7c"
        fontFamily="monospace"
        fontSize="9.5"
        textAnchor="middle"
        stroke="none"
      >
        P-001
      </text>
    </>
  );
}

function renderStabilizer(placement, isBlueprint, options = {}) {
  const finBottom = placement.finBottom;
  const finH = placement.finH ?? 56;
  const finRootHalf = placement.finRootHalf ?? HULL_HALF;
  const finTipHalf = placement.finTipHalf ?? 74;
  const finTop = finBottom - finH;
  const hasBooster = finRootHalf > HULL_HALF;
  const standalone = Boolean(options.standalone);
  const sparOut = finRootHalf + (finTipHalf - finRootHalf) * 0.58;

  return (
    <g fill={isBlueprint ? '#140b1f' : '#9a6ad5'}>
      {standalone && (
        <rect
          x={CENTER_X - finRootHalf}
          y={finTop - 8}
          width={finRootHalf * 2}
          height={finH + 12}
          fill="none"
          stroke="#79737c"
          strokeWidth="1.2"
          strokeDasharray="3 3"
          opacity="0.7"
        />
      )}
      {!standalone && !hasBooster && (
        <path
          d={`M${CENTER_X - finRootHalf} ${finBottom - 6} H${CENTER_X + finRootHalf}`}
          stroke="#bd73fa"
          strokeWidth="1.4"
          opacity="0.45"
        />
      )}
      <path
        d={`M${CENTER_X - finRootHalf} ${finTop} L${CENTER_X - finTipHalf} ${finBottom} H${CENTER_X - finRootHalf} Z`}
      />
      <path
        d={`M${CENTER_X + finRootHalf} ${finTop} L${CENTER_X + finTipHalf} ${finBottom} H${CENTER_X + finRootHalf} Z`}
      />
      <path
        d={`M${CENTER_X - finRootHalf} ${finTop + finH * 0.45} L${CENTER_X - sparOut} ${finBottom} M${CENTER_X + finRootHalf} ${finTop + finH * 0.45} L${CENTER_X + sparOut} ${finBottom}`}
        stroke="#bd73fa"
        strokeWidth="1.4"
      />
      {standalone ? (
        <>
          <rect
            x={CENTER_X - 20}
            y={finTop + finH / 2 - 8}
            width="40"
            height="16"
            fill="#1b1126"
            stroke="#bd73fa"
            strokeWidth="1.2"
          />
          <text
            x={CENTER_X}
            y={finTop + finH / 2 + 3.5}
            fill="#bd73fa"
            fontFamily="monospace"
            fontSize="9.5"
            stroke="none"
            textAnchor="middle"
          >
            S-001
          </text>
        </>
      ) : (
        <text
          x={hasBooster ? CENTER_X - finRootHalf - 6 : CENTER_X - 80}
          y={hasBooster ? finTop + 4 : finBottom - 24}
          fill="#bd73fa"
          fontFamily="monospace"
          fontSize="9"
          stroke="none"
          textAnchor={hasBooster ? 'end' : 'middle'}
        >
          S-001
        </text>
      )}
    </g>
  );
}

function renderFairing(rect, isBlueprint, options = {}) {
  const { y, height } = rect;
  const shroudHalf = 44;
  const coneBottom = y + Math.min(34, Math.round(height * 0.48));
  const boatTailTop = y + height - 12;
  const bottom = y + height;
  const standalone = Boolean(options.standalone);
  const hasPayload = Boolean(options.hasPayload);

  return (
    <g pointerEvents={standalone ? undefined : 'none'}>
      <path
        d={`M${CENTER_X} ${y} L${CENTER_X + shroudHalf} ${coneBottom} V${boatTailTop} L${CENTER_X + HULL_HALF} ${bottom} H${CENTER_X - HULL_HALF} L${CENTER_X - shroudHalf} ${boatTailTop} V${coneBottom} Z`}
        fill={isBlueprint ? '#0d0914' : '#3a425e'}
        fillOpacity={standalone ? (isBlueprint ? 0.6 : 0.72) : isBlueprint ? 0.35 : 0.45}
        stroke="#7788b6"
        strokeWidth="2"
      />
      <path
        d={`M${CENTER_X} ${y} V${boatTailTop}`}
        stroke="#7788b6"
        strokeWidth="1.2"
        strokeDasharray="3 3"
      />
      {standalone || !hasPayload ? (
        <>
          <rect
            x={CENTER_X - 22}
            y={coneBottom + Math.max(4, (boatTailTop - coneBottom - 18) / 2)}
            width="44"
            height="18"
            fill={isBlueprint ? '#110d1c' : '#262d42'}
            stroke="#7788b6"
            strokeWidth="1.2"
          />
          <text
            x={CENTER_X}
            y={coneBottom + Math.max(4, (boatTailTop - coneBottom - 18) / 2) + 12.5}
            fill="#8ea2d6"
            fontFamily="monospace"
            fontSize="10"
            stroke="none"
            textAnchor="middle"
          >
            F-001
          </text>
        </>
      ) : (
        <>
          <text
            x={CENTER_X + 76}
            y={y + 34}
            fill="#8ea2d6"
            fontFamily="monospace"
            fontSize="10"
            stroke="none"
            textAnchor="middle"
          >
            F-001
          </text>
          <path
            d={`M${CENTER_X + 34} ${y + 31} H${CENTER_X + 56}`}
            stroke="#8ea2d6"
            strokeWidth="1"
            opacity="0.7"
          />
        </>
      )}
    </g>
  );
}

export function RocketPartGraphic({
  partKey,
  rect,
  placement,
  isBlueprint = true,
  strokeMain = '#f6f2ff',
  strokeAccent = '#00f4d6',
  options = {},
}) {
  const part = PARTS[partKey];
  if (!part) return null;

  switch (part.slotGroup) {
    case 'coreEngine':
      return renderCoreEngine(partKey, rect, isBlueprint, strokeMain, strokeAccent);
    case 'coreTank':
      return renderCoreTank(partKey, rect, isBlueprint, strokeMain);
    case 'upperSolid':
    case 'upperEngine':
    case 'upperTank':
      return renderUpperStage(partKey, rect, isBlueprint, strokeAccent);
    case 'booster':
      return renderBoosters(partKey, placement, isBlueprint, options);
    case 'payload':
      return renderPayload(partKey, rect, isBlueprint, strokeMain, strokeAccent);
    case 'avionics':
      return renderAvionics(rect, isBlueprint);
    case 'stabilizer':
      return renderStabilizer(placement, isBlueprint, options);
    case 'fairing':
      return renderFairing(rect, isBlueprint, options);
    default:
      return null;
  }
}

export function RocketSvg({
  installed,
  transform,
  flightActive = false,
  blueprintMode = 'blueprint',
  interactive = false,
  activeDragPart = null,
  dragSource = null,
  isOverTargetSlot = false,
  hoveredPart = null,
  onPartPointerDown,
  onPartPointerEnter,
  onPartPointerMove,
  onPartPointerLeave,
}) {
  const isBlueprint = blueprintMode === 'blueprint';
  const strokeMain = isBlueprint ? '#f6f2ff' : '#948a9c';
  const strokeAccent = '#00f4d6';

  const { placements, topY, hasParts } = computeStackLayout(installed);

  // Compute contextual insertion reticle ONLY while actively dragging a part from the bay
  let dragPreviewPlacement = null;
  if (activeDragPart && dragSource === 'bay' && PARTS[activeDragPart]) {
    const previewSet = installPartInSet(installed, activeDragPart);
    const previewLayout = computeStackLayout(previewSet);
    dragPreviewPlacement = previewLayout.placements[activeDragPart] ?? null;
  }

  const gantryTopY = hasParts ? Math.max(16, topY + 6) : PAD_BASE_Y - 70;
  const gantryRungs = [];
  for (let ry = PAD_BASE_Y - 22; ry >= gantryTopY; ry -= 54) {
    gantryRungs.push(ry);
  }

  const sharedGroupProps = (partKey, rect) => ({
    partKey,
    rect,
    interactive,
    isDragTarget: activeDragPart === partKey,
    isOverTargetSlot,
    dragSource,
    isHovered: hoveredPart === partKey && !activeDragPart,
    onPartPointerDown,
    onPartPointerEnter,
    onPartPointerMove,
    onPartPointerLeave,
  });

  const payloadEntry = Object.values(placements).find(
    (p) => p.part.slotGroup === 'payload'
  );
  const fairingEntry = placements.fairing;
  const avionicsEntry = placements.avionics;
  const upperTankEntry = placements.upper_tank_liquid;
  const upperEngineEntry = placements.upper_engine_liquid;
  const upperSolidEntry = placements.upper_solid_kick;
  const coreTankEntry = Object.values(placements).find(
    (p) => p.part.slotGroup === 'coreTank'
  );
  const coreEngineEntry = Object.values(placements).find(
    (p) => p.part.slotGroup === 'coreEngine'
  );
  const boosterEntry = Object.values(placements).find(
    (p) => p.part.slotGroup === 'booster'
  );
  const stabilizerEntry = placements.stabilizer;

  return (
    <svg
      id="rocket-graphic"
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      preserveAspectRatio="xMidYMax meet"
      role={interactive ? 'group' : 'img'}
      aria-label="Modular rocket blueprint"
      data-mode={blueprintMode}
      data-interactive={interactive || undefined}
      data-stack-top={Math.round(topY)}
      style={transform ? { transform } : undefined}
    >
      <RocketGradientDefs />

      <g stroke={strokeMain} strokeWidth="2.2" strokeLinejoin="round">
        {/* Dynamic support gantry scaling strictly to installed rocket height */}
        <g stroke="#a19aa5" opacity={isBlueprint ? 0.22 : 0.3}>
          {gantryRungs.map((ry) => (
            <path
              key={ry}
              d={`M32 ${ry} H90 M170 ${ry} H228`}
              strokeWidth="2.6"
            />
          ))}
          <path
            d={`M56 ${gantryTopY} V${PAD_BASE_Y} M204 ${gantryTopY} V${PAD_BASE_Y}`}
            strokeWidth="1.6"
          />
          <rect
            x="66"
            y={PAD_BASE_Y}
            width="128"
            height="8"
            fill="#241c2e"
            stroke="#79737c"
            strokeWidth="1.5"
          />
        </g>

        {!hasParts && !dragPreviewPlacement && (
          <text
            x={CENTER_X}
            y={PAD_BASE_Y - 26}
            fill="#79737c"
            fontFamily="monospace"
            fontSize="10"
            textAnchor="middle"
            stroke="none"
          >
            EMPTY PAD — DRAG MODULES TO ASSEMBLE
          </text>
        )}

        {flightActive && renderLaunchFlames(coreEngineEntry, boosterEntry)}

        {/* Stabilizer Fins */}
        {stabilizerEntry && (
          <RocketPartGroup
            {...sharedGroupProps(stabilizerEntry.key, stabilizerEntry.rect)}
            hitArea={(() => {
              const finRootHalf = stabilizerEntry.finRootHalf ?? HULL_HALF;
              const finTipHalf = stabilizerEntry.finTipHalf ?? 74;
              const finW = finTipHalf - finRootHalf + 4;
              return (
                <>
                  <rect
                    x={CENTER_X - finTipHalf - 2}
                    y={stabilizerEntry.rect.y}
                    width={finW}
                    height={stabilizerEntry.rect.height}
                    fill="transparent"
                    stroke="none"
                  />
                  <rect
                    x={CENTER_X + finRootHalf - 2}
                    y={stabilizerEntry.rect.y}
                    width={finW}
                    height={stabilizerEntry.rect.height}
                    fill="transparent"
                    stroke="none"
                  />
                </>
              );
            })()}
          >
            {renderStabilizer(stabilizerEntry, isBlueprint)}
          </RocketPartGroup>
        )}

        {/* Strap-On Boosters */}
        {boosterEntry && (
          <RocketPartGroup
            {...sharedGroupProps(boosterEntry.key, boosterEntry.rect)}
            hitArea={
              <>
                <rect
                  x={CENTER_X - 96}
                  y={boosterEntry.rect.y}
                  width="42"
                  height={boosterEntry.rect.height}
                  fill="transparent"
                  stroke="none"
                />
                <rect
                  x={CENTER_X + 54}
                  y={boosterEntry.rect.y}
                  width="42"
                  height={boosterEntry.rect.height}
                  fill="transparent"
                  stroke="none"
                />
              </>
            }
          >
            {renderBoosters(boosterEntry.key, boosterEntry, isBlueprint)}
          </RocketPartGroup>
        )}

        {/* Core Engine */}
        {coreEngineEntry && (
          <RocketPartGroup
            {...sharedGroupProps(coreEngineEntry.key, coreEngineEntry.rect)}
            hitArea={
              <rect
                x={coreEngineEntry.rect.x}
                y={coreEngineEntry.rect.y}
                width={coreEngineEntry.rect.width}
                height={coreEngineEntry.rect.height}
                fill="transparent"
                stroke="none"
              />
            }
          >
            {renderCoreEngine(
              coreEngineEntry.key,
              coreEngineEntry.rect,
              isBlueprint,
              strokeMain,
              strokeAccent
            )}
          </RocketPartGroup>
        )}

        {/* Core Tank */}
        {coreTankEntry && (
          <RocketPartGroup
            {...sharedGroupProps(coreTankEntry.key, coreTankEntry.rect)}
            hitArea={
              <rect
                x={coreTankEntry.rect.x}
                y={coreTankEntry.rect.y}
                width={coreTankEntry.rect.width}
                height={coreTankEntry.rect.height}
                fill="transparent"
                stroke="none"
              />
            }
          >
            {renderCoreTank(
              coreTankEntry.key,
              coreTankEntry.rect,
              isBlueprint,
              strokeMain
            )}
          </RocketPartGroup>
        )}

        {/* Upper Stage (Solid Kick or Liquid Engine + Tank) */}
        {upperSolidEntry && (
          <RocketPartGroup
            {...sharedGroupProps(upperSolidEntry.key, upperSolidEntry.rect)}
            hitArea={
              <rect
                x={upperSolidEntry.rect.x}
                y={upperSolidEntry.rect.y}
                width={upperSolidEntry.rect.width}
                height={upperSolidEntry.rect.height}
                fill="transparent"
                stroke="none"
              />
            }
          >
            {renderUpperStage(
              upperSolidEntry.key,
              upperSolidEntry.rect,
              isBlueprint,
              strokeAccent
            )}
          </RocketPartGroup>
        )}

        {upperEngineEntry && (
          <RocketPartGroup
            {...sharedGroupProps(upperEngineEntry.key, upperEngineEntry.rect)}
            hitArea={
              <rect
                x={upperEngineEntry.rect.x}
                y={upperEngineEntry.rect.y}
                width={upperEngineEntry.rect.width}
                height={upperEngineEntry.rect.height}
                fill="transparent"
                stroke="none"
              />
            }
          >
            {renderUpperStage(
              upperEngineEntry.key,
              upperEngineEntry.rect,
              isBlueprint,
              strokeAccent
            )}
          </RocketPartGroup>
        )}

        {upperTankEntry && (
          <RocketPartGroup
            {...sharedGroupProps(upperTankEntry.key, upperTankEntry.rect)}
            hitArea={
              <rect
                x={upperTankEntry.rect.x}
                y={upperTankEntry.rect.y}
                width={upperTankEntry.rect.width}
                height={upperTankEntry.rect.height}
                fill="transparent"
                stroke="none"
              />
            }
          >
            {renderUpperStage(
              upperTankEntry.key,
              upperTankEntry.rect,
              isBlueprint,
              strokeAccent
            )}
          </RocketPartGroup>
        )}

        {/* Avionics Ring */}
        {avionicsEntry && (
          <RocketPartGroup
            {...sharedGroupProps(avionicsEntry.key, avionicsEntry.rect)}
            hitArea={
              <rect
                x={avionicsEntry.rect.x}
                y={avionicsEntry.rect.y}
                width={avionicsEntry.rect.width}
                height={avionicsEntry.rect.height}
                fill="transparent"
                stroke="none"
              />
            }
          >
            {renderAvionics(avionicsEntry.rect, isBlueprint)}
          </RocketPartGroup>
        )}

        {/* Payload Capsule */}
        {payloadEntry && (
          <RocketPartGroup
            {...sharedGroupProps(payloadEntry.key, payloadEntry.rect)}
            hitArea={
              <rect
                x={payloadEntry.rect.x}
                y={payloadEntry.rect.y}
                width={payloadEntry.rect.width}
                height={payloadEntry.rect.height}
                fill="transparent"
                stroke="none"
              />
            }
          >
            {renderPayload(
              payloadEntry.key,
              payloadEntry.rect,
              isBlueprint,
              strokeMain,
              strokeAccent
            )}
          </RocketPartGroup>
        )}

        {/* Fairing Shroud */}
        {fairingEntry && (
          <RocketPartGroup
            {...sharedGroupProps(fairingEntry.key, fairingEntry.rect)}
            hitArea={
              payloadEntry ? (
                <>
                  <path
                    d={`M${CENTER_X} ${fairingEntry.rect.y} L${CENTER_X + 44} ${payloadEntry.rect.y + 20} H${CENTER_X - 44} Z`}
                    fill="transparent"
                    stroke="none"
                  />
                  <rect
                    x={fairingEntry.rect.x + fairingEntry.rect.width - 4}
                    y={fairingEntry.rect.y + 16}
                    width="58"
                    height="32"
                    fill="transparent"
                    stroke="none"
                  />
                </>
              ) : (
                <rect
                  x={CENTER_X - 44}
                  y={fairingEntry.rect.y}
                  width="88"
                  height={fairingEntry.rect.height}
                  fill="transparent"
                  stroke="none"
                />
              )
            }
          >
            {renderFairing(fairingEntry.rect, isBlueprint, {
              hasPayload: Boolean(payloadEntry),
            })}
          </RocketPartGroup>
        )}

        {/* Contextual Insertion Reticle ONLY while dragging from Assembly Bay */}
        {dragPreviewPlacement && (
          <g pointerEvents="none">
            <rect
              data-slot-bounds={activeDragPart}
              className="rocket-drop-reticle"
              x={dragPreviewPlacement.rect.x - 4}
              y={dragPreviewPlacement.rect.y - 4}
              width={dragPreviewPlacement.rect.width + 8}
              height={dragPreviewPlacement.rect.height + 8}
              rx="4"
              fill={isOverTargetSlot ? '#16ec8b' : '#00f4d6'}
              fillOpacity={isOverTargetSlot ? 0.18 : 0.08}
              stroke={isOverTargetSlot ? '#16ec8b' : '#00f4d6'}
              strokeWidth="2.2"
              strokeDasharray="6 4"
            />
            <rect
              x={CENTER_X - 48}
              y={Math.max(
                6,
                dragPreviewPlacement.rect.y +
                  dragPreviewPlacement.rect.height / 2 -
                  9
              )}
              width="96"
              height="18"
              rx="2"
              fill="#09020ae6"
              stroke={isOverTargetSlot ? '#16ec8b' : '#00f4d6'}
              strokeWidth="1.2"
            />
            <text
              x={CENTER_X}
              y={Math.max(
                18,
                dragPreviewPlacement.rect.y +
                  dragPreviewPlacement.rect.height / 2 +
                  3
              )}
              fill={isOverTargetSlot ? '#16ec8b' : '#00f4d6'}
              className="rocket-slot-label"
              textAnchor="middle"
              stroke="none"
            >
              {isOverTargetSlot
                ? `MOUNT ${PARTS[activeDragPart].code}`
                : `SLOT: ${PARTS[activeDragPart].code}`}
            </text>
          </g>
        )}
      </g>
    </svg>
  );
}