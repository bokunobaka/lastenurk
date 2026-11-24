# Robot Piiks

A puzzle game for ages 4–6: put arrow cards in a row, press ▶, and the little robot Piiks
drives them step by step to its battery, picking up stars on the way. It teaches planning ahead
(the first steps of programming). 30 levels: one direction, then turns, things in the way,
cards that do 2 or 3 steps (tap a placed card), and mixed in along the way:

- **moving belts** carry Piiks along for free (levels with few card slots need them),
- **magic pads** in pairs (same colour): drive onto one, come out of the other,
- a **key** that opens the **gate**.

- 💡 points at the next thing to do (a card to add, a card to tap, ⌫, or ▶), worked out by a solver.
- No reading needed; the short texts are for the grown-up. Estonian and English (`?lang=en`, or the landing page choice).
- Progress is saved in the browser. Works offline once loaded (service worker).

## Commands

    npm install
    npm run dev        # http://localhost:5173 (add ?level=12 to open a level directly)
    npm run build      # dist/, relative paths
    npm run check      # every level solvable, with every star, within its card slots;
                       # belts, pads and keys on a level must be needed
    node tools/find-levels.mjs '{"w":6,"h":5,"belts":2,"pads":1,"key":1,"stars":2,"repeat":true,"cards":[6,9]}'
                       # suggests layouts for a new level (every belt, pad and key needed)

## Files

    src/art.js       all drawings as SVG strings (robot, tiles, cards) in the books' flat pastel style
    src/levels.js    level maps, the rules (simulate) and the solver (plan) used for slots and hints
    src/main.js      screens, cards, driving animation, hints
    src/i18n.js      Estonian and English words
    src/sound.js     Web Audio beeps (no sound files)

## Adding a level

Add a map to `LEVELS` in `src/levels.js` (letters are explained at the top: `> < ^ v` belts,
`1`/`2` pad pairs, `K` key, `D` gate), then run `npm run check`.
The number of slots is the fewest cards that collect every star, plus `slack`.
