// Robot Piiks: put arrow cards in a row, press ▶, and the robot drives them step by step
// to the battery. Screens: title (level grid) -> play -> win.
import './style.css';
import * as A from './art.js';
import { levels, simulate, plan, STEP } from './levels.js';
import { t, lang, setLang, applyText } from './i18n.js';
import { sfx, unlock, isMuted, toggleMute } from './sound.js';

const $ = (id) => document.getElementById(id);
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

// ---------- saved progress: best star count per finished level ----------
const SAVE = 'robotPiiks.best';
let best = {};
try {
  best = JSON.parse(localStorage.getItem(SAVE)) || {};
} catch {}
function saveBest(i, stars) {
  best[i] = Math.max(best[i] ?? 0, stars);
  try {
    localStorage.setItem(SAVE, JSON.stringify(best));
  } catch {}
}
// the first level not yet finished (every level up to it is open)
function frontier() {
  let i = 0;
  while (i < levels.length - 1 && best[i] != null) i++;
  return i;
}
const countBits = (m) => m.toString(2).replace(/0/g, '').length;

// ---------- state ----------
let lv = null; // the level being played
let program = []; // [{ dir, n }]
let running = false;
let runId = 0; // bumped to cancel a run in progress
let fails = 0;
let guided = false; // tutorial levels keep the pointing hand on screen
let handTarget = null;
let handTimer = 0;

const board = $('board');
const playEl = $('play');
const runBtn = $('runBtn');
const PLAY_ICON = A.svg(A.playButton());
const STOP_ICON = A.svg(`<circle cx="50" cy="55" r="44" fill="#d9608f"/><circle cx="50" cy="50" r="44" fill="#ff9fc8"/>
  <rect x="33" y="33" width="34" height="34" rx="8" fill="#fff"/>`);

// ---------- title screen ----------
function showTitle() {
  stopRun();
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
    const done = best[i] != null;
    let marks = '';
    if (done) marks = l.stars.length ? '★'.repeat(best[i]) + '☆'.repeat(l.stars.length - best[i]) : '✔';
    if (done) b.classList.add('done');
    else if (i === open) b.classList.add('next');
    if (i > open) {
      b.disabled = true;
      marks = '🔒';
    }
    b.innerHTML = `${i + 1}<small>${marks}</small>`;
    b.setAttribute('aria-label', t('ui.level', { n: i + 1 }));
    b.onclick = () => startLevel(i);
    grid.append(b);
  });
}

// the title robot looks around
const LOOKS = [[0, 0], [1, 0], [0, 0], [-1, 0], [0, -1], [0, 0]];
let lookI = 0;
function heroLook() {
  $('heroBot').innerHTML = A.robot({ look: LOOKS[lookI++ % LOOKS.length] });
}
heroLook();
setInterval(() => !$('title').hidden && heroLook(), 1500);

// ---------- play screen ----------
function startLevel(i) {
  stopRun();
  hideHand();
  lv = levels[i];
  program = [];
  fails = 0;
  guided = lv.tip === 'tip.first' || lv.tip === 'tip.repeat';
  $('title').hidden = true;
  $('win').hidden = true;
  playEl.hidden = false;
  $('badge').textContent = i + 1;
  clearTimeout(toastTimer);
  $('tip').classList.remove('say');
  $('tip').textContent = t(lv.tip || 'tip.go');
  $('hintBtn').classList.remove('glow');
  renderBoard();
  renderPalette();
  renderProgram();
  changed();
}

