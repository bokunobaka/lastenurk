// How each kind of road looks: ground and road colours and what grows by the roadside
// (weights; the drawings are in src/art.js). `left`/`right` replace `decor` on one side.
// `sea: true` puts the sea on the left beyond a strip of sand. `emoji` is for signs and the endless road.
export const THEMES = {
  meadow: { emoji: '🌼', ground: '#a3d96f', spot: '#93cd5f', road: '#737885', decor: { tree: 3, bush: 3, flowers: 4, boulder: 1 } },
  town: { emoji: '🏘️', ground: '#a9d987', spot: '#99cc77', road: '#6d7280', walk: '#e9e0d2', decor: { house: 6, tree: 2, bush: 2, lamp: 2 } },
  forest: { emoji: '🌲', ground: '#7fbf5a', spot: '#72b14f', road: '#707482', decor: { pine: 6, tree: 3, mushroom: 1, bush: 2 } },
  beach: {
    emoji: '🏖️', ground: '#f4dea0', spot: '#ecd290', road: '#7a7f8a', sea: true,
    left: { umbrella: 2, shell: 2 }, right: { palm: 4, bush: 1, umbrella: 1 },
  },
  farm: { emoji: '🐄', ground: '#b7dc70', spot: '#a8d062', road: '#7b7468', decor: { hay: 2, tree: 2, flowers: 3, sunflower: 3, fence: 2 } },
  snow: { emoji: '⛄', ground: '#eef5fb', spot: '#e0ebf5', road: '#a3abb9', decor: { snowPine: 6, snowBush: 2, snowman: 1 } },
  desert: { emoji: '🌵', ground: '#f1d08c', spot: '#e6c27b', road: '#9a8672', decor: { cactus: 5, boulder: 2 } },
  night: { emoji: '🌙', ground: '#69a352', spot: '#5e984a', road: '#676c78', decor: { tree: 3, bush: 2, lamp: 3, house: 2 } },
  mountain: { emoji: '⛰️', ground: '#93c66d', spot: '#86b960', road: '#727684', left: { boulder: 4, pine: 2 }, right: { pine: 4, flowers: 2, boulder: 1 } },
  rainbow: { emoji: '🌈', ground: '#c4e8ff', spot: '#b5e0fc', road: 'rainbow', decor: { cloud: 5, lollipop: 2 } },
};

// how close to the road edge each roadside thing may stand
export const NEAR = { house: 120, palm: 60, hay: 70, cloud: 80, fence: 30, lamp: 26, snowman: 50, umbrella: 40, shell: 20 };
