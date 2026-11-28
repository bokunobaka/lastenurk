// Põrr-auto: tilt the tablet (or drag a finger) to steer a little car up a winding road to somewhere nice.
// Collect stars, drive around cones and rocks, jump off ramps, mind the ducks and cows, honk at slow cars.
// Screens: title -> drive -> win. Everything on the road is drawn on a canvas each frame (src/art.js);
// the roads come from src/track.js, steering by tilt from src/tilt.js.
import './style.css';
import * as A from './art.js';
import { LEVELS } from './levels.js';
import { build, CAR_W, CAR_L, SIDE, SIZE, HAZARD } from './track.js';
import { t, lang, setLang, applyText } from './i18n.js';
import { sfx, unlock, isMuted, toggleMute, engine } from './sound.js';
import * as tilt from './tilt.js';

const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const near = (k, dt) => 1 - Math.exp(-dt * k); // smoothing that does not depend on the frame rate

// ---------- saved: best stars (1-3) per level, the car colour ----------
const SAVE = 'porr-auto.best';
const COLOR = 'porr-auto.color';
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
let best = load(SAVE, {});
let colorI = clamp(Number(load(COLOR, 0)) || 0, 0, A.CAR_COLORS.length - 1);
const carColor = () => A.CAR_COLORS[colorI];
function frontier() {
  let i = 0;
  while (i < LEVELS.length - 1 && best[i]) i++;
  return i;
}

// ---------- state ----------
const DUCK_SPEED = 110, COW_SPEED = 70, SLOW = 0.45; // slow cars drive at 45% of our speed
let li = 0;
let T = null; // the built road
let items = []; // the road's things, with their own state
let car = null; // { x, y, vx, speed, air, bump, slow, wob }
let phase = 'off'; // ready -> drive -> arrive -> done
let readyT = 0;
let clock = 0;
let got = 0;
let combo = 0, comboT = 0;
let fx = []; // particles
let camX = 0, camY = 0;
let finger = null; // { id, x: world x } while a finger steers
const keys = { left: 0, right: 0 };
let paused = false;
let stuckT = 0; // how long a slow car has held us up
let rumbleT = 0;
let tipTimer = 0;

const playEl = $('play');
const canvas = $('road');
const ctx = canvas.getContext('2d');
const dark = document.createElement('canvas'); // the night: darkness with holes for the lights
const dctx = dark.getContext('2d');
let cw = 0, ch = 0, dpr = 1, scale = 1, carSY = 0;

function resize() {
  dpr = Math.min(2, devicePixelRatio || 1);
  cw = innerWidth;
  ch = innerHeight;
  canvas.width = dark.width = Math.round(cw * dpr);
  canvas.height = dark.height = Math.round(ch * dpr);
  scale = Math.min(ch / 1250, cw / 700);
  carSY = ch * 0.76;
}
const sx = (x) => cw / 2 + (x - camX) * scale;
const sy = (y) => carSY - (y - camY) * scale;
const worldX = (clientX) => camX + (clientX - cw / 2) / scale;

// ---------- title screen ----------
function showTitle() {
  phase = 'off';
  engine(0);
  playEl.hidden = true;
  $('win').hidden = true;
  $('title').hidden = false;
  $('hero').innerHTML = A.carSide(carColor());
  renderColors();
  renderGrid();
}

function renderColors() {
  const box = $('colors');
  box.innerHTML = '';
  A.CAR_COLORS.forEach((c, i) => {
    const b = document.createElement('button');
    b.style.background = c;
    b.setAttribute('aria-pressed', i === colorI);
    b.setAttribute('aria-label', `${t('aria.color')} ${i + 1}`);
    b.onclick = () => {
      unlock();
      colorI = i;
      store(COLOR, i);
      sfx.honk();
      $('hero').innerHTML = A.carSide(carColor());
      renderColors();
    };
    box.append(b);
  });
}

