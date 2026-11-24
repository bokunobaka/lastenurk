// All drawings for Rong Tuut, as SVG strings. Flat pastel style like the picture books and
// Robot Piiks: no outlines, white eye highlights, pink cheeks.
// Tiles use a 100x100 box. The train and the animals are drawn around (0,0).

const C = {
  grass: '#b6e59a', grass2: '#c4ecaa', tuft: '#95d07a',
  rail: '#8f8aa3', railLit: '#ffb72e', sleeper: '#c4955f', ink: '#2b1d3a', pink: '#ff8fa8',
};

// ---------- ground and scenery ----------
export function grass(alt = false, seed = 0) {
  const r = (i) => ((Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453) % 1 + 1) % 1;
  let tufts = '';
  for (let i = 0; i < 3; i++) {
    const x = 15 + r(i) * 70, y = 20 + r(i + 7) * 65;
    tufts += `<path d="M${x - 4} ${y} q2 -6 4 0 q2 -7 4 0" stroke="${C.tuft}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  }
  return `<rect width="100" height="100" fill="${alt ? C.grass2 : C.grass}"/>${tufts}`;
}

export function tree() {
  return `<ellipse cx="50" cy="90" rx="24" ry="5" fill="#000" opacity=".12"/>
    <rect x="44" y="60" width="12" height="30" rx="5" fill="#b07a4f"/>
    <circle cx="50" cy="40" r="28" fill="#5fb552"/><circle cx="34" cy="52" r="16" fill="#5fb552"/><circle cx="66" cy="52" r="16" fill="#5fb552"/>
    <circle cx="42" cy="30" r="9" fill="#7ccf6a"/>
    <circle cx="62" cy="48" r="4" fill="#ff7a7a"/><circle cx="37" cy="56" r="4" fill="#ff7a7a"/><circle cx="54" cy="26" r="4" fill="#ff7a7a"/>`;
}

export function rock() {
  return `<ellipse cx="50" cy="84" rx="32" ry="6" fill="#000" opacity=".12"/>
    <path d="M20 82 Q16 58 35 47 Q49 36 66 43 Q85 53 82 82 Z" fill="#b6b2c4"/>
    <path d="M20 82 Q32 75 50 78 Q70 82 82 82 Z" fill="#9893ab"/>
    <path d="M35 53 Q44 46 54 49" stroke="#fff" stroke-width="4" opacity=".55" fill="none" stroke-linecap="round"/>`;
}

export function pond() {
  return `<rect x="-2" y="-2" width="104" height="104" fill="#7cc4f0"/>
    <path d="M22 40 q8 -5 16 0 M58 70 q8 -5 16 0" stroke="#d8efff" stroke-width="3" fill="none" stroke-linecap="round"/>`;
}

export function flowers() {
  const f = (x, y, c) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288]
    .map((a) => `<circle cx="${Math.cos((a * Math.PI) / 180) * 5}" cy="${Math.sin((a * Math.PI) / 180) * 5}" r="4.5" fill="${c}"/>`)
    .join('')}<circle r="3.5" fill="#ffd36b"/></g>`;
  return f(30, 36, '#ff9fc8') + f(66, 58, '#b99af0') + f(38, 72, '#fff');
}

// ---------- track ----------
// A piece is drawn in its base direction and rotated by the game:
//   'I' straight, base north-south;  'L' curve, base north-east;  'X' crossing.
function sleepersStraight() {
  let s = '';
  for (let y = 6; y < 100; y += 16) s += `<rect x="28" y="${y}" width="44" height="8" rx="3" fill="${C.sleeper}"/>`;
  return s;
}
function sleepersCurve() {
  // around the corner (100, 0), radius 50
  let s = '';
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 2) * ((i + 0.5) / 6) + Math.PI / 2;
    const cx = 100 + Math.cos(a) * 50, cy = Math.sin(a) * 50;
    const deg = (a * 180) / Math.PI;
    s += `<rect x="-22" y="-4" width="44" height="8" rx="3" fill="${C.sleeper}" transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${deg.toFixed(1)})"/>`;
  }
  return s;
}

// the wooden plate under a piece the child can turn (it does not turn itself)
export function plate(fixed = false) {
  if (fixed) return '';
  return `<rect x="5" y="9" width="90" height="90" rx="18" fill="#000" opacity=".1"/>
    <rect x="5" y="5" width="90" height="90" rx="18" fill="#f3dcb4"/>
    <rect x="7" y="7" width="86" height="86" rx="16" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/>`;
}

