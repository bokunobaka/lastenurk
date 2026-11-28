# Lastenurk

Estonian picture books and games for ages 4–6, all in one place.

**Open it:** https://bokunobaka.github.io/lastenurk/

| | What | Source | Live |
|---|---|---|---|
| 📖 | **Printsess Frida päev**: picture book, 24 pages, motion graphics, read-aloud | `books/` | [/books/printsess-frida/](https://bokunobaka.github.io/lastenurk/books/printsess-frida/) |
| 📖 | **Väikese Rexi päev**: dinosaur picture book, 24 pages | `books/` | [/books/rexi-paev/](https://bokunobaka.github.io/lastenurk/books/rexi-paev/) |
| 📖 | **Printsess Frida loomaaias**: Frida's family day at the zoo, 21 pages | `books/` | [/books/frida-loomaaias/](https://bokunobaka.github.io/lastenurk/books/frida-loomaaias/) |
| 📖 | **Printsess Frida rannas**: a day at the beach, 16 pages | `books/` | [/books/frida-rannas/](https://bokunobaka.github.io/lastenurk/books/frida-rannas/) |
| 📖 | **Printsess Frida lõbustuspargis**: a day at the funfair, 15 pages | `books/` | [/books/frida-lobustuspargis/](https://bokunobaka.github.io/lastenurk/books/frida-lobustuspargis/) |
| 📖 | **Printsess Frida kelgutamas**: sledding in the snow, 14 pages | `books/` | [/books/frida-kelgutamas/](https://bokunobaka.github.io/lastenurk/books/frida-kelgutamas/) |
| 📖 | **Printsess Frida arsti juures**: a gentle check-up at the doctor's, 15 pages | `books/` | [/books/frida-arsti-juures/](https://bokunobaka.github.io/lastenurk/books/frida-arsti-juures/) |
| 🎮 | **Printsessi päev**: 3D game, 16 days (three.js + Vite) | `games/princess-day/` | [/games/princess-day/](https://bokunobaka.github.io/lastenurk/games/princess-day/) |
| 🎮 | **Dinopäev**: 3D dinosaur game, 16 days (three.js + Vite) | `games/dino-day/` | [/games/dino-day/](https://bokunobaka.github.io/lastenurk/games/dino-day/) |
| 🧩 | **Robot Piiks**: puzzle game, 30 levels: line up arrow cards to drive a robot (Vite) | `games/robot-piiks/` | [/games/robot-piiks/](https://bokunobaka.github.io/lastenurk/games/robot-piiks/) |
| 🧩 | **Rong Tuut**: puzzle game, 22 levels: turn track pieces so the train reaches the station (Vite) | `games/rong-tuut/` | [/games/rong-tuut/](https://bokunobaka.github.io/lastenurk/games/rong-tuut/) |
| 🧩 | **Kujundipusle**: shape puzzle, 19 pictures: drag shapes onto a shadow, turn them, and the picture comes alive (Vite) | `games/kujundipusle/` | [/games/kujundipusle/](https://bokunobaka.github.io/lastenurk/games/kujundipusle/) |
| ➕ | **Konn Krooks**: adding and taking away, 25 levels: number cards make a frog hop along lily pads 0–20 to catch a fly (Vite) | `games/konn-krooks/` | [/games/konn-krooks/](https://bokunobaka.github.io/lastenurk/games/konn-krooks/) |
| 🧩 | **Näljased kastid**: sorting game, 22 levels: drag things off a conveyor belt into hungry boxes by colour, kind, size, shape, spots; rubbish into bins (Vite) | `games/naljased-kastid/` | [/games/naljased-kastid/](https://bokunobaka.github.io/lastenurk/games/naljased-kastid/) |
| 🐛 | **Mustriröövik**: pattern game, 25 levels: fill the gaps in a caterpillar's patterned body (colours, pictures, sizes, dots, arrows, growing patterns, a wrong segment) (Vite) | `games/mustriroovik/` | [/games/mustriroovik/](https://bokunobaka.github.io/lastenurk/games/mustriroovik/) |
| 🚗 | **Põrr-auto**: driving game, 12 drives and an endless road: tilt the tablet (or drag a finger) to steer, collect stars, dodge cones, jump ramps, honk at slow cars (Vite) | `games/porr-auto/` | [/games/porr-auto/](https://bokunobaka.github.io/lastenurk/games/porr-auto/) |
| 🐞 | **Lepatriinu labürint**: tilt maze, 20 levels: tilt the tablet (or drag a finger) to roll a ladybug through a garden, pick up her lost spots and take her home; holes, mushrooms, ice, honey, flower buttons and gates (Vite) | `games/lepatriinu/` | [/games/lepatriinu/](https://bokunobaka.github.io/lastenurk/games/lepatriinu/) |

## Layout

    site/                 landing page (index.html) and its card pictures (thumbs/)
    books/                the picture books: story text, SVG scenes, runtime, tools (see books/README.md)
    games/princess-day/   Printsessi päev (was github.com/bokunobaka/princess-day, history kept)
    games/dino-day/       Dinopäev (was github.com/bokunobaka/dino-day, history kept)
    games/robot-piiks/    Robot Piiks (2D SVG puzzle game, made here)
    games/rong-tuut/      Rong Tuut (2D SVG track puzzle, made here)
    games/kujundipusle/   Kujundipusle (2D SVG shape puzzle, made here)
    games/konn-krooks/    Konn Krooks (2D SVG adding and taking-away game, made here)
    games/naljased-kastid/ Näljased kastid (2D SVG sorting game, made here)
    games/mustriroovik/   Mustriröövik (2D SVG pattern game, made here)
    games/porr-auto/      Põrr-auto (2D canvas driving game steered by tilting, made here)
    games/lepatriinu/     Lepatriinu labürint (2D canvas tilt maze, made here)
    scripts/build-site.sh builds everything into _site/
    .github/workflows/pages.yml  runs the build and publishes _site/ on every push to main

The published site mirrors this:

    /                      landing page
    /books/<name>/         each book as one self-contained HTML file (books/tools/bundle.mjs)
    /games/<name>/         each game's Vite build (relative paths, own offline service worker)

## Build locally

    scripts/build-site.sh          # npm ci + build each game, bundle the books, assemble _site/
    python3 -m http.server -d _site 8080

## Adding something

- **A game:** put a Vite project with a `build` script and relative `base: './'` in `games/<name>/`.
  The build script picks it up automatically and serves it at `/games/<name>/`.
- **A book:** add it to `BOOKS` in `books/tools/bundle.mjs`; it is served at `/books/<out-name>/`.
- Then add a card to `site/index.html` with a 16:9 picture in `site/thumbs/` (800 px wide WebP is plenty).
