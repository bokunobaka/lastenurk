// Checks every level: it has a start and a battery, every star can be collected,
// and the card slots are enough. For levels with belts, teleport pads or a key it also checks
// they are really needed: without them the level must not fit in its slots.
// Prints the shortest plan for each.
// Usage: npm run check
import { LEVELS, levels, simulate, plan, parse } from '../src/levels.js';

const toProgram = (lv, moves) => {
  const program = [];
  for (const d of moves) {
    const last = program[program.length - 1];
    if (last && last.dir === d && last.n < lv.maxRep) last.n++;
    else program.push({ dir: d, n: 1 });
  }
  return program;
};

let bad = 0;
for (const lv of levels) {
  const n = lv.index + 1;
  const problems = [];
  if (!lv.start || !lv.goal) problems.push('no start or battery');
  if (lv.gates.length && !lv.key) problems.push('a gate but no key');
  const p = plan(lv);
  if (!p) problems.push('cannot reach the battery');
  else {
    const program = toProgram(lv, p.moves);
    const sim = simulate(lv, program);
    if (sim.result !== 'win') problems.push(`plan does not win (${sim.result})`);
    if (sim.mask !== lv.full) problems.push('plan misses stars');
    if (program.length > lv.slots) problems.push('not enough slots');
    if (p.moves.some((d) => !lv.cards.includes(d))) problems.push('plan needs a card the level does not offer');
    // is each special thing needed? swap it for plain grass (or, for a gate, keep it shut) and try again
    const needed = [];
    const without = (re, what) => {
      if (!lv.map.some((r) => re.test(r))) return;
      const alt = parse({ ...LEVELS[lv.index], map: lv.map.map((r) => r.replace(re, what)), slack: 0 }, lv.index);
      const q = plan(alt);
      const fits = q && simulate(alt, toProgram(alt, q.moves)).mask === alt.full && q.cards <= lv.slots;
      needed.push(`${re.source.replace(/\\/g, '')} ${fits ? 'NOT needed' : 'needed'}`);
    };
    without(/[<>^v]/g, '.');
    without(/[12]/g, '.');
    without(/K/g, '.');
    const text = program.map((c) => `${c.dir}${c.n > 1 ? '×' + c.n : ''}`).join(' ');
    console.log(`${String(n).padStart(2)}  ${lv.W}x${lv.H}  stars ${lv.stars.length}  slots ${lv.slots}  ${text}${needed.length ? '   [' + needed.join(', ') + ']' : ''}`);
  }
  if (problems.length) {
    bad++;
    console.log(`    !! level ${n}: ${problems.join(', ')}`);
  }
}
process.exit(bad ? 1 : 0);
