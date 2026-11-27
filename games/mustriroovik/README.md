# Mustriröövik

A pattern game for ages 4–6. A caterpillar's body is a pattern (red, blue, red, blue…), but some
segments are missing. Drag the right segment from the leaf into each gap, or tap a segment on the leaf
and it hops into the first gap. A wrong one does not fit and hops back. Tapping the caterpillar's head
makes it sing its pattern: every kind of segment has its own note, so a pattern is also a little tune.
25 levels:

- **1–8** colours: AB with the tail missing, then gaps in the middle, ABC, AAB, ABB, AABB, three gaps
- **9–16** one-colour caterpillars: pictures (star, heart; circle, triangle, square), big and small,
  dots (1–2, 1–2–3), arrows (up–down, then turning round)
- **17–18** two things change at once: colour and picture, colour and size
- **19–21** growing patterns: one more dot each time, more and more blue ones, counting backwards
- **22–25** one segment is wrong: find it and tap it away, then fill the gap (last ones also have a gap)

- 💡 lights up the pattern's repeats in turns and a hand carries the right piece to the first gap
  (or taps the wrong segment). On the first level the hand comes by itself when the child waits.
- Tall screens get a caterpillar that bends down in rows; wide screens one long row.
- No reading needed; the short texts are for the grown-up. Estonian and English (`?lang=en`, or the landing page choice).
- Progress is saved in the browser. Works offline once loaded (service worker).

## Commands

    npm install
    npm run dev        # http://localhost:5173 (add ?level=12 to open a level directly)
    npm run build      # dist/, relative paths
    npm run check      # every answer is on the leaf, and on repeating levels the gaps follow
                       # from what shows (the shortest repeat that fits is the level's unit)

## Files

    src/levels.js    the levels; how a segment is written ("red", "blue star", "small", "3", "up")
    src/art.js       the caterpillar, its segments, the twig and leaf, the butterfly, as SVG strings
    src/main.js      screens, layout, dragging and tapping, singing, hints
    src/i18n.js      Estonian and English words
    src/sound.js     Web Audio beeps and notes (no sound files)

## Adding a level

Add `{ unit, len, gaps }` (or `{ seq, grow: true, gaps }` for a growing pattern) to `LEVELS` in
`src/levels.js`, optionally with `wrong: [index, segment]`, `extra` choices and a `tip` from `src/i18n.js`,
then run `npm run check`.