function renderBoard() {
  const W = lv.W * 100, H = lv.H * 100;
  board.setAttribute('viewBox', `-6 -8 ${W + 12} ${H + 22}`);
  let s = `<defs><clipPath id="clip"><rect width="${W}" height="${H}" rx="26"/></clipPath></defs>
    <rect y="8" width="${W}" height="${H}" rx="26" fill="#8fcf74"/><g clip-path="url(#clip)">`;
  for (let y = 0; y < lv.H; y++)
    for (let x = 0; x < lv.W; x++) s += `<g transform="translate(${x * 100} ${y * 100})">${A.grass((x + y) % 2 === 1, x * 7 + y * 3 + lv.index)}</g>`;
  s += `</g><g transform="translate(${lv.start.x * 100} ${lv.start.y * 100})">${A.startPad()}</g>`;
  for (const [k, dir] of lv.belts) s += `<g transform="translate(${k.split(',')[0] * 100} ${k.split(',')[1] * 100})">${A.belt(dir)}</g>`;
  lv.map.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === '1' || ch === '2') s += `<g transform="translate(${x * 100} ${y * 100})">${A.pad(ch)}</g>`;
    })
  );
  const thing = { R: A.rock, T: A.tree, '~': A.pond, '#': A.crate, B: A.battery };
  lv.map.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (thing[ch]) s += `<g transform="translate(${x * 100} ${y * 100})">${thing[ch]()}</g>`;
    })
  );
  lv.stars.forEach((st, i) => {
    s += `<g transform="translate(${st.x * 100} ${st.y * 100})"><g class="star" id="star${i}" style="transform-box:fill-box;transform-origin:center">${A.star()}</g></g>`;
  });
  lv.gates.forEach((g, i) => {
    s += `<g transform="translate(${g.x * 100} ${g.y * 100})"><g id="gate${i}" style="transform-box:fill-box;transform-origin:50% 100%">${A.gate()}</g></g>`;
  });
  if (lv.key) s += `<g transform="translate(${lv.key.x * 100} ${lv.key.y * 100})"><g id="keyG" style="transform-box:fill-box;transform-origin:center">${A.key()}</g></g>`;
  s += `<g id="bot"><g id="botInner"></g></g><g id="fx"></g>`;
  board.innerHTML = s;
  placeBot(lv.start.x, lv.start.y);
  face();
}

function placeBot(x, y, hop = 0, tilt = 0, size = 1) {
  const grow = size === 1 ? '' : ` translate(50 60) scale(${size}) rotate(${(1 - size) * 360} 0 0) translate(-50 -60)`;
  $('bot').setAttribute('transform', `translate(${x * 100} ${y * 100 - 6 - hop}) rotate(${tilt} 50 90)${grow}`);
}
function face(o = {}) {
  $('botInner').innerHTML = A.robot(o);
}

function renderPalette() {
  const pal = $('palette');
  pal.innerHTML = '';
  for (const d of lv.cards) {
    const b = document.createElement('button');
    b.className = 'acard';
    b.dataset.dir = d;
    b.setAttribute('aria-label', t(`dir.${d}`));
    b.innerHTML = A.svg(A.card(d), 100, 110);
    b.onclick = () => addCard(d);
    pal.append(b);
  }
}

function renderProgram(popIndex = -1) {
  const tray = $('program');
  tray.innerHTML = '';
  for (let i = 0; i < lv.slots; i++) {
    const c = program[i];
    if (!c) {
      const e = document.createElement('div');
      e.className = i === program.length ? 'slot first' : 'slot';
      tray.append(e);
      continue;
    }
    const b = document.createElement('button');
    b.className = 'pcard' + (i === popIndex ? ' pop' : '');
    b.setAttribute('aria-label', `${t(`dir.${c.dir}`)} ×${c.n}`);
    b.innerHTML = A.svg(A.card(c.dir), 100, 110) + (lv.repeat ? `<span class="times${c.n === 1 ? ' one' : ''}">×${c.n}</span>` : '');
    b.onclick = () => tapCard(i);
    tray.append(b);
  }
}

function addCard(dir) {
  unlock();
  if (running) return;
  if (program.length >= lv.slots) {
    shake($('program'));
    sfx.bump();
    return;
  }
  program.push({ dir, n: 1 });
  sfx.card(dir);
  face({ look: STEP[dir] });
  renderProgram(program.length - 1);
  changed();
}

// on repeat levels a placed card counts 1 -> 2 -> 3 -> 1 steps; elsewhere a tap takes it away
function tapCard(i) {
  unlock();
  if (running) return;
  if (!lv.repeat) {
    program.splice(i, 1);
    sfx.remove();
    face();
    renderProgram();
    changed();
    return;
  }
  const c = program[i];
  c.n = (c.n % lv.maxRep) + 1;
  sfx.more(c.n);
  renderProgram(i);
  changed();
}

function undo() {
  if (running || !program.length) return;
  program.pop();
  sfx.remove();
  face();
  renderProgram();
  changed();
}

function changed() {
  $('undoBtn').disabled = !program.length;
  runBtn.innerHTML = running ? STOP_ICON : PLAY_ICON;
  runBtn.classList.toggle('ready', !running && program.length > 0 && (program.length === lv.slots || guided));
  playEl.classList.toggle('locked', running);
  hideHand();
  if (guided && !running) requestAnimationFrame(() => showHint(false));
}

