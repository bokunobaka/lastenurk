// Checks every level: both stations join the track, the solved track runs from the start to the goal
// past every waiting animal, the level does not start solved, and turning the wrong pieces solves it.
// Usage: npm run check
import { levels, route, wrongPiece, tap } from '../src/levels.js';

let bad = 0;
for (const lv of levels) {
  const n = lv.index + 1;
  const problems = [];
  if (!lv.start?.dir) problems.push('start station joins no track');
  if (!lv.goal?.dir) problems.push('goal station joins no track');
  if (lv.map.some((r) => [...r].length !== lv.W)) problems.push('rows have different lengths');
  for (const p of lv.pieces.values()) if (p.type === 'Y' && !p.stem) problems.push(`switch at ${p.x},${p.y} has no entry in switches`);
  if (route(lv).result === 'win') problems.push('starts already solved');
  // solve it the way the hint does: turn the first wrong piece until it fits, again and again
  let taps = 0;
  for (let p; (p = wrongPiece(lv)) && taps < 200; ) {
    tap(p);
    taps++;
  }
  const r = route(lv);
  if (r.result !== 'win') problems.push('the solved track does not reach the goal');
  const passed = new Set(r.tiles.map((t) => `${t.x},${t.y}`));
  for (const a of lv.riders) if (!passed.has(`${a.x},${a.y}`)) problems.push(`rider at ${a.x},${a.y} is off the route`);
  const turnable = [...lv.pieces.values()].filter((p) => !p.fixed);
  const extra = turnable.filter((p) => !lv.path.includes(`${p.x},${p.y}`)).length;
  console.log(`${String(n).padStart(2)}  ${lv.W}x${lv.H}  route ${lv.path.length}  turnable ${turnable.length} (${extra} extra)  riders ${lv.riders.length}  taps ${taps}`);
  if (problems.length) {
    bad++;
    console.log(`    !! level ${n}: ${problems.join(', ')}`);
  }
}
process.exit(bad ? 1 : 0);