function renderGrid() {
  const grid = $('levelGrid');
  grid.innerHTML = '';
  const open = frontier();
  LEVELS.forEach((l, i) => {
    const b = document.createElement('button');
    b.className = 'lvl';
    let mark = '';
    if (best[i]) {
      b.classList.add('done');
      mark = '★'.repeat(best[i]);
    } else if (i === open) b.classList.add('next');
    if (i > open) {
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

// ---------- a drive ----------
function startLevel(i) {
  li = i;
  T = build(LEVELS[i]);
  items = T.items.map((it) => ({ ...it, gone: false, off: it.x - T.roadX(it.y), cool: 0, hurry: 0 }));
  car = { x: 0, y: 0, vx: 0, speed: 0, air: 0, bump: 0, slow: 0, wob: 0 };
  got = 0;
  combo = 0;
  fx = [];
  camX = 0;
  camY = 0;
  clock = 0;
  stuckT = 0;
  phase = 'ready';
  readyT = 1.2;
  finger = null;
  $('title').hidden = true;
  $('win').hidden = true;
  playEl.hidden = false;
  $('honkBtn').classList.remove('on');
  $('count').textContent = '⭐ 0';
  say(t('ui.go', { to: t(`to.${T.lv.to}`) }), 2600, () => say(t(T.lv.tip), 4500));
  resize();
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
    engine(0);
    return;
  }
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!paused) update(dt);
  draw();
  requestAnimationFrame(frame);
}

// ---------- moving ----------
function steerTarget() {
  if (phase === 'arrive') return clamp((T.roadX(car.y) - car.x) * 3, -SIDE, SIDE);
  if (phase !== 'drive') return 0;
  if (finger) return clamp((finger.x - car.x) * 5, -SIDE, SIDE);
  if (keys.left || keys.right) return (keys.right - keys.left) * SIDE;
  if (autopilot) return autopilot();
  return tilt.steer() * SIDE;
}

function update(dt) {
  clock += dt;
  if (phase === 'ready' && (readyT -= dt) <= 0) {
    phase = 'drive';
    tilt.calibrate();
    sfx.go();
  }

  // sideways: snow is slippery (the car takes long to answer the steering)
  const grip = T.lv.slip ? 2.4 : 11;
  car.vx += (steerTarget() - car.vx) * near(grip, dt);
  car.x += car.vx * dt;
  const mid = T.roadX(car.y);
  const lim = T.half + 100;
  if (Math.abs(car.x - mid) > lim) {
    car.x = mid + Math.sign(car.x - mid) * lim;
    car.vx = 0;
  }
  const grass = car.air <= 0 && Math.abs(car.x - mid) > T.half - CAR_W * 0.3;

  // forward
  let want = phase === 'drive' ? T.speed : 0;
  if (grass) want *= 0.55;
  if (car.bump > 0) (car.bump -= dt), (want *= 0.25);
  if (car.slow > 0) (car.slow -= dt), (want *= 0.7);
  if (phase === 'arrive') want = Math.max(0, (T.length + 300 - car.y) * 1.5);
  car.speed += (want - car.speed) * near(want < car.speed ? 5 : 1.6, dt);
  car.y += car.speed * dt;
  car.wob = Math.max(0, car.wob - dt);

  if (car.air > 0 && (car.air -= dt) <= 0) {
    sfx.land();
    puff(car.x, car.y - 40, 8, '#d9c7a8');
  }
  if (grass && car.speed > 60 && (rumbleT -= dt) <= 0) {
    rumbleT = 0.16;
    sfx.rumble();
    puff(car.x + (Math.random() - 0.5) * 50, car.y - 60, 1, T.lv.theme === 'snow' ? '#fff' : '#cdb48c');
  }
  if ((comboT -= dt) <= 0) combo = 0;

  if (phase === 'drive' && car.y >= T.length) {
    phase = 'arrive';
    sfx.honk();
    for (let k = 0; k < 4; k++) burst(T.roadX(T.length) + (k - 1.5) * 120, T.length + 180, 10, ['#ffd43b', '#ff6b9a', '#74c0fc', '#8ce99a'][k], 420);
  }
  if (phase === 'arrive' && car.speed < 10 && car.y > T.length + 200) {
    phase = 'done';
    setTimeout(win, 600);
  }
  engine(phase === 'drive' || phase === 'arrive' ? 0.12 + (car.speed / T.speed) * 0.88 : phase === 'ready' ? 0.05 : 0);

  for (const it of items) if (!it.gone && Math.abs(it.y - car.y) < 1400) thing(it, dt);
  for (const p of fx) {
    p.life += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 1 - near(2, dt);
    p.vy *= 1 - near(2, dt);
  }
  fx = fx.filter((p) => p.life < p.max);

  camY = Math.min(car.y, T.length + 250);
  const ahead = T.roadX(Math.min(car.y + 350, T.length + 300));
  camX += (ahead * 0.55 + car.x * 0.45 - camX) * near(3, dt);
  hud();
}

// one thing on the road: let it move, and see whether the car touches it
function thing(it, dt) {
  it.cool = Math.max(0, it.cool - dt);
  const k = it.kind;
  if (it.fly) {
    const f = it.fly;
    f.t += dt;
    it.x += f.vx * dt;
    it.y += f.vy * dt;
    f.z = Math.max(0, f.z + f.vz * dt);
    f.vz -= (k === 'duck' ? 300 : 1800) * dt;
    if (f.t > 1.4) it.gone = true;
    return;
  }

  // crossing animals start walking when the car comes near; a honk hurries them
  if (k === 'duck' || k === 'cow') {
    if (car.y > it.y - 850) {
      it.hurry = Math.max(0, it.hurry - dt);
      it.x += it.dir * (k === 'duck' ? DUCK_SPEED : COW_SPEED) * (it.hurry > 0 ? 2.6 : 1) * dt;
      it.walking = true;
      if (Math.abs(it.x - T.roadX(it.y)) > T.half + 260 && Math.sign(it.x - T.roadX(it.y)) === it.dir) it.gone = true;
    }
  }
  // a slow car drives along its lane; a honk sends it to the side
  if (k === 'car') {
    if (car.y > it.y - 900 && it.y < T.length - 350) it.y += T.speed * SLOW * dt;
    if (it.y >= T.length - 350) it.goal = Math.sign(it.off || 1) * (T.half + 70);
    if (it.goal != null) it.off += (it.goal - it.off) * near(2.5, dt);
    it.x = T.roadX(it.y) + it.off;
    if (it.y < car.y - 1500) it.gone = true;
  }

  const dx = it.x - car.x, dy = it.y - car.y;
  if (Math.abs(dy) > 160) return;
  const touch = (r, along = 0.7) => Math.abs(dx) < CAR_W / 2 + r && Math.abs(dy) < CAR_L / 2 + r * along;

  if (k === 'star') {
    if (touch(30, 1)) {
      it.gone = true;
      got++;
      sfx.star(combo++);
      comboT = 1.6;
      burst(it.x, it.y + 26, 12, '#ffd43b', 260);
      const c = $('count');
      c.textContent = `⭐ ${got}`;
      c.classList.remove('pop');
      void c.offsetWidth;
      c.classList.add('pop');
    }
    return;
  }
  if (car.air > 0) return; // up in the air over everything else

  if (HAZARD.includes(k) && it.cool <= 0 && touch(SIZE[k] * 0.8)) {
    bump(Math.sign(-dx) || 1);
    if (k === 'cone') {
      it.fly = { t: 0, vx: Math.sign(dx || 1) * 220 + car.vx * 0.5, vy: car.speed * 0.8 + 120, vz: 700, z: 0 };
      sfx.boing();
    } else if (k === 'snowman') {
      it.gone = true;
      sfx.poof();
      burst(it.x, it.y + 50, 22, '#fff', 300);
      burst(it.x, it.y + 70, 3, '#ff8c1a', 200);
    } else it.cool = 1;
  } else if (k === 'puddle' && !it.used && touch(SIZE.puddle * 0.7, 0.5)) {
    it.used = true;
    car.slow = 0.4;
    sfx.splash();
    for (let j = 0; j < 22; j++) {
      const a = Math.random() * Math.PI * 2, sp = 150 + Math.random() * 260;
      fx.push({ x: it.x, y: it.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.6 + car.speed * 0.3, life: 0, max: 0.6, r: 6 + Math.random() * 6, color: '#74c0fc', z: 1 });
    }
  } else if (k === 'ramp' && !it.used && Math.abs(dx) < 62 && dy < 30 && dy > -40) {
    it.used = true;
    car.air = 0.95;
    sfx.jump();
  } else if (k === 'duck' && it.cool <= 0) {
    for (let j = 0; j < it.n; j++) {
      const ddx = it.x - it.dir * j * 46 - car.x;
      if (Math.abs(ddx) < CAR_W / 2 + 18 && Math.abs(dy) < CAR_L / 2 + 18) {
        // the ducks flap up and away, quacking
        it.fly = { t: 0, vx: it.dir * 260, vy: 160, vz: 420, z: 0 };
        sfx.quack();
        sfx.quack(0.3);
        car.bump = 0.35;
        burst(it.x, it.y + 30, 8, '#fff3a6', 200);
        break;
      }
    }
  } else if (k === 'cow' && it.cool <= 0 && touch(46, 0.5)) {
    it.cool = 1.5;
    it.hurry = 2;
    sfx.moo();
    car.speed = 0;
    car.bump = 0.6;
    car.wob = 0.6;
    car.y = Math.min(car.y, it.y - CAR_L / 2 - 30);
  } else if (k === 'car' && Math.abs(dx) < CAR_W + 4 && dy > 0 && dy < CAR_L + 12) {
    // behind a slow car: we have to wait (or honk)
    car.y = it.y - CAR_L - 12;
    car.speed = Math.min(car.speed, T.speed * SLOW);
    stuckT += dt;
    if (stuckT > 1.2) $('honkBtn').classList.add('on');
  }
}

function bump(dir) {
  car.bump = 0.6;
  car.wob = 0.6;
  car.vx = dir * 320;
  combo = 0;
  sfx.bonk();
}

function honk() {
  unlock();
  sfx.honk();
  $('honkBtn').classList.remove('on');
  stuckT = 0;
  if (!car || phase === 'off') return;
  for (let k = 0; k < 4; k++) fx.push({ x: car.x + (k - 1.5) * 18, y: car.y + 80, vx: (k - 1.5) * 60, vy: 260, life: 0, max: 0.7, r: 9, color: '#fff', note: true });
  for (const it of items) {
    if (it.gone || it.y < car.y || it.y > car.y + 1000) continue;
    if (it.kind === 'car') {
      // pull over to the lane farther from us
      const ours = car.x - T.roadX(it.y);
      it.goal = ours > 20 ? -T.gap : ours < -20 ? T.gap : Math.sign(it.off || 1) * T.gap;
    }
    if (it.kind === 'duck' || it.kind === 'cow') {
      it.hurry = 2;
      if (it.kind === 'duck') sfx.quack(0.15);
    }
  }
}

// ---------- particles ----------
function burst(x, y, n, color, sp) {
  for (let j = 0; j < n; j++) {
    const a = (j / n) * Math.PI * 2;
    fx.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 0.6, r: 7, color, star: color === '#ffd43b' });
  }
}
function puff(x, y, n, color) {
  for (let j = 0; j < n; j++)
    fx.push({ x: x + (Math.random() - 0.5) * 40, y, vx: (Math.random() - 0.5) * 120, vy: -40 - Math.random() * 60, life: 0, max: 0.5, r: 10 + Math.random() * 8, color, grow: true });
}

