// Makes the levels from a plan: each line of PLAN says how big the board is, how long the route is,
// and which pieces it uses. A random route is grown to fit, then dressed up with bridges, tunnels,
// switches (whose other branch runs into a dead end), crossings, double curves, waiting animals,
// extra pieces and scenery. Every candidate is checked with the game's own rules; the first that
// fits is written into src/levels.js between the LEVELS markers. Same plan + same seed = same levels.
// Usage: node tools/generate-levels.mjs        (then npm run check)
import fs from 'node:fs';
import { parse, route } from '../src/levels.js';

// w x h, route length [min, max] (tiles), and how many of each thing
//   bridge, tunnel, switch, cross, double, extra (spare pieces), riders, fixed (share of plain track that stays put)
const PLAN = [
  { w: 4, h: 3, len: [2, 2], riders: 1, fixed: 0.5, straight: true, tip: 'tip.first' },
  { w: 4, h: 4, len: [3, 4], riders: 1, fixed: 0.3, curves: 1, tip: 'tip.curve' },
  { w: 5, h: 3, len: [3, 4], riders: 1, bridge: 1, fixed: 0.3, tip: 'tip.bridge' },
  { w: 5, h: 4, len: [5, 6], riders: 1, extra: 1, fixed: 0.2, curves: 2, tip: 'tip.extra' },
  { w: 5, h: 4, len: [5, 7], riders: 2, tunnel: 1, extra: 1, fixed: 0.2, tip: 'tip.tunnel' },
  { w: 5, h: 4, len: [5, 7], riders: 1, switch: 1, fixed: 0.3, tip: 'tip.switch' },
  { w: 5, h: 5, len: [7, 9], riders: 2, bridge: 1, extra: 2, fixed: 0.2 },
  { w: 5, h: 5, len: [8, 10], riders: 2, cross: 1, extra: 1, fixed: 0.2, tip: 'tip.cross' },
  { w: 6, h: 4, len: [8, 10], riders: 2, switch: 1, tunnel: 1, extra: 2, fixed: 0.15 },
  { w: 5, h: 5, len: [8, 11], riders: 2, double: 1, extra: 1, fixed: 0.2, tip: 'tip.double' },
  { w: 6, h: 5, len: [10, 12], riders: 2, switch: 1, bridge: 1, extra: 3, fixed: 0.15 },
  { w: 6, h: 5, len: [11, 13], riders: 2, cross: 1, tunnel: 1, extra: 2, fixed: 0.15 },
  { w: 6, h: 5, len: [11, 14], riders: 2, switch: 2, extra: 3, fixed: 0.1, tip: 'tip.two' },
  { w: 6, h: 5, len: [12, 15], riders: 3, double: 1, bridge: 2, extra: 3, fixed: 0.1, tip: 'tip.three' },
  { w: 7, h: 5, len: [13, 16], riders: 2, cross: 1, switch: 1, tunnel: 1, extra: 3, fixed: 0.1 },
  { w: 7, h: 5, len: [14, 17], riders: 3, double: 1, switch: 1, bridge: 1, extra: 4, fixed: 0.1 },
  { w: 7, h: 5, len: [14, 18], riders: 3, cross: 1, double: 1, extra: 4, fixed: 0.1 },
  { w: 7, h: 6, len: [16, 19], riders: 3, switch: 2, tunnel: 1, bridge: 1, extra: 4, fixed: 0.1 },
  { w: 7, h: 6, len: [17, 21], riders: 3, cross: 1, switch: 2, extra: 5, fixed: 0.05 },
  { w: 7, h: 6, len: [18, 22], riders: 3, double: 2, bridge: 1, extra: 5, fixed: 0.05 },
  { w: 7, h: 6, len: [19, 23], riders: 3, cross: 1, double: 1, switch: 2, tunnel: 1, extra: 5, fixed: 0.05 },
  { w: 7, h: 6, len: [20, 25], riders: 3, cross: 2, double: 1, switch: 2, bridge: 1, tunnel: 1, extra: 5, fixed: 0, tip: 'tip.last' },
];

const D = ['N', 'E', 'S', 'W'];
const STEP = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
const OPP = { N: 'S', E: 'W', S: 'N', W: 'E' };
const LIGHT = { I: ['│', '─'], L: ['└', '┌', '┐', '┘'] };
const HEAVY = { I: ['┃', '━'], L: ['┗', '┏', '┓', '┛'] };
const curveRot = (a, b) => [0, 1, 2, 3].find((r) => [D[r], D[(r + 1) % 4]].every((d) => d === a || d === b));

