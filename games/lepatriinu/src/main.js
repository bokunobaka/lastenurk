// Lepatriinu labürint: tilt the tablet (or drag a finger) to roll a ladybug through a garden maze, pick up her
// lost spots and take her home to the flower, which opens once she has them all. Holes send her back to the
// start (she keeps her spots), mushrooms bounce, ice slides, honey sticks, flower buttons open gates.
// Screens: title -> play -> win. The garden is drawn on a canvas (src/art.js), once for what stays still
// and each frame for what moves; the maps come from src/levels.js, rolling by tilt from src/tilt.js.
import './style.css';
import * as A from './art.js';
import { LEVELS } from './levels.js';
import { parse, tile, bfs } from './maze.js';
import { t, lang, setLang, applyText } from './i18n.js';
import { sfx, unlock, isMuted, toggleMute, rolling } from './sound.js';
import * as tilt from './tilt.js';

const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const near = (k, dt) => 1 - Math.exp(-dt * k); // smoothing that does not depend on the frame rate
const buzz = (ms) => navigator.vibrate?.(ms);
function capLen(x, y, max = 1) {
  const l = Math.hypot(x, y);
  return l > max ? { x: (x / l) * max, y: (y / l) * max } : { x, y };
}

// ---------- saved: which levels are done ----------
const SAVE = 'lepatriinu.done';
function load(k, d) {
  try {
    const v = localStorage.getItem(k);
    return v == null ? d : JSON.parse(v);
  } catch {
    return d;
  }
}
function store(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
}
let done = load(SAVE, {});
function frontier() {
  let i = 0;
  while (i < LEVELS.length - 1 && done[i]) i++;
  return i;
}

// ---------- how she rolls (lengths in cells, times in seconds) ----------
const R = 0.3; // the ladybug's radius
const ACC = 14; // push at full tilt
const MAXV = 5.5; // top speed
const GRIP = { path: 1.8, ice: 0.12, honey: 7 }; // how fast she slows down by herself
const PUSH = { path: 1, ice: 0.7, honey: 0.5 }; // how much the tilt pushes on each ground
const MUSH_R = 0.33;
const KICK = 3.6; // a mushroom sends her off at least this fast

// ---------- state ----------
let li = 0;
let M = null; // the parsed map
let bug = null; // { x, y, vx, vy, ang, walk, pop, ground, fallT, from }
let phase = 'off'; // ready -> roll (-> fall -> roll) -> home -> done
let readyT = 0;
let clock = 0;
let got = 0;
let spots = [], mush = [], buttons = [], doors = [];
let open = new Set(); // ids of the opened gates
let bloom = 0; // 0 = bud; grows to 1 once every spot is found
let atHome = false; // sitting on the shut flower (said "not yet" once)
let tokT = 0; // a little quiet between knocks
let fx = [];
let finger = null; // { id, x, y } in screen pixels while a finger steers
const keys = { left: 0, right: 0, up: 0, down: 0 };
let paused = false;
let tipTimer = 0;

const playEl = $('play');
const canvas = $('board');
const ctx = canvas.getContext('2d');
const still = document.createElement('canvas'); // what never moves, drawn once per level and size
const sctx = still.getContext('2d');
let cw = 0, ch = 0, dpr = 1;
const view = { u: 40, ox: 0, oy: 0, tr: false, bw: 0, bh: 0 }; // cell size in px, board corner, turned?

