// The levels and the rules. Lily pads 0..N in a row; the frog starts on `start`, the fly waits on `fly`.
// Each card (+3, -2, ...) is used once: the frog jumps that many pads forward or back.
//   gaps   numbers with no lily pad: landing there is a splash (jumping over is fine)
//   tip    the line shown for the grown-up
// npm run check: every level can be solved, and gaps really change which order works.

const LEVELS = [
  // plus, one card
  { N: 10, start: 0, fly: 3, cards: [3], tip: 'tip.first' },
  { N: 10, start: 0, fly: 5, cards: [2, 5, 4], tip: 'tip.pick' },
  { N: 10, start: 0, fly: 4, cards: [6, 4, 3] },
  { N: 10, start: 0, fly: 7, cards: [5, 7, 3] },
  // starting further along: count on
  { N: 10, start: 2, fly: 6, cards: [4, 3, 5], tip: 'tip.start' },
  { N: 10, start: 3, fly: 8, cards: [2, 5, 4] },
  { N: 10, start: 1, fly: 10, cards: [6, 9, 8] },
  // minus: jump back
  { N: 10, start: 5, fly: 2, cards: [-3, -1, 2], tip: 'tip.back' },
  { N: 10, start: 8, fly: 4, cards: [-2, -4, 1] },
  { N: 10, start: 10, fly: 3, cards: [-5, -7, -6] },
  { N: 10, start: 7, fly: 1, cards: [-4, 3, -6] },
  // two cards
  { N: 10, start: 0, fly: 7, cards: [3, 6, 4], tip: 'tip.two' },
  { N: 10, start: 2, fly: 9, cards: [3, 1, 4, 6] },
  { N: 10, start: 1, fly: 10, cards: [4, 7, 5, 2] },
  // plus and minus together
  { N: 10, start: 4, fly: 7, cards: [5, -2, 1], tip: 'tip.mix' },
  { N: 10, start: 9, fly: 5, cards: [-6, 2, -3] },
  { N: 10, start: 3, fly: 8, cards: [7, -2, 4, -1] },
  // missing lily pads: the order matters
  { N: 10, start: 0, fly: 6, cards: [4, 2], gaps: [4], tip: 'tip.gap' },
  { N: 10, start: 7, fly: 4, cards: [2, -5], gaps: [9] },
  { N: 10, start: 2, fly: 8, cards: [5, 3, -2, 4], gaps: [7, 4] },
  // up to 20, over the ten
  { N: 20, start: 8, fly: 13, cards: [3, 5, 7], tip: 'tip.twenty' },
  { N: 20, start: 15, fly: 9, cards: [-4, -6, -5] },
  { N: 20, start: 6, fly: 17, cards: [5, 2, 6, 4] },
  { N: 20, start: 18, fly: 7, cards: [-9, -4, -2, 1] },
  { N: 20, start: 3, fly: 16, cards: [8, 6, -1, 4], gaps: [11, 9], tip: 'tip.last' },
];

export const levels = LEVELS.map((l, index) => ({ ...l, gaps: l.gaps || [], index }));

// where a card takes the frog from `at`: { to, result: 'ok' | 'edge' (off the row, it will not jump) | 'splash' }
export function jump(lv, at, v) {
  const to = at + v;
  if (to < 0 || to > lv.N) return { to: at, result: 'edge' };
  if (lv.gaps.includes(to)) return { to, result: 'splash' };
  return { to, result: 'ok' };
}

// the shortest list of card indexes (from those not used yet) that brings the frog from `at` to the fly
export function solve(lv, at = lv.start, used = []) {
  let best = null;
  const go = (pos, path) => {
    if (pos === lv.fly) {
      if (!best || path.length < best.length) best = path;
      return;
    }
    if (best && path.length + 1 >= best.length) return;
    lv.cards.forEach((v, i) => {
      if (used.includes(i) || path.includes(i)) return;
      const j = jump(lv, pos, v);
      if (j.result === 'ok') go(j.to, [...path, i]);
    });
  };
  go(at, []);
  return best;
}

// the sum written out: "2 + 3 − 1 = 4"
export function sum(start, steps, end) {
  let s = `${start}`;
  for (const v of steps) s += v < 0 ? ` − ${-v}` : ` + ${v}`;
  return steps.length ? `${s} = ${end}` : s;
}