function rng(seed) {
  let s = seed % 2147483647 || 1;
  const f = () => (s = (s * 16807) % 2147483647) / 2147483647;
  f.int = (n) => Math.floor(f() * n);
  f.pick = (a) => a[f.int(a.length)];
  f.shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = f.int(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  return f;
}

// Grows a route from a start station on the edge. A tile may be passed twice only as a crossing
// (two straight passes across each other) or a double curve (two curves using opposite corners).
function grow(spec, R) {
  const { w, h } = spec;
  const inside = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
  const edge = [];
  for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) if (x === 0 || y === 0 || x === w - 1 || y === h - 1) edge.push([x, y]);
  const [sx, sy] = R.pick(edge);
  const outs = D.filter((d) => inside(sx + STEP[d][0], sy + STEP[d][1]));
  const sdir = R.pick(outs);
  const use = new Map(); // "x,y" -> [[from, to], ...]
  const visits = [];
  let budget = 4000;
  const want = { cross: spec.cross || 0, double: spec.double || 0 };
  const near = (x, y, px, py) => Math.abs(x - px) + Math.abs(y - py) <= 1;
  let goal = null;

  function step(x, y, from, n, crosses, doubles) {
    if (--budget < 0) return false;
    const k = `${x},${y}`;
    if (!inside(x, y) || (x === sx && y === sy)) return false;
    const u = use.get(k);
    // finish here: an empty tile becomes the goal station
    if (!u && n >= spec.len[0] && crosses === want.cross && doubles === want.double && !near(x, y, sx, sy) && R() < 0.6) {
      goal = { x, y };
      return true;
    }
    if (n >= spec.len[1]) return false;
    const opts = R.shuffle(D.filter((d) => d !== from));
    for (const to of opts) {
      let kind = 'plain';
      if (u) {
        if (u.length > 1) return false;
        const [f0, t0] = u[0];
        const straight0 = OPP[f0] === t0, straight1 = OPP[from] === to;
        if (straight0 && straight1 && f0 !== from && f0 !== to && crosses < want.cross) kind = 'cross';
        else if (!straight0 && !straight1 && ![f0, t0].includes(from) && ![f0, t0].includes(to) && doubles < want.double) kind = 'double';
        else continue;
      }
      if (spec.straight && OPP[from] !== to) continue;
      const list = u || [];
      list.push([from, to]);
      use.set(k, list);
      visits.push({ x, y, from, to });
      if (step(x + STEP[to][0], y + STEP[to][1], OPP[to], n + 1, crosses + (kind === 'cross'), doubles + (kind === 'double'))) return true;
      visits.pop();
      list.pop();
      if (!list.length) use.delete(k);
    }
    return false;
  }
  const ok = step(sx + STEP[sdir][0], sy + STEP[sdir][1], OPP[sdir], 0, 0, 0);
  return ok ? { start: { x: sx, y: sy }, goal, use, visits } : null;
}

