// Builds a level's road from its plan in src/levels.js. Everything comes from a seeded random,
// so the game and the check tool (tools/check-levels.mjs) see exactly the same road.
// World units: x across (0 = where the road starts), y forward along the road.
import { THEMES, NEAR } from './themes.js';
import { ENDLESS } from './levels.js';

export const CAR_W = 76; // the player's car, across
export const CAR_L = 124; // and along
export const SIDE = 560; // fastest sideways speed, units a second
export const STEP = 300; // from one row of things on the road to the next

// item sizes (half-widths) for bumping into them
export const SIZE = { star: 34, cone: 24, rock: 40, snowman: 38, puddle: 52, ramp: 60, duck: 22, cow: 54, car: 40 };
export const HAZARD = ['cone', 'rock', 'snowman'];

export function rng(seed) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smooth = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));

function picker(R, weights) {
  const list = Object.entries(weights);
  const total = list.reduce((s, [, w]) => s + w, 0);
  return () => {
    let r = R() * total;
    for (const [k, w] of list) if ((r -= w) < 0) return k;
    return list[0][0];
  };
}

// One row of things on the road at y; returns where the next row goes. `st` carries on from row to row
// (and from one stretch of an endless road to the next): which lane the stars run in, and so on.
// `step` is the distance between rows: longer when the car is faster, so there is the same time to steer.
function rowMaker(R, mix, st, roadX, laneX, half, push, step = STEP) {
  const add = (kind, y, lane, more = {}) => push({ kind, y, x: laneX(y, lane), lane, ...more });
  const pick = picker(R, mix);
  const hazards = Object.keys(mix).filter((k) => HAZARD.includes(k));
  const otherLane = (not) => {
    const ls = [-1, 0, 1].filter((l) => l !== not);
    return ls[Math.floor(R() * ls.length)];
  };
  return (y, starsOnly) => {
    let kind = starsOnly ? 'star' : pick();
    if (y < st.calmUntil && kind !== 'star') kind = 'star';
    if ((kind === 'duck' || kind === 'cow' || kind === 'car') && y - st.lastHazard < 600) kind = 'star';
    if (y >= st.calmUntil) st.carLane = null;

    if (kind === 'star') {
      // now and then the stars move one lane over (leaving out the first star, so there is time to steer)
      let moved = false;
      if (R() < 0.4) {
        const to = Math.max(-1, Math.min(1, st.trail + (R() < 0.5 ? -1 : 1)));
        if (to !== st.carLane && to !== st.trail) (st.trail = to), (moved = true);
      }
      if (!moved) add('star', y, st.trail);
      add('star', y + step / 2, st.trail);
    } else if (HAZARD.includes(kind)) {
      // in a lane next to the stars (cones come in a little line); sometimes two lanes are closed
      const lanes = [otherLane(st.trail)];
      if (R() < 0.25) lanes.push([-1, 0, 1].find((l) => l !== st.trail && l !== lanes[0]));
      for (const l of lanes) {
        if (kind === 'cone') for (let k = 0; k < 3; k++) add('cone', y - 60 + k * 70, l);
        else add(kind, y, l);
      }
      add('star', y, st.trail);
      st.lastHazard = y;
    } else if (kind === 'puddle') {
      add('puddle', y, Math.floor(R() * 3) - 1);
      add('star', y + step / 2, st.trail);
      st.lastHazard = y;
    } else if (kind === 'ramp') {
      // a ramp in the star lane: stars up in the air and something to jump over
      add('ramp', y, st.trail);
      add('star', y + 140, st.trail, { air: true });
      add('star', y + 330, st.trail, { air: true });
      add(hazards[0] || 'cone', y + 235, st.trail);
      st.lastHazard = y + 235;
      y += step; // nothing right after the landing
      st.calmUntil = y + step;
    } else if (kind === 'duck' || kind === 'cow') {
      // they walk across the road when the car comes near
      const dir = R() < 0.5 ? 1 : -1;
      push({ kind, y, x: roadX(y) - dir * (half + 90), lane: null, dir, n: kind === 'duck' ? 3 : 1 });
      st.calmUntil = y + 2 * step;
      st.lastHazard = y;
    } else if (kind === 'car') {
      // a slow car ahead in another lane; it starts driving when the player comes near
      st.carLane = otherLane(st.trail);
      add('car', y, st.carLane, { color: Math.floor(R() * 4) });
      st.calmUntil = y + 4 * step;
      st.lastHazard = y;
    }
    return y + step;
  };
}
const newRowState = () => ({ trail: 0, calmUntil: 0, carLane: null, lastHazard: -1e9 });

