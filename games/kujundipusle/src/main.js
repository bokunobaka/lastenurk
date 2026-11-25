// Kujundipusle: drag the shapes from the tray onto the shadow; a tap turns a shape.
// When every place is filled the picture comes alive. Screens: title (picture grid) -> play -> win.
import './style.css';
import * as A from './art.js';
import { U, shapeKey, box } from './shapes.js';
import { levels, rng, startTurn } from './levels.js';
import { t, lang, setLang, applyText } from './i18n.js';
import { sfx, unlock, isMuted, toggleMute } from './sound.js';

const $ = (id) => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
function tween(ms, f) {
  return new Promise((done) => {
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / ms);
      f(k);
      if (k < 1) requestAnimationFrame(step);
      else done();
    };
    requestAnimationFrame(step);
  });
}

// ---------- saved progress: which pictures are finished ----------
const SAVE = 'kujundipusle.done';
let done = {};
try {
  done = JSON.parse(localStorage.getItem(SAVE)) || {};
} catch {}
function saveDone(i) {
  done[i] = 1;
  try {
    localStorage.setItem(SAVE, JSON.stringify(done));
  } catch {}
}
// the first picture not yet finished (every picture up to it is open)
function frontier() {
  let i = 0;
  while (i < levels.length - 1 && done[i]) i++;
  return i;
}

// ---------- state ----------
const CELL = 1.6; // tray cell, grid units
const GAP = 0.45; // between the board and the tray
let lv = null;
let pieces = []; // { ...level piece, cx, cy, ang, scale, home, where: 'tray' | 'board' | 'placed', el, badge }
let filled = []; // per place: the piece in it
let tray = null; // { x, y, w, h }
let won = false;
let fails = 0;
let guided = false; // the first picture shows the hand again and again
let drag = null;
let hintRun = 0;
let guideTimer = 0;

const board = $('board');
const playEl = $('play');

// ---------- title screen ----------
function showTitle() {
  stopHint();
  playEl.hidden = true;
  $('win').hidden = true;
  $('title').hidden = false;
  renderGrid();
}

function renderGrid() {
  const grid = $('levelGrid');
  grid.innerHTML = '';
  const open = frontier();
  levels.forEach((l, i) => {
    const b = document.createElement('button');
    b.className = 'lvl';
    const fin = !!done[i];
    if (fin) b.classList.add('done');
    else if (i === open) b.classList.add('next');
    b.disabled = i > open;
    b.innerHTML = A.svg(A.picture(l, { done: fin }), A.viewBox(l, 0.15)) + `<small>${i + 1}</small>` + (b.disabled ? '<span class="lock">🔒</span>' : '');
    b.setAttribute('aria-label', t('ui.level', { n: i + 1 }));
    b.onclick = () => startLevel(i);
    grid.append(b);
  });
}

const heroLv = levels.find((l) => l.id === 'rocket');
$('hero').innerHTML = A.svg(`<g class="alive fly">${A.picture(heroLv)}</g>`, A.viewBox(heroLv));

// ---------- play screen ----------
function startLevel(i) {
  stopHint();
  clearTimeout(guideTimer);
  lv = levels[i];
  won = false;
  fails = 0;
  drag = null;
  guided = i === 0;
  $('title').hidden = true;
  $('win').hidden = true;
  playEl.hidden = false;
  playEl.classList.remove('locked');
  $('badge').textContent = i + 1;
  clearTimeout(toastTimer);
  $('tip').classList.remove('say');
  $('tip').textContent = t(lv.tip || 'tip.go');
  $('hintBtn').classList.remove('glow');

  const rand = rng(lv.index * 101 + 7);
  const all = [...lv.pieces, ...lv.extra];
  const order = all.map((p) => ({ p, k: rand() })).sort((a, b) => a.k - b.k).map((o) => o.p);
  pieces = order.map((p) => ({ ...p, ang: startTurn(lv, p), scale: 1, where: 'tray', el: null, badge: null }));
  filled = lv.pieces.map(() => null);

  board.innerHTML = `<g id="frame"></g><g id="shadow">${A.shadow(lv.pieces, lv.outline)}</g><g id="hintG"></g>
    <g id="pic"></g><g id="loose"></g><g id="badges"></g><g id="fx"></g>`;
  for (const pc of pieces) {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'piece');
    // an invisible circle under it, so thin pieces are easy to grab with a small finger
    g.innerHTML = `<circle class="hit" fill="transparent"/>${A.pieceSvg(pc)}`;
    g.addEventListener('pointerdown', (e) => onDown(e, pc));
    pc.el = g;
    $('loose').append(g);
  }
  layout();
  if (lv.tip === 'tip.turn') pieces.forEach((pc) => !fitsSomewhere(pc) && showBadge(pc));
  if (guided) guide(1500);
}

