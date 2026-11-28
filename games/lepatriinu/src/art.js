// Drawings. The garden is drawn on a canvas in cell units (1 = one cell of the map, the ladybug is 0.6 across);
// the title and win pictures are SVG.
const TAU = Math.PI * 2;
export const PAIR = { a: '#a96cf2', b: '#3fa2f2', c: '#ff8a2a' }; // a button's petals and its gate's badge

export function hash(a, b) {
  let h = (a * 374761393 + b * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// one path for a group of cells (is(x, y) says which): rounded outer corners, joined where cells touch
function blob(c, W, H, isIn, inset, r, dx = 0, dy = 0) {
  const is = (x, y) => x >= 0 && y >= 0 && x < W && y < H && isIn(x, y);
  c.beginPath();
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!is(x, y)) continue;
      const X = x + dx, Y = y + dy, s = 1 - 2 * inset;
      c.roundRect(X + inset, Y + inset, s, s, r);
      if (is(x + 1, y)) c.rect(X + 0.5, Y + inset, 1, s);
      if (is(x, y + 1)) c.rect(X + inset, Y + 0.5, s, 1);
      if (is(x + 1, y) && is(x, y + 1) && is(x + 1, y + 1)) c.rect(X + 0.5, Y + 0.5, 1, 1);
    }
}

// ---------- the still garden: path, hedges, ice, honey, holes (drawn once per level) ----------
export function garden(c, m) {
  const { W, H } = m;
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? '#' : m.rows[y][x]);
  const isHedge = (x, y) => at(x, y) === '#';
  // the path: warm earth with pebbles
  c.fillStyle = '#f3e2bd';
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!isHedge(x, y)) c.fillRect(x - 0.01, y - 0.01, 1.02, 1.02);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (isHedge(x, y)) continue;
      for (let k = 0; k < 3; k++) {
        const h = hash(x * 7 + k, y * 13 + k);
        if (h > 0.6) continue;
        c.fillStyle = h < 0.2 ? '#e2cc9c' : '#ead6ab';
        c.beginPath();
        c.ellipse(x + hash(y, x + k * 3), y + hash(x + k * 5, y), 0.04 + h * 0.06, 0.03 + h * 0.04, h * 3, 0, TAU);
        c.fill();
      }
    }
  // ice: pale blue, joined, with shine
  const isIce = (x, y) => at(x, y) === 'i';
  blob(c, W, H, isIce, 0.02, 0.18);
  c.fillStyle = '#cdeefd';
  c.fill();
  blob(c, W, H, isIce, 0.1, 0.12, 0.02, 0.02);
  c.fillStyle = '#e4f7ff';
  c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.95)';
  c.lineCap = 'round';
  c.lineWidth = 0.05;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!isIce(x, y) || hash(x, y) > 0.55) continue;
      const ox = x + 0.25 + hash(y, x) * 0.3, oy = y + 0.3 + hash(x + 1, y) * 0.3;
      c.beginPath();
      c.moveTo(ox, oy + 0.18);
      c.lineTo(ox + 0.18, oy);
      c.moveTo(ox + 0.12, oy + 0.24);
      c.lineTo(ox + 0.22, oy + 0.14);
      c.stroke();
    }
  // honey: golden, joined, glossy
  const isHoney = (x, y) => at(x, y) === 'm';
  blob(c, W, H, isHoney, 0.03, 0.3);
  c.fillStyle = '#f5b324';
  c.fill();
  blob(c, W, H, isHoney, 0.1, 0.26, -0.02, -0.03);
  c.fillStyle = '#ffcf4d';
  c.fill();
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!isHoney(x, y)) continue;
      const h = hash(x + 3, y + 9);
      c.fillStyle = 'rgba(255,255,255,0.55)';
      c.beginPath();
      c.ellipse(x + 0.3 + h * 0.3, y + 0.3 + hash(y, x + 2) * 0.3, 0.09, 0.05, -0.6, 0, TAU);
      c.fill();
      c.fillStyle = 'rgba(214,138,10,0.45)';
      c.beginPath();
      c.arc(x + 0.7 - h * 0.3, y + 0.72, 0.05 + h * 0.04, 0, TAU);
      c.fill();
    }
  // holes
  for (const o of m.holes) {
    const cx = o.x + 0.5, cy = o.y + 0.5;
    c.fillStyle = '#c9a874';
    c.beginPath();
    c.arc(cx, cy, 0.42, 0, TAU);
    c.fill();
    const g = c.createRadialGradient(cx + 0.06, cy + 0.08, 0.02, cx, cy, 0.36);
    g.addColorStop(0, '#120c08');
    g.addColorStop(0.7, '#2e2016');
    g.addColorStop(1, '#5a4029');
    c.fillStyle = g;
    c.beginPath();
    c.arc(cx, cy, 0.36, 0, TAU);
    c.fill();
  }
  // hedges: a shadow on the path, the bush, a lighter top, leaves
  blob(c, W, H, isHedge, 0.0, 0.3, 0.07, 0.07);
  c.fillStyle = 'rgba(70,50,20,0.22)';
  c.fill();
  blob(c, W, H, isHedge, 0.0, 0.3);
  c.fillStyle = '#2f8a3a';
  c.fill();
  blob(c, W, H, isHedge, 0.07, 0.26, -0.03, -0.04);
  c.fillStyle = '#48a944';
  c.fill();
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!isHedge(x, y)) continue;
      for (let k = 0; k < 5; k++) {
        const h = hash(x * 3 + k * 17, y * 5 + k);
        const lx = x + 0.15 + hash(y + k, x) * 0.7, ly = y + 0.15 + hash(x + k * 2, y + 1) * 0.65;
        c.fillStyle = h < 0.5 ? '#5cbd52' : '#3c9a3d';
        c.beginPath();
        c.ellipse(lx, ly, 0.1 + h * 0.05, 0.06, h * 6, 0, TAU);
        c.fill();
      }
      if (hash(x + 11, y + 4) < 0.12) {
        // now and then a tiny flower in the hedge
        const fx = x + 0.3 + hash(x, y + 5) * 0.4, fy = y + 0.3 + hash(x + 5, y) * 0.4;
        c.fillStyle = '#fff';
        for (let p = 0; p < 5; p++) {
          c.beginPath();
          c.arc(fx + Math.cos((p * TAU) / 5) * 0.06, fy + Math.sin((p * TAU) / 5) * 0.06, 0.05, 0, TAU);
          c.fill();
        }
        c.fillStyle = '#ffd43b';
        c.beginPath();
        c.arc(fx, fy, 0.04, 0, TAU);
        c.fill();
      }
    }
}