export function rails(type) {
  if (type === 'I')
    return `${sleepersStraight()}<g class="rails" fill="none" stroke-width="6">
      <line x1="40" y1="0" x2="40" y2="100"/><line x1="60" y1="0" x2="60" y2="100"/></g>`;
  if (type === 'L')
    return `${sleepersCurve()}<g class="rails" fill="none" stroke-width="6">
      <path d="M40 0 A60 60 0 0 0 100 60"/><path d="M60 0 A40 40 0 0 0 100 40"/></g>`;
  return `${sleepersStraight()}<g transform="rotate(90 50 50)">${sleepersStraight()}</g>
    <g class="rails" fill="none" stroke-width="6">
      <line x1="40" y1="0" x2="40" y2="100"/><line x1="60" y1="0" x2="60" y2="100"/>
      <line x1="0" y1="40" x2="100" y2="40"/><line x1="0" y1="60" x2="100" y2="60"/></g>`;
}

// two curves on one piece: base joins N-E and S-W
export function doubleRails() {
  return `${rails('L')}<g transform="rotate(180 50 50)">${rails('L')}</g>`;
}

// a wooden bridge deck over the water, base north-south (turns with its rails)
export function bridgeDeck() {
  let planks = '';
  for (let y = 4; y < 100; y += 12) planks += `<line x1="22" y1="${y}" x2="78" y2="${y}" stroke="#e0c9a6" stroke-width="2"/>`;
  return `<rect x="20" y="2" width="60" height="100" fill="#000" opacity=".12"/>
    <rect x="20" y="-2" width="60" height="104" fill="#f3dcb4"/>${planks}
    <line x1="18" y1="-2" x2="18" y2="102" stroke="#b07a4f" stroke-width="4"/><line x1="82" y1="-2" x2="82" y2="102" stroke="#b07a4f" stroke-width="4"/>
    <circle cx="18" cy="20" r="4" fill="#b07a4f"/><circle cx="18" cy="80" r="4" fill="#b07a4f"/>
    <circle cx="82" cy="20" r="4" fill="#b07a4f"/><circle cx="82" cy="80" r="4" fill="#b07a4f"/>`;
}

// the hill over a tunnel; drawn above the train so it drives out of sight. dir: 'NS' or 'EW'
export function hill(dir = 'NS') {
  const ew = dir === 'EW';
  // the dark tunnel mouths sit where the rails go in and out
  const mouth = (x, y) =>
    ew ? `<ellipse cx="${x}" cy="${y}" rx="9" ry="17" fill="#3b2e5a" opacity=".85"/>` : `<ellipse cx="${x}" cy="${y}" rx="17" ry="9" fill="#3b2e5a" opacity=".85"/>`;
  return `<ellipse cx="50" cy="56" rx="42" ry="38" fill="#000" opacity=".1"/>
    <ellipse cx="50" cy="50" rx="42" ry="40" fill="#5fb552"/>
    <ellipse cx="42" cy="38" rx="24" ry="18" fill="#7ccf6a"/>
    ${ew ? mouth(10, 50) + mouth(90, 50) : mouth(50, 12) + mouth(50, 88)}
    <circle cx="30" cy="62" r="3.5" fill="#ff9fc8"/><circle cx="66" cy="64" r="3.5" fill="#fff"/><circle cx="60" cy="34" r="3" fill="#ffd36b"/>`;
}

// the blue plate under a switch (a tap flips it rather than turning it)
export function switchPlate() {
  return `<rect x="5" y="9" width="90" height="90" rx="18" fill="#000" opacity=".1"/>
    <rect x="5" y="5" width="90" height="90" rx="18" fill="#bfe0ff"/>
    <rect x="7" y="7" width="86" height="86" rx="16" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>`;
}

// a short track stub from the tile centre out to one side (for the stations), base: east
export function stub() {
  let s = '';
  for (let x = 54; x < 100; x += 16) s += `<rect x="${x}" y="28" width="8" height="44" rx="3" fill="${C.sleeper}"/>`;
  return `${s}<g class="rails" fill="none" stroke-width="6"><line x1="50" y1="40" x2="100" y2="40"/><line x1="50" y1="60" x2="100" y2="60"/></g>`;
}

// ---------- stations ----------
export function station(roof = '#ff7a7a', flag = false) {
  return `<ellipse cx="50" cy="86" rx="38" ry="6" fill="#000" opacity=".12"/>
    <rect x="16" y="40" width="68" height="46" rx="6" fill="#fff4e0"/>
    <path d="M8 44 L50 12 L92 44 Z" fill="${roof}" stroke="${roof}" stroke-width="6" stroke-linejoin="round"/>
    <rect x="40" y="58" width="20" height="28" rx="8" fill="#b07a4f"/>
    <rect x="22" y="52" width="13" height="13" rx="3" fill="#9fd3f5"/><rect x="65" y="52" width="13" height="13" rx="3" fill="#9fd3f5"/>
    <circle cx="50" cy="32" r="7" fill="#fff"/><path d="M50 28 v4 l3 2" stroke="${C.ink}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    ${flag ? `<line x1="84" y1="44" x2="84" y2="6" stroke="#8f8aa3" stroke-width="3"/><path d="M84 7 L100 13 L84 19 Z" fill="#ffd36b"><animateTransform attributeName="transform" type="skewY" values="0;-8;0" dur="1.4s" repeatCount="indefinite"/></path>` : ''}`;
}

