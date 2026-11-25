// The shapes, in grid units (1 unit = U px on the board). Every shape is centred on its bounding box
// and turns about that centre in quarter turns (r = 0, 90, 180, 270, clockwise on screen).
//   sq    box w × h (squares and rectangles)
//   tri   right triangle, legs w (along the bottom) and h (up the left side), right angle bottom-left
//   iso   isosceles triangle, base w along the bottom, apex up, h tall
//   circ  circle, diameter w (h = w)
//   semi  half circle, w wide, flat side down (h = w / 2)
//   trap  trapezoid, w wide at the top, sides sloping in at 45° (bottom is w - 2h)
export const U = 100;

const ARC = 24; // points per half circle (a multiple of 4, so circles look the same after a quarter turn)

// the corner points of a shape at r = 0, circles as many-sided polygons
function corners(k, w, h) {
  const a = w / 2, b = h / 2;
  switch (k) {
    case 'sq': return [[-a, -b], [a, -b], [a, b], [-a, b]];
    case 'tri': return [[-a, b], [a, b], [-a, -b]];
    case 'iso': return [[-a, b], [a, b], [0, -b]];
    case 'trap': return [[-a, -b], [a, -b], [a - h, b], [-a + h, b]];
    case 'circ': return Array.from({ length: ARC * 2 }, (_, i) => {
      const t = (i / (ARC * 2)) * Math.PI * 2;
      return [a * Math.cos(t), a * Math.sin(t)];
    });
    case 'semi': return Array.from({ length: ARC + 1 }, (_, i) => {
      const t = (i / ARC) * Math.PI;
      return [-a * Math.cos(t), b - a * Math.sin(t)];
    });
  }
  throw new Error(`unknown shape ${k}`);
}

export const dims = (p) => ({ w: p.w, h: p.k === 'circ' ? p.w : p.k === 'semi' ? p.w / 2 : p.h });

function turn([x, y], r) {
  switch (((r % 360) + 360) % 360) {
    case 90: return [-y, x];
    case 180: return [-x, -y];
    case 270: return [y, -x];
    default: return [x, y];
  }
}

// corner points of piece p turned by r, centred on 0,0 (grid units)
export function points(p, r = p.r) {
  const { w, h } = dims(p);
  return corners(p.k, w, h).map((q) => turn(q, r));
}

// the same outline gives the same key, so a square fits at any turn and a long box every half turn
export function shapeKey(p, r = p.r) {
  const fix = (v) => (Math.round(v * 1000) / 1000 || 0).toFixed(3);
  return points(p, r).map(([x, y]) => `${fix(x)},${fix(y)}`).sort().join(' ');
}

// how much one quarter turn is worth for this shape: 90 (looks the same after any turn),
// 180 (after a half turn) or 360 (only after a full turn)
export function period(p) {
  const k0 = shapeKey(p, 0);
  if (shapeKey(p, 90) === k0) return 90;
  if (shapeKey(p, 180) === k0) return 180;
  return 360;
}

// bounding box size after turning
export function box(p, r = p.r) {
  const pts = points(p, r);
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
  return { w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}

// SVG path for the unturned shape, in px around 0,0 (real arcs for the round ones)
export function pathD(p) {
  const { w, h } = dims(p);
  const a = (w / 2) * U, b = (h / 2) * U;
  if (p.k === 'circ') return `M${-a} 0A${a} ${a} 0 1 0 ${a} 0A${a} ${a} 0 1 0 ${-a} 0Z`;
  if (p.k === 'semi') return `M${-a} ${b}A${a} ${a} 0 0 1 ${a} ${b}Z`;
  return 'M' + corners(p.k, w, h).map(([x, y]) => `${+(x * U).toFixed(2)} ${+(y * U).toFixed(2)}`).join('L') + 'Z';
}

// is the point (grid units) inside piece p placed at its own x, y, r?
export function contains(p, px, py) {
  const pts = points(p).map(([x, y]) => [x + p.x, y + p.y]);
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
