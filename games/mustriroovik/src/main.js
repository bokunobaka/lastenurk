// Mustriröövik: a caterpillar's body is a pattern with some segments missing. Drag (or tap) the right
// segment from the leaf into each gap. Later levels hide one wrong segment that must be tapped away first.
// Tapping the caterpillar's head makes it sing its pattern, one note per kind of segment.
// Screens: title -> play -> win.
import './style.css';
import * as A from './art.js';
import { levels } from './levels.js';
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

// ---------- saved progress ----------
const SAVE = 'mustriroovik.done';
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
function frontier() {
  let i = 0;
  while (i < levels.length - 1 && done[i]) i++;
  return i;
}

// ---------- state ----------
const S = 96; // from one segment to the next
const R = 40; // a big segment
const PR = 46; // a big piece on the leaf
const RH = 175; // from one row of the caterpillar to the next
let lv = null;
let G = null; // layout: { W, H, k, pos: [{ x, ground }], tray: [{ x, y }], trayY }
let slots = []; // body segments: { want, tok (shown, null = gap), wrong, pending, el }
let won = false;
let fails = 0;
let guided = false;
let idle = 0;
let drag = null;
let hintRun = 0;
let singRun = 0;
let headMood = 'happy';
let moodTimer = 0;

const board = $('board');
const playEl = $('play');

// ---------- title screen ----------
function showTitle() {
  stopHint();
  playEl.hidden = true;
  $('win').hidden = true;
  $('title').hidden = false;
  lv = null;
  renderGrid();
}

function renderGrid() {
  const grid = $('levelGrid');
  grid.innerHTML = '';
  const open = frontier();
  levels.forEach((l, i) => {
    const b = document.createElement('button');
    b.className = 'lvl';
    let mark = '';
    if (done[i]) {
      b.classList.add('done');
      mark = '✔';
    } else if (i === open) b.classList.add('next');
    if (i > open) {
      b.disabled = true;
      mark = '🔒';
    }
    b.innerHTML = `${i + 1}<small>${mark}</small>`;
    b.setAttribute('aria-label', t('ui.level', { n: i + 1 }));
    b.onclick = () => startLevel(i);
    grid.append(b);
  });
}

// a little caterpillar: head and segments in a row (title screen, win card)
function miniCaterpillar(items, r = 34, bob = false) {
  const s = r * 2.35;
  const segs = items
    .map((it, i) => {
      const x = 70 + (i + 1) * s, cy = 2 * r + 60 - A.radius(it, r);
      const inner = `${A.feet(0, A.radius(it, r), r)}${A.segment(it, r)}`;
      return `<g transform="translate(${x} ${cy})">${bob ? `<g class="heroSeg" style="animation-delay:${-i * 0.15}s">${inner}</g>` : inner}</g>`;
    })
    .reverse()
    .join('');
  return A.svg(`${segs}<g transform="translate(70 ${2 * r + 60 - r * 1.15})">${A.head(r, 'happy')}</g>`, `0 0 ${70 + (items.length + 1) * s} ${2 * r + 70}`);
}
$('hero').innerHTML = miniCaterpillar(['red', 'blue', 'red', 'blue'].map((c) => ({ color: c })), 34, true);

// ---------- play screen ----------
function startLevel(i) {
  stopHint();
  lv = levels[i];
  won = false;
  fails = 0;
  idle = 0;
  drag = null;
  guided = i === 0;
  headMood = 'happy';
  $('title').hidden = true;
  $('win').hidden = true;
  playEl.hidden = false;
  playEl.classList.remove('locked');
  $('badge').textContent = i + 1;
  clearTimeout(toastTimer);
  $('tip').classList.remove('say');
  $('tip').textContent = t(lv.tip || 'tip.go');
  $('hintBtn').classList.remove('glow');
  slots = lv.seq.map((want, j) => {
    const wrong = lv.wrong?.at === j;
    return { want, tok: lv.gaps.includes(j) ? null : wrong ? lv.wrong.it : want, wrong, pending: false, el: null };
  });
  layout();
}