// roadside things on one side from y0 to y1
function scenery(R, theme, side, y0, y1, roadX, half, push) {
  const pickDecor = picker(R, (side < 0 ? theme.left : theme.right) || theme.decor);
  for (let y = y0; y < y1; y += 70 + R() * 120) {
    const kind = pickDecor();
    const near = NEAR[kind] ?? 40;
    const d = theme.sea && side < 0 ? half + 30 + R() * 130 : half + near + R() ** 1.4 * 560;
    push({ kind, x: roadX(y) + side * d, y, side, v: Math.floor(R() * 4), s: 0.85 + R() * 0.35 });
  }
}

export function build(lv) {
  const R = rng(lv.seed);
  const width = lv.width || 480;
  const half = width / 2;
  const gap = Math.round(width * 0.3); // between lanes
  const length = lv.length;
  const speed = lv.speed || 380;

  // the middle of the road: two slow waves, straight at the start and before the finish
  const A = (lv.curvy || 0) * 420;
  const waves = A
    ? [
        { a: A * 0.6, f: (2 * Math.PI) / (2600 + R() * 600), p: R() * 6.28 },
        { a: A * 0.4, f: (2 * Math.PI) / (1500 + R() * 400), p: R() * 6.28 },
      ]
    : [];
  const fade = (y) => smooth((y - 500) / 900) * smooth((length - 300 - y) / 900);
  const roadX = (y) => {
    let x = 0;
    for (const w of waves) x += w.a * Math.sin(w.f * y + w.p);
    return x * fade(y);
  };
  const laneX = (y, l) => roadX(y) + l * gap;

  const items = [];
  const row = rowMaker(R, lv.mix, newRowState(), roadX, laneX, half, (it) => items.push(it));
  for (let y = 900; y < length - 800; ) y = row(y, y < 1500);
  items.sort((a, b) => a.y - b.y);

  const theme = THEMES[lv.theme];
  let decor = [];
  for (const side of [-1, 1]) scenery(R, theme, side, -900, length + 1700, roadX, half, (d) => decor.push(d));
  decor = decor.filter((d) => !(d.y > length - 100 && Math.abs(d.x) < 520)); // keep the way to the end clear

  const seg = { y0: -Infinity, y1: Infinity, plan: lv, theme };
  return {
    lv, width, half, gap, length, speed, roadX, laneX, items, decor, theme,
    stars: items.filter((i) => i.kind === 'star').length,
    speedAt: () => speed,
    themeAt: () => theme,
    planAt: () => lv,
    nightAt: () => (lv.night ? 1 : 0),
    segsIn: () => [seg],
  };
}

// ---------- the endless road ----------
// Stretches of SEG units, one landscape after another (ENDLESS in src/levels.js), round and round.
// Each stretch is a little faster, and every round has more things on the road. Built ahead of the car
// with extend(), dropped behind it with prune(). A new seed makes a new road.
export const SEG = 5000;

