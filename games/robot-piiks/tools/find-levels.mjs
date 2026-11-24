// Finds level layouts for a spec by trying random boards and keeping only the good ones:
// every star can be collected, the plan fits in its slots, and every belt, teleport pad and key
// on the board is needed (without it the level would not fit). Prints the maps to paste into LEVELS.
// Usage: node tools/find-levels.mjs '{"w":6,"h":5,"belts":2,"pads":1,"key":1,"stars":2,"repeat":true,"cards":[5,8]}' [count]
import { parse, plan, simulate } from '../src/levels.js';

const spec = JSON.parse(process.argv[2]);
const want = Number(process.argv[3] || 3);
const D = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };
const ARROW = { up: '^', right: '>', down: 'v', left: '<' };

let seed = spec.seed || 1;
const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const int = (n) => Math.floor(R() * n);
const pick = (a) => a[int(a.length)];

function board() {
  const { w, h } = spec;
  const g = Array.from({ length: h }, () => Array(w).fill('.'));
  const empty = () => {
    for (let t = 0; t < 50; t++) {
      const x = int(w), y = int(h);
      if (g[y][x] === '.') return [x, y];
    }
    return null;
  };
  const put = (ch) => {
    const c = empty();
    if (c) g[c[1]][c[0]] = ch;
    return c;
  };
  for (let i = 0; i < w * h * (spec.walls ?? 0.25); i++) put(pick(['T', 'T', 'R', '#', '~']));
  // belts: short runs, sometimes with one turn
  for (let b = 0; b < (spec.belts || 0); b++) {
    let c = empty();
    if (!c) return null;
    let d = pick(Object.keys(D));
    const len = 2 + int(3);
    for (let i = 0; i < len; i++) {
      const [x, y] = c;
      if (x < 0 || y < 0 || x >= w || y >= h || g[y][x] !== '.') break;
      if (i === len - 2 && R() < 0.4) d = pick(Object.keys(D).filter((k) => k !== d && D[k][0] !== -D[d][0]));
      g[y][x] = ARROW[d];
      c = [x + D[d][0], y + D[d][1]];
    }
  }
  for (let p = 0; p < (spec.pads || 0); p++) {
    const ch = String(p + 1);
    if (!put(ch) || !put(ch)) return null;
  }
  if (spec.key) {
    if (!put('K')) return null;
    for (let i = 0; i < (spec.gates || 1); i++) if (!put('D')) return null;
  }
  for (let s = 0; s < (spec.stars || 0); s++) if (!put('*')) return null;
  if (!put('P') || !put('B')) return null;
  return g.map((r) => r.join(''));
}

const cardsOf = (def) => {
  const lv = parse({ ...def, slack: 0 }, 0);
  const p = plan(lv);
  if (!p) return null;
  const program = [];
  for (const d of p.moves) {
    const last = program[program.length - 1];
    if (last && last.dir === d && last.n < lv.maxRep) last.n++;
    else program.push({ dir: d, n: 1 });
  }
  const sim = simulate(lv, program);
  return sim.result === 'win' && sim.mask === lv.full ? program.length : Infinity;
};

let found = 0;
for (let tries = 0; tries < 400000 && found < want; tries++) {
  const map = board();
  if (!map) continue;
  const def = { map, cards: ['up', 'right', 'down', 'left'], repeat: !!spec.repeat };
  const n = cardsOf(def);
  if (!n || n === Infinity || n < spec.cards[0] || n > spec.cards[1]) continue;
  // each mechanic must be needed: without it, more cards (or impossible)
  const need = (re, to) => {
    if (!map.some((r) => re.test(r))) return true;
    const m = cardsOf({ ...def, map: map.map((r) => r.replace(re, to)) });
    return m === null || m > n;
  };
  if (!need(/[<>^v]/g, '.') || !need(/[12]/g, '.') || !need(/K/g, '.')) continue;
  found++;
  console.log(`cards ${n}:  ${JSON.stringify(map)}`);
}
