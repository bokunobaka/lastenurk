// Näljased kastid: things ride along a belt; drag each one into the hungry box that eats it.
// A box munches the right things and spits out the wrong ones; things that ride off the end of the
// belt come back round, so nothing is ever lost. Screens: title -> play -> win.
import './style.css';
import * as A from './art.js';
import { levels, boxFor, rng } from './levels.js';
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
const SAVE = 'naljasedKastid.done';
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
const SPEED = 70; // belt, world units a second
const IS = 1.05; // size of things on the belt
let lv = null;
let G = null; // layout: { W, H, beltY, pipeX, endX, boxes: [{ x, top, s, w, h }] }
let things = []; // { it, box, state: 'queue' | 'drop' | 'belt' | 'drag' | 'busy' | 'eaten', x, y, sc, el }
let queue = [];
let eaten = 0;
let paused = false;
let won = false;
let fails = 0;
let guided = false;
let idle = 0; // seconds since the child last did something (the first level shows the hand then)
let drag = null;
let hintRun = 0;
let loopId = 0;

const board = $('board');
const playEl = $('play');

// ---------- title screen ----------
function showTitle() {
  stopLoop();
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

$('hero').innerHTML = A.svg(
  `<g transform="translate(110 70)">${A.box({ color: A.C.red, edge: '#d95858', mood: 'happy', label: `<g transform="scale(1.25)"><path d="M-22 -4 Q-24 -22 -4 -22 Q8 -30 18 -18 Q30 -10 22 6 Q24 22 6 22 Q-10 30 -18 18 Q-30 12 -22 -4Z" fill="${A.C.red}"/></g>` })}</g>
   <g transform="translate(60 -75)"><g class="heroBall">${A.thing({ name: 'ball', color: 'red' })}</g></g>`,
  '-10 -80 240 340'
);

// ---------- play screen ----------
function startLevel(i) {
  stopLoop();
  stopHint();
  lv = levels[i];
  won = false;
  paused = false;
  fails = 0;
  eaten = 0;
  idle = 0;
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
  const rand = rng(i * 53 + 11);
  things = lv.items
    .map((it) => ({ it, box: boxFor(lv, it), state: 'queue', x: 0, y: 0, sc: IS, el: null, k: rand() }))
    .sort((a, b) => a.k - b.k);
  queue = [...things];
  renderProgress();
  layout();
  startLoop();
}

// the world: landscape has the boxes in one row under the belt; tall screens get two columns
function layout() {
  if (!lv) return;
  const r = $('boardWrap').getBoundingClientRect();
  const wide = r.width / r.height > 0.9;
  const n = lv.boxes.length;
  const W = wide ? 1000 : 600;
  const beltY = wide ? 165 : 210;
  const cols = wide ? n : Math.min(n, 2);
  const rows = Math.ceil(n / cols);
  const cell = W / cols;
  const s = Math.min(1.05, (cell - 24) / 190, wide ? 1 : 1.25);
  const top0 = beltY + (wide ? 125 : 140);
  const H = top0 + rows * (180 * s + 70) - (wide ? 20 : 0);
  const boxes = lv.boxes.map((_, b) => {
    const row = Math.floor(b / cols), c = b % cols;
    const inRow = Math.min(cols, n - row * cols);
    return { x: W / 2 + (c - (inRow - 1) / 2) * cell, top: top0 + row * (180 * s + 70), s, w: 190 * s, h: 180 * s, mood: 'open' };
  });
  G = { W, H, beltY, pipeX: wide ? 90 : 70, endX: W - (wide ? 70 : 50), boxes };
  board.style.setProperty('--belt', `${40 / (SPEED * lv.speed)}s`);
  board.setAttribute('viewBox', `0 0 ${W} ${H}`);
  board.innerHTML = `${A.pipe(G.pipeX, beltY - 150)}${A.chute(G.endX, beltY)}${A.belt(-20, G.endX + 10, beltY)}
    <g id="boxes"></g><g id="items"></g><g id="fx"></g><g id="hintG"></g>`;
  G.boxes.forEach((bx, b) => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('transform', `translate(${bx.x} ${bx.top}) scale(${bx.s})`);
    g.innerHTML = `<g class="bi"></g>`;
    bx.el = g;
    $('boxes').append(g);
    drawBox(b);
  });
  for (const th of things) {
    if (th.state === 'eaten') continue;
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'item');
    g.innerHTML = `<rect x="5" y="5" width="90" height="90" fill="transparent"/>${A.thing(th.it)}`;
    g.addEventListener('pointerdown', (e) => onDown(e, th));
    th.el = g;
    $('items').append(g);
    if (th.state === 'queue' || th.state === 'drop') {
      th.state = 'queue';
      if (!queue.includes(th)) queue.push(th);
      g.style.display = 'none';
    } else {
      th.y = G.beltY - 6;
      th.x = Math.max(G.pipeX, Math.min(G.endX - 40, th.x));
      if (th.state !== 'belt') th.state = 'belt';
      place(th);
    }
  }
}

