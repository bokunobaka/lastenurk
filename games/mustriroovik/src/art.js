// Drawings for Mustriröövik, as SVG strings in the books' flat pastel style:
// no outlines, white highlights, pink cheeks, gentle SMIL blinking.
// A segment or the head is drawn around its middle (0, 0); the game moves and scales them.

export const C = {
  red: '#ff7a7a', blue: '#7cc4f0', yellow: '#ffd36b', green: '#7ccf6a', pink: '#ff9fc8', purple: '#b99af0',
  orange: '#ffb15c', ink: '#3b2e5a', soft: '#7a6488', head: '#9ad66a', headDark: '#6fb84a', spine: '#c4e9a8',
  twig: '#c98a5a', twigDark: '#a86d42', leaf: '#a7dd8f', leafDark: '#7cc46a',
};
const D = {
  red: '#d95858', blue: '#4f9fd1', yellow: '#e0ac2c', green: '#4f9e45', pink: '#e070a2', purple: '#8a6cc9', orange: '#e08f3c',
};

const eye = (x, y, r = 6) =>
  `<g><circle cx="${x}" cy="${y}" r="${r}" fill="${C.ink}"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.38}" fill="#fff"/>
   <ellipse cx="${x}" cy="${y}" rx="${r + 1}" ry="0" fill="${C.head}"><animate attributeName="ry" values="0;0;${r + 1};0" keyTimes="0;.92;.96;1" dur="4.6s" repeatCount="indefinite"/></ellipse></g>`;
