// Drawings for Kujundipusle, as SVG strings in the books' flat pastel style.
// Pieces are plain coloured shapes; when a picture is finished its details (eyes, windows, smoke...)
// appear on top. Details use board px (1 grid unit = 100 px), the same space as the level maps.
import { U, pathD } from './shapes.js';

export const COLORS = {
  red: '#ff7a7a', pink: '#ff9fc8', yellow: '#ffd36b', orange: '#ffb15c', green: '#7ccf6a', blue: '#7cc4f0',
  purple: '#b99af0', mint: '#6fd3c4', brown: '#c98a5a', ink: '#6b5d8c', lilac: '#e9e0ff', white: '#fffaf2',
};
export const SHADOW = '#c9bce6';

// a darker shade of a colour, for the piece edges
function darker(hex, k = 0.78) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v * k));
  return `rgb(${c.join(',')})`;
}

// a piece around 0,0 (the caller turns and moves it)
export function pieceSvg(p) {
  const col = COLORS[p.c] || p.c;
  return `<path d="${pathD(p)}" fill="${col}" stroke="${darker(col)}" stroke-width="5" stroke-linejoin="round"/>`;
}

const at = (p, inner) => `<g transform="translate(${p.x * U} ${p.y * U}) rotate(${p.r})">${inner}</g>`;

// the shadow the pieces go on; with outline, every place is drawn in white dashes
export function shadow(pieces, outline) {
  let s = pieces.map((p) => at(p, `<path d="${pathD(p)}" fill="${SHADOW}" stroke="${SHADOW}" stroke-width="5" stroke-linejoin="round"/>`)).join('');
  if (outline)
    s += pieces
      .map((p) => at(p, `<path d="${pathD(p)}" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="12 9" stroke-linejoin="round" opacity=".9"/>`))
      .join('');
  return s;
}

// one place drawn bright, for the hint on levels without outlines
export function slotGlow(p) {
  return at(p, `<path d="${pathD(p)}" fill="#fff" fill-opacity=".35" stroke="#fff" stroke-width="6" stroke-dasharray="12 9" stroke-linejoin="round"/>`);
}

// the finished picture (for the title screen, the level grid and the win card)
export function picture(lv, { done = true, details = true } = {}) {
  const body = done ? lv.pieces.map((p) => at(p, pieceSvg(p))).join('') : shadow(lv.pieces, false);
  return body + (done && details ? detailsOf(lv) : '');
}
export const detailsOf = (lv) => DETAILS[lv.id]?.() || '';

export const viewBox = (lv, pad = 0.25) => `${-pad * U} ${-pad * U} ${(lv.W + pad * 2) * U} ${(lv.H + pad * 2) * U}`;
export const svg = (inner, vb, cls = '') => `<svg viewBox="${vb}" class="${cls}" aria-hidden="true">${inner}</svg>`;

