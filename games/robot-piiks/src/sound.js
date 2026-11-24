// Little synth beeps (Web Audio), so the game needs no sound files.
let ctx = null;
let muted = false;
try {
  muted = localStorage.getItem('robotPiiks.muted') === '1';
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
    localStorage.setItem('robotPiiks.muted', muted ? '1' : '0');
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

const NOTE = { up: 784, right: 659, down: 523, left: 587 };

export const sfx = {
  card: (dir) => tone(NOTE[dir] || 660, 0.09, { type: 'triangle' }),
  remove: () => tone(440, 0.1, { type: 'triangle', to: 300 }),
  more: (n) => tone(523 * (1 + n * 0.25), 0.1, { type: 'triangle' }),
  step: (dir) => {
    tone((NOTE[dir] || 600) / 2, 0.07, { type: 'square', vol: 0.05 });
    tone(NOTE[dir] || 600, 0.06, { type: 'sine', vol: 0.08, at: 0.05 });
  },
  star: () => {
    tone(1319, 0.12, { vol: 0.12 });
    tone(1760, 0.2, { vol: 0.1, at: 0.08 });
  },
  bump: () => tone(180, 0.3, { type: 'square', vol: 0.08, to: 70 }),
  short: () => {
    tone(440, 0.14, { type: 'triangle' });
    tone(370, 0.22, { type: 'triangle', at: 0.15 });
  },
  win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.22, { type: 'triangle', vol: 0.12, at: i * 0.09 })),
};
