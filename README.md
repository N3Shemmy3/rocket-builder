# Capricorn — React Mission Control Dashboard

A React + Vite implementation of the **NASA: Capricorn** rocket assembly and launch dashboard.

## Getting Started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Project Structure

- `index.html`: Vite HTML entry point
- `src/main.jsx`: React root mount
- `src/App.jsx`: Top-level mission, assembly, telemetry, and flight state orchestration
- `src/data/`: Static game definitions (`missions.js`, `parts.js`, `flightStages.js`)
- `src/utils/`: Formatting and pure rocket performance / launch validation helpers (`format.js`, `rocketStats.js`)
- `src/hooks/`: `useFlightAnimation.js` (`requestAnimationFrame` 16-second vertical flight camera loop)
- `src/components/`:
  - `TopBar.jsx`: Campaign progress header and mission navigation / auto-fit actions
  - `MissionBriefing.jsx`: Mission directive, category, description, and contract constraints
  - `BuildColumn.jsx`: Rocket assembly column layout
  - `PadStatus.jsx`: Pad readiness, wet mass, stage count, and surplus count
  - `FlightScene.jsx`: Continuous 600 × 2480 vertical SVG world, HUD, launch flame, and progress bar
  - `RocketSvg.jsx`: Procedural modular SVG rocket blueprint
  - `AssemblyBay.jsx`: Persistent 6-part catalog grid and floating inspector state
  - `PartCard.jsx` & `PartMiniSvg.jsx`: Individual part card with install and NEW/SURPLUS procurement toggles
  - `PartInspector.jsx`: Hover/focus-only viewport-clamped part details tooltip
  - `TelemetryColumn.jsx`: Budget, prep, TWR, and delta-V meters, summary, live telemetry log, and Launch/Reset buttons
- `src/styles/index.css`: Layout, theme tokens, and responsive rules