// Places the board and the tray (below or to the right, whichever lets everything be biggest)
// and sets the viewBox. Pieces in the tray move to their new spots.
function layout() {
  if (!lv) return;
  const r = $('boardWrap').getBoundingClientRect();
  const n = pieces.length;
  const pad = 0.3;
  let best = null;
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    const tw = cols * CELL, th = rows * CELL;
    for (const below of [true, false]) {
      const t = below ? { x: (lv.W - tw) / 2, y: lv.H + GAP, w: tw, h: th, cols } : { x: lv.W + GAP, y: (lv.H - th) / 2, w: tw, h: th, cols };
      const x0 = Math.min(0, t.x), y0 = Math.min(0, t.y);
      const x1 = Math.max(lv.W, t.x + tw), y1 = Math.max(lv.H, t.y + th);
      const s = Math.min(r.width / (x1 - x0 + pad * 2), r.height / (y1 - y0 + pad * 2));
      if (!best || s > best.s * 1.02) best = { s, t, vb: [x0 - pad, y0 - pad, x1 - x0 + pad * 2, y1 - y0 + pad * 2] };
    }
  }
  tray = best.t;
  board.setAttribute('viewBox', best.vb.map((v) => v * U).join(' '));
  $('frame').innerHTML = `<rect x="${-0.15 * U}" y="${-0.15 * U}" width="${(lv.W + 0.3) * U}" height="${(lv.H + 0.3) * U}" rx="36" fill="#fff" opacity=".45"/>
    <rect class="trayBg" x="${(tray.x - 0.1) * U}" y="${(tray.y - 0.1) * U}" width="${(tray.w + 0.2) * U}" height="${(tray.h + 0.2) * U}" rx="36"/>`;
  pieces.forEach((pc, j) => {
    const c = j % tray.cols, row = Math.floor(j / tray.cols);
    // the last row is centred
    const inRow = Math.min(tray.cols, pieces.length - row * tray.cols);
    pc.home = { x: tray.x + (c + 0.5 + (tray.cols - inRow) / 2) * CELL, y: tray.y + (row + 0.5) * CELL };
    if (pc.where === 'tray' && pc !== drag?.pc) {
      pc.cx = pc.home.x;
      pc.cy = pc.home.y;
      pc.scale = trayScale(pc);
      render(pc);
    }
  });
}

const maxDim = (pc) => Math.max(box(pc, 0).w, box(pc, 0).h);
const trayScale = (pc) => Math.min(1, (CELL - 0.3) / maxDim(pc));

function render(pc) {
  pc.el.setAttribute('transform', `translate(${pc.cx * U} ${pc.cy * U}) rotate(${pc.ang}) scale(${pc.scale})`);
  pc.el.firstChild.setAttribute('r', (0.55 * U) / pc.scale);
  if (pc.badge) placeBadge(pc);
}

// ---------- which place fits ----------
const turnOf = (pc) => ((Math.round(pc.ang / 90) * 90) % 360 + 360) % 360;
const sameShape = (a, b) => [0, 90, 180, 270].some((r) => shapeKey(a, r) === shapeKey(b, b.r));
const fitsHere = (pc, slot) => shapeKey(pc, turnOf(pc)) === shapeKey(slot, slot.r);
const fitsSomewhere = (pc) => lv.pieces.some((s, i) => !filled[i] && fitsHere(pc, s));

// the nearest free place of this shape; fit: one that takes the piece as it is turned now
function nearest(pc) {
  let any = null, fit = null;
  lv.pieces.forEach((s, i) => {
    if (filled[i] || !sameShape(pc, s)) return;
    const d = Math.hypot(pc.cx - s.x, pc.cy - s.y);
    if (!any || d < any.d) any = { s, i, d };
    if (fitsHere(pc, s) && (!fit || d < fit.d)) fit = { s, i, d };
  });
  return { any, fit };
}
const reach = (pc) => Math.max(0.5, 0.45 * maxDim(pc));

// ---------- dragging and tapping ----------
function svgPoint(e) {
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(board.getScreenCTM().inverse());
  return { x: p.x / U, y: p.y / U };
}

