// "Printsess Frida rannas" drawings (1600x900 SVG, SMIL-animated). Reuses the drawing kit from scenes.js.
(() => {
  const K = globalThis.SCENE_KIT;
  const FRIDA_SCENES = globalThis.SCENES; // the Frida book's scenes: the morning page is reused
  const { wrap, sky, outdoor, sun, cloud, flower, bush, grass, sparkle, bob, hop, castle } = K;
  const { SIZE, who, SANDWICH, cone, BAG, place, eye, cheek, swing, rock, balloon, starField, dreamBed } = K;

  const SAND = "#f6dfa4", SAND_DARK = "#e8c77e", SEA = "#4fb3e8";
  const CREAM = `<ellipse cx="0" cy="-222" rx="8" ry="5" fill="#fff"/>`; // sun cream on the nose
  const SPADE = `<g transform="rotate(30)"><rect x="-3" y="-40" width="6" height="40" fill="#8d5d3b"/><path d="M-12 0 H12 L8 26 Q0 32 -8 26 Z" fill="#ff5c8a"/></g>`;
  const BOTTLE = `<g transform="rotate(-15)"><rect x="-10" y="-30" width="20" height="40" rx="6" fill="#ffd447"/><rect x="-5" y="-40" width="10" height="12" rx="2" fill="#ff8a00"/><circle cx="0" cy="-10" r="5" fill="#ff8a00"/></g>`;
  const shellItem = (c = "#ffb3d1") => `<g transform="scale(.8)"><path d="M0 14 L-20 -6 Q0 -30 20 -6 Z" fill="${c}"/><path d="M0 14 L-10 -14 M0 14 L0 -18 M0 14 L10 -14" stroke="#fff" stroke-width="2.5" opacity=".7"/></g>`;

  // ---------- beach things ----------
  function sea(y, h = 140, c = SEA) {
    const wave = (yy, d, op) => `<path d="M-200 ${yy} ${Array.from({ length: 12 }, () => "q40 -14 80 0 t80 0").join(" ")}" stroke="#fff" stroke-width="5" fill="none" opacity="${op}">
      <animateTransform attributeName="transform" type="translate" values="0 0;160 0" dur="${d}s" repeatCount="indefinite"/></path>`;
    return `<rect x="0" y="${y}" width="1600" height="${h}" fill="${c}"/>${wave(y + h * 0.3, 6, 0.5)}${wave(y + h * 0.7, 4, 0.7)}`;
  }
  function shore(y) {
    return `<path d="M0 ${y} Q400 ${y - 20} 800 ${y} T1600 ${y} V900 H0 Z" fill="${SAND}"/>
      <path d="M0 ${y} Q400 ${y - 20} 800 ${y} T1600 ${y}" stroke="#fff" stroke-width="12" fill="none" opacity=".8">
        <animate attributeName="stroke-width" values="6;16;6" dur="3s" repeatCount="indefinite"/></path>`;
  }
  const beach = (id, opts = {}) =>
    `${outdoor(id)}${opts.sun === false ? "" : sun(opts.sunX ?? 1420, 130, 55)}${cloud(300, 130, 0.7)}${cloud(1000, 100, 0.6, 50)}
    ${sea(opts.seaY ?? 400, 200)}${shore(opts.sandY ?? 560)}`;
  function umbrella(x, y, s = 1, c = "#ff5c8a") {
    const segs = [0, 1, 2, 3, 4, 5].map((i) => `<path d="M0 -300 L${-200 + i * 66.7} -210 Q${-167 + i * 66.7} -230 ${-133 + i * 66.7} -210 Z" fill="${i % 2 ? "#fff" : c}"/>`).join("");
    return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-5" y="-300" width="10" height="300" fill="#ddd"/>
      <path d="M-200 -210 Q0 -330 200 -210 Z" fill="${c}"/>${segs}<circle cx="0" cy="-304" r="9" fill="${c}"/></g>`;
  }
  function towel(x, y, w = 260, c = "#a66cff") {
    return `<g transform="translate(${x} ${y})"><path d="M${-w / 2} 0 L${w / 2 - 30} 0 L${w / 2} 50 L${-w / 2 + 30} 50 Z" fill="${c}"/>
      ${[0.25, 0.5, 0.75].map((f) => `<path d="M${-w / 2 + w * f} 0 l30 50" stroke="#fff" stroke-width="10" opacity=".6"/>`).join("")}</g>`;
  }
  function bucket(x, y, s = 1, c = "#2f9bff") {
    return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30 -60 H30 L22 0 H-22 Z" fill="${c}"/><rect x="-34" y="-66" width="68" height="12" rx="5" fill="${c}"/>
      <path d="M-28 -64 Q0 -110 28 -64" stroke="${c}" stroke-width="5" fill="none"/></g>`;
  }
  function swimRing(x, y, s = 1, c = "#ff5c8a") {
    const stripes = [0, 1, 2, 3].map((i) => `<path d="M0 0 m${Math.cos(i * 1.57) * 70} ${Math.sin(i * 1.57) * 28} l${Math.cos(i * 1.57) * 26} ${Math.sin(i * 1.57) * 10}" stroke="#fff" stroke-width="22"/>`).join("");
    return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse rx="96" ry="40" fill="none" stroke="${c}" stroke-width="34"/>${stripes}
      <ellipse rx="96" ry="40" fill="none" stroke="#fff" stroke-width="4" opacity=".4" transform="translate(-6 -8)"/></g>`;
  }
  // a sandcastle; o.slump: the wave has washed it into a mound
  function sandcastle(x, y, s = 1, o = {}) {
    if (o.slump)
      return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-200 0 Q-150 -90 -60 -100 Q0 -150 70 -96 Q160 -80 200 0 Z" fill="${SAND_DARK}"/>
        <path d="M-120 -60 Q-60 -90 0 -70" stroke="#fff" stroke-width="6" fill="none" opacity=".4"/><rect x="40" y="-150" width="5" height="60" fill="#8d6e63" transform="rotate(30 40 -100)"/></g>`;
    const tower = (tx, h, w) => `<rect x="${tx - w / 2}" y="${-h}" width="${w}" height="${h}" fill="${SAND_DARK}"/>
      ${[0, 1, 2].map((i) => `<rect x="${tx - w / 2 + i * (w / 2.5)}" y="${-h - 22}" width="${w / 5}" height="24" fill="${SAND_DARK}"/>`).join("")}
      <path d="M${tx - w / 2 + 10} ${-h + 30} h${w - 20}" stroke="#d4ad62" stroke-width="5"/>`;
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <ellipse cx="0" cy="0" rx="250" ry="40" fill="#7fd0ff" stroke="${SAND_DARK}" stroke-width="10"/>
      <rect x="-170" y="-100" width="340" height="100" fill="${SAND_DARK}"/>
      ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${-170 + i * 52}" y="-122" width="28" height="24" fill="${SAND_DARK}"/>`).join("")}
      ${tower(-150, 190, 70)}${tower(150, 190, 70)}${tower(0, 270, 90)}
      <path d="M-30 0 V-56 Q0 -90 30 -56 V0 Z" fill="#c9a060"/>
      ${[[-100, -60], [90, -40], [-10, -200]].map(([sx, sy], i) => `<g transform="translate(${sx} ${sy})">${shellItem(["#ffb3d1", "#fff", "#c9a7ff"][i])}</g>`).join("")}
      <path d="M0 -292 V-370" stroke="#8d6e63" stroke-width="5"/>
      <path d="M0 -370 L60 -354 L0 -336 Z" fill="#ff5c8a"><animate attributeName="d" values="M0 -370 L60 -354 L0 -336 Z;M0 -370 L54 -362 L0 -336 Z;M0 -370 L60 -354 L0 -336 Z" dur="1s" repeatCount="indefinite"/></path></g>`;
  }
  function crab(o = {}) {
    const red = "#ff5a4f", dark = "#c4302b";
    const legs = [-1, 1].map((m) => [0, 1, 2].map((i) => `<path d="M${m * 40} ${-24 + i * 10} l${m * 30} ${10 + i * 4} l${m * 6} 14" stroke="${dark}" stroke-width="7" fill="none" stroke-linecap="round">
      <animateTransform attributeName="transform" type="rotate" values="0 ${m * 40} -20;${m * 12} ${m * 40} -20;0 ${m * 40} -20" dur=".4s" begin="${i * 0.13}s" repeatCount="indefinite"/></path>`).join("")).join("");
    const claw = (m) => `<g><animateTransform attributeName="transform" type="rotate" values="0 ${m * 44} -40;${m * -14} ${m * 44} -40;0 ${m * 44} -40" dur=".8s" repeatCount="indefinite"/>
      <path d="M${m * 44} -40 L${m * 66} -70" stroke="${red}" stroke-width="10" stroke-linecap="round"/>
      <path d="M${m * 66} -70 m${m * -16} -6 a18 18 0 1 0 ${m * 30} -8 L${m * 66} -70 Z" fill="${red}"/></g>`;
    return place(o, `${legs}${claw(-1)}${claw(1)}
      <ellipse cx="0" cy="-30" rx="50" ry="32" fill="${red}"/>
      <path d="M-14 -56 V-80 M14 -56 V-80" stroke="${red}" stroke-width="6"/><circle cx="-14" cy="-84" r="11" fill="#fff"/><circle cx="14" cy="-84" r="11" fill="#fff"/>
      ${eye(-12, -84, 5, o)}${eye(16, -84, 5, o)}${cheek(-26, -26, 8)}${cheek(26, -26, 8)}
      <path d="M-12 -20 Q0 -10 12 -20" stroke="${dark}" stroke-width="4" fill="none" stroke-linecap="round"/>`);
  }
  function seagull(o = {}) {
    const wing = `<path d="M-10 -40 Q-60 -90 -110 -70 Q-60 -60 -30 -24 Z" fill="#b0bec5">${o.fly || o.flap ? `<animateTransform attributeName="transform" type="rotate" values="0 -10 -36;${o.fly ? 40 : 20} -10 -36;0 -10 -36" dur="${o.fly ? 0.6 : 1}s" repeatCount="indefinite"/>` : ""}</path>`;
    return place(o, `${o.fly ? "" : `<path d="M-6 -14 V0 M8 -14 V0" stroke="#ff9f1c" stroke-width="4"/>`}
      <path d="M-50 -40 L-90 -30 L-50 -24 Z" fill="#90a4ae"/>
      <ellipse cx="-8" cy="-34" rx="50" ry="24" fill="#fff"/>${wing}
      <circle cx="38" cy="-58" r="22" fill="#fff"/>${eye(44, -62, 4.5, o)}
      <path d="M56 -58 L84 -54 L56 -46 Z" fill="#ffc107"/><path d="M56 -50 L74 -50" stroke="#e65100" stroke-width="2"/>`);
  }
  const shellScatter = (pts) => pts.map(([x, y, c, s], i) => `<g transform="translate(${x} ${y}) scale(${s || 1.4})">${shellItem(c)}${i % 3 ? "" : sparkle(18, -14, 0.4, i * 0.3)}</g>`).join("");
  const pebbles = (pts) => pts.map(([x, y, r, c]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.6}" fill="${c}"/>`).join("");

  // ---------- scenes ----------
  const SCENES = {
    cover() {
      return wrap(
        `${beach("bc", { sunX: 1440 })}${umbrella(260, 760, 1.1)}${towel(300, 790)}
        ${sandcastle(1260, 790, 0.7)}${seagull({ x: 700, y: 250, s: 1.1, fly: true, anim: bob(20, 3) })}
        ${who("isa", 0.85, { x: 520, y: 840, swim: true, r: "wave", rAlt: { pose: "wave2", dur: 0.9 } })}
        ${who("uku", 1.05, { x: 660, y: 850, swim: true, l: "up", r: "hold", rItem: `<g transform="translate(0 30)">${bucket(0, 0, 0.6)}</g>`, anim: hop(14, 1) })}
        ${who("ema", 0.85, { x: 1060, y: 840, swim: true, flip: true, r: "wave", rAlt: { pose: "wave2", dur: 0.9, begin: 0.3 }, blink: 2 })}
        ${who("frida", 1.15, { x: 860, y: 860, swim: true, l: "out", r: "out", anim: bob(8, 2) })}
        ${crab({ x: 1460, y: 860, s: 0.8, anim: `<animateTransform attributeName="transform" type="translate" values="0 0;-60 0;0 0" dur="3s" repeatCount="indefinite"/>` })}
        ${sparkle(700, 330, 1.2)}${sparkle(980, 250, 1, 0.6)}${sparkle(860, 180, 0.8, 1.2)}`,
        sky("bc", "#7fd0ff", "#fff3c4"),
      );
    },

    wake: () => FRIDA_SCENES.wake(),

    pack() {
      const ring = `<g transform="translate(0 30) scale(.55)">${swimRing(0, 0)}</g>`;
      const shade = `<g transform="translate(0 70) rotate(-70) scale(.4)">${umbrella(0, 0)}</g>`;
      return wrap(
        `${outdoor("bp")}${sun(1450, 120, 55)}${cloud(600, 130, 0.8)}${cloud(1150, 200, 0.6, 50)}
        ${castle(240, 650, 0.62)}${grass(650)}<path d="M380 900 Q700 760 1600 720 V790 Q900 800 640 900 Z" fill="#f2ddb3"/>
        ${who("isa", 1, { x: 560, y: 800, r: "hold", rItem: ring, l: "hold", lItem: shade, anim: bob(6, 0.9) })}
        ${who("uku", 1.05, { x: 740, y: 810, r: "up", rItem: `<g transform="translate(0 40)">${bucket(0, 0, 0.6)}</g>`, l: "up", mouth: "open", anim: hop(14, 0.9, 0.2) })}
        ${who("frida", 1, { x: 930, y: 810, r: "out", rItem: SPADE, l: "wave", lAlt: { pose: "wave2", dur: 0.9 }, anim: bob(6, 0.9, 0.4) })}
        ${who("ema", 1, { x: 1150, y: 805, flip: true, r: "hold", rItem: BAG, l: "hold", lItem: BOTTLE, anim: bob(6, 0.9, 0.6), blink: 2 })}`,
        sky("bp", "#9fdcff", "#e8f8ff"),
      );
    },

    arrive() {
      const run = `<animateTransform attributeName="transform" type="translate" values="0 0;0 -24;0 0" dur=".5s" repeatCount="indefinite"/>`;
      return wrap(
        `${beach("ba")}${umbrella(1380, 740, 1)}${towel(1350, 770, 240, "#ff8a00")}
        ${pebbles([[300, 640, 14, "#c9b49a"], [1100, 660, 10, "#b0a090"], [600, 860, 12, "#c9b49a"]])}
        ${[0, 1, 2, 3, 4].map((i) => `<ellipse cx="${380 + i * 70}" cy="${820 - (i % 2) * 14}" rx="12" ry="6" fill="${SAND_DARK}"/>`).join("")}
        ${who("uku", 1.15, { x: 760, y: 820, swim: true, l: "up", r: "up", mouth: "open", anim: run })}
        ${who("frida", 1, { x: 1000, y: 830, swim: true, l: "out", r: "wave", rAlt: { pose: "wave2", dur: 0.8 }, anim: bob(6, 1.2) })}
        ${who("isa", 0.9, { x: 220, y: 830, swim: true, r: "hold", rItem: `<g transform="translate(0 30) scale(.55)">${swimRing(0, 0)}</g>` })}
        ${who("ema", 0.9, { x: 420, y: 835, swim: true, r: "hold", rItem: BAG, l: "stand", blink: 1 })}`,
        sky("ba", "#7fd0ff", "#fff3c4"),
      );
    },

    suncream() {
      // Ema's hand reaches Frida's nose: for these sizes the "out" pose lands right on it
      return wrap(
        `${beach("bs")}${umbrella(280, 760, 1.1)}${towel(320, 800, 300)}
        ${who("isa", 0.9, { x: 1350, y: 840, swim: true, flip: true, r: "mouth", l: "stand", over: `<path d="M-30 -226 h12 M18 -226 h12" stroke="#fff" stroke-width="6" stroke-linecap="round"/>${CREAM}` })}
        ${who("uku", 1.1, { x: 1120, y: 850, swim: true, l: "up", r: "up", mouth: "open", over: CREAM, anim: hop(10, 1) })}
        ${who("frida", 1, { x: 640, y: 850, swim: true, l: "stand", r: "stand", eyes: "closed", mouth: "open", over: `<ellipse cx="0" cy="-222" rx="8" ry="5" fill="#fff"><animate attributeName="opacity" values="0;0;1;1" keyTimes="0;0.4;0.5;1" dur="3s" repeatCount="indefinite"/></ellipse>` })}
        ${who("ema", 1, { x: 640 + 125, y: 850, swim: true, flip: true, r: "out", rAlt: { pose: "hand", dur: 1.5 }, l: "hold", lItem: BOTTLE, blink: 1 })}`,
        sky("bs", "#7fd0ff", "#fff3c4"),
      );
    },

    sandcastle() {
      return wrap(
        `${beach("bsc")}${umbrella(1450, 700, 0.8)}
        ${sandcastle(800, 760, 1)}${bucket(1080, 790, 1)}${bucket(520, 800, 0.8, "#ffd447")}
        ${who("frida", 1, { x: 470, y: 820, swim: true, sit: true, r: "out", rItem: SPADE, rAlt: { pose: "low", dur: 0.8 }, mouth: "open" })}
        ${who("isa", 0.9, { x: 1190, y: 820, swim: true, sit: true, flip: true, r: "out", rAlt: { pose: "hand", dur: 1 }, l: "stand" })}
        ${sparkle(800, 360, 1)}${sparkle(1000, 420, 0.8, 0.6)}`,
        sky("bsc", "#7fd0ff", "#fff3c4"),
      );
    },

    wave() {
      const foam = `<g><animateTransform attributeName="transform" type="translate" values="300 0;0 0;0 0;300 0" keyTimes="0;0.3;0.6;1" dur="4s" repeatCount="indefinite"/>
        <path d="M500 600 Q700 520 900 560 Q1100 520 1300 600 L1600 600 L1600 760 Q1200 740 900 780 Q700 800 500 760 Z" fill="${SEA}" opacity=".85"/>
        ${[560, 680, 800, 920, 1040, 1160].map((x, i) => `<circle cx="${x}" cy="${590 - (i % 2) * 20}" r="${26 + (i % 3) * 8}" fill="#fff"/>`).join("")}</g>`;
      const drops = Array.from({ length: 8 }, (_, i) => `<circle r="${8 + (i % 3) * 4}" fill="#bfe7ff"><animateMotion path="M${800 + (i - 4) * 30} 640 q${(i - 4) * 40} -200 ${(i - 4) * 70} -80" dur="1.4s" begin="${i * 0.15}s" repeatCount="indefinite"/></circle>`).join("");
      return wrap(
        `${beach("bw")}${sandcastle(800, 780, 1, { slump: true })}${foam}${drops}
        ${who("frida", 1, { x: 400, y: 840, swim: true, l: "up", r: "up", mouth: "open", anim: hop(12, 0.9) })}
        ${who("isa", 0.9, { x: 220, y: 840, swim: true, r: "out", mouth: "open" })}
        ${bucket(560, 840, 0.8, "#ffd447")}`,
        sky("bw", "#7fd0ff", "#fff3c4"),
      );
    },

    crab() {
      const walk = `<animateTransform attributeName="transform" type="translate" values="0 0;-220 0;0 0" dur="5s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/>`;
      return wrap(
        `${beach("bcr")}${rock(1230, 800, 360, 170, "#a1887f")}${rock(1400, 820, 200, 90, "#8d6e63")}
        ${pebbles([[300, 860, 14, "#c9b49a"], [900, 870, 10, "#b0a090"]])}
        ${crab({ x: 1000, y: 840, s: 1.6, anim: walk })}
        ${who("uku", 1.1, { x: 560, y: 840, swim: true, sit: true, l: "up", r: "up", mouth: "open", anim: `<animateTransform attributeName="transform" type="rotate" values="-8;6;-8" dur="1.2s" repeatCount="indefinite"/>` })}
        ${who("frida", 1, { x: 330, y: 850, swim: true, r: "out", l: "stand", mouth: "open" })}`,
        sky("bcr", "#7fd0ff", "#fff3c4"),
      );
    },

    swim() {
      const splash = Array.from({ length: 6 }, (_, i) => `<circle r="${7 + (i % 2) * 5}" fill="#fff"><animateMotion path="M${560 + i * 18} 690 q${(i - 3) * 20} -90 ${(i - 3) * 40} -10" dur="1s" begin="${i * 0.16}s" repeatCount="indefinite"/></circle>`).join("");
      const fridaY = 760;
      return wrap(
        `${outdoor("bsw")}${sun(1420, 130, 55)}${cloud(400, 120, 0.7)}${cloud(1100, 150, 0.6, 50)}
        <rect y="330" width="1600" height="570" fill="${SEA}"/>
        <path d="M1200 330 Q1400 320 1600 340 V420 Q1400 400 1200 430 Z" fill="${SAND}" opacity=".9"/>
        ${umbrella(1450, 400, 0.4)}
        ${seagull({ x: 300, y: 220, s: 0.8, fly: true, anim: bob(16, 2.4) })}
        <g>${bob(10, 2)}${who("frida", 1, { x: 640, y: fridaY, swim: true, l: "out", r: "out" })}
          ${swimRing(640, fridaY - 110, 0.85)}</g>
        ${who("isa", 1, { x: 900, y: 860, swim: true, flip: true, r: "out", l: "wave", lAlt: { pose: "wave2", dur: 1 }, mouth: "open" })}
        <g opacity=".85"><rect y="700" width="1600" height="200" fill="${SEA}"/>
          <path d="M-200 700 ${Array.from({ length: 12 }, () => "q40 -14 80 0 t80 0").join(" ")}" stroke="#fff" stroke-width="6" fill="none"><animateTransform attributeName="transform" type="translate" values="0 0;160 0" dur="4s" repeatCount="indefinite"/></path></g>
        ${splash}`,
        sky("bsw", "#7fd0ff", "#e8f8ff"),
      );
    },

    buried() {
      return wrap(
        `${beach("bb")}${umbrella(1300, 730, 1)}${towel(1260, 760, 260, "#2fb37a")}
        <ellipse cx="760" cy="790" rx="230" ry="70" fill="${SAND_DARK}"/><path d="M560 790 Q760 690 960 790 Z" fill="${SAND_DARK}"/>
        ${who("uku", 1.2, { x: 760, y: 950, headOnly: true, mouth: "open", anim: `<animateTransform attributeName="transform" type="rotate" values="-6 0 -230;6 0 -230;-6 0 -230" dur="1.4s" repeatCount="indefinite"/>` })}
        ${shellScatter([[640, 770, "#ffb3d1", 1.3], [700, 800, "#fff", 1.2], [830, 795, "#c9a7ff", 1.3], [890, 770, "#ffb3d1", 1.1]])}
        ${who("ema", 0.95, { x: 400, y: 820, swim: true, sit: true, r: "out", rItem: SPADE, rAlt: { pose: "low", dur: 0.9 }, blink: 1 })}
        ${who("frida", 1, { x: 1080, y: 840, swim: true, flip: true, r: "pet", rItem: shellItem("#ffb3d1"), rAlt: { pose: "low", dur: 1.2 }, l: "stand" })}`,
        sky("bb", "#7fd0ff", "#fff3c4"),
      );
    },

    lunch() {
      return wrap(
        `${beach("bl")}${umbrella(700, 740, 1.5)}${towel(560, 790, 380, "#a66cff")}${towel(900, 800, 340, "#ff8a00")}
        <g transform="translate(1080 790)"><path d="M-50 0 L-40 -60 H40 L50 0 Z" fill="#c58b5a"/><path d="M-36 -60 Q0 -110 36 -60" stroke="#8d5d3b" stroke-width="6" fill="none"/></g>
        ${who("ema", 0.9, { x: 440, y: 790, swim: true, sit: true, r: "mouth", rItem: SANDWICH, rAlt: { pose: "hold", dur: 2 } })}
        ${who("uku", 1.05, { x: 600, y: 810, swim: true, sit: true, r: "mouth", rItem: SANDWICH, rAlt: { pose: "hold", dur: 1.6 }, mouth: "open" })}
        ${who("isa", 0.9, { x: 960, y: 800, swim: true, sit: true, flip: true, r: "mouth", rItem: SANDWICH, rAlt: { pose: "hold", dur: 2.4 } })}
        ${who("frida", 1, { x: 780, y: 820, swim: true, sit: true, r: "hold", rItem: SANDWICH, l: "hold", eyes: "", mouth: "open" })}
        ${seagull({ x: 1330, y: 840, s: 1.5, flip: true, flap: true, anim: hop(8, 1.6) })}`,
        sky("bl", "#7fd0ff", "#fff3c4"),
      );
    },

    shells() {
      return wrap(
        `${beach("bsh", { sandY: 520 })}
        ${shellScatter([[300, 820, "#fff", 1.6], [470, 870, "#c9a7ff", 1.4], [1060, 850, "#fff", 1.5], [1200, 880, "#ffe14d", 1.4], [1400, 820, "#c9a7ff", 1.6], [820, 760, "#fff", 1.2]])}
        ${pebbles([[380, 760, 16, "#b0bec5"], [960, 780, 14, "#c9b49a"], [1300, 770, 18, "#a1887f"], [600, 880, 12, "#90a4ae"]])}
        ${bucket(940, 860, 1, "#2f9bff")}
        ${who("frida", 1.1, { x: 700, y: 860, swim: true, r: "up", rItem: `<g transform="scale(1.8)">${shellItem("#ff8fbf")}</g>`, l: "stand", mouth: "open", anim: bob(6, 1.2) })}
        ${sparkle(780, 520, 1.1)}${sparkle(840, 470, 0.7, 0.5)}
        ${who("uku", 1.1, { x: 1060, y: 870, swim: true, flip: true, r: "pet", rAlt: { pose: "low", dur: 1 }, l: "stand" })}`,
        sky("bsh", "#7fd0ff", "#fff3c4"),
      );
    },

    icecream() {
      const stripes = Array.from({ length: 7 }, (_, i) => `<path d="M${1180 + i * 60} 330 h60 v70 q-30 26 -60 0 Z" fill="${i % 2 ? "#fff" : "#2f9bff"}"/>`).join("");
      return wrap(
        `${beach("bi")}
        <rect x="1200" y="400" width="380" height="330" fill="#fff3c4"/>${stripes}<rect x="1170" y="320" width="440" height="20" rx="10" fill="#2f9bff"/>
        <rect x="1180" y="580" width="420" height="40" rx="10" fill="#ffd447"/><g transform="translate(1300 540) scale(2)">${cone("#ff9fc8")}</g><g transform="translate(1460 540) scale(2)">${cone("#9be3c4")}</g>
        ${who("isa", 0.88, { x: 260, y: 850, swim: true, r: "mouth", rItem: cone("#8d5a32"), rAlt: { pose: "hold", dur: 2 } })}
        ${who("ema", 0.88, { x: 470, y: 850, swim: true, r: "hold", rItem: cone("#fff1b8"), mouth: "open", blink: 1 })}
        ${who("frida", 1.05, { x: 720, y: 860, swim: true, r: "mouth", rItem: cone("#c9a7ff"), rAlt: { pose: "hold", dur: 1.2 }, anim: bob(6, 1.2) })}
        ${who("uku", 1.15, { x: 950, y: 870, swim: true, r: "mouth", rItem: cone("#ff9fc8"), rAlt: { pose: "hold", dur: 0.9 }, l: "up", anim: hop(8, 0.9) })}`,
        sky("bi", "#7fd0ff", "#fff3c4"),
      );
    },

    sunset() {
      return wrap(
        `${outdoor("bsu")}
        <circle cx="800" cy="380" r="110" fill="#ff7043"><animate attributeName="cy" values="360;440" dur="12s" fill="freeze"/></circle>
        <rect y="420" width="1600" height="200" fill="#5c6bc0"/>
        ${[0, 1, 2, 3, 4].map((i) => `<rect x="${700 + (i % 2) * 30}" y="${440 + i * 26}" width="${200 - i * 30}" height="8" rx="4" fill="#ffab91" opacity=".8"><animate attributeName="opacity" values=".8;.3;.8" dur="${2 + i * 0.3}s" repeatCount="indefinite"/></rect>`).join("")}
        <path d="M0 600 Q400 580 800 600 T1600 600 V900 H0 Z" fill="#d9b98a"/>
        ${sandcastle(1320, 700, 0.5)}
        ${seagull({ x: 400, y: 260, s: 0.7, fly: true, anim: bob(10, 2.4) })}${seagull({ x: 560, y: 220, s: 0.55, fly: true, anim: bob(10, 2.4, 0.6) })}
        ${who("isa", 0.9, { x: 360, y: 820, r: "lowhand" })}
        ${who("uku", 0.95, { x: 360 + 97 * 0.9 / 0.9 + 72, y: 820, l: "out", r: "stand", eyes: "closed" })}
        ${who("frida", 1, { x: 760, y: 830, r: "wave", rAlt: { pose: "wave2", dur: 0.8 }, l: "out" })}
        ${who("ema", 0.95, { x: 980, y: 825, flip: true, r: "stand", l: "hold", lItem: BAG, blink: 1 })}`,
        sky("bsu", "#7e57c2", "#ffb74d"),
      );
    },

    bedtime() {
      return dreamBed([
        [170, 240, sandcastle(0, 80, 0.32)],
        [800, 170, crab({ x: 0, y: 50, s: 1.1 })],
        [1000, 420, `<g transform="scale(3.2)">${shellItem("#ff8fbf")}</g>`],
        [1330, 560, seagull({ x: -20, y: 50, s: 1.3 })],
      ]);
    },

    end() {
      return wrap(
        `${outdoor("ben")}${starField()}<circle cx="1250" cy="190" r="80" fill="#fff6c9"/><circle cx="1290" cy="165" r="80" fill="url(#ben)"/>
        <rect y="460" width="1600" height="180" fill="#2a3a7a"/>
        ${[0, 1, 2, 3].map((i) => `<rect x="${1180 + (i % 2) * 30}" y="${480 + i * 30}" width="${140 - i * 25}" height="8" rx="4" fill="#fff6c9" opacity=".5"/>`).join("")}
        <path d="M0 640 Q400 610 800 640 T1600 630 L1600 900 L0 900 Z" fill="#2a2560"/>
        <g opacity=".85">${sandcastle(500, 760, 0.7).replace(/fill="#e8c77e"/g, 'fill="#3b3570"').replace(/fill="#7fd0ff"/g, 'fill="#2a3a7a"')}</g>
        ${sparkle(560, 300, 1.2)}${sparkle(1050, 200, 1, 0.6)}${sparkle(800, 160, 1.3, 1.1)}`,
        sky("ben", "#1d1b4b", "#5b4b9a"),
      );
    },
  };

  globalThis.SCENES = SCENES;
})();
