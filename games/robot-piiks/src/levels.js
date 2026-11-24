// The levels and the puzzle rules. No DOM here, so tools/check-levels.mjs can run it in node.
//
// Map letters: P start, B battery (goal), * star, . grass,
//              R rock, T tree, ~ pond, # crate (all four block the way),
//              > < ^ v  conveyor belt: whoever drives onto it is carried along to its end for free,
//              1 1, 2 2 teleport pads in pairs: drive onto one and come out of the other,
//              K key, D gate: the gate blocks the way until the key is picked up.
// cards: which arrows the level offers. repeat: a placed card can be tapped to do 2 or 3 steps.
// The number of card slots is the fewest cards that collect every star and reach the battery,
// plus `slack` (spare slots, for the early levels). With no slack, belts and pads that save cards
// have to be used.

export const LEVELS = [
  { map: ['...', 'P.B', '...'], cards: ['right'], slack: 1, tip: 'tip.first' },
  { map: ['....', 'P*.B', '....'], cards: ['right'], slack: 1, tip: 'tip.star' },
  { map: ['.B.', '.*.', '.P.'], cards: ['up', 'right'], slack: 1, tip: 'tip.up' },
  { map: ['...B', '..*.', 'P...'], cards: ['up', 'right'], slack: 1 },
  { map: ['..*..', 'P.R.B', '.....'], cards: ['up', 'right', 'down'], slack: 1, tip: 'tip.rock' },
  { map: ['.....', 'B...P', '..*..'], cards: ['left', 'up', 'down'], slack: 1, tip: 'tip.left' },
  { map: ['......', 'P>>>>B', '......'], cards: ['right'], slack: 1, tip: 'tip.belt' },
  { map: ['P.T.', '.T..', '...T', 'T.*B'], cards: ['up', 'right', 'down', 'left'], slack: 1 },
  { map: ['P*....', '...>>v', '.T...v', '...TB<'], cards: ['up', 'right', 'down', 'left'], slack: 1, tip: 'tip.belt2' },
  { map: ['~~..B', 'P..#.', '..*..', '.#...'], cards: ['up', 'right', 'down', 'left'], slack: 1 },
  { map: ['P..1', 'TTTT', '1*.B'], cards: ['right'], slack: 1, tip: 'tip.pad' },
  { map: ['B.T..', '.#T..', '.*T..', '....P'], cards: ['up', 'right', 'down', 'left'], slack: 1 },
  { map: ['P.#.B', '..D..', 'K.#..'], cards: ['up', 'right', 'down', 'left'], slack: 1, tip: 'tip.key' },
  { map: ['P....', 'TTTT.', 'B*...'], cards: ['up', 'right', 'down', 'left'], slack: 0, tip: 'tip.long' },
  { map: ['......', 'P....B', '......'], cards: ['right'], repeat: true, slack: 0, tip: 'tip.repeat' },
  { map: ['*..B', '....', '....', 'P...'], cards: ['up', 'right'], repeat: true, slack: 0 },
  { map: ['....<<', '.Tv...', '#.v.PT', '.Bv.*R', '*..R..'], cards: ['up', 'right', 'down', 'left'], repeat: true, slack: 0 },
  { map: ['P..T..', '...T..', '...T..', '..*..B'], cards: ['up', 'right', 'down'], repeat: true, slack: 0 },
  { map: ['P.T.T2B', '..T1T..', '1.T*T..', '..T2T..'], cards: ['up', 'right', 'down', 'left'], repeat: true, slack: 0, tip: 'tip.pad2' },
  { map: ['P.T.B', '..T..', '..T..', '..*..'], cards: ['up', 'right', 'down'], repeat: true, slack: 0 },
  { map: ['P..T...', '.T>>>>T', '.T.TT*.', '...TB..'], cards: ['up', 'right', 'down', 'left'], repeat: true, slack: 0, tip: 'tip.beltEnd' },
  { map: ['..*..', '.T.T.', 'P.R.B', '.T.T.', '.....'], cards: ['up', 'right', 'down', 'left'], repeat: true, slack: 0 },
  { map: ['..B<<<', '..~..D', '...T#P', '...T*.', '....KR'], cards: ['up', 'right', 'down', 'left'], repeat: true, slack: 0 },
  { map: ['B.#...', '..#.T.', '..#.T.', '.*..T.', 'TTT..P'], cards: ['up', 'right', 'down', 'left'], repeat: true, slack: 0 },
  { map: ['P....', '.~~~.', '.~*~.', '.~.~.', '...B.'], cards: ['up', 'right', 'down', 'left'], repeat: true, slack: 0, tip: 'tip.back' },
  { map: ['P..T.*K', '..1T1..', 'TDTTTTT', '...*..B'], cards: ['up', 'right', 'down', 'left'], repeat: true, slack: 0, tip: 'tip.keyPad' },
  { map: ['P.*...', 'TTTTT.', '....*.', '.TTTTT', '.....B'], cards: ['up', 'right', 'down', 'left'], repeat: true, slack: 0, tip: 'tip.long' },
  { map: ['P.#....', '..#.##.', '..*..#.', '.###.#.', '.....#B'], cards: ['up', 'right', 'down', 'left'], repeat: true, slack: 0 },
  { map: ['*....T.', '.TT..T.', 'P.T*.T.', '.TT....', '.....TB'], cards: ['up', 'right', 'down', 'left'], repeat: true, slack: 0 },
  { map: ['...1.K^', '.>>T#.^', '.*.~*~.', 'P.#.D~.', '...B1..'], cards: ['up', 'right', 'down', 'left'], repeat: true, slack: 0, tip: 'tip.last' },
];