export function endless(seed) {
  const R0 = rng(seed);
  const width = 480, half = 240, gap = Math.round(width * 0.3);
  const waves = [
    { w: 0.6, f: (2 * Math.PI) / (2600 + R0() * 600), p: R0() * 6.28 },
    { w: 0.4, f: (2 * Math.PI) / (1500 + R0() * 400), p: R0() * 6.28 },
  ];
  const plans = [];
  const planOf = (k) => {
    if (k < 0) k = 0;
    if (!plans[k]) {
      const base = ENDLESS[k % ENDLESS.length];
      const round = Math.floor(k / ENDLESS.length);
      const mix = {};
      for (const [kind, w] of Object.entries(base.mix)) mix[kind] = kind === 'star' ? w : w * (1 + 0.35 * Math.min(round, 4));
      plans[k] = { ...base, mix, curvy: Math.min(base.curvy ?? 0.3, 0.4), speed: Math.min(380 + k * 10, 500), k };
    }
    return plans[k];
  };
  const segOf = (k) => ({ k, y0: k * SEG, y1: (k + 1) * SEG, plan: planOf(k), theme: THEMES[planOf(k).theme] });
  // how curvy, blended smoothly from the middle of one stretch to the middle of the next
  const curvyAt = (y) => {
    const u = y / SEG - 0.5, k = Math.floor(u);
    return planOf(k).curvy + (planOf(k + 1).curvy - planOf(k).curvy) * smooth(u - k);
  };
  const roadX = (y) => {
    let x = 0;
    for (const w of waves) x += w.w * Math.sin(w.f * y + w.p);
    return x * 420 * curvyAt(y) * smooth((y - 500) / 900);
  };
  const laneX = (y, l) => roadX(y) + l * gap;
  const at = (y) => Math.max(0, Math.floor(y / SEG));

  const st = newRowState();
  let nextRow = 900;
  let built = 0; // stretches built so far
  const T = {
    endless: true, width, half, gap, length: Infinity, roadX, laneX, items: [], decor: [], stars: 0,
    speedAt: (y) => planOf(at(y)).speed,
    themeAt: (y) => THEMES[planOf(at(y)).theme],
    planAt: (y) => planOf(at(y)),
    segAt: (y) => segOf(at(y)),
    // night falls and lifts slowly over the first and last bit of a night stretch
    nightAt: (y) => {
      const s = segOf(at(y));
      return s.plan.night ? smooth((y - s.y0) / 800) * smooth((s.y1 - y) / 800) : 0;
    },
    segsIn: (a, b) => {
      const out = [];
      for (let k = at(a); k <= at(b); k++) out.push(segOf(k));
      return out;
    },
    // build the road up to y; returns the new things on it
    extend(y) {
      const fresh = [];
      while (built * SEG < y) {
        const k = built++;
        const s = segOf(k);
        const R = rng(seed * 7919 + k * 104729 + 1);
        const push = (it) => fresh.push(it);
        const row = rowMaker(R, s.plan.mix, st, roadX, laneX, half, push, Math.round((STEP * s.plan.speed) / 380));
        // the first bit of every stretch: only stars, so a new landscape starts gently
        while (nextRow < s.y1) nextRow = row(nextRow, nextRow < Math.max(1500, s.y0 + 600));
        for (const side of [-1, 1]) scenery(R, s.theme, side, k ? s.y0 : -900, s.y1, roadX, half, (d) => T.decor.push(d));
        // a sign by the road where a new landscape begins
        if (k) T.decor.push({ kind: 'sign', x: roadX(s.y0 + 150) + half + 70, y: s.y0 + 150, side: 1, v: 0, s: 1, emoji: s.theme.emoji });
      }
      fresh.sort((a, b) => a.y - b.y);
      T.items.push(...fresh);
      T.stars += fresh.filter((i) => i.kind === 'star').length;
      T.decor.sort((a, b) => a.y - b.y);
      return fresh;
    },
    // forget everything behind y
    prune(y) {
      T.items = T.items.filter((i) => i.y > y);
      T.decor = T.decor.filter((d) => d.y > y);
    },
  };
  return T;
}
