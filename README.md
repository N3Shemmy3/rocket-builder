# Capricorn — Vanilla JavaScript Dashboard

A framework-free recreation of the user-supplied 271×153 SVG mockup as an editable, responsive web interface.

## Open

Open `index.html` in a modern browser. No npm, dependencies, bundler, or server required.

## Files

- `index.html`: structure and accessible controls
- `styles.css`: layout, colors, and responsive styling
- `app.js`: mission data, procedural SVG rocket, interaction and sample launch rules

## Features

- Five navigable missions with changing briefing information
- Six always-visible rocket parts in a persistent grid; click to install/remove, toggle factory-new/surplus, and hover or keyboard-focus for a floating details tooltip
- Procedurally drawn SVG rocket (not a raster image)
- Automatic build preset and budget/prep/telemetry indicators
- Launch checks, sample mission completion, reset

This is an interactive frontend prototype. The game physics and mission stats are illustrative values, not a full flight simulation. The original mockup's blurred rocket sprites were replaced with crisp geometric SVG components.


## Animated launch scenery

The rocket preview now uses four SVG scenery layers: launch site, sky, upper atmosphere/space, and Moon. A valid launch triggers a 16-second transition through these environments, showing flight progress and a fictional altitude readout. Background artwork is drawn with simple SVG geometry directly in `index.html` and is editable. Part cards remain always visible and their detail tooltip still only appears on hover/focus. This is a visual flight sequence, not a physically modeled trajectory.

## Non-overlapping layout
The rocket has a dedicated flight viewport. Pad metrics appear above it, and the six-part catalog appears below it. The rocket cannot draw into the controls or catalog, including on mobile-sized viewports. Part details are still shown only on hover/focus.

## Continuous vertical flight world
All four scenery regions live in one 600 × 2480 SVG canvas, arranged vertically (Moon at the top, then space, sky, and launch site at the bottom). During flight, the `viewBox` camera smoothly moves upward, giving a continuous ascent without fading between scenes. The rocket stays fixed within its dedicated viewport and does not overlap the UI.