// landscape: one long row. Tall screens: the caterpillar snakes down in rows of six.
function layout() {
  if (!lv) return;
  const r = $('boardWrap').getBoundingClientRect();
  const wide = r.width / r.height > 1.05;
  const m = slots.length + 1;
  const k = wide ? m : Math.min(m, 5);
  const rows = Math.ceil(m / k);
  const n = lv.choices.length;
  const gapX = wide ? 140 : 124; // between the pieces on the leaf
  const W = Math.max(wide ? 1000 : 0, (k - 1) * S + 2 * (RH / 2 + R + 20), n * gapX + 120);
  const x0 = (W - (k - 1) * S) / 2;
  const g0 = 150;
  const pos = Array.from({ length: m }, (_, i) => {
    const row = Math.floor(i / k), c = i % k;
    return { x: row % 2 ? x0 + (k - 1 - c) * S : x0 + c * S, ground: g0 + row * RH, row };
  });
  const trayY = g0 + (rows - 1) * RH + 150;
  const tray = lv.choices.map((_, j) => ({ x: W / 2 + (j - (n - 1) / 2) * gapX, y: trayY }));
  G = { W, H: trayY + 105, k, pos, tray, trayY };

  // the spine joins the middles; at the end of a row it bends down to the next one
  let d = `M${pos[0].x} ${pos[0].ground - R}`;
  for (let i = 1; i < m; i++) {
    const a = pos[i - 1], b = pos[i];
    d += a.row === b.row ? ` L${b.x} ${b.ground - R}` : ` A${RH / 2} ${RH / 2} 0 0 ${a.row % 2 ? 0 : 1} ${b.x} ${b.ground - R}`;
  }
  let twigs = '';
  for (let row = 0; row < rows; row++) {
    const xs = pos.filter((p) => p.row === row).map((p) => p.x);
    twigs += A.twig(Math.min(...xs) - 75, Math.max(...xs) + 75, g0 + row * RH + 2);
  }
  board.setAttribute('viewBox', `0 0 ${G.W} ${G.H}`);
  board.innerHTML = `<g id="twigs">${twigs}</g><g id="halo"></g>
    <path d="${d}" fill="none" stroke="${A.C.spine}" stroke-width="${R * 1.1}" stroke-linecap="round" stroke-linejoin="round"/>
    <g id="feet">${pos.slice(1).map((p) => A.feet(p.x, p.ground, R)).join('')}</g>
    <g id="segs"></g><g id="headG" class="seg"></g>
    <g id="tray">${A.trayLeaf(W / 2, trayY, n * gapX + 100, 190)}</g><g id="fly"></g><g id="fx"></g><g id="hintG"></g>`;
  // drawn from the tail, so each segment tucks under the one before it
  for (let i = slots.length - 1; i >= 0; i--) {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'seg');
    g.addEventListener('pointerdown', (e) => onSeg(e, i));
    slots[i].el = g;
    $('segs').append(g);
    drawSlot(i);
  }
  $('headG').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    unlock();
    stopHint();
    idle = 0;
    sing();
  });
  drawHead();
  lv.choices.forEach((it, j) => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'piece');
    g.setAttribute('transform', `translate(${tray[j].x} ${tray[j].y})`);
    g.innerHTML = `<circle r="${PR + 14}" fill="transparent"/>${A.segment(it, PR)}`;
    g.addEventListener('pointerdown', (e) => onPiece(e, j));
    $('tray').append(g);
  });
}

// where a body segment's middle is (it stands on the twig, so small ones sit lower)
function segAt(i, it = slots[i].tok) {
  const p = G.pos[i + 1];
  return { x: p.x, y: p.ground - (it ? A.radius(it, R) : R) };
}

function drawSlot(i, lift = 0, scale = 1) {
  const s = slots[i];
  const { x, y } = segAt(i);
  s.el.setAttribute('transform', `translate(${x} ${y - lift}) scale(${scale})`);
  s.el.innerHTML = s.tok ? `<circle r="${R}" fill="transparent"/>${A.segment(s.tok, R)}` : `<g class="gapRing">${A.gap(R)}</g>`;
}

