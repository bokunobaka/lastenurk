# Näljased kastid

A sorting game for ages 4–6. Things ride along a conveyor belt; below wait hungry boxes, and each
box eats only one kind of thing, shown on its label. Drag each thing into the box that eats it:
the right box munches it, a wrong box spits it back onto the belt. Things that ride off the end of
the belt come back round through the pipe, so nothing is ever lost. 22 levels:

- **1–4** colours (2, 3, then 4 boxes; the boxes are their colour)
- **5–7** animals or vehicles; land, water or air (animals, then vehicles too)
- **8–9** big or small (then with mixed colours, which do not matter)
- **10–12** cookie shapes: circle, triangle, square, star (the icing colour does not matter)
- **13–14** ladybirds with 1, 2 or 3 spots
- **15–16** two rules at once: colour and shape, colour and size
- **17–19** mystery: a box shows only two things it already ate; work out what it eats
- **20–22** rubbish into the Estonian bins: food scraps (brown), paper (blue), packaging (yellow), glass (green)

- 💡 stops the belt and shows a hand carrying the thing furthest along to its box (the box glows).
  On the first level the hand comes by itself when the child waits.
- No reading needed; the short texts are for the grown-up. Estonian and English (`?lang=en`, or the landing page choice).
- Progress is saved in the browser. Works offline once loaded (service worker).

## Commands

    npm install
    npm run dev        # http://localhost:5173 (add ?level=12 to open a level directly)
    npm run build      # dist/, relative paths
    npm run check      # every thing fits exactly one box, every box gets something,
                       # a mystery box's examples point to one rule only

## Files

    src/levels.js    what each thing is (KINDS), the levels and the rule that picks a box
    src/art.js       the things, the box creatures and their labels, the belt, as SVG strings
    src/main.js      screens, belt, dragging, munching and spitting, hints
    src/i18n.js      Estonian and English words
    src/sound.js     Web Audio beeps (no sound files)

## Adding a level

Add `{ rule, boxes, items }` to `LEVELS` in `src/levels.js` (things are written like
`"ball:red"`, `"dog:small"`, `"cookie:tri:pink"`, `"ladybug:2"`), then run `npm run check`.
A new kind of thing needs an entry in `KINDS` and a drawing in `THINGS` in `src/art.js`.
