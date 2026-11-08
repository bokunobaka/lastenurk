// "Printsess Frida arsti juures" drawings (1600x900 SVG, SMIL-animated). Reuses the drawing kit from scenes.js.
(() => {
  const K = globalThis.SCENE_KIT;
  const FRIDA_SCENES = globalThis.SCENES; // the Frida book's scenes: the morning page is reused
  const { wrap, sky, outdoor, sun, cloud, flower, bush, grass, sparkle, bob, hop, castle, room, windowFrame, curtains, nightSky, princess, teddy, bed, CAST } = K;
  const { SIZE, who, BAG, place, eye, cheek, swing, tree, balloon, starField } = K;

  // Doctor Liis: white coat, auburn bob, glasses, a stethoscope round her neck
  CAST.liis = { name: "Liis", dress: ["#ffffff", "#f4f8fb", "#7ec8ff"], shoe: "#7ec8ff", hair: "#b5582a", hairStyle: "bob" };
  const STETH = `<path d="M-20 -196 Q-28 -150 0 -138 Q28 -150 20 -196" stroke="#546e7a" stroke-width="5" fill="none"/><circle cx="0" cy="-134" r="9" fill="#b0bec5" stroke="#546e7a" stroke-width="3"/>`;
  const GLASSES = `<g fill="none" stroke="#5d4037" stroke-width="3"><circle cx="-14" cy="-236" r="12"/><circle cx="14" cy="-236" r="12"/><path d="M-2 -236 H2"/></g>`;
  const BADGE = `<rect x="-26" y="-178" width="22" height="14" rx="3" fill="#7ec8ff"/><path d="M-15 -176 v10 M-20 -171 h10" stroke="#fff" stroke-width="3"/>`;
  const liis = (k, o = {}) => who("liis", k, { crown: false, ...o, over: `${GLASSES}${o.noSteth ? "" : STETH}${BADGE}${o.over || ""}` });
  SIZE.liis = 1.28;

  // things the doctor holds
  const CHESTPIECE = `<circle r="11" fill="#b0bec5" stroke="#546e7a" stroke-width="3"/><path d="M0 0 Q-30 -40 -60 -60" stroke="#546e7a" stroke-width="4" fill="none"/>`;
  const LIGHT = `<g transform="rotate(-30)"><rect x="-6" y="-4" width="40" height="12" rx="5" fill="#90a4ae"/><circle cx="-8" cy="2" r="9" fill="#fff59d"><animate attributeName="opacity" values="1;.5;1" dur="1s" repeatCount="indefinite"/></circle></g>`;
  const HAMMER = `<g transform="rotate(-40)"><rect x="-3" y="-6" width="6" height="44" fill="#90a4ae"/><path d="M-22 -6 L22 -6 L0 -26 Z" fill="#ff7a8a"/></g>`;
  const STAR = (c = "#ffd447", s = 1) => `<path transform="scale(${s})" d="M0 -14 L4 -5 L14 -4 L6 3 L9 13 L0 7 L-9 13 L-6 3 L-14 -4 L-4 -5 Z" fill="${c}"/>`;
  const PLASTER = `<g transform="translate(-40 -168) rotate(-60)"><rect x="-16" y="-9" width="32" height="18" rx="7" fill="#ffe0b2"/><rect x="-7" y="-9" width="14" height="18" fill="#ffcc80"/>${STAR("#ff5c8a", 0.45)}</g>`;
  const STICKER_SHEET = `<g transform="rotate(-10)"><rect x="-26" y="-34" width="52" height="40" rx="6" fill="#fff" stroke="#ddd" stroke-width="2"/>
    <g transform="translate(-12 -22)">${STAR("#ffd447", 0.6)}</g><g transform="translate(12 -22)">${STAR("#ff5c8a", 0.6)}</g><g transform="translate(0 -6)">${STAR("#2f9bff", 0.6)}</g></g>`;

  // ---------- clinic things ----------
  function clinicRoom(opts = {}) {
    const chart = opts.chart
      ? `<g transform="translate(260 700)"><rect x="-40" y="-560" width="80" height="560" rx="10" fill="#fff"/>
         ${Array.from({ length: 14 }, (_, i) => `<path d="M-40 ${-40 - i * 38} h${i % 2 ? 20 : 34}" stroke="#7ec8ff" stroke-width="4"/>`).join("")}
         <g transform="translate(20 -540) scale(.5)"><ellipse cx="0" cy="0" rx="30" ry="20" fill="#ffcf5c"/><rect x="-8" y="0" width="16" height="140" fill="#ffcf5c"/><circle cx="-6" cy="-4" r="4" fill="#3a2a2a"/></g></g>`
      : "";
    return `${room("#dff5ee", "#cfe3f5")}<rect y="0" width="1600" height="30" fill="#b9e6d8"/>
      ${opts.window === false ? "" : windowFrame(1180, 120, 280, 240, `<rect width="280" height="240" fill="#bfe7ff"/>${cloud(120, 100, 0.5)}${sun(230, 60, 30)}`)}
      <g transform="translate(700 210)"><rect x="-90" y="-80" width="180" height="160" rx="16" fill="#fff"/><path d="M0 40 C-60 0 -40 -50 0 -26 C40 -50 60 0 0 40 Z" fill="#ff7a8a">
        <animateTransform attributeName="transform" type="scale" values="1;1.08;1" dur="1s" repeatCount="indefinite"/></path></g>${chart}`;
  }
  function examBed(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-240" y="-170" width="480" height="40" rx="14" fill="#7ec8ff"/><rect x="-220" y="-180" width="440" height="16" rx="8" fill="#fff"/>
      <rect x="-220" y="-130" width="24" height="130" fill="#b0bec5"/><rect x="196" y="-130" width="24" height="130" fill="#b0bec5"/>
      <path d="M-240 -170 L-260 -250 Q-262 -262 -248 -262 L-200 -262 L-190 -170 Z" fill="#7ec8ff"/></g>`;
  }
  function scales(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-80" y="-30" width="160" height="30" rx="12" fill="#eceff1" stroke="#b0bec5" stroke-width="4"/>
      <rect x="-30" y="-24" width="60" height="18" rx="4" fill="#263238"/><text x="0" y="-10" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="16" font-weight="800" fill="#7fff7f">20</text></g>`;
  }
  function chair(x, y, c) {
    return `<g transform="translate(${x} ${y})"><rect x="-50" y="-170" width="100" height="90" rx="20" fill="${c}"/><rect x="-56" y="-90" width="112" height="24" rx="10" fill="${c}"/>
      <rect x="-46" y="-66" width="10" height="66" fill="#90a4ae"/><rect x="36" y="-66" width="10" height="66" fill="#90a4ae"/></g>`;
  }
  function blocks(x, y, s = 1) {
    const cs = ["#ff5c8a", "#ffd447", "#2f9bff", "#2fb37a", "#a66cff"];
    return `<g transform="translate(${x} ${y}) scale(${s})"><g>${swing(3, 0, 0, 2)}${cs.map((c, i) => `<rect x="${-30 + (i % 2) * 6}" y="${-60 - i * 60}" width="60" height="60" rx="6" fill="${c}"/><text x="${(i % 2) * 6}" y="${-18 - i * 60}" text-anchor="middle" font-family="Baloo 2, sans-serif" font-size="34" font-weight="800" fill="#fff">${"ABCDE"[i]}</text>`).join("")}</g></g>`;
  }
  function fishTank(x, y, s = 1) {
    const fish = (c, yy, d, b) => `<g><animateTransform attributeName="transform" type="translate" values="-120 0;120 0;-120 0" dur="${d}s" begin="${b}s" repeatCount="indefinite"/>
      <g transform="translate(0 ${yy})"><ellipse rx="22" ry="14" fill="${c}"/><path d="M-20 0 L-38 -12 L-38 12 Z" fill="${c}"/><circle cx="10" cy="-3" r="3" fill="#333"/></g></g>`;
    return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-180" y="-220" width="360" height="200" rx="16" fill="#9be3f5" stroke="#fff" stroke-width="10"/>
      <rect x="-200" y="-24" width="400" height="24" rx="8" fill="#b28b6e"/><path d="M-170 -40 Q-80 -60 0 -40 T170 -44 V-30 H-170 Z" fill="#f2ddb3"/>
      <path d="M-120 -40 Q-130 -120 -110 -160 M-100 -40 Q-90 -100 -104 -140" stroke="#2fb37a" stroke-width="8" fill="none" stroke-linecap="round"/>
      ${fish("#ff8a00", -140, 6, 0)}${fish("#ff5c8a", -90, 8, 1)}${fish("#ffd447", -170, 7, 2)}
      ${[0, 1, 2].map((i) => `<circle cx="${100 + i * 8}" cy="-50" r="5" fill="#fff" opacity=".8"><animate attributeName="cy" values="-50;-200" dur="2s" begin="${i * 0.6}s" repeatCount="indefinite"/></circle>`).join("")}</g>`;
  }
  function clinic(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-300" y="-360" width="600" height="360" fill="#fff"/><rect x="-320" y="-380" width="640" height="30" rx="10" fill="#7ec8ff"/>
      ${[-200, 200].map((wx) => `<rect x="${wx - 60}" y="-300" width="120" height="100" rx="12" fill="#bfe7ff" stroke="#7ec8ff" stroke-width="6"/>`).join("")}
      <rect x="-70" y="-180" width="140" height="180" rx="10" fill="#7ec8ff"/><circle cx="40" cy="-90" r="7" fill="#fff"/>
      <g transform="translate(0 -440)"><circle r="56" fill="#fff" stroke="#ff7a8a" stroke-width="8"/><path d="M0 30 C-50 0 -34 -40 0 -18 C34 -40 50 0 0 30 Z" fill="#ff7a8a">
        <animateTransform attributeName="transform" type="scale" values="1;1.1;1" dur="1s" repeatCount="indefinite"/></path></g></g>`;
  }
  function slide(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-10" y="-360" width="16" height="360" fill="#ff8a00"/><rect x="80" y="-360" width="16" height="360" fill="#ff8a00"/>
      ${[0, 1, 2, 3, 4].map((i) => `<rect x="-10" y="${-60 - i * 64}" width="106" height="12" fill="#ff8a00"/>`).join("")}
      <rect x="-20" y="-372" width="130" height="24" rx="8" fill="#ff5c8a"/><path d="M96 -360 Q260 -300 300 -40 L380 0 L360 20 L280 -20 Q240 -280 96 -330 Z" fill="#2f9bff"/></g>`;
  }

  // ---------- scenes ----------
  const SCENES = {
    cover() {
      return wrap(
        `${outdoor("dc")}${sun(1440, 120, 50)}${cloud(300, 140, 0.8)}${cloud(1000, 110, 0.6, 50)}
        ${clinic(800, 660, 0.95)}${grass(660)}${tree(150, 700, 0.8)}${bush(1480, 700)}
        ${flower(350, 760, "#ff7eb6")}${flower(1250, 780, "#b56cff")}
        ${who("ema", 0.85, { x: 400, y: 840, r: "wave", rAlt: { pose: "wave2", dur: 0.9 }, blink: 2 })}
        ${who("uku", 1.05, { x: 560, y: 850, l: "up", r: "up", mouth: "open", anim: hop(12, 1) })}
        ${who("frida", 1.15, { x: 800, y: 860, l: "hold", lItem: teddy(0, 50, 0.55), r: "out", anim: bob(8, 2) })}
        ${liis(0.85, { x: 1100, y: 840, flip: true, r: "wave", rAlt: { pose: "wave2", dur: 0.9, begin: 0.4 } })}
        ${sparkle(700, 330, 1.2)}${sparkle(950, 260, 1, 0.6)}`,
        sky("dc", "#9fdcff", "#fff3c4"),
      );
    },

    wake: () => FRIDA_SCENES.wake(),

    waiting() {
      return wrap(
        `${clinicRoom({ window: false })}${fishTank(1240, 520, 1)}
        ${chair(300, 720, "#ffb3d1")}${chair(440, 720, "#c9a7ff")}${chair(1460, 720, "#9be3c4")}
        <rect x="560" y="640" width="160" height="80" rx="10" fill="#ffd447"/><rect x="590" y="610" width="30" height="40" fill="#ff5c8a"/><rect x="630" y="600" width="30" height="50" fill="#2f9bff"/>
        ${who("frida", 1, { x: 290, y: 640, sit: true, l: "hold", r: "hold", rItem: teddy(0, 40, 0.55), eyes: "", mouth: "" })}
        ${who("ema", 0.95, { x: 430, y: 640, sit: true, l: "stand", r: "pet", blink: 1 })}
        ${blocks(940, 830, 0.9)}
        ${who("uku", 1.15, { x: 820, y: 840, r: "up", l: "out", mouth: "open", anim: hop(6, 1.2) })}`,
      );
    },

    hello() {
      return wrap(
        `${clinicRoom({ chart: true })}${examBed(1100, 760, 0.8)}
        ${who("ema", 0.95, { x: 450, y: 830, r: "pet", l: "hold", lItem: BAG })}
        ${who("frida", 1.05, { x: 640, y: 840, l: "hold", lItem: teddy(0, 50, 0.55), r: "wave", rAlt: { pose: "wave2", dur: 1 } })}
        ${liis(1, { x: 960, y: 830, flip: true, r: "wave", rAlt: { pose: "wave2", dur: 0.9 }, mouth: "open" })}`,
      );
    },

    measure() {
      return wrap(
        `${clinicRoom({ chart: true })}${scales(620, 830, 1.2)}
        <rect x="190" y="${700 - 268}" width="140" height="12" rx="6" fill="#ff5c8a"><animate attributeName="y" values="${700 - 330};${700 - 268}" dur="1.4s" fill="freeze"/></rect>
        ${who("frida", 1, { x: 260, y: 700, l: "stand", r: "stand", mouth: "open" })}
        ${sparkle(330, 400, 0.8)}
        ${liis(1, { x: 470, y: 830, flip: true, r: "out", l: "stand" })}
        ${who("uku", 1.1, { x: 620, y: 800, l: "up", r: "up", anim: hop(10, 1) })}
        ${who("ema", 0.95, { x: 900, y: 830, flip: true, r: "out", l: "stand", mouth: "open", blink: 1 })}`,
      );
    },

    heart() {
      const beat = `<g transform="translate(800 330)">${[0, 1].map((i) => `<path d="M0 26 C-50 0 -34 -40 0 -16 C34 -40 50 0 0 26 Z" fill="#ff7a8a" opacity="0" transform="translate(${-70 + i * 140} 0)">
        <animate attributeName="opacity" values="0;1;0" dur="1s" begin="${i * 0.5}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="scale" values="0.6;1.3;0.6" dur="1s" begin="${i * 0.5}s" repeatCount="indefinite" additive="sum"/></path>`).join("")}</g>`;
      return wrap(
        `${clinicRoom()}${examBed(760, 860, 1)}
        ${who("frida", 1.1, { x: 660, y: 680, sit: true, l: "stand", r: "mouth", mouth: "open", over: `<path d="M-8 -228 Q-30 -180 -10 -150" stroke="#546e7a" stroke-width="4" fill="none"/><circle cx="-10" cy="-228" r="5" fill="#546e7a"/>` })}
        ${liis(1.05, { x: 1000, y: 860, flip: true, r: "out", rItem: CHESTPIECE, l: "stand", noSteth: true, over: `<path d="M-20 -196 Q-28 -160 -10 -150" stroke="#546e7a" stroke-width="5" fill="none"/>` })}
        ${beat}${teddy(480, 690, 0.6)}`,
      );
    },

    throat() {
      return wrap(
        `${clinicRoom()}${examBed(760, 860, 1)}
        ${who("frida", 1.1, { x: 660, y: 680, sit: true, l: "stand", r: "stand", mouth: "open", eyes: "closed", over: `<ellipse cx="0" cy="-214" rx="10" ry="12" fill="#c2185b"/>` })}
        ${liis(1.05, { x: 940, y: 860, flip: true, r: "out", rItem: LIGHT, rAlt: { pose: "hand", dur: 2 }, l: "stand" })}
        <g transform="translate(700 470)" opacity=".6">${sparkle(0, 0, 0.8)}</g>
        ${who("uku", 1.1, { x: 380, y: 860, l: "up", r: "stand", mouth: "open", over: `<ellipse cx="0" cy="-214" rx="8" ry="10" fill="#c2185b"/>` })}`,
      );
    },

    knee() {
      // the hammer taps, Frida's feet jump up (in time with the hammer arm), and little motion lines flash
      const kick = `<animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 -18;0 0;0 0" keyTimes="0;0.45;0.55;0.7;1" dur="2s" repeatCount="indefinite"/>`;
      const lines = `<g opacity="0"><animate attributeName="opacity" values="0;0;1;0;0" keyTimes="0;0.45;0.55;0.7;1" dur="2s" repeatCount="indefinite"/>
        <path d="M770 560 l20 -24 M800 572 l28 -12 M780 548 l6 -30" stroke="#2fb37a" stroke-width="6" stroke-linecap="round"/></g>`;
      return wrap(
        `${clinicRoom()}${examBed(760, 860, 1)}
        ${who("frida", 1.1, { x: 670, y: 680, sit: true, l: "stand", r: "out", mouth: "open", anim: kick })}${lines}
        ${liis(1.05, { x: 960, y: 860, flip: true, r: "low", rItem: HAMMER, rAlt: { pose: "pet", dur: 2 }, l: "stand" })}
        ${who("ema", 0.95, { x: 360, y: 860, r: "out", mouth: "open", blink: 1 })}`,
      );
    },

    teddy() {
      return wrap(
        `${clinicRoom()}${examBed(760, 860, 1)}
        ${teddy(760, 690, 1.1)}<g transform="translate(760 620)">${CHESTPIECE.replace('<path d="M0 0 Q-30 -40 -60 -60"', '<path d="M0 0 Q30 -40 60 -60"')}</g>
        ${who("frida", 1.05, { x: 480, y: 860, l: "stand", r: "pet", mouth: "open" })}
        ${liis(1.05, { x: 1060, y: 860, flip: true, r: "out", l: "stand", mouth: "open" })}
        ${sparkle(760, 480, 1)}${sparkle(860, 540, 0.6, 0.5)}`,
      );
    },

    shot() {
      // Ema holds Frida's other hand; Frida looks at her teddy, not at the arm
      return wrap(
        `${clinicRoom()}${examBed(760, 860, 1)}${teddy(920, 690, 0.8)}
        ${who("ema", 0.95, { x: 400, y: 860, r: "hand" })}
        ${who("frida", 1.1, { x: 660, y: 680, sit: true, l: "out", r: "stand", eyes: "closed", over: `<path d="M-8 -216 Q0 -212 8 -216" stroke="#c2185b" stroke-width="3" fill="none"/>` })}
        ${liis(1.05, { x: 1080, y: 860, flip: true, r: "out", l: "stand" })}
        ${sparkle(740, 500, 0.7)}`,
      );
    },

    plaster() {
      return wrap(
        `${clinicRoom()}${examBed(760, 860, 1)}${teddy(920, 690, 0.8)}
        ${who("frida", 1.1, { x: 660, y: 680, sit: true, l: "stand", r: "up", mouth: "open", over: PLASTER })}
        ${sparkle(560, 470, 0.8)}${sparkle(610, 420, 0.5, 0.6)}
        ${liis(1.05, { x: 1080, y: 860, flip: true, r: "wave", rAlt: { pose: "wave2", dur: 1 }, l: "stand", mouth: "open" })}
        ${who("ema", 0.95, { x: 360, y: 860, r: "up", l: "stand", blink: 1 })}`,
      );
    },

    sticker() {
      return wrap(
        `${clinicRoom({ chart: true })}
        ${who("frida", 1.05, { x: 560, y: 850, r: "up", rItem: STICKER_SHEET, l: "stand", over: PLASTER, anim: bob(6, 1.2) })}
        ${who("uku", 1.25, { x: 820, y: 860, l: "up", r: "up", mouth: "open", over: `<g transform="translate(0 -262)">${STAR("#ffd447", 1.3)}</g>`, anim: hop(14, 0.9) })}
        ${liis(1, { x: 1120, y: 850, flip: true, r: "out", rItem: STICKER_SHEET, l: "stand", mouth: "open" })}
        ${who("ema", 0.95, { x: 1350, y: 850, flip: true, r: "out", l: "stand", blink: 1 })}`,
      );
    },

    playground() {
      return wrap(
        `${outdoor("dp")}${sun(1440, 120, 50)}${cloud(320, 140, 0.8)}${cloud(1000, 110, 0.6, 50)}${grass(640)}
        ${tree(1500, 680, 0.7)}${slide(1080, 760, 1)}
        <path d="M0 700 Q400 680 800 700 T1600 700 V900 H0 Z" fill="#f2ddb3" opacity=".7"/>
        ${who("frida", 1.05, { x: 560, y: 850, r: "up", l: "stand", mouth: "open", over: PLASTER, anim: bob(6, 1.2) })}
        ${princess("mia", { x: 340, y: 850, s: 0.9, r: "out", mouth: "open" })}
        ${princess("lenna", { x: 780, y: 850, s: 0.9, flip: true, l: "up", r: "up", anim: hop(10, 1.1) })}
        ${who("uku", 1, { x: 1300, y: 760, l: "up", r: "up", over: `<g transform="translate(0 -262)">${STAR("#ffd447", 1.3)}</g>`,
          anim: `<animateMotion path="M-200 -400 Q-60 -340 -20 -60 L60 0" dur="3s" repeatCount="indefinite"/>` })}
        ${who("ema", 0.9, { x: 180, y: 850, r: "out", l: "hold", lItem: BAG, blink: 1 })}`,
        sky("dp", "#9fdcff", "#e8f8ff"),
      );
    },

    bedtime() {
      const b = bed(380, 760, "#c9a7ff");
      const toySteth = `<path d="M-30 -40 Q-40 0 0 10 Q40 0 30 -40" stroke="#ff8fbf" stroke-width="6" fill="none"/><circle cx="0" cy="14" r="10" fill="#ffd447"/>`;
      return wrap(
        `${room("#4b4385", "#8a6f8f")}${windowFrame(1180, 140, 280, 260, nightSky(280, 260))}${curtains(1180, 140, 280, 260, "#c06aa0")}
        ${b.back}${b.front}
        ${teddy(800, 620, 1)}<g transform="translate(800 540)">${toySteth}</g>
        ${who("frida", 1.1, { x: 540, y: 620, pj: true, sit: true, crown: false, r: "out", rItem: CHESTPIECE.replace('<path d="M0 0 Q-30 -40 -60 -60"', ""), rAlt: { pose: "hand", dur: 1.6 }, mouth: "open" })}
        ${sparkle(900, 460, 0.7)}${sparkle(720, 400, 0.5, 0.7)}`,
      );
    },

    end() {
      return wrap(
        `${outdoor("den")}${starField()}<circle cx="150" cy="190" r="80" fill="#fff6c9"/><circle cx="190" cy="165" r="80" fill="url(#den)"/>
        <g opacity=".9">${castle(1100, 700, 0.7, "#3b3570", "#2a2560")}</g>
        <path d="M0 700 Q400 660 800 700 T1600 690 L1600 900 L0 900 Z" fill="#2a2560"/>
        <g transform="translate(560 420)"><path d="M0 60 C-110 0 -76 -90 0 -40 C76 -90 110 0 0 60 Z" fill="#ff7a8a" opacity=".85">
          <animateTransform attributeName="transform" type="scale" values="1;1.08;1" dur="1.2s" repeatCount="indefinite"/></path></g>
        ${sparkle(560, 300, 1.2)}${sparkle(1050, 200, 1, 0.6)}${sparkle(800, 160, 1.3, 1.1)}`,
        sky("den", "#1d1b4b", "#5b4b9a"),
      );
    },
  };

  globalThis.SCENES = SCENES;
})();
