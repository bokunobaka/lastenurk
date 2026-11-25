// Drawings for Näljased kastid, as SVG strings in the books' flat pastel style:
// no outlines, white highlights, pink cheeks, gentle SMIL blinking.
// A thing is drawn in a 100 × 100 box standing on y ≈ 90; a box creature is drawn with its top
// middle at 0,0. Everything else in the game scales and moves these.

export const C = {
  red: '#ff7a7a', blue: '#7cc4f0', yellow: '#ffd36b', green: '#7ccf6a', pink: '#ff9fc8', purple: '#b99af0',
  orange: '#ffb15c', brown: '#c98a5a', ink: '#3b2e5a', soft: '#6b5d8c', white: '#fff', cream: '#fff4e0',
  card: '#e8c79a', cardDark: '#c9a06a',
};
const D = {
  red: '#d95858', blue: '#4f9fd1', yellow: '#e0ac2c', green: '#4f9e45', pink: '#e070a2', purple: '#8a6cc9', orange: '#e08f3c',
};
const col = (c) => C[c] || c;
const dark = (c) => D[c] || C.soft;

const eye = (x, y, r = 4.5) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.ink}"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.38}" fill="#fff"/>`;
const cheek = (x, y, r = 4) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ff6f91" opacity=".35"/>`;
const shadow = (w = 30) => `<ellipse cx="50" cy="92" rx="${w}" ry="4" fill="#000" opacity=".1"/>`;
const wheel = (x, y, r = 8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.ink}"/><circle cx="${x}" cy="${y}" r="${r * 0.4}" fill="#cfc6e6"/>`;

