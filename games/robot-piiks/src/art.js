// All drawings for Robot Piiks, as SVG strings. Flat pastel style like the picture books:
// no outlines, white eye highlights, pink cheeks, gentle SMIL blinking.
// Tiles and things use a 100x100 box; the robot stands with its wheels near the bottom.

const P = {
  mint: '#6fd3c4', mintDark: '#3fa597', mintPale: '#e4fbf6',
  screen: '#24324a', glow: '#8ff5e6', tread: '#5b6b8c', wheel: '#8fa0c2',
  orange: '#ffb15c', pink: '#ff8fa8', yellow: '#ffd36b', blue: '#7cc4f0',
  grass: '#b6e59a', grass2: '#c4ecaa', tuft: '#95d07a',
};

// ---------- the robot ----------
// o.eyes: 'open' | 'happy' | 'dizzy'; o.look: [dx, dy] pupils shift toward where it goes
export function robot(o = {}) {
  const eyes = o.eyes || 'open';
  const [lx, ly] = o.look || [0, 0];
  let face;
  if (eyes === 'happy') {
    face = `<path d="M35 32 Q40 25 45 32 M55 32 Q60 25 65 32" stroke="${P.glow}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M42 36 Q50 43 58 36" stroke="${P.glow}" stroke-width="3" fill="${P.glow}" fill-opacity=".25" stroke-linecap="round"/>`;
  } else if (eyes === 'dizzy') {
    const x = (cx) => `<path d="M${cx - 4} 26 l8 8 M${cx + 4} 26 l-8 8" stroke="${P.glow}" stroke-width="3" stroke-linecap="round"/>`;
    face = `${x(40)}${x(60)}<path d="M44 39 Q47 36 50 39 Q53 42 56 39" stroke="${P.glow}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  } else {
    const e = (cx) => `<ellipse cx="${cx + lx * 2.5}" cy="${30 + ly * 2.5}" rx="5" ry="6" fill="${P.glow}"/>
      <circle cx="${cx + lx * 2.5 - 1.6}" cy="${28 + ly * 2.5}" r="1.8" fill="#fff"/>
      <rect x="${cx - 6}" y="23" width="12" height="0" fill="${P.screen}"><animate attributeName="height" values="0;0;14;0" keyTimes="0;.93;.965;1" dur="4.2s" repeatCount="indefinite"/></rect>`;
    face = `${e(40)}${e(60)}<path d="M44 37 Q50 41.5 56 37" stroke="${P.glow}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  }
  const armUp = eyes === 'happy';
  const arm = (side) => {
    const sx = side < 0 ? 29 : 71, hx = sx + side * 11, hy = armUp ? 46 : 72;
    return `<path d="M${sx} 61 L${hx} ${hy}" stroke="${P.mintDark}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="${hx}" cy="${hy}" r="5" fill="${P.orange}"/>`;
  };
  return `<g class="robot">
    <ellipse cx="50" cy="94" rx="26" ry="4.5" fill="#000" opacity=".12"/>
    ${arm(-1)}${arm(1)}
    <rect x="26" y="79" width="48" height="14" rx="7" fill="${P.tread}"/>
    <circle cx="35" cy="86" r="3.6" fill="${P.wheel}"/><circle cx="50" cy="86" r="3.6" fill="${P.wheel}"/><circle cx="65" cy="86" r="3.6" fill="${P.wheel}"/>
    <rect x="29" y="50" width="42" height="32" rx="12" fill="${P.mint}"/>
    <rect x="29" y="72" width="42" height="10" rx="5" fill="${P.mintDark}" opacity=".35"/>
    <rect x="38" y="57" width="24" height="15" rx="6" fill="${P.mintPale}"/>
    <circle cx="44" cy="64.5" r="2.8" fill="${P.pink}"/><circle cx="50" cy="64.5" r="2.8" fill="${P.yellow}"/><circle cx="56" cy="64.5" r="2.8" fill="${P.blue}"/>
    <rect x="45" y="44" width="10" height="8" fill="${P.mintDark}"/>
    <rect x="17" y="23" width="7" height="15" rx="3.5" fill="${P.orange}"/><rect x="76" y="23" width="7" height="15" rx="3.5" fill="${P.orange}"/>
    <line x1="50" y1="15" x2="50" y2="6" stroke="${P.mintDark}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="50" cy="5.5" r="4.5" fill="#ff7aa8"><animate attributeName="fill" values="#ff7aa8;#ffd36b;#ff7aa8" dur="1.6s" repeatCount="indefinite"/></circle>
    <rect x="21" y="13" width="58" height="35" rx="15" fill="${P.mint}"/>
    <rect x="27" y="18" width="46" height="25" rx="10" fill="${P.screen}"/>
    <circle cx="33" cy="38" r="3" fill="${P.pink}" opacity=".7"/><circle cx="67" cy="38" r="3" fill="${P.pink}" opacity=".7"/>
    ${face}
    <path d="M30 20 Q34 18 40 18" stroke="#fff" stroke-width="2" opacity=".35" fill="none" stroke-linecap="round"/>
  </g>`;
}

// ---------- ground ----------
export function grass(alt = false, seed = 0) {
  const r = (i) => ((Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453) % 1 + 1) % 1;
  let tufts = '';
  for (let i = 0; i < 3; i++) {
    const x = 15 + r(i) * 70, y = 20 + r(i + 7) * 65;
    tufts += `<path d="M${x - 4} ${y} q2 -6 4 0 q2 -7 4 0" stroke="${P.tuft}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  }
  return `<rect width="100" height="100" fill="${alt ? P.grass2 : P.grass}"/>${tufts}`;
}

export function startPad() {
  return `<circle cx="50" cy="56" r="34" fill="#ffe3bf"/><circle cx="50" cy="56" r="27" fill="none" stroke="#ffc98a" stroke-width="3" stroke-dasharray="7 6"/>`;
}

// ---------- goal and treats ----------
export function battery() {
  return `<g><ellipse cx="50" cy="90" rx="22" ry="4" fill="#000" opacity=".12"/>
    <rect x="42" y="14" width="16" height="8" rx="3" fill="#c98a1f"/>
    <rect x="28" y="20" width="44" height="68" rx="12" fill="${P.yellow}"/>
    <rect x="28" y="56" width="44" height="32" rx="12" fill="#7ccf6a"/><rect x="28" y="56" width="44" height="12" fill="#7ccf6a"/>
    <path d="M53 26 L42 46 L50 46 L46 60 L59 38 L51 38 Z" fill="#fff" opacity=".9"/>
    <circle cx="42" cy="72" r="3" fill="#2b1d3a"/><circle cx="58" cy="72" r="3" fill="#2b1d3a"/>
    <circle cx="41" cy="71" r="1" fill="#fff"/><circle cx="57" cy="71" r="1" fill="#fff"/>
    <path d="M45 78 Q50 82 55 78" stroke="#2b1d3a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <circle cx="36" cy="77" r="2.6" fill="${P.pink}" opacity=".6"/><circle cx="64" cy="77" r="2.6" fill="${P.pink}" opacity=".6"/>
    <rect x="33" y="24" width="5" height="26" rx="2.5" fill="#fff" opacity=".4"/>
    <animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="1.8s" repeatCount="indefinite"/></g>`;
}

export function star() {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? 15 : 32;
    return `${(50 + Math.cos(a) * rr).toFixed(1)},${(52 + Math.sin(a) * rr).toFixed(1)}`;
  }).join(' ');
  return `<g><polygon points="${pts}" fill="${P.yellow}" stroke="${P.yellow}" stroke-width="7" stroke-linejoin="round"/>
    <polygon points="${pts}" fill="#ffe28f" transform="translate(50 52) scale(.55) translate(-50 -52)"/>
    <circle cx="44" cy="40" r="3" fill="#fff" opacity=".8"/>
    <animateTransform attributeName="transform" type="rotate" values="-6 50 52;6 50 52;-6 50 52" dur="2.4s" repeatCount="indefinite"/></g>`;
}

// ---------- things in the way ----------
export function rock() {
  return `<ellipse cx="50" cy="86" rx="34" ry="6" fill="#000" opacity=".12"/>
    <path d="M18 84 Q14 58 34 46 Q48 34 66 42 Q86 52 84 84 Z" fill="#b6b2c4"/>
    <path d="M18 84 Q30 76 50 80 Q70 84 84 84 Z" fill="#9893ab"/>
    <path d="M34 52 Q44 45 54 48" stroke="#fff" stroke-width="4" opacity=".55" fill="none" stroke-linecap="round"/>`;
}

export function tree() {
  return `<ellipse cx="50" cy="92" rx="26" ry="5" fill="#000" opacity=".12"/>
    <rect x="43" y="62" width="14" height="30" rx="5" fill="#b07a4f"/>
    <circle cx="50" cy="40" r="30" fill="#5fb552"/><circle cx="33" cy="52" r="17" fill="#5fb552"/><circle cx="67" cy="52" r="17" fill="#5fb552"/>
    <circle cx="42" cy="30" r="10" fill="#7ccf6a"/>
    <circle cx="62" cy="48" r="4" fill="#ff7a7a"/><circle cx="36" cy="56" r="4" fill="#ff7a7a"/><circle cx="54" cy="26" r="4" fill="#ff7a7a"/>`;
}

export function pond() {
  return `<ellipse cx="50" cy="56" rx="42" ry="32" fill="#7cc4f0"/>
    <ellipse cx="50" cy="56" rx="42" ry="32" fill="none" stroke="#a7dd8f" stroke-width="5"/>
    <ellipse cx="38" cy="50" rx="11" ry="5" fill="none" stroke="#d8efff" stroke-width="3"/>
    <path d="M62 64 m-11 0 a11 7 0 1 0 22 0 a11 7 0 1 0 -11 -7 Z" fill="#5fb552"/><circle cx="64" cy="63" r="3" fill="#ff9fc8"/>`;
}

export function crate() {
  return `<ellipse cx="50" cy="90" rx="34" ry="5" fill="#000" opacity=".12"/>
    <rect x="18" y="26" width="64" height="62" rx="6" fill="#e0a05c"/>
    <rect x="18" y="26" width="64" height="10" rx="5" fill="#f2b979"/>
    <path d="M24 40 L76 82 M76 40 L24 82" stroke="#c4823f" stroke-width="7" stroke-linecap="round"/>
    <rect x="22" y="36" width="56" height="48" rx="3" fill="none" stroke="#c4823f" stroke-width="5"/>`;
}

// ---------- program cards (100x110) ----------
export const DIRS = {
  up: { color: '#7cc4f0', edge: '#3f8fc4', rot: 0 },
  right: { color: '#ffb15c', edge: '#d9822b', rot: 90 },
  down: { color: '#7ccf6a', edge: '#4f9e45', rot: 180 },
  left: { color: '#ff9fc8', edge: '#d9608f', rot: 270 },
};

export function card(dir) {
  const d = DIRS[dir];
  return `<rect x="4" y="10" width="92" height="96" rx="20" fill="${d.edge}"/>
    <rect x="4" y="4" width="92" height="94" rx="20" fill="${d.color}"/>
    <g transform="rotate(${d.rot} 50 51)"><path d="M50 18 L78 50 L62 50 L62 82 L38 82 L38 50 L22 50 Z" fill="#fff" stroke="#fff" stroke-width="6" stroke-linejoin="round"/></g>`;
}

export function playButton() {
  return `<circle cx="50" cy="55" r="44" fill="#4f9e45"/><circle cx="50" cy="50" r="44" fill="#7ccf6a"/>
    <path d="M40 30 L72 50 L40 70 Z" fill="#fff" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>`;
}

export const svg = (inner, w = 100, h = 100) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${inner}</svg>`;
