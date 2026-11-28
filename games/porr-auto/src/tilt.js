// Steering by tilting the tablet. Reads deviceorientation (beta/gamma), turns it into the "up" direction
// in the device's own axes, and measures how far the screen's right edge dips, whichever way the screen
// is turned. Works however the tablet is held, from flat on the table to nearly upright.
// iOS (and newer Chrome) ask first: request() must run inside a tap (Safari shows "Allow motion & orientation").

let lean = 0; // sideways tilt of the screen, degrees: + = right edge down
let live = false; // real readings have arrived
let zero = 0; // how the tablet was held when the drive began counts as straight

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

function onOrient(e) {
  if (e.beta == null || e.gamma == null) return;
  live = true;
  const b = (e.beta * Math.PI) / 180, g = (e.gamma * Math.PI) / 180;
  // "up" in device axes (x right, y to the top edge, z out of the screen in portrait)
  const ux = -Math.cos(b) * Math.sin(g), uy = Math.sin(b);
  // the screen's right in device axes: turning the screen by `angle` turns it the other way
  const a = (screenAngle(ux, uy) * Math.PI) / 180;
  const rx = Math.cos(a), ry = -Math.sin(a);
  lean = (Math.asin(Math.max(-1, Math.min(1, -(ux * rx + uy * ry)))) * 180) / Math.PI;
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
  if (typeof DOE.requestPermission === 'function') {
    try {
      if ((await DOE.requestPermission()) !== 'granted') return false;
    } catch {
      return false; // not inside a tap, or the player said no
    }
  }
  listen();
  return true;
}

// at the start of a drive: however the child holds the tablet now is "straight" (within reason)
export function calibrate() {
  zero = live ? Math.max(-10, Math.min(10, lean)) : 0;
}

// -1..1: how hard to steer. A little tilt does nothing; about 18 degrees is full steering.
export function steer() {
  if (!live) return 0;
  const dead = 2.5, full = 18;
  const d = lean - zero;
  const m = Math.abs(d);
  if (m < dead) return 0;
  return Math.sign(d) * Math.min(1, (m - dead) / (full - dead));
}

export const active = () => live;
export const needsTap = () => typeof window.DeviceOrientationEvent?.requestPermission === 'function';

// browsers that do not ask send readings straight away
if (!needsTap()) listen();
