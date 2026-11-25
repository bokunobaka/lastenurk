// What every thing is, and the levels. A thing is written as "name:extra:extra", where an extra is
// a colour (red blue yellow green pink), a size (small), a shape (circ tri sq star) or a spot count (1-3):
//   "ball:red", "dog:small", "cookie:tri:pink", "ladybug:2"
// A level sorts by one rule (or two at once); each box takes one value of the rule.
//   mystery  the boxes show no picture of their rule, only two things they already ate
// npm run check: every thing fits exactly one box, every box gets something, and a mystery
// box's examples point to one rule only.

// fixed facts about each kind of thing
export const KINDS = {
  ball: { group: 'toy' }, block: { group: 'toy' }, car: { group: 'toy', kind: 'vehicle', home: 'land' },
  balloon: { group: 'toy' }, crayon: { group: 'toy' }, apple: { group: 'food' },
  dog: { kind: 'animal', home: 'land' }, cat: { kind: 'animal', home: 'land' },
  fish: { kind: 'animal', home: 'water' }, octopus: { kind: 'animal', home: 'water' },
  bird: { kind: 'animal', home: 'air' }, butterfly: { kind: 'animal', home: 'air' }, bee: { kind: 'animal', home: 'air' },
  bus: { kind: 'vehicle', home: 'land' }, boat: { kind: 'vehicle', home: 'water' }, sailboat: { kind: 'vehicle', home: 'water' },
  plane: { kind: 'vehicle', home: 'air' }, helicopter: { kind: 'vehicle', home: 'air' },
  cookie: {}, ladybug: {},
  banana: { waste: 'bio' }, core: { waste: 'bio' }, egg: { waste: 'bio' },
  paper: { waste: 'paper' }, carton: { waste: 'paper' }, bag: { waste: 'paper' },
  bottle: { waste: 'pack' }, yogurt: { waste: 'pack' }, can: { waste: 'pack' },
  jar: { waste: 'glass' }, glass: { waste: 'glass' },
};
const COLOR = ['red', 'blue', 'yellow', 'green', 'pink'];
const SHAPE = ['circ', 'tri', 'sq', 'star'];
export const RULES = ['color', 'kind', 'home', 'size', 'shape', 'spots', 'waste'];

export function parse(code) {
  const [name, ...extra] = code.split(':');
  if (!KINDS[name]) throw new Error(`unknown thing ${name}`);
  const it = { code, name, size: 'big', ...KINDS[name] };
  for (const e of extra) {
    if (COLOR.includes(e)) it.color = e;
    else if (SHAPE.includes(e)) it.shape = e;
    else if (e === 'small') it.size = 'small';
    else if (/^\d$/.test(e)) it.spots = +e;
    else throw new Error(`unknown extra ${e} in ${code}`);
  }
  return it;
}

// the value of a rule for a thing (several rules at once: joined with "+")
export function valueOf(it, rule) {
  return [].concat(rule).map((r) => it[r] ?? '-').join('+');
}
export const boxValue = (b) => [].concat(b).join('+');

