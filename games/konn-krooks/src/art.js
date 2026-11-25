// Drawings for Konn Krooks, as SVG strings in the books' flat pastel style:
// no outlines, white eye highlights, pink cheeks, gentle SMIL blinking.
// The pond is drawn in world units: lily pad n sits at x = n * PAD, the pads' row at y = ROW.
export const PAD = 100;
export const ROW = 230;

const P = {
  frog: '#7ccf6a', frogDark: '#4f9e45', belly: '#d8f5b8', ink: '#2b1d3a', cheek: '#ff8fa8',
  pad: '#8fd47a', padDark: '#5fae52', padTen: '#ffd36b', water: '#9fdcf5', water2: '#bfe9fa',
  plus: '#7ccf6a', plusDark: '#4f9e45', minus: '#ffb15c', minusDark: '#d9822c',
};

// ---------- the frog ----------
// o.mood: 'open' | 'happy' | 'oops' | 'blink'; o.tongue: length of the tongue reaching up-forward
export function frog(o = {}) {
  const mood = o.mood || 'open';
  const eye = (cx) => {
    if (mood === 'happy') return `<circle cx="${cx}" cy="-62" r="15" fill="${P.frog}"/><path d="M${cx - 8} -60 Q${cx} -70 ${cx + 8} -60" stroke="${P.ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    if (mood === 'oops') return `<circle cx="${cx}" cy="-62" r="15" fill="${P.frog}"/><circle cx="${cx}" cy="-62" r="11" fill="#fff"/><path d="M${cx - 5} -66 l10 8 M${cx + 5} -66 l-10 8" stroke="${P.ink}" stroke-width="3.5" stroke-linecap="round"/>`;
    return `<circle cx="${cx}" cy="-62" r="15" fill="${P.frog}"/><circle cx="${cx}" cy="-62" r="11" fill="#fff"/>
      <circle cx="${cx + 2}" cy="-61" r="6" fill="${P.ink}"/><circle cx="${cx}" cy="-63.5" r="2.2" fill="#fff"/>
      <rect x="${cx - 12}" y="-75" width="24" height="0" fill="${P.frog}"><animate attributeName="height" values="0;0;26;0" keyTimes="0;.93;.965;1" dur="3.6s" repeatCount="indefinite"/></rect>`;
  };
  const mouth =
    mood === 'oops'
      ? `<ellipse cx="0" cy="-30" rx="7" ry="5" fill="${P.ink}"/>`
      : `<path d="M-18 -33 Q0 ${mood === 'happy' ? -14 : -22} 18 -33" stroke="${P.ink}" stroke-width="4" fill="${mood === 'happy' ? '#ff7a9a' : 'none'}" stroke-linecap="round"/>`;
  const tongue = o.tongue
    ? `<path d="M0 -30 Q7 ${-30 - o.tongue / 2} 0 ${-30 - o.tongue}" stroke="#ff6f91" stroke-width="7" fill="none" stroke-linecap="round"/>
       <circle cx="0" cy="${-30 - o.tongue}" r="7" fill="#ff6f91"/>`
    : '';
  return `<g class="frog">
    <ellipse cx="0" cy="2" rx="40" ry="7" fill="#000" opacity=".12"/>
    <ellipse cx="-30" cy="-6" rx="16" ry="9" fill="${P.frogDark}"/><ellipse cx="30" cy="-6" rx="16" ry="9" fill="${P.frogDark}"/>
    <ellipse cx="0" cy="-28" rx="38" ry="30" fill="${P.frog}"/>
    <ellipse cx="0" cy="-18" rx="24" ry="17" fill="${P.belly}"/>
    <ellipse cx="-14" cy="-3" rx="9" ry="6" fill="${P.frogDark}"/><ellipse cx="14" cy="-3" rx="9" ry="6" fill="${P.frogDark}"/>
    ${eye(-17)}${eye(17)}
    <circle cx="-27" cy="-36" r="6" fill="${P.cheek}" opacity=".7"/><circle cx="27" cy="-36" r="6" fill="${P.cheek}" opacity=".7"/>
    ${mouth}${tongue}
  </g>`;
}

// ---------- the fly ----------
export function fly() {
  return `<g class="fly">
    <ellipse cx="-8" cy="-12" rx="11" ry="7" fill="#fff" opacity=".85" transform="rotate(-25 -8 -12)"><animate attributeName="ry" values="7;2;7" dur=".12s" repeatCount="indefinite"/></ellipse>
    <ellipse cx="8" cy="-12" rx="11" ry="7" fill="#fff" opacity=".85" transform="rotate(25 8 -12)"><animate attributeName="ry" values="7;2;7" dur=".12s" repeatCount="indefinite"/></ellipse>
    <ellipse cx="0" cy="0" rx="12" ry="10" fill="#5b4e7a"/>
    <circle cx="-5" cy="-2" r="4" fill="#fff"/><circle cx="5" cy="-2" r="4" fill="#fff"/>
    <circle cx="-4" cy="-1.5" r="2" fill="${P.ink}"/><circle cx="6" cy="-1.5" r="2" fill="${P.ink}"/>
    <path d="M-3 5 Q0 7 3 5" stroke="#fff" stroke-width="1.5" fill="none"/>
  </g>`;
}

// ---------- the pond ----------
// a lily pad with its number; tens get a yellow flower so 10 and 20 stand out
export function pad(n) {
  const ten = n > 0 && n % 10 === 0;
  const leaf = (dy, fill) => `<path d="M0 ${dy} L38.6 ${dy - 3.9} A40 15 0 1 0 38.6 ${dy + 3.9} Z" fill="${fill}"/>`;
  return `<g class="pad">${leaf(6, P.padDark)}${leaf(0, P.pad)}
    <path d="M-22 -4 Q-6 -9 10 -5" stroke="#b6e59a" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
    ${ten ? `<circle cx="-26" cy="0" r="7" fill="#fff"/><circle cx="-26" cy="0" r="3.5" fill="${P.padTen}"/>` : ''}
  </g>`;
}
export function padNumber(n) {
  return `<text x="0" y="52" text-anchor="middle" class="num${n % 10 === 0 ? ' ten' : ''}">${n}</text>`;
}

// the water band and things on the far bank, for pads 0..N
export function pond(N) {
  const x0 = -PAD * 1.5, x1 = (N + 1.5) * PAD;
  let reeds = '';
  for (let x = x0 + 40; x < x1; x += 135) {
    const h = 70 + ((x * 7) % 40);
    reeds += `<path d="M${x} 150 q-6 ${-h / 2} 4 ${-h}" stroke="#7cbf62" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M${x + 14} 150 q8 ${-h / 2.4} -2 ${-h * 0.8}" stroke="#95d07a" stroke-width="5" fill="none" stroke-linecap="round"/>
      ${(x / 135) % 2 < 1 ? `<rect x="${x + 1}" y="${150 - h - 4}" width="9" height="26" rx="4.5" fill="#a5733f"/>` : ''}`;
  }
  let ripples = '';
  for (let x = x0 + 70; x < x1; x += 160) ripples += `<path d="M${x} ${300 + ((x * 3) % 30)} q14 -6 28 0" stroke="#fff" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`;
  return `<rect x="${x0}" y="-400" width="${x1 - x0}" height="560" fill="#dff4ff"/>
    <rect x="${x0}" y="120" width="${x1 - x0}" height="40" fill="#b6e59a"/>
    ${reeds}
    <rect x="${x0}" y="150" width="${x1 - x0}" height="400" fill="${P.water}"/>
    <rect x="${x0}" y="150" width="${x1 - x0}" height="22" fill="${P.water2}"/>${ripples}`;
}

// a ring of water where a pad is missing
export function gapMark() {
  return `<ellipse cx="0" cy="4" rx="34" ry="11" fill="none" stroke="#fff" stroke-width="3" opacity=".7" stroke-dasharray="8 7"/>`;
}

// ---------- cards ----------
// sign and number big, and the same number of dots (in rows of five) for counting
export function card(v) {
  const plus = v > 0, n = Math.abs(v);
  const col = plus ? P.plus : P.minus, dark = plus ? P.plusDark : P.minusDark;
  let dots = '';
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / 5), c = i % 5;
    const inRow = Math.min(5, n - row * 5);
    dots += `<circle cx="${50 + (c - (inRow - 1) / 2) * 15}" cy="${84 + row * 14}" r="5.5" fill="${dark}"/>`;
  }
  return `<rect x="4" y="8" width="92" height="${n > 5 ? 112 : 100}" rx="18" fill="${dark}"/>
    <rect x="4" y="2" width="92" height="${n > 5 ? 112 : 100}" rx="18" fill="#fff"/>
    <rect x="10" y="8" width="80" height="56" rx="13" fill="${col}"/>
    <text x="50" y="50" text-anchor="middle" class="cardText">${plus ? '+' : '−'}${n}</text>${dots}`;
}

export const svg = (inner, w = 100, h = 100) => `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true">${inner}</svg>`;