function drawBox(b, mood) {
  const bx = G.boxes[b];
  if (mood) bx.mood = mood;
  bx.el.firstChild.innerHTML = A.box({ ...A.boxColor(lv, b), label: A.label(lv, b), mood: bx.mood, seed: b });
}

// a thing's (x, y) is the middle of its bottom
function place(th) {
  th.el.setAttribute('transform', `translate(${th.x - 50 * th.sc} ${th.y - 90 * th.sc}) scale(${th.sc})`);
}

function renderProgress() {
  $('progress').innerHTML = things.map(() => '<i></i>').join('');
}
function fillProgress() {
  [...$('progress').children].forEach((d, i) => d.classList.toggle('on', i < eaten));
}

// ---------- the belt ----------
function startLoop() {
  const id = ++loopId;
  let last = performance.now();
  const frame = (now) => {
    if (id !== loopId) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!paused && !won) tick(dt);
    board.classList.toggle('still', paused || won);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
function stopLoop() {
  loopId++;
}

function tick(dt) {
  const v = SPEED * lv.speed;
  for (const th of things) {
    if (th.state !== 'belt') continue;
    th.x += v * dt;
    place(th);
    if (th.x > G.endX + 20) offTheEnd(th);
  }
  // a new thing drops from the pipe when there is room
  const moving = things.filter((th) => th.state === 'belt' || th.state === 'drop' || th.state === 'drag' || th.state === 'busy').length;
  const near = things.some((th) => (th.state === 'belt' && th.x < G.pipeX + 170) || th.state === 'drop');
  if (queue.length && moving < lv.max && !near) dropIn(queue.shift());
  idle += dt;
  if (guided && idle > 2.2 && !drag) {
    idle = -3;
    showHint(1);
  }
}

async function dropIn(th) {
  th.state = 'drop';
  th.x = G.pipeX;
  th.sc = IS;
  th.el.style.display = '';
  const y0 = G.beltY - 160, y1 = G.beltY - 6;
  await tween(380, (k) => {
    th.y = y0 + (y1 - y0) * k * k;
    place(th);
  });
  sfx.drop();
  if (th.state === 'drop') th.state = 'belt';
}

// off the end of the belt: down the chute, and back in the queue
async function offTheEnd(th) {
  th.state = 'busy';
  sfx.fall();
  const x0 = th.x, y0 = th.y;
  await tween(400, (k) => {
    th.x = x0 + 30 * k;
    th.y = y0 + 90 * k * k;
    th.sc = IS * (1 - 0.6 * k);
    place(th);
  });
  th.el.style.display = 'none';
  th.state = 'queue';
  queue.push(th);
}

// ---------- dragging ----------
function svgPoint(e) {
  return new DOMPoint(e.clientX, e.clientY).matrixTransform(board.getScreenCTM().inverse());
}

function onDown(e, th) {
  unlock();
  if (won || drag || th.state !== 'belt') return;
  e.preventDefault();
  stopHint();
  idle = 0;
  th.el.setPointerCapture(e.pointerId);
  const p = svgPoint(e);
  th.state = 'drag';
  drag = { th, id: e.pointerId, sx: e.clientX, sy: e.clientY, dx: p.x - th.x, dy: p.y - th.y, moved: false };
  $('items').append(th.el);
}

function onMove(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const { th } = drag;
  if (!drag.moved) {
    if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 8) return;
    drag.moved = true;
    th.el.classList.add('lift');
    sfx.pick();
  }
  const p = svgPoint(e);
  th.x = Math.max(0, Math.min(G.W, p.x - drag.dx));
  th.y = Math.max(60, Math.min(G.H, p.y - drag.dy));
  place(th);
}

function onUp(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const { th, moved } = drag;
  drag = null;
  idle = 0;
  th.el.classList.remove('lift');
  if (!moved) {
    th.state = 'belt';
    sfx.wiggle();
    wiggle(th);
    return;
  }
  const b = boxUnder(th);
  if (b < 0) return backToBelt(th);
  if (b === th.box) return eat(th, b);
  spit(th, b);
}

// the box under a thing's middle (a bit above the box counts too: that is its mouth)
function boxUnder(th) {
  const cx = th.x, cy = th.y - 45 * th.sc;
  return G.boxes.findIndex((bx) => cx > bx.x - bx.w / 2 - 10 && cx < bx.x + bx.w / 2 + 10 && cy > bx.top - 90 && cy < bx.top + bx.h);
}

async function backToBelt(th, delay = 0) {
  th.state = 'busy';
  if (delay) await wait(delay);
  sfx.back();
  const x0 = th.x, y0 = th.y;
  const x1 = Math.max(G.pipeX + 60, Math.min(G.endX - 60, th.x)), y1 = G.beltY - 6;
  await tween(320, (k) => {
    th.x = x0 + (x1 - x0) * ease(k);
    th.y = y0 + (y1 - y0) * ease(k) - Math.sin(k * Math.PI) * 60;
    place(th);
  });
  th.state = 'belt';
}