// ---------- things that move or change ----------

// where the spots sit on her shell (facing +x), in the order they come back: the middle one, then by pairs
export const SPOTS = [
  [0.15, 0],
  [0.1, -0.15],
  [0.1, 0.15],
  [-0.06, -0.17],
  [-0.06, 0.17],
  [-0.17, -0.07],
  [-0.17, 0.07],
];

// the ladybug, facing +x. walk = a leg phase, pop = 0..1 the newest spot just landed
export function ladybug(c, spots, walk = 0, pop = 0) {
  c.strokeStyle = '#2a2230';
  c.lineCap = 'round';
  c.lineWidth = 0.04;
  for (const side of [-1, 1])
    for (let k = 0; k < 3; k++) {
      const bx = 0.11 - k * 0.11;
      const sw = Math.sin(walk + k * 2.1 + (side > 0 ? Math.PI : 0)) * 0.05;
      c.beginPath();
      c.moveTo(bx, side * 0.2);
      c.lineTo(bx + sw + (1 - k) * 0.05, side * 0.35);
      c.stroke();
    }
  // antennae and head
  c.lineWidth = 0.025;
  for (const side of [-1, 1]) {
    c.beginPath();
    c.moveTo(0.32, side * 0.05);
    c.quadraticCurveTo(0.42, side * 0.07, 0.44, side * 0.15);
    c.stroke();
    c.fillStyle = '#2a2230';
    c.beginPath();
    c.arc(0.44, side * 0.15, 0.025, 0, TAU);
    c.fill();
  }
  c.fillStyle = '#2a2230';
  c.beginPath();
  c.arc(0.23, 0, 0.13, 0, TAU);
  c.fill();
  c.fillStyle = '#fff';
  for (const side of [-1, 1]) {
    c.beginPath();
    c.arc(0.31, side * 0.065, 0.032, 0, TAU);
    c.fill();
  }
  // the shell
  const g = c.createRadialGradient(-0.06, -0.1, 0.02, 0, 0, 0.3);
  g.addColorStop(0, '#ff7a6b');
  g.addColorStop(0.75, '#ea2e2e');
  g.addColorStop(1, '#c41c24');
  c.fillStyle = g;
  c.beginPath();
  c.arc(0, 0, 0.28, 0, TAU);
  c.fill();
  c.strokeStyle = '#2a2230';
  c.lineWidth = 0.025;
  c.beginPath();
  c.moveTo(0.26, 0);
  c.lineTo(-0.28, 0);
  c.stroke();
  c.fillStyle = '#2a2230';
  for (let i = 0; i < spots; i++) {
    const r = 0.055 * (i === spots - 1 && pop > 0 ? 1 + Math.sin(pop * Math.PI) * 0.8 : 1);
    c.beginPath();
    c.arc(SPOTS[i][0], SPOTS[i][1], r, 0, TAU);
    c.fill();
  }
  c.fillStyle = 'rgba(255,255,255,0.45)';
  c.beginPath();
  c.ellipse(-0.04, -0.15, 0.1, 0.045, -0.3, 0, TAU);
  c.fill();
}