function drawHead(lift = 0) {
  const p = G.pos[0];
  const el = $('headG');
  el.setAttribute('transform', `translate(${p.x} ${p.ground - R * 1.15 - lift})`);
  el.innerHTML = A.head(R, headMood);
}
function mood(m, ms = 0) {
  headMood = m;
  clearTimeout(moodTimer);
  if (G) drawHead();
  if (ms)
    moodTimer = setTimeout(() => {
      headMood = 'happy';
      if (G && !won) drawHead();
    }, ms);
}

const openGap = () => slots.findIndex((s) => !s.tok && !s.pending);
const finished = () => slots.every((s) => s.tok && !s.wrong);

// ---------- singing: each segment bobs and plays its note; gaps ask ----------
async function sing(all = false) {
  const id = ++singRun;
  for (let i = 0; i < slots.length; i++) {
    if (id !== singRun) return;
    const s = slots[i];
    if (s.tok) {
      sfx.note(lv.note[s.tok.key]);
      bob(i);
    } else if (!all) sfx.ask();
    await wait(230);
  }
}
function bob(i, h = 16) {
  return tween(260, (k) => slots[i].el && drawSlotLift(i, Math.sin(k * Math.PI) * h));
}
function drawSlotLift(i, lift) {
  const { x, y } = segAt(i);
  slots[i].el.setAttribute('transform', `translate(${x} ${y - lift})`);
}

// ---------- tapping the body ----------
async function onSeg(e, i) {
  e.preventDefault();
  unlock();
  if (won || drag) return;
  stopHint();
  idle = 0;
  const s = slots[i];
  if (s.wrong) return popWrong(i);
  if (!s.tok) {
    sfx.ask();
    return;
  }
  sfx.note(lv.note[s.tok.key]);
  bob(i);
  if (slots.some((o) => o.wrong)) {
    fails++;
    if (fails >= 2) $('hintBtn').classList.add('glow');
    toast(t('oops.right'));
  }
}

// the wrong segment drops off the twig and leaves a gap
async function popWrong(i) {
  const s = slots[i];
  const { x, y } = segAt(i);
  const ghost = document.createElementNS(NS, 'g');
  ghost.innerHTML = A.segment(s.tok, R);
  $('fly').append(ghost);
  s.wrong = false;
  s.tok = null;
  drawSlot(i);
  sfx.pop();
  mood('yum', 900);
  toast(t('msg.gone'));
  await tween(650, (k) => {
    ghost.setAttribute('transform', `translate(${x + 60 * k} ${y - 40 * Math.sin(k * Math.PI) + 260 * k * k}) rotate(${200 * k}) scale(${1 - 0.5 * k})`);
    ghost.setAttribute('opacity', 1 - k * k);
  });
  ghost.remove();
}

// ---------- the leaf: drag a piece to a gap, or tap it to fill the first gap ----------
function svgPoint(e) {
  return new DOMPoint(e.clientX, e.clientY).matrixTransform(board.getScreenCTM().inverse());
}
function makeClone(j) {
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('class', 'piece lift');
  g.innerHTML = A.segment(lv.choices[j], PR);
  put(g, G.tray[j].x, G.tray[j].y);
  $('fly').append(g);
  return g;
}
const put = (el, x, y, sc = 1) => el.setAttribute('transform', `translate(${x} ${y}) scale(${sc})`);

function onPiece(e, j) {
  e.preventDefault();
  unlock();
  if (won || drag) return;
  stopHint();
  idle = 0;
  e.currentTarget.setPointerCapture(e.pointerId);
  const p = svgPoint(e);
  const { x, y } = G.tray[j];
  drag = { j, id: e.pointerId, sx: e.clientX, sy: e.clientY, dx: p.x - x, dy: p.y - y, x, y, el: null };
}

