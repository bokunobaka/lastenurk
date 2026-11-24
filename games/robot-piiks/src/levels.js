// The levels and the puzzle rules. No DOM here, so tools/check-levels.mjs can run it in node.
//
// Map letters: P start, B battery (goal), * star, . grass,
//              R rock, T tree, ~ pond, # crate (all four block the way).
// cards: which arrows the level offers. repeat: a placed card can be tapped to do 2 or 3 steps.
// The number of card slots is the fewest cards that collect every star and reach the battery,
// plus `slack` (spare slots, for the early levels).

export const LEVELS = [
  // one direction, then two
  { map: ['...', 'P.B', '...'], cards: ['right'], slack: 1, tip: 'tip.first' },
  { map: ['....', 'P*.B', '....'], cards: ['right'], slack: 1, tip: 'tip.star' },
  { map: ['.B.', '.*.', '.P.'], cards: ['up', 'right'], slack: 1, tip: 'tip.up' },
  { map: ['...B', '..*.', 'P...'], cards: ['up', 'right'], slack: 1 },
  // things in the way, all four directions
  { map: ['..*..', 'P.R.B', '.....'], cards: ['up', 'right', 'down'], slack: 1, tip: 'tip.rock' },
  { map: ['.....', 'B...P', '..*..'], cards: ['left', 'up', 'down'], slack: 1, tip: 'tip.left' },
  { map: ['P.T.', '.T..', '...T', 'T.*B'], cards: ['up', 'right', 'down', 'left'], slack: 1 },
  { map: ['~~..B', 'P..#.', '..*..', '.#...'], cards: ['up', 'right', 'down', 'left'], slack: 1 },
  { map: ['B.T..', '.#T..', '.*T..', '....P'], cards: ['up', 'right', 'down', 'left'], slack: 1 },
  { map: ['P....', 'TTTT.', 'B*...'], cards: ['up', 'right', 'down', 'left'], slack: 0, tip: 'tip.long' },
  // one card, more steps
  { map: ['......', 'P....B', '......'], cards: ['right'], repeat: true, slack: 0, tip: 'tip.repeat' },
  { map: ['*..B', '....', '....', 'P...'], cards: ['up', 'right'], repeat: true, slack: 0 },
  { map: ['P..T..', '...T..', '...T..', '..*..B'], cards: ['up', 'right', 'down'], repeat: true, slack: 0 },
  { map: ['P.T.B', '..T..', '..T..', '..*..'], cards: ['up', 'right', 'down'], repeat: true, slack: 0 },
  { map: ['..*..', '.T.T.', 'P.R.B', '.T.T.', '.....'], cards: ['up', 'right', 'down', 'left'], repeat: true, slack: 0 },
  { map: ['B.#...', '..#.T.', '..#.T.', '.*..T.', 'TTT..P'], cards: ['up', 'right', 'down', 'left'], repeat: true, slack: 0 },
  { map: ['P....', '.~~~.', '.~*~.', '.~.~.', '...B.'], cards: ['up', 'right', 'down', 'left'], repeat: true, slack: 0, tip: 'tip.back' },
  { map: ['P.*...', 'TTTTT.', '....*.', '.TTTTT', '.....B'], cards: ['up', 'right', 'down', 'left'], repeat: true, slack: 0, tip: 'tip.long' },
  { map: ['P.#....', '..#.##.', '..*..#.', '.###.#.', '.....#B'], cards: ['up', 'right', 'down', 'left'], repeat: true, slack: 0 },
  { map: ['*....T.', '.TT..T.', 'P.T*.T.', '.TT....', '.....TB'], cards: ['up', 'right', 'down', 'left'], repeat: true, slack: 0, tip: 'tip.last' },
];

export const DIR_ORDER = ['up', 'right', 'down', 'left'];
export const STEP = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };
const BLOCKS = 'RT~#';

// map strings -> a level object the game and the solver use
export function parse(def, index) {
  const H = def.map.length, W = def.map[0].length;
  const lv = { ...def, index, W, H, stars: [], blocked: new Set(), maxRep: def.repeat ? 3 : 1 };
  def.map.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === 'P') lv.start = { x, y };
      else if (ch === 'B') lv.goal = { x, y };
      else if (ch === '*') lv.stars.push({ x, y });
      else if (BLOCKS.includes(ch)) lv.blocked.add(`${x},${y}`);
    })
  );
  lv.full = (1 << lv.stars.length) - 1;
  lv.slots = plan(lv).cards + (def.slack || 0);
  return lv;
}