// a lost spot lying on the path, gently glowing
export function spot(c, t) {
  const k = (Math.sin(t * 3) + 1) / 2;
  c.strokeStyle = `rgba(255,255,255,${0.5 + k * 0.4})`;
  c.lineWidth = 0.05;
  c.beginPath();
  c.arc(0, 0, 0.17 + k * 0.05, 0, TAU);
  c.stroke();
  c.fillStyle = 'rgba(60,40,20,0.2)';
  c.beginPath();
  c.ellipse(0.03, 0.04, 0.12, 0.1, 0, 0, TAU);
  c.fill();
  c.fillStyle = '#2a2230';
  c.beginPath();
  c.arc(0, 0, 0.12, 0, TAU);
  c.fill();
  c.fillStyle = 'rgba(255,255,255,0.7)';
  c.beginPath();
  c.arc(-0.04, -0.04, 0.035, 0, TAU);
  c.fill();
}

// a mushroom from above; squash 0..1 right after a bounce
export function mushroom(c, squash = 0) {
  const s = 1 + Math.sin(squash * Math.PI) * 0.18;
  c.fillStyle = 'rgba(60,40,20,0.25)';
  c.beginPath();
  c.arc(0.05, 0.06, 0.34, 0, TAU);
  c.fill();
  c.scale(s, s);
  const g = c.createRadialGradient(-0.08, -0.1, 0.03, 0, 0, 0.33);
  g.addColorStop(0, '#ff8a6a');
  g.addColorStop(1, '#d9342b');
  c.fillStyle = g;
  c.beginPath();
  c.arc(0, 0, 0.33, 0, TAU);
  c.fill();
  c.fillStyle = '#fff6ea';
  for (const [x, y, r] of [[0, 0, 0.08], [0.18, -0.1, 0.055], [-0.15, 0.15, 0.06], [-0.17, -0.12, 0.05], [0.13, 0.18, 0.05], [0.24, 0.06, 0.035]]) {
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.fill();
  }
}

function petals(c, n, len, wid, color, rot = 0) {
  c.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const a = rot + (i * TAU) / n;
    c.beginPath();
    c.ellipse(Math.cos(a) * len, Math.sin(a) * len, len, wid, a, 0, TAU);
    c.fill();
  }
}

