(() => {
// Hand-built SVG scenes (1600x900) animated with SMIL, so the book works offline
// and the video recorder can capture it. Each scene is a function returning an SVG string.

const SKIN = "#ffdcc4";
const GOLD = "#ffcf33";
const GOLD_EDGE = "#e0a100";

// Character bible — keep in sync with art/characters.md
const CAST = {
  frida: {
    name: "Frida",
    dress: ["#f78fb3", "#a66cff", "#ffd447"], // pink bodice, purple skirt, yellow trim/sash
    dots: "#ffd447",
    pj: ["#ffd6ec", "#ffd6ec", "#ffe58a"],
    shoe: "#7d3cc8",
    hair: "#6b4226",
    hairStyle: "long",
    jewels: ["#ff4f9a", "#8e44ff", "#ffc300"],
    main: true,
  },
  mia: { name: "Mia", dress: ["#8fd3ff", "#bfe7ff", "#ffffff"], pj: ["#dff3ff", "#dff3ff", "#8fd3ff"], shoe: "#3a8fd1", hair: "#f3d27a", hairStyle: "bob" },
  lenna: { name: "Lenna", dress: ["#8ee08e", "#c6f3c1", "#ffffff"], pj: ["#e2f8df", "#e2f8df", "#8ee08e"], shoe: "#3e9a48", hair: "#d9692c", hairStyle: "pigtails" },
  eliise: { name: "Eliise", dress: ["#cfaeff", "#e8d9ff", "#ffffff"], pj: ["#f1e8ff", "#f1e8ff", "#cfaeff"], shoe: "#8a5cd0", hair: "#2b1d1a", hairStyle: "buns" },
  kertu: { name: "Kertu", dress: ["#ffe14d", "#fff0a3", "#ffffff"], pj: ["#fff7cf", "#fff7cf", "#ffe14d"], shoe: "#d9a400", hair: "#a8743f", hairStyle: "ponytail" },
};

// Arm shapes for the right arm: [elbow, hand], relative to the princess's feet. Left arm mirrors.
const ARMS = {
  stand: [[44, -150], [50, -112]],
  wave: [[62, -210], [66, -262]],
  wave2: [[72, -200], [92, -246]],
  up: [[56, -230], [64, -270]],
  hold: [[42, -140], [14, -150]],
  out: [[60, -180], [92, -172]],
  mouth: [[46, -150], [12, -212]],
  brush: [[44, -152], [-6, -214]],
  reach: [[46, -250], [50, -302]],
  low: [[46, -150], [30, -140]],
};
const SHOULDER = [28, -190];

const n = (v) => Math.round(v * 10) / 10;

function armPath(side, pose) {
  const m = side === "l" ? -1 : 1;
  const [[ex, ey], [hx, hy]] = ARMS[pose];
  return { d: `M${m * SHOULDER[0]} ${SHOULDER[1]} L${m * ex} ${ey} L${m * hx} ${hy}`, hx: m * hx, hy };
}

function arm(side, pose, top, item = "", alt = null) {
  const a = armPath(side, pose);
  let anim = "", handAnim = "", itemAnim = "";
  if (alt) {
    const b = armPath(side, alt.pose);
    const t = `dur="${alt.dur}s" begin="${alt.begin || 0}s" repeatCount="indefinite"`;
    anim = `<animate attributeName="d" values="${a.d};${b.d};${a.d}" ${t}/>`;
    handAnim = `<animate attributeName="cx" values="${a.hx};${b.hx};${a.hx}" ${t}/><animate attributeName="cy" values="${a.hy};${b.hy};${a.hy}" ${t}/>`;
    itemAnim = `<animateTransform attributeName="transform" type="translate" values="${a.hx} ${a.hy};${b.hx} ${b.hy};${a.hx} ${a.hy}" ${t}/>`;
  }
  return `<g>
    <path d="${a.d}" fill="none" stroke="${SKIN}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round">${anim}</path>
    <circle cx="${a.hx}" cy="${a.hy}" r="8.5" fill="${SKIN}">${handAnim}</circle>
    ${item ? `<g transform="translate(${a.hx} ${a.hy})">${itemAnim}${item}</g>` : ""}
    <circle cx="${(side === "l" ? -1 : 1) * SHOULDER[0]}" cy="${SHOULDER[1]}" r="13" fill="${top}"/>
  </g>`;
}

function hairBack(c) {
  const h = c.hair;
  switch (c.hairStyle) {
    case "long":
      return `<path d="M-42 -250 C-60 -200 -62 -150 -48 -112 Q0 -124 48 -112 C62 -150 60 -200 42 -250 Z" fill="${h}"/>`;
    case "bob":
      return `<ellipse cx="0" cy="-238" rx="49" ry="46" fill="${h}"/>`;
    case "pigtails":
      return `<ellipse cx="0" cy="-243" rx="44" ry="42" fill="${h}"/>
        <ellipse cx="-54" cy="-218" rx="16" ry="24" fill="${h}"/><ellipse cx="54" cy="-218" rx="16" ry="24" fill="${h}"/>
        <circle cx="-46" cy="-238" r="6" fill="#ff6fa5"/><circle cx="46" cy="-238" r="6" fill="#ff6fa5"/>`;
    case "buns":
      return `<ellipse cx="0" cy="-243" rx="44" ry="42" fill="${h}"/>
        <circle cx="-40" cy="-276" r="17" fill="${h}"/><circle cx="40" cy="-276" r="17" fill="${h}"/>`;
    case "ponytail":
      return `<ellipse cx="0" cy="-243" rx="44" ry="42" fill="${h}"/>
        <g><animateTransform attributeName="transform" type="rotate" values="-6 34 -258;8 34 -258;-6 34 -258" dur="1.6s" repeatCount="indefinite"/>
        <path d="M30 -262 C78 -262 82 -200 66 -168 C60 -196 54 -224 30 -242 Z" fill="${h}"/></g>`;
  }
  return "";
}

function face(c, o) {
  const eyes =
    o.eyes === "closed"
      ? `<path d="M-21 -235 Q-14 -228 -7 -235 M7 -235 Q14 -228 21 -235" stroke="#3a2a2a" stroke-width="3" fill="none" stroke-linecap="round"/>`
      : [-14, 14]
          .map(
            (x) => `<ellipse cx="${x}" cy="-236" rx="5" ry="6.5" fill="#3a2a2a">
            <animate attributeName="ry" values="6.5;6.5;0.8;6.5" keyTimes="0;0.93;0.96;1" dur="4s" begin="${o.blink || 0}s" repeatCount="indefinite"/></ellipse>
            <circle cx="${x + 1.8}" cy="-238.5" r="1.8" fill="#fff"/>`,
          )
          .join("");
  const mouth =
    o.mouth === "open"
      ? `<ellipse cx="0" cy="-216" rx="6" ry="6" fill="#c2185b"/>`
      : `<path d="M-9 -219 Q0 -210 9 -219" stroke="#c2185b" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  return `${eyes}<circle cx="-25" cy="-220" r="7" fill="#ff9fb0" opacity=".55"/><circle cx="25" cy="-220" r="7" fill="#ff9fb0" opacity=".55"/>${mouth}`;
}

function hairFront(c) {
  let s = `<path d="M-41 -236 C-44 -276 -20 -284 0 -283 C20 -284 44 -276 41 -236 C34 -252 24 -258 12 -254 C6 -262 -6 -262 -12 -256 C-24 -258 -34 -252 -41 -236 Z" fill="${c.hair}"/>`;
  if (c.hairStyle === "long")
    s += `<path d="M-41 -242 C-50 -200 -46 -168 -38 -146 L-29 -150 C-34 -180 -35 -214 -31 -242 Z" fill="${c.hair}"/>
      <path d="M41 -242 C50 -200 46 -168 38 -146 L29 -150 C34 -180 35 -214 31 -242 Z" fill="${c.hair}"/>`;
  return s;
}

function crownSvg(c) {
  if (c.main) {
    return `<path d="M-25 -270 L-30 -304 L-14 -286 L0 -312 L14 -286 L30 -304 L25 -270 Z" fill="${GOLD}" stroke="${GOLD_EDGE}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="-15" cy="-279" r="4.5" fill="${c.jewels[0]}"/><circle cx="0" cy="-285" r="5.5" fill="${c.jewels[1]}"/><circle cx="15" cy="-279" r="4.5" fill="${c.jewels[2]}"/>
      ${sparkle(22, -310, 0.5, 0.3)}`;
  }
  return `<path d="M-22 -268 L-18 -290 L-8 -280 L0 -296 L8 -280 L18 -290 L22 -268 Q0 -276 -22 -268 Z" fill="${GOLD}" stroke="${GOLD_EDGE}" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="0" cy="-279" r="4.5" fill="${c.dress[0]}" stroke="#fff" stroke-width="1.5"/>`;
}

/**
 * Draw a princess with her feet at (x, y).
 * o: { x, y, s, flip, pj, sit, l, r (arm poses), lAlt/rAlt {pose,dur,begin}, lItem/rItem, eyes, mouth, headOnly, anim, crown }
 */
function princess(id, o = {}) {
  const c = CAST[id];
  const { x = 0, y = 0, s = 1, flip = false, pj = false, sit = false, l = "stand", r = "stand", headOnly = false } = o;
  const crown = o.crown ?? !pj;
  const [top, skirt, trim] = pj ? c.pj : c.dress;
  const tf = `translate(${x} ${y}) scale(${flip ? -s : s} ${s})`;

  const head = `${hairBack(c)}<rect x="-7" y="-206" width="14" height="14" fill="${SKIN}"/>
    <circle cx="0" cy="-238" r="40" fill="${SKIN}"/>${face(c, o)}${hairFront(c)}${crown ? crownSvg(c) : ""}`;
  if (headOnly) return `<g transform="${tf}"><g>${o.anim || ""}${head}</g></g>`;

  let legs;
  if (sit) {
    legs = `<rect x="-6" y="-56" width="70" height="24" rx="11" fill="${pj ? top : SKIN}"/><ellipse cx="66" cy="-42" rx="10" ry="14" fill="${c.shoe}"/>`;
  } else if (pj) {
    legs = `<rect x="-24" y="-112" width="21" height="106" rx="8" fill="${top}"/><rect x="3" y="-112" width="21" height="106" rx="8" fill="${top}"/>
      <ellipse cx="-14" cy="-4" rx="13" ry="7" fill="#ff9fc8"/><ellipse cx="14" cy="-4" rx="13" ry="7" fill="#ff9fc8"/>`;
  } else {
    legs = `<rect x="-20" y="-50" width="13" height="48" fill="${SKIN}"/><rect x="7" y="-50" width="13" height="48" fill="${SKIN}"/>
      <ellipse cx="-15" cy="-3" rx="13" ry="7" fill="${c.shoe}"/><ellipse cx="15" cy="-3" rx="13" ry="7" fill="${c.shoe}"/>`;
  }

  let body;
  if (pj) {
    body = `<path d="M-30 -104 L-29 -192 Q0 -202 29 -192 L30 -104 Q0 -98 -30 -104 Z" fill="${top}"/>
      <circle cx="0" cy="-170" r="3" fill="${trim}"/><circle cx="0" cy="-150" r="3" fill="${trim}"/><circle cx="0" cy="-130" r="3" fill="${trim}"/>
      <path d="M-14 -195 Q0 -182 14 -195" stroke="${trim}" stroke-width="5" fill="none"/>`;
  } else {
    const dots = c.dots
      ? [[-30, -70], [0, -60], [30, -72], [-15, -100], [15, -102], [-50, -54], [50, -54]]
          .map(([dx, dy]) => `<circle cx="${dx}" cy="${dy}" r="4" fill="${c.dots}"/>`)
          .join("")
      : "";
    body = `<path d="M-27 -152 C-40 -120 -60 -80 -80 -44 Q0 -26 80 -44 C60 -80 40 -120 27 -152 Z" fill="${skirt}"/>${dots}
      <path d="M-80 -44 Q0 -26 80 -44" stroke="${trim}" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M-27 -152 L-29 -192 Q0 -202 29 -192 L27 -152 Z" fill="${top}"/>
      <rect x="-30" y="-162" width="60" height="11" rx="5" fill="${trim}"/>`;
  }

  const inner = `${hairBack(c)}${legs}${body}
    ${arm("l", l, top, o.lItem, o.lAlt)}${arm("r", r, top, o.rItem, o.rAlt)}
    <rect x="-7" y="-206" width="14" height="14" fill="${SKIN}"/>
    <circle cx="0" cy="-238" r="40" fill="${SKIN}"/>${face(c, o)}${hairFront(c)}${crown ? crownSvg(c) : ""}`;

  return `<g transform="${tf}"><g>${o.anim || ""}<g transform="translate(0 ${sit ? 40 : 0})">${inner}</g></g></g>`;
}

// ---------- small reusable pieces ----------

const bob = (dy, dur, begin = 0) =>
  `<animateTransform attributeName="transform" type="translate" values="0 0;0 ${-dy};0 0" dur="${dur}s" begin="${begin}s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1"/>`;
const hop = (dy, dur, begin = 0) =>
  `<animateTransform attributeName="transform" type="translate" values="0 0;0 ${-dy};0 0" dur="${dur}s" begin="${begin}s" repeatCount="indefinite" calcMode="spline" keySplines="0 .5 .5 1;.5 0 1 .5"/>`;

function sparkle(x, y, s = 1, begin = 0) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -18 L4 -4 L18 0 L4 4 L0 18 L-4 4 L-18 0 L-4 -4 Z" fill="#fff6b0">
    <animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="${begin}s" repeatCount="indefinite"/>
    <animateTransform attributeName="transform" type="scale" values="0.3;1.1;0.3" dur="1.8s" begin="${begin}s" repeatCount="indefinite"/></path></g>`;
}

const sky = (id, a, b) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

function sun(x, y, r = 60) {
  const rays = Array.from({ length: 12 }, (_, i) => `<rect x="-5" y="${-r - 38}" width="10" height="26" rx="5" fill="#ffd54f" transform="rotate(${i * 30})"/>`).join("");
  return `<g transform="translate(${x} ${y})"><g>${rays}<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="30s" repeatCount="indefinite"/></g>
    <circle r="${r}" fill="#ffe066"/><circle cx="-18" cy="-6" r="5" fill="#e0a100"/><circle cx="18" cy="-6" r="5" fill="#e0a100"/>
    <path d="M-18 14 Q0 30 18 14" stroke="#e0a100" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
}

function cloud(x, y, s = 1, dur = 40) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><g>
    <animateTransform attributeName="transform" type="translate" values="0 0;80 0;0 0" dur="${dur}s" repeatCount="indefinite"/>
    <ellipse cx="0" cy="0" rx="70" ry="38" fill="#fff"/><ellipse cx="55" cy="10" rx="55" ry="30" fill="#fff"/><ellipse cx="-55" cy="12" rx="50" ry="26" fill="#fff"/><ellipse cx="10" cy="-25" rx="45" ry="32" fill="#fff"/></g></g>`;
}

function flower(x, y, color, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 L0 -40" stroke="#3e9a48" stroke-width="5"/>
    ${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-58" rx="9" ry="14" fill="${color}" transform="rotate(${a} 0 -46)"/>`).join("")}
    <circle cx="0" cy="-46" r="8" fill="#ffd54f"/></g>`;
}

function bush(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="-30" rx="70" ry="45" fill="#4caf50"/><ellipse cx="-45" cy="-15" rx="45" ry="32" fill="#43a047"/><ellipse cx="50" cy="-15" rx="45" ry="32" fill="#43a047"/></g>`;
}

function castle(x, y, s = 1, main = "#ffd1e6", roof = "#b56cff") {
  const tower = (tx, h) => `<rect x="${tx - 45}" y="${-h}" width="90" height="${h}" fill="${main}" stroke="#e7a9c8" stroke-width="3"/>
    <path d="M${tx - 58} ${-h} L${tx} ${-h - 120} L${tx + 58} ${-h} Z" fill="${roof}"/>
    <path d="M${tx} ${-h - 120} L${tx} ${-h - 165}" stroke="#8d6e63" stroke-width="4"/>
    <path d="M${tx} ${-h - 165} L${tx + 40} ${-h - 152} L${tx} ${-h - 140} Z" fill="#ff4f9a"><animate attributeName="d" values="M${tx} ${-h - 165} L${tx + 40} ${-h - 152} L${tx} ${-h - 140} Z;M${tx} ${-h - 165} L${tx + 36} ${-h - 158} L${tx} ${-h - 140} Z;M${tx} ${-h - 165} L${tx + 40} ${-h - 152} L${tx} ${-h - 140} Z" dur="1.2s" repeatCount="indefinite"/></path>
    <rect x="${tx - 14}" y="${-h + 40}" width="28" height="40" rx="14" fill="#7ec8ff"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-200" y="-260" width="400" height="260" fill="${main}" stroke="#e7a9c8" stroke-width="3"/>
    ${Array.from({ length: 8 }, (_, i) => `<rect x="${-200 + i * 52}" y="-290" width="34" height="32" fill="${main}" stroke="#e7a9c8" stroke-width="3"/>`).join("")}
    ${tower(-230, 380)}${tower(230, 380)}${tower(0, 470)}
    <path d="M-55 0 L-55 -110 Q0 -170 55 -110 L55 0 Z" fill="#a1653f"/><circle cx="35" cy="-55" r="6" fill="${GOLD}"/>
    <rect x="-150" y="-200" width="50" height="60" rx="25" fill="#7ec8ff"/><rect x="100" y="-200" width="50" height="60" rx="25" fill="#7ec8ff"/></g>`;
}

const grass = (y = 690, c = "#8bd17c") =>
  `<path d="M0 ${y} Q400 ${y - 30} 800 ${y} T1600 ${y} L1600 900 L0 900 Z" fill="${c}"/>`;

function windowFrame(x, y, w, h, inner) {
  return `<g transform="translate(${x} ${y})"><clipPath id="win${x}${y}"><rect width="${w}" height="${h}" rx="18"/></clipPath>
    <g clip-path="url(#win${x}${y})">${inner}</g>
    <rect width="${w}" height="${h}" rx="18" fill="none" stroke="#fff" stroke-width="16"/>
    <path d="M${w / 2} 0 V${h} M0 ${h / 2} H${w}" stroke="#fff" stroke-width="10"/></g>`;
}

function curtains(x, y, w, h, color, closed = false) {
  const cw = closed ? w / 2 + 20 : 90;
  return `<path d="M${x - 40} ${y - 30} h${cw} q-20 ${h / 2} 10 ${h + 60} h${-cw - 10} Z" fill="${color}"/>
    <path d="M${x + w + 40} ${y - 30} h${-cw} q20 ${h / 2} -10 ${h + 60} h${cw + 10} Z" fill="${color}"/>
    <rect x="${x - 60}" y="${y - 44}" width="${w + 120}" height="16" rx="8" fill="#b28b6e"/>`;
}

function bed(x, y, blanket = "#c9a7ff") {
  return {
    back: `<g transform="translate(${x} ${y})"><path d="M-40 0 V-300 Q-40 -350 10 -350 H90 Q140 -350 140 -300 V0 Z" fill="#f2b6d3"/>
      <rect x="-40" y="-120" width="600" height="120" rx="20" fill="#f7c7de"/><rect x="-30" y="-150" width="580" height="50" rx="22" fill="#fff"/>
      <ellipse cx="80" cy="-165" rx="85" ry="38" fill="#fff" stroke="#f0d9e6" stroke-width="3"/></g>`,
    front: `<g transform="translate(${x} ${y})"><path d="M60 -170 Q300 -200 560 -150 L560 -40 Q300 -20 60 -40 Z" fill="${blanket}"/>
      ${[140, 240, 340, 440].map((bx) => `<circle cx="${bx}" cy="-100" r="10" fill="#fff" opacity=".7"/>`).join("")}
      <rect x="540" y="-220" width="40" height="220" rx="14" fill="#f2b6d3"/></g>`,
  };
}

function nightstand(x, y, withCrown = true) {
  return `<g transform="translate(${x} ${y})"><rect x="-70" y="-130" width="140" height="130" rx="10" fill="#e8b98f"/>
    <rect x="-56" y="-100" width="112" height="40" rx="6" fill="#d9a576"/><circle cy="-80" r="6" fill="#fff"/>
    ${withCrown ? `<g transform="translate(0 -130) scale(1.1)"><path d="M-25 0 L-30 -34 L-14 -16 L0 -42 L14 -16 L30 -34 L25 0 Z" fill="${GOLD}" stroke="${GOLD_EDGE}" stroke-width="2.5"/>
      <circle cx="-15" cy="-9" r="4.5" fill="#ff4f9a"/><circle cx="0" cy="-15" r="5.5" fill="#8e44ff"/><circle cx="15" cy="-9" r="4.5" fill="#ffc300"/>${sparkle(28, -40, 0.6)}${sparkle(-30, -20, 0.4, 0.9)}</g>` : ""}</g>`;
}

function wardrobe(x, y, open = false, hangingDress = false) {
  const dress = hangingDress
    ? `<g transform="translate(120 -330)"><path d="M-30 0 Q0 -24 30 0" stroke="#8d6e63" stroke-width="4" fill="none"/><path d="M0 -24 v-14" stroke="#8d6e63" stroke-width="4"/>
       <path d="M-22 0 L22 0 L24 50 L-24 50 Z" fill="#f78fb3"/><rect x="-26" y="42" width="52" height="10" rx="5" fill="#ffd447"/>
       <path d="M-24 52 C-36 90 -55 130 -70 170 Q0 186 70 170 C55 130 36 90 24 52 Z" fill="#a66cff"/>
       <path d="M-70 170 Q0 186 70 170" stroke="#ffd447" stroke-width="8" fill="none"/></g>`
    : "";
  return `<g transform="translate(${x} ${y})"><rect x="0" y="-440" width="240" height="440" rx="12" fill="#d9a576"/>
    ${open ? `<rect x="14" y="-426" width="212" height="400" fill="#7a4e33"/>${dress}<path d="M240 -440 L320 -410 L320 -30 L240 0 Z" fill="#e8b98f"/>` : `<path d="M120 -430 V-10" stroke="#b9875c" stroke-width="4"/><circle cx="105" cy="-220" r="7" fill="#fff"/><circle cx="135" cy="-220" r="7" fill="#fff"/>`}
    <path d="M-10 -440 H250" stroke="#b9875c" stroke-width="14" stroke-linecap="round"/></g>`;
}

function teddy(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="-26" cy="-92" r="14" fill="#b07a4f"/><circle cx="26" cy="-92" r="14" fill="#b07a4f"/>
    <ellipse cx="0" cy="-30" rx="38" ry="34" fill="#c68b5c"/><circle cx="0" cy="-74" r="32" fill="#c68b5c"/><ellipse cx="0" cy="-64" rx="13" ry="10" fill="#f0d2b4"/>
    <circle cx="-11" cy="-80" r="4" fill="#3a2a2a"/><circle cx="11" cy="-80" r="4" fill="#3a2a2a"/><circle cx="0" cy="-67" r="4" fill="#3a2a2a"/></g>`;
}

const room = (wall, floor = "#e2b98f") =>
  `<rect width="1600" height="900" fill="${wall}"/><rect y="700" width="1600" height="200" fill="${floor}"/><rect y="690" width="1600" height="14" fill="#fff" opacity=".6"/>`;

const wrap = (inner, defs = "") =>
  `<svg viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${inner}</svg>`;

const outdoor = (id) => `<rect width="1600" height="900" fill="url(#${id})"/>`;
const ALL = ["mia", "lenna", "frida", "eliise", "kertu"];

// ---------- the shared dragon ----------
// Drawn lying on the grass, facing left; body centre ~(900,570), head at (430,290), tail tip (1505,695).
const DRAGON = { body: "#7fd6b0", belly: "#ffd9ea", spikes: "#ffcf33", wing: "#b48cff", dark: "#3f8f70" };
const STONE = { body: "#a9abb6", belly: "#c8c9d2", spikes: "#8e909c", wing: "#9d9fae", dark: "#6f717d" };
const NECK_PIVOT = "720 540";

function dragonHead(col, eyes = "open") {
  const eye =
    eyes === "closed"
      ? `<path d="M-36 -16 Q-15 2 6 -16" stroke="${col.dark}" stroke-width="6" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="-15" cy="-18" rx="20" ry="24" fill="#fff"/><circle cx="-22" cy="-14" r="11" fill="#2b1d3a"/><circle cx="-26" cy="-19" r="4" fill="#fff"/>
         <ellipse cx="-15" cy="-18" rx="22" ry="0" fill="${col.body}"><animate attributeName="ry" values="0;0;26;0" keyTimes="0;0.9;0.95;1" dur="5s" repeatCount="indefinite"/></ellipse>`;
  return `<path d="M58 -48 L88 -128 L98 -40 Z" fill="${col.spikes}"/><path d="M8 -58 L22 -134 L46 -52 Z" fill="${col.spikes}"/>
    <ellipse cx="0" cy="0" rx="95" ry="72" fill="${col.body}"/><ellipse cx="-85" cy="22" rx="72" ry="50" fill="${col.body}"/>
    <ellipse cx="-78" cy="48" rx="58" ry="20" fill="${col.belly}"/>
    <circle cx="-132" cy="4" r="6" fill="${col.dark}"/><circle cx="-110" cy="-1" r="6" fill="${col.dark}"/>
    ${eye}<circle cx="-40" cy="24" r="14" fill="#ff9fb0" opacity=".5"/>
    <path d="M-142 38 Q-100 62 -56 44" stroke="${col.dark}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
}

/** o: { stone, eyes, head: "up" | "down" | "nod" | "pick", flap, col, headFn, wings, spikes, spots } (last five: other big creatures) */
function dragon(o = {}) {
  const col = o.col || (o.stone ? STONE : DRAGON);
  const wing = (x, y, op, begin) => `<g transform="translate(${x} ${y})"><g>
      ${o.flap ? `<animateTransform attributeName="transform" type="rotate" values="0;-16;0" dur="1.2s" begin="${begin}s" repeatCount="indefinite"/>` : ""}
      <path d="M0 0 C-40 -140 40 -210 140 -240 C120 -180 160 -150 200 -150 C180 -110 200 -70 230 -50 Z" fill="${col.wing}" opacity="${op}"/>
      <path d="M10 -10 C40 -100 80 -160 140 -240 M20 -10 C80 -80 140 -120 200 -150" stroke="${col.dark}" stroke-width="4" fill="none" opacity=".35"/></g></g>`;
  const spikes = Array.from({ length: 9 }, (_, i) => {
    const x = 700 + i * 55;
    const ty = 570 - 140 * Math.sqrt(Math.max(0, 1 - ((x - 900) / 300) ** 2));
    return `<path d="M${x - 20} ${ty + 10} L${x} ${ty - 36} L${x + 20} ${ty + 10} Z" fill="${col.spikes}"/>`;
  }).join("");
  const headAnim = {
    up: "",
    down: `<animateTransform attributeName="transform" type="rotate" values="-40 ${NECK_PIVOT}" dur="1s" fill="freeze"/>`,
    nod: `<animateTransform attributeName="transform" type="rotate" values="0 ${NECK_PIVOT};-7 ${NECK_PIVOT};0 ${NECK_PIVOT}" dur="2.4s" repeatCount="indefinite"/>`,
    // lowers to the ground, lifts a princess up, holds, lowers again — in step with the riders below
    pick: `<animateTransform attributeName="transform" type="rotate" values="-40 ${NECK_PIVOT};0 ${NECK_PIVOT};0 ${NECK_PIVOT};-40 ${NECK_PIVOT}" keyTimes="0;0.6;0.8;1" dur="1.5s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .6 1;0 0 1 1;.4 0 .6 1"/>`,
  }[o.head || "up"];
  return `<g>
    <path d="M1150 560 C1300 560 1380 640 1500 688 L1505 702 C1380 690 1290 650 1140 640 Z" fill="${col.body}"/>
    ${o.spikes === false ? "" : `<path d="M1490 690 L1540 660 L1530 712 Z" fill="${col.spikes}"/>`}
    ${o.wings === false ? "" : wing(890, 450, 0.75, 0.15)}${o.spikes === false ? "" : spikes}
    <ellipse cx="900" cy="570" rx="300" ry="140" fill="${col.body}"/>
    <ellipse cx="880" cy="625" rx="230" ry="68" fill="${col.belly}"/>${o.spots || ""}
    ${[760, 840, 920, 1000].map((x) => `<path d="M${x} 580 Q${x + 10} 625 ${x} 670" stroke="${col.dark}" stroke-width="3" fill="none" opacity=".25"/>`).join("")}
    <rect x="690" y="640" width="80" height="70" rx="30" fill="${col.body}"/><rect x="1030" y="640" width="80" height="70" rx="30" fill="${col.body}"/>
    ${[700, 725, 750, 1040, 1065, 1090].map((x) => `<circle cx="${x + 5}" cy="708" r="8" fill="#fff"/>`).join("")}
    ${o.wings === false ? "" : wing(960, 470, 1, 0)}
    <g>${headAnim}
      <path d="M740 560 Q570 470 450 330" stroke="${col.body}" stroke-width="120" stroke-linecap="round" fill="none"/>
      <path d="M720 600 Q575 515 470 380" stroke="${col.belly}" stroke-width="34" stroke-linecap="round" fill="none"/>
      <g transform="translate(430 290)">${(o.headFn || dragonHead)(col, o.eyes)}</g>
    </g></g>`;
}

// Princess riding: lifted from the lowered head, held on top, then sliding down the back and tail.
// Follows the top of the head, neck, back and tail; HEAD_TOP = share of the path that is the lift.
const DRAGON_RIDE = "M332 446 Q340 290 432 214 C480 240 520 320 550 348 C590 390 640 440 700 462 C780 446 840 430 900 426 C1000 428 1100 455 1160 498 C1220 545 1290 582 1330 600 C1400 640 1460 670 1505 686";
const HEAD_TOP = 0.173;

function wand(begin = 0) {
  return `<path d="M0 0 L0 -52" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
    <g transform="translate(0 -62)"><path d="M0 -16 L5 -5 L16 -4 L7 4 L10 15 L0 9 L-10 15 L-7 4 L-16 -4 L-5 -5 Z" fill="#ffd447" stroke="#fff" stroke-width="2">
      <animateTransform attributeName="transform" type="rotate" values="0;360" dur="4s" begin="${begin}s" repeatCount="indefinite"/></path>
      ${sparkle(14, -14, 0.5, begin)}</g>`;
}

function nightSky(w, h) {
  const stars = Array.from({ length: 14 }, (_, i) =>
    `<circle cx="${(i * 97) % w}" cy="${(i * 53) % (h - 40)}" r="${1.5 + (i % 3)}" fill="#fff"><animate attributeName="opacity" values="1;.2;1" dur="${2 + (i % 3)}s" repeatCount="indefinite"/></circle>`).join("");
  return `<rect width="${w}" height="${h}" fill="#1d1b4b"/>${stars}<circle cx="${w * 0.7}" cy="${h * 0.35}" r="40" fill="#fff6c9"/><circle cx="${w * 0.7 + 18}" cy="${h * 0.35 - 12}" r="38" fill="#1d1b4b"/>`;
}

const FRIENDS_ROW = ["mia", "lenna", "frida", "eliise", "kertu"];

// ---------- scenes ----------

const SCENES = {
  cover() {
    return wrap(
      `${outdoor("skyc")}${sun(1380, 140)}${cloud(250, 150, 1)}${cloud(900, 110, 0.8, 50)}
      ${castle(800, 640, 0.95)}${grass(650)}
      ${bush(140, 700)}${bush(1470, 700, 1.1)}
      ${flower(330, 760, "#ff7eb6")}${flower(1250, 770, "#b56cff")}${flower(420, 800, "#ffd447", 0.8)}${flower(1160, 820, "#7ec8ff", 0.8)}
      ${princess("mia", { x: 400, y: 740, s: 0.85, r: "wave", rAlt: { pose: "wave2", dur: 0.9 }, blink: 1 })}
      ${princess("lenna", { x: 590, y: 740, s: 0.85, l: "up", r: "up", anim: hop(14, 1.4, 0.3) })}
      ${princess("eliise", { x: 1010, y: 740, s: 0.85, l: "up", r: "up", anim: hop(14, 1.4, 0.8) })}
      ${princess("kertu", { x: 1200, y: 740, s: 0.85, flip: true, r: "wave", rAlt: { pose: "wave2", dur: 0.9, begin: 0.4 }, blink: 2 })}
      ${princess("frida", { x: 800, y: 780, s: 1.15, l: "out", r: "out", anim: bob(8, 2) })}
      ${sparkle(700, 330, 1.2)}${sparkle(920, 300, 1, 0.6)}${sparkle(800, 220, 0.8, 1.2)}`,
      sky("skyc", "#ffc6e3", "#fff3c4"),
    );
  },

  wake() {
    const b = bed(330, 700, "#c9a7ff");
    const view = `<rect width="320" height="300" fill="url(#dawn)"/>
      <g><animateTransform attributeName="transform" type="translate" values="0 140;0 0" dur="4s" fill="freeze" calcMode="spline" keySplines=".2 0 .3 1"/>${sun(160, 160, 50)}</g>
      ${cloud(60, 230, 0.4)}`;
    return wrap(
      `${room("#ffe7f1")}${windowFrame(1060, 150, 320, 300, view)}${curtains(1060, 150, 320, 300, "#ff9fc8")}
      ${b.back}
      ${princess("frida", { x: 420, y: 640, pj: true, l: "up", r: "up", mouth: "open", lAlt: { pose: "out", dur: 3 }, rAlt: { pose: "out", dur: 3 }, anim: bob(10, 3) })}
      ${b.front}${nightstand(1000, 700)}${teddy(780, 560, 0.8)}`,
      sky("dawn", "#ffcf9e", "#fff3c4"),
    );
  },

  teeth() {
    const tiles = Array.from({ length: 9 }, (_, i) => `<path d="M0 ${i * 80} H1600" stroke="#bfe3f5" stroke-width="3"/>`).join("") +
      Array.from({ length: 21 }, (_, i) => `<path d="M${i * 80} 0 V700" stroke="#bfe3f5" stroke-width="3"/>`).join("");
    const brush = `<g transform="rotate(-10)"><rect x="-6" y="-6" width="60" height="12" rx="6" fill="#ff7eb6"/><rect x="40" y="-14" width="16" height="10" rx="3" fill="#fff"/></g>`;
    const bubbles = Array.from({ length: 7 }, (_, i) =>
      `<circle cx="${780 + (i % 4) * 25}" cy="430" r="${6 + (i % 3) * 4}" fill="#fff" stroke="#9fd8f3" stroke-width="2">
        <animate attributeName="cy" values="430;250" dur="2.4s" begin="${i * 0.35}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="2.4s" begin="${i * 0.35}s" repeatCount="indefinite"/></circle>`).join("");
    return wrap(
      `<rect width="1600" height="900" fill="#e3f4fc"/>${tiles}<rect y="700" width="1600" height="200" fill="#9fd8f3"/>
      <ellipse cx="800" cy="290" rx="190" ry="220" fill="#f7e2c6"/><ellipse cx="800" cy="290" rx="170" ry="200" fill="#d8f1ff"/>
      <path d="M690 180 L740 140 M700 230 L780 160" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".8"/>
      ${princess("frida", { x: 800, y: 700, s: 1.05, pj: true, r: "mouth", rItem: brush, rAlt: { pose: "brush", dur: 0.4 } })}
      <path d="M560 590 H1040 L1000 700 H600 Z" fill="#fff"/><rect x="540" y="570" width="520" height="30" rx="15" fill="#fff" stroke="#cfe9f7" stroke-width="3"/>
      <path d="M800 570 V530 H850" stroke="#b0bec5" stroke-width="14" fill="none" stroke-linecap="round"/>
      <rect x="1080" y="490" width="50" height="80" rx="10" fill="#ffd447"/><rect x="1092" y="470" width="8" height="40" fill="#7ec8ff"/><rect x="1106" y="474" width="8" height="40" fill="#ff7eb6"/>
      ${bubbles}${sparkle(860, 520, 0.7)}`,
    );
  },

  dress() {
    const sparkles = [[600, 300], [1000, 280], [560, 520], [1050, 500], [800, 140], [700, 420], [900, 440]]
      .map(([x, y], i) => sparkle(x, y, 0.9, i * 0.25)).join("");
    return wrap(
      `${room("#f3e6ff")}${wardrobe(150, 700, true)}
      <g transform="translate(1250 700)"><rect x="0" y="-480" width="200" height="480" rx="100" fill="#e8b98f"/><rect x="18" y="-460" width="164" height="440" rx="82" fill="#e7f6ff"/></g>
      <ellipse cx="800" cy="720" rx="220" ry="30" fill="#e6c2ff"/>
      <g transform="translate(800 0)"><g><animateTransform attributeName="transform" type="rotate" values="-3 0 700;3 0 700;-3 0 700" dur="1.6s" repeatCount="indefinite"/>
      ${princess("frida", { x: 0, y: 720, s: 1.4, l: "out", r: "out", lAlt: { pose: "up", dur: 3.2 }, rAlt: { pose: "up", dur: 3.2 } })}</g></g>
      ${sparkles}`,
    );
  },

  read() {
    const books = (x, y) =>
      Array.from({ length: 9 }, (_, i) => {
        const cs = ["#ff7eb6", "#7ec8ff", "#ffd447", "#8ee08e", "#b56cff"];
        return `<rect x="${x + i * 34}" y="${y - 70 - (i % 3) * 10}" width="28" height="${70 + (i % 3) * 10}" rx="4" fill="${cs[i % 5]}"/>`;
      }).join("");
    const book = `<g transform="translate(0 6)"><path d="M0 0 L-60 -8 L-60 34 L0 42 Z" fill="#fff" stroke="#e0c9a6" stroke-width="2"/><path d="M0 0 L60 -8 L60 34 L0 42 Z" fill="#fff" stroke="#e0c9a6" stroke-width="2"/>
      <path d="M0 0 L60 -8 L60 34 L0 42 Z" fill="#fff8e7" stroke="#e0c9a6" stroke-width="2"><animateTransform attributeName="transform" type="scale" values="1 1;-1 1;-1 1;1 1" keyTimes="0;0.15;0.95;1" dur="4s" repeatCount="indefinite"/></path>
      <path d="M-50 6 H-10 M-50 16 H-10 M-50 26 H-14 M10 6 H50 M10 16 H50" stroke="#c9b8a0" stroke-width="2"/></g>`;
    const frog = `<g><animateMotion path="M0 0 Q 60 -150 140 -40" dur="2.4s" repeatCount="indefinite" keyPoints="0;0;1;1" keyTimes="0;0.3;0.8;1" calcMode="linear"/>
      <ellipse cx="0" cy="0" rx="24" ry="18" fill="#6cc04a"/><circle cx="-10" cy="-16" r="9" fill="#6cc04a"/><circle cx="10" cy="-16" r="9" fill="#6cc04a"/>
      <circle cx="-10" cy="-17" r="4" fill="#222"/><circle cx="10" cy="-17" r="4" fill="#222"/><path d="M-10 2 Q0 10 10 2" stroke="#2e7d32" stroke-width="3" fill="none"/></g>`;
    return wrap(
      `${room("#fff1d6", "#c9925f")}
      <g transform="translate(1080 700)"><rect x="0" y="-560" width="380" height="560" fill="#b9875c"/>
        ${[-400, -260, -120].map((sy) => `<rect x="15" y="${sy}" width="350" height="12" fill="#8d5d3b"/>${books(30, sy)}`).join("")}</g>
      ${windowFrame(140, 140, 280, 260, `<rect width="280" height="260" fill="#bfe7ff"/>${cloud(120, 100, 0.5)}`)}
      <g transform="translate(700 700)"><rect x="-230" y="-420" width="460" height="320" rx="80" fill="#ff8fbf"/></g>
      ${princess("frida", { x: 700, y: 560, s: 1.1, sit: true, l: "hold", r: "hold" })}
      <g transform="translate(700 700)"><rect x="-260" y="-220" width="80" height="220" rx="40" fill="#ff7ab3"/><rect x="180" y="-220" width="80" height="220" rx="40" fill="#ff7ab3"/>
        <rect x="-200" y="-140" width="400" height="120" rx="30" fill="#ff9cc6"/></g>
      <g transform="translate(700 395)">${book}<g transform="translate(20 -10)">${frog}</g></g>
      ${sparkle(560, 300, 0.8)}${sparkle(860, 280, 0.6, 0.7)}`,
    );
  },

  friends() {
    return wrap(
      `${outdoor("skyf")}${sun(1450, 120, 55)}${cloud(700, 130, 0.9)}${cloud(1150, 220, 0.6, 55)}
      ${castle(250, 660, 0.75)}${grass(660)}${bush(1530, 700)}
      ${flower(560, 780, "#ff7eb6")}${flower(1450, 800, "#b56cff")}${flower(760, 820, "#ffd447", 0.8)}
      ${princess("frida", { x: 250, y: 720, s: 0.9, r: "wave", rAlt: { pose: "wave2", dur: 0.8 } })}
      ${["mia", "lenna", "eliise", "kertu"]
        .map((id, i) => princess(id, { x: 800 + i * 175, y: 730, s: 0.9, flip: true, r: "wave", rAlt: { pose: "wave2", dur: 0.8, begin: i * 0.2 }, mouth: i % 2 ? "open" : "", anim: hop(10, 1.2, i * 0.3), blink: i }))
        .join("")}`,
      sky("skyf", "#9fdcff", "#e8f8ff"),
    );
  },

  ball() {
    const ballPath = "M330 470 Q560 40 800 450 Q1040 40 1270 470 Q800 -120 330 470";
    const xs = [330, 565, 800, 1035, 1270];
    const poses = [{ l: "up", r: "up" }, { r: "reach" }, { l: "up", r: "up" }, { l: "reach", flip: true }, { l: "up", r: "up", flip: true }];
    const order = ["mia", "lenna", "frida", "eliise", "kertu"];
    return wrap(
      `${outdoor("skyb")}${sun(150, 120, 50)}${cloud(500, 120, 0.8)}${cloud(1200, 160, 0.7, 50)}${grass(620)}
      ${bush(80, 680)}${bush(1530, 690)}
      ${order.map((id, i) => princess(id, { x: xs[i], y: 740, s: 0.82, ...poses[i], mouth: i % 2 ? "" : "open", anim: hop(18, 1, i * 0.2), blink: i })).join("")}
      <g><animateMotion path="${ballPath}" dur="6s" repeatCount="indefinite"/>
        <g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="1s" repeatCount="indefinite"/>
        <circle r="36" fill="#ff5c8a"/><path d="M-36 0 A36 36 0 0 0 36 0 Z" fill="#ffd447"/><path d="M0 -36 V36" stroke="#fff" stroke-width="6"/><circle r="36" fill="none" stroke="#fff" stroke-width="4"/></g></g>`,
      sky("skyb", "#8fd3ff", "#e8f8ff"),
    );
  },

  slide() {
    const slidePath = "M480 260 C660 270 800 650 1060 690 L1220 694";
    const ride = "M480 236 C660 246 800 626 1060 666 L1220 670";
    const order = ["frida", "mia", "lenna", "eliise", "kertu"];
    const riders = order
      .map((id, i) => `<g><animateMotion path="${ride}" dur="6s" begin="${-i * 1.2}s" repeatCount="indefinite" rotate="auto" keyPoints="0;0;1;1" keyTimes="0;0.2;0.75;1" calcMode="linear"/>
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.04;0.92;1" dur="6s" begin="${-i * 1.2}s" repeatCount="indefinite"/>
        ${princess(id, { x: 0, y: 0, s: 0.62, sit: true, l: "up", r: "up", mouth: "open" })}</g>`)
      .join("");
    return wrap(
      `${outdoor("skys")}${sun(1450, 120, 55)}${cloud(900, 120, 0.9)}${grass(690, "#93d68a")}
      <rect x="0" y="740" width="1600" height="160" fill="#f3d9a4"/>
      <g stroke="#ff8a3d" stroke-width="14" stroke-linecap="round"><path d="M300 740 V250 M460 740 V250"/>${[320, 400, 480, 560, 640, 720].map((y) => `<path d="M300 ${y} H460" stroke-width="10"/>`).join("")}</g>
      <rect x="280" y="236" width="220" height="26" rx="8" fill="#ff5c8a"/><path d="M300 236 L380 150 L480 236 Z" fill="#ffd447"/>
      <path d="${slidePath}" stroke="#56b4ff" stroke-width="46" fill="none" stroke-linecap="round"/>
      <path d="${slidePath}" stroke="#a8dcff" stroke-width="22" fill="none" stroke-linecap="round"/>
      <path d="M1060 694 V740 M1200 694 V740" stroke="#ff8a3d" stroke-width="12"/>
      ${riders}
      ${flower(120, 800, "#ff7eb6")}${flower(1480, 820, "#b56cff")}`,
      sky("skys", "#8fd3ff", "#e8f8ff"),
    );
  },

  bouncy() {
    const breathe = (inner) => `<g transform="translate(800 720)"><g>
      <animateTransform attributeName="transform" type="scale" values="1 1;1.012 0.985;1 1" dur="1s" repeatCount="indefinite"/>
      <g transform="translate(-800 -720)">${inner}</g></g></g>`;
    const stripes = (x, y, w, h) => Array.from({ length: Math.ceil(w / 60) }, (_, i) =>
      `<rect x="${x + i * 60}" y="${y}" width="30" height="${h}" fill="#ffd447" opacity=".9"/>`).join("");
    const turret = (x) => `<rect x="${x - 50}" y="260" width="100" height="460" rx="40" fill="#ff5c8a"/><circle cx="${x}" cy="250" r="50" fill="#56b4ff"/><circle cx="${x}" cy="196" r="20" fill="#ffd447"/>`;
    const back = `<rect x="360" y="400" width="880" height="320" rx="40" fill="#ff8fbf"/>${stripes(380, 400, 840, 40)}
      ${Array.from({ length: 8 }, (_, i) => `<rect x="${390 + i * 110}" y="350" width="70" height="70" rx="30" fill="#ff8fbf"/>`).join("")}`;
    const front = `<rect x="330" y="540" width="940" height="180" rx="40" fill="#ff5c8a"/>${stripes(350, 560, 900, 140)}
      <path d="M720 720 V640 Q800 560 880 640 V720 Z" fill="#3b2a6b"/>${turret(330)}${turret(1270)}`;
    const jumpers = ["mia", "frida", "eliise"]
      .map((id, i) => princess(id, { x: 560 + i * 240, y: 600, s: 0.85, l: "up", r: "up", mouth: "open", anim: hop(140, 1.1, i * 0.37) }))
      .join("");
    const slide = "M1300 330 C1380 360 1420 640 1560 700";
    const rider = `<g><animateMotion path="M1300 306 C1380 336 1420 616 1560 676" dur="3s" repeatCount="indefinite" rotate="auto" keyPoints="0;0;1;1" keyTimes="0;0.3;0.85;1" calcMode="linear"/>
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.05;0.9;1" dur="3s" repeatCount="indefinite"/>
      ${princess("kertu", { s: 0.55, sit: true, l: "up", r: "up", mouth: "open" })}</g>`;
    return wrap(
      `${outdoor("skyj")}${cloud(300, 130, 0.8)}${cloud(1200, 100, 0.7, 50)}${sun(150, 110, 45)}${grass(700)}
      ${breathe(back)}${jumpers}${breathe(front)}
      <path d="${slide}" stroke="#56b4ff" stroke-width="54" fill="none" stroke-linecap="round"/><path d="${slide}" stroke="#ffd447" stroke-width="22" fill="none" stroke-linecap="round"/>
      ${rider}
      <g><animateTransform attributeName="transform" type="translate" values="0 40;0 40;0 0;0 0;0 40" keyTimes="0;0.2;0.4;0.8;1" dur="4s" repeatCount="indefinite"/>
        <clipPath id="tun"><path d="M720 720 V640 Q800 560 880 640 V720 Z"/></clipPath>
        <g clip-path="url(#tun)">${princess("lenna", { x: 800, y: 850, s: 0.75, headOnly: true, mouth: "open" })}</g></g>`,
      sky("skyj", "#8fd3ff", "#e8f8ff"),
    );
  },

  plums() {
    const plumAt = [[560, 200], [640, 300], [700, 140], [780, 230], [860, 120], [930, 260], [1010, 180], [1080, 300], [620, 380], [990, 380], [760, 340], [880, 330], [1150, 220], [500, 300]];
    const plum = (x, y, i) => `<g transform="translate(${x} ${y})"><g><animateTransform attributeName="transform" type="rotate" values="-8 0 -16;8 0 -16;-8 0 -16" dur="${2 + (i % 3) * 0.5}s" repeatCount="indefinite"/>
      <path d="M0 -16 V-26" stroke="#5d4037" stroke-width="3"/><ellipse cx="0" cy="0" rx="15" ry="17" fill="#6a2c91"/><ellipse cx="-5" cy="-6" rx="4" ry="6" fill="#b48ad6" opacity=".7"/></g></g>`;
    const basket = `<g transform="translate(0 10)"><path d="M-46 -10 H46 L36 34 H-36 Z" fill="#c68b5c"/><path d="M-40 -10 Q0 -60 40 -10" stroke="#a1653f" stroke-width="6" fill="none"/>
      <circle cx="-16" cy="-12" r="12" fill="#6a2c91"/><circle cx="10" cy="-14" r="12" fill="#7b3aa6"/><circle cx="28" cy="-10" r="10" fill="#6a2c91"/></g>`;
    const plumInHand = `<ellipse cx="0" cy="-6" rx="12" ry="13" fill="#6a2c91"/><ellipse cx="-4" cy="-10" rx="3" ry="5" fill="#b48ad6"/>`;
    return wrap(
      `${outdoor("skyp")}${sun(1460, 110, 50)}${cloud(250, 110, 0.7)}${grass(680)}
      <path d="M770 720 C780 600 760 450 790 330 L840 330 C860 450 830 600 850 720 Z" fill="#8d5d3b"/>
      <path d="M800 470 C740 440 680 430 600 432" stroke="#8d5d3b" stroke-width="26" stroke-linecap="round" fill="none"/>
      <path d="M820 420 C890 400 960 400 1040 410" stroke="#8d5d3b" stroke-width="26" stroke-linecap="round" fill="none"/>
      <ellipse cx="800" cy="240" rx="380" ry="180" fill="#5fb54f"/><ellipse cx="560" cy="300" rx="170" ry="120" fill="#58a948"/><ellipse cx="1050" cy="290" rx="180" ry="120" fill="#58a948"/><ellipse cx="800" cy="140" rx="220" ry="110" fill="#6cc25b"/>
      ${plumAt.map(([x, y], i) => plum(x, y, i)).join("")}
      <path d="M800 470 C740 440 680 430 600 432" stroke="#8d5d3b" stroke-width="26" stroke-linecap="round" fill="none"/>
      <path d="M820 420 C890 400 960 400 1040 410" stroke="#8d5d3b" stroke-width="26" stroke-linecap="round" fill="none"/>
      ${princess("mia", { x: 640, y: 432, s: 0.62, sit: true, flip: true, l: "stand", r: "reach" })}
      ${princess("frida", { x: 960, y: 408, s: 0.66, sit: true, r: "mouth", rItem: plumInHand, rAlt: { pose: "hold", dur: 2 } })}
      ${princess("lenna", { x: 520, y: 740, s: 0.85, l: "hold", r: "hold", rItem: basket })}
      ${princess("eliise", { x: 1120, y: 740, s: 0.85, flip: true, l: "up", r: "up", anim: hop(14, 1.2) })}
      ${princess("kertu", { x: 1350, y: 750, s: 0.85, flip: true, r: "mouth", rItem: plumInHand, rAlt: { pose: "low", dur: 2.2, begin: 0.5 } })}
      <g><animateTransform attributeName="transform" type="translate" values="0 0;0 0;-80 320;-80 320" keyTimes="0;0.3;0.7;1" dur="2.6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;1;1;0" keyTimes="0;0.3;0.7;0.75" dur="2.6s" repeatCount="indefinite"/>${plum(600, 300, 1)}</g>`,
      sky("skyp", "#9fdcff", "#f0fbff"),
    );
  },

  goodbye() {
    const homes = [[260, "#8fd3ff"], [600, "#8ee08e"], [1000, "#cfaeff"], [1340, "#ffe14d"]];
    const house = (x, roof) => `<g transform="translate(${x} 470)"><rect x="-60" y="-90" width="120" height="90" fill="#fff4e6"/><path d="M-80 -90 L0 -160 L80 -90 Z" fill="${roof}"/>
      <rect x="-15" y="-50" width="30" height="50" rx="15" fill="#a1653f"/><rect x="25" y="-75" width="24" height="24" fill="#7ec8ff"/></g>`;
    const walkers = ["mia", "lenna", "eliise", "kertu"].map((id, i) => {
      const [hx] = homes[i];
      const sx = 560 + i * 160;
      return `<g transform="translate(${sx} 700)"><g>
        <animateTransform attributeName="transform" type="translate" values="0 0;${hx - sx} -220" dur="9s" fill="freeze" calcMode="spline" keySplines=".3 0 .7 1"/>
        <g><animateTransform attributeName="transform" type="scale" values="1;0.35" dur="9s" fill="freeze" calcMode="spline" keySplines=".3 0 .7 1"/>
        ${princess(id, { s: 0.75, flip: hx < sx, r: "wave", rAlt: { pose: "wave2", dur: 0.8, begin: i * 0.2 }, anim: hop(8, 0.6, i * 0.15) })}</g></g></g>`;
    }).join("");
    return wrap(
      `${outdoor("skyg")}${sun(800, 110, 50)}${cloud(300, 150, 0.7)}${cloud(1250, 130, 0.6, 50)}
      <path d="M0 520 Q400 430 800 500 T1600 480 L1600 900 L0 900 Z" fill="#a5dc94"/>
      ${homes.map(([x, c]) => house(x, c)).join("")}
      <path d="M760 900 C780 700 700 600 260 480 M800 900 C800 650 640 560 600 480 M840 900 C820 650 960 560 1000 480 M880 900 C880 700 1000 600 1340 480" stroke="#f3d9a4" stroke-width="40" fill="none" stroke-linecap="round" opacity=".9"/>
      ${walkers}
      ${princess("frida", { x: 800, y: 800, s: 1, r: "wave", rAlt: { pose: "wave2", dur: 0.8 } })}`,
      sky("skyg", "#ffd9a8", "#fff3d6"),
    );
  },

  lunch(night = false) {
    const steam = [0, 1, 2].map((i) => `<path d="M${760 + i * 40} 540 q-15 -25 0 -50 q15 -25 0 -50" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8">
      <animateTransform attributeName="transform" type="translate" values="0 0;0 -40" dur="2s" begin="${i * 0.6}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;.9;0" dur="2s" begin="${i * 0.6}s" repeatCount="indefinite"/></path>`).join("");
    const spoon = `<g transform="rotate(30)"><rect x="-4" y="-4" width="40" height="8" rx="4" fill="#cfd8dc"/><ellipse cx="-8" cy="0" rx="12" ry="9" fill="#cfd8dc"/></g>`;
    return wrap(
      `${room(night ? "#f6e3b4" : "#fff4c9", "#d6a77a")}${windowFrame(1120, 120, 300, 260, night ? nightSky(300, 260) : `<rect width="300" height="260" fill="#bfe7ff"/>${sun(220, 80, 40)}`)}
      ${curtains(1120, 120, 300, 260, "#ffd447")}
      <rect x="160" y="200" width="200" height="150" rx="10" fill="#fff" stroke="#e8b98f" stroke-width="12"/>${castle(260, 330, 0.25)}
      ${princess("frida", { x: 800, y: 720, s: 1.05, l: "hold", r: "mouth", rItem: spoon, rAlt: { pose: "hold", dur: 2 } })}
      <rect x="380" y="560" width="840" height="40" rx="12" fill="#fff"/>
      <path d="M380 600 ${Array.from({ length: 14 }, (_, i) => `q30 40 60 0`).join(" ")} V600 Z" fill="#ff9fc8"/>
      <rect x="380" y="590" width="840" height="20" fill="#ff9fc8"/><rect x="420" y="640" width="30" height="80" fill="#b9875c"/><rect x="1150" y="640" width="30" height="80" fill="#b9875c"/>
      <ellipse cx="800" cy="560" rx="110" ry="18" fill="#fff" stroke="#e0e0e0" stroke-width="3"/>
      <path d="M720 545 Q800 610 880 545 Z" fill="#7ec8ff"/><ellipse cx="800" cy="545" rx="80" ry="14" fill="${night ? "#fff1b8" : "#ffb74d"}"/>
      <circle cx="775" cy="543" r="6" fill="#ff7043"/><circle cx="815" cy="547" r="6" fill="#66bb6a"/>${steam}
      <rect x="980" y="490" width="48" height="70" rx="8" fill="#ffecb3" stroke="#fff" stroke-width="4"/><rect x="984" y="510" width="40" height="46" rx="6" fill="${night ? "#ffffff" : "#ffa726"}"/>
      <ellipse cx="610" cy="550" rx="60" ry="16" fill="#e0a96d"/><ellipse cx="610" cy="542" rx="50" ry="12" fill="#f0c38e"/>`,
    );
  },

  pajamas(night = false) {
    const book = `<rect x="-26" y="-34" width="52" height="40" rx="5" fill="#ff7eb6"/><rect x="-20" y="-28" width="40" height="5" rx="2" fill="#fff"/>${sparkle(30, -40, 0.5)}`;
    const lamp = `<g transform="translate(1150 570)"><circle cx="0" cy="-70" r="90" fill="#fff3b0" opacity=".35"><animate attributeName="opacity" values=".3;.45;.3" dur="3s" repeatCount="indefinite"/></circle>
      <rect x="-4" y="-50" width="8" height="50" fill="#b9875c"/><path d="M-36 -50 L-22 -100 H22 L36 -50 Z" fill="#ffd447"/></g>`;
    const frida = night
      ? princess("frida", { x: 800, y: 720, s: 1.35, pj: true, crown: false, l: "stand", r: "hold", rItem: book, anim: bob(5, 2) })
      : princess("frida", { x: 800, y: 720, s: 1.35, pj: true, crown: false, l: "out", r: "wave", rAlt: { pose: "up", dur: 1.6 }, mouth: "open", anim: bob(6, 1.6) });
    return wrap(
      `${room(night ? "#ead7f3" : "#ffe7f1")}${windowFrame(1100, 150, 280, 260, night ? nightSky(280, 260) : `<rect width="280" height="260" fill="#bfe7ff"/>${cloud(120, 120, 0.5)}`)}
      ${curtains(1100, 150, 280, 260, "#ff9fc8")}${wardrobe(170, 700, true, true)}
      ${frida}
      ${night ? lamp : ""}${nightstand(1200, 700)}${teddy(1360, 700, 0.9)}`,
    );
  },

  nap(night = false) {
    const b = bed(420, 760, "#c9a7ff");
    const zzz = [0, 1, 2].map((i) => `<text x="0" y="0" font-family="Baloo 2, Comic Sans MS, sans-serif" font-weight="800" font-size="${44 + i * 10}" fill="#fff" opacity="0">Z
      <animateMotion path="M560 420 q60 -80 20 -170 q-40 -80 40 -160" dur="4.5s" begin="${i * 1.5}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;1;0" dur="4.5s" begin="${i * 1.5}s" repeatCount="indefinite"/></text>`).join("");
    const bubble = (id, x, y, blanket, i) => `<g transform="translate(${x} ${y})">
      <circle r="92" fill="#3f3a7a" stroke="#fff" stroke-width="6"/><clipPath id="bub${i}"><circle r="88"/></clipPath>
      <g clip-path="url(#bub${i})"><ellipse cx="0" cy="22" rx="80" ry="30" fill="#fff"/>
        ${princess(id, { x: 0, y: 150, s: 0.6, headOnly: true, eyes: "closed", crown: false })}
        <path d="M-120 62 Q0 32 120 62 V120 H-120 Z" fill="${blanket}"/></g>
      ${sparkle(70, -70, 0.5, i * 0.4)}</g>`;
    const dragonBubble = `<g transform="translate(430 150)"><circle r="92" fill="#3f3a7a" stroke="#fff" stroke-width="6"/>
      <clipPath id="bubd"><circle r="88"/></clipPath><g clip-path="url(#bubd)"><ellipse cx="0" cy="60" rx="120" ry="40" fill="#8bd17c"/>
      <g transform="translate(20 20) scale(0.62)">${dragonHead(DRAGON, "closed")}</g></g>${sparkle(70, -70, 0.5, 1.8)}</g>`;
    return wrap(
      `${room(night ? "#4b4385" : "#6c5fa6", "#8a6f8f")}${windowFrame(1180, 140, 280, 260, night ? nightSky(280, 260) : `<rect width="280" height="260" fill="#ffe7a8"/>`)}${curtains(1180, 140, 280, 260, "#c06aa0", !night)}
      ${b.back}
      ${princess("frida", { x: 430, y: 820, s: 1.05, headOnly: true, eyes: "closed", crown: false, anim: bob(3, 3) })}
      ${b.front}${teddy(770, 640, 0.8)}${nightstand(1130, 760)}
      ${bubble("kertu", 160, 230, "#ffe14d", 3)}${bubble("mia", 840, 190, "#8fd3ff", 0)}${bubble("lenna", 1010, 420, "#8ee08e", 1)}${bubble("eliise", 1330, 560, "#cfaeff", 2)}${night ? dragonBubble : ""}
      ${zzz}`,
    );
  },

  ready() {
    const xs = [330, 565, 800, 1035, 1270];
    return wrap(
      `${outdoor("skyr")}${sun(1450, 120, 50)}${cloud(300, 130, 0.8)}${cloud(1000, 170, 0.6, 50)}
      ${castle(800, 640, 0.6)}${grass(650)}${bush(80, 700)}${bush(1530, 700)}
      ${flower(450, 790, "#ff7eb6")}${flower(1150, 800, "#b56cff")}
      ${FRIENDS_ROW.map((id, i) => princess(id, {
        x: xs[i], y: 740, s: id === "frida" ? 0.95 : 0.82, flip: i > 2,
        l: i % 2 ? "up" : "stand", r: "reach", rItem: wand(i * 0.3), anim: hop(10, 1.4, i * 0.25), blink: i,
      })).join("")}`,
      sky("skyr", "#ffc6e3", "#fff3c4"),
    );
  },

  wands() {
    const DTF = "translate(400 120) scale(0.75)";
    const xs = [90, 200, 310, 420, 530];
    const beams = xs.map((x, i) => {
      const tx = x + 37, ty = 457;
      return `<path d="M${tx} ${ty} Q${(tx + 722) / 2} ${ty - 200} 722 337" stroke="#fff6b0" stroke-width="7" stroke-linecap="round" fill="none" stroke-dasharray="4 18">
        <animate attributeName="stroke-dashoffset" values="0;-44" dur=".6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values=".4;1;.4" dur="1.2s" begin="${i * 0.2}s" repeatCount="indefinite"/></path>`;
    }).join("");
    return wrap(
      `${outdoor("skyw")}${cloud(250, 120, 0.7)}${cloud(1250, 90, 0.6, 50)}${grass(660)}
      <g transform="${DTF}">${dragon({ stone: true, eyes: "closed" })}</g>
      ${xs.map((x, i) => princess(FRIENDS_ROW[i], { x, y: 730, s: 0.75, flip: false, l: "up", r: "reach", rItem: wand(i * 0.2), mouth: "open", blink: i })).join("")}
      ${beams}
      ${[[700, 300], [900, 380], [1100, 420], [1300, 460], [800, 520]].map(([x, y], i) => sparkle(x, y, 1.1, i * 0.3)).join("")}`,
      sky("skyw", "#c9b8ff", "#fde6ff"),
    );
  },

  dragonwake() {
    const DTF = "translate(400 120) scale(0.75)";
    const xs = [90, 200, 310, 420, 530];
    const burst = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return `<g transform="translate(${1000 + Math.cos(a) * 380} ${430 + Math.sin(a) * 220})">${sparkle(0, 0, 1, (i % 4) * 0.3)}</g>`;
    }).join("");
    return wrap(
      `${outdoor("skyk")}${sun(1450, 110, 50)}${cloud(250, 120, 0.7)}${grass(660)}
      <g transform="${DTF}">${dragon({ flap: true, head: "nod" })}
        <g>${dragon({ stone: true, eyes: "closed" })}<animate attributeName="opacity" values="1;1;0" keyTimes="0;0.3;1" dur="2.5s" fill="freeze"/></g></g>
      ${burst}
      ${xs.map((x, i) => princess(FRIENDS_ROW[i], { x, y: 730, s: 0.75, l: "up", r: "up", rItem: wand(i * 0.2), mouth: "open", anim: hop(16, 1, i * 0.2) })).join("")}`,
      sky("skyk", "#8fd3ff", "#e8f8ff"),
    );
  },

  dragonslide(afternoon = false) {
    const riders = FRIENDS_ROW.map((id, k) => {
      const t = `dur="7.5s" begin="${-k * 1.5}s" repeatCount="indefinite"`;
      return `<g><animateMotion path="${DRAGON_RIDE}" ${t} keyPoints="0;${HEAD_TOP};${HEAD_TOP};1;1" keyTimes="0;0.12;0.16;0.85;1" calcMode="linear"/>
        <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.04;0.85;0.92;1" ${t}/>
        ${princess(id, { s: 0.5, sit: true, l: "up", r: "up", mouth: "open" })}</g>`;
    }).join("");
    const id = afternoon ? "skya" : "skyd";
    return wrap(
      `${outdoor(id)}${afternoon ? sun(1380, 200, 60) : sun(1420, 110, 50)}${cloud(900, 110, 0.7)}${grass(670)}
      ${dragon({ head: "pick", flap: true })}${riders}
      ${flower(120, 800, "#ff7eb6")}${flower(260, 790, "#ffd447", 0.8)}`,
      afternoon ? sky(id, "#ffc48a", "#fff0c9") : sky(id, "#8fd3ff", "#e8f8ff"),
    );
  },

  afternoon() {
    return this.dragonslide(true);
  },

  dragonsleep() {
    const DTF = "translate(400 120) scale(0.75)";
    const zzz = [0, 1, 2].map((i) => `<text font-family="Baloo 2, Comic Sans MS, sans-serif" font-weight="800" font-size="${46 + i * 12}" fill="#fff" opacity="0">Z
      <animateMotion path="M600 420 q50 -70 10 -150 q-40 -70 30 -150" dur="4.5s" begin="${i * 1.5}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;1;0" dur="4.5s" begin="${i * 1.5}s" repeatCount="indefinite"/></text>`).join("");
    return wrap(
      `${outdoor("skyz")}<circle cx="1420" cy="560" r="90" fill="#ffb36b"/><path d="M0 640 Q500 600 900 640 T1600 630 L1600 900 L0 900 Z" fill="#9bc98a"/>
      <g transform="${DTF}"><g>${bob(4, 3.5)}${dragon({ head: "down", eyes: "closed" })}</g></g>${zzz}
      ${[140, 290, 440].map((x, i) => princess(FRIENDS_ROW[[0, 2, 4][i]], { x, y: 740, s: 0.72, r: "wave", rAlt: { pose: "wave2", dur: 1.2, begin: i * 0.3 } })).join("")}
      ${princess("lenna", { x: 210, y: 790, s: 0.72, r: "wave", rAlt: { pose: "wave2", dur: 1.2, begin: 0.5 } })}
      ${princess("eliise", { x: 370, y: 790, s: 0.72, r: "wave", rAlt: { pose: "wave2", dur: 1.2, begin: 0.8 } })}`,
      sky("skyz", "#ff9fb3", "#ffd9a8"),
    );
  },

  dinner() {
    return this.lunch(true);
  },

  bedtime() {
    return this.pajamas(true);
  },

  night() {
    return this.nap(true);
  },

  end() {
    const stars = Array.from({ length: 40 }, (_, i) => {
      const x = (i * 397) % 1600, y = (i * 211) % 520;
      return `<circle cx="${x}" cy="${y}" r="${2 + (i % 3)}" fill="#fff"><animate attributeName="opacity" values="1;.2;1" dur="${2 + (i % 4)}s" begin="${(i % 5) * 0.4}s" repeatCount="indefinite"/></circle>`;
    }).join("");
    return wrap(
      `${outdoor("skye")}${stars}<circle cx="150" cy="190" r="80" fill="#fff6c9"/><circle cx="190" cy="165" r="80" fill="url(#skye)"/>
      <g opacity=".9">${castle(800, 700, 0.9, "#3b3570", "#2a2560")}</g>
      <path d="M0 700 Q400 660 800 700 T1600 690 L1600 900 L0 900 Z" fill="#2a2560"/>
      ${sparkle(560, 300, 1.2)}${sparkle(1050, 260, 1, 0.6)}${sparkle(800, 160, 1.3, 1.1)}`,
      sky("skye", "#1d1b4b", "#5b4b9a"),
    );
  },
};

globalThis.SCENES = SCENES;
// Drawing kit for other books (dino-scenes.js)
globalThis.SCENE_KIT = {
  wrap, sky, outdoor, room, sun, cloud, flower, bush, grass, sparkle, bob, hop, windowFrame,
  curtains, teddy, nightSky, dragon, DRAGON_RIDE, HEAD_TOP, NECK_PIVOT,
};
})();
