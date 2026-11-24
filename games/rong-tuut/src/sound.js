// Little synth sounds (Web Audio), so the game needs no sound files.
let ctx = null;
let muted = false;
try {
  muted = localStorage.getItem('rongTuut.muted') === '1';
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
    localStorage.setItem('rongTuut.muted', muted ? '1' : '0');
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

// a soft "chuff": filtered noise
function chuff(at = 0, vol = 0.12) {
  if (muted || !ctx) return;
  const t0 = ctx.currentTime + at;
  const len = Math.floor(ctx.sampleRate * 0.12);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 900;
  const g = ctx.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(ctx.destination);
  src.start(t0);
}

export const sfx = {
  turn: () => {
    tone(520, 0.06, { type: 'triangle', vol: 0.1 });
    tone(780, 0.07, { type: 'triangle', vol: 0.08, at: 0.05 });
  },
  joined: () => tone(988, 0.12, { type: 'sine', vol: 0.08 }),
  flip: () => {
    tone(300, 0.05, { type: 'square', vol: 0.06 });
    tone(450, 0.08, { type: 'triangle', vol: 0.1, at: 0.06 });
  },
  whistle: () => {
    tone(740, 0.35, { type: 'triangle', vol: 0.1 });
    tone(932, 0.35, { type: 'triangle', vol: 0.08 });
    tone(740, 0.45, { type: 'triangle', vol: 0.1, at: 0.42 });
    tone(932, 0.45, { type: 'triangle', vol: 0.08, at: 0.42 });
  },
  chuff,
  board: () => {
    tone(660, 0.08, { type: 'triangle' });
    tone(990, 0.14, { type: 'triangle', at: 0.07 });
  },
  stop: () => {
    chuff(0, 0.2);
    tone(330, 0.3, { type: 'triangle', to: 180 });
  },
  win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.22, { type: 'triangle', vol: 0.12, at: i * 0.09 })),
};