function onMove(e) {
  if (!drag || e.pointerId !== drag.id) return;
  if (!drag.el) {
    if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 8) return;
    drag.el = makeClone(drag.j);
    sfx.pick();
  }
  const p = svgPoint(e);
  drag.x = Math.max(0, Math.min(G.W, p.x - drag.dx));
  drag.y = Math.max(0, Math.min(G.H, p.y - drag.dy));
  put(drag.el, drag.x, drag.y);
}

function onUp(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const d = drag;
  drag = null;
  idle = 0;
  const it = lv.choices[d.j];
  if (!d.el) {
    // a tap: the piece hops to the first gap
    const g = openGap();
    if (g < 0) {
      if (slots.some((s) => s.wrong)) {
        toast(t('oops.first'));
        sfx.no();
        fails++;
        if (fails >= 2) $('hintBtn').classList.add('glow');
      }
      return;
    }
    sfx.pick();
    return tryPut(makeClone(d.j), G.tray[d.j], g, it, d.j);
  }
  // a drop: the nearest gap, if the piece is close enough
  let best = -1, bestD = S * 0.75;
  slots.forEach((s, i) => {
    if (s.tok || s.pending) return;
    const c = segAt(i);
    const dist = Math.hypot(c.x - d.x, c.y - d.y);
    if (dist < bestD) [best, bestD] = [i, dist];
  });
  if (best < 0) return flyBack(d.el, d, d.j);
  tryPut(d.el, d, best, it, d.j);
}

async function tryPut(el, from, i, it, j) {
  const s = slots[i];
  s.pending = true;
  const to = segAt(i, it);
  const right = it.key === s.want.key;
  const sc = A.radius(it, R) / A.radius(it, PR);
  await tween(260, (k) => put(el, from.x + (to.x - from.x) * ease(k), from.y + (to.y - from.y) * ease(k) - Math.sin(k * Math.PI) * 50, 1 + (sc - 1) * k));
  if (right) {
    el.remove();
    s.tok = it;
    s.pending = false;
    sfx.snap(lv.note[it.key]);
    tween(300, (k) => drawSlot(i, 0, 1 + 0.25 * Math.sin(k * Math.PI)));
    sparkle(to.x, to.y, '#ffd36b');
    mood('yum', 800);
    if (finished()) win();
    return;
  }
  sfx.no();
  mood('oh', 1100);
  toast(t('oops.no'));
  fails++;
  if (fails >= 2) $('hintBtn').classList.add('glow');
  await tween(380, (k) => put(el, to.x + Math.sin(k * Math.PI * 5) * 12 * (1 - k), to.y, sc));
  s.pending = false;
  flyBack(el, to, j, sc);
}

async function flyBack(el, from, j, sc0 = 1) {
  const to = G.tray[j];
  sfx.back();
  await tween(300, (k) => put(el, from.x + (to.x - from.x) * ease(k), from.y + (to.y - from.y) * ease(k), sc0 + (1 - sc0) * k));
  el.remove();
}

// ---------- finished ----------
async function win() {
  won = true;
  stopHint();
  playEl.classList.add('locked');
  saveDone(lv.index);
  await wait(400);
  mood('yum');
  await sing(true);
  sfx.win();
  confetti();
  drawHead(0);
  await tween(700, (k) => {
    slots.forEach((_, i) => drawSlotLift(i, Math.max(0, Math.sin((k * 2 - i / slots.length) * Math.PI)) * 22));
    drawHead(Math.max(0, Math.sin(k * 2 * Math.PI)) * 22);
  });
  const i = lv.index, last = i === levels.length - 1;
  await wait(500);
  if (!lv || lv.index !== i || !won) return;
  $('winPic').innerHTML = last
    ? A.svg(A.butterfly(), '-120 -100 240 190')
    : miniCaterpillar(slots.slice(0, 5).map((s) => s.tok), 34);
  $('winTitle').textContent = t(last ? 'win.final' : 'win.title');
  $('nextBtn').onclick = () => (last ? showTitle() : startLevel(i + 1));
  $('againBtn').onclick = () => startLevel(i);
  $('win').hidden = false;
}