function onDown(e, pc) {
  unlock();
  if (won || drag || pc.where === 'placed' || pc.busy) return;
  e.preventDefault();
  stopHint();
  clearTimeout(guideTimer);
  pc.el.setPointerCapture(e.pointerId);
  const pt = svgPoint(e);
  drag = { pc, id: e.pointerId, sx: e.clientX, sy: e.clientY, dx: pt.x - pc.cx, dy: pt.y - pc.cy, moved: false };
  $('loose').append(pc.el); // on top of the others
}

function onMove(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const { pc } = drag;
  if (!drag.moved) {
    if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 8) return;
    drag.moved = true;
    pc.el.classList.add('lift');
    hideBadge(pc);
    sfx.pick();
    // grow from tray size to full size, keeping the same spot of the piece under the finger
    const s0 = pc.scale;
    if (s0 !== 1) {
      const dx = drag.dx, dy = drag.dy;
      tween(120, (k) => {
        pc.scale = s0 + (1 - s0) * k;
        drag && ((drag.dx = (dx * pc.scale) / s0), (drag.dy = (dy * pc.scale) / s0));
      });
    }
  }
  const pt = svgPoint(e);
  const vb = board.viewBox.baseVal;
  pc.cx = Math.max(vb.x / U, Math.min((vb.x + vb.width) / U, pt.x - drag.dx));
  pc.cy = Math.max(vb.y / U, Math.min((vb.y + vb.height) / U, pt.y - drag.dy));
  render(pc);
}

function onUp(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const { pc, moved } = drag;
  drag = null;
  pc.el.classList.remove('lift');
  if (moved) drop(pc);
  else tap(pc);
}

function inTray(pc) {
  return pc.cx > tray.x - 0.2 && pc.cx < tray.x + tray.w + 0.2 && pc.cy > tray.y - 0.2 && pc.cy < tray.y + tray.h + 0.2;
}
const onBoard = (pc) => pc.cx > -0.3 && pc.cx < lv.W + 0.3 && pc.cy > -0.3 && pc.cy < lv.H + 0.3;

function drop(pc) {
  if (inTray(pc) || !onBoard(pc)) {
    sendHome(pc);
    sfx.back();
    return;
  }
  if (pc.extra) {
    sfx.nope();
    toast(t('oops.extra'));
    shake(pc);
    sendHome(pc, 400);
    return;
  }
  const { any, fit } = nearest(pc);
  if (fit && fit.d < reach(pc)) return snap(pc, fit);
  if (any && any.d < reach(pc) * 1.6 && lv.rotate) {
    // right place, wrong turn: it waits there with a turn sign
    pc.where = 'board';
    showBadge(pc);
    sfx.nope();
    toast(t('oops.turn'));
    miss();
    return;
  }
  sfx.back();
  toast(t('oops.nope'));
  sendHome(pc);
  miss();
}

function tap(pc) {
  if (!lv.rotate) {
    sfx.wiggle();
    shake(pc);
    if (guided) guide(600);
    return;
  }
  turn(pc);
}

async function turn(pc) {
  pc.busy = true;
  sfx.turn();
  hideBadge(pc);
  const a0 = pc.ang, s0 = pc.scale;
  await tween(220, (k) => {
    pc.ang = a0 + 90 * ease(k);
    pc.scale = s0 * (1 + Math.sin(k * Math.PI) * 0.08);
    render(pc);
  });
  pc.ang = a0 + 90;
  pc.scale = s0;
  render(pc);
  pc.busy = false;
  if (pc.where === 'board') {
    const { fit, any } = nearest(pc);
    if (fit && fit.d < reach(pc) * 1.6) return snap(pc, fit);
    if (any && any.d < reach(pc) * 1.6) showBadge(pc);
  }
}

async function sendHome(pc, delay = 0) {
  pc.where = 'tray';
  hideBadge(pc);
  if (delay) await wait(delay);
  const from = { x: pc.cx, y: pc.cy, s: pc.scale };
  const to = { s: trayScale(pc) };
  pc.busy = true;
  await tween(260, (k) => {
    const e = ease(k);
    pc.cx = from.x + (pc.home.x - from.x) * e;
    pc.cy = from.y + (pc.home.y - from.y) * e;
    pc.scale = from.s + (to.s - from.s) * e;
    render(pc);
  });
  pc.busy = false;
}