const LEVELS = [
  // colours
  { rule: 'color', boxes: ['red', 'blue'], items: ['ball:red', 'ball:blue', 'ball:red', 'ball:blue'], tip: 'tip.first', speed: 0.7, max: 1 },
  { rule: 'color', boxes: ['red', 'blue'], items: ['block:red', 'car:blue', 'balloon:red', 'ball:blue', 'car:red', 'block:blue'], tip: 'tip.color' },
  { rule: 'color', boxes: ['red', 'blue', 'yellow'], items: ['ball:yellow', 'car:red', 'block:blue', 'balloon:yellow', 'crayon:red', 'balloon:blue', 'car:yellow', 'crayon:blue'] },
  { rule: 'color', boxes: ['red', 'blue', 'yellow', 'green'], items: ['crayon:green', 'ball:red', 'block:yellow', 'car:green', 'balloon:blue', 'ball:green', 'crayon:yellow', 'car:blue', 'block:red'] },
  // what things are, and where they live or go
  { rule: 'kind', boxes: ['animal', 'vehicle'], items: ['dog', 'car:red', 'fish', 'boat', 'cat', 'plane', 'bird', 'bus'], tip: 'tip.kind' },
  { rule: 'home', boxes: ['land', 'water', 'air'], items: ['dog', 'fish', 'bird', 'cat', 'octopus', 'butterfly', 'bee'], tip: 'tip.home' },
  { rule: 'home', boxes: ['land', 'water', 'air'], items: ['bus', 'sailboat', 'helicopter', 'car:blue', 'boat', 'plane', 'fish', 'bird', 'dog'], tip: 'tip.home2' },
  // size
  { rule: 'size', boxes: ['big', 'small'], items: ['ball:red', 'ball:red:small', 'apple:small', 'apple', 'dog', 'dog:small', 'block:blue:small', 'block:blue'], tip: 'tip.size' },
  { rule: 'size', boxes: ['big', 'small'], items: ['car:yellow', 'ball:green:small', 'cat:small', 'balloon:pink', 'apple:small', 'block:red', 'fish:small', 'bus', 'car:blue:small'], tip: 'tip.size2' },
  // shapes
  { rule: 'shape', boxes: ['circ', 'tri'], items: ['cookie:circ:pink', 'cookie:tri:yellow', 'cookie:tri:pink', 'cookie:circ:green', 'cookie:circ:yellow', 'cookie:tri:blue', 'cookie:circ:blue', 'cookie:tri:green'], tip: 'tip.shape' },
  { rule: 'shape', boxes: ['circ', 'tri', 'sq'], items: ['cookie:sq:pink', 'cookie:circ:yellow', 'cookie:tri:green', 'cookie:sq:blue', 'cookie:tri:pink', 'cookie:circ:green', 'cookie:sq:yellow', 'cookie:circ:pink', 'cookie:tri:blue'] },
  { rule: 'shape', boxes: ['circ', 'tri', 'sq', 'star'], items: ['cookie:star:yellow', 'cookie:sq:green', 'cookie:circ:blue', 'cookie:tri:pink', 'cookie:star:pink', 'cookie:circ:yellow', 'cookie:sq:blue', 'cookie:tri:green', 'cookie:star:blue', 'cookie:sq:pink'] },
  // counting spots
  { rule: 'spots', boxes: [1, 2], items: ['ladybug:1', 'ladybug:2', 'ladybug:2', 'ladybug:1', 'ladybug:1', 'ladybug:2'], tip: 'tip.spots' },
  { rule: 'spots', boxes: [1, 2, 3], items: ['ladybug:3', 'ladybug:1', 'ladybug:2', 'ladybug:3', 'ladybug:2', 'ladybug:1', 'ladybug:3', 'ladybug:2', 'ladybug:1'] },
  // two rules at once
  { rule: ['color', 'shape'], boxes: [['pink', 'circ'], ['pink', 'tri'], ['blue', 'circ'], ['blue', 'tri']], tip: 'tip.two',
    items: ['cookie:circ:pink', 'cookie:tri:blue', 'cookie:tri:pink', 'cookie:circ:blue', 'cookie:circ:blue', 'cookie:tri:pink', 'cookie:circ:pink', 'cookie:tri:blue'] },
  { rule: ['color', 'size'], boxes: [['red', 'big'], ['red', 'small'], ['blue', 'big'], ['blue', 'small']], tip: 'tip.two2',
    items: ['ball:red', 'ball:blue:small', 'block:red:small', 'car:blue', 'car:red:small', 'balloon:red', 'block:blue', 'ball:blue:small', 'crayon:red:small'] },
  // mystery: what does each box eat?
  { rule: 'color', mystery: [['ball:green', 'car:green'], ['block:yellow', 'balloon:yellow']], boxes: ['green', 'yellow'], tip: 'tip.mystery',
    items: ['crayon:green', 'ball:yellow', 'block:green', 'car:yellow', 'balloon:green', 'crayon:yellow'] },
  { rule: 'home', mystery: [['fish', 'boat'], ['bird', 'plane']], boxes: ['water', 'air'],
    items: ['octopus', 'butterfly', 'sailboat', 'helicopter', 'bee', 'fish'] },
  { rule: 'size', mystery: [['dog:small', 'ball:blue:small'], ['apple', 'car:red']], boxes: ['small', 'big'],
    items: ['cat', 'bus:small', 'block:yellow:small', 'balloon:pink', 'fish:small', 'apple:small', 'ball:green'] },
  // rubbish into the right bins
  { rule: 'waste', boxes: ['bio', 'paper'], items: ['banana', 'paper', 'core', 'carton', 'egg', 'bag'], tip: 'tip.waste' },
  { rule: 'waste', boxes: ['bio', 'paper', 'pack'], items: ['bottle', 'banana', 'carton', 'yogurt', 'core', 'paper', 'can', 'egg', 'bag'], tip: 'tip.waste2' },
  { rule: 'waste', boxes: ['bio', 'paper', 'pack', 'glass'], items: ['jar', 'can', 'core', 'paper', 'glass', 'bottle', 'banana', 'bag', 'yogurt', 'jar'], tip: 'tip.waste3' },
];

export const levels = LEVELS.map((l, index) => ({
  ...l,
  index,
  speed: l.speed ?? 1,
  max: l.max ?? 3,
  items: l.items.map(parse),
  mystery: l.mystery?.map((ex) => ex.map(parse)) ?? null,
}));

// which box (index) takes a thing, or -1
export const boxFor = (lv, it) => lv.boxes.findIndex((b) => boxValue(b) === valueOf(it, lv.rule));

export function rng(seed) {
  let s = seed * 9301 + 49297;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}