// ---------- driving ----------
async function run() {
  unlock();
  if (running) {
    stopRun();
    await resetBot();
    return;
  }
  if (!program.length) {
    pointAt($('palette').firstElementChild, 1800);
    return;
  }
  running = true;
  const id = ++runId;
  changed();
  const sim = simulate(lv, program);
  let at = { ...lv.start };
  for (const s of sim.steps) {
    if (id !== runId) return;
    mark(s.card);
    if (s.via === 'pad') {
      sfx.pad();
      await tween(220, (k) => placeBot(at.x, at.y, 0, 0, 1 - k * 0.95));
      sparkle(at.x * 100 + 50, at.y * 100 + 55, '#b99af0');
      await tween(260, (k) => placeBot(s.x, s.y, 0, 0, 0.05 + k * 0.95));
      sparkle(s.x * 100 + 50, s.y * 100 + 55, '#b99af0');
    } else if (s.via === 'belt') {
      sfx.belt();
      await moveBot(at, s, 260, false);
    } else {
      face({ look: STEP[s.dir] });
      sfx.step(s.dir);
      await moveBot(at, s);
    }
    at = s;
    if (s.star >= 0) collectStar(s.star);
    if (s.key) collectKey();
  }
  if (id !== runId) return;
  if (sim.result === 'win') return win(sim, id);
  if (sim.result === 'bump') {
    mark(sim.card);
    await bump(at, sim.dir);
    shake(cardEl(sim.card));
    toast(t('oops.bump'));
  } else {
    face({ look: [0, -1] });
    sfx.short();
    toast(t('oops.short'));
    await wait(500);
  }
  await wait(900);
  if (id !== runId) return;
  fails++;
  if (fails >= 2) $('hintBtn').classList.add('glow');
  stopRun();
  await resetBot();
}

function stopRun() {
  runId++;
  running = false;
  mark(-1);
  if (lv) changed();
}

async function moveBot(from, to, ms = 380, hop = true) {
  const dx = to.x - from.x;
  await tween(ms, (k) => {
    const e = hop ? ease(k) : k;
    const lift = hop ? Math.sin(k * Math.PI) * 7 : 0;
    placeBot(from.x + (to.x - from.x) * e, from.y + (to.y - from.y) * e, lift, hop ? dx * 7 * Math.sin(k * Math.PI) : 0);
  });
}

// the key flies up and the gates swing down out of the way
function collectKey() {
  sfx.key();
  const kg = $('keyG');
  tween(450, (k) => {
    kg.style.transform = `translateY(${-40 * k}px) scale(${1 + k * 0.5})`;
    kg.style.opacity = 1 - k;
  });
  sparkle(lv.key.x * 100 + 50, lv.key.y * 100 + 50, '#ffd36b');
  lv.gates.forEach((_, i) => {
    const g = $(`gate${i}`);
    tween(500, (k) => {
      g.style.transform = `scaleY(${1 - k * 0.92})`;
      g.style.opacity = 1 - k * 0.7;
    });
  });
}

async function bump(at, dir) {
  const [dx, dy] = STEP[dir];
  sfx.step(dir);
  await tween(200, (k) => placeBot(at.x + dx * 0.3 * k, at.y + dy * 0.3 * k));
  face({ eyes: 'dizzy' });
  sfx.bump();
  await tween(260, (k) => placeBot(at.x + dx * 0.3 * (1 - k), at.y + dy * 0.3 * (1 - k), 0, Math.sin(k * Math.PI * 3) * 8));
}

async function resetBot() {
  const bot = $('bot');
  await tween(180, (k) => bot.setAttribute('opacity', 1 - k));
  placeBot(lv.start.x, lv.start.y);
  face();
  lv.stars.forEach((_, i) => {
    const s = $(`star${i}`);
    s.style.transform = '';
    s.style.opacity = '';
  });
  for (const el of [$('keyG'), ...lv.gates.map((_, i) => $(`gate${i}`))]) {
    if (!el) continue;
    el.style.transform = '';
    el.style.opacity = '';
  }
  await tween(180, (k) => bot.setAttribute('opacity', k));
}

function collectStar(i) {
  sfx.star();
  const s = $(`star${i}`);
  tween(400, (k) => {
    s.style.transform = `translateY(${-30 * k}px) scale(${1 + k * 0.6})`;
    s.style.opacity = 1 - k;
  });
  const st = lv.stars[i];
  sparkle(st.x * 100 + 50, st.y * 100 + 50, '#ffd36b');
}

