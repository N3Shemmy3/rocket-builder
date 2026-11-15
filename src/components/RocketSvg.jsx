export function RocketSvg({
  installed,
  transform,
  blueprintMode = 'blueprint',
}) {
  const isBlueprint = blueprintMode === 'blueprint';
  const strokeMain = isBlueprint ? '#f6f2ff' : '#948a9c';
  const strokeAccent = '#00f4d6';

  const hasFairing = installed.has('fairing');
  const hasCapsule = installed.has('capsule');
  const hasAvionics = installed.has('avionics');
  const hasTank = installed.has('tank');
  const hasStabilizer = installed.has('stabilizer');
  const hasEngine = installed.has('engine');

  return (
    <svg
      id="rocket-graphic"
      viewBox="0 0 240 430"
      role="img"
      aria-label="Modular rocket blueprint"
      data-mode={blueprintMode}
      style={transform ? { transform } : undefined}
    >
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
      </defs>

      <g stroke={strokeMain} strokeWidth="2.4" strokeLinejoin="round">
        {/* Support tower / assembly gantry */}
        <g stroke="#a19aa5" opacity={isBlueprint ? 0.22 : 0.3}>
          <path
            d="M26 32H80M25 112H78M25 168H80M25 292H80M24 348H62M160 32H214M162 112H214M160 168H214M160 292H215M178 348H216"
            strokeWidth="3"
          />
          <path d="M56 32V382M184 32V382" strokeWidth="1.6" />
        </g>

        {/* F-001 Fairing (outer aerodynamic shroud around nose cone) */}
        <g
          opacity={hasFairing ? 1 : 0.16}
          strokeDasharray={hasFairing ? undefined : '4 4'}
        >
          <path
            d="M120 12 L166 100 L166 112 H74 L74 100 Z"
            fill={isBlueprint ? '#0d0914' : '#3a425e'}
            fillOpacity={isBlueprint ? 0.45 : 0.6}
            stroke={hasFairing ? '#7788b6' : strokeMain}
            strokeWidth="2"
          />
          <path
            d="M120 12 V100"
            stroke="#7788b6"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
          <text
            x="194"
            y="64"
            fill="#8ea2d6"
            fontFamily="monospace"
            fontSize="10"
            stroke="none"
            textAnchor="middle"
          >
            F-001
          </text>
          <path
            d="M150 61 H176"
            stroke="#8ea2d6"
            strokeWidth="1"
            opacity="0.7"
          />
        </g>

        {/* C-003 Capsule (Figma 100:74 capsule 2 & 7:506 capsule 1) */}
        <g
          opacity={hasCapsule ? 1 : 0.16}
          strokeDasharray={hasCapsule ? undefined : '4 4'}
        >
          <path
            d="M120 24 L156 98 H84 Z"
            fill={isBlueprint ? '#09020a' : 'url(#capsule-metal)'}
          />
          <rect
            x="84"
            y="98"
            width="72"
            height="50"
            fill={isBlueprint ? '#09020a' : '#8e829b'}
          />
          {/* Figma top-left internal nose-cone hatch tick lines */}
          <path
            d="M118 34 L103 64 M121 40 L109 66"
            stroke={strokeMain}
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.85"
          />
          {/* Figma double-line right-edge specular detail */}
          <path
            d="M151 102 V143 M137 143 H152"
            stroke={strokeMain}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.8"
          />
          <rect
            x="96"
            y="112"
            width="48"
            height="20"
            fill="#141e2c"
            stroke={strokeAccent}
            strokeWidth="1.2"
          />
          <text
            x="120"
            y="126"
            fill={strokeAccent}
            textAnchor="middle"
            fontFamily="monospace"
            fontSize="11"
            stroke="none"
          >
            C-003
          </text>
        </g>

        {/* P-001 Avionics / Guidance Bay (Figma 7:506 midsection 1) */}
        <g
          opacity={hasAvionics ? 1 : 0.16}
          strokeDasharray={hasAvionics ? undefined : '4 4'}
        >
          <rect
            x="84"
            y="152"
            width="72"
            height="36"
            fill={isBlueprint ? '#0d0713' : '#4a3d52'}
          />
          <path
            d="M84 162 H156 M84 178 H156"
            stroke="#e7bc7c"
            strokeWidth="1.2"
            opacity="0.7"
          />
          <circle
            cx="97"
            cy="170"
            r="4"
            fill="#e7bc7c"
            stroke="none"
            opacity="0.9"
          />
          <rect
            x="105"
            y="164"
            width="36"
            height="12"
            fill="#161021"
            stroke="none"
          />
          <text
            x="123"
            y="173"
            fill="#e7bc7c"
            fontFamily="monospace"
            fontSize="9.5"
            textAnchor="middle"
            stroke="none"
          >
            P-001
          </text>
        </g>

        {/* T-001 Fuel Tank (Figma 100:74 bottom part 2 upper cylinder) */}
        <g
          opacity={hasTank ? 1 : 0.14}
          strokeDasharray={hasTank ? undefined : '4 4'}
        >
          <rect
            x="84"
            y="192"
            width="72"
            height="118"
            fill={isBlueprint ? '#09020a' : 'url(#rocket-metal)'}
          />
          {/* Figma left vertical stringer lines */}
          <path
            d="M91 224 V262 M91 268 V298"
            stroke={strokeMain}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.82"
          />
          {/* Figma top-right double-wall ticks & mid-right weld baffle */}
          <path
            d="M134 197 H151 M151 199 V216 M122 238 H155 M143 234 H155"
            stroke={strokeMain}
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.85"
          />
          <rect
            x="96"
            y="246"
            width="48"
            height="22"
            fill={isBlueprint ? '#1b1126' : '#b679ed'}
            stroke="#bd73fa"
            strokeWidth="1.4"
          />
          <text
            x="120"
            y="261"
            fontFamily="monospace"
            textAnchor="middle"
            fontSize="11"
            fill={isBlueprint ? '#bd73fa' : '#100916'}
            stroke="none"
          >
            T-001
          </text>
        </g>

        {/* S-001 Stabilizer Fins */}
        <g
          opacity={hasStabilizer ? 1 : 0.14}
          strokeDasharray={hasStabilizer ? undefined : '4 4'}
          fill={isBlueprint ? '#140b1f' : '#9a6ad5'}
        >
          <path d="M84 268 L48 334 H84 Z" />
          <path d="M156 268 L192 334 H156 Z" />
          <path
            d="M84 294 L62 334 M156 294 L178 334"
            stroke="#bd73fa"
            strokeWidth="1.4"
          />
          <text
            x="40"
            y="305"
            fill="#bd73fa"
            fontFamily="monospace"
            fontSize="9.5"
            stroke="none"
            textAnchor="middle"
          >
            S-001
          </text>
        </g>

        {/* E-001 Engine Skirt & Bell Nozzle (Figma 100:74 bottom part 2 lower assembly) */}
        <g
          opacity={hasEngine ? 1 : 0.14}
          strokeDasharray={hasEngine ? undefined : '4 4'}
        >
          <path
            d="M84 310 L62 352 H178 L156 310 Z"
            fill={isBlueprint ? '#09020a' : 'url(#skirt-metal)'}
          />
          <path
            d="M95 352 L85 378 H155 L145 352 Z"
            fill={isBlueprint ? '#140f1b' : '#c48663'}
          />
          {/* Figma skirt cooling / structural lines */}
          <path
            d="M152 315 L170 347 M102 356 L94 374 M138 356 L146 374"
            stroke={strokeAccent}
            strokeWidth="1.4"
            opacity="0.75"
          />
          <text
            x="120"
            y="336"
            fontSize="11"
            fontFamily="monospace"
            textAnchor="middle"
            stroke="none"
            fill={isBlueprint ? '#00f4d6' : '#0e1d20'}
          >
            E-001
          </text>
        </g>
      </g>
    </svg>
  );
}