async function eat(th, b) {
  th.state = 'busy';
  const bx = G.boxes[b];
  const x0 = th.x, y0 = th.y, s0 = th.sc;
  await tween(240, (k) => {
    th.x = x0 + (bx.x - x0) * ease(k);
    th.y = y0 + (bx.top + 20 - y0) * ease(k);
    th.sc = s0 * (1 - 0.7 * k);
    place(th);
  });
  th.el.remove();
  th.state = 'eaten';
  eaten++;
  sfx.munch(eaten - 1);
  fillProgress();
  drawBox(b, 'chomp');
  sparkle(bx.x, bx.top + 10, '#ffd36b');
  await wait(160);
  drawBox(b, 'happy');
  bounce(bx);
  if (eaten === things.length) return win();
  await wait(600);
  if (!won) drawBox(b, 'open');
}

async function spit(th, b) {
  th.state = 'busy';
  const bx = G.boxes[b];
  sfx.yuck();
  drawBox(b, 'yuck');
  shakeBox(bx);
  toast(t('oops.yuck'));
  fails++;
  if (fails >= 2) $('hintBtn').classList.add('glow');
  await backToBelt(th, 150);
  drawBox(b, 'open');
}

// ---------- finished ----------
async function win() {
  won = true;
  stopHint();
  playEl.classList.add('locked');
  saveDone(lv.index);
  sfx.win();
  confetti();
  G.boxes.forEach((bx, b) => {
    drawBox(b, 'happy');
    setTimeout(() => bounce(bx), b * 120);
  });
  const i = lv.index, last = i === levels.length - 1;
  await wait(1700);
  if (lv.index !== i || !won) return;
  $('winBoxes').innerHTML = A.svg(
    G.boxes.map((_, b) => `<g transform="translate(${110 + b * 210} 60)">${A.box({ ...A.boxColor(lv, b), label: A.label(lv, b), mood: 'happy' })}</g>`).join(''),
    `0 0 ${G.boxes.length * 210 + 10} 260`
  );
  $('winTitle').textContent = t(last ? 'win.final' : 'win.title');
  $('nextBtn').onclick = () => (last ? showTitle() : startLevel(i + 1));
  $('againBtn').onclick = () => startLevel(i);
  $('win').hidden = false;
}

// ---------- hints: a hand carries the thing furthest along the belt to its box ----------
function stopHint() {
  hintRun++;
  paused = false;
  $('hand').hidden = true;
  const hg = $('hintG');
  if (hg) hg.innerHTML = '';
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

async function showHint(loops = 2) {
  if (won || !lv || drag) return;
  stopHint();
  const id = hintRun;
  const th = things.filter((x) => x.state === 'belt').sort((a, b) => b.x - a.x)[0];
  if (!th) return;
  paused = true; // the belt waits while the hand shows
  const bx = G.boxes[th.box];
  $('hintG').innerHTML = `<rect x="${bx.x - bx.w / 2 - 8}" y="${bx.top - 30}" width="${bx.w + 16}" height="${bx.h + 40}" rx="24" fill="none" stroke="#fff" stroke-width="8" stroke-dasharray="16 12" class="glowBox"/>`;
  const hand = $('hand');
  hand.classList.add('dragging');
  for (let n = 0; n < loops; n++) {
    const a = screenAt(th.x, th.y - 40), b = screenAt(bx.x, bx.top + 40);
    handAt(a);
    await wait(450);
    if (id !== hintRun) break;
    await tween(900, (k) => id === hintRun && handAt({ x: a.x + (b.x - a.x) * ease(k), y: a.y + (b.y - a.y) * ease(k) }));
    await wait(450);
    if (id !== hintRun) break;
  }
  hand.classList.remove('dragging');
  if (id === hintRun) stopHint();
}

// ---------- little helpers ----------
function wiggle(th) {
  const x0 = th.x;
  tween(300, (k) => {
    if (th.state !== 'belt') return;
    th.y = G.beltY - 6 - Math.sin(k * Math.PI) * 18;
    place(th);
  });
  return x0;
}
function bounce(bx) {
  tween(360, (k) => bx.el.setAttribute('transform', `translate(${bx.x} ${bx.top - Math.sin(k * Math.PI) * 18}) scale(${bx.s})`));
}
function shakeBox(bx) {
  tween(420, (k) => bx.el.setAttribute('transform', `translate(${bx.x + Math.sin(k * Math.PI * 5) * 10 * (1 - k)} ${bx.top}) scale(${bx.s})`));
}

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
if (import.meta.env.DEV) window.__nk = () => ({ lv, G, things, won, eaten, toScreen: screenAt });

// offline support: only in the built game (the dev server would cache stale code)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