function sparkle(cx, cy, color) {
  const fx = $('fx');
  for (let j = 0; j < 8; j++) {
    const a = (j / 8) * Math.PI * 2;
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('r', 6);
    c.setAttribute('fill', j % 2 ? '#fff' : color);
    fx.append(c);
    tween(500, (k) => {
      c.setAttribute('cx', cx + Math.cos(a) * 55 * k);
      c.setAttribute('cy', cy + Math.sin(a) * 55 * k);
      c.setAttribute('opacity', 1 - k);
    }).then(() => c.remove());
  }
}

async function win(sim, id) {
  face({ eyes: 'happy' });
  sfx.win();
  sparkle(lv.goal.x * 100 + 50, lv.goal.y * 100 + 50, '#7ccf6a');
  confetti();
  const g = lv.goal;
  for (let h = 0; h < 2; h++) await tween(300, (k) => placeBot(g.x, g.y, Math.sin(k * Math.PI) * 22));
  if (id !== runId) return;
  const got = countBits(sim.mask);
  const i = lv.index;
  saveBest(i, got);
  guided = false;
  running = false;
  mark(-1);
  changed();
  const last = i === levels.length - 1;
  const total = lv.stars.length;
  $('winBot').innerHTML = A.robot({ eyes: 'happy' });
  $('winTitle').textContent = t(last ? 'win.final' : total && got === total ? 'win.all' : 'win.title');
  $('winStars').innerHTML = lv.stars
    .map((_, j) => `<span class="${j < got ? '' : 'off'}" style="animation-delay:${0.2 + j * 0.2}s">⭐</span>`)
    .join('');
  $('nextBtn').onclick = () => (last ? showTitle() : startLevel(i + 1));
  $('againBtn').onclick = () => startLevel(i);
  await wait(250);
  if (id === runId) $('win').hidden = false;
}

function mark(i) {
  document.querySelectorAll('.pcard').forEach((el, j) => el.classList.toggle('now', j === i));
}
const cardEl = (i) => $('program').children[i];

// ---------- hints ----------
// Points at the next thing to do: a card to add, a placed card to tap for more steps,
// ⌫ when a card bumps (that card shakes) or the plan no longer fits, or ▶ when it is ready.
function hintTarget() {
  const sim = simulate(lv, program);
  if (sim.result === 'bump') return { el: $('undoBtn'), shake: cardEl(sim.card) };
  if (sim.result === 'win') return { el: runBtn };
  const p = plan(lv, sim.end);
  if (!p || !p.moves.length) return { el: runBtn };
  if (p.cards > lv.slots - program.length) return { el: $('undoBtn') };
  const next = p.moves[0];
  const last = program[program.length - 1];
  if (last && last.dir === next && last.n < lv.maxRep) return { el: cardEl(program.length - 1) };
  return { el: $('palette').querySelector(`[data-dir="${next}"]`) };
}

function showHint(timed = true) {
  if (running || !lv) return;
  const h = hintTarget();
  if (!h.el) return;
  if (h.shake && timed) shake(h.shake);
  pointAt(h.el, timed ? 2600 : 0);
}

function pointAt(el, ms) {
  handTarget = el;
  clearTimeout(handTimer);
  placeHand();
  if (ms) handTimer = setTimeout(hideHand, ms);
}
function placeHand() {
  if (!handTarget) return;
  const r = handTarget.getBoundingClientRect();
  const hand = $('hand');
  hand.style.left = `${r.left + r.width / 2 - 20}px`;
  hand.style.top = `${r.top + r.height * 0.45}px`;
  hand.hidden = false;
}
function hideHand() {
  handTarget = null;
  clearTimeout(handTimer);
  $('hand').hidden = true;
}

// ---------- little helpers ----------
function shake(el) {
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
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
$('playBtn').onclick = () => {
  unlock();
  startLevel(frontier());
};
$('levelsBtn').onclick = showTitle;
$('undoBtn').onclick = undo;
runBtn.onclick = run;
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
window.addEventListener('resize', placeHand);
window.addEventListener('pointerdown', unlock, { once: true });

function showLang() {
  for (const b of document.querySelectorAll('.langs button')) b.setAttribute('aria-pressed', b.dataset.lang === lang);
  const corner = $('cornerBtn');
  corner.href = `../../?lang=${lang}`;
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

// offline support: only in the built game (the dev server would cache stale code)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