// ---------- train (side view, facing right, wheels resting on y = 22) ----------
export function engine(o = {}) {
  const happy = o.happy;
  const eye = (x) =>
    happy
      ? `<path d="M${x - 4} -1 Q${x} -6 ${x + 4} -1" stroke="${C.ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="${x}" cy="-2" rx="3.4" ry="4" fill="${C.ink}"/><circle cx="${x - 1}" cy="-3.5" r="1.3" fill="#fff"/>`;
  return `<g class="engine">
    <ellipse cx="0" cy="25" rx="38" ry="5" fill="#000" opacity=".15"/>
    <rect x="-36" y="-37" width="36" height="9" rx="4" fill="#3f8fc4"/>
    <rect x="-33" y="-30" width="30" height="46" rx="6" fill="#7cc4f0"/>
    <rect x="-27" y="-24" width="17" height="14" rx="4" fill="#fff"/><path d="M-24 -21 l6 0" stroke="#9fd3f5" stroke-width="3" stroke-linecap="round"/>
    <rect x="-8" y="-12" width="42" height="28" rx="12" fill="#ff7a7a"/>
    <rect x="-8" y="6" width="42" height="10" rx="5" fill="#e65f6a"/>
    <rect x="12" y="-28" width="11" height="18" rx="2" fill="#5b6b8c"/><rect x="9" y="-33" width="17" height="7" rx="3" fill="#5b6b8c"/>
    <circle cx="34" cy="-4" r="4.5" fill="#ffd36b"/>
    ${eye(10)}${eye(22)}
    <circle cx="6" cy="6" r="3" fill="${C.pink}" opacity=".7"/>
    <path d="M12 5 Q16 9 20 5" stroke="${C.ink}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M32 8 L42 22 L32 22 Z" fill="#ffd36b"/>
    <g class="wheels">
      <circle cx="-22" cy="17" r="8" fill="#5b6b8c"/><circle cx="-22" cy="17" r="3" fill="#ffd36b"/>
      <circle cx="2" cy="16" r="9" fill="#5b6b8c"/><circle cx="2" cy="16" r="3" fill="#ffd36b"/>
      <circle cx="22" cy="16" r="9" fill="#5b6b8c"/><circle cx="22" cy="16" r="3" fill="#ffd36b"/>
    </g></g>`;
}

const WAGON_COLORS = [['#ffd36b', '#f2a93b'], ['#7ccf6a', '#4f9e45'], ['#b99af0', '#7d5cc4'], ['#ff9fc8', '#d9608f']];
export function wagon(i = 0, rider = '') {
  const [c, d] = WAGON_COLORS[i % WAGON_COLORS.length];
  return `<g class="wagon">
    <ellipse cx="0" cy="25" rx="28" ry="4.5" fill="#000" opacity=".15"/>
    <line x1="24" y1="10" x2="34" y2="10" stroke="#5b6b8c" stroke-width="4" stroke-linecap="round"/>
    <g class="rider">${rider}</g>
    <rect x="-25" y="-4" width="50" height="22" rx="6" fill="${c}"/>
    <rect x="-25" y="-6" width="50" height="7" rx="3.5" fill="${d}"/>
    <circle cx="-13" cy="18" r="7" fill="#5b6b8c"/><circle cx="-13" cy="18" r="2.6" fill="#fff4e0"/>
    <circle cx="13" cy="18" r="7" fill="#5b6b8c"/><circle cx="13" cy="18" r="2.6" fill="#fff4e0"/></g>`;
}