const cheek = (x, y, r = 6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ff6f91" opacity=".35"/>`;

// ---------- the pictures on a segment, in a box about 2 × 2 around (0, 0) ----------
const SYM = {
  star: 'M0 -1 L0.29 -0.4 L0.95 -0.31 L0.47 0.15 L0.59 0.81 L0 0.5 L-0.59 0.81 L-0.47 0.15 L-0.95 -0.31 L-0.29 -0.4Z',
  heart: 'M0 0.85 C-0.5 0.45 -1 0.1 -1 -0.35 C-1 -0.8 -0.4 -1 0 -0.55 C0.4 -1 1 -0.8 1 -0.35 C1 0.1 0.5 0.45 0 0.85Z',
  moon: 'M0.3 -0.95 A0.95 0.95 0 1 0 0.9 0.35 A0.75 0.75 0 1 1 0.3 -0.95Z',
  circ: 'M0 -0.8 A0.8 0.8 0 1 1 0 0.8 A0.8 0.8 0 1 1 0 -0.8Z',
  tri: 'M0 -0.85 L0.9 0.7 L-0.9 0.7Z',
  sq: 'M-0.7 -0.7 H0.7 V0.7 H-0.7Z',
};
const ARROW = 'M0 -0.9 L0.75 -0.05 H0.3 V0.85 H-0.3 V-0.05 H-0.75Z';
const TURN = { up: 0, right: 90, down: 180, left: 270 };
const DICE = {
  1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
};

export const radius = (it, R) => (it.small ? R * 0.64 : R);

// one body segment; `R` is the size of a big one
export function segment(it, R) {
  const r = radius(it, R);
  const fill = C[it.color] || it.color;
  let mark = '';
  if (it.sym) mark = `<path d="${SYM[it.sym]}" transform="scale(${r * 0.5})" fill="#fff"/>`;
  if (it.arrow) mark = `<path d="${ARROW}" transform="rotate(${TURN[it.arrow]}) scale(${r * 0.6})" fill="#fff" stroke="#fff" stroke-width=".12" stroke-linejoin="round"/>`;
  if (it.dots) mark = DICE[it.dots].map(([x, y]) => `<circle cx="${x * r * 0.38}" cy="${y * r * 0.38}" r="${r * 0.15}" fill="#fff"/>`).join('');
  return `<circle r="${r}" fill="${fill}"/>
    <path d="M${-r * 0.92} ${r * 0.25} A${r} ${r} 0 0 0 ${r * 0.92} ${r * 0.25} A${r * 1.1} ${r * 0.9} 0 0 1 ${-r * 0.92} ${r * 0.25}Z" fill="${D[it.color] || '#000'}" opacity=".25"/>
    <ellipse cx="${-r * 0.42}" cy="${-r * 0.5}" rx="${r * 0.22}" ry="${r * 0.13}" transform="rotate(-35 ${-r * 0.42} ${-r * 0.5})" fill="#fff" opacity=".6"/>
    <g opacity=".95">${mark}</g>`;
}

// an empty place in the body: a dashed ring with a question mark
export function gap(R) {
  return `<circle r="${R}" fill="#fff" opacity=".55"/><circle r="${R - 3}" fill="none" stroke="${C.soft}" stroke-width="5" stroke-dasharray="12 9" stroke-linecap="round" opacity=".55"/>
    <text y="${R * 0.36}" text-anchor="middle" class="qmark" font-size="${R * 1.1}">?</text>`;
}

// two little feet under a segment
export const feet = (x, groundY, R) =>
  `<ellipse cx="${x - R * 0.36}" cy="${groundY - 2}" rx="${R * 0.16}" ry="${R * 0.12}" fill="${C.headDark}"/>
   <ellipse cx="${x + R * 0.36}" cy="${groundY - 2}" rx="${R * 0.16}" ry="${R * 0.12}" fill="${C.headDark}"/>`;

// the head, looking left; mood: happy | oh | yum | sleep
export function head(R, mood = 'happy') {
  const r = R * 1.15;
  const mouth = {
    happy: `<path d="M${-r * 0.55} ${r * 0.28} q${r * 0.22} ${r * 0.22} ${r * 0.44} 0" stroke="${C.ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    yum: `<path d="M${-r * 0.62} ${r * 0.18} q${r * 0.3} ${r * 0.45} ${r * 0.6} 0z" fill="${C.ink}"/><path d="M${-r * 0.48} ${r * 0.34} q${r * 0.16} ${r * 0.16} ${r * 0.32} 0z" fill="#ff7a9a"/>`,
    oh: `<ellipse cx="${-r * 0.32}" cy="${r * 0.36}" rx="${r * 0.09}" ry="${r * 0.13}" fill="${C.ink}"/>`,
  }[mood] || '';
  const eyes =
    mood === 'yum'
      ? `<path d="M${-r * 0.62} ${-r * 0.12} q${r * 0.12} ${-r * 0.16} ${r * 0.24} 0 M${-r * 0.12} ${-r * 0.12} q${r * 0.12} ${-r * 0.16} ${r * 0.24} 0" stroke="${C.ink}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`
      : `${eye(-r * 0.5, -r * 0.1, r * 0.13)}${eye(0, -r * 0.1, r * 0.13)}`;
  const brows = mood === 'oh' ? `<path d="M${-r * 0.62} ${-r * 0.42} l${r * 0.2} ${-r * 0.06} M${-r * 0.1} ${-r * 0.48} l${r * 0.2} ${r * 0.06}" stroke="${C.ink}" stroke-width="3.5" stroke-linecap="round"/>` : '';
  const antenna = (x, tip) =>
    `<g><path d="M${x} ${-r * 0.8} Q${x - r * 0.1} ${-r * 1.25} ${tip} ${-r * 1.45}" stroke="${C.headDark}" stroke-width="5" fill="none" stroke-linecap="round"/>
     <circle cx="${tip}" cy="${-r * 1.45}" r="${r * 0.15}" fill="${C.pink}"/>
     <animateTransform attributeName="transform" type="rotate" values="0 ${x} ${-r * 0.8};-7 ${x} ${-r * 0.8};0 ${x} ${-r * 0.8};5 ${x} ${-r * 0.8};0 ${x} ${-r * 0.8}" dur="2.4s" repeatCount="indefinite"/></g>`;
  return `${antenna(-r * 0.45, -r * 0.75)}${antenna(r * 0.1, r * 0.05)}
    <circle r="${r}" fill="${C.head}"/>
    <path d="M${-r * 0.92} ${r * 0.3} A${r} ${r} 0 0 0 ${r * 0.92} ${r * 0.3} A${r * 1.1} ${r * 0.9} 0 0 1 ${-r * 0.92} ${r * 0.3}Z" fill="${C.headDark}" opacity=".35"/>
    <ellipse cx="${r * 0.35}" cy="${-r * 0.5}" rx="${r * 0.2}" ry="${r * 0.12}" transform="rotate(30 ${r * 0.35} ${-r * 0.5})" fill="#fff" opacity=".55"/>
    ${eyes}${brows}${cheek(-r * 0.78, r * 0.18, r * 0.13)}${cheek(r * 0.2, r * 0.18, r * 0.13)}${mouth}`;
}

// the twig a row of the caterpillar sits on
export function twig(x0, x1, y) {
  const leafAt = (x, up) =>
    `<path d="M${x} ${y + 6} q${up ? -10 : 10} ${up ? -30 : 26} ${up ? 18 : 22} ${up ? -42 : 36} q8 ${up ? 26 : -20} -18 ${up ? 42 : -36}z" fill="${C.leaf}"/>`;
  return `${leafAt(x0 + 30, false)}${leafAt(x1 - 50, false)}
    <rect x="${x0}" y="${y}" width="${x1 - x0}" height="16" rx="8" fill="${C.twig}"/>
    <rect x="${x0 + 10}" y="${y + 10}" width="${x1 - x0 - 20}" height="5" rx="2.5" fill="${C.twigDark}" opacity=".6"/>`;
}

// the leaf the choices lie on
export function trayLeaf(cx, cy, w, h) {
  return `<g transform="translate(${cx} ${cy})">
    <path d="M${-w / 2} 0 C${-w / 2.6} ${-h * 0.75} ${w / 2.6} ${-h * 0.75} ${w / 2} 0 C${w / 2.6} ${h * 0.75} ${-w / 2.6} ${h * 0.75} ${-w / 2} 0Z" fill="${C.leaf}"/>
    <path d="M${-w / 2 + 20} 0 H${w / 2 - 20}" stroke="${C.leafDark}" stroke-width="5" stroke-linecap="round" opacity=".6"/>
    <path d="M${w / 2} 0 q22 -4 34 -18" stroke="${C.leafDark}" stroke-width="7" fill="none" stroke-linecap="round"/></g>`;
}

// the butterfly the caterpillar becomes after the last level; wings in the given colours
export function butterfly(cols = ['pink', 'purple', 'blue', 'yellow']) {
  const c = cols.map((k) => C[k] || k);
  return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -10;0 0" dur="1.6s" repeatCount="indefinite"/>
    <g><animateTransform attributeName="transform" type="scale" values="1 1;.55 1;1 1" dur=".7s" repeatCount="indefinite"/>
    <path d="M-6 -6 C-40 -70 -110 -60 -96 -14 C-88 12 -40 10 -6 0Z" fill="${c[0]}"/><path d="M6 -6 C40 -70 110 -60 96 -14 C88 12 40 10 6 0Z" fill="${c[0]}"/>
    <path d="M-6 6 C-50 10 -80 60 -48 70 C-26 76 -8 40 -6 12Z" fill="${c[1]}"/><path d="M6 6 C50 10 80 60 48 70 C26 76 8 40 6 12Z" fill="${c[1]}"/>
    <circle cx="-60" cy="-26" r="14" fill="${c[2]}"/><circle cx="60" cy="-26" r="14" fill="${c[2]}"/>
    <circle cx="-40" cy="44" r="9" fill="${c[3]}"/><circle cx="40" cy="44" r="9" fill="${c[3]}"/>
    <circle cx="-70" cy="-40" r="5" fill="#fff" opacity=".7"/><circle cx="70" cy="-40" r="5" fill="#fff" opacity=".7"/></g>
    <rect x="-8" y="-30" width="16" height="80" rx="8" fill="${C.head}"/>
    <circle cy="-36" r="16" fill="${C.head}"/>${eye(-6, -38, 3.5)}${eye(6, -38, 3.5)}
    <path d="M-5 -28 q5 4 10 0" stroke="${C.ink}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M-6 -50 q-8 -16 -18 -20 M6 -50 q8 -16 18 -20" stroke="${C.headDark}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <circle cx="-24" cy="-70" r="5" fill="${C.pink}"/><circle cx="24" cy="-70" r="5" fill="${C.pink}"/></g>`;
}

export const svg = (inner, viewBox) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${inner}</svg>`;
