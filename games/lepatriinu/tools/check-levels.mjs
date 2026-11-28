// Checks every level: the map is a rectangle with a hedge all round and only known letters, one start and one
// flower, 1-7 spots, every button has its gate and every gate its button; every spot and the flower can be
// reached (pressing the buttons that can be reached), and every gate is needed (kept shut, something is
// out of reach). The ladybug never has to pass a hole or a mushroom in the same cell.
import { LEVELS } from '../src/levels.js';
import { parse, reach } from '../src/maze.js';

const LETTERS = '#.SH*OimTabcABC';
let bad = 0;

LEVELS.forEach((lv, i) => {
  const fail = (msg) => {
    bad++;
    console.log(`  ✗ level ${i + 1}: ${msg}`);
  };
  const rows = lv.map;
  const W = rows[0].length, H = rows.length;
  if (rows.some((r) => r.length !== W)) return fail('rows are not all the same length');
  if (Math.max(W, H) > 13 || Math.min(W, H) > 9) fail(`${W} x ${H} is too big`);
  for (const r of rows) for (const ch of r) if (!LETTERS.includes(ch)) fail(`unknown letter "${ch}"`);
  for (let x = 0; x < W; x++) if (rows[0][x] !== '#' || rows[H - 1][x] !== '#') fail('no hedge along the top or bottom');
  for (let y = 0; y < H; y++) if (rows[y][0] !== '#' || rows[y][W - 1] !== '#') fail('no hedge along a side');
  const count = (ch) => rows.join('').split(ch).length - 1;
  if (count('S') !== 1) fail('needs exactly one start S');
  if (count('H') !== 1) fail('needs exactly one flower H');
  const m = parse(lv);
  if (m.spots.length < 1 || m.spots.length > 7) fail(`${m.spots.length} spots (1-7)`);
  for (const id of 'abc') {
    const b = m.buttons.filter((x) => x.id === id).length, d = m.doors.filter((x) => x.id === id).length;
    if (b > 1) fail(`two buttons ${id}`);
    if (b !== (d ? 1 : 0) || (b && !d)) fail(`button ${id} and gate ${id.toUpperCase()} do not match`);
  }
  if (!lv.tip) fail('no tip');
  if (!m.start || !m.home) return;

  const targets = [...m.spots, m.home];
  const { seen, open } = reach(m);
  for (const t of targets) if (!seen.has(`${t.x},${t.y}`)) fail(`${t === m.home ? 'the flower' : 'a spot'} at ${t.x},${t.y} cannot be reached`);
  for (const b of m.buttons) if (!open.has(b.id)) fail(`button ${b.id} cannot be reached`);
  for (const id of new Set(m.doors.map((d) => d.id))) {
    const shut = reach(m, id).seen;
    if (targets.every((t) => shut.has(`${t.x},${t.y}`))) fail(`gate ${id.toUpperCase()} is not needed`);
  }

  // the map, with what cannot be reached greyed out as ░
  const pic = rows.map((r, y) => [...r].map((ch, x) => (ch === '#' || seen.has(`${x},${y}`) ? ch : ch === '.' ? '░' : ch)).join(''));
  console.log(`  ${String(i + 1).padStart(2)}: ${W}x${H}, ${m.spots.length} spots${m.doors.length ? `, gates ${[...new Set(m.doors.map((d) => d.id.toUpperCase()))].join('')}` : ''}`);
  if (process.argv.includes('--maps')) for (const r of pic) console.log(`      ${r}`);
});
console.log(bad ? `\n${bad} problem(s)` : `\nAll ${LEVELS.length} levels are fine.`);
process.exit(bad ? 1 : 0);
