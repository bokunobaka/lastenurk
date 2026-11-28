// Checks every road in src/levels.js (npm run check):
//  - the road never bends faster than the car can steer, and everything stands on the road
//  - every star can be reached from the one before (going no faster sideways than the car can)
//  - wherever something blocks the road there is always a way past wide enough for the car
//  - stars are not right next to things to bump into (except the ones up in the air after a ramp)
//  - nothing else is on the road where ducks or cows cross, or ahead of a slow car
import { LEVELS } from '../src/levels.js';
import { build, CAR_W, CAR_L, SIDE, SIZE, HAZARD } from '../src/track.js';
import { THEMES } from '../src/themes.js';

let bad = 0;
const fail = (i, msg) => {
  bad++;
  console.log(`  level ${i + 1}: ${msg}`);
};

LEVELS.forEach((lv, i) => {
  if (!THEMES[lv.theme]) return fail(i, `no theme "${lv.theme}"`);
  const T = build(lv);
  const side = SIDE * 0.7; // leave the child some slack

  let steep = 0;
  for (let y = 0; y < T.length; y += 10) steep = Math.max(steep, Math.abs(T.roadX(y + 10) - T.roadX(y)) / 10);
  if (steep * T.speed > side * 0.75) fail(i, `the road bends too fast (${(steep * T.speed).toFixed(0)}/s sideways)`);

  for (const it of T.items) {
    if (it.kind === 'duck' || it.kind === 'cow') continue;
    if (Math.abs(it.x - T.roadX(it.y)) + SIZE[it.kind] > T.half + 1) fail(i, `${it.kind} at ${it.y} is off the road`);
  }

  const stars = T.items.filter((s) => s.kind === 'star');
  let px = 0, py = 0;
  for (const s of stars) {
    const t = (s.y - py) / T.speed;
    if (Math.abs(s.x - px) > side * t + 1) fail(i, `star at ${s.y} cannot be reached in time`);
    px = s.x;
    py = s.y;
  }

  const blocks = T.items.filter((it) => HAZARD.includes(it.kind));
  for (let y = 0; y < T.length; y += 20) {
    const mid = T.roadX(y);
    const here = blocks
      .filter((b) => Math.abs(b.y - y) < CAR_L / 2 + SIZE[b.kind])
      .map((b) => [b.x - mid - SIZE[b.kind], b.x - mid + SIZE[b.kind]])
      .sort((a, b) => a[0] - b[0]);
    let x = -T.half, widest = 0;
    for (const [a, b] of here) {
      widest = Math.max(widest, a - x);
      x = Math.max(x, b);
    }
    widest = Math.max(widest, T.half - x);
    if (widest < CAR_W + 50) fail(i, `no way past at ${y} (widest gap ${widest.toFixed(0)})`);
  }

  for (const s of stars) {
    if (s.air) continue;
    for (const b of blocks) if (Math.abs(b.y - s.y) < 100 && Math.abs(b.x - s.x) < 100) fail(i, `star at ${s.y} is right next to a ${b.kind}`);
  }

  for (const c of T.items.filter((it) => ['duck', 'cow', 'car'].includes(it.kind))) {
    const from = c.kind === 'car' ? c.y - 200 : c.y - 500;
    const to = c.kind === 'car' ? c.y + 1100 : c.y + 500;
    for (const it of T.items) {
      if (it === c || it.y < from || it.y > to) continue;
      if (it.kind !== 'star') fail(i, `${it.kind} at ${it.y} is too close to the ${c.kind} at ${c.y}`);
      else if (c.kind === 'car' && it.lane === c.lane && it.y > c.y - 200) fail(i, `star at ${it.y} is in the slow car's lane`);
    }
  }

  const secs = (T.length / T.speed).toFixed(0);
  const kinds = {};
  for (const it of T.items) kinds[it.kind] = (kinds[it.kind] || 0) + 1;
  console.log(`level ${String(i + 1).padStart(2)}: ${lv.theme.padEnd(8)} ~${secs}s  ${Object.entries(kinds).map(([k, n]) => `${k} ${n}`).join(', ')}`);
});

if (bad) {
  console.log(`\n${bad} problem(s)`);
  process.exit(1);
}
console.log('\nall roads OK');
