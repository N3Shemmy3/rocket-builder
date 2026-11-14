export function RocketSvg({ installed, transform }) {
  return (
    <svg
      id="rocket-graphic"
      viewBox="0 0 240 430"
      role="img"
      aria-label="Modular rocket blueprint"
      style={transform ? { transform } : undefined}
    >
      <defs>
        <linearGradient id="rocket-metal" x1="0" x2="1">
          <stop stopColor="#474050" />
          <stop offset=".35" stopColor="#d2c9d2" />
          <stop offset=".65" stopColor="#716674" />
          <stop offset="1" stopColor="#28212f" />
        </linearGradient>
      </defs>
      <g stroke="#948a9c" strokeWidth="2.7" strokeLinejoin="round">
        {/* support tower / assembly rack */}
        <path
          d="M28 35H84M27 114H80M27 285H83M25 334H82M25 384H85M155 35H210M158 114H210M154 285H214M157 334H215M155 384H215"
          stroke="#a19aa5"
          strokeWidth="4"
          opacity=".3"
        />
        <path d="M66 42V380M174 42V380" opacity=".15" strokeWidth="2" />
        {/* capsule */}
        <g opacity={installed.has('capsule') ? 1 : 0.16}>
          <path
            d="M120 24 L158 100 L158 135 L82 135 L82 100 Z"
            fill="#9c91a7"
          />
          <path d="M120 24 L144 102 L96 102Z" fill="#d4c6d8" />
          <path d="M97 108H143V126H97Z" fill="#1b2534" stroke="none" />
          <text
            x="120"
            y="121"
            fill="#24e5d1"
            textAnchor="middle"
            fontFamily="monospace"
            fontSize="12"
            stroke="none"
          >
            C-003
          </text>
        </g>
        {/* tank */}
        <g opacity={installed.has('tank') ? 1 : 0.12}>
          <rect
            x="82"
            y="138"
            width="76"
            height="149"
            fill="url(#rocket-metal)"
          />
          <path d="M82 163H158M82 257H158" stroke="#2e2633" strokeWidth="6" />
          <rect
            x="94"
            y="180"
            width="52"
            height="26"
            fill="#b679ed"
            stroke="none"
          />
          <text
            x="120"
            y="197"
            fontFamily="monospace"
            textAnchor="middle"
            fontSize="12"
            fill="#100916"
            stroke="none"
          >
            T-001
          </text>
        </g>
        {/* engine */}
        <g opacity={installed.has('engine') ? 1 : 0.14}>
          <rect x="88" y="289" width="64" height="41" fill="#85b5b0" />
          <path d="M101 330L89 382H151L139 330Z" fill="#c48663" />
          <text
            x="120"
            y="315"
            fontSize="12"
            fontFamily="monospace"
            textAnchor="middle"
            stroke="none"
            fill="#0e1d20"
          >
            E-001
          </text>
        </g>
        {/* fins */}
        <g opacity={installed.has('stabilizer') ? 1 : 0.1} fill="#9a6ad5">
          <path d="M82 287L55 342H82Z" />
          <path d="M158 287L185 342H158Z" />
        </g>
      </g>
    </svg>
  );
}
