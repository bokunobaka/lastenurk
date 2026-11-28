// Reads a level's map into cells and finds ways through it (used by the game, its dev autopilot and the check).
//   #  hedge          .  path            S  the ladybug starts here    H  the flower, her home
//   *  a lost spot    O  a hole          i  ice (slippery)             m  honey (sticky, slow)
//   T  a mushroom (bounces her back)     a b c  a flower button        A B C  the gate it opens

export const SOLID = '#';

export function parse(lv) {
  const rows = lv.map;
  const H = rows.length, W = rows[0].length;
  const m = { W, H, rows, start: null, home: null, spots: [], holes: [], mush: [], buttons: [], doors: [] };
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const ch = rows[y][x];
      const at = { x, y };
      if (ch === 'S') m.start = at;
      else if (ch === 'H') m.home = at;
      else if (ch === '*') m.spots.push(at);
      else if (ch === 'O') m.holes.push(at);
      else if (ch === 'T') m.mush.push(at);
      else if ('abc'.includes(ch)) m.buttons.push({ ...at, id: ch });
      else if ('ABC'.includes(ch)) m.doors.push({ ...at, id: ch.toLowerCase() });
    }
  return m;
}

export const tile = (m, x, y) => (x < 0 || y < 0 || x >= m.W || y >= m.H ? SOLID : m.rows[y][x]);

// cells a ladybug can roll through, given which gates are open: not hedges, holes, mushrooms or shut gates
export function passable(m, x, y, open) {
  const ch = tile(m, x, y);
  if (ch === SOLID || ch === 'O' || ch === 'T') return false;
  if ('ABC'.includes(ch)) return open.has(ch.toLowerCase());
  return true;
}

// shortest steps from a cell to every cell it can reach (4 ways round, no diagonals): Map "x,y" -> { d, prev }
export function bfs(m, from, open) {
  const seen = new Map([[`${from.x},${from.y}`, { d: 0, prev: null, x: from.x, y: from.y }]]);
  const q = [from];
  while (q.length) {
    const c = q.shift();
    const here = seen.get(`${c.x},${c.y}`);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const x = c.x + dx, y = c.y + dy, k = `${x},${y}`;
      if (seen.has(k) || !passable(m, x, y, open)) continue;
      seen.set(k, { d: here.d + 1, prev: here, x, y });
      q.push({ x, y });
    }
  }
  return seen;
}

// everything reachable from the start when every button that can be reached is pressed (gates stay open);
// `never` is a gate that is kept shut, to see whether it is needed
export function reach(m, never = null) {
  const open = new Set();
  for (;;) {
    const seen = bfs(m, m.start, open);
    const more = m.buttons.filter((b) => b.id !== never && !open.has(b.id) && seen.has(`${b.x},${b.y}`));
    if (!more.length) return { seen, open };
    for (const b of more) open.add(b.id);
  }
}