// ---------- little drawing helpers ----------
const INK = '#3b2e5a';
function eye(x, y, r = 11) {
  return `<g><ellipse cx="${x}" cy="${y}" rx="${r * 0.82}" ry="${r}" fill="${INK}"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.32}" fill="#fff"/>
    <rect x="${x - r}" y="${y - r - 1}" width="${r * 2}" height="0" fill="currentColor"><animate attributeName="height" values="0;0;${r * 2 + 2};0" keyTimes="0;.92;.96;1" dur="3.8s" repeatCount="indefinite"/></rect></g>`;
}
// eyes blink by covering them with the colour underneath (currentColor)
const eyes = (col, ...pts) => `<g color="${COLORS[col] || col}">${pts.map(([x, y, r]) => eye(x, y, r)).join('')}</g>`;
const cheek = (x, y, r = 9) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ff6f91" opacity=".35"/>`;
const smile = (x, y, w = 16) => `<path d="M${x - w} ${y} Q${x} ${y + w * 0.8} ${x + w} ${y}" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
const puffs = (x, y) =>
  [0, 1, 2]
    .map((i) => `<circle class="puff" cx="${x}" cy="${y}" r="${12 + i * 3}" fill="#fff" style="animation-delay:${i * 0.6}s"/>`)
    .join('');
const twinkle = (x, y, s = 1, d = 0) =>
  `<path class="twinkle" style="animation-delay:${d}s;transform-origin:${x}px ${y}px" transform="translate(${x} ${y}) scale(${s})" d="M0 -16 Q3 -3 16 0 Q3 3 0 16 Q-3 3 -16 0 Q-3 -3 0 -16Z" fill="#fff"/>`;

// ---------- details of each finished picture ----------
const DETAILS = {
  house: () => `
    <rect x="172" y="272" width="56" height="93" rx="26" fill="${COLORS.brown}"/><circle cx="215" cy="322" r="5" fill="${COLORS.yellow}"/>
    <rect x="112" y="200" width="46" height="44" rx="8" fill="#e6f6ff"/><path d="M135 200v44M112 222h46" stroke="${COLORS.blue}" stroke-width="5"/>
    <rect x="242" y="200" width="46" height="44" rx="8" fill="#e6f6ff"/><path d="M265 200v44M242 222h46" stroke="${COLORS.blue}" stroke-width="5"/>
    <rect x="250" y="40" width="30" height="55" fill="${COLORS.brown}"/>${puffs(265, 36)}`,
  tree: () => `
    ${[[150, 120], [245, 165], [190, 215], [262, 92], [120, 190]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16" fill="${COLORS.red}"/><path d="M${x} ${y - 15} q4 -8 10 -9" stroke="${COLORS.brown}" stroke-width="3" fill="none"/>`).join('')}
    <path d="M185 320 q15 -10 30 0" stroke="#8a5a35" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  fish: () => `
    ${eyes('blue', [335, 150, 16])}${cheek(345, 195, 12)}${smile(375, 200, 14)}
    <path d="M250 110 q-25 70 0 140 M210 125 q-20 55 0 110" stroke="#fff" stroke-width="7" fill="none" opacity=".45" stroke-linecap="round"/>
    ${[0, 1, 2].map((i) => `<circle class="bubble" cx="${420 + i * 8}" cy="120" r="${8 + i * 3}" fill="none" stroke="#fff" stroke-width="4" style="animation-delay:${i * 0.5}s"/>`).join('')}`,
  icecream: () => `
    <clipPath id="cone"><path d="M90 185H270L180 415Z"/></clipPath>
    <g clip-path="url(#cone)" stroke="#e08f3c" stroke-width="5" opacity=".7">
      ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${40 + i * 45} 185l130 230M${320 - i * 45} 185l-130 230"/>`).join('')}</g>
    ${eyes('pink', [150, 150, 10], [210, 150, 10])}${smile(180, 168, 12)}${cheek(132, 172)}${cheek(228, 172)}
    ${[[110, 125, 20], [245, 120, -30], [180, 100, 70], [130, 175, 10]].map(([x, y, a], i) => `<rect x="${x}" y="${y}" width="16" height="6" rx="3" transform="rotate(${a} ${x} ${y})" fill="${['#7cc4f0', '#ffd36b', '#7ccf6a', '#b99af0'][i]}"/>`).join('')}
    <circle cx="172" cy="42" r="8" fill="#fff" opacity=".6"/>`,
  car: () => `
    <rect x="152" y="110" width="74" height="68" rx="10" fill="#e6f6ff"/><rect x="236" y="110" width="74" height="68" rx="10" fill="#e6f6ff"/>
    <circle cx="400" cy="225" r="14" fill="${COLORS.yellow}"/><rect x="90" y="215" width="20" height="14" rx="6" fill="${COLORS.orange}"/>
    <g class="wheel" style="transform-origin:160px 345px"><circle cx="160" cy="345" r="18" fill="#cfc6e6"/><path d="M148 345h24" stroke="${COLORS.ink}" stroke-width="5"/></g>
    <g class="wheel" style="transform-origin:340px 345px"><circle cx="340" cy="345" r="18" fill="#cfc6e6"/><path d="M328 345h24" stroke="${COLORS.ink}" stroke-width="5"/></g>
    ${puffs(70, 240)}`,
  boat: () => `
    <rect x="165" y="18" width="10" height="260" rx="4" fill="#8a5a35"/>
    <path class="flag" d="M175 18 L225 34 L175 50Z" fill="${COLORS.red}" style="transform-origin:175px 34px"/>
    ${[170, 250, 330].map((x) => `<circle cx="${x}" cy="312" r="15" fill="#e6f6ff" stroke="#8a5a35" stroke-width="5"/>`).join('')}
    <path class="waves" d="M-20 400 q30 -22 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0" stroke="${COLORS.blue}" stroke-width="9" fill="none" stroke-linecap="round"/>`,
  rocket: () => `
    <circle cx="200" cy="195" r="30" fill="#e6f6ff" stroke="#fff" stroke-width="8"/>${eyes('#e6f6ff', [190, 192, 7], [210, 192, 7])}
    <path d="M150 275h100" stroke="#fff" stroke-width="7" opacity=".5"/>
    <path class="flame" d="M168 355 L200 425 L232 355Z" fill="${COLORS.orange}" style="transform-origin:200px 355px"/>
    ${twinkle(60, 80, 1, 0)}${twinkle(340, 150, 0.8, 0.7)}${twinkle(330, 40, 0.6, 1.3)}`,
  cat: () => `
    ${eyes('orange', [190, 145, 12], [250, 145, 12])}
    <path d="M211 170h18l-9 11z" fill="${COLORS.pink}"/><path d="M220 181 q-9 12 -18 4 M220 181 q9 12 18 4" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M195 178h-45M195 188l-42 8M245 178h45M245 188l42 8" stroke="${INK}" stroke-width="3" stroke-linecap="round" opacity=".6"/>
    ${cheek(170, 180)}${cheek(270, 180)}
    <ellipse cx="180" cy="368" rx="24" ry="13" fill="#fff4e6"/><ellipse cx="260" cy="368" rx="24" ry="13" fill="#fff4e6"/>
    <path d="M325 240h30M325 280h30M325 320h30" stroke="#8a5a35" stroke-width="6" stroke-linecap="round" opacity=".45"/>`,
  butterfly: () => `
    <path d="M240 72 q-20 -45 -45 -50 M260 72 q20 -45 45 -50" stroke="${COLORS.ink}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="195" cy="22" r="9" fill="${COLORS.pink}"/><circle cx="305" cy="22" r="9" fill="${COLORS.pink}"/>
    <circle cx="250" cy="85" r="27" fill="${COLORS.ink}"/>${eyes('ink', [240, 82, 7], [260, 82, 7])}
    ${[[150, 95], [350, 95], [170, 285], [330, 285]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="20" fill="#fff" opacity=".6"/>`).join('')}
    <circle cx="105" cy="65" r="11" fill="${COLORS.yellow}"/><circle cx="395" cy="65" r="11" fill="${COLORS.yellow}"/>`,
  robot: () => `
    <rect x="148" y="76" width="144" height="98" rx="18" fill="#24324a"/>
    ${eyes('#24324a', [190, 116, 12], [250, 116, 12])}
    <path d="M200 146 Q220 160 240 146" stroke="#8ff5e6" stroke-width="5" fill="none" stroke-linecap="round"/>
    <rect x="170" y="220" width="100" height="56" rx="14" fill="#e4fbf6"/>
    ${[195, 220, 245].map((x, i) => `<circle cx="${x}" cy="248" r="9" fill="${['#ff8fa8', '#ffd36b', '#7cc4f0'][i]}"/>`).join('')}
    ${[150, 185, 220, 255, 290].map((x) => `<circle cx="${x}" cy="380" r="9" fill="#cfc6e6"/>`).join('')}
    <circle class="blink" cx="220" cy="35" r="9" fill="#fff" opacity=".7"/>`,
  plane: () => `
    ${[290, 340, 390].map((x) => `<circle cx="${x}" cy="172" r="15" fill="#e6f6ff"/>`).join('')}
    <ellipse class="prop" cx="505" cy="180" rx="9" ry="60" fill="${COLORS.ink}" opacity=".6" style="transform-origin:505px 180px"/>
    <path d="M110 182h150" stroke="#fff" stroke-width="7" opacity=".5" stroke-linecap="round"/>
    <g class="cloud"><circle cx="60" cy="300" r="22" fill="#fff"/><circle cx="90" cy="292" r="28" fill="#fff"/><circle cx="120" cy="302" r="20" fill="#fff"/></g>`,
  castle: () => `
    <path d="M240 460 v-55 a40 40 0 0 1 80 0 v55z" fill="${COLORS.brown}"/>
    ${[[95, 250], [465, 250], [95, 350], [465, 350], [280, 150]].map(([x, y]) => `<rect x="${x - 14}" y="${y - 22}" width="28" height="44" rx="14" fill="#fff3c9"/>`).join('')}
    ${[[95, 20], [465, 20], [280, 10]].map(([x, y], i) => `<path d="M${x} ${y} v-34" stroke="${COLORS.ink}" stroke-width="4"/><path class="flag" d="M${x} ${y - 34} l30 9 l-30 9z" fill="${[COLORS.yellow, COLORS.yellow, COLORS.red][i]}" style="transform-origin:${x}px ${y - 25}px"/>`).join('')}
    ${twinkle(30, 140, 0.8, 0)}${twinkle(530, 170, 0.9, 0.5)}${twinkle(380, 40, 0.6, 1)}`,
  chick: () => `
    ${eyes('yellow', [225, 95, 10])}${cheek(210, 125, 8)}
    <path d="M140 260 q40 50 85 10" stroke="#e8b23e" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M165 388 v22 M150 412 l15 -6 l15 6 M235 388 v22 M220 412 l15 -6 l15 6" stroke="${COLORS.orange}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  flower: () => `
    ${eyes('yellow', [207, 152, 6], [233, 152, 6])}${smile(220, 168, 9)}
    <path d="M250 330 q30 25 50 30" stroke="#4f9e45" stroke-width="4" fill="none" stroke-linecap="round"/>
    <rect x="125" y="436" width="190" height="14" rx="7" fill="#e08f3c"/>
    <g class="bee"><ellipse cx="370" cy="70" rx="18" ry="13" fill="${COLORS.yellow}"/><path d="M365 58v24M375 58v24" stroke="${INK}" stroke-width="4"/>
    <ellipse cx="366" cy="54" rx="9" ry="7" fill="#fff" opacity=".8"/></g>`,
  turtle: () => `
    ${[[200, 220], [270, 180], [330, 230], [260, 255], [170, 270], [345, 275]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="20" fill="#4f9e45" opacity=".5"/>`).join('')}
    ${eyes('mint', [490, 272, 9])}${smile(495, 298, 9)}${cheek(470, 300, 7)}`,
  rabbit: () => `
    <rect x="166" y="35" width="18" height="110" rx="9" fill="#fff" opacity=".55"/><rect x="216" y="35" width="18" height="110" rx="9" fill="#fff" opacity=".55"/>
    ${eyes('brown', [175, 215, 10], [225, 215, 10])}
    <path d="M192 240h16l-8 9z" fill="${COLORS.pink}"/><rect x="194" y="252" width="12" height="13" rx="3" fill="#fff"/>
    <path d="M185 245h-40M215 245h40" stroke="${INK}" stroke-width="3" stroke-linecap="round" opacity=".6"/>
    ${cheek(160, 245)}${cheek(240, 245)}<ellipse cx="200" cy="415" rx="55" ry="60" fill="#fff" opacity=".35"/>`,
  pinwheel: () => `<circle cx="220" cy="180" r="14" fill="#fff" stroke="${COLORS.ink}" stroke-width="5"/>`,
  crown: () => `
    ${[90, 170, 250, 330, 410].map((x, i) => `<circle cx="${x}" cy="260" r="${i % 2 ? 10 : 13}" fill="${i % 2 ? '#fff' : COLORS.pink}"/>`).join('')}
    ${[130, 250, 370].map((x) => `<circle cx="${x - 8}" cy="57" r="6" fill="#fff" opacity=".8"/>`).join('')}
    ${twinkle(60, 60, 1, 0)}${twinkle(450, 90, 0.8, 0.6)}${twinkle(250, 300, 0.6, 1.2)}`,
  train: () => `
    <rect x="105" y="105" width="70" height="60" rx="12" fill="#e6f6ff"/>
    ${eyes('blue', [345, 170, 9], [375, 170, 9])}${smile(360, 195, 12)}${cheek(335, 200, 7)}${cheek(385, 200, 7)}
    ${puffs(350, 62)}
    <path class="rod" d="M120 320 H360" stroke="#cfc6e6" stroke-width="8" stroke-linecap="round"/>
    ${[120, 240, 360].map((x) => `<circle cx="${x}" cy="320" r="12" fill="#cfc6e6"/>`).join('')}`,
};

// a pointing hand would be an emoji; the turn badge is drawn
export const turnBadge = () =>
  `<g class="turnBadge"><circle r="26" fill="#fff" stroke="${COLORS.purple}" stroke-width="4"/>
   <path d="M-11 -6 A13 13 0 1 1 -8 9" stroke="${COLORS.purple}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-19 -12 L-11 -2 L-3 -12Z" fill="${COLORS.purple}"/></g>`;
