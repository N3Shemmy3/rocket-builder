import { useState } from 'react';
import { getMissionFlightProfile } from '../data/flightStages';
import { PARTS } from '../data/parts';
import { fmt } from '../utils/format';
import { RocketSvg } from './RocketSvg';

function DestinationScenery({ sceneType }) {
  return (
    <g className="world world-moon" transform="translate(0 0)">
      {/* Common deep-space starfield */}
      <g fill="#d2d5e5">
        <circle cx="55" cy="83" r="2" />
        <circle cx="206" cy="122" r="2" />
        <circle cx="433" cy="65" r="2" />
        <circle cx="540" cy="207" r="2" />
        <circle cx="144" cy="302" r="1.5" />
        <circle cx="358" cy="267" r="2" />
        <circle cx="579" cy="381" r="1.5" />
        <circle cx="96" cy="186" r="1.4" />
        <circle cx="312" cy="48" r="1.8" />
        <circle cx="498" cy="118" r="1.5" />
      </g>

      {sceneType === 'station' && (
        <g>
          {/* Low Earth Orbit curved limb */}
          <path
            d="M-60 630 Q300 470 660 630 Z"
            fill="#1f537a"
            stroke="#4fa3ca"
            strokeWidth="7"
          />
          <path d="M-60 630 Q300 505 660 630 Z" fill="#173b59" opacity=".8" />
          {/* Horizon-1 Modular Space Station */}
          <g transform="translate(300 175)">
            <rect
              x="-145"
              y="-5"
              width="290"
              height="10"
              fill="#7c879e"
              stroke="#c9d5eb"
              strokeWidth="1.5"
            />
            {/* Solar array wings */}
            <g fill="#1d4477" stroke="#53a4d8" strokeWidth="1.5">
              <rect x="-135" y="-58" width="26" height="46" />
              <rect x="-135" y="12" width="26" height="46" />
              <rect x="-98" y="-58" width="26" height="46" />
              <rect x="-98" y="12" width="26" height="46" />
              <rect x="72" y="-58" width="26" height="46" />
              <rect x="72" y="12" width="26" height="46" />
              <rect x="109" y="-58" width="26" height="46" />
              <rect x="109" y="12" width="26" height="46" />
            </g>
            {/* Pressurized core & docking module */}
            <rect
              x="-28"
              y="-22"
              width="56"
              height="44"
              rx="4"
              fill="#c5bfd4"
              stroke="#f6f2ff"
              strokeWidth="2"
            />
            <rect
              x="-12"
              y="22"
              width="24"
              height="30"
              fill="#8f86a3"
              stroke="#00f4d6"
              strokeWidth="1.5"
            />
            <circle cx="0" cy="57" r="4" fill="#00f4d6" />
            <circle
              cx="0"
              cy="57"
              r="14"
              fill="none"
              stroke="#00f4d6"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity=".75"
            />
          </g>
        </g>
      )}

      {sceneType === 'lunar-relay' && (
        <g>
          {/* Distant Earth & Selene Relay Satellite */}
          <circle cx="486" cy="206" r="56" fill="#395e88" opacity=".85" />
          <path
            d="M460 175 Q488 188 510 170 M450 215 Q482 228 525 205"
            fill="none"
            stroke="#7fc7d9"
            strokeWidth="4"
            opacity=".65"
          />
          <g transform="translate(152 168)">
            <rect
              x="-14"
              y="-14"
              width="28"
              height="28"
              fill="#b89ae0"
              stroke="#f6f2ff"
              strokeWidth="1.8"
            />
            <rect
              x="-62"
              y="-6"
              width="44"
              height="12"
              fill="#224c80"
              stroke="#6acbbd"
              strokeWidth="1.2"
            />
            <rect
              x="18"
              y="-6"
              width="44"
              height="12"
              fill="#224c80"
              stroke="#6acbbd"
              strokeWidth="1.2"
            />
            <path
              d="M-12 18 Q0 30 12 18"
              fill="none"
              stroke="#00f4d6"
              strokeWidth="2"
            />
            <path
              d="M-22 28 Q0 44 22 28"
              fill="none"
              stroke="#00f4d6"
              strokeWidth="1.4"
              opacity=".6"
            />
          </g>
          {/* Cratered Lunar Horizon */}
          <path
            d="M0 487L100 465L167 477L273 433L369 472L450 449L532 469L600 437V620H0Z"
            fill="#777581"
          />
          <path
            d="M0 531L104 500L210 525L318 487L422 518L525 485L600 514V620H0Z"
            fill="#a29ba5"
          />
          <g fill="#716c79" opacity=".9">
            <ellipse cx="95" cy="547" rx="49" ry="12" />
            <ellipse cx="387" cy="550" rx="72" ry="17" />
            <ellipse cx="514" cy="502" rx="27" ry="7" />
          </g>
          <path
            d="M0 575H600"
            stroke="#c0b8b9"
            strokeWidth="3"
            opacity=".5"
          />
        </g>
      )}

      {sceneType === 'aurora' && (
        <g>
          {/* Aurora Curtains & Magnetosphere Scan Grid */}
          <path
            d="M0 245 Q130 155 260 225 T540 175 L600 190 V350 L0 350 Z"
            fill="#16ec8b"
            opacity=".16"
          />
          <path
            d="M0 215 Q160 120 315 200 T600 155"
            fill="none"
            stroke="#16ec8b"
            strokeWidth="5"
            opacity=".55"
          />
          <path
            d="M0 250 Q180 180 340 245 T600 195"
            fill="none"
            stroke="#bd73fa"
            strokeWidth="4"
            opacity=".5"
          />
          <g stroke="#00f4d6" strokeWidth="1" opacity=".2" strokeDasharray="4 6">
            <path d="M60 120 Q300 220 540 120" fill="none" />
            <path d="M20 170 Q300 270 580 170" fill="none" />
          </g>
          {/* Polar Earth Limb */}
          <path
            d="M-80 635 Q300 430 680 635 Z"
            fill="#1b4d70"
            stroke="#62c9ca"
            strokeWidth="9"
          />
          <path
            d="M-80 635 Q300 475 680 635 Z"
            fill="#d9eef3"
            opacity=".18"
          />
        </g>
      )}

      {sceneType === 'rescue' && (
        <g>
          {/* Earth Orbital Horizon */}
          <path
            d="M-60 630 Q300 465 660 630 Z"
            fill="#245d87"
            stroke="#6bb5d4"
            strokeWidth="8"
          />
          {/* Stranded Crew Capsule + Pulsing Distress Beacon */}
          <g transform="translate(432 182)">
            <circle
              cx="0"
              cy="0"
              r="52"
              fill="none"
              stroke="#ffae70"
              strokeWidth="1.4"
              strokeDasharray="5 5"
              opacity=".6"
            />
            <circle
              cx="0"
              cy="0"
              r="32"
              fill="none"
              stroke="#00f4d6"
              strokeWidth="1.5"
              opacity=".8"
            />
            <path
              d="M0 -18 L18 8 H-18 Z"
              fill="#d4c6d8"
              stroke="#f6f2ff"
              strokeWidth="1.6"
            />
            <rect
              x="-14"
              y="8"
              width="28"
              height="12"
              fill="#443a50"
              stroke="#f6f2ff"
              strokeWidth="1.5"
            />
            <circle cx="0" cy="-22" r="3.5" fill="#ffae70" />
          </g>
          {/* Approach Vector Line */}
          <path
            d="M300 290 L414 198"
            stroke="#00f4d6"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity=".7"
          />
        </g>
      )}

      {sceneType === 'outpost' && (
        <g>
          {/* Distant Earth */}
          <circle cx="110" cy="148" r="34" fill="#315c8a" opacity=".82" />
          {/* Frontier Ridge & Outpost Habitat Domes */}
          <path
            d="M0 476L120 444L220 470L340 426L465 462L600 434V620H0Z"
            fill="#565264"
          />
          <path
            d="M0 524L140 492L265 516L410 486L600 510V620H0Z"
            fill="#7b7488"
          />
          {/* Pressurized Domes & Comms Mast */}
          <g transform="translate(425 488)">
            <path
              d="M-54 14 A34 30 0 0 1 14 14 Z"
              fill="#9f96b3"
              stroke="#f6f2ff"
              strokeWidth="2"
            />
            <path
              d="M22 14 A26 22 0 0 1 74 14 Z"
              fill="#847c99"
              stroke="#f6f2ff"
              strokeWidth="2"
            />
            <rect
              x="12"
              y="4"
              width="14"
              height="10"
              fill="#5d566d"
              stroke="#f6f2ff"
              strokeWidth="1.5"
            />
            <circle cx="-20" cy="4" r="3.5" fill="#00f4d6" />
            <circle cx="48" cy="6" r="3" fill="#ffae70" />
            <path
              d="M86 14 V-42 M78 -30 H94"
              stroke="#00f4d6"
              strokeWidth="2"
            />
          </g>
          {/* Landing Pad Beacons */}
          <rect x="225" y="546" width="150" height="8" fill="#2c2738" />
          <circle cx="232" cy="544" r="3.5" fill="#16ec8b" />
          <circle cx="368" cy="544" r="3.5" fill="#16ec8b" />
        </g>
      )}
    </g>
  );
}

