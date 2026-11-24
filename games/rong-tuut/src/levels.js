// The levels and the track rules. No DOM here, so tools/check-levels.mjs can run it in node.
//
// Each map is drawn SOLVED, with characters for the track:
//   light  ─ │ ┌ ┐ └ ┘   a piece the child can turn (it starts turned the wrong way)
//   heavy  ━ ┃ ┏ ┓ ┗ ┛   a piece that stays put
//   ┼                    a crossing (stays put; the train goes straight through)
//   = ‖                  a bridge over water, east-west / north-south (can be turned)
//   h v                  a tunnel through a hill, east-west / north-south (stays put)
//   Q q                  two curves on one piece: Q joins N-E and S-W, q joins W-N and E-S (can be turned)
//   Y                    a switch (see `switches`): a tap sends the train down its other branch
//   S start station, G goal station (each joins the one track piece that points at it)
//   . grass, T tree, R rock, ~ pond, f flowers
// riders: track tiles [x, y] where an animal friend waits for the train.
// switches: { at: [x, y], stem, a, b, solved }: the train comes in at `stem` and leaves by branch a or b
//   (sides N E S W); `solved` is the branch the route needs. It starts set to the other one.

export const LEVELS = [
  { map: ["R...","G─━S","...."], riders: [[1,1]], tip: 'tip.first' },
  { map: ["GfT.","┃.Rf","│ffT","└─S."], riders: [[0,2]], tip: 'tip.curve' },
  { map: ["G┐.~.",".└━=S","..T~T"], riders: [[1,1]], tip: 'tip.bridge' },
  { map: ["..┌┐T","T┏┛G.","S┘R..","f┐..."], riders: [[2,1]], tip: 'tip.extra' },
  { map: ["Rf.─R",".T┌┐.","..v│.","..G┗S"], riders: [[3,2],[2,1]], tip: 'tip.tunnel' },
  { map: ["..┌YS","┌─┛┃.","G..T.","....."], riders: [[1,1]], tip: 'tip.switch', switches: [{ at: [3,0], stem: 'E', a: 'W', b: 'S', solved: 'a' }] },
  { map: ["TfG..","R~‖~T","─.│.T","┌─┘└.","└─S.f"], riders: [[0,4],[2,3]] },
  { map: [".S─┐─","┌┐┌┘.","└┼┘..",".GTT.","T...."], riders: [[3,1],[0,1]], tip: 'tip.cross' },
  { map: ["┌hY┐f.","S.┃│G┐","..R└─┘",".f.│.┘"], riders: [[3,0],[5,2]], switches: [{ at: [2,0], stem: 'W', a: 'E', b: 'S', solved: 'a' }] },
  { map: ["....T","┘....","┌┐...","└QG.S",".└─━┘"], riders: [[3,4],[0,2]], tip: 'tip.double' },
  { map: ["..┘┃~.","..┐Y=┐","fT─│~│","┌──┘.S","└G...."], riders: [[3,2],[0,3]], switches: [{ at: [3,1], stem: 'E', a: 'S', b: 'N', solved: 'a' }] },
  { map: ["┘T┏┓..","┏h┼┘└.","└┐G...","┌┘....","└─SfTT"], riders: [[0,3],[3,1]] },
  { map: ["┐┌──Y━","R│..│└",".G..Y━","...┌┛│","S──┘.."], riders: [[3,4],[2,0]], tip: 'tip.two', switches: [{ at: [4,2], stem: 'S', a: 'N', b: 'E', solved: 'a' }, { at: [4,0], stem: 'S', a: 'W', b: 'E', solved: 'a' }] },
  { map: ["┌┐~~..","┗Q==─G","┌┘~~┐T","└┐.┌..","┘└S..."], riders: [[1,3],[1,2],[1,0]], tip: 'tip.three' },
  { map: ["┌┐┌R━Y┐","││.┌─┘S","└┼Gv.└.","R└━┘...",".┘..T.."], riders: [[3,1],[0,0]], switches: [{ at: [5,0], stem: 'E', a: 'S', b: 'W', solved: 'a' }] },
  { map: ["SfR..T.","└┓┃~.GT","┌qY=─┛─","┃└┐~││.","┗─┘─..f"], riders: [[1,1],[1,4],[4,2]], switches: [{ at: [2,2], stem: 'W', a: 'E', b: 'N', solved: 'a' }] },
  { map: ["┌┓S┌┐┐f","│└q┼┘┐.","│┌┘G...","││┐R.f.","└┘┘...."], riders: [[0,0],[1,4],[4,1]] },
  { map: [".S─h┐└T",".R└.│fT","f..~‖~┃","..R━Y─Y","f.│┌┐┌│","TG─┘└─┘"], riders: [[4,1],[5,5],[3,5]], switches: [{ at: [4,3], stem: 'N', a: 'E', b: 'W', solved: 'a' }, { at: [6,3], stem: 'W', a: 'S', b: 'N', solved: 'a' }] },
  { map: [".R.┃.┌┐",".─┌Y─┘│","f┘└┐┘┌┘","T━Y┼─┘.","│.G└┓┌S","...─└┘."], riders: [[4,5],[4,1],[5,2]], switches: [{ at: [3,1], stem: 'W', a: 'E', b: 'N', solved: 'a' }, { at: [2,3], stem: 'E', a: 'S', b: 'W', solved: 'a' }] },
  { map: ["│┌─┐┌┓└","└│GQ┘││","T│┌q─┘.",".└┘└─┐┘","..T.~‖~","fTTfRS."], riders: [[3,3],[4,1],[1,3]] },
  { map: ["┘QTS┐..","T━Y┐│.R","..│└q┐.",".G└─┘│┘","┌┼h─Y┘─","┗┘..┃┘."], riders: [[3,2],[4,3],[0,4]], switches: [{ at: [4,4], stem: 'E', a: 'W', b: 'S', solved: 'a' }, { at: [2,1], stem: 'E', a: 'S', b: 'W', solved: 'a' }] },
  { map: ["─┌┘┃..T","T┌┐Y┐.S","┃│└┘│T│","YQ┐.v~│","└┼┼G└=┘","T└┘T─~┌"], riders: [[6,4],[2,2],[2,5]], tip: 'tip.last', switches: [{ at: [3,1], stem: 'E', a: 'S', b: 'N', solved: 'a' }, { at: [0,3], stem: 'E', a: 'S', b: 'N', solved: 'a' }] },
];