// ---------- drawing ----------
function hash(a, b) {
  let h = (a * 374761393 + b * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function draw() {
  const c = ctx;
  const th = T.theme;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.fillStyle = th.ground;
  c.fillRect(0, 0, cw, ch);
  const yTop = camY + carSY / scale + 100; // world y at the top of the screen
  const yBot = camY - (ch - carSY) / scale - 100;
  const xL = camX - cw / 2 / scale - 100, xR = camX + cw / 2 / scale + 100;

  // spots on the ground, so it is easy to see that the car moves
  const G = 170;
  c.fillStyle = th.spot;
  for (let iy = Math.floor(yBot / G); iy <= yTop / G; iy++)
    for (let ix = Math.floor(xL / G); ix <= xR / G; ix++) {
      const h = hash(ix, iy);
      if (h > 0.55) continue;
      c.beginPath();
      c.ellipse(sx(ix * G + h * 300), sy(iy * G + hash(iy, ix) * G), (18 + h * 40) * scale, (8 + h * 14) * scale, 0, 0, Math.PI * 2);
      c.fill();
    }

  const ys = [];
  const yEnd = T.length + 420; // the road ends in a round square in front of the place
  for (let y = yBot; y < Math.min(yTop, yEnd) + 30; y += 30) ys.push(Math.min(y, yEnd));
  const edge = (off) => ys.map((y) => [sx(T.roadX(y) + off), sy(y)]);
  const band = (a, b, fill) => {
    const L = edge(a), R = edge(b).reverse();
    c.beginPath();
    [...L, ...R].forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.fillStyle = fill;
    c.fill();
  };

  if (th.sea) {
    // sand, then the sea with a wavy white edge
    const L = ys.map((y) => [sx(T.roadX(y) - T.half - 210 + Math.sin(y * 0.012 + clock * 2) * 10), sy(y)]);
    c.beginPath();
    c.moveTo(-10, sy(ys[0]));
    L.forEach(([x, y]) => c.lineTo(x, y));
    c.lineTo(-10, sy(ys[ys.length - 1]));
    c.closePath();
    c.fillStyle = '#5ec2ea';
    c.fill();
    c.strokeStyle = '#fff';
    c.lineWidth = 8 * scale;
    c.beginPath();
    L.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.stroke();
  }
  if (ys.length > 1) {
    if (th.walk) {
      band(-T.half - 46, -T.half, th.walk);
      band(T.half, T.half + 46, th.walk);
    } else band(-T.half - 12, T.half + 12, 'rgba(60,40,30,0.18)');
    if (th.road === 'rainbow') {
      const cols = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#b197fc'];
      const w = T.width / cols.length;
      cols.forEach((col, i) => band(-T.half + i * w - 0.5, -T.half + (i + 1) * w + 0.5, col));
    } else band(-T.half, T.half, th.road);
  }
  // the round end of the road
  if (yTop > yEnd) {
    c.beginPath();
    c.ellipse(sx(T.roadX(yEnd)), sy(yEnd), T.half * scale * 1.3, T.half * scale * 0.9, 0, 0, Math.PI * 2);
    c.fillStyle = th.road === 'rainbow' ? '#ffe3f1' : th.road;
    c.fill();
  }
  const lineEnd = T.length + 260;
  if (yBot < lineEnd) {
    // white edge lines and dashed lanes (none on the rainbow, it has its stripes)
    c.strokeStyle = 'rgba(255,255,255,0.9)';
    c.lineCap = 'round';
    c.lineWidth = 7 * scale;
    for (const off of [-T.half + 14, T.half - 14]) {
      c.beginPath();
      ys.filter((y) => y <= lineEnd).forEach((y, i) => (i ? c.lineTo : c.moveTo).call(c, sx(T.roadX(y) + off), sy(y)));
      c.stroke();
    }
    c.lineWidth = 6 * scale;
    const D = 140;
    for (const off of th.road === 'rainbow' ? [] : [-T.gap / 2, T.gap / 2]) {
      c.beginPath();
      for (let k = Math.floor(yBot / D); k * D < Math.min(yTop, T.length); k++) {
        const y0 = k * D, y1 = y0 + 70;
        c.moveTo(sx(T.roadX(y0) + off), sy(y0));
        c.lineTo(sx(T.roadX((y0 + y1) / 2) + off), sy((y0 + y1) / 2));
        c.lineTo(sx(T.roadX(y1) + off), sy(y1));
      }
      c.stroke();
    }
  }

  // things lying flat on the road
  const at = (x, y, f) => {
    c.save();
    c.translate(sx(x), sy(y));
    c.scale(scale, scale);
    f();
    c.restore();
  };
  if (T.length > yBot && T.length < yTop) at(T.roadX(T.length), T.length, () => A.checkers(c, T.width));
  for (const it of items) {
    if (it.gone || it.y < yBot || it.y > yTop) continue;
    if (it.kind === 'puddle') at(it.x, it.y, () => A.puddle(c, clock + it.y));
    if (it.kind === 'ramp') at(it.x, it.y + 45, () => A.ramp(c));
  }

  // everything standing up, the far ones first
  const list = [];
  for (const d of T.decor) if (d.y > yBot - 200 && d.y < yTop + 300 && d.x > xL - 300 && d.x < xR + 300) list.push([d.y, () => at(d.x, d.y, () => A.decor(c, d, { night: T.lv.night }))]);
  for (const it of items) {
    if (it.gone || it.y < yBot - 100 || it.y > yTop + 200) continue;
    const k = it.kind;
    if (k === 'puddle' || k === 'ramp') continue;
    const z = it.fly ? it.fly.z : 0;
    list.push([
      it.y,
      () =>
        at(it.x, it.y, () => {
          if (z) c.translate(0, -z);
          if (k === 'star') A.star(c, clock + it.y * 0.01);
          else if (k === 'cone') {
            if (it.fly) c.rotate(it.fly.t * 9);
            A.cone(c);
          } else if (k === 'rock') {
            if (it.cool > 0) c.translate(Math.sin(clock * 50) * 3, 0);
            A.rock(c, it.y);
          } else if (k === 'snowman') A.snowman(c);
          else if (k === 'duck') {
            for (let j = it.n - 1; j >= 0; j--) {
              c.save();
              c.translate(-it.dir * j * 46, 0);
              if (it.fly) c.translate(0, -Math.sin(it.fly.t * 30) * 6);
              A.duck(c, it.walking ? clock + j * 0.3 : 0, it.dir, j ? 0.7 : 1);
              c.restore();
            }
          } else if (k === 'cow') A.cow(c, it.walking ? clock : 0, it.dir);
          else if (k === 'car') {
            c.translate(0, -60);
            A.otherCar(c, it.color);
          }
        }),
    ]);
  }
  list.push([car.y - 60, drawCar]);
  if (T.length < yTop + 600) {
    list.push([T.length, () => at(T.roadX(T.length), T.length, () => A.finish(c, T.width))]);
    list.push([T.length + 600, () => at(T.roadX(T.length), T.length + 600, () => A.place(c, T.lv.to, clock))]);
  }
  list.sort((a, b) => b[0] - a[0]);
  for (const [, f] of list) f();

  // particles
  for (const p of fx) {
    const k = p.life / p.max;
    c.globalAlpha = 1 - k;
    const r = p.r * scale * (p.grow ? 1 + k * 1.5 : 1);
    if (p.note) {
      c.fillStyle = p.color;
      c.font = `800 ${Math.round(34 * scale)}px 'Baloo 2', sans-serif`;
      c.fillText('♪', sx(p.x), sy(p.y));
    } else if (p.star) {
      c.save();
      c.translate(sx(p.x), sy(p.y));
      c.scale(r / 7, r / 7);
      c.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? 4 : 9;
        c.lineTo(Math.cos(a) * q, Math.sin(a) * q);
      }
      c.fillStyle = i2c(p);
      c.fill();
      c.restore();
    } else {
      c.beginPath();
      c.arc(sx(p.x), sy(p.y) - (p.z ? Math.sin(k * Math.PI) * 40 * scale : 0), r, 0, Math.PI * 2);
      c.fillStyle = p.color;
      c.fill();
    }
  }
  c.globalAlpha = 1;
  if (T.lv.night) drawNight();
}
const i2c = (p) => (p.life * 10) % 2 < 1 ? '#ffd43b' : '#fff';

function drawCar() {
  const c = ctx;
  const k = car.air > 0 ? Math.sin((1 - car.air / 0.95) * Math.PI) : 0; // 0..1..0 over a jump
  c.save();
  c.translate(sx(car.x), sy(car.y));
  c.scale(scale, scale);
  c.beginPath();
  c.ellipse(0, 6, 46 * (1 - k * 0.25), 66 * (1 - k * 0.25), 0, 0, Math.PI * 2);
  c.fillStyle = 'rgba(40,30,60,0.22)';
  c.fill();
  c.translate(0, -k * 70);
  c.scale(1 + k * 0.3, 1 + k * 0.3);
  c.rotate((car.vx / SIDE) * 0.32 + (car.wob > 0 ? Math.sin(clock * 38) * car.wob * 0.4 : 0));
  A.carTop(c, carColor(), { brake: car.bump > 0 || phase === 'arrive', lights: T.lv.night });
  c.restore();
}

// night: a dark layer with holes where the headlights, street lamps and stars shine
function drawNight() {
  const d = dctx;
  d.setTransform(dpr, 0, 0, dpr, 0, 0);
  d.globalCompositeOperation = 'source-over';
  d.clearRect(0, 0, cw, ch);
  d.fillStyle = 'rgba(14,20,58,0.8)';
  d.fillRect(0, 0, cw, ch);
  d.globalCompositeOperation = 'destination-out';
  const hole = (x, y, r, a = 1) => {
    const g = d.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(0,0,0,${a})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    d.fillStyle = g;
    d.beginPath();
    d.arc(x, y, r, 0, Math.PI * 2);
    d.fill();
  };
  // the headlights: a wide beam ahead of the car
  const cx = sx(car.x), cy = sy(car.y) - 60 * scale;
  const ang = -Math.PI / 2 + (car.vx / SIDE) * 0.32;
  const len = 620 * scale;
  const g = d.createRadialGradient(cx, cy, 0, cx, cy, len);
  g.addColorStop(0, 'rgba(0,0,0,1)');
  g.addColorStop(0.7, 'rgba(0,0,0,0.85)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  d.fillStyle = g;
  d.beginPath();
  d.moveTo(cx - 30 * scale, cy);
  d.arc(cx, cy, len, ang - 0.42, ang + 0.42);
  d.lineTo(cx + 30 * scale, cy);
  d.closePath();
  d.fill();
  hole(sx(car.x), sy(car.y), 150 * scale, 0.9);
  for (const dd of T.decor) if (dd.kind === 'lamp' || dd.kind === 'house') {
    const y = sy(dd.y);
    if (y > -200 && y < ch + 200) hole(sx(dd.x), y - (dd.kind === 'lamp' ? 40 : 60) * scale, (dd.kind === 'lamp' ? 190 : 120) * scale, 0.8);
  }
  for (const it of items) if (!it.gone && it.kind === 'star') {
    const y = sy(it.y);
    if (y > -100 && y < ch + 100) hole(sx(it.x), y - 26 * scale, 70 * scale, 0.75);
  }
  const p = T.length + 600;
  if (sy(p) > -300) hole(sx(T.roadX(T.length)), sy(p) - 200 * scale, 420 * scale, 0.9);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(dark, 0, 0);
}

// ---------- the heads-up: progress and stars ----------
function hud() {
  const k = clamp(car.y / T.length, 0, 1);
  $('progFill').style.width = `calc(${k * 100}% - ${k * 6}px)`;
  $('progCar').style.left = `${k * 100}%`;
}

function say(text, ms, then) {
  const el = $('tip');
  el.textContent = text;
  el.classList.remove('gone');
  clearTimeout(tipTimer);
  tipTimer = setTimeout(() => (then ? then() : el.classList.add('gone')), ms);
}

// ---------- arrived ----------
function win() {
  if (phase !== 'done' || playEl.hidden) return;
  engine(0);
  const frac = got / Math.max(1, T.stars);
  const stars = frac >= 0.85 ? 3 : frac >= 0.5 ? 2 : 1;
  best[li] = Math.max(best[li] || 0, stars);
  store(SAVE, best);
  const lastLevel = li === LEVELS.length - 1;
  $('winPic').innerHTML = `${A.carSide(carColor())}<div class="place">${A.PLACE_EMOJI[T.lv.to] || '🏁'}</div>`;
  $('winTitle').textContent = lastLevel ? t('win.final') : t('win.title');
  $('winStars').innerHTML = [0, 1, 2].map(() => '<span>⭐</span>').join('');
  $('winCount').textContent = `⭐ ${got} / ${T.stars}`;
  $('nextBtn').hidden = lastLevel;
  $('win').hidden = false;
  sfx.win();
  confetti();
  [...$('winStars').children].forEach((s, i) => {
    if (i < stars)
      setTimeout(() => {
        s.classList.add('on');
        sfx.bigStar(i);
      }, 500 + i * 350);
  });
}

function confetti() {
  const box = $('confetti');
  const colors = ['#ff8fa8', '#ffd36b', '#7cc4f0', '#7ccf6a', '#b99af0', '#ffb15c'];
  for (let i = 0; i < 40; i++) {
    const el = document.createElement('i');
    el.style.left = `${Math.random() * 100}%`;
    el.style.background = colors[i % colors.length];
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
  finger = { id: e.pointerId, x: worldX(e.clientX) };
  canvas.setPointerCapture?.(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (finger && e.pointerId === finger.id) finger.x = worldX(e.clientX);
});
const lift = (e) => {
  if (finger && e.pointerId === finger.id) finger = null;
};
canvas.addEventListener('pointerup', lift);
canvas.addEventListener('pointercancel', lift);

const KEYS = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' };
addEventListener('keydown', (e) => {
  if (KEYS[e.key]) keys[KEYS[e.key]] = 1;
  if ((e.key === ' ' || e.key === 'h') && !playEl.hidden) {
    e.preventDefault();
    if (!e.repeat) honk();
  }
});
addEventListener('keyup', (e) => {
  if (KEYS[e.key]) keys[KEYS[e.key]] = 0;
});

$('honkBtn').addEventListener('pointerdown', (e) => {
  e.preventDefault();
  honk();
});
$('playBtn').onclick = () => go(frontier());
$('levelsBtn').onclick = showTitle;
$('againBtn').onclick = () => go(li);
$('nextBtn').onclick = () => go(Math.min(li + 1, LEVELS.length - 1));
const muteBtn = $('muteBtn');
muteBtn.textContent = isMuted() ? '🔇' : '🔊';
muteBtn.onclick = () => {
  muteBtn.textContent = toggleMute() ? '🔇' : '🔊';
};
addEventListener('resize', resize);
addEventListener('pointerdown', unlock, { once: true });
document.addEventListener('visibilitychange', () => {
  paused = document.hidden;
  if (paused) engine(0);
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
resize();

// on the lastenurk site (/games/<name>/) the title screen gets a button back to the landing page
if (/\/games\/[^/]+\/(index\.html)?$/.test(location.pathname)) $('cornerBtn').hidden = false;

const q = new URLSearchParams(location.search);
// dev only: ?auto drives by itself towards the next star (for testing whole levels)
let autopilot = null;
if (import.meta.env.DEV && q.has('auto'))
  autopilot = () => {
    const next = items.find((it) => !it.gone && it.kind === 'star' && it.y > car.y - 40);
    const x = next ? next.x : T.roadX(car.y + 300);
    return clamp((x - car.x) * 4, -SIDE, SIDE);
  };

// dev shortcut: ?level=5 opens that level straight away
if (q.has('level')) startLevel(clamp(Number(q.get('level')) - 1, 0, LEVELS.length - 1));
else showTitle();

// dev only: lets a test script see the state
if (import.meta.env.DEV) window.__pa = () => ({ T, car, phase, got, items, li });

// offline support: only in the built game (the dev server would cache stale code)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
