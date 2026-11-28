// The drives. Each one is a road to somewhere (`to`), built by src/track.js from this plan:
//   theme   ground, roadside things and road colour (see THEMES in src/art.js)
//   length  how far to drive (the car goes about `speed` a second, so 9000 at 380 is ~25 s)
//   curvy   0 = straight, 0.6 = winding
//   width   road width (default 480; three lanes)
//   mix     what the road has, with weights: star, cone, rock, puddle, snowman, ramp, duck, cow, car
//   slip    the car slides (snow)        night   dark, with headlights
//   seed    the random numbers that place everything (change it for a different road)
// `npm run check` drives every road: every star can be reached, there is always a way past.
export const LEVELS = [
  { to: 'grandma', theme: 'meadow', length: 6000, curvy: 0, mix: { star: 1 }, tip: 'tip.first', seed: 11 },
  { to: 'playground', theme: 'meadow', length: 7500, curvy: 0.35, mix: { star: 1 }, tip: 'tip.curves', seed: 5 },
  { to: 'shop', theme: 'meadow', length: 8000, curvy: 0.3, mix: { star: 3, cone: 2 }, tip: 'tip.cones', seed: 23 },
  { to: 'grandma', theme: 'town', length: 9000, curvy: 0.25, mix: { star: 3, cone: 1, car: 1 }, tip: 'tip.cars', seed: 7 },
  { to: 'farm', theme: 'forest', length: 9000, curvy: 0.4, mix: { star: 3, rock: 1, duck: 1 }, tip: 'tip.ducks', seed: 31 },
  { to: 'beach', theme: 'beach', length: 9000, curvy: 0.3, mix: { star: 3, puddle: 2, ramp: 1 }, tip: 'tip.ramps', seed: 4 },
  { to: 'farm', theme: 'farm', length: 9500, curvy: 0.35, mix: { star: 3, cow: 1, puddle: 1, cone: 1 }, tip: 'tip.cows', seed: 19 },
  { to: 'hut', theme: 'snow', length: 9500, curvy: 0.3, slip: true, mix: { star: 3, snowman: 2, ramp: 1 }, tip: 'tip.snow', seed: 8 },
  { to: 'icecream', theme: 'desert', length: 10000, curvy: 0.45, mix: { star: 3, rock: 2, ramp: 1, car: 1 }, tip: 'tip.desert', seed: 42 },
  { to: 'lighthouse', theme: 'night', length: 10000, curvy: 0.35, night: true, mix: { star: 3, cone: 2, duck: 1 }, tip: 'tip.night', seed: 13 },
  { to: 'hut', theme: 'mountain', length: 10500, curvy: 0.55, width: 420, mix: { star: 3, rock: 2, ramp: 1, cow: 1 }, tip: 'tip.mountain', seed: 27 },
  { to: 'castle', theme: 'rainbow', length: 12000, curvy: 0.45, mix: { star: 4, cone: 1, puddle: 1, ramp: 1, duck: 1, car: 1 }, tip: 'tip.last', seed: 3 },
];

// The endless road: these landscapes one after another, round and round (see endless() in src/track.js).
// Each one is a little faster; every round has more things on the road than stars.
export const ENDLESS = [
  { theme: 'meadow', curvy: 0.25, mix: { star: 3, cone: 1 } },
  { theme: 'town', curvy: 0.2, mix: { star: 3, cone: 1, car: 1 } },
  { theme: 'forest', curvy: 0.35, mix: { star: 3, rock: 1, duck: 1 } },
  { theme: 'beach', curvy: 0.3, mix: { star: 3, puddle: 2, ramp: 1 } },
  { theme: 'farm', curvy: 0.3, mix: { star: 3, cow: 1, puddle: 1, cone: 1 } },
  { theme: 'snow', curvy: 0.3, slip: true, mix: { star: 3, snowman: 2, ramp: 1 } },
  { theme: 'desert', curvy: 0.4, mix: { star: 3, rock: 2, ramp: 1, car: 1 } },
  { theme: 'night', curvy: 0.3, night: true, mix: { star: 3, cone: 2, duck: 1 } },
  { theme: 'mountain', curvy: 0.4, mix: { star: 3, rock: 2, ramp: 1, cow: 1 } },
  { theme: 'rainbow', curvy: 0.35, mix: { star: 4, cone: 1, puddle: 1, ramp: 1, duck: 1, car: 1 } },
];