export const DIRS = ['N', 'E', 'S', 'W'];
export const STEP = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
export const OPP = { N: 'S', E: 'W', S: 'N', W: 'E' };
const turn = (d, r) => DIRS[(DIRS.indexOf(d) + r) % 4];

// character -> [type, solved rotation, fixed, look]; rotation turns the base piece clockwise
const PIECES = {
  '│': ['I', 0, false], '─': ['I', 1, false], '└': ['L', 0, false], '┌': ['L', 1, false], '┐': ['L', 2, false], '┘': ['L', 3, false],
  '┃': ['I', 0, true], '━': ['I', 1, true], '┗': ['L', 0, true], '┏': ['L', 1, true], '┓': ['L', 2, true], '┛': ['L', 3, true],
  '┼': ['X', 0, true],
  '‖': ['I', 0, false, 'bridge'], '=': ['I', 1, false, 'bridge'],
  v: ['I', 0, true, 'tunnel'], h: ['I', 1, true, 'tunnel'],
  Q: ['D', 0, false], q: ['D', 1, false],
};
// the pairs of sides each base piece joins
const BASE = { I: [['N', 'S']], L: [['N', 'E']], X: [['N', 'S'], ['E', 'W']], D: [['N', 'E'], ['S', 'W']] };

const pairsAt = (type, rot) => BASE[type].map((pr) => pr.map((d) => turn(d, rot)));

// every side a piece touches (as it is now)
export function ends(p) {
  if (p.type === 'Y') return [p.stem, p.a, p.b];
  return pairsAt(p.type, p.rot).flat();
}

// where the train leaves a piece it came into from side `from` (null: it cannot go on)
export function exitFrom(p, from) {
  if (p.type === 'Y') {
    const out = p[p.set];
    if (from === p.stem) return out;
    return from === out ? p.stem : null;
  }
  const pr = pairsAt(p.type, p.rot).find((x) => x.includes(from));
  return pr ? pr.find((d) => d !== from) : null;
}

// what one tap does: turn the piece, or flip the switch
export function tap(p) {
  if (p.type === 'Y') p.set = p.set === 'a' ? 'b' : 'a';
  else p.rot = (p.rot + 1) % 4;
}

