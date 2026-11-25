# Kujundipusle

A shape puzzle for ages 4–6: drag triangles, circles, squares and half circles from the tray onto
a shadow until the picture is whole. Then the picture comes alive: the rocket flies, the fish swims,
the boat rocks on the waves, the pinwheel spins. It trains seeing shapes, sizes and turns.
19 pictures:

- **1–5:** the pieces already face the right way and every place is outlined.
- **6–12:** pieces start turned; a **tap turns** a piece a quarter turn. A piece dropped on its
  place the wrong way waits there with a ↻ sign and clicks in once turned right.
- **13–19:** no outlines, only the whole shadow. From 16 there is **one extra piece** that fits nowhere.

- 💡 shows a hand dragging the next piece to its glowing place (or points at a piece to turn).
  On the first picture the hand keeps showing until the child has a go.
- No reading needed; the short texts are for the grown-up. Estonian and English (`?lang=en`, or the landing page choice).
- Progress is saved in the browser. Works offline once loaded (service worker).

## Commands

    npm install
    npm run dev        # http://localhost:5173 (add ?level=12 to open a picture directly)
    npm run build      # dist/, relative paths
    npm run check      # every picture: pieces on the board, no overlaps, all touching,
                       # turning levels need turning, extra pieces fit nowhere
    npm run gallery    # draws every picture (shadow + finished) into gallery.png

## Files

    src/shapes.js    the shapes, quarter turns, and the outline key that decides what fits where
    src/levels.js    the pictures: [shape, w, h, x, y, turn, colour] per piece
    src/art.js       colours, pieces, shadow, and the details each finished picture gets
    src/main.js      screens, tray layout, dragging and tapping, hints, the finished picture
    src/i18n.js      Estonian and English words
    src/sound.js     Web Audio beeps (no sound files)

## Adding a picture

Add an entry to `LEVELS` in `src/levels.js`, give it details in `DETAILS` in `src/art.js`
(board px: 1 grid unit = 100 px) and a name `pic.<id>` in `src/i18n.js`. Run `npm run check`
and `npm run gallery` to see it.