export const DIR_ORDER = ['up', 'right', 'down', 'left'];
export const STEP = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };
const BLOCKS = 'RT~#';
const BELTS = { '^': 'up', '>': 'right', v: 'down', '<': 'left' };

// map strings -> a level object the game and the solver use
export function parse(def, index) {
  const H = def.map.length, W = [...def.map[0]].length;
  const lv = { ...def, index, W, H, stars: [], blocked: new Set(), belts: new Map(), pads: new Map(), gates: [], maxRep: def.repeat ? 3 : 1 };
  const pairs = {};
  def.map.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      const k = `${x},${y}`;
      if (ch === 'P') lv.start = { x, y };
      else if (ch === 'B') lv.goal = { x, y };
      else if (ch === '*') lv.stars.push({ x, y });
      else if (ch === 'K') lv.key = { x, y };
      else if (ch === 'D') lv.gates.push({ x, y });
      else if (BELTS[ch]) lv.belts.set(k, BELTS[ch]);
      else if (ch === '1' || ch === '2') (pairs[ch] ||= []).push({ x, y, pair: ch });
      else if (BLOCKS.includes(ch)) lv.blocked.add(k);
    })
  );
  for (const [a, b] of Object.values(pairs)) {
    lv.pads.set(`${a.x},${a.y}`, b);
    lv.pads.set(`${b.x},${b.y}`, a);
  }
  lv.gateSet = new Set(lv.gates.map((g) => `${g.x},${g.y}`));
  lv.full = (1 << lv.stars.length) - 1;
  lv.slots = (plan(lv)?.cards ?? 0) + (def.slack || 0);
  return lv;
}

const free = (lv, x, y, key) =>
  x >= 0 && y >= 0 && x < lv.W && y < lv.H && !lv.blocked.has(`${x},${y}`) && (key || !lv.gateSet.has(`${x},${y}`));
const starAt = (lv, x, y) => lv.stars.findIndex((s) => s.x === x && s.y === y);

// One step in direction d, then whatever the tile does: belts carry, pads teleport, the key is picked up.
// Returns null for a bump, else where the robot ends up and every tile it passed on the way
// ({x, y, via: 'move'|'belt'|'pad', star, key}).
export function stepFrom(lv, st, d) {
  const [dx, dy] = STEP[d];
  let { x, y, mask, key } = st;
  if (!free(lv, x + dx, y + dy, key)) return null;
  const trail = [];
  const visit = (via) => {
    const s = starAt(lv, x, y);
    const star = s >= 0 && !(mask & (1 << s)) ? s : -1;
    if (star >= 0) mask |= 1 << star;
    const gotKey = !key && lv.key && lv.key.x === x && lv.key.y === y;
    if (gotKey) key = true;
    trail.push({ x, y, via, star, key: gotKey });
  };
  x += dx;
  y += dy;
  visit('move');
  let last = 'move';
  for (let guard = 0; guard < 40; guard++) {
    if (x === lv.goal.x && y === lv.goal.y) return { x, y, mask, key, trail, win: true };
    const k = `${x},${y}`;
    const belt = lv.belts.get(k);
    if (belt) {
      const [bx, by] = STEP[belt];
      if (!free(lv, x + bx, y + by, key)) break;
      x += bx;
      y += by;
      visit((last = 'belt'));
      continue;
    }
    const pad = lv.pads.get(k);
    if (pad && last !== 'pad') {
      x = pad.x;
      y = pad.y;
      visit((last = 'pad'));
      continue;
    }
    break;
  }
  return { x, y, mask, key, trail, win: false };
}

