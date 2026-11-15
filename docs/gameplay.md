# Gameplay and missions

## Mission loop

1. Choose **Enter Mission Control** from the start menu. Use the previous/next controls to browse the campaign's five missions.
2. Read the mission directive and contract limits: payload, cargo, target orbit, delta-V, budget, and preparation deadline.
3. Configure the vehicle in the assembly bay. Click a part card to install or remove it; use its surplus control to mark it as flight-proven hardware. Inspect a part for its specifications.
4. Check the telemetry panel. **Auto-Fit Valid Build** installs the preset full-parts configuration and marks the capsule, tank, and engine as surplus. It is a useful starting point, but it does not satisfy every mission (the game model's 9,600 m/s delta-V falls short of some contracts). **Reset Build** returns to the capsule-only starting state.
5. Select **Launch Deck**. Any failed checks are reported in the telemetry log. A valid build plays the flight animation and completes the mission.

Mission completion records the mission once, adds its funding grant to the reserve, and updates cargo or rescue totals. The success dialog can advance to the next mission, stay on the pad, open the codex, or complete the debrief.

## Campaign missions

| ID | Mission | Objective |
| --- | --- | --- |
| OP-01 | ISS Life-Support Drop | Deliver supplies to a low-Earth-orbit station. |
| OP-02 | Lunar Relay Delivery | Deploy a communications package on a lunar-transfer mission. |
| OP-03 | Atmospheric Observer | Deliver a science payload to a sun-synchronous orbit. |
| OP-04 | Emergency Crew Return | Rescue a stranded crew during a short preparation window. |
| OP-05 | Frontier Outpost Supply | Deliver heavy cargo to a high-energy orbit. |

These are game scenarios, not actual scheduled missions. Their descriptions and contract values are defined in `src/data/missions.js`.

## Parts and trade-offs

The catalog contains a supply capsule, fuel tank, engine, flight computer, stabilizer, and fairing. Each part has bundled values for cost, preparation time, and mass; the tank and engine also contribute to the game's propulsion model. Toggle surplus on a part to reduce its modeled cost by 45% and preparation time by 50%. Surplus part count also affects the displayed reliability estimate.

The dashboard tracks:

- **Budget** — total installed-part cost against the mission cap.
- **Prep time** — total part preparation against the launch deadline.
- **Launch TWR** — modeled thrust divided by the vehicle's modeled weight.
- **Delta-V** — the game's simplified vehicle capability compared with the mission requirement.
- **Reliability and wet mass** — summary values for the active build.

## Campaign and navigation

Campaign completion, delivered cargo, rescued astronauts, reserve funds, and callsign are saved in local storage. The current mission selection and rocket configuration are temporary and reset when navigating between missions or reloading the app. **New Campaign** clears the saved campaign totals.