// the map fits the screen whichever way round fills it better: a wide map on a tall screen is turned
// (mirrored across its diagonal, which keeps every way through the same)
function layout() {
  dpr = Math.min(2, devicePixelRatio || 1);
  cw = innerWidth;
  ch = innerHeight;
  canvas.width = still.width = Math.round(cw * dpr);
  canvas.height = still.height = Math.round(ch * dpr);
  if (!M) return;
  const top = 78, pad = 12;
  const aw = cw - 2 * pad, ah = ch - top - pad;
  const u1 = Math.min(aw / M.W, ah / M.H), u2 = Math.min(aw / M.H, ah / M.W);
  view.tr = u2 > u1 * 1.05;
  view.u = view.tr ? u2 : u1;
  view.bw = (view.tr ? M.H : M.W) * view.u;
  view.bh = (view.tr ? M.W : M.H) * view.u;
  view.ox = (cw - view.bw) / 2;
  view.oy = top + (ah - view.bh) / 2;
  drawStill();
}
function toMapSpace(c) {
  const { u, ox, oy, tr } = view;
  if (tr) c.setTransform(0, u * dpr, u * dpr, 0, ox * dpr, oy * dpr);
  else c.setTransform(u * dpr, 0, 0, u * dpr, ox * dpr, oy * dpr);
}
function toMap(px, py) {
  const a = (px - view.ox) / view.u, b = (py - view.oy) / view.u;
  return view.tr ? { x: b, y: a } : { x: a, y: b };
}
const turnVec = (v) => (view.tr ? { x: v.y, y: v.x } : v); // a screen direction in map directions (and back)

function drawStill() {
  const c = sctx;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, cw, ch);
  c.fillStyle = 'rgba(40,80,20,0.25)';
  c.beginPath();
  c.roundRect(view.ox + 6, view.oy + 10, view.bw, view.bh, view.u * 0.35);
  c.fill();
  toMapSpace(c);
  A.garden(c, M);
}

// ---------- title screen ----------
function showTitle() {
  phase = 'off';
  rolling(0);
  playEl.hidden = true;
  $('win').hidden = true;
  $('title').hidden = false;
  $('hero').innerHTML = A.heroSvg();
  renderGrid();
}

function renderGrid() {
  const grid = $('levelGrid');
  grid.innerHTML = '';
  const next = frontier();
  LEVELS.forEach((l, i) => {
    const b = document.createElement('button');
    b.className = 'lvl';
    let mark = '';
    if (done[i]) {
      b.classList.add('done');
      mark = '★';
    } else if (i === next) b.classList.add('next');
    if (i > next) {
      b.disabled = true;
      mark = '🔒';
    }
    b.innerHTML = `${i + 1}<small>${mark}</small>`;
    b.setAttribute('aria-label', t('ui.level', { n: i + 1 }));
    b.onclick = () => go(i);
    grid.append(b);
  });
}

// from a tap: sound and tilting may only be switched on inside one
async function go(i) {
  unlock();
  const ok = await tilt.request();
  startLevel(i);
  if (!ok && matchMedia('(pointer: coarse)').matches) say(t('ui.noTilt'), 4000);
}

// ---------- a level ----------
const centre = (c) => ({ x: c.x + 0.5, y: c.y + 0.5 });

function startLevel(i) {
  li = i;
  M = parse(LEVELS[i]);
  const s = centre(M.start);
  bug = { x: s.x, y: s.y, vx: 0, vy: 0, ang: 0, walk: 0, pop: 0, ground: 'path', fallT: 0, from: null };
  spots = M.spots.map((p) => ({ ...p, gone: false }));
  mush = M.mush.map((p) => ({ ...p, sq: 0 }));
  buttons = M.buttons.map((p) => ({ ...p, down: false }));
  doors = M.doors.map((p) => ({ ...p, open: 0 }));
  open = new Set();
  got = 0;
  bloom = 0;
  atHome = false;
  fx = [];
  clock = 0;
  finger = null;
  phase = 'ready';
  readyT = 0.9;
  $('title').hidden = true;
  $('win').hidden = true;
  playEl.hidden = false;
  say(t(LEVELS[i].tip), 4500);
  layout();
  hud();
  if (!running) {
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }
}

let running = false, last = 0;
function frame(now) {
  if (playEl.hidden) {
    running = false;
    rolling(0);
    return;
  }
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!paused) for (let k = 0; k < fast; k++) update(dt);
  draw();
  requestAnimationFrame(frame);
}