// ---------- things ----------
const THINGS = {
  ball: (it) => `${shadow(26)}<circle cx="50" cy="60" r="30" fill="${col(it.color)}"/>
    <path d="M22 52 Q50 70 78 52" stroke="#fff" stroke-width="7" fill="none" opacity=".7"/>
    <path d="M34 42 Q40 35 48 34" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>`,
  block: (it) => `${shadow(30)}<path d="M24 40 L40 28 H80 L64 40Z" fill="#fff" opacity=".45"/><path d="M24 40 L40 28 H80 L64 40Z" fill="${col(it.color)}" opacity=".7"/>
    <path d="M64 40 L80 28 V74 L64 88Z" fill="${dark(it.color)}"/><rect x="24" y="40" width="40" height="48" fill="${col(it.color)}"/>
    <text x="44" y="75" text-anchor="middle" class="blockText">A</text>`,
  car: (it) => `${shadow(36)}<path d="M30 52 L38 36 H64 L74 52Z" fill="${col(it.color)}"/><path d="M36 50 L41 40 H50 V50Z M54 50 V40 H62 L68 50Z" fill="#e6f6ff"/>
    <rect x="14" y="50" width="72" height="24" rx="10" fill="${col(it.color)}"/><circle cx="82" cy="58" r="4" fill="${C.yellow}"/>
    ${wheel(32, 76, 10)}${wheel(68, 76, 10)}`,
  balloon: (it) => `<path d="M50 70 q-6 10 3 16 q6 5 -2 10" stroke="${C.soft}" stroke-width="2" fill="none"/>
    <ellipse cx="50" cy="40" rx="25" ry="30" fill="${col(it.color)}"/><path d="M45 69 h10 l-5 -6z" fill="${dark(it.color)}"/>
    <ellipse cx="40" cy="28" rx="6" ry="10" fill="#fff" opacity=".5" transform="rotate(25 40 28)"/>`,
  crayon: (it) => `${shadow(30)}<g transform="rotate(-35 50 55)"><rect x="18" y="45" width="56" height="20" rx="4" fill="${col(it.color)}"/>
    <rect x="30" y="45" width="30" height="20" fill="#fff" opacity=".6"/><path d="M74 45 L90 55 L74 65Z" fill="#f6dcb8"/><path d="M84 51.5 L90 55 L84 58.5Z" fill="${col(it.color)}"/></g>`,
  apple: () => `${shadow(26)}<path d="M50 38 C30 24 14 42 20 64 C25 84 40 92 50 86 C60 92 75 84 80 64 C86 42 70 24 50 38Z" fill="${C.red}"/>
    <path d="M50 38 q-2 -12 4 -18" stroke="${C.brown}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M55 28 q12 -10 22 -2 q-12 8 -22 2z" fill="${C.green}"/><ellipse cx="34" cy="52" rx="5" ry="9" fill="#fff" opacity=".45"/>`,
  dog: () => `${shadow(28)}<ellipse cx="50" cy="74" rx="24" ry="18" fill="#d9a066"/>
    <ellipse cx="26" cy="46" rx="10" ry="20" fill="#9a6a3c" transform="rotate(20 26 46)"/><ellipse cx="74" cy="46" rx="10" ry="20" fill="#9a6a3c" transform="rotate(-20 74 46)"/>
    <circle cx="50" cy="48" r="24" fill="#e7b57d"/><ellipse cx="50" cy="60" rx="13" ry="10" fill="#fff4e6"/>
    ${eye(41, 44)}${eye(59, 44)}<ellipse cx="50" cy="55" rx="5" ry="4" fill="${C.ink}"/>
    <path d="M44 63 q6 5 12 0" stroke="${C.ink}" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M47 65 q3 8 6 0z" fill="#ff7a9a"/>`,
  cat: () => `${shadow(28)}<ellipse cx="50" cy="76" rx="22" ry="16" fill="${C.orange}"/>
    <path d="M28 40 L30 14 L48 30Z M72 40 L70 14 L52 30Z" fill="${C.orange}"/><path d="M32 34 L33 20 L43 29Z M68 34 L67 20 L57 29Z" fill="${C.pink}"/>
    <circle cx="50" cy="48" r="23" fill="${C.orange}"/>${eye(41, 46)}${eye(59, 46)}
    <path d="M47 55 h6 l-3 3z" fill="${C.pink}"/><path d="M50 58 q-4 5 -8 2 M50 58 q4 5 8 2" stroke="${C.ink}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M36 56 h-16 M36 60 l-15 4 M64 56 h16 M64 60 l15 4" stroke="${C.ink}" stroke-width="1.5" opacity=".5"/>${cheek(36, 54)}${cheek(64, 54)}`,
  fish: () => `<path d="M24 54 L6 38 V70Z" fill="${C.orange}"/><ellipse cx="50" cy="54" rx="34" ry="24" fill="${C.orange}"/>
    <path d="M44 32 q10 -12 22 -2" fill="${C.orange}"/><path d="M42 40 q-6 14 0 28" stroke="#fff" stroke-width="4" fill="none" opacity=".5"/>
    ${eye(68, 48, 5)}<path d="M74 62 q4 3 8 0" stroke="${C.ink}" stroke-width="2.5" fill="none" stroke-linecap="round"/>${cheek(66, 60)}
    <circle cx="90" cy="34" r="4" fill="none" stroke="#7cc4f0" stroke-width="2"/><circle cx="84" cy="24" r="3" fill="none" stroke="#7cc4f0" stroke-width="2"/>`,
  octopus: () => `${[22, 38, 54, 70].map((x, i) => `<path d="M${x + 4} 58 q${i % 2 ? 6 : -6} 14 0 26 q-2 6 6 4" stroke="${C.purple}" stroke-width="9" fill="none" stroke-linecap="round"/>`).join('')}
    <path d="M18 60 C16 22 84 22 82 60 Z" fill="${C.purple}"/>${eye(40, 46, 5)}${eye(60, 46, 5)}
    <path d="M44 56 q6 5 12 0" stroke="${C.ink}" stroke-width="2.5" fill="none" stroke-linecap="round"/>${cheek(34, 54)}${cheek(66, 54)}
    <circle cx="36" cy="32" r="4" fill="#fff" opacity=".4"/>`,
  bird: () => `<ellipse cx="50" cy="56" rx="28" ry="24" fill="${C.blue}"/><path d="M24 56 L8 46 L12 62Z" fill="${C.blue}"/>
    <path d="M40 50 Q30 22 52 26 Q58 40 48 56Z" fill="${dark('blue')}"/><ellipse cx="54" cy="66" rx="16" ry="10" fill="#e6f6ff"/>
    ${eye(64, 48, 4.5)}<path d="M76 52 L90 56 L76 60Z" fill="${C.orange}"/>${cheek(66, 58, 3.5)}`,
  butterfly: () => `<path d="M48 50 C30 20 8 26 16 46 C20 56 36 56 48 52Z M52 50 C70 20 92 26 84 46 C80 56 64 56 52 52Z" fill="${C.pink}"/>
    <path d="M48 54 C32 58 22 78 36 80 C44 80 48 68 48 58Z M52 54 C68 58 78 78 64 80 C56 80 52 68 52 58Z" fill="${C.purple}"/>
    <circle cx="28" cy="40" r="6" fill="#fff" opacity=".6"/><circle cx="72" cy="40" r="6" fill="#fff" opacity=".6"/>
    <rect x="46" y="38" width="8" height="40" rx="4" fill="${C.ink}"/><path d="M48 40 q-6 -14 -12 -16 M52 40 q6 -14 12 -16" stroke="${C.ink}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
  bee: () => `<ellipse cx="40" cy="34" rx="14" ry="10" fill="#fff" opacity=".85"/><ellipse cx="58" cy="32" rx="14" ry="10" fill="#fff" opacity=".85"/>
    <ellipse cx="50" cy="58" rx="30" ry="22" fill="${C.yellow}"/><path d="M38 38 v40 M52 36 v44" stroke="${C.ink}" stroke-width="8"/>
    <path d="M20 58 l-10 3 l10 3z" fill="${C.ink}"/>${eye(68, 52, 4.5)}<path d="M66 64 q5 4 10 0" stroke="${C.ink}" stroke-width="2.5" fill="none" stroke-linecap="round"/>${cheek(74, 60, 3.5)}`,
  bus: () => `${shadow(40)}<rect x="10" y="28" width="80" height="50" rx="10" fill="${C.yellow}"/>
    ${[18, 38, 58].map((x) => `<rect x="${x}" y="36" width="15" height="16" rx="3" fill="#e6f6ff"/>`).join('')}<rect x="76" y="36" width="10" height="26" rx="3" fill="#e6f6ff"/>
    <rect x="10" y="62" width="80" height="6" fill="${C.orange}"/>${wheel(28, 80, 9)}${wheel(72, 80, 9)}`,
  boat: () => `<path d="M8 60 H92 L80 82 H20Z" fill="${C.red}"/><rect x="34" y="40" width="34" height="20" rx="5" fill="#fff"/>
    <rect x="40" y="45" width="9" height="9" rx="2" fill="${C.blue}"/><rect x="53" y="45" width="9" height="9" rx="2" fill="${C.blue}"/>
    <rect x="58" y="28" width="7" height="13" fill="${C.ink}"/><path d="M4 90 q12 -8 24 0 t24 0 t24 0 t24 0" stroke="${C.blue}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  sailboat: () => `<path d="M52 12 V64 H20Z" fill="#fff"/><path d="M56 22 V64 H80Z" fill="${C.yellow}"/><rect x="51" y="10" width="5" height="56" fill="${C.brown}"/>
    <path d="M14 64 H88 L78 82 H24Z" fill="${C.brown}"/><path d="M4 90 q12 -8 24 0 t24 0 t24 0 t24 0" stroke="${C.blue}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  plane: () => `<path d="M40 50 L22 20 H32 L60 50Z" fill="${C.blue}"/><path d="M14 52 L6 34 H14 L26 50Z" fill="${C.red}"/>
    <rect x="10" y="48" width="78" height="18" rx="9" fill="#fff"/><path d="M80 48 q12 0 12 9 q0 9 -12 9z" fill="${C.red}"/>
    ${[40, 50, 60, 70].map((x) => `<circle cx="${x}" cy="56" r="3.5" fill="${C.blue}"/>`).join('')}<path d="M42 62 L24 86 H34 L58 62Z" fill="${dark('blue')}"/>`,
  helicopter: () => `<rect x="14" y="20" width="72" height="5" rx="2.5" fill="${C.ink}"/><rect x="47" y="22" width="6" height="12" fill="${C.ink}"/>
    <path d="M58 54 H90 V48 h6 v16 h-6 v-4 H58Z" fill="${C.green}"/><ellipse cx="44" cy="56" rx="28" ry="22" fill="${C.green}"/>
    <path d="M30 50 a16 14 0 0 1 28 0 v6 h-28z" fill="#e6f6ff"/><path d="M26 82 H66 M34 76 v6 M58 76 v6" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/>`,
  cookie: (it) => {
    const icing = col(it.color);
    const sh = {
      circ: (r) => `<circle cx="50" cy="55" r="${r}"/>`,
      sq: (r) => `<rect x="${50 - r}" y="${55 - r}" width="${r * 2}" height="${r * 2}" rx="${r * 0.18}"/>`,
      tri: (r) => `<path d="M50 ${55 - r * 1.15} L${50 + r * 1.2} ${55 + r * 0.85} H${50 - r * 1.2}Z" stroke-linejoin="round"/>`,
      star: (r) => {
        let d = '';
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.5 : r * 1.15;
          d += `${i ? 'L' : 'M'}${(50 + Math.cos(a) * rr).toFixed(1)} ${(57 + Math.sin(a) * rr).toFixed(1)}`;
        }
        return `<path d="${d}Z"/>`;
      },
    }[it.shape];
    return `${shadow(30)}<g fill="#d9a066" stroke="#d9a066" stroke-width="6" stroke-linejoin="round">${sh(34)}</g>
      <g fill="${icing}" stroke="${icing}" stroke-width="3" stroke-linejoin="round">${sh(24)}</g>
      ${[[42, 50], [56, 60], [50, 46], [44, 62]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="6" height="2.6" rx="1.3" fill="#fff" transform="rotate(${i * 50} ${x} ${y})"/>`).join('')}`;
  },
  ladybug: (it) => {
    const spots = { 1: [[50, 62]], 2: [[37, 58], [63, 58]], 3: [[37, 54], [63, 54], [50, 74]] }[it.spots] || [];
    return `${shadow(30)}<circle cx="50" cy="30" r="13" fill="${C.ink}"/>${eye(45, 27, 3.5)}${eye(55, 27, 3.5)}
      <path d="M44 20 q-6 -10 -12 -10 M56 20 q6 -10 12 -10" stroke="${C.ink}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="50" cy="60" rx="32" ry="28" fill="${C.red}"/><path d="M50 34 V88" stroke="${C.ink}" stroke-width="3"/>
      ${spots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="${C.ink}"/>`).join('')}
      <ellipse cx="34" cy="44" rx="6" ry="4" fill="#fff" opacity=".45" transform="rotate(-30 34 44)"/>`;
  },
  banana: () => `${shadow(28)}<path d="M50 40 C40 50 26 70 22 86 C34 80 44 64 50 52Z" fill="${C.yellow}"/>
    <path d="M50 40 C60 50 74 70 78 86 C66 80 56 64 50 52Z" fill="${C.yellow}"/><path d="M50 40 C46 60 46 76 50 88 C54 76 54 60 50 40Z" fill="#f2c94c"/>
    <rect x="46" y="22" width="8" height="20" rx="3" fill="#a5733f"/><circle cx="30" cy="80" r="2" fill="#a5733f"/><circle cx="68" cy="74" r="2" fill="#a5733f"/>`,
  core: () => `${shadow(20)}<path d="M50 30 q-2 -10 3 -16" stroke="${C.brown}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M30 30 Q50 22 70 30 Q72 40 62 44 Q56 58 62 72 Q72 76 70 86 Q50 94 30 86 Q28 76 38 72 Q44 58 38 44 Q28 40 30 30Z" fill="#fff4d6"/>
    <path d="M30 30 Q50 22 70 30 Q70 38 64 40 Q50 36 36 40 Q30 38 30 30Z M30 86 Q50 94 70 86 Q70 78 64 76 Q50 80 36 76 Q30 78 30 86Z" fill="${C.red}"/>
    <ellipse cx="46" cy="58" rx="2.5" ry="4" fill="#5a3a1c"/><ellipse cx="54" cy="58" rx="2.5" ry="4" fill="#5a3a1c"/>`,
  egg: () => `${shadow(30)}<path d="M18 70 Q18 90 38 90 Q50 90 52 76 L46 70 L40 74 L34 66 L28 72 L22 64Z" fill="#f6dfc0"/>
    <path d="M50 60 Q50 84 68 86 Q84 86 84 66 L78 60 L72 66 L66 56 L60 64 L54 56Z" fill="#f6dfc0"/><ellipse cx="36" cy="80" rx="9" ry="5" fill="#ffd36b"/>
    <path d="M18 70 Q18 90 38 90 Q50 90 52 76" stroke="#d9b98f" stroke-width="3" fill="none"/><path d="M50 60 Q50 84 68 86 Q84 86 84 66" stroke="#d9b98f" stroke-width="3" fill="none"/>`,
  paper: () => `${shadow(34)}<path d="M16 26 H76 L84 34 V88 H16Z" fill="#f4f1ea"/><rect x="24" y="34" width="52" height="10" fill="${C.soft}" opacity=".7"/>
    <rect x="24" y="50" width="22" height="18" fill="${C.blue}" opacity=".6"/>${[50, 56, 62, 68, 74, 80].map((y) => `<path d="M${y < 70 ? 52 : 24} ${y} H76" stroke="#c9c2d6" stroke-width="3"/>`).join('')}`,
  carton: () => `${shadow(36)}<path d="M18 40 L50 28 L84 40 L52 52Z" fill="#e0b47e"/><path d="M18 40 L52 52 V90 L18 78Z" fill="${C.card}"/>
    <path d="M52 52 L84 40 V78 L52 90Z" fill="${C.cardDark}"/><path d="M34 34 L68 46" stroke="#f4e2c4" stroke-width="7"/>
    <path d="M28 60 l6 6 l6 -6" stroke="#a5733f" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  bag: () => `${shadow(28)}<path d="M26 34 H74 L78 90 H22Z" fill="${C.card}"/><path d="M26 34 H74 L70 42 H30Z" fill="${C.cardDark}"/>
    <path d="M24 34 l4 -6 l4 6 l4 -6 l4 6 l4 -6 l4 6 l4 -6 l4 6 l4 -6 l4 6 l4 -6 l4 6" fill="${C.card}"/>
    <path d="M30 50 v34" stroke="${C.cardDark}" stroke-width="2.5"/>`,
  bottle: () => `${shadow(20)}<rect x="42" y="8" width="16" height="10" rx="3" fill="${C.blue}"/><path d="M44 18 H56 L62 30 V88 Q62 92 58 92 H42 Q38 92 38 88 V30Z" fill="#d6f0fb"/>
    <rect x="38" y="48" width="24" height="18" fill="${C.blue}"/>${[38, 72, 80].map((y) => `<path d="M38 ${y} H62" stroke="#a9dff4" stroke-width="3"/>`).join('')}
    <path d="M44 32 V44" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,
  yogurt: () => `${shadow(26)}<path d="M26 34 H74 L68 88 H32Z" fill="#f1ecff" stroke="#cfc6e6" stroke-width="3" stroke-linejoin="round"/><rect x="22" y="28" width="56" height="9" rx="4" fill="#cfc6e6"/>
    <circle cx="50" cy="60" r="12" fill="${C.pink}"/><path d="M44 54 q6 -6 12 0" stroke="${C.green}" stroke-width="4" fill="none"/>
    <circle cx="47" cy="62" r="1.5" fill="#fff"/><circle cx="53" cy="64" r="1.5" fill="#fff"/>`,
  can: () => `${shadow(24)}<rect x="30" y="24" width="40" height="66" rx="6" fill="#c9cfdc"/><ellipse cx="50" cy="26" rx="20" ry="5" fill="#e3e7ef"/>
    <rect x="30" y="40" width="40" height="32" fill="${C.green}"/><path d="M38 50 h24 M38 58 h16" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
    <path d="M36 28 V86" stroke="#fff" stroke-width="3" opacity=".6"/>`,
  jar: () => `${shadow(26)}<rect x="30" y="20" width="40" height="12" rx="3" fill="${C.red}"/><rect x="26" y="32" width="48" height="58" rx="10" fill="#bde6f2" opacity=".9"/>
    <rect x="30" y="52" width="40" height="34" rx="7" fill="#e85b7a" opacity=".75"/><rect x="34" y="40" width="5" height="40" rx="2.5" fill="#fff" opacity=".7"/>`,
  glass: () => `${shadow(20)}<rect x="44" y="6" width="12" height="20" rx="3" fill="#3f8f4a"/><path d="M44 26 H56 Q58 36 66 42 V88 Q66 92 62 92 H38 Q34 92 34 88 V42 Q42 36 44 26Z" fill="#5fb36a"/>
    <rect x="34" y="56" width="32" height="20" fill="#fff4e0"/><path d="M40 46 V84" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/>`,
};

// a thing at full size; small things are drawn smaller around their bottom middle
export function thing(it) {
  const body = THINGS[it.name](it);
  return it.size === 'small' ? `<g transform="translate(50 90) scale(.6) translate(-50 -90)">${body}</g>` : body;
}

// ---------- labels: what a box eats ----------
const shapeIcon = (s, fill, r = 20) =>
  ({
    circ: `<circle cx="0" cy="0" r="${r}" fill="${fill}"/>`,
    sq: `<rect x="${-r}" y="${-r}" width="${r * 2}" height="${r * 2}" rx="4" fill="${fill}"/>`,
    tri: `<path d="M0 ${-r * 1.1} L${r * 1.2} ${r * 0.85} H${-r * 1.2}Z" fill="${fill}" stroke="${fill}" stroke-width="4" stroke-linejoin="round"/>`,
    star: `<path d="${Array.from({ length: 10 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.5 : r * 1.2;
      return `${i ? 'L' : 'M'}${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr + 2).toFixed(1)}`;
    }).join('')}Z" fill="${fill}"/>`,
  })[s];