async function snap(pc, { s, i }) {
  pc.where = 'placed';
  pc.slot = i;
  filled[i] = pc;
  hideBadge(pc);
  pc.el.classList.add('placed');
  $('pic').append(pc.el);
  const count = filled.filter(Boolean).length;
  sfx.snap(count - 1);
  const from = { x: pc.cx, y: pc.cy, s: pc.scale };
  await tween(150, (k) => {
    pc.cx = from.x + (s.x - from.x) * k;
    pc.cy = from.y + (s.y - from.y) * k;
    pc.scale = from.s + (1 - from.s) * k;
    render(pc);
  });
  sparkle(s.x * U, s.y * U, A.COLORS[pc.c]);
  await tween(200, (k) => {
    pc.scale = 1 + Math.sin(k * Math.PI) * 0.07;
    render(pc);
  });
  if (filled.every(Boolean)) win();
  else if (guided) guide(900);
}

function miss() {
  fails++;
  if (fails >= 3) $('hintBtn').classList.add('glow');
}

// ---------- the turn sign ----------
function showBadge(pc) {
  if (pc.badge) return;
  const g = document.createElementNS(NS, 'g');
  g.innerHTML = A.turnBadge();
  $('badges').append(g);
  pc.badge = g;
  placeBadge(pc);
}
function placeBadge(pc) {
  const b = box(pc, turnOf(pc));
  const x = pc.cx + (b.w / 2) * pc.scale, y = pc.cy - (b.h / 2) * pc.scale;
  pc.badge.setAttribute('transform', `translate(${x * U} ${y * U})`);
}
function hideBadge(pc) {
  pc.badge?.remove();
  pc.badge = null;
}

// ---------- finished ----------
async function win() {
  won = true;
  stopHint();
  clearTimeout(guideTimer);
  playEl.classList.add('locked');
  saveDone(lv.index);
  sfx.win();
  confetti();
  const pic = $('pic');
  // the picture comes alive: shadow and tray fade, details appear, the whole thing moves
  for (const el of [$('shadow'), $('loose'), $('badges'), board.querySelector('.trayBg')])
    tween(400, (k) => el.setAttribute('opacity', 1 - k));
  if (lv.spin) {
    const sp = document.createElementNS(NS, 'g');
    sp.setAttribute('class', 'spinner');
    sp.style.transformOrigin = `${lv.spin.x * U}px ${lv.spin.y * U}px`;
    for (const i of lv.spin.parts) sp.append(filled[i].el);
    pic.prepend(sp);
  }
  const det = document.createElementNS(NS, 'g');
  det.setAttribute('class', 'details');
  det.innerHTML = A.detailsOf(lv);
  pic.append(det);
  pic.setAttribute('class', `alive ${lv.anim}`);
  const i = lv.index;
  await wait(2600);
  if (lv?.index !== i || !won) return;
  const last = i === levels.length - 1;
  $('winPic').innerHTML = A.svg(`<g class="alive ${lv.anim}">${A.picture(lv)}</g>`, A.viewBox(lv));
  $('winTitle').textContent = last ? t('win.final') : t(`pic.${lv.id}`);
  $('nextBtn').onclick = () => (last ? showTitle() : startLevel(i + 1));
  $('againBtn').onclick = () => startLevel(i);
  $('win').hidden = false;
}

// ---------- hints ----------
// Turn a piece that is the wrong way, else show a hand dragging the next piece to its place.
function hintTarget() {
  const loose = pieces.filter((pc) => pc.where === 'board' && !pc.extra);
  const cands = [...loose, ...pieces.filter((pc) => pc.where === 'tray' && !pc.extra)];
  for (const pc of cands) {
    const { any, fit } = nearest(pc);
    if (fit) return { pc, to: fit.s };
    if (any) return { pc, turn: true };
  }
  return null;
}

function stopHint() {
  hintRun++;
  $('hand').hidden = true;
  const hg = $('hintG');
  if (hg) hg.innerHTML = '';
}

// grid units -> screen px
function screenAt(x, y) {
  const p = new DOMPoint(x * U, y * U).matrixTransform(board.getScreenCTM());
  return { x: p.x, y: p.y };
}
function handAt({ x, y }) {
  const hand = $('hand');
  hand.style.left = `${x - 20}px`;
  hand.style.top = `${y - 6}px`;
  hand.hidden = false;
}

