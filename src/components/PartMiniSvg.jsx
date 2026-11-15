const PART_ACCENTS = {
  capsule: '#00f4d6',
  tank: '#bd73fa',
  engine: '#6acbbd',
  avionics: '#e7bc7c',
  stabilizer: '#b482d8',
  fairing: '#7788b6',
};

export function PartMiniSvg({ partKey, code }) {
  const accent = PART_ACCENTS[partKey] || '#f6f2ff';

  return (
    <svg viewBox="0 0 80 100" aria-hidden="true">
      <g
        stroke="#f6f2ff"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="#130c1b"
      >
        {partKey === 'capsule' && (
          <>
            <path d="M40 12 L58 44 H22 Z" />
            <rect x="22" y="44" width="36" height="32" />
            <path
              d="M38 19 L30 35 M54 48 V71"
              stroke={accent}
              strokeWidth="1.4"
            />
          </>
        )}
        {partKey === 'tank' && (
          <>
            <rect x="23" y="14" width="34" height="66" />
            <path
              d="M27 28 V48 M27 54 V72 M45 20 H53 M53 21 V32"
              stroke={accent}
              strokeWidth="1.5"
            />
          </>
        )}
        {partKey === 'engine' && (
          <>
            <path d="M24 18 H56 L68 56 H12 Z" />
            <path d="M28 56 L22 82 H58 L52 56 Z" />
            <path
              d="M52 24 L62 51 M32 61 L28 77 M48 61 L52 77"
              stroke={accent}
              strokeWidth="1.4"
            />
          </>
        )}
        {partKey === 'avionics' && (
          <>
            <rect x="18" y="24" width="44" height="46" />
            <path
              d="M18 35 H62 M18 59 H62"
              stroke={accent}
              strokeWidth="1.5"
            />
            <circle cx="27" cy="47" r="3" fill={accent} stroke="none" />
          </>
        )}
        {partKey === 'stabilizer' && (
          <>
            <rect x="31" y="20" width="18" height="58" />
            <path d="M31 36 L11 78 H31 Z" stroke={accent} />
            <path d="M49 36 L69 78 H49 Z" stroke={accent} />
          </>
        )}
        {partKey === 'fairing' && (
          <>
            <path d="M40 8 L64 78 H16 Z" />
            <path
              d="M40 8 V78"
              stroke={accent}
              strokeWidth="1.4"
              strokeDasharray="3 3"
            />
          </>
        )}
      </g>
      <rect x="20" y="45" width="40" height="15" fill="#09020a" opacity="0.88" />
      <text
        x="40"
        y="56"
        fontFamily="monospace"
        fontWeight="bold"
        fontSize="10.5"
        fill={accent}
        textAnchor="middle"
      >
        {code}
      </text>
    </svg>
  );
}