// a flower button: pressed, its petals fold in
export function button(c, id, down, t) {
  const k = down ? 0.75 : 1 + Math.sin(t * 4) * 0.04;
  c.fillStyle = 'rgba(60,40,20,0.2)';
  c.beginPath();
  c.arc(0.04, 0.05, 0.36 * k, 0, TAU);
  c.fill();
  petals(c, 6, 0.19 * k, 0.11 * k, PAIR[id]);
  petals(c, 6, 0.13 * k, 0.07 * k, 'rgba(255,255,255,0.35)', 0.1);
  c.fillStyle = down ? '#d9a514' : '#ffd43b';
  c.beginPath();
  c.arc(0, 0, 0.11 * k, 0, TAU);
  c.fill();
  if (!down) {
    c.fillStyle = 'rgba(255,255,255,0.7)';
    c.beginPath();
    c.arc(-0.03, -0.03, 0.035, 0, TAU);
    c.fill();
  }
}

// a wooden gate filling its cell; open = 0..1 as it sinks into the ground
export function gate(c, id, open) {
  if (open >= 1) {
    c.fillStyle = 'rgba(120,80,40,0.18)';
    c.fillRect(-0.42, -0.42, 0.84, 0.84);
    return;
  }
  const s = 1 - open;
  c.globalAlpha = s;
  c.fillStyle = 'rgba(60,40,20,0.25)';
  c.beginPath();
  c.roundRect(-0.43 + 0.06, -0.43 + 0.06, 0.86, 0.86, 0.12);
  c.fill();
  c.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s);
  c.fillStyle = '#b97a3f';
  c.beginPath();
  c.roundRect(-0.45, -0.45, 0.9, 0.9, 0.12);
  c.fill();
  c.strokeStyle = '#8a5525';
  c.lineWidth = 0.04;
  for (const x of [-0.15, 0.15]) {
    c.beginPath();
    c.moveTo(x, -0.42);
    c.lineTo(x, 0.42);
    c.stroke();
  }
  c.fillStyle = '#d29a5c';
  for (const x of [-0.3, 0, 0.3]) {
    c.beginPath();
    c.roundRect(x - 0.11, -0.4, 0.22, 0.1, 0.04);
    c.fill();
  }
  c.fillStyle = '#fff';
  c.beginPath();
  c.arc(0, 0.04, 0.17, 0, TAU);
  c.fill();
  petals(c, 6, 0.08, 0.05, PAIR[id]);
  c.fillStyle = '#ffd43b';
  c.beginPath();
  c.arc(0, 0, 0.05, 0, TAU);
  c.fill();
  c.globalAlpha = 1;
}

// the home flower: a closed bud until every spot is found, then it opens (bloom 0..1)
export function flower(c, bloom, t) {
  c.rotate(Math.sin(t * 1.5) * 0.06);
  c.fillStyle = 'rgba(60,40,20,0.2)';
  c.beginPath();
  c.arc(0.05, 0.06, 0.2 + bloom * 0.24, 0, TAU);
  c.fill();
  // leaves
  c.fillStyle = '#4caf50';
  for (const a of [0.6, 2.4, 4.3]) {
    c.beginPath();
    c.ellipse(Math.cos(a) * 0.28, Math.sin(a) * 0.28, 0.16, 0.08, a, 0, TAU);
    c.fill();
  }
  if (bloom <= 0) {
    // the bud: green sepals round a pink tip
    petals(c, 5, 0.13, 0.08, '#3d9a3f', t * 0.2);
    c.fillStyle = '#ff8fc0';
    c.beginPath();
    c.arc(0, 0, 0.1, 0, TAU);
    c.fill();
    c.fillStyle = '#ffc2dc';
    c.beginPath();
    c.arc(-0.03, -0.03, 0.04, 0, TAU);
    c.fill();
    return;
  }
  const k = bloom;
  petals(c, 8, 0.22 * k, 0.13 * k, '#ff7eb6', 0.2);
  petals(c, 8, 0.16 * k, 0.09 * k, '#ffb3d6', 0.6);
  c.fillStyle = '#ffd43b';
  c.beginPath();
  c.arc(0, 0, 0.13 * Math.max(0.6, k), 0, TAU);
  c.fill();
  c.fillStyle = '#f2a40c';
  for (let i = 0; i < 7; i++) {
    const a = (i * TAU) / 7;
    c.beginPath();
    c.arc(Math.cos(a) * 0.07, Math.sin(a) * 0.07, 0.018, 0, TAU);
    c.fill();
  }
}