async function showHint(loops = 2) {
  if (won || !lv) return;
  stopHint();
  const id = hintRun;
  const h = hintTarget();
  if (!h) return;
  const hand = $('hand');
  if (h.turn) {
    showBadge(h.pc);
    handAt(screenAt(h.pc.cx, h.pc.cy));
    toast(t('tip.turn'));
    await wait(2600);
    if (id === hintRun) stopHint();
    return;
  }
  $('hintG').innerHTML = A.slotGlow(h.to);
  hand.classList.add('dragging');
  for (let n = 0; n < loops; n++) {
    const a = screenAt(h.pc.cx, h.pc.cy), b = screenAt(h.to.x, h.to.y);
    handAt(a);
    await wait(500);
    if (id !== hintRun) break;
    await tween(900, (k) => id === hintRun && handAt({ x: a.x + (b.x - a.x) * ease(k), y: a.y + (b.y - a.y) * ease(k) }));
    await wait(500);
    if (id !== hintRun) break;
  }
  hand.classList.remove('dragging');
  if (id === hintRun) stopHint();
}

// the first picture keeps showing what to do while the child waits
function guide(ms) {
  clearTimeout(guideTimer);
  guideTimer = setTimeout(() => !won && !drag && showHint(1).then(() => guided && !won && !drag && guide(2500)), ms);
}

// ---------- little helpers ----------
function shake(pc) {
  const a0 = pc.ang;
  pc.busy = true;
  tween(420, (k) => {
    pc.ang = a0 + Math.sin(k * Math.PI * 4) * 8 * (1 - k);
    render(pc);
  }).then(() => {
    pc.ang = a0;
    render(pc);
    pc.busy = false;
  });
}

function sparkle(cx, cy, color) {
  const fx = $('fx');
  for (let j = 0; j < 10; j++) {
    const a = (j / 10) * Math.PI * 2;
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('r', 8);
    c.setAttribute('fill', j % 2 ? '#fff' : color);
    fx.append(c);
    tween(500, (k) => {
      c.setAttribute('cx', cx + Math.cos(a) * 80 * k);
      c.setAttribute('cy', cy + Math.sin(a) * 80 * k);
      c.setAttribute('opacity', 1 - k);
    }).then(() => c.remove());
  }
}

// a short message in the header line, then the level's tip comes back
let toastTimer = 0;
function toast(text) {
  const el = $('tip');
  el.textContent = text;
  el.classList.remove('say');
  void el.offsetWidth;
  el.classList.add('say');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('say');
    if (lv) el.textContent = t(lv.tip || 'tip.go');
  }, 3000);
}

function confetti() {
  const box = $('confetti');
  const colors = ['#ff8fa8', '#ffd36b', '#7cc4f0', '#7ccf6a', '#b99af0', '#ffb15c'];
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('i');
    c.style.left = `${Math.random() * 100}%`;
    c.style.background = colors[i % colors.length];
    c.style.animationDuration = `${1.6 + Math.random() * 1.4}s`;
    c.style.animationDelay = `${Math.random() * 0.4}s`;
    box.append(c);
    setTimeout(() => c.remove(), 3600);
  }
}

// ---------- wiring ----------
board.addEventListener('pointermove', onMove);
board.addEventListener('pointerup', onUp);
board.addEventListener('pointercancel', onUp);
$('playBtn').onclick = () => {
  unlock();
  startLevel(frontier());
};
$('levelsBtn').onclick = showTitle;
$('hintBtn').onclick = () => {
  unlock();
  $('hintBtn').classList.remove('glow');
  showHint(2);
};
const muteBtn = $('muteBtn');
muteBtn.textContent = isMuted() ? '🔇' : '🔊';
muteBtn.onclick = () => {
  muteBtn.textContent = toggleMute() ? '🔇' : '🔊';
};
window.addEventListener('resize', () => {
  stopHint();
  layout();
});
window.addEventListener('pointerdown', unlock, { once: true });

function showLang() {
  for (const b of document.querySelectorAll('.langs button')) b.setAttribute('aria-pressed', b.dataset.lang === lang);
  $('cornerBtn').href = `../../?lang=${lang}`;
}
for (const b of document.querySelectorAll('.langs button'))
  b.onclick = () => {
    setLang(b.dataset.lang);
    showLang();
    renderGrid();
  };
applyText();
showLang();

// on the lastenurk site (/games/<name>/) the title screen gets a button back to the landing page
if (/\/games\/[^/]+\/(index\.html)?$/.test(location.pathname)) $('cornerBtn').hidden = false;

// dev shortcut: ?level=5 opens that picture straight away
const q = new URLSearchParams(location.search);
if (q.has('level')) startLevel(Math.max(0, Math.min(levels.length - 1, Number(q.get('level')) - 1)));
else showTitle();

// offline support: only in the built game (the dev server would cache stale code)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

// dev only: lets a test script see the pieces and places
if (import.meta.env.DEV) window.__kp = () => ({ lv, pieces, filled, won, toScreen: screenAt });
