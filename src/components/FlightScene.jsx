import { useState } from 'react';
import { fmt } from '../utils/format';
import { RocketSvg } from './RocketSvg';

export function FlightScene({ flight, installed }) {
  const [blueprintMode, setBlueprintMode] = useState('blueprint');
  const progressPercent = Math.min(100, Math.max(0, flight.progress * 100));

  return (
    <div
      className="flight-scene"
      id="flight-scene"
      data-phase={flight.phase}
      aria-label="Launch site scenery"
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
        <g className="world world-moon" transform="translate(0 0)">
          <g fill="#d2d5e5">
            <circle cx="55" cy="83" r="2" />
            <circle cx="206" cy="122" r="2" />
            <circle cx="433" cy="65" r="2" />
            <circle cx="540" cy="207" r="2" />
            <circle cx="144" cy="302" r="1.5" />
            <circle cx="358" cy="267" r="2" />
            <circle cx="579" cy="381" r="1.5" />
          </g>
          <circle cx="486" cy="206" r="60" fill="#395e88" opacity=".8" />
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
      </svg>
      <div className="flight-hud">
        <span id="flight-phase">{flight.phaseLabel}</span>
        <div className="flight-hud-right">
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
      <div className="rocket-stage" aria-label="Rocket preview">
        <RocketSvg
          installed={installed}
          transform={flight.rocketTransform}
          blueprintMode={blueprintMode}
        />
        <div className="launch-flame" aria-hidden="true" />
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
