// All the drawings. Canvas ones take a 2D context already moved to the thing's spot (its foot, where it
// stands on the ground) and scaled to world units; the road runs up the screen, so "forward" is -y.
// The side-view car for the title, the win card and the icons is an SVG string.

export const CAR_COLORS = ['#ff5a5f', '#3d8bfd', '#ffc93c', '#ff7eb6', '#4cc38a'];
const OTHER_CARS = ['#9b8cf2', '#ff9f43', '#54c7ec', '#8d99ae'];
const INK = '#3b2e5a';

function rr(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
function ell(c, x, y, rx, ry, fill) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fillStyle = fill;
  c.fill();
}
function circ(c, x, y, r, fill) {
  ell(c, x, y, r, r, fill);
}
function shadow(c, rx, ry = rx * 0.35) {
  ell(c, 0, 0, rx, ry, 'rgba(40,30,60,0.18)');
}
function poly(c, pts, fill) {
  c.beginPath();
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fillStyle = fill;
  c.fill();
}
function starPath(c, r, ri = r * 0.48, n = 5) {
  c.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    const q = i % 2 ? ri : r;
    c.lineTo(Math.cos(a) * q, Math.sin(a) * q);
  }
  c.closePath();
}

// ---------- the cars, from above ----------
export function carTop(c, color, { brake = false, lights = false } = {}) {
  c.fillStyle = '#2d2a3a';
  for (const [x, y] of [[-37, -36], [37, -36], [-37, 38], [37, 38]]) {
    rr(c, x - 9, y - 15, 18, 30, 6);
    c.fill();
  }
  rr(c, -37, -63, 74, 126, 28);
  c.fillStyle = 'rgba(40,30,60,0.35)';
  c.fill();
  rr(c, -35, -62, 70, 122, 26);
  c.fillStyle = color;
  c.fill();
  // shine on the bonnet
  rr(c, -24, -55, 18, 26, 9);
  c.fillStyle = 'rgba(255,255,255,0.35)';
  c.fill();
  // windscreen, roof, back window
  poly(c, [[-27, -12], [27, -12], [22, -32], [-22, -32]], '#bfe9ff');
  poly(c, [[-14, -14], [-4, -14], [-12, -30], [-18, -30]], 'rgba(255,255,255,0.7)');
  rr(c, -25, -12, 50, 44, 12);
  c.fillStyle = color;
  c.fill();
  rr(c, -25, -12, 50, 44, 12);
  c.fillStyle = 'rgba(255,255,255,0.22)';
  c.fill();
  poly(c, [[-23, 34], [23, 34], [20, 46], [-20, 46]], '#a9dcf7');
  // lights
  ell(c, -21, -58, 8, 5, '#fff6b0');
  ell(c, 21, -58, 8, 5, '#fff6b0');
  ell(c, -23, 58, 7, 4, brake ? '#ff2d2d' : '#c9304a');
  ell(c, 23, 58, 7, 4, brake ? '#ff2d2d' : '#c9304a');
  if (lights) {
    ell(c, -21, -58, 12, 8, 'rgba(255,250,200,0.6)');
    ell(c, 21, -58, 12, 8, 'rgba(255,250,200,0.6)');
  }
}
export function otherCar(c, i) {
  carTop(c, OTHER_CARS[i % OTHER_CARS.length]);
}

// ---------- things on the road ----------
export function star(c, t, r = 30) {
  const bob = Math.sin(t * 4) * 5;
  shadow(c, 20, 7);
  c.save();
  c.translate(0, -26 + bob);
  c.scale(Math.cos(t * 2.4) * 0.25 + 0.95, 1);
  starPath(c, r + 5);
  c.fillStyle = '#e8a400';
  c.fill();
  starPath(c, r);
  c.fillStyle = '#ffd43b';
  c.fill();
  c.translate(-6, -6);
  starPath(c, r * 0.35);
  c.fillStyle = 'rgba(255,255,255,0.75)';
  c.fill();
  c.restore();
}

