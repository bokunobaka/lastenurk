# Konn Krooks

An adding and taking-away game for ages 4–6. Lily pads with the numbers 0–10 (later 0–20) float in
a row; Krooks the frog sits on one and a fly buzzes over another. Tap a card like **+3** or **−2**
(each card also shows its number as dots) and the frog jumps that many pads forward or back, while
the pads it passes pop up a count: 1, 2, 3. The sum builds up under the pond: `2 + 3 − 1 = 4`.
Land exactly on the fly and the frog catches it. 25 levels:

- **1–4** one plus card, from 0; **5–7** the frog starts further along (count on);
- **8–11** minus cards (the fly is behind); **12–14** two cards; **15–17** plus and minus together;
- **18–20** missing lily pads: landing in the water is a splash, so the order of the cards matters;
- **21–25** pads up to 20, jumping over the ten. On narrow screens the view follows the frog,
  and an arrow at the edge shows where the fly is.

- ↺ takes back the last jump. A card that would jump off the row is refused.
- 💡 points at the first card of the shortest way from where the frog is, or at ↺ when the fly
  can no longer be reached. On the first level the hand shows until the child taps.
- No reading needed; the short texts are for the grown-up. Estonian and English (`?lang=en`, or the landing page choice).
- Progress is saved in the browser. Works offline once loaded (service worker).

## Commands

    npm install
    npm run dev        # http://localhost:5173 (add ?level=12 to open a level directly)
    npm run build      # dist/, relative paths
    npm run check      # every level can be solved; prints the shortest sum for each;
                       # on levels with gaps some order of those cards must splash

## Files

    src/levels.js    the levels, the jump rule, the solver (for hints and the check) and the sum text
    src/art.js       frog, fly, lily pads, pond and cards as SVG strings
    src/main.js      screens, jumping and counting, the following view, hints
    src/i18n.js      Estonian and English words
    src/sound.js     Web Audio beeps (no sound files)

## Adding a level

Add `{ N, start, fly, cards, gaps }` to `LEVELS` in `src/levels.js` and run `npm run check`.
