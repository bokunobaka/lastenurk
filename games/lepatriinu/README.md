# Lepatriinu labürint

A tilt maze for ages 4–6. The ladybug has lost her spots: tilt the tablet to roll her through a garden maze,
pick up every spot (each one goes back on her shell) and take her home to the flower, which opens once she has
them all. Nothing ever ends a level: falling into a hole only sends her back to the start, and she keeps her spots.
20 levels:

- **1–4** open garden, hedges, little mazes
- **5–6** holes
- **7** mushrooms (they bounce her off)
- **8–9** ice (slippery: she slides on)
- **10** honey (sticky: slow going)
- **11–12** flower buttons that open the wooden gate with the same colour flower
- **13–20** everything mixed; the last one has all seven spots, so she is a real seven-spot ladybug

## Steering

- **Tilt**: `src/tilt.js` reads `deviceorientation`, turns beta/gamma into the "up" direction in the device's axes
  and measures how far the screen's right edge and top edge dip, whichever way the screen is turned. How the tablet
  is held when a level starts counts as level ground (sideways up to 10°, towards the child up to 55°). About 16° is
  a full push. iOS Safari (and newer Chrome) ask first: the ▶ and level buttons call
  `DeviceOrientationEvent.requestPermission()` inside the tap. It needs HTTPS (GitHub Pages is fine, `file://` is not).
- **Finger**: hold a finger on the garden and she rolls towards it.
- **Keys**: arrow keys (or W A S D).

The map turns to fit the screen: on a tall screen a wide map is drawn mirrored on its diagonal, so every way
through stays the same. If the screen turns round while tilting, lock the rotation in the tablet's control centre.

## Commands

    npm install
    npm run dev        # http://localhost:5173 (add ?level=7 to open a level, &auto to let it play itself, &fast=4 to hurry)
    npm run build      # dist/, relative paths
    npm run check      # every map: a hedge all round, every spot and the flower reachable, every gate needed
                       # (--maps prints them, with unreachable path as ░)

## Files

    src/levels.js    the maps
    src/maze.js      reads a map, finds the ways through it (used by the game, its autopilot and the check)
    src/art.js       canvas drawings (garden, ladybug, spots, mushrooms, buttons, gates, the flower) and SVG pictures
    src/tilt.js      two-way tilt
    src/main.js      screens, rolling and bumping, holes, buttons, the flower, drawing each frame
    src/i18n.js      Estonian and English words
    src/sound.js     Web Audio knocks, boings, plinks and the rolling rumble (no sound files)

## Adding a level

Add a map to `LEVELS` in `src/levels.js` (at most 13 x 9, letters explained in `src/maze.js`, `tip` a key in
`src/i18n.js`), then run `npm run check`.