export function cone(c) {
  shadow(c, 26, 9);
  rr(c, -24, -8, 48, 12, 4);
  c.fillStyle = '#e8590c';
  c.fill();
  poly(c, [[-18, -2], [18, -2], [5, -52], [-5, -52]], '#ff7a1a');
  poly(c, [[-13, -20], [13, -20], [10, -32], [-10, -32]], '#fff');
}

export function rock(c, v = 0) {
  shadow(c, 44, 13);
  c.beginPath();
  c.moveTo(-42, 0);
  c.quadraticCurveTo(-46, -34, -14, -46);
  c.quadraticCurveTo(14, -58, 34, -34);
  c.quadraticCurveTo(50, -12, 40, 0);
  c.closePath();
  c.fillStyle = v % 2 ? '#9aa0ad' : '#a7a29a';
  c.fill();
  ell(c, -10, -32, 14, 8, 'rgba(255,255,255,0.35)');
  ell(c, 18, -10, 10, 5, 'rgba(0,0,0,0.08)');
}

export function snowman(c, small = false) {
  if (small) c.scale(0.7, 0.7);
  shadow(c, 36, 11);
  circ(c, 0, -26, 30, '#fff');
  circ(c, 0, -26, 30, 'rgba(160,190,230,0.15)');
  circ(c, 0, -70, 21, '#fff');
  circ(c, -7, -74, 3, INK);
  circ(c, 7, -74, 3, INK);
  poly(c, [[-2, -68], [3, -68], [18, -64]], '#ff8c1a');
  circ(c, 0, -36, 3, INK);
  circ(c, 0, -22, 3, INK);
  rr(c, -22, -54, 44, 8, 4);
  c.fillStyle = '#e03131';
  c.fill();
  rr(c, -15, -104, 30, 20, 3);
  c.fillStyle = INK;
  c.fill();
  rr(c, -21, -88, 42, 6, 3);
  c.fill();
}

export function puddle(c, t) {
  ell(c, 0, 0, 56, 30, '#5bb2e6');
  ell(c, 4, -2, 44, 21, '#7cc8f0');
  c.strokeStyle = 'rgba(255,255,255,0.7)';
  c.lineWidth = 3;
  const k = (t * 0.8) % 1;
  c.beginPath();
  c.ellipse(-8, 0, 10 + k * 26, 5 + k * 12, 0, 0, Math.PI * 2);
  c.globalAlpha = 1 - k;
  c.stroke();
  c.globalAlpha = 1;
}

export function ramp(c) {
  shadow(c, 66, 14);
  poly(c, [[-62, 0], [62, 0], [52, -90], [-52, -90]], '#c77b30');
  poly(c, [[-58, -4], [58, -4], [50, -84], [-50, -84]], '#ffb347');
  c.strokeStyle = '#fff';
  c.lineWidth = 9;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  for (const y of [-26, -56]) {
    c.beginPath();
    c.moveTo(-26, y + 12);
    c.lineTo(0, y - 8);
    c.lineTo(26, y + 12);
    c.stroke();
  }
  rr(c, -62, -6, 124, 10, 4);
  c.fillStyle = '#8a4f1d';
  c.fill();
}

// a duck walking across (dir 1 = to the right); ducklings are smaller
export function duck(c, t, dir = 1, size = 1) {
  c.scale(size * dir, size);
  const step = Math.sin(t * 14);
  shadow(c, 22, 7);
  ell(c, -6, -4 + step * 2, 4, 6, '#ff922b');
  ell(c, 6, -4 - step * 2, 4, 6, '#ff922b');
  ell(c, 0, -22, 24, 18, '#fff3a6');
  ell(c, -4, -22, 14, 10, '#ffe066');
  circ(c, 14, -44, 13, '#fff3a6');
  poly(c, [[24, -46], [36, -42], [24, -38]], '#ff922b');
  circ(c, 17, -47, 2.6, INK);
}

