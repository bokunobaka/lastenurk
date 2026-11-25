// The pictures. Each piece is [shape, w, h, x, y, turn, colour]: shape and size as in shapes.js,
// x, y the centre of its place in the picture (grid units, the board is W × H), turn its quarter turn.
//   rotate   pieces start turned the wrong way, a tap turns them (from level 6)
//   outline  the picture shows where each piece goes (off from level 13: only the whole shadow)
//   extra    pieces that fit nowhere (from level 16)
//   anim     how the finished picture comes alive (a class in style.css); details are drawn in art.js
//   spin     pieces (by number) that spin round a point when the picture is done
// npm run check: no pieces overlap, every piece touches the rest, all inside the board.
import { period } from './shapes.js';

const LEVELS = [
  {
    id: 'house', W: 4, H: 4, anim: 'bounce', tip: 'tip.first',
    pieces: [['iso', 3, 1.4, 2, 0.95, 0, 'red'], ['sq', 2.2, 2, 2, 2.65, 0, 'yellow']],
  },
  {
    id: 'tree', W: 4, H: 4, anim: 'sway',
    pieces: [['circ', 2.6, 0, 2, 1.55, 0, 'green'], ['sq', 0.7, 1, 2, 3.35, 0, 'brown']],
  },
  {
    id: 'fish', W: 4.6, H: 3.6, anim: 'swim',
    pieces: [['circ', 2.2, 0, 2.9, 1.8, 0, 'blue'], ['iso', 1.6, 1.3, 1.15, 1.8, 90, 'orange']],
  },
  {
    id: 'icecream', W: 3.6, H: 4.4, anim: 'wiggle',
    pieces: [['circ', 0.7, 0, 1.8, 0.5, 0, 'red'], ['semi', 2, 0, 1.8, 1.35, 0, 'pink'], ['iso', 1.8, 2.3, 1.8, 3, 180, 'orange']],
  },
  {
    id: 'car', W: 5, H: 4, anim: 'drive',
    pieces: [
      ['sq', 1.8, 0.9, 2.3, 1.45, 0, 'blue'], ['sq', 3.4, 1.1, 2.5, 2.45, 0, 'red'],
      ['circ', 0.9, 0, 1.6, 3.45, 0, 'ink'], ['circ', 0.9, 0, 3.4, 3.45, 0, 'ink'],
    ],
  },
  {
    id: 'boat', W: 5, H: 4.4, anim: 'rock', rotate: true, tip: 'tip.turn',
    pieces: [
      ['tri', 1.8, 2.4, 2.6, 1.55, 0, 'yellow'], ['tri', 1.8, 1, 1.2, 1.85, 270, 'pink'],
      ['trap', 3.8, 0.9, 2.5, 3.2, 0, 'brown'],
    ],
  },
  {
    id: 'rocket', W: 4, H: 4.6, anim: 'fly', rotate: true,
    pieces: [
      ['iso', 1.4, 1, 2, 0.65, 0, 'pink'], ['sq', 1.4, 2.4, 2, 2.35, 0, 'blue'],
      ['tri', 0.9, 0.9, 0.85, 3.1, 270, 'red'], ['tri', 0.9, 0.9, 3.15, 3.1, 0, 'red'],
      ['iso', 1, 0.8, 2, 3.95, 180, 'yellow'],
    ],
  },
  {
    id: 'cat', W: 4.4, H: 4, anim: 'hop', rotate: true,
    pieces: [
      ['iso', 0.7, 0.7, 1.75, 0.5, 0, 'pink'], ['iso', 0.7, 0.7, 2.65, 0.5, 0, 'pink'],
      ['sq', 1.6, 1.4, 2.2, 1.55, 0, 'orange'], ['sq', 2, 1.5, 2.2, 3, 0, 'orange'],
      ['sq', 0.4, 1.6, 3.4, 2.95, 0, 'brown'],
    ],
  },
  {
    id: 'butterfly', W: 5, H: 4, anim: 'flutter', rotate: true,
    pieces: [
      ['sq', 0.4, 2.6, 2.5, 2.2, 0, 'ink'],
      ['tri', 1.7, 1.7, 1.45, 1.35, 180, 'purple'], ['tri', 1.7, 1.7, 3.55, 1.35, 90, 'purple'],
      ['circ', 1.2, 0, 1.7, 2.85, 0, 'pink'], ['circ', 1.2, 0, 3.3, 2.85, 0, 'pink'],
    ],
  },
  {
    id: 'robot', W: 4.4, H: 4.4, anim: 'bounce', rotate: true,
    pieces: [
      ['circ', 0.5, 0, 2.2, 0.35, 0, 'pink'], ['sq', 1.8, 1.3, 2.2, 1.25, 0, 'mint'],
      ['sq', 2, 1.6, 2.2, 2.7, 0, 'mint'],
      ['sq', 0.4, 1.1, 1, 2.45, 0, 'orange'], ['sq', 0.4, 1.1, 3.4, 2.45, 0, 'orange'],
      ['trap', 2.2, 0.6, 2.2, 3.8, 0, 'ink'],
    ],
  },
  {
    id: 'plane', W: 5.4, H: 3.6, anim: 'fly', rotate: true,
    pieces: [
      ['sq', 3.6, 0.8, 2.8, 1.8, 0, 'blue'], ['semi', 0.8, 0, 4.8, 1.8, 90, 'red'],
      ['tri', 1.2, 1.2, 2.6, 0.8, 0, 'yellow'], ['tri', 1.2, 1.2, 2.6, 2.8, 90, 'yellow'],
      ['tri', 0.7, 0.7, 1.35, 1.05, 0, 'red'],
    ],
  },
  {
    id: 'castle', W: 5.6, H: 4.6, anim: 'shine', rotate: true,
    pieces: [
      ['iso', 1.2, 1, 0.95, 0.7, 0, 'blue'], ['iso', 1.2, 1, 4.65, 0.7, 0, 'blue'], ['iso', 1.4, 1, 2.8, 0.6, 0, 'purple'],
      ['sq', 0.9, 3.2, 0.95, 2.8, 0, 'pink'], ['sq', 0.9, 3.2, 4.65, 2.8, 0, 'pink'],
      ['sq', 1, 1, 2.8, 1.6, 0, 'pink'], ['sq', 2.8, 2.3, 2.8, 3.25, 0, 'lilac'],
    ],
  },
  {
    id: 'chick', W: 4, H: 4.2, anim: 'hop', rotate: true, outline: false, tip: 'tip.shadow',
    pieces: [
      ['circ', 1.3, 0, 2, 1.05, 0, 'yellow'], ['circ', 2.2, 0, 2, 2.8, 0, 'yellow'],
      ['iso', 0.5, 0.4, 2.85, 1.05, 90, 'orange'], ['iso', 0.4, 0.3, 2, 0.25, 0, 'orange'],
    ],
  },
  {
    id: 'flower', W: 4.4, H: 5, anim: 'sway', rotate: true, outline: false,
    pieces: [
      ['circ', 0.9, 0, 2.2, 1.6, 0, 'yellow'],
      ['semi', 0.9, 0, 2.2, 0.925, 0, 'pink'], ['semi', 0.9, 0, 2.875, 1.6, 90, 'pink'],
      ['semi', 0.9, 0, 2.2, 2.275, 180, 'pink'], ['semi', 0.9, 0, 1.525, 1.6, 270, 'pink'],
      ['sq', 0.4, 1.9, 2.2, 3.45, 0, 'green'], ['tri', 0.8, 0.8, 2.8, 3.6, 0, 'green'],
      ['trap', 1.8, 0.6, 2.2, 4.7, 0, 'orange'],
    ],
  },
  {
    id: 'turtle', W: 5.6, H: 4.2, anim: 'crawl', rotate: true, outline: false,
    pieces: [
      ['semi', 3, 0, 2.6, 2.15, 0, 'green'], ['sq', 3.4, 0.4, 2.6, 3.1, 0, 'brown'],
      ['circ', 0.9, 0, 4.75, 2.85, 0, 'mint'],
      ['sq', 0.5, 0.6, 1.6, 3.6, 0, 'mint'], ['sq', 0.5, 0.6, 3.6, 3.6, 0, 'mint'],
      ['tri', 0.4, 0.4, 0.7, 3.1, 270, 'mint'],
    ],
  },
  {
    id: 'rabbit', W: 4, H: 5.4, anim: 'hop', rotate: true, outline: false, tip: 'tip.extra',
    pieces: [
      ['sq', 0.45, 1.4, 1.75, 0.85, 0, 'pink'], ['sq', 0.45, 1.4, 2.25, 0.85, 0, 'pink'],
      ['circ', 1.4, 0, 2, 2.25, 0, 'brown'], ['circ', 2.2, 0, 2, 4.05, 0, 'brown'],
      ['circ', 0.5, 0, 3.35, 4.3, 0, 'white'],
    ],
    extra: [['tri', 1, 1, 0, 0, 0, 'blue']],
  },
  {
    id: 'pinwheel', W: 4.4, H: 5.6, anim: 'sway', rotate: true, outline: false, spin: { parts: [0, 1, 2, 3], x: 2.2, y: 1.8 },
    pieces: [
      ['tri', 1.4, 1.4, 2.9, 1.1, 0, 'pink'], ['tri', 1.4, 1.4, 1.5, 1.1, 270, 'yellow'],
      ['tri', 1.4, 1.4, 1.5, 2.5, 180, 'blue'], ['tri', 1.4, 1.4, 2.9, 2.5, 90, 'green'],
      ['sq', 0.4, 2.4, 2.2, 4.4, 0, 'brown'],
    ],
    extra: [['semi', 1.2, 0, 0, 0, 0, 'purple']],
  },
  {
    id: 'crown', W: 5, H: 3.4, anim: 'shine', rotate: true, outline: false,
    pieces: [
      ['sq', 3.6, 1, 2.5, 2.6, 0, 'yellow'],
      ['iso', 1.2, 1.2, 1.3, 1.5, 0, 'yellow'], ['iso', 1.2, 1.2, 2.5, 1.5, 0, 'yellow'], ['iso', 1.2, 1.2, 3.7, 1.5, 0, 'yellow'],
      ['circ', 0.5, 0, 1.3, 0.65, 0, 'pink'], ['circ', 0.5, 0, 2.5, 0.65, 0, 'blue'], ['circ', 0.5, 0, 3.7, 0.65, 0, 'green'],
    ],
    extra: [['sq', 1, 1, 0, 0, 0, 'red']],
  },
  {
    id: 'train', W: 5, H: 3.8, anim: 'drive', rotate: true, outline: false, tip: 'tip.last',
    pieces: [
      ['sq', 1.2, 1.4, 1.4, 1.6, 0, 'red'], ['sq', 2, 1, 3, 1.8, 0, 'blue'], ['sq', 0.5, 0.6, 3.5, 1, 0, 'ink'],
      ['sq', 3.6, 0.5, 2.4, 2.55, 0, 'yellow'], ['tri', 0.5, 0.5, 4.45, 2.55, 0, 'red'],
      ['circ', 0.8, 0, 1.2, 3.2, 0, 'ink'], ['circ', 0.8, 0, 2.4, 3.2, 0, 'ink'], ['circ', 0.8, 0, 3.6, 3.2, 0, 'ink'],
    ],
    extra: [['iso', 1, 1, 0, 0, 0, 'green']],
  },
];

const piece = ([k, w, h, x, y, r, c], i) => ({ k, w, h, x, y, r, c, i });

export const levels = LEVELS.map((l, index) => {
  const pieces = l.pieces.map(piece);
  return {
    ...l,
    index,
    rotate: !!l.rotate,
    outline: l.outline !== false,
    pieces,
    extra: (l.extra || []).map((e, j) => ({ ...piece(e, pieces.length + j), extra: true })),
  };
});

// a small seeded random, so a level always starts the same way
export function rng(seed) {
  let s = seed * 9301 + 49297;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

// the turn each piece starts with: right on the early levels, else a wrong turn (if turning shows)
export function startTurn(lv, p) {
  if (!lv.rotate) return p.r;
  const per = period(p);
  if (per === 90) return 0;
  const rand = rng(lv.index * 31 + p.i * 7 + 3);
  return (p.r + 90 * (1 + Math.floor(rand() * (per / 90 - 1)))) % 360;
}
