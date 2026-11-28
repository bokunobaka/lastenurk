// Rolling by tilting the tablet. Reads deviceorientation (beta/gamma), turns it into the "up" direction in the
// device's own axes, and measures how far the screen's right edge and its top edge dip, whichever way the
// screen is turned. How the tablet is held when a level begins counts as level ground (within reason), so it
// works from flat on the table to tipped towards the child.
// iOS (and newer Chrome) ask first: request() must run inside a tap (Safari shows "Allow motion & orientation").

let lean = 0; // degrees: + = the screen's right edge is down
let dip = 0; // degrees: + = the screen's top edge is down
let live = false; // real readings have arrived
let zero = { lean: 0, dip: 0 };

// Which way the screen is turned (0, 90, 180, 270). iPad Safari asks for desktop sites and then may not say
// (or says 0 in landscape), so the answer is only trusted when it agrees with the page's shape; otherwise
// it is worked out from gravity: of the two edges it could be, the screen's top is the higher one.
const guess = { land: 90, port: 0 };
function screenAngle(ux, uy) {
  const land = innerWidth > innerHeight;
  const said = screen.orientation?.angle ?? window.orientation;
  if (said != null) {
    const a = ((said % 360) + 360) % 360;
    if ((a % 180 === 90) === land) return a;
  }
  // screen-up in device axes is (1, 0) at 90 and (-1, 0) at 270; (0, 1) at 0 and (0, -1) at 180
  if (land) {
    if (ux > 0.2) guess.land = 90;
    else if (ux < -0.2) guess.land = 270;
    return guess.land;
  }
  if (uy > 0.2) guess.port = 0;
  else if (uy < -0.2) guess.port = 180;
  return guess.port;
}

const deg = (r) => (r * 180) / Math.PI;
const asin = (v) => Math.asin(Math.max(-1, Math.min(1, v)));

function onOrient(e) {
  if (e.beta == null || e.gamma == null) return;
  live = true;
  const b = (e.beta * Math.PI) / 180, g = (e.gamma * Math.PI) / 180;
  // "up" in device axes (x right, y to the top edge, z out of the screen in portrait)
  const ux = -Math.cos(b) * Math.sin(g), uy = Math.sin(b);
  // the screen's right and top in device axes: turning the screen by `angle` turns them the other way
  const a = (screenAngle(ux, uy) * Math.PI) / 180;
  const rx = Math.cos(a), ry = -Math.sin(a);
  const tx = Math.sin(a), ty = Math.cos(a);
  lean = deg(asin(-(ux * rx + uy * ry)));
  dip = deg(asin(-(ux * tx + uy * ty)));
}

let started = false;
function listen() {
  if (started) return;
  started = true;
  addEventListener('deviceorientation', onOrient);
}

// call from a tap; resolves true when tilting can work (it may still never send readings on a computer)
export async function request() {
  const DOE = window.DeviceOrientationEvent;
  if (!DOE) return false;
  // listen whatever the answer: some browsers say "prompt" and then send readings anyway
  listen();
  if (typeof DOE.requestPermission === 'function') {
    try {
      if ((await DOE.requestPermission()) === 'denied') return false;
    } catch {
      return false; // not inside a tap
    }
  }
  return true;
}

// at the start of a level: however the child holds the tablet now is level ground. Sideways only a little
// (a tablet is rarely held skewed on purpose); towards the child up to 55 degrees.
export function calibrate() {
  zero = live ? { lean: Math.max(-10, Math.min(10, lean)), dip: Math.max(-55, Math.min(12, dip)) } : { lean: 0, dip: 0 };
}

// which way the ladybug is pushed, in screen directions (x right, y down), each -1..1.
// A little tilt does nothing; about 16 degrees is a full push.
export function roll() {
  if (!live) return { x: 0, y: 0 };
  const f = (d) => {
    const dead = 1.5, full = 16;
    const m = Math.abs(d);
    return m < dead ? 0 : Math.sign(d) * Math.min(1, (m - dead) / (full - dead));
  };
  return { x: f(lean - zero.lean), y: f(zero.dip - dip) };
}

export const active = () => live;
export const needsTap = () => typeof window.DeviceOrientationEvent?.requestPermission === 'function';

// browsers that do not ask send readings straight away
if (!needsTap()) listen();