// the picture on a box's label, in a 100 × 64 area centred on 0,0
function labelIcon(rule, value) {
  const rules = [].concat(rule), vals = [].concat(value);
  const v = Object.fromEntries(rules.map((r, i) => [r, vals[i]]));
  if (v.shape) return shapeIcon(v.shape, v.color ? col(v.color) : C.ink);
  if (v.size) {
    const r = v.size === 'big' ? 24 : 11;
    return `<circle cx="0" cy="${24 - r}" r="${r}" fill="${v.color ? col(v.color) : C.ink}"/>`;
  }
  if (v.color) return `<path d="M-22 -4 Q-24 -22 -4 -22 Q8 -30 18 -18 Q30 -10 22 6 Q24 22 6 22 Q-10 30 -18 18 Q-30 12 -22 -4Z" fill="${col(v.color)}"/>`;
  if (v.kind === 'animal')
    return `<g fill="${C.ink}"><ellipse cx="0" cy="8" rx="13" ry="11"/><circle cx="-15" cy="-8" r="6"/><circle cx="-5" cy="-17" r="6"/><circle cx="7" cy="-17" r="6"/><circle cx="16" cy="-7" r="6"/></g>`;
  if (v.kind === 'vehicle') return `<circle r="22" fill="${C.ink}"/><circle r="9" fill="#cfc6e6"/>${[0, 60, 120].map((a) => `<path d="M0 -20 V20" stroke="#cfc6e6" stroke-width="4" transform="rotate(${a})"/>`).join('')}`;
  if (v.home === 'land') return `<path d="M-40 22 Q-10 -18 40 22Z" fill="${C.green}"/><circle cx="12" cy="-4" r="9" fill="#4f9e45"/><rect x="10" y="2" width="4" height="12" fill="${C.brown}"/><circle cx="-26" cy="-18" r="8" fill="${C.yellow}"/>`;
  if (v.home === 'water') return `${[-10, 6, 22].map((y) => `<path d="M-38 ${y} q9.5 -9 19 0 t19 0 t19 0 t19 0" stroke="${C.blue}" stroke-width="7" fill="none" stroke-linecap="round"/>`).join('')}`;
  if (v.home === 'air') return `<g fill="#9fd3f0"><circle cx="-16" cy="6" r="14"/><circle cx="2" cy="-4" r="18"/><circle cx="20" cy="8" r="12"/><rect x="-30" y="6" width="60" height="14" rx="7"/></g>`;
  if (v.spots)
    return `<ellipse cx="0" cy="2" rx="32" ry="22" fill="${C.red}"/><path d="M0 -20 V24" stroke="${C.ink}" stroke-width="3"/>
      ${({ 1: [[0, 2]], 2: [[-14, 0], [14, 0]], 3: [[-14, -4], [14, -4], [0, 14]] })[v.spots].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${C.ink}"/>`).join('')}`;
  if (v.waste) return `<g transform="translate(-44 -50) scale(.88)">${THINGS[{ bio: 'core', paper: 'paper', pack: 'bottle', glass: 'jar' }[v.waste]]()}</g>`;
  return '';
}

// bins for rubbish have the Estonian container colours
export const BIN = { bio: '#a8774c', paper: '#4f9fd1', pack: '#f2c13a', glass: '#4f9e45' };

// ---------- the box creature ----------
// o.mood: 'open' | 'happy' | 'yuck' | 'chomp'; o.color: body colour; o.label: inner svg for the label
export function box(o = {}) {
  const w = o.w || 190, h = o.h || 180;
  const body = o.color || C.card;
  const edge = o.edge || C.cardDark;
  const mood = o.mood || 'open';
  const flapUp = mood === 'chomp' ? 0 : mood === 'happy' ? 40 : 28;
  const flap = (s) =>
    `<path d="M${(s * w) / 2} 0 L${(s * w) / 2 + s * 10} ${-flapUp} L${s * 12} ${-flapUp - 6} L0 0Z" fill="${edge}" transform="translate(${-s * 4} 0)"/>`;
  const eyes =
    mood === 'happy'
      ? `<path d="M-34 42 q10 -12 20 0 M14 42 q10 -12 20 0" stroke="${C.ink}" stroke-width="5" fill="none" stroke-linecap="round"/>`
      : mood === 'yuck'
        ? `<path d="M-34 34 l18 8 l-18 8 M34 34 l-18 8 l18 8" stroke="${C.ink}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<g>${eye(-24, 40, 9)}${eye(24, 40, 9)}<rect x="-36" y="29" width="72" height="0" fill="${body}"><animate attributeName="height" values="0;0;24;0" keyTimes="0;.94;.97;1" dur="${3 + (o.seed || 0) * 0.7}s" repeatCount="indefinite"/></rect></g>`;
  const mouth =
    mood === 'yuck'
      ? `<path d="M-14 66 q14 -10 28 0" stroke="${C.ink}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M8 64 q6 10 12 2z" fill="#7ccf6a"/>`
      : `<path d="M-14 60 q14 ${mood === 'happy' ? 16 : 10} 28 0" stroke="${C.ink}" stroke-width="4" fill="${mood === 'happy' ? '#ff7a9a' : 'none'}" stroke-linecap="round"/>`;
  return `<g class="boxc">
    <ellipse cx="0" cy="${h + 4}" rx="${w / 2 + 6}" ry="9" fill="#000" opacity=".1"/>
    ${flap(-1)}${flap(1)}
    <rect x="${-w / 2}" y="0" width="${w}" height="${h}" rx="18" fill="${body}"/>
    <rect x="${-w / 2 + 10}" y="-8" width="${w - 20}" height="18" rx="8" fill="${C.ink}" opacity=".75"/>
    <rect x="${-w / 2}" y="${h - 22}" width="${w}" height="22" rx="11" fill="${edge}" opacity=".35"/>
    ${eyes}${mouth}${cheek(-48, 56, 8)}${cheek(48, 56, 8)}
    <rect x="${-w / 2 + 18}" y="${h - 98}" width="${w - 36}" height="80" rx="14" fill="#fff" opacity=".92"/>
    <g transform="translate(0 ${h - 58})">${o.label || ''}</g>
  </g>`;
}

