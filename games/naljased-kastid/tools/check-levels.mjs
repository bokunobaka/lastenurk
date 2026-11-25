// Checks every level: each thing fits exactly one box, every box gets something,
// and on mystery levels the examples in the boxes point to the level's rule and no other.
import { levels, RULES, valueOf, boxValue, boxFor } from '../src/levels.js';

let bad = 0;
const fail = (lv, msg) => {
  bad++;
  console.log(`  ✗ level ${lv.index + 1}: ${msg}`);
};

for (const lv of levels) {
  const vals = lv.boxes.map(boxValue);
  if (new Set(vals).size !== vals.length) fail(lv, 'two boxes take the same thing');
  const count = lv.boxes.map(() => 0);
  for (const it of lv.items) {
    const b = boxFor(lv, it);
    if (b < 0) fail(lv, `${it.code} fits no box (${valueOf(it, lv.rule)})`);
    else count[b]++;
  }
  count.forEach((n, b) => n || fail(lv, `box ${vals[b]} gets nothing`));
  if (lv.mystery) {
    lv.mystery.forEach((ex, b) => ex.forEach((it) => boxFor(lv, it) !== b && fail(lv, `example ${it.code} is in the wrong box`)));
    // another rule that would also explain the examples makes the puzzle unfair
    for (const r of RULES) {
      if (r === lv.rule) continue;
      const per = lv.mystery.map((ex) => new Set(ex.map((it) => valueOf(it, r))));
      const each = per.every((s) => s.size === 1 && !s.has('-'));
      const differ = new Set(per.map((s) => [...s][0])).size === per.length;
      if (each && differ) fail(lv, `the examples could also mean sorting by ${r}`);
    }
  }
  console.log(`  ${String(lv.index + 1).padStart(2)}: ${[].concat(lv.rule).join('+').padEnd(11)} ${vals.join(' | ').padEnd(40)} ${count.join('/')}${lv.mystery ? '  (mystery)' : ''}`);
}
console.log(bad ? `\n${bad} problem(s)` : `\nAll ${levels.length} levels are fine.`);
process.exit(bad ? 1 : 0);