const free = (lv, x, y) => x >= 0 && y >= 0 && x < lv.W && y < lv.H && !lv.blocked.has(`${x},${y}`);
const starAt = (lv, x, y) => lv.stars.findIndex((s) => s.x === x && s.y === y);

// Runs a program (a list of {dir, n}) without drawing anything.
// Returns every step the robot takes and how it ended: 'win', 'bump' or 'short'.
export function simulate(lv, program) {
  let { x, y } = lv.start;
  let mask = 0;
  const steps = [];
  for (let ci = 0; ci < program.length; ci++) {
    const c = program[ci];
    for (let k = 0; k < c.n; k++) {
      const [dx, dy] = STEP[c.dir];
      if (!free(lv, x + dx, y + dy)) return { steps, result: 'bump', card: ci, dir: c.dir, at: { x, y } };
      x += dx;
      y += dy;
      const s = starAt(lv, x, y);
      const star = s >= 0 && !(mask & (1 << s)) ? s : -1;
      if (star >= 0) mask |= 1 << star;
      steps.push({ x, y, card: ci, dir: c.dir, star });
      if (x === lv.goal.x && y === lv.goal.y) return { steps, result: 'win', mask };
    }
  }
  const last = program[program.length - 1];
  return { steps, result: 'short', mask, end: { x, y, mask, dir: last ? last.dir : null, run: last ? last.n : 0 } };
}

// The shortest way to collect the remaining stars and then reach the battery:
// fewest new cards first, then fewest steps. `from` may continue the last placed card
// (same direction, still room to repeat), which costs no new card.
// Returns { moves: ['right', ...], cards } or null.
export function plan(lv, from = { ...lv.start, mask: 0, dir: null, run: 0 }, needAll = true) {
  const D = DIR_ORDER.length;
  const key = (x, y, m, d, r) => (((y * lv.W + x) * (lv.full + 1) + m) * (D + 1) + d) * 4 + r;
  const startDir = from.dir ? DIR_ORDER.indexOf(from.dir) : D;
  const startRun = Math.min(from.run || 0, 3);
  const buckets = [];
  const best = new Map();
  const prev = new Map();
  const push = (cost, st) => (buckets[cost] ||= []).push(st);
  const k0 = key(from.x, from.y, from.mask, startDir, startRun);
  best.set(k0, 0);
  push(0, [from.x, from.y, from.mask, startDir, startRun, k0]);
  for (let cost = 0; cost < buckets.length; cost++) {
    for (const [x, y, m, d, r, k] of buckets[cost] || []) {
      if (best.get(k) !== cost) continue;
      if (x === lv.goal.x && y === lv.goal.y && (m === lv.full || !needAll)) {
        const moves = [];
        for (let at = k; prev.has(at); at = prev.get(at)[0]) moves.unshift(prev.get(at)[1]);
        return { moves, cards: Math.floor(cost / 100) };
      }
      if (x === lv.goal.x && y === lv.goal.y && !(x === from.x && y === from.y)) continue; // the battery ends the run
      for (let nd = 0; nd < D; nd++) {
        const [dx, dy] = STEP[DIR_ORDER[nd]];
        const nx = x + dx, ny = y + dy;
        if (!free(lv, nx, ny)) continue;
        const s = starAt(lv, nx, ny);
        const nm = s >= 0 ? m | (1 << s) : m;
        const same = nd === d && r < lv.maxRep;
        const nr = same ? r + 1 : 1;
        const nc = cost + (same ? 1 : 101);
        const nk = key(nx, ny, nm, nd, nr);
        if (best.has(nk) && best.get(nk) <= nc) continue;
        best.set(nk, nc);
        prev.set(nk, [k, DIR_ORDER[nd]]);
        push(nc, [nx, ny, nm, nd, nr, nk]);
      }
    }
  }
  return needAll ? plan(lv, from, false) : null;
}

export const levels = LEVELS.map(parse);
