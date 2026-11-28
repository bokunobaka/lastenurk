// Builds a level's road from its plan in src/levels.js. Everything comes from a seeded random,
// so the game and the check tool (tools/check-levels.mjs) see exactly the same road.
// World units: x across (0 = where the road starts), y forward along the road.
import { THEMES, NEAR } from './themes.js';

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

  // ---------- things on the road, row by row ----------
  const items = [];
  const add = (kind, y, lane, more = {}) => items.push({ kind, y, x: laneX(y, lane), lane, ...more });
  const pick = picker(R, lv.mix);
  const hazards = Object.keys(lv.mix).filter((k) => HAZARD.includes(k));
  let trail = 0; // the lane the stars run in
  let calmUntil = 0; // after a ramp, crossing animal or slow car: only stars for a while
  let carLane = null; // a slow car's lane stays free of stars until calmUntil
  let lastHazard = -1e9;
  const otherLane = (not) => {
    const ls = [-1, 0, 1].filter((l) => l !== not);
    return ls[Math.floor(R() * ls.length)];
  };

  for (let y = 900; y < length - 800; y += STEP) {
    let kind = y < 1500 ? 'star' : pick();
    if (y < calmUntil && kind !== 'star') kind = 'star';
    if ((kind === 'duck' || kind === 'cow' || kind === 'car') && y - lastHazard < 600) kind = 'star';
    if (y >= calmUntil) carLane = null;

    if (kind === 'star') {
      // now and then the stars move one lane over (leaving out the first star, so there is time to steer)
      let moved = false;
      if (R() < 0.4) {
        const to = Math.max(-1, Math.min(1, trail + (R() < 0.5 ? -1 : 1)));
        if (to !== carLane && to !== trail) (trail = to), (moved = true);
      }
      if (!moved) add('star', y, trail);
      add('star', y + STEP / 2, trail);
    } else if (HAZARD.includes(kind)) {
      // in a lane next to the stars (cones come in a little line); sometimes two lanes are closed
      const lanes = [otherLane(trail)];
      if (R() < 0.25) lanes.push([-1, 0, 1].find((l) => l !== trail && l !== lanes[0]));
      for (const l of lanes) {
        if (kind === 'cone') for (let k = 0; k < 3; k++) add('cone', y - 60 + k * 70, l);
        else add(kind, y, l);
      }
      add('star', y, trail);
      lastHazard = y;
    } else if (kind === 'puddle') {
      add('puddle', y, Math.floor(R() * 3) - 1);
      add('star', y + STEP / 2, trail);
      lastHazard = y;
    } else if (kind === 'ramp') {
      // a ramp in the star lane: stars up in the air and something to jump over
      add('ramp', y, trail);
      add('star', y + 140, trail, { air: true });
      add('star', y + 330, trail, { air: true });
      add(hazards[0] || 'cone', y + 235, trail);
      lastHazard = y + 235;
      y += STEP; // nothing right after the landing
      calmUntil = y + STEP;
    } else if (kind === 'duck' || kind === 'cow') {
      // they walk across the road when the car comes near
      const dir = R() < 0.5 ? 1 : -1;
      items.push({ kind, y, x: roadX(y) - dir * (half + 90), lane: null, dir, n: kind === 'duck' ? 3 : 1 });
      calmUntil = y + 2 * STEP;
      lastHazard = y;
    } else if (kind === 'car') {
      // a slow car ahead in another lane; it starts driving when the player comes near
      carLane = otherLane(trail);
      add('car', y, carLane, { color: Math.floor(R() * 4) });
      calmUntil = y + 4 * STEP;
      lastHazard = y;
    }
  }
  items.sort((a, b) => a.y - b.y);

  // ---------- roadside things ----------
  const theme = THEMES[lv.theme];
  const decor = [];
  for (const side of [-1, 1]) {
    const weights = (side < 0 ? theme.left : theme.right) || theme.decor;
    const pickDecor = picker(R, weights);
    for (let y = -900; y < length + 1700; y += 70 + R() * 120) {
      const kind = pickDecor();
      const near = NEAR[kind] ?? 40;
      const seaSide = theme.sea && side < 0;
      const d = seaSide ? half + 30 + R() * 130 : half + near + R() ** 1.4 * 560;
      const x = roadX(y) + side * d;
      if (y > length - 100 && Math.abs(x) < 520) continue; // keep the way to the end clear
      decor.push({ kind, x, y, side, v: Math.floor(R() * 4), s: 0.85 + R() * 0.35 });
    }
  }

  return { lv, width, half, gap, length, speed, roadX, laneX, items, decor, theme, stars: items.filter((i) => i.kind === 'star').length };
}
