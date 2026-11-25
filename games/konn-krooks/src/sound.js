// Little synth beeps (Web Audio), so the game needs no sound files.
let ctx = null;
let muted = false;
try {
  muted = localStorage.getItem('konnKrooks.muted') === '1';
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
    localStorage.setItem('konnKrooks.muted', muted ? '1' : '0');
  } catch {}
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

// counting notes: up a scale for plus, down for minus
const SCALE = [523, 587, 659, 698, 784, 880, 988, 1047, 1175, 1319, 1397, 1568];

export const sfx = {
  card: () => tone(660, 0.08, { type: 'triangle', vol: 0.1 }),
  hop: () => tone(300, 0.18, { type: 'sine', vol: 0.09, to: 700 }),
  count: (m, up) => tone(up ? SCALE[Math.min(m - 1, 11)] : SCALE[Math.max(0, 11 - m)], 0.1, { type: 'triangle', vol: 0.1 }),
  land: () => tone(220, 0.1, { type: 'sine', vol: 0.14, to: 140 }),
  splash: () => {
    tone(900, 0.35, { type: 'sawtooth', vol: 0.04, to: 120 });
    tone(500, 0.3, { type: 'square', vol: 0.03, at: 0.05, to: 90 });
  },
  oops: () => {
    tone(440, 0.14, { type: 'triangle' });
    tone(370, 0.22, { type: 'triangle', at: 0.15 });
  },
  yum: () => {
    tone(400, 0.12, { type: 'sine', vol: 0.12, to: 1200 });
    tone(1319, 0.12, { vol: 0.1, at: 0.16 });
    tone(1760, 0.2, { vol: 0.09, at: 0.24 });
  },
  win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.22, { type: 'triangle', vol: 0.12, at: 0.35 + i * 0.09 })),
};
