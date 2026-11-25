// Checks every picture: pieces stay on the board, do not overlap, all touch into one picture,
// turning levels really need turning, and extra pieces fit no place.
import { levels } from '../src/levels.js';
import { points, contains, shapeKey, period } from '../src/shapes.js';

const placed = (p) => points(p).map(([x, y]) => [x + p.x, y + p.y]);

function segDist([px, py], [ax, ay], [bx, by]) {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}
function gap(a, b) {
  let d = Infinity;
  for (const [P, Q] of [[a, b], [b, a]])
    for (const q of P) for (let i = 0; i < Q.length; i++) d = Math.min(d, segDist(q, Q[i], Q[(i + 1) % Q.length]));
  return d;
}

let bad = 0;
const fail = (lv, msg) => {
  bad++;
  console.log(`  ✗ level ${lv.index + 1} (${lv.id}): ${msg}`);
};

for (const lv of levels) {
  const ps = lv.pieces;
  const polys = ps.map(placed);
  // on the board
  ps.forEach((p, i) => {
    if (polys[i].some(([x, y]) => x < -1e-6 || y < -1e-6 || x > lv.W + 1e-6 || y > lv.H + 1e-6)) fail(lv, `piece ${i + 1} (${p.k}) sticks out of the board`);
  });
  // no overlaps: sample the board
  const step = 0.02;
  const over = new Map();
  for (let y = step / 2; y < lv.H; y += step)
    for (let x = step / 2; x < lv.W; x += step) {
      const inside = ps.filter((p) => contains(p, x, y)).map((p) => p.i);
      if (inside.length > 1) {
        const k = inside.join('+');
        over.set(k, (over.get(k) || 0) + step * step);
      }
    }
  for (const [k, area] of over) if (area > 0.01) fail(lv, `pieces ${k.split('+').map((n) => +n + 1).join(' and ')} overlap (${area.toFixed(2)} units²)`);
  // one picture: every piece touches another, all joined
  const seen = new Set([0]);
  const todo = [0];
  while (todo.length) {
    const i = todo.pop();
    ps.forEach((_, j) => {
      if (!seen.has(j) && gap(polys[i], polys[j]) < 0.08) seen.add(j), todo.push(j);
    });
  }
  if (seen.size < ps.length) fail(lv, `pieces ${ps.filter((_, j) => !seen.has(j)).map((p) => p.i + 1).join(', ')} float apart from the rest`);
  // turning levels: some piece must need a turn
  if (lv.rotate && !ps.some((p) => period(p) !== 90)) fail(lv, 'turning is on but every piece is round or square');
  // extra pieces fit nowhere, at any turn
  for (const e of lv.extra)
    if (ps.some((p) => [0, 90, 180, 270].some((r) => shapeKey(e, r) === shapeKey(p)))) fail(lv, `extra ${e.k} fits a place`);
  if (!over.size && seen.size === ps.length) console.log(`  ✓ level ${lv.index + 1} ${lv.id}: ${ps.length} pieces${lv.extra.length ? ` + ${lv.extra.length} extra` : ''}${lv.rotate ? ', turning' : ''}${lv.outline ? '' : ', no outlines'}`);
}
console.log(bad ? `\n${bad} problem(s)` : `\nAll ${levels.length} pictures are fine.`);
process.exit(bad ? 1 : 0);