export function cow(c, t, dir = 1) {
  c.scale(dir, 1);
  const step = Math.sin(t * 7);
  shadow(c, 58, 14);
  c.fillStyle = '#5a4a3a';
  for (const [x, s] of [[-34, 1], [-18, -1], [22, 1], [36, -1]]) {
    rr(c, x - 5, -30 + s * step * 3, 10, 30, 4);
    c.fill();
  }
  rr(c, -50, -70, 96, 46, 22);
  c.fillStyle = '#fff';
  c.fill();
  ell(c, -24, -54, 14, 10, '#3b3030');
  ell(c, 14, -60, 11, 8, '#3b3030');
  ell(c, 26, -38, 8, 6, '#3b3030');
  c.strokeStyle = '#fff';
  c.lineWidth = 5;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(-48, -62);
  c.quadraticCurveTo(-62, -50 + step * 4, -58, -36);
  c.stroke();
  // head
  rr(c, 40, -92, 34, 38, 14);
  c.fillStyle = '#fff';
  c.fill();
  rr(c, 46, -66, 30, 18, 9);
  c.fillStyle = '#ffb3c1';
  c.fill();
  circ(c, 55, -58, 2.5, '#c2255c');
  circ(c, 67, -58, 2.5, '#c2255c');
  circ(c, 50, -80, 3, INK);
  circ(c, 66, -80, 3, INK);
  poly(c, [[42, -90], [36, -104], [48, -92]], '#f1e3c6');
  poly(c, [[70, -90], [78, -104], [66, -92]], '#f1e3c6');
}

