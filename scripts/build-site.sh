#!/usr/bin/env bash
# Builds the whole GitHub Pages site into _site/:
#   _site/                         landing page (site/)
#   _site/games/<name>/            each Vite game in games/ (built with relative paths)
#   _site/books/<name>/            each book as one self-contained HTML file (books/tools/bundle.mjs)
# Usage: scripts/build-site.sh            (pass --no-install to skip npm ci in the games)
set -euo pipefail
cd "$(dirname "$0")/.."
INSTALL=1; [[ "${1:-}" == "--no-install" ]] && INSTALL=0

rm -rf _site && mkdir -p _site/games _site/books
cp -r site/. _site/

for game in games/*/; do
  name=$(basename "$game")
  echo "== game: $name"
  (cd "$game" && { [[ $INSTALL == 1 ]] && npm ci --no-audit --no-fund || true; } && npm run build)
  cp -r "$game/dist" "_site/games/$name"
done

echo "== books"
node books/tools/bundle.mjs
for book in books/dist/*.html; do
  name=$(basename "$book" .html)
  mkdir -p "_site/books/$name"
  cp "$book" "_site/books/$name/index.html"
done

touch _site/.nojekyll
echo "Site ready in _site/"
