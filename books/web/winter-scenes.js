// "Printsess Frida kelgutamas" drawings (1600x900 SVG, SMIL-animated). Reuses the drawing kit from scenes.js.
(() => {
  const K = globalThis.SCENE_KIT;
  const { wrap, sky, outdoor, sun, cloud, sparkle, bob, hop, castle, room, windowFrame, curtains, nightSky, princess, teddy } = K;
  const { SIZE, who, place, eye, cheek, swing, starField, dreamBed } = K;

  const SNOW = "#f4f9ff", SNOW_SHADE = "#d6e6f5";
  const RED_NOSE = `<circle cx="0" cy="-224" r="7" fill="#ff6f6f" opacity=".8"/>`;
  const CARROT = `<path d="M0 -6 L40 0 L0 6 Z" fill="#ff8a00"/><path d="M-4 -4 l-10 -8 M-4 4 l-10 8" stroke="#4caf50" stroke-width="4"/>`;
  const SNOWBALL = `<circle r="16" fill="#fff" stroke="${SNOW_SHADE}" stroke-width="3"/>`;

  // ---------- winter things ----------
  function pine(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-14" y="-60" width="28" height="60" fill="#6d4c41"/>
      ${[[0, 150], [1, 120], [2, 90]].map(([i, w]) => `<path d="M0 ${-140 - i * 90} L${w} ${-50 - i * 90} H${-w} Z" fill="#2e7d4f"/>
        <path d="M0 ${-140 - i * 90} L${w * 0.5} ${-95 - i * 90} Q0 ${-80 - i * 90} ${-w * 0.5} ${-95 - i * 90} Z" fill="#fff"/>`).join("")}</g>`;
  }
  const snowCastle = (x, y, s) => castle(x, y, s, "#ffe7f1", "#ffffff");
  function snowland(id, opts = {}) {
    return `${outdoor(id)}${opts.sun === false ? "" : sun(1440, 120, 50)}${cloud(300, 130, 0.7)}${cloud(1000, 100, 0.6, 50)}
      ${opts.back || ""}
      <path d="M0 ${opts.y ?? 640} Q400 ${(opts.y ?? 640) - 50} 800 ${opts.y ?? 640} T1600 ${(opts.y ?? 640) - 10} V900 H0 Z" fill="${SNOW}"/>
      <path d="M0 ${(opts.y ?? 640) + 70} Q500 ${(opts.y ?? 640) + 30} 1000 ${(opts.y ?? 640) + 80} T1600 ${(opts.y ?? 640) + 60}" stroke="${SNOW_SHADE}" stroke-width="10" fill="none" opacity=".7"/>`;
  }
  function sled(x, y, s = 1, c = "#e53935", rider = "") {
    return `<g transform="translate(${x} ${y}) scale(${s})">${rider}
      <rect x="-110" y="-46" width="220" height="22" rx="8" fill="${c}"/>${[-80, -40, 0, 40, 80].map((dx) => `<rect x="${dx - 4}" y="-46" width="8" height="22" fill="#fff" opacity=".35"/>`).join("")}
      <path d="M-90 -24 V-6 M90 -24 V-6" stroke="#8d6e63" stroke-width="8"/>
      <path d="M-130 -6 H110 Q150 -6 140 -40" stroke="#8d6e63" stroke-width="8" fill="none" stroke-linecap="round"/></g>`;
  }
  // o.scarf colour; o.wave: the stick arm waves
  function snowman(o = {}) {
    const ball = (cy, r) => `<circle cx="0" cy="${cy}" r="${r}" fill="#fff" stroke="${SNOW_SHADE}" stroke-width="4"/><ellipse cx="${-r * 0.35}" cy="${cy - r * 0.35}" rx="${r * 0.3}" ry="${r * 0.2}" fill="#fff"/>`;
    return place(o, `
      <path d="M-80 -230 L-170 -290 M-140 -270 L-150 -300" stroke="#6d4c41" stroke-width="8" stroke-linecap="round"/>
      <g>${o.wave ? swing(16, 80, -230, 1) : ""}<path d="M80 -230 L170 -300 M140 -276 L160 -250" stroke="#6d4c41" stroke-width="8" stroke-linecap="round"/></g>
      ${ball(-90, 100)}${ball(-240, 76)}${ball(-360, 56)}
      ${[-260, -225, -190].map((cy) => `<circle cx="0" cy="${cy}" r="7" fill="#37474f"/>`).join("")}
      ${o.scarf ? `<path d="M-52 -308 Q0 -290 52 -308 L50 -288 Q0 -272 -50 -288 Z" fill="${o.scarf}"/><path d="M24 -296 L40 -236 L22 -236 L12 -294 Z" fill="${o.scarf}"/>` : ""}
      ${o.eyes === "closed" ? eye(-18, -376, 7, o) + eye(18, -376, 7, o) : `<circle cx="-18" cy="-376" r="7" fill="#37474f"/><circle cx="18" cy="-376" r="7" fill="#37474f"/>`}
      <path d="M0 -362 L52 -354 L0 -346 Z" fill="#ff8a00"/>${cheek(-30, -350, 9)}${cheek(30, -350, 9)}
      ${[-16, -8, 0, 8, 16].map((dx) => `<circle cx="${dx}" cy="${-336 + Math.abs(dx) * -0.3}" r="3.5" fill="#37474f"/>`).join("")}
      ${o.hat ? `<rect x="-40" y="-420" width="80" height="12" rx="4" fill="#37474f"/><rect x="-26" y="-470" width="52" height="54" rx="6" fill="#37474f"/><rect x="-26" y="-436" width="52" height="10" fill="#e53935"/>` : ""}`);
  }
  function mug(x, y, s = 1, c = "#ff8fbf") {
    const steam = [0, 1].map((i) => `<path d="M${-10 + i * 20} -60 q-12 -20 0 -40 q12 -20 0 -40" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8">
      <animateTransform attributeName="transform" type="translate" values="0 0;0 -30" dur="2s" begin="${i * 0.8}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.9;0" dur="2s" begin="${i * 0.8}s" repeatCount="indefinite"/></path>`).join("");
    return `<g transform="translate(${x} ${y}) scale(${s})">${steam}<rect x="-34" y="-60" width="68" height="60" rx="12" fill="${c}"/>
      <path d="M34 -46 Q58 -46 56 -26 Q54 -8 34 -12" stroke="${c}" stroke-width="10" fill="none"/>
      <ellipse cx="0" cy="-58" rx="30" ry="8" fill="#8d5a32"/><rect x="-18" y="-68" width="14" height="12" rx="3" fill="#fff"/><rect x="2" y="-66" width="14" height="12" rx="3" fill="#ffd6ec"/></g>`;
  }
  const footprints = (x0, y0, n, dx, dy) => Array.from({ length: n }, (_, i) => `<ellipse cx="${x0 + i * dx}" cy="${y0 + i * dy + (i % 2) * 14}" rx="12" ry="6" fill="${SNOW_SHADE}"/>`).join("");
  const puff = (x, y, s = 1, b = 0) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="0"><animate attributeName="opacity" values="0;1;0" dur="1.6s" begin="${b}s" repeatCount="indefinite"/>
    ${[[-30, 0, 22], [0, -20, 26], [30, 0, 22], [-10, 14, 18], [16, 12, 18]].map(([dx, dy, r]) => `<circle cx="${dx}" cy="${dy}" r="${r}" fill="#fff"/>`).join("")}</g>`;
  const indoorSnow = (w, h) => Array.from({ length: 16 }, (_, i) => `<circle cx="${(i * 73) % w}" cy="-10" r="${3 + (i % 3) * 2}" fill="#fff">
    <animate attributeName="cy" values="-10;${h + 10}" dur="${3 + (i % 4)}s" begin="${-(i * 0.7) % 4}s" repeatCount="indefinite"/></circle>`).join("");
  function snowyView(w, h, night = false) {
    return `<rect width="${w}" height="${h}" fill="${night ? "#1d1b4b" : "#cfe3f5"}"/>
      ${night ? `<circle cx="${w * 0.8}" cy="${h * 0.22}" r="34" fill="#fff6c9"/>` : ""}
      <path d="M0 ${h * 0.7} Q${w / 2} ${h * 0.55} ${w} ${h * 0.68} V${h} H0 Z" fill="${night ? "#c9d6f0" : "#fff"}"/>
      <g transform="translate(${w * 0.2} ${h * 0.72}) scale(${w / 1600})">${pine(0, 0, 1.6)}</g><g transform="translate(${w * 0.86} ${h * 0.7}) scale(${w / 1600})">${pine(0, 0, 1.2)}</g>
      ${indoorSnow(w, h)}`;
  }

  // ---------- scenes ----------
  const SCENES = {
    cover() {
      return wrap(
        `${snowland("wc", { back: `${snowCastle(260, 640, 0.55)}${pine(1450, 620, 0.9)}${pine(1300, 640, 0.7)}` })}
        ${snowman({ x: 1220, y: 780, s: 0.8, scarf: "#4fc3b5", wave: true, hat: true })}
        ${who("isa", 0.85, { x: 400, y: 840, winter: true, r: "wave", rAlt: { pose: "wave2", dur: 0.9 } })}
        ${sled(620, 860, 0.9, "#e53935", who("uku", 1.1, { x: -20, y: -30, winter: true, sit: true, l: "up", r: "up", mouth: "open" }))}
        ${who("ema", 0.85, { x: 1000, y: 840, winter: true, flip: true, r: "wave", rAlt: { pose: "wave2", dur: 0.9, begin: 0.3 }, blink: 2 })}
        ${who("frida", 1.15, { x: 830, y: 860, winter: true, l: "out", r: "out", anim: bob(8, 2) })}
        ${sparkle(700, 330, 1.2)}${sparkle(980, 260, 1, 0.6)}`,
        sky("wc", "#bcdcf5", "#eef6ff"),
      );
    },

    window() {
      const w = 620, h = 440;
      return wrap(
        `${room("#ffe7f1")}${windowFrame(380, 130, w, h, snowyView(w, h))}${curtains(380, 130, w, h, "#ff9fc8")}
        <rect x="360" y="570" width="660" height="26" rx="10" fill="#fff"/>
        ${who("frida", 1.15, { x: 1180, y: 820, pj: true, crown: false, flip: true, r: "out", l: "up", mouth: "open", anim: hop(10, 1.2) })}
        ${teddy(1420, 780, 0.8)}`,
      );
    },

    dressup() {
      const ball = `<ellipse cx="0" cy="-130" rx="78" ry="74" fill="#ff9f43"/><path d="M-70 -150 Q0 -136 70 -150 M-74 -110 Q0 -96 74 -110" stroke="#fff" stroke-width="5" fill="none" opacity=".4"/>
        <rect x="-46" y="-206" width="92" height="22" rx="11" fill="#3f7fd0"/>`;
      const hooks = [300, 500, 1100, 1300].map((x, i) => `<circle cx="${x}" cy="300" r="10" fill="#b28b6e"/><path d="M${x - 30} 310 Q${x} 300 ${x + 30} 310 L${x + 40} 460 Q${x} 470 ${x - 40} 460 Z" fill="${["#e53935", "#ffd447", "#a66cff", "#2fb37a"][i]}" opacity=".7"/>`).join("");
      return wrap(
        `${room("#fff4d6", "#c9925f")}<rect x="200" y="280" width="1200" height="16" rx="8" fill="#b28b6e"/>${hooks}
        ${[[640, 690], [700, 700], [920, 690]].map(([x, y]) => `<rect x="${x}" y="${y}" width="40" height="30" rx="8" fill="#6d4c41"/>`).join("")}
        ${who("isa", 0.95, { x: 260, y: 820, winter: true, r: "out", l: "stand", mouth: "open" })}
        ${who("ema", 0.95, { x: 1340, y: 820, winter: true, flip: true, r: "pet", l: "stand", blink: 1 })}
        ${who("frida", 1.05, { x: 560, y: 830, winter: true, l: "hold", r: "up", mouth: "open", anim: bob(6, 1.2) })}
        ${who("uku", 1.25, { x: 1040, y: 840, winter: true, l: "out", r: "out", mouth: "open", over: ball, anim: `<animateTransform attributeName="transform" type="rotate" values="-6;6;-6" dur="1s" repeatCount="indefinite"/>` })}`,
      );
    },

    outside() {
      const isaX = 1100, isaY = 840, isaS = SIZE.isa * 0.95;
      const handX = isaX - 50 * isaS, handY = isaY - 112 * isaS;
      return wrap(
        `${snowland("wo", { back: `${snowCastle(1380, 640, 0.5)}${pine(160, 650, 0.9)}${pine(320, 660, 0.6)}` })}
        ${footprints(200, 860, 10, 70, -4)}
        ${who("ema", 0.9, { x: 220, y: 850, winter: true, r: "out", l: "stand", anim: bob(5, 0.9) })}
        ${who("frida", 1, { x: 420, y: 860, winter: true, r: "wave", rAlt: { pose: "wave2", dur: 0.9 }, mouth: "open", anim: bob(5, 0.9, 0.3) })}
        <path d="M${740} 818 Q${(740 + handX) / 2} 860 ${handX} ${handY}" stroke="#8d6e63" stroke-width="6" fill="none"/>
        ${sled(650, 870, 1, "#e53935", who("uku", 1.1, { x: -10, y: -30, winter: true, sit: true, l: "hold", r: "up", mouth: "open" }))}
        ${who("isa", 0.95, { x: isaX, y: isaY, winter: true, flip: true, r: "stand", l: "stand", anim: bob(5, 0.9, 0.6) })}`,
        sky("wo", "#bcdcf5", "#eef6ff"),
      );
    },

    snowman() {
      return wrap(
        `${snowland("ws", { back: `${pine(180, 650, 1)}${pine(1440, 640, 1)}${pine(1300, 660, 0.6)}` })}
        ${snowman({ x: 800, y: 800, s: 1.05, scarf: "#4fc3b5" })}
        ${who("frida", 1.05, { x: 600, y: 840, winter: true, r: "reach", rItem: `<g transform="translate(10 0)">${CARROT}</g>`, l: "stand", mouth: "open" })}
        ${who("ema", 0.95, { x: 1060, y: 840, winter: true, flip: true, r: "out", l: "stand", blink: 1 })}
        <g><animateTransform attributeName="transform" type="translate" values="0 0;40 0;0 0" dur="3s" repeatCount="indefinite"/>
          <circle cx="1310" cy="810" r="56" fill="#fff" stroke="${SNOW_SHADE}" stroke-width="4"/>
          ${who("uku", 1.1, { x: 1420, y: 860, winter: true, flip: true, r: "out", l: "out", mouth: "open" })}</g>`,
        sky("ws", "#bcdcf5", "#eef6ff"),
      );
    },

    sledding() {
      const slope = "M-20 380 Q300 380 700 600 T1620 820";
      const ride = `<g><animateMotion path="M120 370 Q400 390 760 600 T1500 800" dur="4.5s" repeatCount="indefinite" keyPoints="0;0;1;1" keyTimes="0;0.15;0.85;1" calcMode="linear"/>
        <g transform="rotate(22)">${sled(0, 0, 0.85, "#e53935", `${who("isa", 0.8, { x: -40, y: -30, winter: true, sit: true, l: "hold", r: "hold", mouth: "open" })}${who("frida", 0.95, { x: 40, y: -30, winter: true, sit: true, l: "up", r: "up", mouth: "open" })}`)}
          ${puff(-110, -10, 0.8)}</g></g>`;
      return wrap(
        `${outdoor("wsl")}${sun(1440, 110, 50)}${cloud(900, 120, 0.7)}
        ${pine(1200, 560, 0.9)}${pine(1380, 600, 0.7)}${pine(1060, 600, 0.5)}
        <path d="${slope} V900 H-20 Z" fill="${SNOW}"/><path d="${slope}" stroke="${SNOW_SHADE}" stroke-width="12" fill="none"/>
        <path d="M-20 900 L-20 780 Q600 760 1620 860 V900 Z" fill="${SNOW_SHADE}" opacity=".5"/>
        ${who("ema", 0.7, { x: 120, y: 390, winter: true, r: "wave", rAlt: { pose: "wave2", dur: 0.9 } })}
        ${who("uku", 0.8, { x: 230, y: 395, winter: true, l: "up", r: "up", anim: hop(8, 0.8) })}
        ${ride}`,
        sky("wsl", "#bcdcf5", "#eef6ff"),
      );
    },

    tumble() {
      return wrap(
        `${snowland("wt", { back: `${pine(200, 640, 1)}${pine(1420, 640, 1.1)}` })}
        <g transform="translate(1000 820) rotate(160)">${sled(0, 0, 0.8, "#2f9bff")}</g>
        ${puff(820, 760, 1.6)}${puff(940, 720, 1.1, 0.5)}
        ${who("uku", 1.25, { x: 780, y: 850, winter: true, sit: true, l: "up", r: "up", mouth: "open", anim: `<animateTransform attributeName="transform" type="rotate" values="-8;8;-8" dur="1s" repeatCount="indefinite"/>`, over: `<circle cx="-20" cy="-300" r="14" fill="#fff"/><circle cx="10" cy="-310" r="10" fill="#fff"/>` })}
        ${who("ema", 0.95, { x: 480, y: 850, winter: true, r: "out", l: "stand", mouth: "open", blink: 1 })}
        ${who("frida", 0.95, { x: 1260, y: 850, winter: true, flip: true, l: "up", r: "up", mouth: "open", anim: hop(10, 1) })}`,
        sky("wt", "#bcdcf5", "#eef6ff"),
      );
    },

    climb() {
      const slope = "M-20 300 Q500 340 900 560 T1620 760";
      const fx = 820, fy = 520, tilt = -14; // Frida's feet on the slope, leaning uphill
      const rot = (dx, dy) => {
        const a = (tilt * Math.PI) / 180;
        return [fx + dx * Math.cos(a) - dy * Math.sin(a), fy + dx * Math.sin(a) + dy * Math.cos(a)];
      };
      const [hx, hy] = rot(92, -172); // her hand (flipped "out" arm)
      const sx = 1120, sy = 668;
      return wrap(
        `${outdoor("wcl")}${sun(200, 110, 50)}${cloud(900, 120, 0.7)}
        <path d="${slope} V900 H-20 Z" fill="${SNOW}"/><path d="${slope}" stroke="${SNOW_SHADE}" stroke-width="12" fill="none"/>
        ${footprints(1460, 760, 7, -60, -24)}
        ${who("isa", 0.75, { x: 200, y: 310, winter: true, r: "wave", rAlt: { pose: "wave2", dur: 0.9 } })}
        ${who("uku", 0.8, { x: 320, y: 315, winter: true, l: "up", r: "up", anim: hop(8, 0.8) })}
        <g transform="translate(${sx} ${sy}) rotate(17) scale(-1 1)">${sled(0, 0, 0.8, "#e53935")}</g>
        <path d="M${sx - 104} ${sy - 50} Q${(sx - 104 + hx) / 2} ${(sy - 50 + hy) / 2 + 40} ${hx.toFixed(1)} ${hy.toFixed(1)}" stroke="#8d6e63" stroke-width="6" fill="none"/>
        <g transform="rotate(${tilt} ${fx} ${fy})">${who("frida", 1, { x: fx, y: fy, winter: true, flip: true, r: "stand", l: "out", eyes: "closed", anim: bob(6, 0.6) })}</g>`,
        sky("wcl", "#bcdcf5", "#eef6ff"),
      );
    },

    angels() {
      // seen from above: the children lie in the snow; wing-shaped prints fan out behind their arms
      const angel = (x, y, id, k) => `<g transform="translate(${x} ${y}) rotate(-90)">
        <path d="M-20 -60 Q-200 -220 -120 -300 Q-60 -250 -10 -180 Z M20 -60 Q200 -220 120 -300 Q60 -250 10 -180 Z" fill="${SNOW_SHADE}" transform="scale(${k})"/>
        <path d="M-90 0 Q0 80 90 0 L60 -100 H-60 Z" fill="${SNOW_SHADE}" transform="scale(${k})"/>
        ${who(id, k, { winter: true, l: "out", r: "out", lAlt: { pose: "up", dur: 1.4 }, rAlt: { pose: "up", dur: 1.4 }, mouth: "open" })}</g>`;
      return wrap(
        `<rect width="1600" height="900" fill="${SNOW}"/>
        ${Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 263) % 1600}" cy="${(i * 151) % 900}" r="${3 + (i % 3)}" fill="${SNOW_SHADE}"/>`).join("")}
        ${angel(500, 300, "frida", 1.25)}${angel(560, 700, "uku", 1.35)}
        ${who("isa", 0.9, { x: 1200, y: 820, winter: true, flip: true, r: "out", l: "stand", mouth: "open" })}
        ${sparkle(900, 200, 1)}${sparkle(1000, 500, 0.8, 0.6)}`,
      );
    },

    snowballs() {
      const fly = (path, b) => `<g><animateMotion path="${path}" dur="1.6s" begin="${b}s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;0.7;1" calcMode="linear"/>
        <g><animate attributeName="opacity" values="1;1;0" keyTimes="0;0.7;0.75" dur="1.6s" begin="${b}s" repeatCount="indefinite"/>${SNOWBALL}</g></g>`;
      const wall = (x) => `<path d="M${x - 140} 860 Q${x - 140} 700 ${x} 690 Q${x + 140} 700 ${x + 140} 860 Z" fill="#fff" stroke="${SNOW_SHADE}" stroke-width="5"/>`;
      return wrap(
        `${snowland("wsb", { back: `${pine(800, 640, 1.1)}${pine(640, 650, 0.6)}${pine(980, 650, 0.6)}` })}
        ${who("isa", 1, { x: 1300, y: 830, winter: true, flip: true, r: "up", rItem: SNOWBALL, rAlt: { pose: "out", dur: 1.6 }, mouth: "open" })}${wall(1300)}
        ${who("frida", 1.05, { x: 330, y: 840, winter: true, r: "up", rItem: SNOWBALL, rAlt: { pose: "out", dur: 1.6, begin: 0.8 }, mouth: "open" })}
        ${who("uku", 1.1, { x: 520, y: 850, winter: true, l: "hold", r: "hold", rItem: SNOWBALL, anim: hop(10, 1) })}
        ${fly("M1200 520 Q800 300 420 560", 0)}${fly("M420 540 Q800 300 1240 560", 0.8)}
        ${puff(420, 560, 0.8, 1.1)}${puff(1240, 560, 0.8, 1.9)}`,
        sky("wsb", "#bcdcf5", "#eef6ff"),
      );
    },

    cocoa() {
      const fire = `<g transform="translate(1340 700)"><rect x="-160" y="-300" width="320" height="300" fill="#c97b63"/><rect x="-110" y="-200" width="220" height="200" rx="20" fill="#3e2723"/>
        <rect x="-190" y="-320" width="380" height="30" rx="8" fill="#8d5d3b"/>
        ${[0, 1, 2].map((i) => `<path d="M${-60 + i * 50} 0 Q${-90 + i * 50} -70 ${-50 + i * 50} -130 Q${-20 + i * 50} -70 ${-40 + i * 50} 0 Z" fill="${["#ff8a00", "#ffd447", "#ff5c3a"][i]}">
          <animateTransform attributeName="transform" type="scale" values="1 1;1 1.15;1 1" dur="${0.6 + i * 0.2}s" repeatCount="indefinite" additive="sum"/></path>`).join("")}</g>`;
      return wrap(
        `${room("#fff1d6", "#c9925f")}${windowFrame(140, 130, 300, 260, snowyView(300, 260))}${fire}
        <rect x="250" y="722" width="860" height="26" rx="10" fill="#8d5d3b"/><rect x="270" y="748" width="24" height="152" fill="#6d4c41"/><rect x="1066" y="748" width="24" height="152" fill="#6d4c41"/>
        ${who("isa", 0.9, { x: 380, y: 720, sit: true, r: "mouth", rItem: mug(0, 20, 0.5, "#4a7fd6"), rAlt: { pose: "hold", dur: 2.4 }, over: RED_NOSE })}
        ${who("ema", 0.9, { x: 980, y: 720, sit: true, flip: true, r: "hold", rItem: mug(0, 20, 0.5, "#4fc3b5"), over: RED_NOSE, blink: 1 })}
        ${who("frida", 1, { x: 580, y: 730, sit: true, r: "mouth", rItem: mug(0, 20, 0.5, "#ff8fbf"), rAlt: { pose: "hold", dur: 1.8 }, over: RED_NOSE })}
        ${who("uku", 1.1, { x: 780, y: 730, sit: true, flip: true, r: "hold", rItem: mug(0, 20, 0.5, "#ff9f43"), l: "up", mouth: "open", over: `${RED_NOSE}<path d="M-16 -208 Q0 -200 16 -208" stroke="#8d5a32" stroke-width="6" stroke-linecap="round"/>` })}
        <rect x="260" y="640" width="840" height="44" rx="14" fill="#b28b6e"/><rect x="300" y="684" width="34" height="216" fill="#8d5d3b"/><rect x="1026" y="684" width="34" height="216" fill="#8d5d3b"/>`,
      );
    },

    evening() {
      const w = 620, h = 440;
      const view = `${snowyView(w, h, true)}<g transform="translate(${w * 0.55} ${h * 0.86}) scale(.62)">${snowman({ scarf: "#4fc3b5", hat: true, wave: true })}</g>`;
      return wrap(
        `${room("#ead7f3")}${windowFrame(380, 130, w, h, view)}${curtains(380, 130, w, h, "#c06aa0")}
        <rect x="360" y="570" width="660" height="26" rx="10" fill="#fff"/>
        ${who("frida", 1.15, { x: 1180, y: 820, pj: true, crown: false, flip: true, r: "wave", rAlt: { pose: "wave2", dur: 0.9 }, l: "stand" })}
        ${teddy(1420, 780, 0.8)}`,
      );
    },

    bedtime() {
      return dreamBed([
        [170, 240, snowman({ x: 0, y: 160, s: 0.36, scarf: "#4fc3b5", hat: true })],
        [800, 170, `<g transform="rotate(18)">${sled(0, 40, 0.65, "#e53935", princess("frida", { x: 20, y: -20, s: 0.55, winter: true, sit: true, l: "up", r: "up" }))}</g>`],
        [1000, 420, mug(0, 40, 1.2, "#ff8fbf")],
        [1330, 560, `<g stroke="#6fb6e8" stroke-width="9" stroke-linecap="round">${[0, 60, 120].map((a) => `<path d="M0 -50 V50 M-14 -38 L0 -26 L14 -38 M-14 38 L0 26 L14 38" transform="rotate(${a})"/>`).join("")}</g>`],
      ], "#cfe3f5");
    },

    end() {
      return wrap(
        `${outdoor("wen")}${starField()}<circle cx="150" cy="190" r="80" fill="#fff6c9"/><circle cx="190" cy="165" r="80" fill="url(#wen)"/>
        <g opacity=".9">${castle(1100, 690, 0.7, "#3b3570", "#e8eef8")}</g>${pine(300, 700, 0.9).replace(/#2e7d4f/g, "#24405a")}
        <path d="M0 690 Q400 650 800 690 T1600 680 L1600 900 L0 900 Z" fill="#c9d6f0"/>
        <g opacity=".8">${snowman({ x: 620, y: 800, s: 0.55, scarf: "#4fc3b5", hat: true, eyes: "closed" })}</g>
        ${sparkle(560, 300, 1.2)}${sparkle(1050, 200, 1, 0.6)}${sparkle(800, 160, 1.3, 1.1)}`,
        sky("wen", "#1d1b4b", "#5b4b9a"),
      );
    },
  };

  globalThis.SCENES = SCENES;
})();