// ---------- roadside things ----------
const D = {
  tree(c, v) {
    shadow(c, 40, 13);
    rr(c, -8, -46, 16, 46, 5);
    c.fillStyle = '#9c6b3f';
    c.fill();
    const g = ['#5cb85c', '#4caf50', '#69c46a', '#57b65a'][v];
    circ(c, 0, -80, 44, g);
    circ(c, -26, -62, 26, g);
    circ(c, 26, -64, 26, g);
    circ(c, -12, -94, 16, 'rgba(255,255,255,0.18)');
    if (v === 1) for (const [x, y] of [[-20, -70], [14, -96], [22, -60]]) circ(c, x, y, 6, '#ff6b6b');
  },
  pine(c, v) {
    shadow(c, 34, 11);
    rr(c, -7, -26, 14, 26, 4);
    c.fillStyle = '#8b5a33';
    c.fill();
    const g = v % 2 ? '#2f9e6e' : '#3aa876';
    for (const [y, w] of [[-20, 40], [-52, 32], [-82, 23]]) poly(c, [[-w, y], [w, y], [0, y - 48]], g);
  },
  snowPine(c, v) {
    D.pine(c, v);
    for (const [y, w] of [[-20, 40], [-52, 32], [-82, 23]]) poly(c, [[-w * 0.45, y - 26], [w * 0.45, y - 26], [0, y - 48]], '#fff');
  },
  bush(c, v) {
    shadow(c, 34, 10);
    const g = ['#6cc36a', '#5db35b', '#7acb6e', '#62b960'][v];
    circ(c, -16, -18, 20, g);
    circ(c, 16, -18, 20, g);
    circ(c, 0, -30, 22, g);
    if (v === 2) for (const [x, y] of [[-14, -26], [6, -38], [18, -20]]) circ(c, x, y, 4.5, '#fff');
  },
  snowBush(c, v) {
    D.bush(c, v);
    ell(c, 0, -44, 18, 8, '#fff');
    ell(c, -18, -32, 12, 6, '#fff');
  },
  flowers(c, v) {
    const col = ['#ff6b9a', '#ffd43b', '#b197fc', '#ff8787'][v];
    for (const [x, y] of [[-18, -4], [0, -12], [16, -2], [-6, 8], [22, 10]]) {
      c.strokeStyle = '#4caf50';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x, y - 12);
      c.stroke();
      for (let k = 0; k < 5; k++) circ(c, x + Math.cos(k * 1.26) * 5, y - 14 + Math.sin(k * 1.26) * 5, 4, col);
      circ(c, x, y - 14, 3, '#fff3bf');
    }
  },
  sunflower(c) {
    shadow(c, 16, 6);
    c.strokeStyle = '#40a040';
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(0, -66);
    c.stroke();
    ell(c, -12, -34, 12, 6, '#4caf50');
    for (let k = 0; k < 10; k++) circ(c, Math.cos(k * 0.63) * 15, -72 + Math.sin(k * 0.63) * 15, 8, '#ffc928');
    circ(c, 0, -72, 11, '#7a4b24');
  },
  house(c, v) {
    shadow(c, 92, 18);
    const wall = ['#ffe3b3', '#cfe8ff', '#ffd1dc', '#e6f5c9'][v];
    const roof = ['#e8590c', '#5c7cfa', '#d6336c', '#2f9e44'][v];
    rr(c, -70, -96, 140, 96, 6);
    c.fillStyle = wall;
    c.fill();
    poly(c, [[-86, -92], [86, -92], [50, -150], [-50, -150]], roof);
    rr(c, -14, -50, 28, 50, 5);
    c.fillStyle = '#9c6b3f';
    c.fill();
    for (const x of [-48, 30]) {
      rr(c, x, -70, 20, 20, 3);
      c.fillStyle = '#9bd3f5';
      c.fill();
    }
    rr(c, 30, -170, 18, 34, 3);
    c.fillStyle = '#a5523a';
    c.fill();
  },
  lamp(c, v, { night = false } = {}) {
    shadow(c, 14, 5);
    rr(c, -4, -110, 8, 110, 3);
    c.fillStyle = '#5c5f6e';
    c.fill();
    rr(c, -16, -120, 32, 14, 6);
    c.fill();
    ell(c, 0, -104, 11, 5, night ? '#fff7b0' : '#e9ecef');
  },
  palm(c, v) {
    shadow(c, 40, 12);
    c.strokeStyle = '#a97142';
    c.lineWidth = 12;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(0, 0);
    c.quadraticCurveTo(v % 2 ? 20 : -20, -60, v % 2 ? 6 : -6, -120);
    c.stroke();
    const top = v % 2 ? 6 : -6;
    for (let k = 0; k < 6; k++) {
      const a = -Math.PI / 2 + (k - 2.5) * 0.55;
      c.save();
      c.translate(top, -120);
      c.rotate(a + Math.PI / 2);
      ell(c, 0, -30, 11, 34, k % 2 ? '#3fb36b' : '#2f9e5a');
      c.restore();
    }
    circ(c, top - 6, -114, 7, '#8b5a33');
    circ(c, top + 7, -112, 7, '#8b5a33');
  },
  umbrella(c, v) {
    shadow(c, 46, 14);
    rr(c, -3, -70, 6, 70, 3);
    c.fillStyle = '#e9ecef';
    c.fill();
    const a = ['#ff6b6b', '#4dabf7', '#ffd43b', '#b197fc'][v];
    c.beginPath();
    c.moveTo(-54, -66);
    c.quadraticCurveTo(0, -122, 54, -66);
    c.closePath();
    c.fillStyle = a;
    c.fill();
    c.beginPath();
    c.moveTo(-18, -66);
    c.quadraticCurveTo(0, -118, 18, -66);
    c.closePath();
    c.fillStyle = '#fff';
    c.fill();
    rr(c, 14, -16, 50, 16, 5);
    c.fillStyle = ['#74c0fc', '#ffa8a8', '#8ce99a', '#ffe066'][v];
    c.fill();
  },
  shell(c, v) {
    c.fillStyle = ['#ffc9c9', '#ffe8cc', '#e5dbff', '#fff'][v];
    c.beginPath();
    c.moveTo(-14, 0);
    c.quadraticCurveTo(-16, -24, 0, -26);
    c.quadraticCurveTo(16, -24, 14, 0);
    c.closePath();
    c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.12)';
    c.lineWidth = 2;
    for (const x of [-7, 0, 7]) {
      c.beginPath();
      c.moveTo(x * 0.4, -2);
      c.lineTo(x, -22);
      c.stroke();
    }
  },
  hay(c) {
    shadow(c, 46, 14);
    rr(c, -44, -56, 88, 56, 24);
    c.fillStyle = '#f2c94c';
    c.fill();
    ell(c, 30, -28, 14, 26, '#e0b13a');
    ell(c, 30, -28, 7, 13, '#f2c94c');
    c.strokeStyle = '#c99a2e';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(-20, -56);
    c.lineTo(-20, 0);
    c.moveTo(4, -56);
    c.lineTo(4, 0);
    c.stroke();
  },
  fence(c) {
    c.fillStyle = '#c08a57';
    for (const x of [-48, -16, 16, 48]) {
      rr(c, x - 5, -48, 10, 48, 3);
      c.fill();
    }
    rr(c, -56, -40, 112, 8, 3);
    c.fill();
    rr(c, -56, -20, 112, 8, 3);
    c.fill();
  },
  snowman(c) {
    snowman(c, true);
  },
  cactus(c, v) {
    shadow(c, 26, 8);
    const g = v % 2 ? '#40a060' : '#4cb06c';
    rr(c, -13, -96, 26, 96, 13);
    c.fillStyle = g;
    c.fill();
    rr(c, -40, -70, 16, 40, 8);
    c.fill();
    rr(c, -40, -40, 34, 14, 7);
    c.fill();
    if (v > 1) {
      rr(c, 24, -84, 16, 36, 8);
      c.fill();
      rr(c, 6, -58, 34, 14, 7);
      c.fill();
    }
    if (v === 3) circ(c, 0, -98, 8, '#ff8cc6');
  },
  boulder(c, v) {
    c.scale(0.8, 0.8);
    rock(c, v);
  },
  mushroom(c, v) {
    shadow(c, 18, 6);
    rr(c, -7, -24, 14, 24, 5);
    c.fillStyle = '#fff4e0';
    c.fill();
    c.beginPath();
    c.ellipse(0, -24, 24, 18, 0, Math.PI, 0);
    c.fillStyle = '#e03131';
    c.fill();
    for (const [x, y] of [[-10, -32], [8, -36], [2, -28]]) circ(c, x, y, 3.5, '#fff');
  },
  cloud(c, v) {
    const k = 0.9 + v * 0.1;
    c.scale(k, k);
    ell(c, 0, -10, 80, 26, 'rgba(120,160,220,0.18)');
    for (const [x, y, r] of [[-44, -26, 30], [-10, -42, 40], [32, -30, 32], [56, -18, 22]]) circ(c, x, y, r, '#fff');
  },
  // a sign where a new landscape begins on the endless road (the emoji is drawn by decor())
  sign(c) {
    shadow(c, 30, 9);
    rr(c, -5, -120, 10, 120, 3);
    c.fillStyle = '#8b5a33';
    c.fill();
    rr(c, -52, -190, 104, 82, 18);
    c.fillStyle = '#fff';
    c.fill();
    c.lineWidth = 6;
    c.strokeStyle = '#ffc93c';
    c.stroke();
  },
  lollipop(c, v) {
    shadow(c, 18, 6);
    rr(c, -3, -80, 6, 80, 3);
    c.fillStyle = '#fff';
    c.fill();
    const a = ['#ff6b9a', '#74c0fc', '#ffd43b', '#b197fc'][v];
    circ(c, 0, -100, 28, a);
    c.strokeStyle = '#fff';
    c.lineWidth = 5;
    c.beginPath();
    for (let k = 0; k < 40; k++) {
      const ang = k * 0.45, q = k * 0.6;
      c.lineTo(Math.cos(ang) * q, -100 + Math.sin(ang) * q);
    }
    c.stroke();
  },
};
export function decor(c, it, opts) {
  c.scale(it.s, it.s);
  D[it.kind]?.(c, it.v, opts);
  if (it.emoji) {
    c.font = '56px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(it.emoji, 0, -147);
  }
}