// ---------- which way she is pushed (map directions, length up to 1) ----------
function push() {
  if (phase !== 'roll') return { x: 0, y: 0 };
  if (finger) {
    // towards the finger, easing off as she gets there
    const p = toMap(finger.x, finger.y);
    return capLen((p.x - bug.x) * 1.6 - bug.vx * 0.35, (p.y - bug.y) * 1.6 - bug.vy * 0.35);
  }
  if (keys.left || keys.right || keys.up || keys.down) {
    const v = turnVec({ x: keys.right - keys.left, y: keys.down - keys.up });
    return capLen(v.x * 9, v.y * 9);
  }
  if (autopilot) return autopilot();
  const r = tilt.roll();
  return capLen(...Object.values(turnVec(r)));
}

const solid = (x, y) => {
  const ch = tile(M, x, y);
  if (ch === '#') return true;
  if ('ABC'.includes(ch)) return !open.has(ch.toLowerCase());
  return false;
};
function groundAt(x, y) {
  const ch = tile(M, Math.floor(x), Math.floor(y));
  return ch === 'i' ? 'ice' : ch === 'm' ? 'honey' : 'path';
}

// one small step of rolling: push, slow down, move, bump off hedges, gates and mushrooms
function step(h) {
  const a = push();
  const g = groundAt(bug.x, bug.y);
  bug.vx += a.x * ACC * PUSH[g] * h;
  bug.vy += a.y * ACC * PUSH[g] * h;
  const f = Math.exp(-GRIP[g] * h);
  bug.vx *= f;
  bug.vy *= f;
  const v = capLen(bug.vx, bug.vy, MAXV);
  bug.vx = v.x;
  bug.vy = v.y;
  bug.x += bug.vx * h;
  bug.y += bug.vy * h;

  let hit = 0;
  const cx = Math.floor(bug.x), cy = Math.floor(bug.y);
  for (let y = cy - 1; y <= cy + 1; y++)
    for (let x = cx - 1; x <= cx + 1; x++) {
      if (!solid(x, y)) continue;
      const qx = clamp(bug.x, x, x + 1), qy = clamp(bug.y, y, y + 1);
      let dx = bug.x - qx, dy = bug.y - qy;
      let d = Math.hypot(dx, dy);
      if (d >= R) continue;
      if (d < 1e-6) {
        // the centre got inside (only if something went very wrong): out the nearest side
        const sides = [[bug.x - x, -1, 0], [x + 1 - bug.x, 1, 0], [bug.y - y, 0, -1], [y + 1 - bug.y, 0, 1]].sort((p, q) => p[0] - q[0]);
        [, dx, dy] = sides[0];
        d = 1;
      }
      const nx = dx / d, ny = dy / d;
      bug.x = qx + nx * R;
      bug.y = qy + ny * R;
      const vn = bug.vx * nx + bug.vy * ny;
      if (vn < 0) {
        bug.vx -= 1.35 * vn * nx; // a soft bounce
        bug.vy -= 1.35 * vn * ny;
        hit = Math.max(hit, -vn);
      }
    }
  for (const m of mush) {
    const dx = bug.x - (m.x + 0.5), dy = bug.y - (m.y + 0.5);
    const d = Math.hypot(dx, dy);
    if (d >= R + MUSH_R || d < 1e-6) continue;
    const nx = dx / d, ny = dy / d;
    bug.x = m.x + 0.5 + nx * (R + MUSH_R);
    bug.y = m.y + 0.5 + ny * (R + MUSH_R);
    const vn = bug.vx * nx + bug.vy * ny;
    if (vn < 0.5) {
      const out = Math.max(KICK, -vn * 1.1);
      bug.vx += (out - vn) * nx;
      bug.vy += (out - vn) * ny;
      m.sq = 1;
      sfx.boing();
      buzz(15);
      burst(m.x + 0.5 + nx * MUSH_R, m.y + 0.5 + ny * MUSH_R, 6, '#fff6ea', 1.6);
    }
  }
  if (hit > 1.2 && tokT <= 0) {
    tokT = 0.08;
    sfx.tok(Math.min(1, hit / 5));
    if (hit > 3) buzz(10);
  }
}

