// Checks every level: the fly can be reached, the start and fly are on lily pads, and on levels
// with gaps some order of the cards that works would splash (so the gaps make the child think).
import { levels, solve, jump, sum } from '../src/levels.js';

let bad = 0;
const fail = (lv, msg) => {
  bad++;
  console.log(`  ✗ level ${lv.index + 1}: ${msg}`);
};
const perms = (a) => (a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p])));

for (const lv of levels) {
  if (lv.gaps.includes(lv.start) || lv.gaps.includes(lv.fly)) fail(lv, 'start or fly on a gap');
  if (lv.start === lv.fly) fail(lv, 'the frog starts on the fly');
  const best = solve(lv);
  if (!best) {
    fail(lv, 'the fly cannot be reached');
    continue;
  }
  const vals = best.map((i) => lv.cards[i]);
  if (lv.gaps.length) {
    // some order of the winning cards must splash, else the gaps do nothing
    const splashes = perms(vals).some((order) => {
      let at = lv.start;
      for (const v of order) {
        const j = jump(lv, at, v);
        if (j.result !== 'ok') return true;
        at = j.to;
      }
      return false;
    });
    if (!splashes) fail(lv, 'the gaps never get in the way');
  }
  if (lv.tip === 'tip.two' && vals.length < 2) fail(lv, 'meant to need two cards');
  console.log(`  ${lv.N === 20 ? '20' : '10'} ${String(lv.index + 1).padStart(2)}: ${sum(lv.start, vals, lv.fly).padEnd(18)} cards ${lv.cards.map((v) => (v > 0 ? '+' + v : '−' + -v)).join(' ')}${lv.gaps.length ? '  gaps ' + lv.gaps.join(',') : ''}`);
}
console.log(bad ? `\n${bad} problem(s)` : `\nAll ${levels.length} levels can be solved.`);
process.exit(bad ? 1 : 0);
