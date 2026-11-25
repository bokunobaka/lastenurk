// Little synth beeps (Web Audio), so the game needs no sound files.
let ctx = null;
let muted = false;
try {
  muted = localStorage.getItem('kujundipusle.muted') === '1';
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
    localStorage.setItem('kujundipusle.muted', muted ? '1' : '0');
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

// a rising scale, one note higher for each piece that clicks into place
const SCALE = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568];

export const sfx = {
  pick: () => tone(660, 0.07, { type: 'triangle', vol: 0.1, to: 880 }),
  snap: (n) => {
    const f = SCALE[Math.min(n, SCALE.length - 1)];
    tone(f, 0.16, { type: 'triangle', vol: 0.13 });
    tone(f * 1.5, 0.2, { vol: 0.07, at: 0.06 });
  },
  turn: () => tone(330, 0.16, { type: 'sine', vol: 0.1, to: 620 }),
  back: () => tone(392, 0.16, { type: 'triangle', vol: 0.09, to: 262 }),
  nope: () => {
    tone(330, 0.12, { type: 'triangle' });
    tone(262, 0.2, { type: 'triangle', at: 0.13 });
  },
  wiggle: () => tone(523, 0.08, { type: 'triangle', vol: 0.08 }),
  win: () => [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.22, { type: 'triangle', vol: 0.12, at: i * 0.09 })),
};
