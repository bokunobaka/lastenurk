// Rong Tuut: tap track pieces to turn them until the track runs from the start station to the goal,
// then press ▶. The train picks up the animal friends waiting by the track on the way.
// Screens: title (level grid) -> play -> win.
import './style.css';
import * as A from './art.js';
import { LEVELS, parse, route, wrongPiece, tap, riderSpot, STEP, OPP } from './levels.js';
import { t, lang, setLang, applyText } from './i18n.js';
import { sfx, unlock, isMuted, toggleMute } from './sound.js';

const $ = (id) => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
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
const SAVE = 'rongTuut.done';
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
// the first level not yet finished (every level up to it is open)
function frontier() {
  let i = 0;
  while (i < LEVELS.length - 1 && done[i]) i++;
  return i;
}

// ---------- state ----------
let lv = null; // the level being played (a fresh copy each time: pieces get turned)
let running = false;
let runId = 0; // bumped to cancel a run in progress
let fails = 0;
let guided = false; // the first level keeps the pointing hand on screen
let wasJoined = false;
let handTarget = null;
let handTimer = 0;
const angle = new Map(); // shown rotation of each piece in degrees (keeps growing, so turns animate forward)

const board = $('board');
const playEl = $('play');
const runBtn = $('runBtn');
const SPACING = 64; // distance between train cars along the track

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
  LEVELS.forEach((_, i) => {
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

$('heroTrain').innerHTML =
  `<g transform="translate(-54 0)">${A.wagon(1, `<g transform="translate(0 -14) scale(.85)">${A.ANIMALS.bear()}</g>`)}</g>` +
  `<g transform="translate(10 0)">${A.wagon(0, `<g transform="translate(0 -14) scale(.85)">${A.ANIMALS.bunny()}</g>`)}</g>` +
  `<g transform="translate(76 0)">${A.engine()}</g>`;

// ---------- play screen ----------
function startLevel(i) {
  stopRun();
  hideHand();
  lv = parse(LEVELS[i], i);
  fails = 0;
  guided = lv.tip === 'tip.first';
  wasJoined = false;
  $('title').hidden = true;
  $('win').hidden = true;
  playEl.hidden = false;
  $('badge').textContent = i + 1;
  clearTimeout(toastTimer);
  $('tip').classList.remove('say');
  $('tip').textContent = t(lv.tip || 'tip.go');
  $('hintBtn').classList.remove('glow');
  renderBoard();
  changed();
}

const DEG = { E: 0, S: 90, W: 180, N: 270 };
const tileXY = (x, y) => `translate(${x * 100} ${y * 100})`;

function renderBoard() {
  const W = lv.W * 100, H = lv.H * 100;
  board.setAttribute('viewBox', `-6 -8 ${W + 12} ${H + 22}`);
  let s = `<defs><clipPath id="clip"><rect width="${W}" height="${H}" rx="26"/></clipPath></defs>
    <rect y="8" width="${W}" height="${H}" rx="26" fill="#8fcf74"/><g clip-path="url(#clip)">`;
  for (let y = 0; y < lv.H; y++)
    for (let x = 0; x < lv.W; x++) s += `<g transform="${tileXY(x, y)}">${A.grass((x + y) % 2 === 1, x * 7 + y * 3 + lv.index)}</g>`;
  for (const sc of lv.scenery) if (sc.ch === '~') s += `<g transform="${tileXY(sc.x, sc.y)}">${A.pond()}</g>`;
  s += '</g>';
  const art = { T: A.tree, R: A.rock, f: A.flowers };
  for (const sc of lv.scenery) if (art[sc.ch]) s += `<g transform="${tileXY(sc.x, sc.y)}">${art[sc.ch]()}</g>`;

  // stations: the building sits back from the track stub
  for (const [st, roof, flag, id] of [[lv.start, '#ff7a7a', false, 'stStart'], [lv.goal, '#ffb15c', true, 'stGoal']]) {
    const [dx, dy] = STEP[st.dir];
    s += `<g transform="${tileXY(st.x, st.y)}">
      <g transform="translate(${50 - dx * 22} ${50 - dy * 22}) scale(.6) translate(-50 -50)">${A.station(roof, flag)}</g>
      <g id="${id}" transform="rotate(${DEG[st.dir]} 50 50)">${A.stub()}</g></g>`;
  }

  angle.clear();
  for (const p of lv.pieces.values()) {
    const k = `${p.x},${p.y}`;
    angle.set(k, (p.rot || 0) * 90);
    s += `<g class="tile ${p.fixed ? 'fixed' : 'turn'}" data-k="${k}" transform="${tileXY(p.x, p.y)}">${pieceInner(p)}</g>`;
  }

  lv.riders.forEach((r, i) => {
    const [cx, cy] = riderSpot(lv.pieces.get(`${r.x},${r.y}`));
    r.kind = A.ANIMAL_ORDER[(lv.index + i) % A.ANIMAL_ORDER.length];
    r.home = [r.x * 100 + cx, r.y * 100 + cy];
    s += `<g class="rider" id="rider${i}" transform="translate(${r.home[0]} ${r.home[1]}) scale(.95)">${A.waiting(r.kind)}</g>`;
  });

  // tunnel hills go above the train, so it drives out of sight
  s += '<g id="train"></g><g id="over">';
  for (const p of lv.pieces.values())
    if (p.look === 'tunnel') s += `<g transform="${tileXY(p.x, p.y)}">${A.hill(p.rot % 2 ? 'EW' : 'NS')}</g>`;
  s += '</g><g id="fx"></g>';
  board.innerHTML = s;
  for (const g of board.querySelectorAll('.tile.turn')) g.addEventListener('pointerdown', () => turnPiece(g.dataset.k));
  buildTrain();
}

function pieceInner(p) {
  if (p.type === 'Y') {
    // both branches drawn; the one the train will take on top, the other one faded
    const br = (name) => `<g class="branch${p.set === name ? '' : ' off'}">${railsBetween(p.stem, p[name])}</g>`;
    const other = p.set === 'a' ? 'b' : 'a';
    return A.switchPlate() + br(other) + br(p.set);
  }
  const inner = (p.look === 'bridge' ? A.bridgeDeck() : '') + (p.type === 'D' ? A.doubleRails() : A.rails(p.type));
  return `${p.look === 'bridge' ? '' : A.plate(p.fixed)}<g class="spin" transform="rotate(${p.rot * 90} 50 50)">${inner}</g>`;
}

// the rails joining two sides of a tile: a straight piece or a curve, turned to fit
function railsBetween(s1, s2) {
  const D = ['N', 'E', 'S', 'W'];
  if (OPP[s1] === s2) return `<g transform="rotate(${s1 === 'N' || s1 === 'S' ? 0 : 90} 50 50)">${A.rails('I')}</g>`;
  const r = [0, 1, 2, 3].find((k) => {
    const pair = [D[k], D[(k + 1) % 4]];
    return pair.includes(s1) && pair.includes(s2);
  });
  return `<g transform="rotate(${r * 90} 50 50)">${A.rails('L')}</g>`;
}

function buildTrain() {
  const g = $('train');
  let s = '';
  for (let i = lv.riders.length - 1; i >= 0; i--) s += `<g id="car${i}" opacity="0"><g class="flip">${A.wagon(i)}</g></g>`;
  s += `<g id="loco"><g class="flip">${A.engine()}</g></g>`;
  g.innerHTML = s;
  const c = center(lv.start.x, lv.start.y);
  const [dx] = STEP[lv.start.dir];
  placeCar($('loco'), c[0], c[1], dx < 0 ? -1 : 1);
}

function placeCar(el, x, y, face) {
  el.setAttribute('transform', `translate(${x.toFixed(1)} ${(y - 12).toFixed(1)})`);
  el.firstElementChild.setAttribute('transform', `scale(${face} 1)`);
}

// ---------- turning pieces ----------
function turnPiece(k) {
  unlock();
  if (running) return;
  const p = lv.pieces.get(k);
  if (!p || p.fixed) return;
  tap(p);
  if (p.type === 'Y') {
    const g = board.querySelector(`.tile[data-k="${k}"]`);
    g.innerHTML = pieceInner(p);
    sfx.flip();
    changed();
    return;
  }
  const from = angle.get(k), to = from + 90;
  angle.set(k, to);
  const spin = board.querySelector(`.tile[data-k="${k}"] .spin`);
  tween(170, (q) => spin.setAttribute('transform', `rotate(${from + (to - from) * (1 - (1 - q) ** 3)} 50 50)`));
  sfx.turn();
  changed();
}

// lights up the track that already joins the start station, and readies ▶ when it reaches the goal
function changed() {
  const r = route(lv);
  const lit = new Set(r.tiles.map((x) => `${x.x},${x.y}`));
  for (const g of board.querySelectorAll('.tile')) g.classList.toggle('lit', lit.has(g.dataset.k));
  $('stStart').classList.add('lit');
  $('stGoal').classList.toggle('lit', r.result === 'win');
  const joined = r.result === 'win';
  if (joined && !wasJoined) sfx.joined();
  wasJoined = joined;
  runBtn.innerHTML = A.svg(running ? A.stopButton() : A.playButton());
  runBtn.classList.toggle('ready', joined && !running);
  playEl.classList.toggle('locked', running);
  hideHand();
  if (guided && !running) requestAnimationFrame(() => showHint(false));
}

// ---------- the train ride ----------
const center = (x, y) => [x * 100 + 50, y * 100 + 50];
const EDGE = { N: [50, 0], E: [100, 50], S: [50, 100], W: [0, 50] };
const edge = (x, y, d) => [x * 100 + EDGE[d][0], y * 100 + EDGE[d][1]];

// the route as a dense line of points, with the distance along it
function trackLine(r) {
  const pts = [];
  const add = (p) => pts.push(p);
  const line = (a, b, n = 10) => {
    for (let i = 1; i <= n; i++) add([a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n]);
  };
  const st = lv.start;
  add(center(st.x, st.y));
  line(center(st.x, st.y), edge(st.x, st.y, st.dir), 5);
  const marks = new Map(); // tile -> distance index at its middle
  for (const tl of r.tiles) {
    const a = edge(tl.x, tl.y, tl.from), b = edge(tl.x, tl.y, tl.to);
    if (STEP[tl.from][0] === -STEP[tl.to][0] && STEP[tl.from][1] === -STEP[tl.to][1]) {
      line(a, b, 12);
    } else {
      // a quarter circle around the corner both sides share
      const cx = tl.x * 100 + (tl.from === 'E' || tl.to === 'E' ? 100 : 0);
      const cy = tl.y * 100 + (tl.from === 'S' || tl.to === 'S' ? 100 : 0);
      const a0 = Math.atan2(a[1] - cy, a[0] - cx);
      let a1 = Math.atan2(b[1] - cy, b[0] - cx);
      if (a1 - a0 > Math.PI) a1 -= 2 * Math.PI;
      if (a0 - a1 > Math.PI) a1 += 2 * Math.PI;
      for (let i = 1; i <= 12; i++) {
        const an = a0 + ((a1 - a0) * i) / 12;
        add([cx + Math.cos(an) * 50, cy + Math.sin(an) * 50]);
      }
    }
    marks.set(`${tl.x},${tl.y}`, pts.length - 7);
  }
  if (r.result === 'win') line(edge(lv.goal.x, lv.goal.y, r.from), center(lv.goal.x, lv.goal.y), 6);
  const dist = [0];
  for (let i = 1; i < pts.length; i++) dist.push(dist[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const markDist = new Map([...marks].map(([k, i]) => [k, dist[i]]));
  return { pts, dist, total: dist[dist.length - 1], markDist };
}

function pointAt(L, s) {
  s = Math.max(0, Math.min(L.total, s));
  let i = 1;
  while (i < L.dist.length - 1 && L.dist[i] < s) i++;
  const d0 = L.dist[i - 1], d1 = L.dist[i];
  const k = d1 > d0 ? (s - d0) / (d1 - d0) : 0;
  const a = L.pts[i - 1], b = L.pts[i];
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, b[0] - a[0]];
}

async function run() {
  unlock();
  if (running) {
    stopRun();
    await resetTrain();
    return;
  }
  running = true;
  const id = ++runId;
  changed();
  const r = route(lv);
  const L = trackLine(r);
  const cars = [$('loco'), ...lv.riders.map((_, i) => $(`car${i}`))];
  const faces = cars.map(() => (STEP[lv.start.dir][0] < 0 ? -1 : 1));
  const boarded = [];
  const waitingAt = lv.riders.map((rd) => L.markDist.get(`${rd.x},${rd.y}`) ?? Infinity);
  sfx.whistle();
  await wait(450);
  const speed = 0.2; // units per ms
  let s = 0, last = performance.now(), nextChuff = 0, nextPuff = 0;
  await new Promise((resolve) => {
    const frame = (now) => {
      if (id !== runId) return resolve();
      const dt = Math.min(50, now - last);
      last = now;
      s = Math.min(L.total, s + speed * dt * Math.min(1, 0.35 + s / 120));
      cars.forEach((el, i) => {
        const cs = s - i * SPACING;
        const [x, y, dx] = pointAt(L, cs);
        if (dx > 0.3) faces[i] = 1;
        else if (dx < -0.3) faces[i] = -1;
        placeCar(el, x, y, faces[i]);
        if (i > 0) el.setAttribute('opacity', Math.max(0, Math.min(1, (cs + 30) / 30)));
      });
      if (s >= nextChuff) {
        sfx.chuff(0, 0.07);
        nextChuff += 70;
      }
      if (s >= nextPuff) {
        const [x, y] = pointAt(L, s);
        smoke(x + faces[0] * 17, y - 46);
        nextPuff += 40;
      }
      lv.riders.forEach((rd, i) => {
        if (!boarded.includes(i) && s >= waitingAt[i]) {
          boarded.push(i);
          board_(rd, boarded.length - 1);
        }
      });
      if (s >= L.total) resolve();
      else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
  if (id !== runId) return;
  if (r.result === 'win') return win(id, boarded.length);

  // the track ran out: a puff, the next piece wiggles, then back to the station
  sfx.stop();
  const [x, y] = pointAt(L, L.total);
  for (let i = 0; i < 5; i++) smoke(x + faces[0] * 20 + (Math.random() - 0.5) * 30, y - 20 + (Math.random() - 0.5) * 20, 1.6);
  const nx = r.at.x + STEP[r.at.dir][0], ny = r.at.y + STEP[r.at.dir][1];
  const next = board.querySelector(`.tile[data-k="${nx},${ny}"]`);
  if (next) wiggle(next);
  toast(t('oops.stop'));
  await wait(1500);
  if (id !== runId) return;
  fails++;
  if (fails >= 2) $('hintBtn').classList.add('glow');
  stopRun();
  await resetTrain();
}

// an animal hops from its spot into the next wagon
function board_(rd, seat) {
  sfx.board();
  const el = $(`rider${rd.i}`);
  const car = $(`car${seat}`);
  const [hx, hy] = rd.home;
  tween(380, (k) => {
    el.setAttribute('transform', `translate(${hx} ${hy - Math.sin(k * Math.PI) * 40}) scale(${0.95 - k * 0.5})`);
    el.setAttribute('opacity', 1 - k);
  }).then(() => {
    const riderG = car.querySelector('.rider');
    riderG.innerHTML = `<g transform="translate(0 -12) scale(.8)">${A.ANIMALS[rd.kind]()}</g>`;
    riderG.animate([{ transform: 'scale(0.2)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }], { duration: 300 });
  });
}

function stopRun() {
  runId++;
  running = false;
  if (lv) changed();
}

async function resetTrain() {
  const tr = $('train');
  await tween(200, (k) => tr.setAttribute('opacity', 1 - k));
  buildTrain();
  lv.riders.forEach((rd, i) => {
    const el = $(`rider${i}`);
    el.setAttribute('transform', `translate(${rd.home[0]} ${rd.home[1]}) scale(.95)`);
    el.setAttribute('opacity', 1);
  });
  await tween(200, (k) => tr.setAttribute('opacity', k));
}

function smoke(x, y, big = 1) {
  const fx = $('fx');
  const c = document.createElementNS(NS, 'circle');
  c.setAttribute('fill', '#fff');
  fx.append(c);
  const drift = (Math.random() - 0.5) * 16;
  tween(900, (k) => {
    c.setAttribute('cx', x + drift * k);
    c.setAttribute('cy', y - 40 * k);
    c.setAttribute('r', (5 + 9 * k) * big);
    c.setAttribute('opacity', 0.85 * (1 - k));
  }).then(() => c.remove());
}

function wiggle(g) {
  // remember the resting position, so a second wiggle never starts from a tilted one
  const base = (g.dataset.base ||= g.getAttribute('transform'));
  tween(600, (k) => g.setAttribute('transform', `${base} rotate(${Math.sin(k * Math.PI * 6) * 6 * (1 - k)} 50 50)`)).then(() =>
    g.setAttribute('transform', base)
  );
}

async function win(id, got) {
  sfx.win();
  sfx.whistle();
  confetti();
  const tr = $('train');
  for (let h = 0; h < 2; h++)
    await tween(280, (k) => tr.setAttribute('transform', `translate(0 ${-Math.sin(k * Math.PI) * 10})`));
  tr.removeAttribute('transform');
  if (id !== runId) return;
  const i = lv.index;
  saveDone(i);
  guided = false;
  running = false;
  changed();
  const last = i === LEVELS.length - 1;
  // the win card shows the train with everyone who got on
  const n = lv.riders.length;
  let pic = '';
  for (let j = n - 1; j >= 0; j--) {
    const rd = lv.riders[j];
    const rider = j < got ? `<g transform="translate(0 -12) scale(.8)">${A.ANIMALS[rd.kind]()}</g>` : '';
    pic += `<g transform="translate(${(n * SPACING) / 2 - (j + 1) * SPACING} 0)">${A.wagon(j, rider)}</g>`;
  }
  pic += `<g transform="translate(${(n * SPACING) / 2} 0)">${A.engine({ happy: true })}</g>`;
  $('winTrain').setAttribute('viewBox', `${-(n * SPACING) / 2 - 36} -50 ${n * SPACING + 86} 80`);
  $('winTrain').innerHTML = pic;
  $('winTitle').textContent = t(last ? 'win.final' : 'win.title');
  $('nextBtn').onclick = () => (last ? showTitle() : startLevel(i + 1));
  $('againBtn').onclick = () => startLevel(i);
  await wait(300);
  if (id === runId) $('win').hidden = false;
}

// ---------- hints ----------
// points at the first piece on the way that is turned wrong, or at ▶ when the track is ready
function showHint(timed = true) {
  if (running || !lv) return;
  const p = wrongPiece(lv);
  const el = p ? board.querySelector(`.tile[data-k="${p.x},${p.y}"]`) : runBtn;
  if (timed && p) wiggle(el);
  pointAt_(el, timed ? 2600 : 0);
}

function pointAt_(el, ms) {
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
if (q.has('level')) startLevel(Math.max(0, Math.min(LEVELS.length - 1, Number(q.get('level')) - 1)));
else showTitle();

// offline support: only in the built game (the dev server would cache stale code)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
