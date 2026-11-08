// "Printsess Frida lõbustuspargis" drawings (1600x900 SVG, SMIL-animated). Reuses the drawing kit from scenes.js.
(() => {
  const K = globalThis.SCENE_KIT;
  const FRIDA_SCENES = globalThis.SCENES; // the Frida book's scenes: the morning page is reused
  const { wrap, sky, outdoor, sun, cloud, grass, sparkle, bob, hop, castle, teddy, princess } = K;
  const { SIZE, who, BAG, place, eye, cheek, swing, spin, walkway, tree, balloon, starField, dreamBed } = K;

  const COLORS = ["#ff5c8a", "#a66cff", "#ffd447", "#2f9bff", "#2fb37a", "#ff8a00"];
  const FLOSS = `<g><rect x="-3" y="-10" width="6" height="60" fill="#fff" stroke="#ddd"/><circle cx="0" cy="-30" r="30" fill="#ffb3d9"/><circle cx="-18" cy="-44" r="20" fill="#ffc6e3"/><circle cx="16" cy="-46" r="22" fill="#ffb3d9"/><circle cx="0" cy="-62" r="18" fill="#ffd6ec"/></g>`;
  const STICKY = `<ellipse cx="0" cy="-221" rx="9" ry="6" fill="#ffb3d9"/>`; // candyfloss on the nose
  const ROD = `<g><path d="M0 0 L90 -90" stroke="#8d5d3b" stroke-width="6" stroke-linecap="round"/><path d="M90 -90 Q100 -40 96 20" stroke="#555" stroke-width="2" fill="none"/>
    <g transform="translate(96 30)"><path d="M0 -10 V6 Q0 14 -8 10" stroke="#555" stroke-width="3" fill="none"/>${duck(0, 18, 0.5)}</g></g>`;
  function duck(x, y, s = 1, c = "#ffd447") {
    return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="34" ry="22" fill="${c}"/><path d="M24 -6 L44 -20 L36 4 Z" fill="${c}"/>
      <circle cx="-16" cy="-28" r="18" fill="${c}"/><path d="M-32 -28 L-48 -24 L-32 -20 Z" fill="#ff8a00"/>${eye(-20, -32, 3.5)}</g>`;
  }

  // ---------- fair things ----------
  function bunting(y, night = false) {
    const flags = Array.from({ length: 20 }, (_, i) => {
      const x = i * 84 + 20, yy = y + Math.sin((i / 19) * Math.PI) * 50;
      return night
        ? `<circle cx="${x}" cy="${yy + 10}" r="9" fill="${COLORS[i % 6]}"><animate attributeName="opacity" values="1;.3;1" dur="${1 + (i % 3) * 0.4}s" repeatCount="indefinite"/></circle>`
        : `<path d="M${x - 24} ${yy} L${x + 24} ${yy} L${x} ${yy + 44} Z" fill="${COLORS[i % 6]}">${swing(6, x, yy, 2 + (i % 3) * 0.3, i * 0.1)}</path>`;
    }).join("");
    return `<path d="M-20 ${y} ${Array.from({ length: 20 }, (_, i) => `L${i * 84 + 20} ${y + Math.sin((i / 19) * Math.PI) * 50}`).join(" ")} L1620 ${y}" stroke="#fff" stroke-width="3" fill="none"/>${flags}`;
  }
  const fair = (id, opts = {}) =>
    `${outdoor(id)}${opts.night ? starField(30, 400) : `${sun(1440, 120, 50)}${cloud(320, 140, 0.7)}${cloud(1000, 110, 0.6, 50)}`}
    ${opts.back || ""}${grass(opts.groundY ?? 660, opts.night ? "#3f6f4a" : "#8bd17c")}${walkway(opts.pathY ?? 790, opts.night ? "#8a7a6a" : "#f2ddb3")}`;

  // big wheel: centre (0, -h), radius r; gondolas stay upright (counter-rotating)
  function bigWheel(x, y, s = 1, o = {}) {
    const r = 280, h = 380, n = 8, dur = o.dur || 40;
    const gondolas = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2, gx = Math.cos(a) * r, gy = -h + Math.sin(a) * r;
      return `<g transform="translate(${gx.toFixed(1)} ${gy.toFixed(1)})"><g>${spin(0, 0, dur, true)}
        <path d="M0 0 V22" stroke="#666" stroke-width="4"/><path d="M-34 22 H34 L28 70 Q0 80 -28 70 Z" fill="${COLORS[i % 6]}"/>
        <path d="M-34 22 Q0 0 34 22" fill="${COLORS[(i + 2) % 6]}"/>${o.riders && i === 3 ? o.riders : ""}</g></g>`;
    }).join("");
    const bulbs = o.night
      ? Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2;
          return `<circle cx="${(Math.cos(a) * r).toFixed(1)}" cy="${(-h + Math.sin(a) * r).toFixed(1)}" r="8" fill="${COLORS[i % 6]}"><animate attributeName="opacity" values="1;.3;1" dur="${0.8 + (i % 4) * 0.3}s" repeatCount="indefinite"/></circle>`;
        }).join("")
      : "";
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M-200 0 L0 ${-h} L200 0" stroke="${o.night ? "#5b4b9a" : "#c0c4d6"}" stroke-width="22" fill="none" stroke-linejoin="round"/>
      <g>${spin(0, -h, dur)}
        <circle cx="0" cy="${-h}" r="${r}" fill="none" stroke="${o.night ? "#ffd447" : "#ff5c8a"}" stroke-width="12"/>
        <circle cx="0" cy="${-h}" r="${r - 40}" fill="none" stroke="${o.night ? "#ffd447" : "#ff5c8a"}" stroke-width="5" opacity=".6"/>
        ${Array.from({ length: n }, (_, i) => `<path d="M0 ${-h} L${(Math.cos((i / n) * Math.PI * 2) * r).toFixed(1)} ${(-h + Math.sin((i / n) * Math.PI * 2) * r).toFixed(1)}" stroke="${o.night ? "#fff3b0" : "#fff"}" stroke-width="6"/>`).join("")}
        ${bulbs}${gondolas}</g>
      <circle cx="0" cy="${-h}" r="30" fill="#ffd447"/></g>`;
  }

  function carouselHorse(c = "#fff", mane = "#ff8fbf") {
    return `<g><ellipse cx="0" cy="0" rx="70" ry="34" fill="${c}"/><path d="M40 -10 L80 -70 L110 -60 L76 6 Z" fill="${c}"/>
      <ellipse cx="104" cy="-62" rx="38" ry="20" fill="${c}" transform="rotate(28 104 -62)"/><path d="M44 -22 Q66 -80 96 -82 L90 -66 Q70 -50 60 -14 Z" fill="${mane}"/>
      ${eye(104, -70, 5)}<path d="M-40 20 L-60 70 M-10 24 L-14 74 M30 24 L44 70 M54 16 L74 60" stroke="${c}" stroke-width="14" stroke-linecap="round"/>
      <path d="M-66 -6 Q-110 10 -96 60" stroke="${mane}" stroke-width="16" fill="none" stroke-linecap="round"/>
      <path d="M-30 -32 Q0 -42 30 -32 L26 4 Q0 10 -26 4 Z" fill="#ffd447"/></g>`;
  }
  function carouselLion() {
    return `<g><ellipse cx="0" cy="0" rx="70" ry="34" fill="#ffcf5c"/><path d="M-40 20 L-50 70 M-10 24 L-10 74 M30 24 L40 70 M54 16 L66 60" stroke="#ffcf5c" stroke-width="14" stroke-linecap="round"/>
      <path d="M-66 -6 Q-110 0 -104 50" stroke="#ffcf5c" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="-104" cy="54" r="12" fill="#c9772b"/>
      <circle cx="80" cy="-40" r="56" fill="#c9772b"/><circle cx="80" cy="-40" r="38" fill="#ffd27a"/>${eye(68, -48, 5)}${eye(92, -48, 5)}
      <path d="M74 -32 L86 -32 L80 -24 Z" fill="#6d3d16"/><path d="M-30 -32 Q0 -42 30 -32 L26 4 Q0 10 -26 4 Z" fill="#a66cff"/></g>`;
  }
  // mount: [x, animal svg, rider svg or "", bob delay]
  function carousel(x, y, s, mounts) {
    const canopyStripes = Array.from({ length: 10 }, (_, i) => `<path d="M0 -560 L${-400 + i * 80} -400 L${-320 + i * 80} -400 Z" fill="${i % 2 ? "#fff" : "#ff5c8a"}"/>`).join("");
    const scallops = Array.from({ length: 10 }, (_, i) => `<path d="M${-400 + i * 80} -400 q40 50 80 0" fill="${i % 2 ? "#ffd447" : "#a66cff"}"/>`).join("");
    const lights = Array.from({ length: 10 }, (_, i) => `<circle cx="${-360 + i * 80}" cy="-390" r="7" fill="#fff6b0"><animate attributeName="opacity" values="1;.3;1" dur="${0.8 + (i % 3) * 0.3}s" repeatCount="indefinite"/></circle>`).join("");
    const mountSvg = mounts.map(([mx, animal, rider, b]) => `<path d="M${mx} -400 V-40" stroke="#ffd447" stroke-width="10"/>
      <g transform="translate(${mx} -190)"><g>${bob(40, 2, b)}${animal}${rider ? `<g transform="translate(-6 -26)">${rider}</g>` : ""}</g></g>`).join("");
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <rect x="-380" y="-400" width="760" height="360" fill="#fff3e0" opacity=".6"/>
      <rect x="-16" y="-400" width="32" height="360" fill="#ffd447"/>
      ${mountSvg}
      <ellipse cx="0" cy="-30" rx="420" ry="50" fill="#a66cff"/><rect x="-420" y="-40" width="840" height="40" fill="#8e44ff"/><ellipse cx="0" cy="0" rx="420" ry="40" fill="#7b3fe0"/>
      ${canopyStripes}${scallops}${lights}<circle cx="0" cy="-570" r="18" fill="#ffd447"/>
      <path d="M0 -588 V-640" stroke="#8d6e63" stroke-width="5"/><path d="M0 -640 L44 -626 L0 -612 Z" fill="#ff5c8a"/></g>`;
  }
  function teacup(x, y, s, c, riders = "", begin = 0) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><g>
      <animateTransform attributeName="transform" type="rotate" values="-10 0 -60;10 0 -60;-10 0 -60" dur="1.4s" begin="${begin}s" repeatCount="indefinite"/>
      <ellipse cx="0" cy="0" rx="200" ry="40" fill="#fff" stroke="#ddd" stroke-width="4"/>
      <ellipse cx="0" cy="-140" rx="160" ry="34" fill="${c}" opacity=".6"/>${riders}
      <path d="M-160 -140 Q-150 -10 0 -10 Q150 -10 160 -140 Q0 -100 -160 -140 Z" fill="${c}"/>
      <path d="M160 -110 Q230 -110 210 -60 Q196 -36 150 -50" stroke="${c}" stroke-width="18" fill="none"/>
      ${[-90, -30, 30, 90].map((dx) => `<circle cx="${dx}" cy="-70" r="12" fill="#fff" opacity=".7"/>`).join("")}</g></g>`;
  }
  function bumperCar(x, y, s, c, riders = "", flip = false) {
    return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
      <path d="M-40 -150 V-520" stroke="#888" stroke-width="6"/><circle cx="-40" cy="-520" r="10" fill="#ffd447">${sparkle(0, 0, 0.4)}</circle>
      ${riders}
      <path d="M-170 -40 Q-170 -140 -60 -140 L60 -150 Q120 -150 150 -90 L170 -40 Z" fill="${c}"/>
      <rect x="-190" y="-50" width="380" height="50" rx="25" fill="#333"/>
      <circle cx="100" cy="-100" r="14" fill="#fff" opacity=".6"/><path d="M40 -150 L70 -190" stroke="#555" stroke-width="8" stroke-linecap="round"/><circle cx="74" cy="-196" r="16" fill="none" stroke="#555" stroke-width="6"/></g>`;
  }
  function tent(x, y, s = 1) {
    const stripes = Array.from({ length: 8 }, (_, i) => `<path d="M${-300 + i * 75} -300 h37.5 V0 h-37.5 Z" fill="#ff5c8a" opacity=".85"/>`).join("");
    return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-300" y="-300" width="600" height="300" fill="#fff"/>${stripes}
      <path d="M-330 -300 L0 -460 L330 -300 Z" fill="#ffd447"/><path d="M-330 -300 ${Array.from({ length: 11 }, () => "q30 36 60 0").join(" ")}" fill="#ff5c8a"/>
      <path d="M0 -460 V-520" stroke="#8d6e63" stroke-width="5"/><path d="M0 -520 L44 -506 L0 -492 Z" fill="#2f9bff"/></g>`;
  }
  function stall(x, y, s, c) {
    const stripes = Array.from({ length: 7 }, (_, i) => `<path d="M${-210 + i * 60} -330 h60 v70 q-30 26 -60 0 Z" fill="${i % 2 ? "#fff" : c}"/>`).join("");
    return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-190" y="-260" width="380" height="260" fill="#fff3c4"/>${stripes}
      <rect x="-220" y="-340" width="440" height="20" rx="10" fill="${c}"/><rect x="-210" y="-110" width="420" height="40" rx="10" fill="#ffd447"/></g>`;
  }
  // rollercoaster track (a path) and its car riding along it
  const TRACK = "M-100 760 C100 760 160 300 360 300 C560 300 560 640 760 640 C960 640 980 380 1180 380 C1380 380 1420 700 1700 700";
  function mirror(x, y, w, h, inner, c) {
    const id = `mir${x}`;
    return `<g transform="translate(${x} ${y})"><rect x="${-w / 2 - 18}" y="${-h - 18}" width="${w + 36}" height="${h + 36}" rx="${w / 2}" fill="${c}"/>
      <clipPath id="${id}"><rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="${w / 2 - 18}"/></clipPath>
      <rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="${w / 2 - 18}" fill="#dff3ff"/>
      <g clip-path="url(#${id})">${inner}</g>
      <path d="M${-w / 4} ${-h + 40} l40 -30 M${-w / 4} ${-h + 80} l70 -50" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".7"/></g>`;
  }

  // ---------- scenes ----------
  const SCENES = {
    cover() {
      return wrap(
        `${fair("fc", { back: `${bigWheel(1250, 680, 0.9)}${tent(300, 660, 0.6)}` })}${bunting(40)}
        ${balloon(560, 330, "#ff5c8a")}${balloon(1000, 280, "#2f9bff", 1)}${balloon(620, 260, "#ffd447", 0.6)}
        ${who("isa", 0.85, { x: 470, y: 840, r: "wave", rAlt: { pose: "wave2", dur: 0.9 } })}
        ${who("uku", 1.05, { x: 640, y: 850, l: "up", r: "up", mouth: "open", anim: hop(16, 1) })}
        ${who("ema", 0.85, { x: 1100, y: 840, flip: true, r: "wave", rAlt: { pose: "wave2", dur: 0.9, begin: 0.3 }, blink: 2 })}
        ${who("frida", 1.15, { x: 870, y: 860, l: "out", r: "up", rItem: FLOSS, anim: bob(8, 2) })}
        ${sparkle(700, 400, 1.2)}${sparkle(980, 420, 1, 0.6)}`,
        sky("fc", "#ffc6e3", "#fff3c4"),
      );
    },

    wake: () => FRIDA_SCENES.wake(),

    arrive() {
      const gate = `<g transform="translate(800 720)"><rect x="-340" y="-380" width="60" height="380" fill="#a66cff"/><rect x="280" y="-380" width="60" height="380" fill="#a66cff"/>
        <path d="M-360 -380 Q0 -560 360 -380 L360 -330 Q0 -500 -360 -330 Z" fill="#ff5c8a"/>
        ${Array.from({ length: 11 }, (_, i) => { const a = Math.PI + (i / 10) * Math.PI; return `<circle cx="${(Math.cos(a) * 340).toFixed(1)}" cy="${(-360 + Math.sin(a) * 120).toFixed(1)}" r="10" fill="#fff6b0"><animate attributeName="opacity" values="1;.2;1" dur="${0.6 + (i % 3) * 0.3}s" repeatCount="indefinite"/></circle>`; }).join("")}
        ${[-200, -100, 0, 100, 200].map((dx, i) => `<g transform="translate(${dx} ${-470 + Math.abs(dx) * 0.4})"><path d="M0 -26 L7 -8 L26 -8 L11 4 L16 22 L0 12 L-16 22 L-11 4 L-26 -8 L-7 -8 Z" fill="${COLORS[i]}"/></g>`).join("")}</g>`;
      const notes = [0, 1, 2].map((i) => `<g><animateMotion path="M${300 + i * 500} 520 q40 -80 0 -160 q-40 -80 20 -160" dur="4s" begin="${i * 1.2}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="4s" begin="${i * 1.2}s" repeatCount="indefinite"/><path d="M0 0 V-40 L22 -46 V-6" stroke="#a66cff" stroke-width="5" fill="none"/><ellipse cx="-6" cy="2" rx="9" ry="7" fill="#a66cff"/><ellipse cx="16" cy="-4" rx="9" ry="7" fill="#a66cff"/></g>`).join("");
      return wrap(
        `${fair("fa", { back: `${bigWheel(1350, 680, 0.6)}${tent(220, 660, 0.45)}` })}${gate}${bunting(30)}${notes}
        ${who("isa", 0.9, { x: 440, y: 850, r: "out", l: "stand" })}
        ${who("uku", 1.1, { x: 620, y: 860, l: "up", r: "up", mouth: "open", anim: hop(22, 0.8) })}
        ${who("frida", 1, { x: 980, y: 860, flip: true, r: "wave", rAlt: { pose: "wave2", dur: 0.8 }, l: "up", mouth: "open", anim: bob(6, 1.4) })}
        ${who("ema", 0.9, { x: 1170, y: 850, flip: true, l: "hold", lItem: BAG })}`,
        sky("fa", "#9fdcff", "#fff3c4"),
      );
    },

    carousel() {
      const fridaRider = princess("frida", { sit: true, l: "hold", r: "wave", rAlt: { pose: "wave2", dur: 0.8 } });
      const ukuRider = princess("uku", { s: SIZE.uku, sit: true, l: "hold", r: "up", mouth: "open" });
      return wrap(
        `${fair("fca")}${bunting(30)}
        ${carousel(800, 820, 1, [[-250, carouselHorse("#fff", "#ff8fbf"), fridaRider, 0], [20, carouselHorse("#c9a7ff", "#ffd447"), "", 0.7], [260, carouselLion(), ukuRider, 1.3]])}
        ${who("ema", 0.9, { x: 1420, y: 880, flip: true, r: "wave", rAlt: { pose: "wave2", dur: 1 }, blink: 1 })}
        ${who("isa", 0.9, { x: 160, y: 880, r: "wave", rAlt: { pose: "wave2", dur: 1.1 } })}`,
        sky("fca", "#9fdcff", "#fff3c4"),
      );
    },

    teacups() {
      const riders = (ids, k = 0.9) => ids.map(([id, dx, o]) => who(id, k, { x: dx, y: -16, l: "up", r: "up", mouth: "open", ...o })).join("");
      return wrap(
        `${fair("ft", { back: tent(1350, 660, 0.5) })}${bunting(30)}
        <ellipse cx="800" cy="780" rx="760" ry="90" fill="#ffd6ec"/>
        ${teacup(480, 800, 1.1, "#a66cff", riders([["isa", -60, { l: "hold", r: "hold" }], ["uku", 70, {}]]))}
        ${teacup(1110, 790, 1.1, "#2fb37a", riders([["ema", -50, {}], ["frida", 70, { eyes: "closed" }]]), 0.7)}`,
        sky("ft", "#9fdcff", "#fff3c4"),
      );
    },

    bumpercars() {
      const drive = (from, to, b = 0) => `<animateTransform attributeName="transform" type="translate" values="${from} 0;${to} 0;${from} 0" keyTimes="0;0.5;1" dur="3s" begin="${b}s" repeatCount="indefinite" calcMode="spline" keySplines=".5 0 1 1;0 0 .5 1"/>`;
      const grid = Array.from({ length: 11 }, (_, i) => `<path d="M${i * 160} 0 V200 M0 ${i * 20} H1600" stroke="#666" stroke-width="3"/>`).join("");
      return wrap(
        `<rect width="1600" height="900" fill="#3b3570"/><rect width="1600" height="200" fill="#2a2560"/>${grid}
        ${bunting(200, true)}
        <rect y="520" width="1600" height="380" fill="#5b5b78"/><rect y="510" width="1600" height="30" fill="#ffd447"/>
        <g>${drive(0, 120)}${bumperCar(470, 820, 1, "#ff5c8a", `${who("ema", 0.8, { x: -60, y: -40, l: "hold", r: "hold", mouth: "open" })}${who("frida", 0.9, { x: 50, y: -40, l: "hold", r: "hold" })}`)}</g>
        <g>${drive(0, -120)}${bumperCar(1130, 820, 1, "#2f9bff", `${who("isa", 0.8, { x: -60, y: -40, l: "hold", r: "hold" })}${who("uku", 1, { x: 50, y: -40, l: "up", r: "up", mouth: "open" })}`, true)}</g>
        <g transform="translate(800 640)" opacity="0">${sparkle(0, 0, 2.4)}<animate attributeName="opacity" values="0;0;1;0;0" keyTimes="0;0.4;0.5;0.6;1" dur="3s" repeatCount="indefinite"/></g>`,
      );
    },

    ducks() {
      const pondDucks = Array.from({ length: 6 }, (_, i) => `<g>${`<animateTransform attributeName="transform" type="translate" values="0 0;700 0" dur="12s" begin="${-i * 2}s" repeatCount="indefinite"/>`}${duck(420 + 0 * i, 700, 0.9, i === 2 ? "#ff8fbf" : "#ffd447")}</g>`).join("");
      const prizes = [[-160, "#ff8fbf"], [-60, "#9be3c4"], [40, "#ffd447"], [140, "#c9a7ff"]].map(([dx, c], i) => `<g transform="translate(${800 + dx} 430)">${teddy(0, 0, 0.6).replace(/#c68b5c|#b07a4f/g, c)}</g>`).join("");
      return wrap(
        `<rect width="1600" height="900" fill="#ffe7f1"/>
        ${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 160} 0 h80 V560 h-80 Z" fill="#ff8fbf" opacity=".5"/>`).join("")}
        <path d="M0 0 ${Array.from({ length: 20 }, () => "q40 50 80 0").join(" ")} V0 Z" fill="#ffd447"/>
        <rect x="560" y="440" width="480" height="20" fill="#8d5d3b"/>${prizes}
        <rect y="560" width="1600" height="340" fill="#e2b98f"/>
        <clipPath id="pond"><rect x="380" y="640" width="840" height="120" rx="30"/></clipPath>
        <rect x="370" y="630" width="860" height="140" rx="36" fill="#ff5c8a"/><rect x="380" y="640" width="840" height="120" rx="30" fill="#7fd0ff"/>
        <g clip-path="url(#pond)">${pondDucks}</g>
        ${who("uku", 1.2, { x: 330, y: 860, r: "hold", rItem: ROD, rAlt: { pose: "out", dur: 2.4 }, mouth: "open", anim: bob(6, 1.2) })}
        ${who("frida", 1, { x: 1330, y: 860, flip: true, l: "up", r: "up", mouth: "open", anim: hop(10, 1.2) })}
        ${who("isa", 0.85, { x: 1480, y: 860, flip: true, r: "out" })}`,
      );
    },

    candyfloss() {
      return wrap(
        `${fair("ff", { back: stall(1260, 660, 0.9, "#ff8fbf") })}${bunting(30)}
        <g transform="translate(1260 520)">${FLOSS.replace("<g>", '<g transform="scale(2)">')}</g>
        ${who("isa", 0.88, { x: 220, y: 850, r: "out", mouth: "open" })}
        ${who("frida", 1.1, { x: 540, y: 860, r: "hold", rItem: FLOSS, l: "stand", over: STICKY, mouth: "open", anim: bob(6, 1.2) })}
        ${who("uku", 1.2, { x: 760, y: 870, r: "mouth", rItem: FLOSS, rAlt: { pose: "hold", dur: 1 }, over: STICKY, anim: hop(8, 1) })}
        ${who("ema", 0.88, { x: 960, y: 850, flip: true, r: "stand", l: "hold", lItem: BAG, mouth: "open", blink: 1 })}`,
        sky("ff", "#9fdcff", "#fff3c4"),
      );
    },

    bigwheel() {
      const riders = `${princess("frida", { x: -12, y: 60, s: 0.32, headOnly: true, mouth: "open" })}${princess("isa", { x: 14, y: 62, s: 0.38, headOnly: true })}`;
      return wrap(
        `${outdoor("fb")}${cloud(320, 140, 0.7)}${cloud(1200, 110, 0.6, 50)}
        <g transform="translate(1340 640)">${castle(0, 0, 0.18)}</g>
        ${grass(660)}${tent(250, 680, 0.5)}
        ${bigWheel(800, 840, 1.6, { riders, dur: 60 })}
        ${who("ema", 0.9, { x: 1340, y: 880, flip: true, r: "wave", rAlt: { pose: "wave2", dur: 0.9 } })}
        ${who("uku", 1.05, { x: 1220, y: 885, flip: true, l: "up", r: "wave", rAlt: { pose: "up", dur: 0.8 }, anim: hop(8, 1) })}`,
        sky("fb", "#9fdcff", "#fff3c4"),
      );
    },

    coaster() {
      const support = [200, 360, 560, 760, 960, 1180, 1400].map((x) => `<path d="M${x} 900 V${x < 300 ? 600 : 400}" stroke="#c0c4d6" stroke-width="10"/>`).join("");
      const car = `<g><animateMotion path="${TRACK}" dur="6s" repeatCount="indefinite" rotate="auto"/>
        <g transform="translate(0 -10)">${princess("frida", { x: -30, y: 4, s: 0.38, headOnly: true, mouth: "open" })}${princess("isa", { x: 30, y: 6, s: 0.44, headOnly: true, mouth: "open" })}</g>
        <path d="M-80 -30 H80 Q90 -30 86 0 H-86 Q-90 -30 -80 -30 Z" fill="#ff5c8a"/><circle cx="-50" cy="4" r="12" fill="#333"/><circle cx="50" cy="4" r="12" fill="#333"/></g>`;
      return wrap(
        `${fair("fco", { pathY: 820 })}${support}
        <path d="${TRACK}" stroke="#a66cff" stroke-width="20" fill="none"/><path d="${TRACK}" stroke="#fff" stroke-width="4" fill="none" stroke-dasharray="20 20" transform="translate(0 12)"/>
        ${car}
        ${who("ema", 0.9, { x: 1360, y: 880, flip: true, r: "lowhand", l: "stand" })}
        ${who("uku", 0.95, { x: 1360 - 97 * 0.9 - 72 * 0.95, y: 880, flip: true, l: "out", r: "up", mouth: "open" })}`,
        sky("fco", "#9fdcff", "#fff3c4"),
      );
    },

    mirrors() {
      const reflection = (sx, sy) => `<g transform="translate(0 0) scale(${sx} ${sy})">${princess("frida", { x: 0, y: 0, l: "out", r: "out", mouth: "open" })}</g>`;
      return wrap(
        `<rect width="1600" height="900" fill="#c9a7ff"/>${Array.from({ length: 8 }, (_, i) => `<circle cx="${100 + i * 200}" cy="70" r="20" fill="#fff6b0"><animate attributeName="opacity" values="1;.3;1" dur="${1 + (i % 3) * 0.4}s" repeatCount="indefinite"/></circle>`).join("")}
        <rect y="720" width="1600" height="180" fill="#8e6cff"/>
        ${mirror(340, 720, 240, 520, reflection(0.6, 1.7), "#ffd447")}
        ${mirror(760, 720, 300, 420, reflection(1.7, 0.75), "#ff5c8a")}
        ${mirror(1180, 720, 240, 520, `<g><animateTransform attributeName="transform" type="scale" values="1 1;1.25 .85;1 1" dur="2s" repeatCount="indefinite"/>${reflection(1, 1.2)}</g>`, "#2fb37a")}
        ${who("frida", 1, { x: 1440, y: 860, flip: true, l: "out", r: "out", mouth: "open", anim: bob(6, 1) })}
        ${who("uku", 1.1, { x: 560, y: 870, eyes: "closed", mouth: "open", l: "hold", r: "hold", anim: hop(8, 0.7) })}`,
      );
    },

    balloons() {
      const away = `<g><animateTransform attributeName="transform" type="translate" values="0 0;30 -120;0 0" dur="3s" repeatCount="indefinite"/>${balloon(900, 330, "#ff5c8a")}</g>`;
      return wrap(
        `${fair("fba", { back: bigWheel(1350, 680, 0.6) })}${bunting(30)}
        ${balloon(300, 420, "#2f9bff")}${balloon(500, 380, "#ffd447", 0.5)}${balloon(1150, 420, "#2fb37a", 1)}
        ${away}
        ${who("ema", 0.88, { x: 280, y: 860, r: "up", l: "stand" })}
        ${who("frida", 1, { x: 480, y: 860, r: "up", l: "stand", mouth: "open" })}
        ${who("uku", 1.1, { x: 760, y: 870, l: "up", r: "up", mouth: "open", anim: hop(14, 0.8) })}
        ${who("isa", 0.9, { x: 1000, y: 860, flip: true, r: "reach", rAlt: { pose: "up", dur: 3 }, l: "stand", mouth: "open" })}`,
        sky("fba", "#9fdcff", "#fff3c4"),
      );
    },

    lights() {
      return wrap(
        `${fair("fl", { night: true, back: `${bigWheel(800, 680, 1.15, { night: true })}${tent(180, 660, 0.45).replace(/#ff5c8a/g, "#a63a62")}` })}${bunting(30, true)}
        ${who("isa", 0.9, { x: 340, y: 860, r: "lowhand" })}
        ${who("uku", 0.95, { x: 340 + 97 * 0.9 + 72 * 0.95, y: 860, l: "out", r: "hold", rItem: teddy(0, 30, 0.5), eyes: "closed" })}
        ${who("frida", 1, { x: 1100, y: 870, flip: true, r: "wave", rAlt: { pose: "wave2", dur: 0.9 }, l: "out", mouth: "open" })}
        ${who("ema", 0.9, { x: 1100 + 92 + 112 * 0.9 / 0.95, y: 860, flip: true, r: "hand", l: "stand", blink: 1 })}`,
        sky("fl", "#1d1b4b", "#5b4b9a"),
      );
    },

    bedtime() {
      return dreamBed([
        [170, 240, `<g transform="scale(.32) translate(0 380)">${carousel(0, 0, 1, [[-200, carouselHorse(), "", 0], [200, carouselLion(), "", 0.7]])}</g>`],
        [800, 170, bigWheel(0, 130, 0.3, { dur: 20 })],
        [1000, 420, `<g transform="translate(0 30)">${FLOSS.replace("<g>", '<g transform="scale(1.6)">')}</g>`],
        [1330, 560, duck(0, 20, 1.6)],
      ], "#c9a7ff", teddy(800, 640, 0.7));
    },

    end() {
      return wrap(
        `${outdoor("fen")}${starField()}<circle cx="150" cy="190" r="80" fill="#fff6c9"/><circle cx="190" cy="165" r="80" fill="url(#fen)"/>
        ${bigWheel(1100, 720, 0.9, { night: true, dur: 80 })}
        <path d="M0 700 Q400 660 800 700 T1600 690 L1600 900 L0 900 Z" fill="#2a2560"/>
        ${sparkle(560, 300, 1.2)}${sparkle(400, 200, 1, 0.6)}${sparkle(700, 160, 1.3, 1.1)}`,
        sky("fen", "#1d1b4b", "#5b4b9a"),
      );
    },
  };

  globalThis.SCENES = SCENES;
})();