export function puff(x, y, r) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".9"/>`;
}

// ---------- animal friends (heads, about 34 wide, centred on 0,0) ----------
function eyes(dx = 6, y = -1, color = C.ink) {
  return `<circle cx="${-dx}" cy="${y}" r="2.6" fill="${color}"/><circle cx="${dx}" cy="${y}" r="2.6" fill="${color}"/>
    <circle cx="${-dx - 0.8}" cy="${y - 1}" r=".9" fill="#fff"/><circle cx="${dx - 0.8}" cy="${y - 1}" r=".9" fill="#fff"/>`;
}
const cheeks = (dx = 10, y = 5) => `<circle cx="${-dx}" cy="${y}" r="3" fill="${C.pink}" opacity=".55"/><circle cx="${dx}" cy="${y}" r="3" fill="${C.pink}" opacity=".55"/>`;

export const ANIMALS = {
  bunny: () => `<ellipse cx="-7" cy="-22" rx="5" ry="13" fill="#fff"/><ellipse cx="7" cy="-22" rx="5" ry="13" fill="#fff"/>
    <ellipse cx="-7" cy="-21" rx="2.4" ry="9" fill="#ffc6df"/><ellipse cx="7" cy="-21" rx="2.4" ry="9" fill="#ffc6df"/>
    <circle r="15" fill="#fff"/>${eyes()}${cheeks()}<path d="M-2 4 L2 4 L0 6.5 Z" fill="#ff8fa8"/>`,
  bear: () => `<circle cx="-12" cy="-11" r="6.5" fill="#c98a5a"/><circle cx="12" cy="-11" r="6.5" fill="#c98a5a"/>
    <circle cx="-12" cy="-11" r="3" fill="#e9b98d"/><circle cx="12" cy="-11" r="3" fill="#e9b98d"/>
    <circle r="15" fill="#c98a5a"/><ellipse cx="0" cy="6" rx="8" ry="6" fill="#f1d1ae"/>${eyes(6, -3)}<ellipse cx="0" cy="3.5" rx="3" ry="2.2" fill="${C.ink}"/>`,
  duck: () => `<path d="M-2 -16 q3 -7 7 -3" stroke="#ffd36b" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle r="15" fill="#ffe27a"/>${eyes(6, -3)}${cheeks(11, 3)}<ellipse cx="0" cy="5" rx="8" ry="4.5" fill="#ffb15c"/>`,
  cat: () => `<path d="M-14 -6 L-12 -20 L-3 -12 Z M14 -6 L12 -20 L3 -12 Z" fill="#ffb15c" stroke="#ffb15c" stroke-width="3" stroke-linejoin="round"/>
    <circle r="15" fill="#ffb15c"/>${eyes(6, -2)}${cheeks()}<path d="M-2 3 L2 3 L0 5.5 Z" fill="#ff8fa8"/>
    <path d="M-16 4 l-7 -1 M-16 7 l-7 2 M16 4 l7 -1 M16 7 l7 2" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>`,
  frog: () => `<circle cx="-8" cy="-12" r="7" fill="#7ccf6a"/><circle cx="8" cy="-12" r="7" fill="#7ccf6a"/>
    <ellipse cx="0" cy="2" rx="17" ry="13" fill="#7ccf6a"/>
    <circle cx="-8" cy="-13" r="4" fill="#fff"/><circle cx="8" cy="-13" r="4" fill="#fff"/>
    <circle cx="-7.5" cy="-12.5" r="2.4" fill="${C.ink}"/><circle cx="8.5" cy="-12.5" r="2.4" fill="${C.ink}"/>
    ${cheeks(11, 4)}<path d="M-6 5 Q0 10 6 5" stroke="${C.ink}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  pig: () => `<path d="M-13 -9 L-14 -19 L-5 -13 Z M13 -9 L14 -19 L5 -13 Z" fill="#ff9fc8" stroke="#ff9fc8" stroke-width="3" stroke-linejoin="round"/>
    <circle r="15" fill="#ffb3d1"/>${eyes(6, -4)}<ellipse cx="0" cy="5" rx="7" ry="5" fill="#ff8fb8"/>
    <ellipse cx="-2.4" cy="5" rx="1.4" ry="2" fill="#c45a85"/><ellipse cx="2.4" cy="5" rx="1.4" ry="2" fill="#c45a85"/>`,
};
export const ANIMAL_ORDER = ['bunny', 'bear', 'duck', 'cat', 'frog', 'pig'];

// a waiting friend: the head on a little round platform
export function waiting(kind) {
  return `<ellipse cx="0" cy="17" rx="16" ry="5" fill="#000" opacity=".12"/>
    <g class="bob">${ANIMALS[kind]()}<animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="1.6s" repeatCount="indefinite"/></g>`;
}

export function playButton() {
  return `<circle cx="50" cy="55" r="44" fill="#4f9e45"/><circle cx="50" cy="50" r="44" fill="#7ccf6a"/>
    <path d="M40 30 L72 50 L40 70 Z" fill="#fff" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>`;
}
export function stopButton() {
  return `<circle cx="50" cy="55" r="44" fill="#d9608f"/><circle cx="50" cy="50" r="44" fill="#ff9fc8"/>
    <rect x="33" y="33" width="34" height="34" rx="8" fill="#fff"/>`;
}

export const svg = (inner, w = 100, h = 100, vb = `0 0 ${w} ${h}`) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${inner}</svg>`;
