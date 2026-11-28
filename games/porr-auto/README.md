# Põrr-auto

A driving game for ages 4–6. Tilt the tablet to steer a little car up a winding road to somewhere nice
(Grandma's, the playground, the beach, the castle…). Collect stars on the way, drive around cones, rocks and
snowmen, splash through puddles, jump off ramps, mind the ducks and cows crossing the road, and honk 📯 at a
slow car so it moves aside. Nothing ever ends the drive: bumping into things only slows the car down.
At the end, 1–3 big stars for how many stars were collected. 12 drives:

- **1–3** meadow: a straight road with stars, then curves, then cones
- **4** town: slow cars (📯 makes them pull over)
- **5** forest: rocks and a family of ducks crossing
- **6** beach by the sea: puddles and ramps (fly over a cone)
- **7** farm: cows crossing
- **8** snow: the car slides, snowmen go poof
- **9** desert: rocks, ramps, slow cars
- **10** night: dark, with headlights and street lamps
- **11** mountain: a narrower, winding road
- **12** the rainbow road to the castle

**∞ Endless drive**: one long road through all ten landscapes in turn (a sign by the road where a new one
begins; the ground fades over, the sea curves in and out, night falls and lifts), then round again. Each
landscape is a little faster, every round has more things on the road. A new road every time. 🏠 ends the
drive and shows the stars; the most stars in one drive is kept as the 🏆 record.

## Steering

- **Tilt**: `src/tilt.js` reads `deviceorientation`, turns beta/gamma into the "up" direction in the device's
  axes and measures how far the screen's right edge dips, whichever way the screen is turned (portrait, either
  landscape), from flat on a table to nearly upright. How the tablet is held when a drive starts counts as straight.
  About 18° of tilt is full steering. iOS Safari (and newer Chrome) ask first: the ▶ and level buttons call
  `DeviceOrientationEvent.requestPermission()` inside the tap. It needs HTTPS (GitHub Pages is fine, `file://` is not).
- **Finger**: hold a finger anywhere on the road and the car drives towards it.
- **Keys**: ← → (or A, D), space or H honks.

If the screen turns round while tilting hard, lock the rotation in the tablet's control centre.

## Commands

    npm install
    npm run dev        # http://localhost:5173 (add ?level=7 to open a level, &auto to let it drive itself;
                       # ?endless&auto&at=35000 starts the endless road further on)
    npm run build      # dist/, relative paths
    npm run check      # every road: stars reachable, always a way past, nothing on the road where animals cross;
                       # the endless road for three rounds with four seeds

## Files

    src/levels.js    the drives: theme, length, how curvy, what is on the road (`mix`), seed; ENDLESS landscapes
    src/track.js     builds a road from its plan (seeded, so the game and the check see the same road);
                     endless() builds the endless road a stretch at a time
    src/themes.js    ground and road colours, what grows by the roadside
    src/art.js       canvas drawings (cars, stars, cones, ducks, trees, houses, the places) and the side-view car (SVG)
    src/tilt.js      tilt steering
    src/main.js      screens, the drive (steering, bumping, jumping, honking), drawing each frame
    src/i18n.js      Estonian and English words
    src/sound.js     Web Audio beeps, honks, splashes and the engine hum (no sound files)

## Adding a drive

Add a plan to `LEVELS` in `src/levels.js` (`to` is one of the places in `PLACE` in `src/art.js`, `tip` a key in
`src/i18n.js`), then run `npm run check`. If a road comes out badly, try another `seed`.
