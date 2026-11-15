# Technical documentation

## Stack and entry point

The application is a React 19 single-page app built and served by Vite 6. It uses plain JavaScript modules and CSS; there is no backend or runtime data service.

`index.html` supplies the root element and loads `src/main.jsx`. The entry point mounts `App` inside React `StrictMode` and imports the global stylesheet from `src/styles/index.css`.

## Runtime architecture

`src/App.jsx` owns application state and coordinates the screens and major interactions. Its `screen` state switches between the start menu, mission dashboard, and closed/power-down view. The dashboard composes three columns:

- `MissionBriefing` presents mission targets and constraints.
- `BuildColumn` composes `PadStatus`, `FlightScene`, and `AssemblyBay`.
- `TelemetryColumn` displays derived metrics, the event log, and launch/reset actions.

The start menu, NASA codex, mission-success, and logout dialogs are separate components. Components receive state and callbacks through props; calculations and mission definitions are kept outside the view layer.

## Source map

| Path | Responsibility |
| --- | --- |
| `src/App.jsx` | Screen selection, mission/build/campaign state, event handlers, persistence, and component composition. |
| `src/components/` | Start menu, mission/dashboard panels, part cards and inspector, SVG rocket and flight scene, plus codex and campaign dialogs. |
| `src/data/missions.js` | Five static mission objectives, constraints, analogs, and completion grants. |
| `src/data/parts.js` | Part specifications, catalog order, and Auto-Fit configuration. |
| `src/data/flightStages.js` | Flight duration, world travel distance, and stage labels. |
| `src/data/nasaResources.js` | Static codex tables, principles, and outbound resource links. |
| `src/hooks/useFlightAnimation.js` | `requestAnimationFrame`-based flight progress, stage, altitude, and camera state. |
| `src/utils/rocketStats.js` | Part pricing/preparation modifiers, build metrics, and launch validation. |
| `src/utils/format.js` | Currency and number formatting. |
| `src/styles/index.css` | Visual system, layout, and responsive styling. |
| `assets/rocket-parts/` | SVG artwork for payload, tank, and thruster visuals. |

## State and persistence

React state in `App` tracks:

- Current screen and mission index.
- Installed and surplus part keys (`Set` values).
- Launch status and telemetry text.
- Flight animation state, managed by `useFlightAnimation`.
- Campaign completion indexes, delivered cargo, rescues, and reserve.
- Visibility state for the codex and campaign dialogs.

The `capricorn_campaign_v1` local-storage record contains the callsign and campaign totals/completed mission indexes. The app reads it during initialization and saves it when the callsign or campaign changes. Mission selection, assembly configuration, launch state, and telemetry are not persisted.

## Build metrics and launch gate

`computeRocketStats` sums the installed parts' mass, cost, and preparation values. It adds a fixed 13,050 kg structural mass. Surplus parts use a 0.55 cost multiplier and a 0.5 preparation multiplier. Reliability is a display estimate of `max(70, 96 - 3 × surplus part count)`.

The propulsion figures are intentionally game rules, not a full rocket-equation simulation: with both engine and tank installed, delta-V is fixed at 9,600 m/s; with only the engine it is 2,800 m/s; otherwise it is zero. TWR is computed as 540,000 N divided by modeled mass times 9.81 m/s² when the engine is installed.

`validateLaunch` checks for a capsule, both propulsion parts, budget not exceeded, preparation within the deadline, TWR of at least 1.2, and delta-V meeting the mission target. Failed checks are joined into the telemetry log. It does not check every displayed mission field independently; for example, cargo and target altitude are briefing values rather than direct launch-gate inputs.

## Flight animation and mission completion

`playFlight` advances progress over 16 seconds with `requestAnimationFrame`. Progress maps to four named stages and changes the rendered scene's camera offset and rocket transform. When the animation completes, `App` records a mission if it has not already been completed, updates campaign totals, and opens the success dialog. The animation is a visual sequence; it does not calculate an actual trajectory or simulate vehicle dynamics.

## Development commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Known limitations

- The game uses static data and local browser storage; there is no account, server, or cross-device campaign sync.
- Vehicle performance uses fixed values and simplified assumptions. The Tsiolkovsky equation shown in the codex is a separate reference calculation and does not drive the launch-gate delta-V.
- Mission analogs and resource data are curated display content, not live API responses. Verify external references independently before using them for real engineering decisions.
