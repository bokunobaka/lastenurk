# Robot Piiks

A puzzle game for ages 4–6: put arrow cards in a row, press ▶, and the little robot Piiks
drives them step by step to its battery, picking up stars on the way. It teaches planning ahead
(the first steps of programming). 20 levels: one direction, then turns, things in the way,
and from level 11 cards that do 2 or 3 steps (tap a placed card).

- 💡 points at the next thing to do (a card to add, a card to tap, ⌫, or ▶), worked out by a solver.
- No reading needed; the short texts are for the grown-up. Estonian and English (`?lang=en`, or the landing page choice).
- Progress is saved in the browser. Works offline once loaded (service worker).

## Commands

    npm install
    npm run dev        # http://localhost:5173 (add ?level=12 to open a level directly)
    npm run build      # dist/, relative paths
    npm run check      # every level solvable, with every star, within its card slots

## Files

    src/art.js       all drawings as SVG strings (robot, tiles, cards) in the books' flat pastel style
    src/levels.js    level maps, the rules (simulate) and the solver (plan) used for slots and hints
    src/main.js      screens, cards, driving animation, hints
    src/i18n.js      Estonian and English words
    src/sound.js     Web Audio beeps (no sound files)

## Adding a level

Add a map to `LEVELS` in `src/levels.js` (letters are explained at the top), then run `npm run check`.
The number of slots is the fewest cards that collect every star, plus `slack`.