// the label for a box: its rule's picture, or (mystery) two things it already ate
export function label(lv, b) {
  if (lv.mystery) {
    return lv.mystery[b].map((it, i) => `<g transform="translate(${-62 + i * 64} -38) scale(.6)">${thing(it)}</g>`).join('');
  }
  const waste = [].concat(lv.rule).includes('waste');
  return waste ? labelIcon(lv.rule, lv.boxes[b]) : `<g transform="scale(1.25)">${labelIcon(lv.rule, lv.boxes[b])}</g>`;
}

// box colour: the colour it eats (colour rules), the bin colour (rubbish), else cardboard
export function boxColor(lv, b) {
  if (lv.mystery) return { color: C.card, edge: C.cardDark };
  const rules = [].concat(lv.rule), vals = [].concat(lv.boxes[b]);
  const c = vals[rules.indexOf('color')];
  if (c) return { color: col(c), edge: dark(c) };
  const w = vals[rules.indexOf('waste')];
  if (w) return { color: BIN[w], edge: C.soft };
  return { color: C.card, edge: C.cardDark };
}

// ---------- the belt ----------
export function belt(x0, x1, y) {
  const rollers = [];
  for (let x = x0 + 30; x < x1 - 10; x += 60) rollers.push(`<circle cx="${x}" cy="${y + 20}" r="11" fill="#8a7caa"/><circle cx="${x}" cy="${y + 20}" r="4" fill="#cfc6e6"/>`);
  return `<rect x="${x0}" y="${y - 6}" width="${x1 - x0}" height="40" rx="20" fill="#5b4e7a"/>
    ${rollers.join('')}
    <rect x="${x0}" y="${y - 8}" width="${x1 - x0}" height="12" rx="6" fill="#6b5d8c"/>
    <g clip-path="url(#beltClip)"><g class="beltLines">${Array.from({ length: Math.ceil((x1 - x0) / 40) + 2 }, (_, i) => `<rect x="${x0 + i * 40 - 40}" y="${y - 7}" width="16" height="10" rx="3" fill="#8a7caa"/>`).join('')}</g></g>
    <clipPath id="beltClip"><rect x="${x0}" y="${y - 8}" width="${x1 - x0}" height="12" rx="6"/></clipPath>`;
}

// the pipe at the start of the belt that drops things on it, and the chute at the end
export function pipe(x, y) {
  return `<rect x="${x - 46}" y="-400" width="92" height="${y + 400}" fill="#b99af0"/><rect x="${x - 56}" y="${y - 22}" width="112" height="30" rx="12" fill="#8a6cc9"/>
    <rect x="${x - 30}" y="-400" width="12" height="${y + 380}" fill="#fff" opacity=".25"/>`;
}
export function chute(x, y) {
  return `<path d="M${x} ${y} L${x + 70} ${y + 30} V${y + 130} H${x + 10}Z" fill="#cfc6e6"/>
    <path d="M${x + 22} ${y + 74} a16 16 0 1 1 8 14" stroke="#8a6cc9" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M${x + 18} ${y + 92} l14 -6 l-12 -8z" fill="#8a6cc9"/>`;
}

export const svg = (inner, vb = '0 0 100 100') => `<svg viewBox="${vb}" aria-hidden="true">${inner}</svg>`;
