// The levels. Each caterpillar's body is a pattern; some segments are missing (gaps) and the child
// fills them from the leaf below. A segment is written as words:
//   a colour   red blue yellow green pink purple orange   (else the level's `color`)
//   a picture  star heart moon circ tri sq
//   a size     small (big is the default; the word "big" may be written for clarity)
//   dots       1-6
//   an arrow   up right down left
// e.g. "red", "blue star", "small", "3", "green up".
// A level is either
//   { unit, len }   the unit repeats to len segments          (npm run check: the gaps follow from what shows)
//   { seq, grow }   a growing pattern written out in full
// plus gaps (indexes of missing segments), wrong: [index, segment] (that segment is drawn wrong and must be
// tapped away first), extra (more segments to choose from), n (how many to choose from, at most 4).

const COLORS = ['red', 'blue', 'yellow', 'green', 'pink', 'purple', 'orange'];
const SYMS = ['star', 'heart', 'moon', 'circ', 'tri', 'sq'];
const ARROWS = ['up', 'right', 'down', 'left'];

export function parse(code, color = 'green') {
  const it = { code, color, sym: null, small: false, dots: 0, arrow: null };
  for (const w of code.split(' ')) {
    if (COLORS.includes(w)) it.color = w;
    else if (SYMS.includes(w)) it.sym = w;
    else if (ARROWS.includes(w)) it.arrow = w;
    else if (w === 'small') it.small = true;
    else if (w === 'big') it.small = false;
    else if (/^[1-6]$/.test(w)) it.dots = +w;
    else throw new Error(`unknown word ${w} in "${code}"`);
  }
  it.key = [it.color, it.sym, it.small ? 's' : 'b', it.dots, it.arrow].join('/');
  return it;
}

const LEVELS = [
  // colours: two, then three take turns
  { unit: ['red', 'blue'], len: 6, gaps: [5], tip: 'tip.first' },
  { unit: ['yellow', 'green'], len: 7, gaps: [6], tip: 'tip.tail' },
  { unit: ['pink', 'blue'], len: 8, gaps: [4], extra: ['yellow'], tip: 'tip.middle' },
  { unit: ['red', 'yellow', 'blue'], len: 8, gaps: [7], tip: 'tip.abc' },
  { unit: ['green', 'green', 'red'], len: 9, gaps: [5], extra: ['blue'], tip: 'tip.aab' },
  { unit: ['blue', 'pink', 'pink'], len: 9, gaps: [4, 8], extra: ['yellow'], tip: 'tip.gaps' },
  { unit: ['yellow', 'yellow', 'purple', 'purple'], len: 10, gaps: [6, 9], extra: ['green'], tip: 'tip.aabb' },
  { unit: ['red', 'green', 'blue'], len: 10, gaps: [2, 6, 9], extra: ['yellow'], tip: 'tip.many' },
  // pictures, sizes, dots and arrows on a one-colour caterpillar
  { color: 'green', unit: ['star', 'heart'], len: 8, gaps: [6], extra: ['moon'], tip: 'tip.sym' },
  { color: 'orange', unit: ['circ', 'tri', 'sq'], len: 9, gaps: [4, 8], tip: 'tip.shape' },
  { color: 'blue', unit: ['big', 'small'], len: 8, gaps: [5, 7], tip: 'tip.size' },
  { color: 'pink', unit: ['big', 'big', 'small'], len: 9, gaps: [3, 7], tip: 'tip.size2' },
  { color: 'purple', unit: ['1', '2'], len: 8, gaps: [5, 7], extra: ['3'], tip: 'tip.dots' },
  { color: 'red', unit: ['1', '2', '3'], len: 9, gaps: [5, 8], tip: 'tip.dots2' },
  { color: 'blue', unit: ['up', 'down'], len: 8, gaps: [4, 7], extra: ['right'], tip: 'tip.arrow' },
  { color: 'green', unit: ['up', 'right', 'down', 'left'], len: 9, gaps: [5, 8], tip: 'tip.turn' },
  // two things change at once
  { unit: ['red star', 'blue star', 'red heart', 'blue heart'], len: 10, gaps: [6, 9], tip: 'tip.both' },
  { unit: ['green', 'purple small', 'orange', 'green small', 'purple', 'orange small'], len: 12, gaps: [7, 10], tip: 'tip.both2' },
  // growing patterns
  { color: 'purple', grow: true, seq: ['1', '2', '3', '4', '5', '6'], gaps: [3, 5], tip: 'tip.grow' },
  { grow: true, seq: ['red', 'blue', 'red', 'blue', 'blue', 'red', 'blue', 'blue', 'blue', 'red', 'blue', 'blue'], gaps: [8, 9],
    tip: 'tip.grow2' },
  { color: 'orange', grow: true, seq: ['5', '4', '3', '2', '1'], gaps: [2, 4], extra: ['6'], tip: 'tip.down' },
  // one segment is wrong: tap it away, then fill the gap
  { unit: ['red', 'yellow'], len: 8, gaps: [], wrong: [5, 'red'], tip: 'tip.wrong' },
  { unit: ['blue', 'green', 'pink'], len: 9, gaps: [], wrong: [4, 'blue'], tip: 'tip.wrong2' },
  { color: 'purple', unit: ['star', 'star', 'moon'], len: 9, gaps: [8], wrong: [4, 'moon'], tip: 'tip.wrong3' },
  { color: 'orange', unit: ['up', 'right', 'down', 'left'], len: 10, gaps: [9], wrong: [6, 'up'], tip: 'tip.last' },
];

export const levels = LEVELS.map((def, index) => {
  const P = (c) => parse(c, def.color);
  const seq = (def.seq || Array.from({ length: def.len }, (_, i) => def.unit[i % def.unit.length])).map(P);
  const wrong = def.wrong ? { at: def.wrong[0], it: P(def.wrong[1]) } : null;
  const gaps = def.gaps || [];
  // what the child picks from: the answers first, then the other segments, then the extras
  const pool = [...gaps.map((g) => seq[g]), ...(wrong ? [seq[wrong.at], wrong.it] : []), ...seq, ...(def.extra || []).map(P)];
  const choices = [];
  for (const it of pool) if (!choices.some((c) => c.key === it.key)) choices.push(it);
  choices.length = Math.min(choices.length, def.n || 4);
  const r = rng(index * 31 + 7);
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  // each segment kind sings its own note: dots by number, small ones higher, else in order of appearance
  const kinds = [];
  for (const it of [...seq, ...choices, ...(wrong ? [wrong.it] : [])]) if (!kinds.some((k) => k.key === it.key)) kinds.push(it);
  if (kinds.every((k) => k.dots)) kinds.sort((a, b) => a.dots - b.dots);
  else if (kinds.some((k) => k.small)) kinds.sort((a, b) => a.small - b.small);
  const note = Object.fromEntries(kinds.map((k, i) => [k.key, i]));
  return { ...def, index, seq, gaps, wrong, choices, note, period: def.grow ? 0 : def.unit.length };
});

export function rng(seed) {
  let s = seed * 9301 + 49297;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}