function getDropBannerText(
  activeDragPart,
  dragSource,
  isOverTargetSlot,
  installed
) {
  if (!activeDragPart) return null;
  const part = PARTS[activeDragPart];
  const code = part?.code ?? activeDragPart.toUpperCase();

  if (dragSource === 'rocket') {
    return `DRAG ${code} TO ASSEMBLY BAY (OR OFF PAD) TO DETACH`;
  }

  if (installed.has(activeDragPart)) {
    return `${code} ALREADY MOUNTED — DRAG FROM ROCKET TO DETACH`;
  }

  if (isOverTargetSlot) {
    return `RELEASE TO MOUNT ${code} (${part?.stageRole ?? 'MODULE'})`;
  }

  return `DRAG ${code} ONTO THE LAUNCH PAD TO MOUNT`;
}

export function FlightScene({
  mission,
  flight,
  installed,
  sceneRef,
  activeDragPart = null,
  dragSource = null,
  isOverTargetSlot = false,
  hoveredRocketPart = null,
  onRocketPartPointerDown,
  onRocketPartPointerEnter,
  onRocketPartPointerMove,
  onRocketPartPointerLeave,
  onNativeDragOver,
  onNativeDrop,
}) {
  const [blueprintMode, setBlueprintMode] = useState('blueprint');
  const progressPercent = Math.min(100, Math.max(0, flight.progress * 100));
  const profile = getMissionFlightProfile(mission);
  const durationLabel = `${(profile.durationMs / 1000).toFixed(1)}s`;
  const isDropActive = Boolean(activeDragPart) && !flight.active;
  const dropBannerText = isDropActive
    ? getDropBannerText(activeDragPart, dragSource, isOverTargetSlot, installed)
    : null;

  return (
    <div
      ref={sceneRef}
      className="flight-scene"
      id="flight-scene"
      data-phase={flight.phase}
      data-scene={profile.sceneType}
      data-drop-active={isDropActive ? 'true' : undefined}
      data-drop-over={
        isDropActive &&
        dragSource === 'bay' &&
        isOverTargetSlot &&
        !installed.has(activeDragPart)
          ? 'true'
          : undefined
      }
      data-drop-mode={
        isDropActive
          ? dragSource === 'rocket'
            ? 'detach'
            : 'mount'
          : undefined
      }
      aria-label="Launch site scenery"
      onDragOver={(e) => onNativeDragOver?.(e, 'rocket')}
      onDrop={(e) => onNativeDrop?.(e, 'rocket')}
    >
      <svg
        className="flight-backdrop"
        viewBox={`0 ${flight.cameraY.toFixed(2)} 600 620`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="pad-sky" x2="0" y2="1">
            <stop stopColor="#202441" />
            <stop offset=".65" stopColor="#74668c" />
            <stop offset="1" stopColor="#d39a84" />
          </linearGradient>
          <linearGradient id="blue-sky" x2="0" y2="1">
            <stop stopColor="#17385d" />
            <stop offset=".68" stopColor="#3a81a3" />
            <stop offset="1" stopColor="#a3ced0" />
          </linearGradient>
          <linearGradient id="orbital-sky" x2="0" y2="1">
            <stop stopColor="#060711" />
            <stop offset=".76" stopColor="#111a34" />
            <stop offset="1" stopColor="#36719a" />
          </linearGradient>
          <linearGradient
            id="world-gradient"
            x1="0"
            y1="0"
            x2="0"
            y2="2480"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#070914" />
            <stop offset="0.25" stopColor="#080b1a" />
            <stop offset="0.43" stopColor="#111d38" />
            <stop offset="0.52" stopColor="#25547d" />
            <stop offset="0.67" stopColor="#438eac" />
            <stop offset="0.77" stopColor="#94bdc8" />
            <stop offset="0.85" stopColor="#74668c" />
            <stop offset="1" stopColor="#d39a84" />
          </linearGradient>
        </defs>
        {/* One continuous 2,480-unit-tall world. Camera starts at its bottom. */}
        <rect x="0" y="0" width="600" height="2480" fill="url(#world-gradient)" />
        <g className="world world-pad" transform="translate(0 1860)">
          <circle cx="465" cy="126" r="48" fill="#dfb58d" opacity=".7" />
          <path
            d="M0 428L75 386L145 432L245 373L332 416L440 382L525 425L600 390V620H0Z"
            fill="#34364a"
          />
          <path
            d="M0 488L110 448L183 479L305 440L405 476L505 447L600 473V620H0Z"
            fill="#242737"
          />
          <rect y="542" width="600" height="78" fill="#262531" />
          <path
            d="M0 540H600M0 574H600"
            stroke="#777184"
            strokeWidth="3"
            opacity=".5"
          />
          <g fill="#333544" stroke="#a2a0ac" strokeWidth="3">
            <rect x="435" y="202" width="23" height="339" />
            <rect x="425" y="251" width="49" height="9" />
            <rect x="425" y="327" width="49" height="9" />
            <rect x="425" y="403" width="49" height="9" />
            <rect x="425" y="479" width="49" height="9" />
            <rect x="380" y="530" width="137" height="15" />
          </g>
          <path
            d="M446 210L446 525M439 260L458 325L439 400L458 475"
            fill="none"
            stroke="#c5bbc3"
            strokeWidth="2"
          />
          <rect
            x="0"
            y="555"
            width="600"
            height="65"
            fill="#13121d"
            opacity=".42"
          />
        </g>
        <g className="world world-sky" transform="translate(0 1240)">
          <g fill="#d1e9e9" opacity=".7">
            <path d="M45 148h92l25-15h71l31 22h-219z" />
            <path d="M332 322h106l26-23h77l25 25H332z" />
            <path d="M-20 490h125l32-16h72l40 24H-20z" />
            <path d="M373 84h82l24-15h51l33 18H373z" />
          </g>
          <g stroke="#d1e9e9" strokeWidth="2" opacity=".23">
            <path d="M58 0V620M282 0V620M532 0V620" />
          </g>
        </g>
        <g className="world world-space" transform="translate(0 620)">
          <path
            d="M-100 640Q302 260 710 640"
            fill="#24628b"
            stroke="#5ea1c1"
            strokeWidth="12"
          />
          <path
            d="M-100 640Q302 300 710 640"
            fill="#245274"
            opacity=".75"
          />
          <g fill="#cbd3e7">
            <circle cx="42" cy="65" r="2" />
            <circle cx="112" cy="274" r="1.8" />
            <circle cx="272" cy="108" r="2" />
            <circle cx="455" cy="38" r="2" />
            <circle cx="556" cy="196" r="2.5" />
            <circle cx="393" cy="254" r="1.5" />
            <circle cx="78" cy="399" r="1.5" />
            <circle cx="511" cy="425" r="2" />
            <circle cx="208" cy="359" r="1.7" />
            <circle cx="340" cy="59" r="1.5" />
          </g>
        </g>
        <DestinationScenery sceneType={profile.sceneType} />
      </svg>
      <div className="flight-hud">
        <span id="flight-phase">{flight.phaseLabel}</span>
        <div className="flight-hud-right">
          <span className="hud-target-pill">
            TARGET {fmt(mission?.altitude ?? 400)} KM · {durationLabel}
          </span>
          <button
            type="button"
            className="hud-view-toggle"
            onClick={() =>
              setBlueprintMode((prev) =>
                prev === 'blueprint' ? 'cad' : 'blueprint'
              )
            }
          >
            VIEW: {blueprintMode === 'blueprint' ? 'BLUEPRINT' : 'CAD'}
          </button>
          <span id="flight-altitude">ALT {fmt(flight.altitude)} KM</span>
        </div>
      </div>
      {dropBannerText && (
        <div
          className={`flight-drop-banner${
            isOverTargetSlot && dragSource === 'bay' && !installed.has(activeDragPart)
              ? ' over'
              : ''
          }${dragSource === 'rocket' ? ' detach' : ''}`}
          role="status"
          aria-live="off"
        >
          {dropBannerText}
        </div>
      )}
      <div className="rocket-stage" aria-label="Rocket preview">
        <RocketSvg
          installed={installed}
          transform={flight.rocketTransform}
          flightActive={flight.active}
          blueprintMode={blueprintMode}
          interactive={!flight.active}
          activeDragPart={activeDragPart}
          dragSource={dragSource}
          isOverTargetSlot={isOverTargetSlot}
          hoveredPart={hoveredRocketPart}
          onPartPointerDown={onRocketPartPointerDown}
          onPartPointerEnter={onRocketPartPointerEnter}
          onPartPointerMove={onRocketPartPointerMove}
          onPartPointerLeave={onRocketPartPointerLeave}
        />
      </div>
      <div className="flight-progress">
        <span
          id="flight-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