// ---------- SVG: the title and win pictures ----------
function svgBug(spots) {
  const spotEls = SPOTS.slice(0, spots)
    .map(([x, y]) => `<circle cx="${(-y * 100).toFixed(1)}" cy="${(-x * 100).toFixed(1)}" r="5.5" fill="#2a2230"/>`)
    .join('');
  const legs = [-1, 1]
    .flatMap((s) => [0, 1, 2].map((k) => `<path class="leg${k}" d="M${s * 20} ${-11 + k * 11} l${s * 15} ${-5 + k * 5}"/>`))
    .join('');
  return `<g stroke="#2a2230" stroke-width="4" stroke-linecap="round" fill="none">${legs}
      <path d="M-5 -32 q-2 -10 -15 -12 M5 -32 q2 -10 15 -12" stroke-width="2.5"/></g>
    <circle cx="-20" cy="-44" r="2.6" fill="#2a2230"/><circle cx="20" cy="-44" r="2.6" fill="#2a2230"/>
    <circle cy="-23" r="13" fill="#2a2230"/>
    <circle cx="-6.5" cy="-31" r="3.2" fill="#fff"/><circle cx="6.5" cy="-31" r="3.2" fill="#fff"/>
    <circle r="28" fill="url(#shell)"/>
    <path d="M0 -26 V28" stroke="#2a2230" stroke-width="2.5"/>${spotEls}
    <ellipse cx="-14" cy="-6" rx="10" ry="4.5" transform="rotate(-70 -14 -6)" fill="#fff" opacity=".45"/>`;
}
const DEFS = `<defs><radialGradient id="shell" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#ff7a6b"/>
  <stop offset=".75" stop-color="#ea2e2e"/><stop offset="1" stop-color="#c41c24"/></radialGradient></defs>`;

// the title: the ladybug on a leaf
export function heroSvg() {
  return `<svg viewBox="-110 -80 220 160" xmlns="http://www.w3.org/2000/svg">${DEFS}
    <path d="M-100 40 Q-60 -70 60 -60 Q105 -55 100 0 Q80 70 -100 40Z" fill="#6cc04a"/>
    <path d="M-100 40 Q-10 -10 95 -30" stroke="#4e9e36" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M-40 14 l-6 -26 M0 -3 l-2 -30 M40 -18 l4 -24 M-20 5 l14 18 M22 -10 l18 14" stroke="#4e9e36" stroke-width="3" stroke-linecap="round"/>
    <g class="bug" transform="translate(0 -6) rotate(30)">${svgBug(7)}</g></svg>`;
}

// the win: the ladybug home on her open flower
export function homeSvg(spots) {
  const p = (n, len, rx, ry, fill, rot) =>
    Array.from({ length: n }, (_, i) => {
      const a = rot + (i * 360) / n;
      return `<ellipse cx="${len}" rx="${rx}" ry="${ry}" fill="${fill}" transform="rotate(${a})"/>`;
    }).join('');
  return `<svg viewBox="-110 -110 220 220" xmlns="http://www.w3.org/2000/svg">${DEFS}
    <g class="petals">${p(8, 60, 46, 27, '#ff7eb6', 10)}${p(8, 44, 32, 18, '#ffb3d6', 32)}</g>
    <circle r="34" fill="#ffd43b"/>
    <g class="bug" transform="translate(0 6) scale(1.25)">${svgBug(spots)}</g></svg>`;
}
