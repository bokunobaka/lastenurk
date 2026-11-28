// Little synth sounds (Web Audio), so the game needs no sound files. The engine is a soft hum
// whose pitch follows the car's speed.
let ctx = null;
let muted = false;
try {
  muted = localStorage.getItem('porr-auto.muted') === '1';
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
    localStorage.setItem('porr-auto.muted', muted ? '1' : '0');
  } catch {}
  if (muted) engine(0);
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

// a short burst of filtered noise: splashes, poofs
function noise(dur, { vol = 0.12, freq = 1200, at = 0 } = {}) {
  if (muted || !ctx) return;
  const t0 = ctx.currentTime + at;
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(ctx.destination);
  src.start(t0);
}

// ---------- the engine hum ----------
let eng = null;
// level 0 = off; else 0..1 for slow..fast
export function engine(level) {
  if (!ctx) return;
  if (!eng && level > 0 && !muted) {
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const f = ctx.createBiquadFilter();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o2.type = 'square';
    f.type = 'lowpass';
    f.frequency.value = 420;
    g.gain.value = 0;
    o.connect(f);
    o2.connect(f);
    f.connect(g).connect(ctx.destination);
    o.start();
    o2.start();
    eng = { o, o2, g };
  }
  if (!eng) return;
  const now = ctx.currentTime;
  const on = level > 0 && !muted;
  eng.g.gain.setTargetAtTime(on ? 0.035 : 0, now, 0.08);
  const hz = 55 + level * 55;
  eng.o.frequency.setTargetAtTime(hz, now, 0.1);
  eng.o2.frequency.setTargetAtTime(hz * 0.5, now, 0.1);
}

const SCALE = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760];

export const sfx = {
  star: (i) => {
    tone(SCALE[i % SCALE.length], 0.16, { type: 'triangle', vol: 0.13 });
    tone(SCALE[i % SCALE.length] * 2, 0.12, { type: 'sine', vol: 0.05, at: 0.05 });
  },
  honk: () => {
    for (const at of [0, 0.22]) {
      tone(392, 0.17, { type: 'square', vol: 0.06, at });
      tone(494, 0.17, { type: 'square', vol: 0.05, at });
    }
  },
  bonk: () => {
    tone(180, 0.18, { type: 'triangle', vol: 0.16, to: 90 });
    noise(0.12, { vol: 0.08, freq: 500 });
  },
  boing: () => tone(220, 0.35, { type: 'sine', vol: 0.14, to: 660 }),
  splash: () => {
    noise(0.35, { vol: 0.16, freq: 1800 });
    noise(0.25, { vol: 0.08, freq: 900, at: 0.05 });
  },
  poof: () => noise(0.4, { vol: 0.14, freq: 3000 }),
  jump: () => tone(300, 0.4, { type: 'sine', vol: 0.12, to: 900 }),
  land: () => {
    tone(140, 0.14, { type: 'triangle', vol: 0.12, to: 80 });
    noise(0.1, { vol: 0.06, freq: 400 });
  },
  quack: (at = 0) => {
    tone(620, 0.09, { type: 'sawtooth', vol: 0.05, at, to: 420 });
    tone(600, 0.1, { type: 'sawtooth', vol: 0.05, at: at + 0.14, to: 400 });
  },
  moo: () => {
    tone(150, 0.7, { type: 'sawtooth', vol: 0.06, to: 110 });
    tone(152, 0.7, { type: 'triangle', vol: 0.08, to: 108 });
  },
  rumble: () => noise(0.08, { vol: 0.05, freq: 250 }),
  go: () => {
    tone(523, 0.12, { type: 'triangle', vol: 0.1 });
    tone(784, 0.2, { type: 'triangle', vol: 0.12, at: 0.13 });
  },
  win: () => [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.22, { type: 'triangle', vol: 0.12, at: 0.1 + i * 0.09 })),
  bigStar: (i) => tone([784, 988, 1175][i] || 1175, 0.3, { type: 'triangle', vol: 0.14 }),
};