function update(dt) {
  clock += dt;
  tokT -= dt;
  if (phase === 'ready' && (readyT -= dt) <= 0) {
    phase = 'roll';
    tilt.calibrate();
    sfx.go();
  }
  for (const m of mush) m.sq = Math.max(0, m.sq - dt * 3);
  for (const d of doors) if (open.has(d.id)) d.open = Math.min(1, d.open + dt * 2);
  if (got === spots.length && bloom < 1) bloom = Math.min(1, bloom + dt * 1.5);
  bug.pop = Math.max(0, bug.pop - dt * 2.5);

  if (phase === 'roll') {
    const n = Math.ceil(dt / 0.008);
    for (let k = 0; k < n; k++) step(dt / n);
    events();
  } else if (phase === 'fall') {
    // she spins down into the hole, then pops up at the start
    bug.fallT += dt;
    bug.x += (bug.from.x - bug.x) * near(12, dt);
    bug.y += (bug.from.y - bug.y) * near(12, dt);
    if (bug.fallT > 0.8) {
      const s = centre(M.start);
      Object.assign(bug, { x: s.x, y: s.y, vx: 0, vy: 0, fallT: 0, from: null });
      phase = 'roll';
      sfx.pop();
      burst(s.x, s.y, 12, '#fff', 2.2);
    }
  } else if (phase === 'home') {
    const c = centre(M.home);
    bug.x += (c.x - bug.x) * near(6, dt);
    bug.y += (c.y - bug.y) * near(6, dt);
    bug.ang += dt * 3;
    if ((bug.homeT += dt) > 1.3) {
      phase = 'done';
      win();
    }
  }

  // she turns to face where she rolls, and her legs run with her speed
  const sp = Math.hypot(bug.vx, bug.vy);
  if (phase === 'roll' && sp > 0.25) {
    let d = Math.atan2(bug.vy, bug.vx) - bug.ang;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    bug.ang += d * near(10, dt);
  }
  bug.walk += sp * dt * 14;
  rolling(phase === 'roll' ? sp / MAXV : 0, bug.ground === 'ice');

  for (const p of fx) {
    p.life += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 1 - near(3, dt);
    p.vy *= 1 - near(3, dt);
  }
  fx = fx.filter((p) => p.life < p.max);
}

// what she rolled onto: holes, spots, buttons, the flower, ice and honey
function events() {
  const dist = (c) => Math.hypot(bug.x - c.x - 0.5, bug.y - c.y - 0.5);
  for (const o of M.holes)
    if (dist(o) < 0.3) {
      phase = 'fall';
      bug.from = centre(o);
      bug.vx = bug.vy = 0;
      sfx.fall();
      buzz(40);
      say(t('ui.oops'), 2500);
      return;
    }
  for (const s of spots)
    if (!s.gone && dist(s) < R + 0.1) {
      s.gone = true;
      got++;
      bug.pop = 1;
      sfx.spot(got - 1);
      burst(s.x + 0.5, s.y + 0.5, 10, '#ffd43b', 2.4, true);
      hud();
      if (got === spots.length) {
        setTimeout(() => sfx.bloom(), 250);
        burst(M.home.x + 0.5, M.home.y + 0.5, 16, '#ff7eb6', 2.6);
        say(t('ui.open'), 3500);
      }
    }
  for (const b of buttons)
    if (!b.down && dist(b) < 0.4) {
      b.down = true;
      open.add(b.id);
      sfx.click();
      setTimeout(() => sfx.door(), 180);
      for (const d of doors) if (d.id === b.id) burst(d.x + 0.5, d.y + 0.5, 12, '#d29a5c', 2);
    }
  const home = dist(M.home) < 0.42;
  if (home && got === spots.length) {
    phase = 'home';
    bug.homeT = 0;
    bug.vx = bug.vy = 0;
    sfx.win();
    return;
  }
  if (home && !atHome) {
    sfx.notYet();
    say(t('ui.notYet'), 2500);
  }
  atHome = home;
  const g = groundAt(bug.x, bug.y);
  if (g !== bug.ground) {
    if (g === 'ice') sfx.ice();
    if (g === 'honey') sfx.honey();
    bug.ground = g;
  }
}