// ---------- hints ----------
function stopHint() {
  hintRun++;
  $('hand').hidden = true;
  $('hand').classList.remove('dragging');
  for (const id of ['hintG', 'halo']) {
    const el = $(id);
    if (el) el.innerHTML = '';
  }
}

function screenAt(x, y) {
  const p = new DOMPoint(x, y).matrixTransform(board.getScreenCTM());
  return { x: p.x, y: p.y };
}
function handAt({ x, y }) {
  const hand = $('hand');
  hand.style.left = `${x - 20}px`;
  hand.style.top = `${y - 6}px`;
  hand.hidden = false;
}
const ring = (x, y, r) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#fff" stroke-width="8" stroke-dasharray="16 12" class="glowBox"/>`;

// the wrong segment: a ring and a tapping hand. Else the repeats light up in turns and a hand
// carries the right piece to the first gap.
async function showHint(loops = 2) {
  if (won || !lv || drag) return;
  stopHint();
  const id = hintRun;
  const w = slots.findIndex((s) => s.wrong);
  if (w >= 0) {
    const c = segAt(w);
    $('hintG').innerHTML = ring(c.x, c.y, R + 14);
    handAt(screenAt(c.x, c.y));
    await wait(2600);
    if (id === hintRun) stopHint();
    return;
  }
  const g = openGap();
  if (g < 0) return;
  if (lv.period)
    $('halo').innerHTML = slots
      .map((_, i) => `<circle cx="${G.pos[i + 1].x}" cy="${G.pos[i + 1].ground - R}" r="${S / 2 + 2}" fill="${Math.floor(i / lv.period) % 2 ? '#d9f0ff' : '#fff3c9'}"/>`)
      .join('');
  const c = segAt(g);
  const j = lv.choices.findIndex((it) => it.key === slots[g].want.key);
  $('hintG').innerHTML = ring(c.x, c.y, R + 14);
  const hand = $('hand');
  hand.classList.add('dragging');
  for (let n = 0; n < loops; n++) {
    const a = screenAt(G.tray[j].x, G.tray[j].y), b = screenAt(c.x, c.y);
    handAt(a);
    await wait(450);
    if (id !== hintRun) return;
    await tween(900, (k) => id === hintRun && handAt({ x: a.x + (b.x - a.x) * ease(k), y: a.y + (b.y - a.y) * ease(k) }));
    await wait(450);
    if (id !== hintRun) return;
  }
  hand.classList.remove('dragging');
  $('hand').hidden = true;
  $('hintG').innerHTML = '';
  await wait(1500);
  if (id === hintRun) stopHint();
}

// the first level shows the hand by itself when the child waits
setInterval(() => {
  if (!lv || won || drag || playEl.hidden) return;
  idle += 0.25;
  if (guided && idle > 3) {
    idle = -4;
    showHint(1);
  }
}, 250);

// ---------- little helpers ----------
function sparkle(cx, cy, color) {
  const fx = $('fx');
  for (let j = 0; j < 10; j++) {
    const a = (j / 10) * Math.PI * 2;
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('r', 7);
    c.setAttribute('fill', j % 2 ? '#fff' : color);
    fx.append(c);
    tween(550, (k) => {
      c.setAttribute('cx', cx + Math.cos(a) * 70 * k);
      c.setAttribute('cy', cy + Math.sin(a) * 70 * k);
      c.setAttribute('opacity', 1 - k);
    }).then(() => c.remove());
  }
}

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
  if (!lv || playEl.hidden || drag) return;
  stopHint();
  for (const s of slots) s.pending = false;
  $('fly') && ($('fly').innerHTML = '');
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

// dev shortcut: ?level=5 opens that level straight away
const q = new URLSearchParams(location.search);
if (q.has('level')) startLevel(Math.max(0, Math.min(levels.length - 1, Number(q.get('level')) - 1)));
else showTitle();

// dev only: lets a test script see the state
if (import.meta.env.DEV) window.__mr = () => ({ lv, G, slots, won, toScreen: screenAt, segAt });

// offline support: only in the built game (the dev server would cache stale code)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
