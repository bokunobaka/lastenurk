// Konn Krooks: tap number cards (+3, −2, ...) and the frog jumps that many lily pads forward or back,
// counting the pads it passes. Land exactly on the fly to catch it. Screens: title -> play -> win.
import './style.css';
import * as A from './art.js';
import { levels, jump, solve, sum } from './levels.js';
import { t, lang, setLang, applyText } from './i18n.js';
import { sfx, unlock, isMuted, toggleMute } from './sound.js';

const { PAD, ROW } = A;
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

// ---------- saved progress: finished levels ----------
const SAVE = 'konnKrooks.done';
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
let lv = null;
let at = 0; // the pad the frog sits on
let used = []; // card indexes, in the order played
let busy = false;
let won = false;
let fails = 0;
let guided = false;
let cam = 0; // world x at the middle of the view
let view = { w: 1000, h: 300 }; // world size of the view
let handTarget = null;
let handTimer = 0;

const pond = $('pond');
const playEl = $('play');
const padX = (n) => n * PAD;

// ---------- title screen ----------
function showTitle() {
  hideHand();
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

$('heroFrog').innerHTML = `<g transform="translate(10 -150)">${A.fly()}</g>${A.frog()}`;

// ---------- play screen ----------
function startLevel(i) {
  hideHand();
  lv = levels[i];
  at = lv.start;
  used = [];
  busy = false;
  won = false;
  fails = 0;
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
  renderPond();
  renderHand();
  showSum();
  layout(true);
  changed();
}

function renderPond() {
  let s = A.pond(lv.N);
  for (let n = 0; n <= lv.N; n++) {
    const gap = lv.gaps.includes(n);
    s += `<g transform="translate(${padX(n)} ${ROW})">${gap ? A.gapMark() : `<g id="pad${n}">${A.pad(n)}</g>`}
      <g id="num${n}" class="num${gap ? ' gap' : ''}${n % 10 === 0 ? ' ten' : ''}">${A.padNumber(n)}</g></g>`;
  }
  s += `<g id="pips"></g>
    <g id="flyG" transform="translate(${padX(lv.fly)} ${ROW - 128})"><g id="flyInner">${A.fly()}</g></g>
    <g id="frogG"><g id="frogInner"></g></g><g id="fx"></g><g id="arrow"></g>`;
  pond.innerHTML = s;
  placeFrog(at);
  face();
  litNumber();
}

function placeFrog(x, lift = 0, sx = 1, sy = 1) {
  $('frogG').setAttribute('transform', `translate(${padX(x)} ${ROW - 2 - lift}) scale(${sx} ${sy})`);
}
function face(o = {}) {
  $('frogInner').innerHTML = A.frog(o);
}
function litNumber() {
  for (let n = 0; n <= lv.N; n++) $(`num${n}`)?.querySelector('text').classList.toggle('lit', n === at);
}

function renderHand(popIndex = -1) {
  const hand = $('hand');
  hand.innerHTML = '';
  lv.cards.forEach((v, i) => {
    const b = document.createElement('button');
    b.className = 'ncard' + (used.includes(i) ? ' used' : '') + (i === popIndex ? ' pop' : '');
    b.dataset.i = i;
    b.setAttribute('aria-label', t(v > 0 ? 'aria.plus' : 'aria.minus', { n: Math.abs(v) }));
    b.innerHTML = A.svg(A.card(v), 100, 122);
    b.onclick = () => play(i);
    hand.append(b);
  });
}
const cardEl = (i) => $('hand').querySelector(`[data-i="${i}"]`);

function showSum(pop = false) {
  const el = $('sum');
  el.textContent = sum(lv.start, used.map((i) => lv.cards[i]), at);
  if (pop) {
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
  }
}

function changed() {
  $('undoBtn').disabled = !used.length || won;
  playEl.classList.toggle('locked', busy || won);
  hideHand();
  if (guided && !busy && !won) requestAnimationFrame(() => showHint(false));
}

// ---------- the view: big pads, following the frog when the row is too long to fit ----------
function layout(snap = false) {
  if (!lv) return;
  const r = $('boardWrap').getBoundingClientRect();
  const band = 300; // world height that must show: the fly above, the numbers below
  const whole = (lv.N + 1.6) * PAD;
  let s = Math.min(r.height / band, r.width / whole);
  const small = 0.5; // a pad narrower than 50 px is too small to see well: follow the frog instead
  if (s < small) s = Math.min(r.height / band, Math.max(small, r.width / (6 * PAD)));
  // on tall screens the pond is only as high as it needs to be, in the middle of the space
  const ph = Math.min(r.height, band * s * 1.3);
  pond.style.top = `${(r.height - ph) / 2}px`;
  pond.style.height = `${ph}px`;
  view = { w: r.width / s, h: ph / s };
  if (snap) cam = camTarget(at);
  setView();
}

// where the view should be: both frog and fly if they fit, else the frog (never past the row's ends)
function camTarget(x) {
  const min = -0.8 * PAD + view.w / 2, max = (lv.N + 0.8) * PAD - view.w / 2;
  if (min >= max) return (lv.N * PAD) / 2;
  const both = Math.abs(padX(x) - padX(lv.fly)) + 1.6 * PAD <= view.w;
  const c = both ? (padX(x) + padX(lv.fly)) / 2 : padX(x);
  return Math.max(min, Math.min(max, c));
}

function setView() {
  const top = 185 - view.h / 2;
  pond.setAttribute('viewBox', `${cam - view.w / 2} ${top} ${view.w} ${view.h}`);
  // an arrow at the edge points to the fly when it is out of sight
  const fx = padX(lv.fly), left = cam - view.w / 2, right = cam + view.w / 2;
  const arrow = $('arrow');
  if (won || (fx > left + 30 && fx < right - 30)) {
    arrow.innerHTML = '';
    return;
  }
  const side = fx < left ? -1 : 1;
  const x = side < 0 ? left + 46 : right - 46;
  arrow.innerHTML = `<g transform="translate(${x} ${ROW - 128})"><circle r="34" fill="#fff" opacity=".9"/>
    <path d="M${side * 44} 0 l${-side * 16} -14 v28z" fill="#5b4e7a"/><g transform="scale(.8) translate(0 6)">${A.fly()}</g></g>`;
}

async function panTo(x, ms = 300) {
  const from = cam, to = camTarget(x);
  if (Math.abs(to - from) < 1) return;
  await tween(ms, (k) => {
    cam = from + (to - from) * ease(k);
    setView();
  });
}

// ---------- jumping ----------
async function play(i) {
  unlock();
  if (busy || won || used.includes(i)) return;
  const v = lv.cards[i];
  const j = jump(lv, at, v);
  sfx.card();
  if (j.result === 'edge') {
    face({ mood: 'oops' });
    shake(cardEl(i));
    sfx.oops();
    toast(t('oops.edge'));
    miss();
    await wait(700);
    face();
    return;
  }
  busy = true;
  used.push(i);
  renderHand(i);
  changed();
  const from = at;
  await hop(from, j.to, v);
  if (j.result === 'splash') {
    await splash(from, j.to);
    used.pop();
    renderHand(i);
  } else {
    await land(j.to);
    at = j.to;
    litNumber();
    showSum(true);
    if (at === lv.fly) return catchFly();
  }
  busy = false;
  changed();
  if (j.result === 'ok' && !solve(lv, at, used)) {
    toast(t('oops.stuck'));
    miss();
    pointAt($('undoBtn'), 2600);
  }
}

// one jump in an arc; the pads it passes pop up a count 1, 2, 3...
async function hop(from, to, v, count = true) {
  const n = Math.abs(v);
  const high = Math.min(150, 50 + n * 10);
  sfx.hop();
  await tween(90, (k) => placeFrog(from, 0, 1 + 0.1 * k, 1 - 0.15 * k));
  let passed = 0;
  const camFrom = cam, camTo = camTarget(to);
  await tween(320 + n * 70, (k) => {
    const x = from + (to - from) * k;
    placeFrog(x, high * 4 * k * (1 - k), 0.92, 1.1);
    cam = camFrom + (camTo - camFrom) * ease(k);
    setView();
    while (count && passed < n && k >= (passed + 1) / n - 0.02) {
      passed++;
      const p = from + Math.sign(v) * passed;
      pip(p, passed);
      sfx.count(passed, v > 0);
    }
  });
}

function pip(n, m) {
  const g = document.createElementNS(NS, 'g');
  g.innerHTML = `<text x="0" y="0" text-anchor="middle" class="pip">${m}</text>`;
  $('pips').append(g);
  tween(900, (k) => {
    const s = k < 0.2 ? 0.5 + (k / 0.2) * 0.6 : 1.1 - Math.min(0.1, (k - 0.2) * 0.5);
    g.setAttribute('transform', `translate(${padX(n)} ${ROW - 40 - k * 25}) scale(${s})`);
    g.setAttribute('opacity', k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3);
  }).then(() => g.remove());
}

async function land(x) {
  sfx.land();
  const pad = $(`pad${x}`);
  await tween(200, (k) => {
    const d = Math.sin(k * Math.PI);
    placeFrog(x, -d * 5, 1 + 0.15 * d, 1 - 0.15 * d);
    pad?.setAttribute('transform', `translate(0 ${d * 5})`);
  });
}

async function splash(from, x) {
  sfx.splash();
  face({ mood: 'oops' });
  toast(t('oops.splash'));
  miss();
  drops(padX(x), ROW);
  await tween(300, (k) => placeFrog(x, -30 * k));
  await wait(450);
  face();
  // swims back up onto the pad it came from
  await tween(450, (k) => placeFrog(x + (from - x) * ease(k), -30 + 30 * k + Math.sin(k * Math.PI) * 40));
  await land(from);
  await panTo(from);
}

async function catchFly() {
  won = true;
  changed();
  setView();
  const fl = $('flyInner');
  for (let k = 0; k <= 1; k += 0.25) {
    face({ tongue: 100 * Math.sin(k * Math.PI) });
    if (k >= 0.5) fl.setAttribute('transform', `translate(0 ${(k - 0.5) * 190}) scale(${1 - (k - 0.5) * 2})`);
    await wait(45);
  }
  fl.setAttribute('opacity', 0);
  face({ mood: 'happy' });
  sfx.yum();
  sfx.win();
  sparkle(padX(at), ROW - 60, '#ffd36b');
  confetti();
  for (let h = 0; h < 2; h++) await tween(300, (k) => placeFrog(at, Math.sin(k * Math.PI) * 30));
  saveDone(lv.index);
  guided = false;
  busy = false;
  const i = lv.index, last = i === levels.length - 1;
  $('winFrog').innerHTML = A.frog({ mood: 'happy' });
  $('winTitle').textContent = t(last ? 'win.final' : 'win.title');
  $('winSum').textContent = $('sum').textContent;
  $('nextBtn').onclick = () => (last ? showTitle() : startLevel(i + 1));
  $('againBtn').onclick = () => startLevel(i);
  await wait(300);
  if (lv.index === i && won) $('win').hidden = false;
}

async function undo() {
  unlock();
  if (busy || won || !used.length) return;
  busy = true;
  changed();
  const i = used.pop();
  const to = at - lv.cards[i];
  await hop(at, to, -lv.cards[i], false);
  at = to;
  await land(at);
  litNumber();
  renderHand(i);
  showSum(true);
  busy = false;
  changed();
}

function miss() {
  fails++;
  if (fails >= 2) $('hintBtn').classList.add('glow');
}

// ---------- hints: the first card of the shortest way from here, or ↺ when there is none ----------
function showHint(timed = true) {
  if (busy || won || !lv) return;
  const best = solve(lv, at, used);
  pointAt(best ? cardEl(best[0]) : $('undoBtn'), timed ? 2600 : 0);
}

function pointAt(el, ms) {
  if (!el) return;
  handTarget = el;
  clearTimeout(handTimer);
  placeHand();
  if (ms) handTimer = setTimeout(hideHand, ms);
}
function placeHand() {
  if (!handTarget) return;
  const r = handTarget.getBoundingClientRect();
  const hand = $('handPoint');
  hand.style.left = `${r.left + r.width / 2 - 20}px`;
  hand.style.top = `${r.top + r.height * 0.45}px`;
  hand.hidden = false;
}
function hideHand() {
  handTarget = null;
  clearTimeout(handTimer);
  $('handPoint').hidden = true;
}

// ---------- little helpers ----------
function shake(el) {
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
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

function drops(cx, cy) {
  const fx = $('fx');
  for (let j = 0; j < 9; j++) {
    const a = Math.PI + (j / 8) * Math.PI;
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('r', 6 + (j % 3) * 2);
    c.setAttribute('fill', j % 2 ? '#fff' : '#7cc4f0');
    fx.append(c);
    tween(600, (k) => {
      c.setAttribute('cx', cx + Math.cos(a) * 60 * k);
      c.setAttribute('cy', cy + Math.sin(a) * 70 * k + 120 * k * k);
      c.setAttribute('opacity', 1 - k);
    }).then(() => c.remove());
  }
  const ring = document.createElementNS(NS, 'ellipse');
  ring.setAttribute('cx', cx);
  ring.setAttribute('cy', cy + 6);
  ring.setAttribute('fill', 'none');
  ring.setAttribute('stroke', '#fff');
  ring.setAttribute('stroke-width', 4);
  fx.append(ring);
  tween(700, (k) => {
    ring.setAttribute('rx', 20 + 50 * k);
    ring.setAttribute('ry', 7 + 15 * k);
    ring.setAttribute('opacity', 1 - k);
  }).then(() => ring.remove());
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
$('playBtn').onclick = () => {
  unlock();
  startLevel(frontier());
};
$('levelsBtn').onclick = showTitle;
$('undoBtn').onclick = undo;
$('hintBtn').onclick = () => {
  unlock();
  $('hintBtn').classList.remove('glow');
  showHint(true);
};
const muteBtn = $('muteBtn');
muteBtn.textContent = isMuted() ? '🔇' : '🔊';
muteBtn.onclick = () => {
  muteBtn.textContent = toggleMute() ? '🔇' : '🔊';
};
window.addEventListener('resize', () => {
  layout(true);
  placeHand();
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
if (import.meta.env.DEV) window.__kk = () => ({ lv, at, used, won, busy, solve });

// offline support: only in the built game (the dev server would cache stale code)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