// ---------- particles (in cells) ----------
function burst(x, y, n, color, sp, star = false) {
  for (let j = 0; j < n; j++) {
    const a = (j / n) * Math.PI * 2 + Math.random() * 0.3;
    fx.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 0.6, r: 0.07, color, star });
  }
}

// ---------- drawing ----------
function draw() {
  const c = ctx;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.drawImage(still, 0, 0);
  toMapSpace(c);
  const at = (x, y, f) => {
    c.save();
    c.translate(x, y);
    f();
    c.restore();
  };
  for (const d of doors) at(d.x + 0.5, d.y + 0.5, () => A.gate(c, d.id, d.open));
  for (const b of buttons) at(b.x + 0.5, b.y + 0.5, () => A.button(c, b.id, b.down, clock));
  spots.forEach((s, i) => !s.gone && at(s.x + 0.5, s.y + 0.5, () => A.spot(c, clock + i * 0.7)));
  for (const m of mush) at(m.x + 0.5, m.y + 0.5, () => A.mushroom(c, m.sq));
  at(M.home.x + 0.5, M.home.y + 0.5, () => A.flower(c, bloom, clock));

  // the ladybug: a shadow, then her (smaller and spinning while she falls)
  const k = phase === 'fall' ? clamp(1 - bug.fallT / 0.6, 0, 1) : 1;
  if (k > 0)
    at(bug.x, bug.y, () => {
      c.fillStyle = 'rgba(60,40,20,0.25)';
      c.beginPath();
      c.arc(0.05 * k, 0.07 * k, R * k, 0, Math.PI * 2);
      c.fill();
      c.rotate(bug.ang + (phase === 'fall' ? bug.fallT * 12 : 0));
      c.scale(k, k);
      A.ladybug(c, got, bug.walk, bug.pop);
    });

  for (const p of fx) {
    const q = p.life / p.max;
    c.globalAlpha = 1 - q;
    c.fillStyle = p.color;
    c.beginPath();
    if (p.star) {
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5, r = (i % 2 ? 0.04 : 0.09) * (1 - q * 0.5);
        c.lineTo(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r);
      }
    } else c.arc(p.x, p.y, p.r * (1 - q * 0.5), 0, Math.PI * 2);
    c.fill();
  }
  c.globalAlpha = 1;
}

// ---------- the heads-up: one dot per spot to find ----------
function hud() {
  const box = $('spots');
  if (box.children.length !== spots.length) box.innerHTML = spots.map(() => '<i></i>').join('');
  [...box.children].forEach((el, i) => el.classList.toggle('on', i < got));
  box.setAttribute('aria-label', `${t('aria.spots')} ${got} / ${spots.length}`);
}

function say(text, ms) {
  const el = $('tip');
  el.textContent = text;
  el.classList.remove('gone');
  clearTimeout(tipTimer);
  tipTimer = setTimeout(() => el.classList.add('gone'), ms);
}

// ---------- home ----------
function win() {
  if (playEl.hidden) return;
  rolling(0);
  done[li] = true;
  store(SAVE, done);
  const lastLevel = li === LEVELS.length - 1;
  $('winPic').innerHTML = A.homeSvg(got);
  $('winTitle').textContent = lastLevel ? t('win.final') : t('win.title');
  $('nextBtn').hidden = lastLevel;
  $('win').hidden = false;
  confetti();
}

function confetti() {
  const box = $('confetti');
  const colors = ['#ff6b6b', '#ffd36b', '#7cc4f0', '#7ccf6a', '#ff8fc0', '#2a2230'];
  for (let i = 0; i < 40; i++) {
    const el = document.createElement('i');
    el.style.left = `${Math.random() * 100}%`;
    el.style.background = colors[i % colors.length];
    el.style.borderRadius = i % 3 ? '3px' : '50%';
    el.style.animationDuration = `${1.6 + Math.random() * 1.4}s`;
    el.style.animationDelay = `${Math.random() * 0.4}s`;
    box.append(el);
    setTimeout(() => el.remove(), 3600);
  }
}

