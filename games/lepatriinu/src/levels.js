// The levels. Each map is a garden seen from above (the letters are explained in src/maze.js): roll the
// ladybug over every lost spot, then home to the flower, which opens when she has them all.
// At most 13 x 9 cells (or 9 x 13); on a screen the other way round the map is turned to fit.
// `tip` is a key in src/i18n.js. npm run check: every spot and the flower can be reached, every gate is needed.

export const LEVELS = [
  // 1-4: just rolling, then hedges and little mazes
  {
    tip: 'tip.first',
    map: [
      '#########',
      '#S.....*#',
      '#...*...#',
      '#*.....H#',
      '#########',
    ],
  },
  {
    tip: 'tip.walls',
    map: [
      '###########',
      '#S..*....*#',
      '#########.#',
      '#H...*....#',
      '###########',
    ],
  },
  {
    tip: 'tip.maze',
    map: [
      '###########',
      '#S..#....*#',
      '#.#.#.###.#',
      '#.#...#...#',
      '#*#####.#.#',
      '#...*...#H#',
      '###########',
    ],
  },
  {
    tip: 'tip.maze2',
    map: [
      '#############',
      '#S....#....*#',
      '#.###.#.###.#',
      '#...#...#.*.#',
      '###.#####.###',
      '#*..#...#...#',
      '#.###.#.###.#',
      '#.....#*...H#',
      '#############',
    ],
  },
  // 5-6: holes (fall in and she starts again, keeping her spots)
  {
    tip: 'tip.holes',
    map: [
      '###########',
      '#S...O...*#',
      '#..O.*.O..#',
      '#*...O...H#',
      '###########',
    ],
  },
  {
    tip: 'tip.holes2',
    map: [
      '#############',
      '#S.O..*..O.*#',
      '#....###....#',
      '#####...#.O.#',
      '#*.O#.*.#...#',
      '#..........H#',
      '#############',
    ],
  },
  // 7: mushrooms bounce
  {
    tip: 'tip.mush',
    map: [
      '###########',
      '#S..T...*.#',
      '#..T..T..*#',
      '#*...T..T.#',
      '#..T...*.H#',
      '###########',
    ],
  },
  // 8-9: ice
  {
    tip: 'tip.ice',
    map: [
      '###########',
      '#S.iiiii.*#',
      '#..iiiii..#',
      '#*.ii*ii..#',
      '#..iiiii.H#',
      '###########',
    ],
  },
  {
    tip: 'tip.ice2',
    map: [
      '#############',
      '#S.iiii*ii..#',
      '#..iiOiiOi.*#',
      '#..iiiiiii..#',
      '#*.iOii*Oi..#',
      '#..iiiiiii.H#',
      '#############',
    ],
  },
  // 10: honey
  {
    tip: 'tip.honey',
    map: [
      '#############',
      '#S..#mmm#..*#',
      '#...#mmm#...#',
      '#*..mmmmm...#',
      '#...#mmm#...#',
      '#.*.#mmm#.*H#',
      '#############',
    ],
  },
  // 11-12: flower buttons open gates
  {
    tip: 'tip.gate',
    map: [
      '###########',
      '#S...#...H#',
      '#....A....#',
      '#.a..#.*..#',
      '#*...#..*.#',
      '###########',
    ],
  },
  {
    tip: 'tip.gate2',
    map: [
      '#############',
      '#S..#...#..*#',
      '#...A...B...#',
      '#.a.#.b.#...#',
      '#*..#..*#..H#',
      '#############',
    ],
  },
  // 13-20: everything mixed
  {
    tip: 'tip.mix',
    map: [
      '#############',
      '#S..O..#..*.#',
      '#.O..O.#.O..#',
      '#...a..A..O.#',
      '#.O..O.#O...#',
      '#*..*..#..*H#',
      '#############',
    ],
  },
  {
    tip: 'tip.pinball',
    map: [
      '#############',
      '#S.iiiiiiii*#',
      '#..iiTiiTiii#',
      '#*.iiiiii*ii#',
      '#..iTiiTiiTi#',
      '#..iiiii*iiH#',
      '#############',
    ],
  },
  {
    tip: 'tip.careful',
    map: [
      '#############',
      '#S.mmmmmmm.*#',
      '#..mOmmmOm..#',
      '#*.mmm*mmm..#',
      '#..mOmmmOm..#',
      '#..mmm*mmm.H#',
      '#############',
    ],
  },
  {
    tip: 'tip.gates',
    map: [
      '#############',
      '#S....#....*#',
      '#.#####.###.#',
      '#.#a#*..#*#.#',
      '#.#.#####.#.#',
      '#...A.*.B...#',
      '###.##.##.###',
      '#*..#.b.#..H#',
      '#############',
    ],
  },
  {
    tip: 'tip.slide',
    map: [
      '#############',
      '#S.iiiiii#.*#',
      '#.#####.i#i.#',
      '#.#*..#.i#*.#',
      '#.#.#.#.iii.#',
      '#i#.#.*.##..#',
      '#i#.######.##',
      '#iiii.*...iH#',
      '#############',
    ],
  },
  {
    tip: 'tip.bumpy',
    map: [
      '#############',
      '#S..T.*.O..*#',
      '#.O...#...T.#',
      '#...#.O.#.*.#',
      '#*T...#.*.O.#',
      '#...O...T...#',
      '#.#...*...#.#',
      '#T..O.#.O..H#',
      '#############',
    ],
  },
  {
    tip: 'tip.big',
    map: [
      '#############',
      '#S..#mmm#..*#',
      '#.a.#mmm#.O.#',
      '#...A.*.#...#',
      '#####iii#B###',
      '#*.O.iii..b.#',
      '#.*..iii.O..#',
      '#..*.iii..*H#',
      '#############',
    ],
  },
  {
    tip: 'tip.last',
    map: [
      '#############',
      '#S...O..#..*#',
      '#..T..*.A.O.#',
      '#.O.*...#.T*#',
      '###.###b#...#',
      '#*..iiii#B###',
      '#.O.iTii#.*.#',
      '#a..i*ii#O.H#',
      '#############',
    ],
  },
];
