const PART_COLORS = {
  capsule: '#b86af1',
  tank: '#d1d0de',
  engine: '#6acbbd',
  avionics: '#e7bc7c',
  stabilizer: '#b482d8',
  fairing: '#7788b6',
};

export function PartMiniSvg({ partKey, code }) {
  const fill = PART_COLORS[partKey];

  return (
    <svg viewBox="0 0 80 100" aria-hidden="true">
      <g stroke="#9d90a5" strokeWidth="2" fill={fill}>
        {partKey === 'capsule' && <path d="M40 10L60 43V80H20V43Z" />}
        {partKey === 'engine' && <path d="M22 18H58V55L70 88H10L22 55Z" />}
        {partKey === 'stabilizer' && (
          <path d="M29 18H51V80H12L29 40ZM51 40L68 80H51Z" />
        )}
        {partKey === 'fairing' && <path d="M40 5L66 78H14Z" />}
        {partKey !== 'capsule' &&
          partKey !== 'engine' &&
          partKey !== 'stabilizer' &&
          partKey !== 'fairing' && <rect x="20" y="15" width="40" height="70" />}
      </g>
      <text
        x="40"
        y="60"
        fontFamily="monospace"
        fontWeight="bold"
        fontSize="11"
        fill="#110b18"
        textAnchor="middle"
      >
        {code}
      </text>
    </svg>
  );
}
