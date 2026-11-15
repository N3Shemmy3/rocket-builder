export const NASA_DELTA_V_MAP = [
  {
    leg: 'Earth Surface → LEO (400 km)',
    deltaV: '9,300 – 9,800 m/s',
    twr: '≥ 1.20',
    notes: 'Includes ~1,500 m/s gravity + atmospheric drag losses (NASA LSP)',
  },
  {
    leg: 'LEO → Sun-Synchronous (700 km)',
    deltaV: '9,700 – 10,100 m/s',
    twr: '≥ 1.20',
    notes: 'Polar inclination (98°) forfeits Earth rotational boost (~460 m/s)',
  },
  {
    leg: 'LEO → Geostationary Transfer (GTO)',
    deltaV: '+2,440 m/s (from LEO)',
    twr: '0.50 (Upper Stage)',
    notes: 'Perigee burn at 185 km raising apogee to 35,786 km',
  },
  {
    leg: 'LEO → Trans-Lunar Injection (TLI)',
    deltaV: '+3,150 m/s (from LEO)',
    twr: '0.40 – 0.80',
    notes: 'Artemis / Apollo trajectory via JPL Horizons ephemeris',
  },
  {
    leg: 'TLI → Low Lunar Orbit (LLO 100 km)',
    deltaV: '+820 m/s (LOI Burn)',
    twr: '0.30 (In-Space)',
    notes: 'Lunar Orbit Insertion capture burn at perilune',
  },
];

export const NASA_VEHICLES = [
  {
    vehicle: 'SLS Block 1',
    program: 'NASA Artemis (MPCV)',
    leoPayload: '95,000 kg',
    tliPayload: '27,000 kg',
    thrust: '39,144 kN',
    wetMass: '2,608,000 kg',
  },
  {
    vehicle: 'Falcon 9 Block 5',
    program: 'NASA CRS-2 / CCP',
    leoPayload: '22,800 kg',
    tliPayload: '4,020 kg',
    thrust: '7,607 kN',
    wetMass: '549,054 kg',
  },
  {
    vehicle: 'Vulcan Centaur VC2',
    program: 'NASA LSP / CLPS',
    leoPayload: '19,000 kg',
    tliPayload: '6,300 kg',
    thrust: '10,700 kN',
    wetMass: '546,700 kg',
  },
  {
    vehicle: 'Atlas V 551',
    program: 'NASA Science / New Horizons',
    leoPayload: '18,850 kg',
    tliPayload: '5,700 kg',
    thrust: '12,100 kN',
    wetMass: '590,000 kg',
  },
  {
    vehicle: 'Orion MPCV + ESM',
    program: 'Artemis Deep-Space Crew',
    leoPayload: '26,520 kg (Stacked)',
    tliPayload: '4 Crew / 21d',
    thrust: '26.7 kN (OMS)',
    wetMass: '26,520 kg',
  },
];

export const NASA_SE_PRINCIPLES = [
  {
    title: 'Mass Fraction & Tsiolkovsky Scaling',
    reference: 'NASA SP-2016-6105 §3.1',
    summary:
      'Every extra kilogram of structural dry mass or fairing weight exponentially increases required propellant mass for a given orbital delta-V.',
  },
  {
    title: 'Thrust-to-Weight Ratio (TWR) & Gravity Losses',
    reference: 'NASA LSP Launch Vehicle Performance',
    summary:
      'A liftoff TWR below 1.20 wastes propellant fighting Earth gravity during vertical ascent; TWR between 1.25 and 1.60 balances structural loads and gravity loss.',
  },
  {
    title: 'Flight-Proven (Surplus) vs. Factory-New',
    reference: 'NASA Flight Hardware Heritage Policy',
    summary:
      'Reusing flight-proven boosters and surplus cores slashes unit cost by ~45% and pad turnaround time by 50%, at a small margin trade-off in inspection reliability.',
  },
  {
    title: 'Launch Window & Pad Processing Constraints',
    reference: 'JPL Horizons & KSC Operations',
    summary:
      'Orbital rendezvous and lunar transfer windows open at fixed orbital alignments. Exceeding pad integration prep days forfeits the launch window.',
  },
];

export const SPACE_APPS_RESOURCES = [
  {
    title: 'Space Apps 2026: Space Mission Design Game Resources',
    category: 'Official Challenge Hub',
    url: 'https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/?tab=resources',
    summary:
      'Official NASA Space Apps Challenge resource tab for mission constraints, trade-off frameworks, and engineering datasets.',
  },
  {
    title: 'NASA Open Data Portal (data.nasa.gov)',
    category: 'Datasets & Catalogs',
    url: 'https://data.nasa.gov/',
    summary:
      'Public catalog of NASA spacecraft specifications, ISS operations logs, planetary science archives, and mission records.',
  },
  {
    title: 'JPL Horizons Solar System Dynamics',
    category: 'Ephemerides & Trajectories',
    url: 'https://ssd.jpl.nasa.gov/horizons/',
    summary:
      'High-precision orbital mechanics and trajectory vectors between Earth, LEO, the Moon, and deep-space targets.',
  },
  {
    title: 'NASA Launch Services Program (LSP) Performance',
    category: 'Launch Vehicles',
    url: 'https://elvperf.ksc.nasa.gov/',
    summary:
      'Interactive launch vehicle payload capacity curves across target orbit altitudes and inclinations.',
  },
  {
    title: 'NASA Space Science Data Coordinated Archive (NSSDCA)',
    category: 'Mission Heritage',
    url: 'https://nssdc.gsfc.nasa.gov/',
    summary:
      'Historical spacecraft mass budgets, scientific instrument specs, and planetary mission summaries.',
  },
];