// ---------- wiring ----------
canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  unlock();
  if (finger) return;
  finger = { id: e.pointerId, x: e.clientX, y: e.clientY };
  canvas.setPointerCapture?.(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (finger && e.pointerId === finger.id) (finger.x = e.clientX), (finger.y = e.clientY);
});
const lift = (e) => {
  if (finger && e.pointerId === finger.id) finger = null;
};
canvas.addEventListener('pointerup', lift);
canvas.addEventListener('pointercancel', lift);

const KEYS = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down' };
addEventListener('keydown', (e) => {
  if (!KEYS[e.key]) return;
  keys[KEYS[e.key]] = 1;
  if (!playEl.hidden) e.preventDefault();
});
addEventListener('keyup', (e) => {
  if (KEYS[e.key]) keys[KEYS[e.key]] = 0;
});

$('playBtn').onclick = () => go(frontier());
$('levelsBtn').onclick = showTitle;
$('homeBtn').onclick = showTitle;
$('againBtn').onclick = () => go(li);
$('nextBtn').onclick = () => go(Math.min(li + 1, LEVELS.length - 1));
const muteBtn = $('muteBtn');
muteBtn.textContent = isMuted() ? '🔇' : '🔊';
muteBtn.onclick = () => {
  muteBtn.textContent = toggleMute() ? '🔇' : '🔊';
};
addEventListener('resize', layout);
addEventListener('pointerdown', unlock, { once: true });
document.addEventListener('visibilitychange', () => {
  paused = document.hidden;
  if (paused) rolling(0);
  last = performance.now();
});

function showLang() {
  for (const b of document.querySelectorAll('.langs button')) b.setAttribute('aria-pressed', b.dataset.lang === lang);
  $('cornerBtn').href = `../../?lang=${lang}`;
  const touchy = matchMedia('(pointer: coarse)').matches;
  $('how').textContent = t(touchy ? 'ui.how' : 'ui.howKeys');
}
for (const b of document.querySelectorAll('.langs button'))
  b.onclick = () => {
    setLang(b.dataset.lang);
    showLang();
    renderGrid();
  };
applyText();
showLang();
layout();

// on the lastenurk site (/games/<name>/) the title screen gets a button back to the landing page
if (/\/games\/[^/]+\/(index\.html)?$/.test(location.pathname)) $('cornerBtn').hidden = false;

const q = new URLSearchParams(location.search);
// dev only: ?auto rolls by itself along the shortest way to the nearest spot (then a button, then home),
// ?fast=3 runs the game three times as fast (for testing whole levels)
let autopilot = null;
const fast = import.meta.env.DEV ? clamp(Number(q.get('fast')) || 1, 1, 8) : 1;
if (import.meta.env.DEV && q.has('auto'))
  autopilot = () => {
    const from = { x: Math.floor(bug.x), y: Math.floor(bug.y) };
    const seen = bfs(M, from, open);
    const key = (c) => `${c.x},${c.y}`;
    let goals = spots.filter((s) => !s.gone);
    if (!goals.length) goals = [M.home];
    goals = goals.filter((g) => seen.has(key(g)));
    if (!goals.length) goals = buttons.filter((b) => !b.down && seen.has(key(b)));
    if (!goals.length) return { x: 0, y: 0 };
    let cell = seen.get(key(goals.reduce((a, b) => (seen.get(key(a)).d <= seen.get(key(b)).d ? a : b))));
    while (cell.prev && cell.prev.prev) cell = cell.prev;
    const w = centre(cell);
    return capLen((w.x - bug.x) * 3 - bug.vx * 1.1, (w.y - bug.y) * 3 - bug.vy * 1.1);
  };

// dev shortcut: ?level=5 opens that level straight away
if (q.has('level')) startLevel(clamp(Number(q.get('level')) - 1, 0, LEVELS.length - 1));
else showTitle();

// dev only: lets a test script see the state
if (import.meta.env.DEV) window.__lb = () => ({ li, phase, got, total: spots.length, bug, view });

// offline support: only in the built game (the dev server would cache stale code)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