// ---------- the finish arch and where the road goes ----------
export function finish(c, width) {
  const h = width / 2 + 30;
  for (const x of [-h, h]) {
    shadow(c, 18, 6);
    rr(c, x - 8, -190, 16, 190, 4);
    c.fillStyle = '#f1f3f5';
    c.fill();
  }
  rr(c, -h - 10, -210, 2 * h + 20, 54, 12);
  c.fillStyle = '#fff';
  c.fill();
  const n = Math.floor((2 * h) / 26);
  for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) if ((i + j) % 2) {
    c.fillStyle = INK;
    c.fillRect(-h + i * 26 + 4, -204 + j * 21, 26, 21);
  }
}

// the road surface across the finish: black and white squares
export function checkers(c, width) {
  const n = 12, w = width / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) {
    c.fillStyle = (i + j) % 2 ? '#fff' : INK;
    c.fillRect(-width / 2 + i * w, -j * w, w, w);
  }
}

const PLACE = {
  grandma(c) {
    D.house(c, 2);
    c.save();
    c.translate(0, -120);
    c.fillStyle = '#ff4d6d';
    c.beginPath();
    c.moveTo(0, 8);
    c.bezierCurveTo(-24, -8, -12, -26, 0, -14);
    c.bezierCurveTo(12, -26, 24, -8, 0, 8);
    c.fill();
    c.restore();
    for (const x of [-110, 110]) {
      c.save();
      c.translate(x, 0);
      D.flowers(c, x < 0 ? 0 : 1);
      c.restore();
    }
  },
  playground(c) {
    shadow(c, 140, 20);
    // slide
    rr(c, -120, -120, 12, 120, 4);
    c.fillStyle = '#5c7cfa';
    c.fill();
    rr(c, -70, -120, 12, 120, 4);
    c.fill();
    rr(c, -124, -124, 70, 14, 5);
    c.fillStyle = '#ff6b6b';
    c.fill();
    poly(c, [[-58, -120], [-40, -120], [20, -4], [2, -4]], '#ffd43b');
    // swing
    c.strokeStyle = '#2f9e44';
    c.lineWidth = 10;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(50, 0);
    c.lineTo(80, -130);
    c.lineTo(150, -130);
    c.lineTo(180, 0);
    c.stroke();
    c.strokeStyle = '#495057';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(100, -130);
    c.lineTo(100, -40);
    c.moveTo(130, -130);
    c.lineTo(130, -40);
    c.stroke();
    rr(c, 94, -42, 42, 9, 4);
    c.fillStyle = '#ff922b';
    c.fill();
  },
  shop(c) {
    shadow(c, 110, 18);
    rr(c, -96, -110, 192, 110, 6);
    c.fillStyle = '#fff4e6';
    c.fill();
    for (let i = 0; i < 8; i++) poly(c, [[-104 + i * 26, -110], [-78 + i * 26, -110], [-78 + i * 26, -86], [-104 + i * 26, -86]], i % 2 ? '#fff' : '#ff6b6b');
    rr(c, -24, -66, 48, 66, 4);
    c.fillStyle = '#9bd3f5';
    c.fill();
    rr(c, -84, -70, 46, 36, 4);
    c.fill();
    rr(c, 38, -70, 46, 36, 4);
    c.fill();
    circ(c, -62, -52, 9, '#ff922b');
    circ(c, 56, -52, 9, '#ff6b6b');
    circ(c, 70, -50, 8, '#ffd43b');
  },
  farm(c) {
    shadow(c, 120, 20);
    rr(c, -96, -120, 192, 120, 4);
    c.fillStyle = '#d9480f';
    c.fill();
    poly(c, [[-110, -116], [110, -116], [0, -186]], '#a61e4d');
    rr(c, -36, -84, 72, 84, 4);
    c.fillStyle = '#fff';
    c.fill();
    rr(c, -30, -78, 60, 78, 2);
    c.fillStyle = '#c92a2a';
    c.fill();
    c.strokeStyle = '#fff';
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(-30, -78);
    c.lineTo(30, 0);
    c.moveTo(30, -78);
    c.lineTo(-30, 0);
    c.stroke();
    circ(c, 0, -142, 16, '#fff');
    circ(c, 0, -142, 10, '#ffe8cc');
  },
  beach(c) {
    shadow(c, 100, 18);
    rr(c, -70, -110, 140, 110, 6);
    c.fillStyle = '#74c0fc';
    c.fill();
    for (let i = 0; i < 5; i++) {
      rr(c, -70 + i * 28, -110, 14, 110, 0);
      c.fillStyle = '#fff';
      c.fill();
    }
    poly(c, [[-86, -106], [86, -106], [0, -160]], '#ff6b6b');
    rr(c, -18, -56, 36, 56, 4);
    c.fillStyle = '#e8590c';
    c.fill();
    c.save();
    c.translate(120, 0);
    D.umbrella(c, 2);
    c.restore();
  },
  hut(c) {
    shadow(c, 110, 18);
    rr(c, -86, -100, 172, 100, 4);
    c.fillStyle = '#a0643a';
    c.fill();
    c.strokeStyle = '#7d4a26';
    c.lineWidth = 4;
    for (let y = -84; y < 0; y += 18) {
      c.beginPath();
      c.moveTo(-86, y);
      c.lineTo(86, y);
      c.stroke();
    }
    poly(c, [[-104, -96], [104, -96], [0, -170]], '#6b3f22');
    poly(c, [[-104, -96], [104, -96], [86, -112], [0, -170], [-86, -112]], '#fff');
    poly(c, [[-84, -110], [84, -110], [0, -160]], '#6b3f22');
    rr(c, -18, -60, 36, 60, 4);
    c.fillStyle = '#ffd43b';
    c.fill();
    rr(c, 36, -70, 28, 26, 3);
    c.fill();
  },
  icecream(c) {
    shadow(c, 90, 16);
    rr(c, -80, -80, 160, 80, 8);
    c.fillStyle = '#e599f7';
    c.fill();
    rr(c, -80, -96, 160, 22, 8);
    c.fillStyle = '#fff';
    c.fill();
    poly(c, [[-22, -96], [22, -96], [0, -150]], '#e8b06a');
    circ(c, 0, -178, 28, '#ffc9de');
    circ(c, -18, -160, 20, '#a5d8ff');
    circ(c, 18, -160, 20, '#fff3bf');
    circ(c, 0, -206, 8, '#e03131');
  },
  lighthouse(c) {
    shadow(c, 60, 14);
    poly(c, [[-42, 0], [42, 0], [26, -220], [-26, -220]], '#fff');
    for (const y of [-40, -120]) poly(c, [[-40 + (-y / 220) * 16, y], [40 - (-y / 220) * 16, y], [38 - ((-y + 40) / 220) * 16, y - 40], [-38 + ((-y + 40) / 220) * 16, y - 40]], '#e03131');
    rr(c, -34, -262, 68, 44, 6);
    c.fillStyle = '#ffe066';
    c.fill();
    poly(c, [[-40, -260], [40, -260], [0, -296]], '#e03131');
    rr(c, -14, -36, 28, 36, 4);
    c.fillStyle = '#5c7cfa';
    c.fill();
  },
  castle(c, t = 0) {
    shadow(c, 170, 24);
    const wall = '#ffd6e8', dark = '#f7a8c8';
    rr(c, -120, -150, 240, 150, 4);
    c.fillStyle = wall;
    c.fill();
    for (const x of [-170, 120]) {
      rr(c, x, -220, 50, 220, 4);
      c.fillStyle = dark;
      c.fill();
      poly(c, [[x - 10, -216], [x + 60, -216], [x + 25, -290]], '#b197fc');
      c.strokeStyle = '#7048e8';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(x + 25, -290);
      c.lineTo(x + 25, -320);
      c.stroke();
      poly(c, [[x + 25, -320], [x + 52, -312 + Math.sin(t * 6) * 3], [x + 25, -304]], '#ffd43b');
    }
    for (let i = 0; i < 6; i++) {
      rr(c, -120 + i * 44, -170, 26, 24, 2);
      c.fillStyle = wall;
      c.fill();
    }
    c.beginPath();
    c.moveTo(-36, 0);
    c.lineTo(-36, -60);
    c.arc(0, -60, 36, Math.PI, 0);
    c.lineTo(36, 0);
    c.fillStyle = '#9c6b3f';
    c.fill();
    for (const x of [-80, 60]) {
      rr(c, x, -116, 22, 32, 11);
      c.fillStyle = '#9bd3f5';
      c.fill();
    }
  },
};
export function place(c, kind, t) {
  c.scale(1.25, 1.25);
  PLACE[kind]?.(c, t);
}
export const PLACE_EMOJI = { grandma: '👵', playground: '🛝', shop: '🛒', farm: '🐄', beach: '🏖️', hut: '🏔️', icecream: '🍦', lighthouse: '🗼', castle: '🏰' };

