// Little synth sounds (Web Audio), so the game needs no sound files. Rolling is a soft rumble that
// grows with the ladybug's speed.
let ctx = null;
let muted = false;
try {
  muted = localStorage.getItem('lepatriinu.muted') === '1';
} catch {}

// browsers only allow sound after the first tap
export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

export const isMuted = () => muted;
export function toggleMute() {
  muted = !muted;
  try {
    localStorage.setItem('lepatriinu.muted', muted ? '1' : '0');
  } catch {}
  if (muted) rolling(0);
  return muted;
}

function tone(freq, dur, { type = 'sine', vol = 0.14, at = 0, to = null } = {}) {
  if (muted || !ctx) return;
  const t0 = ctx.currentTime + at;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function noiseBuffer(dur) {
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

// a short burst of filtered noise: splashes, poofs
function noise(dur, { vol = 0.12, freq = 1200, at = 0 } = {}) {
  if (muted || !ctx) return;
  const t0 = ctx.currentTime + at;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(dur);
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f).connect(g).connect(ctx.destination);
  src.start(t0);
}

// ---------- rolling ----------
let roll = null;
// 0 = still; else 0..1 for slow..fast. ice = a lighter, hissing sound
export function rolling(level, ice = false) {
  if (!ctx) return;
  if (!roll && level > 0 && !muted) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(2);
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    const g = ctx.createGain();
    g.gain.value = 0;
    src.connect(f).connect(g).connect(ctx.destination);
    src.start();
    roll = { f, g };
  }
  if (!roll) return;
  const now = ctx.currentTime;
  const on = level > 0.05 && !muted;
  roll.g.gain.setTargetAtTime(on ? (ice ? 0.025 : 0.05) * Math.min(1, level) : 0, now, 0.06);
  roll.f.frequency.setTargetAtTime(ice ? 2400 : 160 + level * 260, now, 0.08);
}

const SCALE = [523, 587, 659, 784, 880, 1047, 1175, 1319];

export const sfx = {
  spot: (i) => {
    tone(SCALE[i % SCALE.length], 0.16, { type: 'triangle', vol: 0.14 });
    tone(SCALE[i % SCALE.length] * 2, 0.12, { type: 'sine', vol: 0.05, at: 0.05 });
  },
  // a knock on the hedge, louder for a harder hit
  tok: (k) => {
    tone(260 + Math.random() * 40, 0.08, { type: 'triangle', vol: 0.05 + 0.12 * k, to: 140 });
    noise(0.05, { vol: 0.04 + 0.06 * k, freq: 700 });
  },
  boing: () => tone(240, 0.32, { type: 'sine', vol: 0.15, to: 720 }),
  fall: () => tone(700, 0.6, { type: 'sine', vol: 0.12, to: 120 }),
  pop: () => {
    tone(500, 0.08, { type: 'sine', vol: 0.12, to: 900 });
    noise(0.12, { vol: 0.06, freq: 2600, at: 0.02 });
  },
  click: () => {
    tone(880, 0.05, { type: 'square', vol: 0.05 });
    tone(660, 0.07, { type: 'square', vol: 0.04, at: 0.06 });
  },
  door: () => {
    tone(330, 0.5, { type: 'sawtooth', vol: 0.03, to: 160 });
    noise(0.45, { vol: 0.06, freq: 400, at: 0.05 });
  },
  ice: () => [1568, 2093, 2637].forEach((f, i) => tone(f, 0.12, { type: 'sine', vol: 0.04, at: i * 0.05 })),
  honey: () => {
    tone(160, 0.25, { type: 'sine', vol: 0.12, to: 90 });
    tone(220, 0.2, { type: 'triangle', vol: 0.05, at: 0.06, to: 120 });
  },
  notYet: () => {
    tone(392, 0.12, { type: 'triangle', vol: 0.1 });
    tone(330, 0.16, { type: 'triangle', vol: 0.1, at: 0.13 });
  },
  bloom: () => [659, 784, 988, 1319].forEach((f, i) => tone(f, 0.2, { type: 'triangle', vol: 0.11, at: i * 0.08 })),
  go: () => {
    tone(523, 0.12, { type: 'triangle', vol: 0.1 });
    tone(784, 0.2, { type: 'triangle', vol: 0.12, at: 0.13 });
  },
  win: () => [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.22, { type: 'triangle', vol: 0.12, at: 0.1 + i * 0.09 })),
};
