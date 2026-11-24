# Rong Tuut

A track puzzle for ages 4–6: tap the track pieces to turn them until the track runs from the
start station to the goal, then press ▶. The little train drives as far as the track goes and
picks up the animal friends waiting by the track. 22 levels that bring in one new piece at a time
from the start (curves, bridges over water, tunnels through hills, switches where a tap sends the
train the other way, crossings, double curves) and then mix them on bigger, busier boards.

- Track already joined to the start station turns yellow, so the child sees how far it reaches.
- 💡 points at the first piece on the way that is turned wrong, or at ▶ when the track is ready.
- No reading needed; the short texts are for the grown-up. Estonian and English (`?lang=en`, or the landing page choice).
- Progress is saved in the browser. Works offline once loaded (service worker).

## Commands

    npm install
    npm run dev        # http://localhost:5173 (add ?level=12 to open a level directly)
    npm run build      # dist/, relative paths
    npm run check      # every level: stations join the track, solvable, every animal is on the route
    node tools/generate-levels.mjs   # rebuild LEVELS in src/levels.js from the plan in that file

## Files

    src/art.js       all drawings as SVG strings (track, stations, train, animals) in the books' flat pastel style
    src/levels.js    level maps (drawn solved), the scramble, and the track rules (route, wrongPiece)
    src/main.js      screens, turning pieces, the train ride, hints
    src/i18n.js      Estonian and English words
    src/sound.js     Web Audio sounds (no sound files)

## Changing the levels

The levels are made by `tools/generate-levels.mjs` from its `PLAN` (board size, route length, and how
many bridges, tunnels, switches, crossings, double curves, spare pieces and animals each level has).
Edit the plan and rerun it, then `npm run check`. A map can also be tweaked by hand: it is drawn SOLVED in `LEVELS` in `src/levels.js` with the characters explained at the top
(light lines can be turned, heavy lines stay put; `=` `‖` bridges, `h` `v` tunnels, `Q` `q` double
curves, `Y` switches with an entry in `switches`), list the track tiles where animals wait in
`riders`, then run `npm run check`.