// ---------- the side-view car (SVG) ----------
export function carSide(color, { wheels = 'wheel' } = {}) {
  const wheel = (x) => `<g transform="translate(${x} 128)"><g class="${wheels}">
    <circle r="27" fill="#2d2a3a"/><circle r="13" fill="#dee2e6"/>
    <rect x="-3" y="-13" width="6" height="26" rx="3" fill="#adb5bd"/><rect x="-13" y="-3" width="26" height="6" rx="3" fill="#adb5bd"/></g></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 170">
    <ellipse cx="150" cy="156" rx="125" ry="10" fill="rgba(40,30,60,.15)"/>
    <path d="M28 128 Q22 88 52 80 L92 74 Q112 34 156 32 L196 32 Q226 34 240 74 L262 80 Q284 86 280 128 Z" fill="${color}"/>
    <path d="M106 76 Q122 44 156 44 L170 44 L170 76 Z" fill="#bfe9ff"/>
    <path d="M182 44 L196 44 Q218 46 228 76 L182 76 Z" fill="#bfe9ff"/>
    <path d="M118 70 Q126 54 140 50 L146 50 L130 72 Z" fill="rgba(255,255,255,.75)"/>
    <circle cx="208" cy="62" r="12" fill="#ffd8b5"/><path d="M196 58 Q200 44 212 46 Q222 48 220 60 Q212 52 196 58Z" fill="#7a4b24"/>
    <circle cx="212" cy="62" r="1.8" fill="${INK}"/>
    <rect x="44" y="92" width="226" height="8" rx="4" fill="rgba(255,255,255,.35)"/>
    <ellipse cx="272" cy="100" rx="8" ry="10" fill="#fff6b0"/>
    <rect x="22" y="96" width="10" height="14" rx="4" fill="#c9304a"/>
    <rect x="136" y="84" width="20" height="5" rx="2.5" fill="rgba(0,0,0,.25)"/>
    ${wheel(80)}${wheel(226)}
  </svg>`;
}