function build(spec, R) {
  const g = grow(spec, R);
  if (!g) return null;
  const { w, h } = spec;
  const inside = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
  const grid = Array.from({ length: h }, () => Array(w).fill('.'));
  const busy = new Set([`${g.start.x},${g.start.y}`, `${g.goal.x},${g.goal.y}`, ...g.use.keys()]);
  const nearStation = (x, y) =>
    [g.start, g.goal].some((s) => Math.abs(s.x - x) + Math.abs(s.y - y) === 1);
  grid[g.start.y][g.start.x] = 'S';
  grid[g.goal.y][g.goal.x] = 'G';

  // what each route tile is
  const cells = [];
  for (const [k, u] of g.use) {
    const [x, y] = k.split(',').map(Number);
    let piece;
    if (u.length === 2) {
      const straight = OPP[u[0][0]] === u[0][1];
      piece = straight ? '┼' : curveRot(...u[0]) % 2 === 0 ? 'Q' : 'q';
    }
    cells.push({ x, y, u, piece, straight: u.length === 1 && OPP[u[0][0]] === u[0][1] });
  }
  if (spec.curves && cells.filter((c) => c.u.length === 1 && !c.straight).length < spec.curves) return null;
  const plain = R.shuffle(cells.filter((c) => !c.piece));
  const free = (x, y) => inside(x, y) && !busy.has(`${x},${y}`);

  // bridges: a straight piece with water on both sides
  for (let i = 0; i < (spec.bridge || 0); i++) {
    const c = plain.find((c) => {
      if (!c.straight || c.piece) return false;
      const side = D.filter((d) => d !== c.u[0][0] && d !== c.u[0][1]);
      return side.every((d) => free(c.x + STEP[d][0], c.y + STEP[d][1]) && !nearStation(c.x + STEP[d][0], c.y + STEP[d][1]));
    });
    if (!c) return null;
    c.piece = OPP[c.u[0][0]] === 'N' || c.u[0][0] === 'N' ? '‖' : '=';
    for (const d of D.filter((d) => d !== c.u[0][0] && d !== c.u[0][1])) {
      const [nx, ny] = [c.x + STEP[d][0], c.y + STEP[d][1]];
      grid[ny][nx] = '~';
      busy.add(`${nx},${ny}`);
    }
  }
  // tunnels: straight pieces under a hill
  for (let i = 0; i < (spec.tunnel || 0); i++) {
    const c = plain.find((c) => c.straight && !c.piece);
    if (!c) return null;
    c.piece = c.u[0][0] === 'N' || c.u[0][0] === 'S' ? 'v' : 'h';
  }
  // switches: the train comes in at the stem; the other branch runs into a dead end
  const switches = [];
  for (let i = 0; i < (spec.switch || 0); i++) {
    let made = false;
    for (const c of plain) {
      if (c.piece) continue;
      const [from, to] = c.u[0];
      for (const x of R.shuffle(D.filter((d) => d !== from && d !== to))) {
        const [ax, ay] = [c.x + STEP[x][0], c.y + STEP[x][1]];
        const [bx, by] = [ax + STEP[x][0], ay + STEP[x][1]];
        if (!free(ax, ay) || nearStation(ax, ay)) continue;
        if (inside(bx, by) && !free(bx, by)) continue;
        c.piece = 'Y';
        switches.push({ at: [c.x, c.y], stem: from, a: to, b: x, solved: 'a' });
        grid[ay][ax] = x === 'N' || x === 'S' ? '┃' : '━';
        busy.add(`${ax},${ay}`);
        if (inside(bx, by)) {
          grid[by][bx] = R.pick(['R', 'T']);
          busy.add(`${bx},${by}`);
        }
        made = true;
        break;
      }
      if (made) break;
    }
    if (!made) return null;
  }
  // waiting animals: spread along the route, on ordinary pieces
  const order = g.visits.map((v) => cells.find((c) => c.x === v.x && c.y === v.y));
  const spots = order.filter((c, i) => c && !c.piece && order.indexOf(c) === i);
  if (spots.length < spec.riders) return null;
  const riders = [];
  for (let i = 0; i < spec.riders; i++) {
    const c = spots[Math.floor(((i + 0.5) * spots.length) / spec.riders)];
    riders.push([c.x, c.y]);
  }
  // the rest of the route: ordinary pieces, some of them fixed
  for (const c of cells) {
    if (c.piece) continue;
    const [a, b] = c.u[0];
    const fixed = R() < (spec.fixed || 0);
    const set = fixed ? HEAVY : LIGHT;
    c.piece = c.straight ? set.I[a === 'N' || a === 'S' ? 0 : 1] : set.L[curveRot(a, b)];
  }
  for (const c of cells) grid[c.y][c.x] = c.piece;

  // spare pieces next to the route, so there are wrong turns to try
  const spare = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (free(x, y) && !nearStation(x, y) && D.some((d) => busy.has(`${x + STEP[d][0]},${y + STEP[d][1]}`))) spare.push([x, y]);
  R.shuffle(spare);
  for (let i = 0; i < (spec.extra || 0); i++) {
    const s = spare.pop();
    if (!s) return null;
    const kinds = spec.double ? ['─', '│', '┌', '┐', '└', '┘', 'Q'] : ['─', '│', '┌', '┐', '└', '┘'];
    grid[s[1]][s[0]] = R.pick(kinds);
    busy.add(`${s[0]},${s[1]}`);
  }
  // scenery on some of the empty grass
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) if (grid[y][x] === '.' && R() < 0.3) grid[y][x] = R.pick(['T', 'T', 'f', 'R', 'f']);

  const def = { map: grid.map((r) => r.join('')), riders };
  if (switches.length) def.switches = switches;
  return { def, visits: g.visits.length };
}

// the candidate must play exactly as built: the route found from the start is the one grown
function valid(cand, spec, index) {
  const lv = parse(cand.def, index);
  if (!lv.start.dir || !lv.goal.dir || lv.path.length !== cand.visits) return false;
  if (route(lv).result === 'win') return false;
  const turnable = lv.path.filter((k) => !lv.pieces.get(k).fixed).length;
  return turnable >= Math.min(2, cand.visits) || spec.len[1] <= 2;
}

const out = [];
PLAN.forEach((spec, i) => {
  for (let seed = 1; seed < 20000; seed++) {
    const R = rng((i + 1) * 100003 + seed * 7919);
    const cand = build(spec, R);
    if (!cand || !valid(cand, spec, i)) continue;
    if (spec.tip) cand.def.tip = spec.tip;
    out.push(cand.def);
    console.log(`level ${String(i + 1).padStart(2)}  seed ${seed}\n  ${cand.def.map.join('\n  ')}`);
    return;
  }
  throw new Error(`level ${i + 1}: no layout found, loosen its plan`);
});

const lines = out.map((d) => {
  const parts = [`map: ${JSON.stringify(d.map)}`, `riders: ${JSON.stringify(d.riders)}`];
  if (d.tip) parts.push(`tip: '${d.tip}'`);
  if (d.switches)
    parts.push(`switches: [${d.switches.map((s) => `{ at: [${s.at}], stem: '${s.stem}', a: '${s.a}', b: '${s.b}', solved: '${s.solved}' }`).join(', ')}]`);
  return `  { ${parts.join(', ')} },`;
});
const file = new URL('../src/levels.js', import.meta.url);
const src = fs.readFileSync(file, 'utf8');
const a = src.indexOf('export const LEVELS = [');
const b = src.indexOf('];', a);
fs.writeFileSync(file, `${src.slice(0, a)}export const LEVELS = [\n${lines.join('\n')}\n${src.slice(b)}`);
console.log(`wrote ${out.length} levels to src/levels.js`);
