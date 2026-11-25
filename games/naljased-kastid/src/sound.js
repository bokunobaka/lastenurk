// Little synth beeps (Web Audio), so the game needs no sound files.
let ctx = null;
let muted = false;
try {
  muted = localStorage.getItem('naljasedKastid.muted') === '1';
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
    localStorage.setItem('naljasedKastid.muted', muted ? '1' : '0');
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

// a rising scale: each thing eaten sounds one note higher
const SCALE = [523, 587, 659, 698, 784, 880, 988, 1047, 1175, 1319, 1397, 1568];

export const sfx = {
  drop: () => tone(500, 0.12, { type: 'sine', vol: 0.08, to: 250 }),
  pick: () => tone(660, 0.07, { type: 'triangle', vol: 0.1, to: 880 }),
  munch: (n) => {
    tone(180, 0.08, { type: 'square', vol: 0.05 });
    tone(160, 0.08, { type: 'square', vol: 0.05, at: 0.1 });
    tone(SCALE[Math.min(n, 11)], 0.18, { type: 'triangle', vol: 0.12, at: 0.18 });
  },
  yuck: () => {
    tone(260, 0.18, { type: 'sawtooth', vol: 0.05, to: 160 });
    tone(330, 0.12, { type: 'triangle', vol: 0.08, at: 0.2, to: 500 });
  },
  back: () => tone(392, 0.14, { type: 'triangle', vol: 0.08, to: 262 }),
  fall: () => tone(600, 0.3, { type: 'sine', vol: 0.06, to: 200 }),
  wiggle: () => tone(523, 0.08, { type: 'triangle', vol: 0.08 }),
  win: () => [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.22, { type: 'triangle', vol: 0.12, at: 0.2 + i * 0.09 })),
};
