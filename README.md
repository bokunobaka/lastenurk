# Lastenurk

Estonian picture books and games for ages 4–6, all in one place.

**Open it:** https://bokunobaka.github.io/lastenurk/

| | What | Source | Live |
|---|---|---|---|
| 📖 | **Printsess Frida päev**: picture book, 24 pages, motion graphics, read-aloud | `books/` | [/books/printsess-frida/](https://bokunobaka.github.io/lastenurk/books/printsess-frida/) |
| 📖 | **Väikese Rexi päev**: dinosaur picture book, 24 pages | `books/` | [/books/rexi-paev/](https://bokunobaka.github.io/lastenurk/books/rexi-paev/) |
| 🎮 | **Printsessi päev**: 3D game, 16 days (three.js + Vite) | `games/princess-day/` | [/games/princess-day/](https://bokunobaka.github.io/lastenurk/games/princess-day/) |
| 🎮 | **Dinopäev**: 3D dinosaur game, 16 days (three.js + Vite) | `games/dino-day/` | [/games/dino-day/](https://bokunobaka.github.io/lastenurk/games/dino-day/) |

## Layout

    site/                 landing page (index.html) and its card pictures (thumbs/)
    books/                the picture books: story text, SVG scenes, runtime, tools (see books/README.md)
    games/princess-day/   Printsessi päev (was github.com/bokunobaka/princess-day, history kept)
    games/dino-day/       Dinopäev (was github.com/bokunobaka/dino-day, history kept)
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
