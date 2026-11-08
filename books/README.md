# Printsess Frida päev

An illustrated, animated picture book in Estonian for a 5-year-old: a whole day with Princess Frida, her friends and their magic dragon. It comes in two forms, built from one source:
- an **interactive web book** (`web/index.html`)
- an **MP4 video** with narration (`out/printsess-frida.mp4`)

Both come in two styles:
- **v1:** a classic picture book (`web/index.html`, `npm run video`)
- **v2:** a motion-graphics version (`web/v2.html`, `node tools/record-video.mjs --v2` → `out/printsess-frida-v2.mp4`). It adds:
  - a camera pan or zoom on every page
  - iris, star, wipe and push transitions
  - animated chapter cards (Hommik, Mängime!, Lõunaaeg, Võlulohe, Õhtu)
  - words that pop in, plus comic stickers for sound words
  - ambient particles and a crown progress bar

  The v2 tuning (camera paths, particles, stickers) lives in `web/motion.js` and `web/motion.css`. Chapters are set in `web/story.js`.

## Three books

| Book | Open | Story text |
|---|---|---|
| **Printsess Frida päev** | `web/index.html` (v1), `web/v2.html` (motion graphics) | `web/story.js` |
| **Väikese Rexi päev** (dinosaurs) | `web/dino.html` (motion graphics) | `web/dino-story.js`, `web/dino-scenes.js` |
| **Printsess Frida loomaaias** (the zoo) | `web/zoo.html` (motion graphics) | `web/zoo-story.js`, `web/zoo-scenes.js` |

The tools take `--dino` for the dinosaur book: `npm run narrate -- --dino`, `node tools/record-video.mjs --dino`, `node tools/screenshots.mjs --dino`.
The dinosaur book keeps its media and narration in `web/dino/media/` and `web/dino/audio/`; the zoo book in `web/zoo/`.
`node tools/screenshots.mjs --zoo` checks the zoo book.

## Folders

| Path | What |
|---|---|
| `web/story.js` | The Estonian story text (one entry per page). **Edit text here.** |
| `web/scenes.js` | Animated SVG drawings for every page, and the character colours |
| `web/motion.js`, `web/motion.css`, `web/v2.html` | v2 motion-graphics layer |
| `web/media/` | Put AI art here as `pNN.png` / `pNN.jpg` / `pNN.mp4`. It replaces that page's drawing |
| `web/audio/` | Narration as `pNN.wav` / `pNN.mp3` (Neurokõne or your own voice) |
| `story/lugu.md` | Story with English translation |
| `art/characters.md` | Character bible plus character-sheet prompts |
| `art/scenes.md` | Image and motion prompts for every page |
| `tools/` | Narration, video and screenshot scripts |

Page numbers: `p00` = cover … `p23` = "Lõpp" (see `story/lugu.md`).

## English

Both books can be read in English: the **EN/ET** button in the book, `?lang=en`, or the language switch on
the landing page (saved in `localStorage` as `lastenurk.lang`). English text is the `en` field of each page in
`web/story.js` / `web/dino-story.js`; chapter titles have `en`, and sticker words are translated in `STICKER_EN`
(`web/motion.js`). English is read by the device's English voice (recorded narration is Estonian only).
Videos and the narration tool always use Estonian.

## Web book

Open `web/index.html` in a browser (double-click works; no server needed).
- Swipe or use ◀ ▶▶ (or the arrow keys) to turn pages
- 🔊 reads the page aloud; ▶ reads the whole book, turning pages automatically
- Tap the picture to get sparkles

The narration uses `web/audio/pNN.*` when present. Otherwise it uses the browser's Estonian voice, if the device has one.

To share it, upload the `web/` folder to any static host (Netlify Drop, GitHub Pages, Cloudflare Pages).

## Setup (once)

```bash
npm install
npx playwright install chromium
```

## Narration (Neurokõne, University of Tartu)

```bash
npm run narrate                                   # voice "mari"
node tools/narrate.mjs --speaker liivika --force  # try another voice; --force overwrites
```
Voices: albert, indrek, kalev, kylli, lee, liivika, luukas, mari, meelis, peeter, tambet, vesta.
Or record your own voice: `web/audio/p01.mp3`, etc.

## Video

```bash
npm run video                                     # 1080p30 -> out/printsess-frida.mp4
node tools/record-video.mjs --music lullaby.mp3   # quiet background music
node tools/record-video.mjs --preview --fps 12    # quick low-res test
```
Each page lasts as long as its narration plus 2 s. Frames are rendered one at a time, so the sound stays in sync.

## Upgrading to AI illustrations

1. Make the character sheets (`art/characters.md`).
2. Generate each scene and animate it (`art/scenes.md`).
3. Drop the files into `web/media/` and run `npm run video` again.

`npm run shots` saves a screenshot of every page to `out/shots/`, for a quick check.

## Sharing

`npm run bundle` builds one self-contained HTML file per book (v2 motion version):
`dist/printsess-frida.html`, `dist/rexi-paev.html` and `dist/frida-loomaaias.html`. Scripts, styles, the Baloo 2 font and any
files in `media/` / `audio/` are inlined, so the file works offline: send it by email or chat,
put it on a drive, or upload it to any static host. Re-run after adding narration or art.
