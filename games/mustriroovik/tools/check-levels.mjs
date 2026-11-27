// Checks every level: each answer is on the leaf to pick from, the choices are different and at most 4,
// a wrong segment really is wrong, and on repeating levels the gaps follow from what shows: the shortest
// repeat that fits every visible segment is the level's unit, each place in the unit shows at least once,
// and the unit shows at least twice.
import { levels } from '../src/levels.js';

let bad = 0;
const fail = (lv, msg) => {
  bad++;
  console.log(`  ✗ level ${lv.index + 1}: ${msg}`);
};

for (const lv of levels) {
  const n = lv.seq.length;
  const keys = lv.choices.map((c) => c.key);
  if (new Set(keys).size !== keys.length) fail(lv, 'two choices are the same');
  if (keys.length < 2 || keys.length > 4) fail(lv, `${keys.length} choices`);
  const holes = [...lv.gaps, ...(lv.wrong ? [lv.wrong.at] : [])];
  if (!holes.length) fail(lv, 'nothing to do');
  for (const g of holes) {
    if (g < 0 || g >= n) fail(lv, `gap ${g} is off the caterpillar`);
    else if (!keys.includes(lv.seq[g].key)) fail(lv, `answer ${lv.seq[g].code} is not on the leaf`);
  }
  if (new Set(holes).size !== holes.length) fail(lv, 'a gap is listed twice');
  if (lv.wrong && lv.wrong.it.key === lv.seq[lv.wrong.at].key) fail(lv, 'the wrong segment is right');
  if (n > 12) fail(lv, `${n} segments is too long`);
  if (lv.period) {
    const p = lv.period;
    const unit = lv.seq.slice(0, p).map((it) => it.key);
    for (let q = 1; q < p; q++) if (p % q === 0 && unit.every((k, i) => k === unit[i % q])) fail(lv, `the unit repeats inside itself every ${q}`);
    const seen = lv.seq.map((it, i) => (holes.includes(i) ? null : it.key));
    let shortest = 0;
    for (let q = 1; q <= p && !shortest; q++) {
      const fits = seen.every((k, i) => k === null || seen.slice(i % q).filter((_, j) => j % q === 0).every((o) => o === null || o === k));
      if (fits) shortest = q;
    }
    if (shortest !== p) fail(lv, `what shows also fits a repeat of ${shortest}`);
    for (let r = 0; r < p; r++) if (!seen.some((k, i) => k !== null && i % p === r)) fail(lv, `place ${r + 1} of the unit never shows`);
    if (n < 2 * p) fail(lv, 'the unit does not show twice');
  }
  const show = lv.seq.map((it, i) => (lv.gaps.includes(i) ? '_' : lv.wrong?.at === i ? `!${lv.wrong.it.code}` : it.code)).join(' ');
  console.log(`  ${String(lv.index + 1).padStart(2)}: ${show.padEnd(70)} [${lv.choices.map((c) => c.code).join(', ')}]`);
}
console.log(bad ? `\n${bad} problem(s)` : `\nAll ${levels.length} levels are fine.`);
process.exit(bad ? 1 : 0);