// Runs a program (a list of {dir, n}) without drawing anything.
// Returns every tile the robot passes and how it ended: 'win', 'bump' or 'short'.
export function simulate(lv, program) {
  let st = { ...lv.start, mask: 0, key: false };
  const steps = [];
  for (let ci = 0; ci < program.length; ci++) {
    const c = program[ci];
    for (let k = 0; k < c.n; k++) {
      const r = stepFrom(lv, st, c.dir);
      if (!r) return { steps, result: 'bump', card: ci, dir: c.dir, at: { x: st.x, y: st.y } };
      for (const t of r.trail) steps.push({ ...t, card: ci, dir: c.dir });
      st = r;
      if (r.win) return { steps, result: 'win', mask: r.mask };
    }
  }
  const last = program[program.length - 1];
  return { steps, result: 'short', mask: st.mask, end: { x: st.x, y: st.y, mask: st.mask, key: st.key, dir: last ? last.dir : null, run: last ? last.n : 0 } };
}

// The shortest way to collect the remaining stars and then reach the battery:
// fewest new cards first, then fewest steps. `from` may continue the last placed card
// (same direction, still room to repeat), which costs no new card.
// Returns { moves: ['right', ...], cards } or null.
export function plan(lv, from = { ...lv.start, mask: 0, key: false, dir: null, run: 0 }, needAll = true) {
  const D = DIR_ORDER.length;
  const key = (x, y, m, kk, d, r) => ((((y * lv.W + x) * (lv.full + 1) + m) * 2 + (kk ? 1 : 0)) * (D + 1) + d) * 4 + r;
  const WIN = -1;
  const startDir = from.dir ? DIR_ORDER.indexOf(from.dir) : D;
  const startRun = Math.min(from.run || 0, 3);
  const buckets = [];
  const best = new Map();
  const prev = new Map();
  const push = (cost, st) => (buckets[cost] ||= []).push(st);
  const k0 = key(from.x, from.y, from.mask, from.key, startDir, startRun);
  best.set(k0, 0);
  push(0, { x: from.x, y: from.y, mask: from.mask, key: !!from.key, d: startDir, r: startRun, k: k0 });
  let winCost = Infinity, winPrev = null;
  for (let cost = 0; cost < buckets.length && cost <= winCost; cost++) {
    for (const st of buckets[cost] || []) {
      if (st.k === WIN) {
        const moves = [];
        for (let at = winPrev; ; ) {
          moves.unshift(at[1]);
          if (!prev.has(at[0])) break;
          at = prev.get(at[0]);
        }
        return { moves, cards: Math.floor(cost / 100) };
      }
      if (best.get(st.k) !== cost) continue;
      for (let nd = 0; nd < D; nd++) {
        const r = stepFrom(lv, st, DIR_ORDER[nd]);
        if (!r) continue;
        const same = nd === st.d && st.r < lv.maxRep;
        const nr = same ? st.r + 1 : 1;
        const nc = cost + (same ? 1 : 101);
        if (r.win) {
          if ((needAll && r.mask !== lv.full) || nc >= winCost) continue;
          winCost = nc;
          winPrev = [st.k, DIR_ORDER[nd]];
          push(nc, { k: WIN });
          continue;
        }
        const nk = key(r.x, r.y, r.mask, r.key, nd, nr);
        if (best.has(nk) && best.get(nk) <= nc) continue;
        best.set(nk, nc);
        prev.set(nk, [st.k, DIR_ORDER[nd]]);
        push(nc, { x: r.x, y: r.y, mask: r.mask, key: r.key, d: nd, r: nr, k: nk });
      }
    }
  }
  return needAll ? plan(lv, from, false) : null;
}

export const levels = LEVELS.map(parse);