// map strings -> a level object. Turnable pieces start turned away from the solution
// (the same way every time, from a small seeded random).
export function parse(def, index) {
  const H = def.map.length, W = [...def.map[0]].length;
  const lv = { ...def, index, W, H, pieces: new Map(), scenery: [] };
  let seed = index * 7919 + 17;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  def.map.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      const k = `${x},${y}`;
      if (ch === 'S') lv.start = { x, y };
      else if (ch === 'G') lv.goal = { x, y };
      else if (ch === 'Y') {
        const sw = (def.switches || []).find((s) => s.at[0] === x && s.at[1] === y);
        lv.pieces.set(k, { x, y, type: 'Y', fixed: false, stem: sw.stem, a: sw.a, b: sw.b, solved: sw.solved, set: sw.solved });
      } else if (PIECES[ch]) {
        const [type, solved, fixed, look] = PIECES[ch];
        lv.pieces.set(k, { x, y, type, solved, fixed, look, rot: solved });
        if (look === 'bridge') lv.scenery.push({ x, y, ch: '~' });
      } else if ('TR~f'.includes(ch)) lv.scenery.push({ x, y, ch });
    })
  );
  // each station joins the neighbour whose solved piece points back at it
  for (const st of [lv.start, lv.goal]) {
    st.dir = DIRS.find((d) => {
      const p = lv.pieces.get(`${st.x + STEP[d][0]},${st.y + STEP[d][1]}`);
      return p && ends(p).includes(OPP[d]);
    });
  }
  lv.path = route(lv).tiles.map((t) => `${t.x},${t.y}`); // the designed route, for hints
  for (const p of lv.pieces.values()) {
    if (p.fixed) continue;
    if (p.type === 'Y') p.set = p.solved === 'a' ? 'b' : 'a';
    else if (p.type === 'I') p.rot = (p.solved + 1) % 4;
    else if (p.type === 'D') p.rot = (p.solved + (rand() < 0.5 ? 1 : 3)) % 4;
    else p.rot = (p.solved + 1 + Math.floor(rand() * 3)) % 4;
  }
  lv.riders = def.riders.map(([x, y], i) => ({ x, y, i }));
  return lv;
}

// Follows the track from the start station with the pieces as they are now.
// Returns the tiles passed ({x, y, from, to}) and 'win' or 'stop' (+ where it stopped).
export function route(lv) {
  const tiles = [];
  let { x, y } = lv.start;
  let dir = lv.start.dir;
  const seen = new Set();
  for (;;) {
    const nx = x + STEP[dir][0], ny = y + STEP[dir][1];
    const from = OPP[dir];
    if (nx === lv.goal.x && ny === lv.goal.y) {
      if (lv.goal.dir === from) return { tiles, result: 'win', from };
      return { tiles, result: 'stop', at: { x, y, dir } };
    }
    const p = lv.pieces.get(`${nx},${ny}`);
    const to = p ? exitFrom(p, from) : null;
    if (!to || seen.has(`${nx},${ny},${from}`)) return { tiles, result: 'stop', at: { x, y, dir } };
    seen.add(`${nx},${ny},${from}`);
    tiles.push({ x: nx, y: ny, from, to });
    x = nx;
    y = ny;
    dir = to;
  }
}

// the same connections, whatever the rotation (a straight piece turned twice is the same)
export function fits(p) {
  if (p.type === 'Y') return p.set === p.solved;
  const key = (rot) => pairsAt(p.type, rot).map((pr) => pr.slice().sort().join('')).sort().join('|');
  return key(p.rot) === key(p.solved);
}

// the first piece on the designed route that is set wrong (or null)
export function wrongPiece(lv) {
  for (const k of lv.path) {
    const p = lv.pieces.get(k);
    if (!p.fixed && !fits(p)) return p;
  }
  return null;
}

// where on its tile an animal waits: the corner furthest from the track (as it is when solved)
const CORNERS = [['W', 'N', 22, 22], ['N', 'E', 78, 22], ['E', 'S', 78, 78], ['S', 'W', 22, 78]];
export function riderSpot(p) {
  const pairs = p.type === 'Y' ? [[p.stem, p[p.solved]]] : pairsAt(p.type, p.solved);
  const used = new Set(pairs.flat().concat(p.type === 'Y' ? [p.a, p.b] : []));
  const bent = (c) => pairs.some((pr) => pr.includes(c[0]) && pr.includes(c[1]));
  let best = CORNERS[0], score = -9;
  for (const c of CORNERS) {
    const sc = (used.has(c[0]) ? 0 : 1) + (used.has(c[1]) ? 0 : 1) - (bent(c) ? 3 : 0);
    if (sc > score) [best, score] = [c, sc];
  }
  return [best[2], best[3]];
}

export const levels = LEVELS.map(parse);
