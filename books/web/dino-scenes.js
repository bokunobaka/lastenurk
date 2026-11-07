// Dinosaur book drawings (1600x900 SVG, SMIL-animated). Reuses the drawing kit from scenes.js.
(() => {
  const K = globalThis.SCENE_KIT;
  const { wrap, sky, outdoor, sun, cloud, flower, grass, sparkle, bob, hop, nightSky, dragon } = K;

  // Character bible — keep in sync with art/dino-characters.md
  const C = {
    rex: { body: "#7ccf6a", dark: "#4f9e45", belly: "#fff1b8", spot: "#5fb552" },
    tipi: { body: "#7cc4f0", dark: "#3f8fc4", belly: "#d8efff", frill: "#ff9fc8", horn: "#fff6e0", spot: "#5aa9dd" },
    stella: { body: "#b99af0", dark: "#7d5cc4", belly: "#ece2ff", plate: "#ff8fbf", plate2: "#ffb3d1", spot: "#a283e0" },
    anki: { body: "#ffb15c", dark: "#d9822b", belly: "#ffe3bf", armor: "#e08f3a", stud: "#ffd29a", club: "#c06a1c" },
    pteri: { body: "#ff9fc8", dark: "#d9608f", belly: "#ffe0ee", wing: "#ffc6df", crest: "#ff7aa8", beak: "#ffd36b" },
    bruuno: { body: "#ffd36b", belly: "#fff3c9", spikes: "#ffd36b", wing: "#ffd36b", dark: "#c98a1f", spot: "#f2a93b" },
  };

  // ---------- shared face parts ----------
  function eye(x, y, r, c, o) {
    if (o.eyes === "closed")
      return `<path d="M${x - r} ${y} Q${x} ${y + r * 0.8} ${x + r} ${y}" stroke="${c.dark}" stroke-width="${Math.max(3, r / 3.5)}" fill="none" stroke-linecap="round"/>`;
    return `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.15}" fill="#fff"/><circle cx="${x + r * 0.25}" cy="${y + r * 0.1}" r="${r * 0.62}" fill="#2b1d3a"/>
      <circle cx="${x + r * 0.05}" cy="${y - r * 0.25}" r="${r * 0.25}" fill="#fff"/>
      <ellipse cx="${x}" cy="${y}" rx="${r + 1}" ry="0" fill="${c.body}"><animate attributeName="ry" values="0;0;${r * 1.2};0" keyTimes="0;0.92;0.96;1" dur="${4 + (o.blink || 0) * 0.7}s" repeatCount="indefinite"/></ellipse>`;
  }
  const cheek = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ff8fa8" opacity=".5"/>`;

  function place(o, inner) {
    const { x = 0, y = 0, s = 1, flip = false } = o;
    return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})"><g>${o.anim || ""}${inner}</g></g>`;
  }

  // ---------- characters (facing right, feet at 0,0) ----------
  const REX_ARMS = { down: "M35 -150 L60 -142 L70 -128", up: "M35 -150 L52 -172 L60 -194", front: "M35 -150 L62 -152 L82 -150" };
  const REX_HANDS = { down: [70, -128], up: [60, -194], front: [82, -150] };

  function rex(o = {}) {
    const c = C.rex;
    const arm = o.arm || "down";
    let armAnim = "", itemAnim = "";
    if (o.armAlt) {
      const t = `dur="${o.armAlt.dur}s" begin="${o.armAlt.begin || 0}s" repeatCount="indefinite"`;
      armAnim = `<animate attributeName="d" values="${REX_ARMS[arm]};${REX_ARMS[o.armAlt.pose]};${REX_ARMS[arm]}" ${t}/>`;
      const [ax, ay] = REX_HANDS[arm], [bx, by] = REX_HANDS[o.armAlt.pose];
      itemAnim = `<animateTransform attributeName="transform" type="translate" values="${ax} ${ay};${bx} ${by};${ax} ${ay}" ${t}/>`;
    }
    const [hx, hy] = REX_HANDS[arm];
    const closedMouth = `<path d="M72 -190 Q106 -170 140 -194" stroke="${c.dark}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M84 -184 l5 9 l5 -8 Z M100 -180 l5 9 l5 -8 Z M116 -182 l5 8 l4 -9 Z" fill="#fff"/>`;
    const openMouth = `<path d="M68 -194 Q106 -140 142 -198 Q106 -180 68 -194 Z" fill="#c2185b"/>
      <path d="M76 -192 l5 10 l5 -9 l5 10 l5 -9 l5 10 l5 -9 l5 10 l5 -9 l5 10 l5 -9 l5 10 l4 -10 Z" fill="#fff"/>
      <ellipse cx="106" cy="-166" rx="14" ry="6" fill="#ff7aa0"/>`;
    const grin = `<path d="M66 -196 Q106 -128 146 -200 Q106 -184 66 -196 Z" fill="#c2185b"/>
      <path d="M72 -194 l5 10 l5 -9 l5 10 l5 -9 l5 10 l5 -9 l5 10 l5 -9 l5 10 l5 -9 l5 10 l5 -9 l5 10 l4 -10 Z" fill="#fff"/>
      <path d="M86 -152 l5 -10 l5 9 l5 -10 l5 9 l5 -10 l5 9 l5 -10 l5 9 l5 -10 l4 10 Q106 -146 86 -152 Z" fill="#fff"/>`;
    const mouths = { smile: closedMouth, open: openMouth, grin };
    let mouth = mouths[o.mouth || "smile"];
    if (o.chew) {
      mouth = `<g>${closedMouth}<animate attributeName="opacity" values="1;0;1" dur="${o.chew}s" repeatCount="indefinite" calcMode="discrete"/></g>
        <g opacity="0">${openMouth}<animate attributeName="opacity" values="0;1;0" dur="${o.chew}s" repeatCount="indefinite" calcMode="discrete"/></g>`;
    }
    return place(o, `
      <path d="M-30 -150 C-110 -140 -160 -90 -195 -36 C-140 -66 -90 -80 -20 -92 Z" fill="${c.body}"/>
      <ellipse cx="-30" cy="-60" rx="30" ry="48" fill="${c.dark}"/><ellipse cx="-26" cy="-9" rx="34" ry="11" fill="${c.dark}"/>
      <ellipse cx="0" cy="-125" rx="62" ry="78" fill="${c.body}"/>
      <ellipse cx="22" cy="-112" rx="36" ry="58" fill="${c.belly}"/>
      <path d="M-2 -140 Q22 -132 54 -140 M-6 -112 Q22 -104 56 -112 M0 -84 Q22 -76 50 -84" stroke="#f1d98a" stroke-width="3" fill="none"/>
      <circle cx="-34" cy="-150" r="9" fill="${c.spot}"/><circle cx="-44" cy="-120" r="6" fill="${c.spot}"/><circle cx="-22" cy="-178" r="6" fill="${c.spot}"/>
      <ellipse cx="18" cy="-55" rx="30" ry="48" fill="${c.body}"/><ellipse cx="28" cy="-9" rx="36" ry="11" fill="${c.body}"/>
      <circle cx="58" cy="-8" r="4" fill="#fff"/><circle cx="48" cy="-4" r="4" fill="#fff"/>
      ${[-38, -8, 22].map((x, k) => `<path d="M${x - 10} ${-262 + k * 4} L${x} ${-286 + k * 4} L${x + 10} ${-262 + k * 4} Z" fill="${c.dark}"/>`).join("")}
      <ellipse cx="45" cy="-222" rx="68" ry="55" fill="${c.body}"/><ellipse cx="95" cy="-205" rx="50" ry="37" fill="${c.body}"/>
      ${eye(48, -240, 17, c, o)}<circle cx="130" cy="-220" r="4" fill="${c.dark}"/>${cheek(74, -202, 11)}${mouth}
      <g><path d="${REX_ARMS[arm]}" stroke="${c.body}" stroke-width="11" fill="none" stroke-linecap="round" stroke-linejoin="round">${armAnim}</path>
        ${o.item ? `<g transform="translate(${hx} ${hy})">${itemAnim}${o.item}</g>` : ""}</g>`);
  }

  function tipi(o = {}) {
    const c = C.tipi;
    const dots = Array.from({ length: 9 }, (_, k) => {
      const a = (-150 + k * 22) * (Math.PI / 180);
      return `<circle cx="${95 + Math.cos(a) * 64}" cy="${-125 + Math.sin(a) * 64}" r="6" fill="${c.horn}"/>`;
    }).join("");
    return place(o, `
      <path d="M-95 -90 C-150 -86 -190 -60 -212 -28 C-170 -46 -130 -56 -90 -60 Z" fill="${c.body}"/>
      <rect x="-80" y="-74" width="34" height="74" rx="14" fill="${c.dark}"/><rect x="50" y="-70" width="34" height="70" rx="14" fill="${c.dark}"/>
      <ellipse cx="-5" cy="-98" rx="105" ry="62" fill="${c.body}"/><ellipse cx="0" cy="-64" rx="80" ry="24" fill="${c.belly}"/>
      <circle cx="-50" cy="-120" r="10" fill="${c.spot}"/><circle cx="-20" cy="-138" r="8" fill="${c.spot}"/><circle cx="-70" cy="-92" r="7" fill="${c.spot}"/>
      <rect x="-52" y="-74" width="36" height="74" rx="14" fill="${c.body}"/><rect x="74" y="-70" width="36" height="70" rx="14" fill="${c.body}"/>
      <circle cx="-26" cy="-6" r="4" fill="#fff"/><circle cx="100" cy="-6" r="4" fill="#fff"/>
      <circle cx="95" cy="-125" r="72" fill="${c.frill}"/><circle cx="95" cy="-125" r="54" fill="#ffb8d6"/>${dots}
      <path d="M120 -140 Q132 -192 160 -210 Q150 -172 142 -136 Z" fill="${c.horn}"/>
      <path d="M146 -134 Q166 -180 194 -192 Q178 -160 164 -128 Z" fill="${c.horn}"/>
      <ellipse cx="138" cy="-100" rx="56" ry="46" fill="${c.body}"/>
      <path d="M176 -116 Q210 -98 182 -72 Z" fill="${c.dark}"/>
      <path d="M176 -120 Q186 -140 184 -152 Q194 -136 190 -116 Z" fill="${c.horn}"/>
      ${eye(140, -112, 13, c, o)}${cheek(160, -88, 9)}
      ${o.mouth === "open" ? `<ellipse cx="166" cy="-78" rx="12" ry="9" fill="#c2185b"/>` : `<path d="M148 -80 Q166 -68 182 -80" stroke="${c.dark}" stroke-width="4" fill="none" stroke-linecap="round"/>`}`);
  }

  function stella(o = {}) {
    const c = C.stella;
    const plates = Array.from({ length: 6 }, (_, k) => {
      const x = -86 + k * 32;
      const yt = -110 - 68 * Math.sqrt(Math.max(0, 1 - ((x + 10) / 105) ** 2));
      const h = 30 + Math.sin((k / 5) * Math.PI) * 26;
      return `<path d="M${x - 18} ${yt + 14} L${x - 15} ${yt - h * 0.45} L${x} ${yt - h} L${x + 15} ${yt - h * 0.45} L${x + 18} ${yt + 14} Z" fill="${k % 2 ? c.plate2 : c.plate}"/>`;
    }).join("");
    return place(o, `
      <path d="M-90 -95 C-150 -92 -200 -74 -232 -52 C-190 -62 -140 -62 -90 -62 Z" fill="${c.body}"/>
      <path d="M-214 -58 L-238 -96 L-204 -64 Z M-196 -62 L-208 -102 L-186 -66 Z M-214 -54 L-240 -24 L-204 -50 Z" fill="${c.plate}"/>
      <rect x="-74" y="-84" width="38" height="84" rx="15" fill="${c.dark}"/><rect x="56" y="-64" width="32" height="64" rx="13" fill="${c.dark}"/>
      ${plates}
      <ellipse cx="-10" cy="-110" rx="105" ry="68" fill="${c.body}"/><ellipse cx="-4" cy="-72" rx="78" ry="24" fill="${c.belly}"/>
      <circle cx="-40" cy="-130" r="9" fill="${c.spot}"/><circle cx="10" cy="-140" r="7" fill="${c.spot}"/><circle cx="-60" cy="-100" r="7" fill="${c.spot}"/>
      <rect x="-48" y="-84" width="38" height="84" rx="15" fill="${c.body}"/><rect x="78" y="-64" width="32" height="64" rx="13" fill="${c.body}"/>
      <circle cx="-22" cy="-6" r="4" fill="#fff"/><circle cx="102" cy="-6" r="4" fill="#fff"/>
      <path d="M70 -110 Q112 -100 136 -78" stroke="${c.body}" stroke-width="44" fill="none" stroke-linecap="round"/>
      <ellipse cx="146" cy="-74" rx="42" ry="32" fill="${c.body}"/>
      ${eye(150, -84, 11, c, o)}${cheek(166, -64, 8)}
      ${o.mouth === "open" ? `<ellipse cx="174" cy="-60" rx="10" ry="8" fill="#c2185b"/>` : `<path d="M156 -62 Q172 -52 186 -64" stroke="${c.dark}" stroke-width="4" fill="none" stroke-linecap="round"/>`}`);
  }

  function anki(o = {}) {
    const c = C.anki;
    const tail = `<g>${o.swing ? `<animateTransform attributeName="transform" type="rotate" values="0 -90 -50;-28 -90 -50;10 -90 -50;0 -90 -50" keyTimes="0;0.4;0.55;1" dur="${o.swing}s" repeatCount="indefinite"/>` : ""}
      <path d="M-90 -62 Q-150 -62 -192 -52 L-192 -38 Q-150 -40 -90 -36 Z" fill="${c.body}"/>
      <ellipse cx="-206" cy="-45" rx="28" ry="22" fill="${c.club}"/><circle cx="-214" cy="-52" r="6" fill="${c.stud}"/><circle cx="-198" cy="-38" r="5" fill="${c.stud}"/></g>`;
    const studs = [[-70, -86], [-36, -98], [0, -102], [36, -98], [70, -86], [-50, -70], [-14, -76], [22, -76], [56, -70]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${c.stud}"/>`).join("");
    const sideSpikes = [-90, -54, -18, 18, 54, 86].map((x) => `<path d="M${x - 10} -56 L${x} -38 L${x + 10} -56 Z" fill="${c.stud}"/>`).join("");
    return place(o, `${tail}
      <rect x="-76" y="-50" width="36" height="50" rx="14" fill="${c.dark}"/><rect x="52" y="-50" width="36" height="50" rx="14" fill="${c.dark}"/>
      <ellipse cx="-5" cy="-62" rx="115" ry="52" fill="${c.body}"/>
      <path d="M-118 -60 A113 58 0 0 1 108 -60 Z" fill="${c.armor}"/>${studs}${sideSpikes}
      <ellipse cx="-4" cy="-36" rx="86" ry="16" fill="${c.belly}"/>
      <rect x="-50" y="-50" width="36" height="50" rx="14" fill="${c.body}"/><rect x="76" y="-50" width="36" height="50" rx="14" fill="${c.body}"/>
      <circle cx="-24" cy="-5" r="4" fill="#fff"/><circle cx="102" cy="-5" r="4" fill="#fff"/>
      <ellipse cx="124" cy="-56" rx="44" ry="33" fill="${c.body}"/><path d="M90 -78 Q124 -100 158 -76 Q124 -86 90 -78 Z" fill="${c.armor}"/>
      ${eye(128, -64, 11, c, o)}${cheek(146, -44, 8)}
      ${o.mouth === "open" ? `<ellipse cx="152" cy="-40" rx="10" ry="8" fill="#c2185b"/>` : `<path d="M136 -42 Q152 -32 166 -44" stroke="${c.dark}" stroke-width="4" fill="none" stroke-linecap="round"/>`}`);
  }

  // Pteri: origin = body centre (she flies)
  function pteri(o = {}) {
    const c = C.pteri;
    const flap = (side) => o.still ? "" : `<animateTransform attributeName="transform" type="rotate" values="${side * -22} ${side * 12} -5;${side * 22} ${side * 12} -5;${side * -22} ${side * 12} -5" dur="0.7s" begin="${o.blink || 0}s" repeatCount="indefinite"/>`;
    return place(o, `
      <g>${flap(-1)}<path d="M-12 -5 Q-80 -80 -158 -46 Q-96 -22 -30 26 Z" fill="${c.wing}" stroke="${c.dark}" stroke-width="3" stroke-linejoin="round"/></g>
      <g>${flap(1)}<path d="M12 -5 Q80 -80 158 -46 Q96 -22 30 26 Z" fill="${c.wing}" stroke="${c.dark}" stroke-width="3" stroke-linejoin="round"/></g>
      <ellipse cx="0" cy="12" rx="26" ry="38" fill="${c.body}"/><ellipse cx="4" cy="20" rx="15" ry="24" fill="${c.belly}"/>
      <path d="M-8 48 L-12 62 M8 48 L12 62" stroke="${c.dark}" stroke-width="5" stroke-linecap="round"/>
      <path d="M-8 -60 L-62 -92 L-2 -38 Z" fill="${c.crest}"/>
      <circle cx="6" cy="-46" r="27" fill="${c.body}"/>
      <path d="M26 -54 L84 -40 L26 -32 Z" fill="${c.beak}"/>${o.item ? `<g transform="translate(80 -38)">${o.item}</g>` : ""}
      ${eye(12, -52, 9, c, o)}${cheek(20, -36, 6)}`);
  }

  const CHAR = { rex, tipi, stella, anki, pteri };

  // Bruuno the brachiosaurus = the big "dragon" frame with his own colours and head
  function bruunoHead(col, eyes = "open") {
    const e = eyes === "closed"
      ? `<path d="M-36 -16 Q-15 2 6 -16" stroke="${col.dark}" stroke-width="6" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="-15" cy="-18" rx="20" ry="24" fill="#fff"/><circle cx="-22" cy="-14" r="11" fill="#2b1d3a"/><circle cx="-26" cy="-19" r="4" fill="#fff"/>
         <ellipse cx="-15" cy="-18" rx="22" ry="0" fill="${col.body}"><animate attributeName="ry" values="0;0;26;0" keyTimes="0;0.9;0.95;1" dur="5s" repeatCount="indefinite"/></ellipse>`;
    return `<circle cx="20" cy="-62" r="20" fill="${col.body}"/><circle cx="52" cy="-50" r="16" fill="${col.body}"/>
      <ellipse cx="0" cy="0" rx="92" ry="70" fill="${col.body}"/><ellipse cx="-72" cy="18" rx="62" ry="46" fill="${col.body}"/>
      <circle cx="34" cy="-14" r="11" fill="${col.spot}"/><circle cx="58" cy="14" r="8" fill="${col.spot}"/>
      <circle cx="-118" cy="2" r="6" fill="${col.dark}"/>${e}<circle cx="-42" cy="24" r="14" fill="#ff9fb0" opacity=".5"/>
      <path d="M-130 38 Q-96 58 -58 42" stroke="${col.dark}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  }
  const BRUUNO_SPOTS = [[760, 520, 22], [860, 478, 26], [980, 496, 20], [1080, 540, 24], [700, 580, 18], [950, 560, 16], [1200, 600, 14], [1320, 630, 12]]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.bruuno.spot}"/>`).join("");
  const bruuno = (o = {}) => dragon({ ...o, col: C.bruuno, headFn: bruunoHead, wings: false, spikes: false, spots: BRUUNO_SPOTS });

  // ---------- scenery ----------
  function volcano(x, y, s = 1, night = false) {
    const smoke = [0, 1, 2].map((k) => `<circle cx="0" cy="-330" r="${30 + k * 6}" fill="${night ? "#5b4b8a" : "#e8e0f0"}" opacity="0">
      <animate attributeName="cy" values="-330;-520" dur="6s" begin="${k * 2}s" repeatCount="indefinite"/>
      <animate attributeName="r" values="${26 + k * 4};${60 + k * 8}" dur="6s" begin="${k * 2}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;.9;0" dur="6s" begin="${k * 2}s" repeatCount="indefinite"/></circle>`).join("");
    return `<g transform="translate(${x} ${y}) scale(${s})">${smoke}
      <path d="M-300 0 L-70 -320 L70 -320 L300 0 Z" fill="${night ? "#2e2756" : "#a1887f"}"/>
      <path d="M-70 -320 L70 -320 L50 -290 Q20 -260 0 -300 Q-30 -250 -50 -290 Z" fill="#ff7043"><animate attributeName="fill" values="#ff7043;#ffb74d;#ff7043" dur="2s" repeatCount="indefinite"/></path>
      <path d="M-160 -100 L-90 -230 M120 -60 L60 -200" stroke="${night ? "#3b3270" : "#8d6e63"}" stroke-width="16" stroke-linecap="round"/></g>`;
  }

  function palm(x, y, s = 1) {
    const leaf = (a) => `<path d="M0 0 Q60 -40 130 -10 Q60 -20 0 0 Z" fill="#43a047" transform="rotate(${a})"/>`;
    return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-12 0 Q-30 -150 10 -300 L28 -296 Q-6 -150 14 0 Z" fill="#a1653f"/>
      <g transform="translate(18 -298)"><g><animateTransform attributeName="transform" type="rotate" values="-3;3;-3" dur="4s" repeatCount="indefinite"/>
      ${[-160, -120, -60, -20, 20].map(leaf).join("")}</g></g></g>`;
  }

  function fern(x, y, s = 1, front = false) {
    const fronds = [-60, -35, -12, 12, 35, 60].map((a, k) => `<path d="M0 0 Q${a * 1.5} -140 ${a * 3} -200 Q${a * 1.2} -120 0 0 Z" fill="${k % 2 ? "#4caf50" : "#66bb6a"}"/>`).join("");
    return `<g transform="translate(${x} ${y}) scale(${s})"><g>${front ? "" : ""}<animateTransform attributeName="transform" type="rotate" values="-2;2;-2" dur="3s" repeatCount="indefinite"/>${fronds}</g></g>`;
  }

  function cave(inner, night = false) {
    const blobs = [[200, 160, 90], [520, 90, 70], [380, 420, 110], [820, 260, 90], [140, 560, 80], [700, 520, 70], [980, 120, 60]]
      .map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.7}" fill="${night ? "#7d5f86" : "#cfa57d"}"/>`).join("");
    return `<rect width="1600" height="900" fill="${night ? "#8b6d93" : "#ddb68d"}"/>${blobs}
      <clipPath id="caveOpen"><path d="M1060 700 L1060 300 Q1060 120 1250 120 Q1440 120 1440 300 L1440 700 Z"/></clipPath>
      <g clip-path="url(#caveOpen)">${inner}</g>
      <path d="M1060 700 L1060 300 Q1060 120 1250 120 Q1440 120 1440 300 L1440 700" fill="none" stroke="${night ? "#6a4f73" : "#b88a62"}" stroke-width="26"/>
      <rect y="700" width="1600" height="200" fill="${night ? "#6f5677" : "#b98b63"}"/>
      <path d="M0 0 Q30 80 10 160 M60 0 Q90 60 70 120" stroke="#66bb6a" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  }
  const outside = (night) => night
    ? nightSky(380, 580)
    : `<rect width="1600" height="900" fill="#9fdcff"/><path d="M0 520 Q400 460 1600 520 V900 H0 Z" fill="#8bd17c"/>`;
  const outsideAt = (inner) => `<g transform="translate(1060 120)">${inner}</g>`;

  function nest(x, y, s = 1) {
    return {
      back: `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="-30" rx="180" ry="55" fill="#a1653f"/><ellipse cx="0" cy="-42" rx="150" ry="34" fill="#7cb85c"/></g>`,
      front: `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-182 -32 Q0 60 182 -32 Q170 10 0 22 Q-170 10 -182 -32 Z" fill="#a1653f"/>
        <path d="M-150 -14 Q-60 20 30 4 M-80 6 Q20 26 140 -10 M-170 -30 Q-100 -4 -40 -2" stroke="#8d5d3b" stroke-width="6" fill="none" stroke-linecap="round"/>
        ${[-120, -40, 60, 130].map((lx, k) => `<ellipse cx="${lx}" cy="${-30 + (k % 2) * 8}" rx="22" ry="10" fill="#66bb6a" transform="rotate(${k * 30 - 40} ${lx} -30)"/>`).join("")}</g>`,
    };
  }

  const egg = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="-38" rx="30" ry="38" fill="#fff6e0"/>
    <circle cx="-10" cy="-50" r="6" fill="#7cc4f0"/><circle cx="12" cy="-30" r="8" fill="#ff9fc8"/><circle cx="-6" cy="-16" r="5" fill="#ffd36b"/></g>`;

  function stoneTable(x, y) {
    return `<g transform="translate(${x} ${y})"><path d="M-80 0 L-60 -130 L60 -130 L80 0 Z" fill="#9e9e9e"/>
      <ellipse cx="0" cy="-140" rx="330" ry="34" fill="#bdbdbd"/><ellipse cx="0" cy="-148" rx="320" ry="26" fill="#cfcfcf"/></g>`;
  }

  function mushroomLamp(x, y) {
    return `<g transform="translate(${x} ${y})"><circle cx="0" cy="-70" r="110" fill="#fff3b0" opacity=".3"><animate attributeName="opacity" values=".22;.4;.22" dur="3s" repeatCount="indefinite"/></circle>
      <rect x="-10" y="-60" width="20" height="60" rx="8" fill="#fff6e0"/><path d="M-50 -56 Q0 -120 50 -56 Z" fill="#ffd36b"/>
      <circle cx="-18" cy="-76" r="7" fill="#fff"/><circle cx="14" cy="-86" r="6" fill="#fff"/></g>`;
  }

  function zzz(x, y) {
    return [0, 1, 2].map((i) => `<text font-family="Baloo 2, Comic Sans MS, sans-serif" font-weight="800" font-size="${44 + i * 10}" fill="#fff" opacity="0">Z
      <animateMotion path="M${x} ${y} q60 -80 20 -170 q-40 -80 40 -160" dur="4.5s" begin="${i * 1.5}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;1;0" dur="4.5s" begin="${i * 1.5}s" repeatCount="indefinite"/></text>`).join("");
  }

  // dream bubble with a sleeping friend
  function bubble(id, x, y, k) {
    const fit = { tipi: [-70, 64, 0.5], stella: [-70, 46, 0.5], anki: [-60, 40, 0.55], pteri: [-6, 30, 0.6], bruuno: [0, 0, 0] }[id];
    const who = id === "bruuno"
      ? `<g transform="translate(16 18) scale(0.6)">${bruunoHead(C.bruuno, "closed")}</g>`
      : CHAR[id]({ x: fit[0], y: fit[1], s: fit[2], eyes: "closed", still: true });
    return `<g transform="translate(${x} ${y})"><circle r="92" fill="#3f3a7a" stroke="#fff" stroke-width="6"/>
      <clipPath id="db${k}"><circle r="88"/></clipPath><g clip-path="url(#db${k})"><ellipse cx="0" cy="66" rx="120" ry="40" fill="#a1653f"/>${who}</g>
      ${sparkle(70, -70, 0.5, k * 0.4)}</g>`;
  }

  const ROW = ["anki", "tipi", "rex", "stella", "pteri"];
  const meadow = (id, a, b) => [outdoor(id), sky(id, a, b)];

  // ---------- scenes ----------
  const SCENES = {
    cover() {
      return wrap(
        `${outdoor("dc")}${sun(1420, 130, 55)}${cloud(980, 110, 0.7)}${volcano(330, 640, 1.1)}${palm(1300, 660, 1)}${palm(80, 680, 0.8)}${grass(640)}
        ${fern(560, 760, 0.6)}${fern(1080, 770, 0.6)}
        ${anki({ x: 270, y: 740, s: 0.8, anim: hop(10, 1.4, 0.2), blink: 1 })}
        ${tipi({ x: 520, y: 740, s: 0.8, anim: hop(10, 1.4, 0.5), blink: 2 })}
        ${stella({ x: 1130, y: 740, s: 0.8, flip: true, anim: hop(10, 1.4, 0.8), blink: 3 })}
        ${rex({ x: 820, y: 780, s: 1.1, arm: "up", armAlt: { pose: "down", dur: 1.2 }, mouth: "open", anim: bob(8, 2) })}
        ${pteri({ x: 1360, y: 330, s: 0.8, flip: true, anim: bob(20, 2.5) })}
        ${sparkle(700, 340, 1.2)}${sparkle(960, 300, 1, 0.6)}`,
        sky("dc", "#ffd0a8", "#fff3c4"),
      );
    },

    wake() {
      const view = `<rect width="380" height="580" fill="#ffcf9e"/><g><animateTransform attributeName="transform" type="translate" values="0 160;0 0" dur="4s" fill="freeze" calcMode="spline" keySplines=".2 0 .3 1"/>${sun(190, 170, 60)}</g>
        <path d="M0 400 Q190 360 380 400 V580 H0 Z" fill="#8bd17c"/>${palm(320, 420, 0.6)}`;
      const n = nest(470, 720);
      return wrap(
        `${cave(outsideAt(view))}
        <path d="M1060 140 L1440 140 L900 760 L300 760 Z" fill="#fff3c4" opacity=".22"><animate attributeName="opacity" values=".16;.28;.16" dur="4s" repeatCount="indefinite"/></path>
        ${n.back}${egg(600, 690, 0.9)}
        ${rex({ x: 450, y: 700, s: 1, arm: "up", armAlt: { pose: "down", dur: 2.6 }, mouth: "open", anim: bob(8, 2.6) })}
        ${n.front}`,
      );
    },

    teeth() {
      const brush = `<g><path d="M0 0 L32 -46" stroke="#ff7eb6" stroke-width="9" stroke-linecap="round"/><rect x="24" y="-66" width="26" height="14" rx="4" fill="#fff" transform="rotate(-55 37 -59)"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;10 -4;0 0" dur=".35s" repeatCount="indefinite"/></g>`;
      const bubbles = Array.from({ length: 8 }, (_, i) => `<circle cx="${880 + (i % 4) * 26}" cy="400" r="${6 + (i % 3) * 4}" fill="#fff" stroke="#9fd8f3" stroke-width="2">
        <animate attributeName="cy" values="400;180" dur="2.4s" begin="${i * 0.3}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="2.4s" begin="${i * 0.3}s" repeatCount="indefinite"/></circle>`).join("");
      const fall = `<rect x="1180" y="0" width="70" height="560" fill="#9fd8f3" opacity=".8"/>${[0, 1, 2, 3].map((k) => `<rect x="${1190 + k * 14}" y="0" width="6" height="80" rx="3" fill="#fff" opacity=".8">
        <animate attributeName="y" values="-80;560" dur="1.2s" begin="${k * 0.3}s" repeatCount="indefinite"/></rect>`).join("")}`;
      return wrap(
        `${cave("")}${fall}<ellipse cx="1215" cy="600" rx="200" ry="50" fill="#7ec8ff"/><ellipse cx="1215" cy="590" rx="170" ry="34" fill="#a8dcff"/>
        <path d="M1015 600 Q1215 700 1415 600 L1400 700 L1030 700 Z" fill="#9e9e9e"/>
        ${rex({ x: 780, y: 740, s: 1.25, arm: "down", mouth: "grin", item: brush })}
        ${bubbles}${sparkle(940, 470, 0.8)}${sparkle(860, 430, 0.6, 0.7)}`,
      );
    },

    breakfast() {
      const berries = [[-60, -12, "#5c6bc0"], [-30, -18, "#e53935"], [0, -14, "#5c6bc0"], [30, -20, "#e53935"], [60, -12, "#5c6bc0"], [-14, -34, "#e53935"], [18, -36, "#5c6bc0"]]
        .map(([x, y, col]) => `<circle cx="${x}" cy="${y}" r="13" fill="${col}"/><circle cx="${x - 4}" cy="${y - 4}" r="3" fill="#fff" opacity=".7"/>`).join("");
      const [bg, defs] = meadow("db", "#9fdcff", "#e8f8ff");
      return wrap(
        `${bg}${sun(1450, 120, 50)}${cloud(500, 120, 0.7)}${volcano(1250, 620, 0.6)}${grass(620)}
        <path d="M0 260 Q140 200 320 260 L380 760 L0 760 Z" fill="#a1887f"/><path d="M120 760 L120 470 Q200 380 280 470 L280 760 Z" fill="#4e342e"/>
        ${palm(1450, 700, 0.8)}
        ${rex({ x: 640, y: 740, s: 1.15, arm: "front", chew: 0.5 })}
        <g transform="translate(1000 700)"><rect x="-120" y="-60" width="240" height="70" rx="30" fill="#9e9e9e"/>
          <path d="M-150 -60 Q0 -130 150 -60 Q0 -40 -150 -60 Z" fill="#66bb6a"/><path d="M-140 -62 Q0 -80 140 -62" stroke="#43a047" stroke-width="4" fill="none"/>
          <g transform="translate(0 -64)">${berries}</g></g>
        <g><animateTransform attributeName="transform" type="translate" values="0 0;0 0;-200 -70;-200 -70" keyTimes="0;0.4;0.8;1" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="1;1;1;0" keyTimes="0;0.4;0.78;0.8" dur="2s" repeatCount="indefinite"/><circle cx="960" cy="620" r="13" fill="#5c6bc0"/></g>`,
        defs,
      );
    },

    read() {
      const book = `<g transform="translate(0 0)"><path d="M0 0 L-80 -10 L-80 46 L0 56 Z" fill="#fff" stroke="#e0c9a6" stroke-width="2"/><path d="M0 0 L80 -10 L80 46 L0 56 Z" fill="#fff" stroke="#e0c9a6" stroke-width="2"/>
        <path d="M-66 30 L-46 6 L-36 18 L-26 2 L-14 30 Z" fill="#a1887f"/><circle cx="-36" cy="0" r="5" fill="#ff7043"/>
        <path d="M0 0 L80 -10 L80 46 L0 56 Z" fill="#fff8e7" stroke="#e0c9a6" stroke-width="2"><animateTransform attributeName="transform" type="scale" values="1 1;-1 1;-1 1;1 1" keyTimes="0;0.15;0.95;1" dur="4s" repeatCount="indefinite"/></path></g>`;
      const baby = `<g transform="translate(40 -10)"><g><animateTransform attributeName="transform" type="translate" values="0 30;0 30;0 -10;0 -10;0 30" keyTimes="0;0.3;0.45;0.85;1" dur="3s" repeatCount="indefinite"/>
        <circle cx="0" cy="-20" r="18" fill="#7ccf6a"/><circle cx="6" cy="-24" r="4" fill="#2b1d3a"/><path d="M-2 -12 Q8 -6 16 -14" stroke="#4f9e45" stroke-width="3" fill="none"/></g>
        <path d="M-24 0 L-16 -16 L-8 -4 L0 -18 L8 -4 L16 -16 L24 0 Q24 20 0 22 Q-24 20 -24 0 Z" fill="#fff6e0"/></g>`;
      return wrap(
        `${cave(outsideAt(outside(false)))}
        ${rex({ x: 640, y: 720, s: 1.15, arm: "front", eyes: "open" })}
        <g transform="translate(660 720)"><rect x="-200" y="-60" width="400" height="80" rx="40" fill="#8d5d3b"/><ellipse cx="-200" cy="-20" rx="20" ry="40" fill="#c68b5c"/></g>
        <g transform="translate(760 520)">${book}${baby}</g>
        ${sparkle(840, 420, 0.7)}${sparkle(700, 400, 0.5, 0.8)}`,
      );
    },

    friends() {
      const [bg, defs] = meadow("df", "#9fdcff", "#e8f8ff");
      return wrap(
        `${bg}${sun(1450, 110, 50)}${cloud(700, 120, 0.8)}${volcano(980, 600, 0.6)}${grass(640)}
        <path d="M0 200 Q200 140 420 220 L480 760 L0 760 Z" fill="#a1887f"/><path d="M150 760 L150 420 Q250 320 350 420 L350 760 Z" fill="#4e342e"/>
        ${rex({ x: 280, y: 750, s: 0.85, arm: "up", armAlt: { pose: "down", dur: 0.8 } })}
        ${tipi({ x: 740, y: 750, s: 0.75, flip: true, anim: hop(10, 1.2, 0.1), blink: 1 })}
        ${stella({ x: 1030, y: 750, s: 0.75, flip: true, anim: hop(10, 1.2, 0.4), blink: 2 })}
        ${anki({ x: 1330, y: 750, s: 0.75, flip: true, anim: hop(10, 1.2, 0.7), blink: 3 })}
        ${pteri({ x: 1180, y: 300, s: 0.8, flip: true, anim: bob(24, 2.2) })}`,
        defs,
      );
    },

    ball() {
      const path = "M440 560 Q620 120 800 470 Q980 120 1160 560 Q800 -60 440 560";
      const [bg, defs] = meadow("dbl", "#8fd3ff", "#e8f8ff");
      return wrap(
        `${bg}${sun(150, 120, 50)}${cloud(600, 120, 0.8)}${palm(1500, 680, 0.9)}${grass(630)}
        ${anki({ x: 300, y: 740, s: 0.75, flip: true, swing: 2 })}
        ${rex({ x: 800, y: 760, s: 0.85, arm: "up", mouth: "open", anim: hop(24, 1, 0.3) })}
        ${tipi({ x: 1300, y: 740, s: 0.75, flip: true, anim: hop(14, 1, 0.6) })}
        ${stella({ x: 1450, y: 780, s: 0.55, flip: true, mouth: "open" })}
        ${pteri({ x: 1000, y: 160, s: 0.6, flip: true, anim: bob(20, 2) })}
        <g><animateMotion path="${path}" dur="4s" repeatCount="indefinite"/><g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="1s" repeatCount="indefinite"/>
          <circle r="34" fill="#ff5c8a"/><path d="M-34 0 A34 34 0 0 0 34 0 Z" fill="#ffd447"/><path d="M0 -34 V34" stroke="#fff" stroke-width="6"/></g></g>`,
        defs,
      );
    },

    puddles() {
      const puddle = (x, w) => `<ellipse cx="${x}" cy="720" rx="${w}" ry="38" fill="#8d6e63"/><ellipse cx="${x - 20}" cy="712" rx="${w * 0.6}" ry="16" fill="#a1887f"/>`;
      const splash = (x, begin) => Array.from({ length: 6 }, (_, k) => {
        const dx = (k - 2.5) * 34, h = 80 + (k % 3) * 30;
        const t = `dur="1.2s" begin="${begin}s" repeatCount="indefinite"`; // lands at the start of each hop
        return `<circle cx="${x}" cy="710" r="${8 + (k % 2) * 4}" fill="#8d6e63" opacity="0">
          <animate attributeName="cx" values="${x};${x + dx};${x + dx}" keyTimes="0;0.5;1" ${t}/>
          <animate attributeName="cy" values="710;${710 - h};720;720" keyTimes="0;0.25;0.5;1" ${t}/>
          <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.45;0.5;1" ${t}/></circle>`;
      }).join("");
      const [bg, defs] = meadow("dp", "#9fdcff", "#e8f8ff");
      return wrap(
        `${bg}${cloud(300, 120, 0.8)}${cloud(1100, 100, 0.6, 50)}${sun(1450, 110, 50)}${grass(620, "#93c97e")}
        ${puddle(330, 190)}${puddle(800, 220)}${puddle(1260, 190)}
        ${tipi({ x: 330, y: 730, s: 0.7, mouth: "open", anim: hop(120, 1.2, 0) })}${splash(330, 0)}
        ${rex({ x: 800, y: 740, s: 0.85, arm: "up", mouth: "open", anim: hop(140, 1.2, 0.4) })}${splash(800, 0.4)}
        ${anki({ x: 1260, y: 730, s: 0.7, flip: true, mouth: "open", anim: hop(90, 1.2, 0.8) })}${splash(1260, 0.8)}
        ${pteri({ x: 560, y: 220, s: 0.6, anim: bob(18, 2) })}${stella({ x: 1500, y: 640, s: 0.45, flip: true })}`,
        defs,
      );
    },

    hide() {
      const [bg, defs] = meadow("dh", "#a8e2ff", "#effaff");
      return wrap(
        `${bg}${sun(1450, 110, 50)}${cloud(500, 110, 0.7)}${grass(600, "#7fc46e")}${palm(160, 640, 0.9)}
        ${stella({ x: 760, y: 720, s: 0.8, blink: 1 })}
        ${tipi({ x: 1120, y: 720, s: 0.7, flip: true })}
        ${anki({ x: 400, y: 730, s: 0.7 })}
        ${[[430, 730, 165, 85], [760, 690, 210, 115], [1120, 710, 185, 92]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#43a047"/>
          <ellipse cx="${x - rx * 0.4}" cy="${y - ry * 0.3}" rx="${rx * 0.5}" ry="${ry * 0.6}" fill="#4caf50"/><ellipse cx="${x + rx * 0.4}" cy="${y - ry * 0.2}" rx="${rx * 0.5}" ry="${ry * 0.6}" fill="#4caf50"/>`).join("")}
        ${fern(400, 790, 1.1)}${fern(760, 790, 1.2)}${fern(1120, 790, 1.1)}
        ${rex({ x: 1420, y: 760, s: 0.8, flip: true, arm: "up", mouth: "open", anim: hop(10, 0.8) })}
        ${pteri({ x: 980, y: 200, s: 0.55, flip: true, mouth: "open", anim: bob(16, 1.8) })}`,
        defs,
      );
    },

    apples() {
      const apples = [[560, 200], [640, 300], [700, 140], [780, 230], [860, 120], [930, 260], [1010, 180], [1080, 300], [620, 380], [990, 380], [760, 340], [1150, 220]];
      const apple = (x, y) => `<g transform="translate(${x} ${y})"><circle r="17" fill="#e53935"/><circle cx="-5" cy="-6" r="5" fill="#fff" opacity=".6"/><path d="M0 -16 L2 -26" stroke="#5d4037" stroke-width="3"/><ellipse cx="8" cy="-22" rx="7" ry="4" fill="#43a047"/></g>`;
      const [bg, defs] = meadow("da", "#9fdcff", "#f0fbff");
      return wrap(
        `${bg}${sun(1460, 110, 50)}${grass(650)}
        <path d="M770 720 C780 600 760 450 790 330 L840 330 C860 450 830 600 850 720 Z" fill="#8d5d3b"/>
        <ellipse cx="800" cy="240" rx="380" ry="180" fill="#5fb54f"/><ellipse cx="560" cy="300" rx="170" ry="120" fill="#58a948"/><ellipse cx="1050" cy="290" rx="180" ry="120" fill="#58a948"/><ellipse cx="800" cy="140" rx="220" ry="110" fill="#6cc25b"/>
        ${apples.map(([x, y]) => apple(x, y)).join("")}
        ${pteri({ x: 1180, y: 180, s: 0.6, flip: true, item: apple(0, 8), anim: bob(16, 1.6) })}
        ${rex({ x: 560, y: 750, s: 0.85, arm: "up", mouth: "open", anim: hop(30, 0.9) })}
        ${tipi({ x: 1120, y: 750, s: 0.7, flip: true, mouth: "open" })}
        ${stella({ x: 1400, y: 760, s: 0.6, flip: true })}${anki({ x: 230, y: 760, s: 0.6 })}
        <g><animateTransform attributeName="transform" type="translate" values="0 0;0 0;-500 340;-500 340" keyTimes="0;0.3;0.75;1" dur="2.4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="1;1;1;0" keyTimes="0;0.3;0.74;0.76" dur="2.4s" repeatCount="indefinite"/>${apple(1100, 220)}</g>`,
        defs,
      );
    },

    goodbye() {
      const homes = [[260, "#7cc4f0"], [600, "#b99af0"], [1000, "#ffb15c"], [1340, "#ff9fc8"]];
      const home = (x, col) => `<g transform="translate(${x} 470)"><path d="M-90 0 Q-80 -120 0 -130 Q80 -120 90 0 Z" fill="#a1887f"/><path d="M-30 0 L-30 -50 Q0 -80 30 -50 L30 0 Z" fill="#4e342e"/>
        <path d="M40 -110 L40 -170" stroke="#8d6e63" stroke-width="4"/><path d="M40 -170 L80 -158 L40 -146 Z" fill="${col}"/></g>`;
      const walkers = ["tipi", "stella", "anki", "pteri"].map((id, i) => {
        const [hx] = homes[i];
        const sx = 560 + i * 170;
        const who = id === "pteri" ? pteri({ s: 0.6, y: -260, flip: hx < sx }) : CHAR[id]({ s: 0.6, flip: hx < sx, anim: hop(8, 0.6, i * 0.15) });
        return `<g transform="translate(${sx} 700)"><g><animateTransform attributeName="transform" type="translate" values="0 0;${hx - sx} -220" dur="9s" fill="freeze" calcMode="spline" keySplines=".3 0 .7 1"/>
          <g><animateTransform attributeName="transform" type="scale" values="1;0.35" dur="9s" fill="freeze" calcMode="spline" keySplines=".3 0 .7 1"/>${who}</g></g></g>`;
      }).join("");
      return wrap(
        `${outdoor("dg")}${sun(800, 110, 50)}${cloud(300, 150, 0.7)}${volcano(1300, 470, 0.4)}
        <path d="M0 520 Q400 430 800 500 T1600 480 L1600 900 L0 900 Z" fill="#a5dc94"/>
        ${homes.map(([x, col]) => home(x, col)).join("")}
        <path d="M760 900 C780 700 700 600 260 480 M800 900 C800 650 640 560 600 480 M840 900 C820 650 960 560 1000 480 M880 900 C880 700 1000 600 1340 480" stroke="#f3d9a4" stroke-width="40" fill="none" stroke-linecap="round" opacity=".9"/>
        ${walkers}${rex({ x: 800, y: 800, s: 0.95, arm: "up", armAlt: { pose: "down", dur: 0.8 } })}`,
        sky("dg", "#ffd9a8", "#fff3d6"),
      );
    },

    lunch(night = false) {
      const carrot = (x, y, a) => `<path d="M${x} ${y} l-8 -46 l16 0 Z" fill="#ff8a3d" transform="rotate(${a} ${x} ${y})"/><path d="M${x - 6} ${y - 46} l6 -14 l6 14" stroke="#43a047" stroke-width="4" fill="none" transform="rotate(${a} ${x} ${y})"/>`;
      const broc = (x, y) => `<rect x="${x - 5}" y="${y - 24}" width="10" height="24" fill="#7cb342"/><circle cx="${x - 10}" cy="${y - 30}" r="12" fill="#43a047"/><circle cx="${x + 10}" cy="${y - 30}" r="12" fill="#43a047"/><circle cx="${x}" cy="${y - 42}" r="13" fill="#4caf50"/>`;
      const steam = [0, 1, 2].map((i) => `<path d="M${770 + i * 30} 520 q-15 -25 0 -50 q15 -25 0 -50" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8">
        <animateTransform attributeName="transform" type="translate" values="0 0;0 -40" dur="2s" begin="${i * 0.6}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;.9;0" dur="2s" begin="${i * 0.6}s" repeatCount="indefinite"/></path>`).join("");
      const food = night
        ? `<path d="M720 540 Q800 610 880 540 Z" fill="#8d6e63"/><ellipse cx="800" cy="540" rx="80" ry="14" fill="#ffb74d"/><circle cx="780" cy="538" r="6" fill="#ff7043"/><circle cx="815" cy="542" r="6" fill="#66bb6a"/>${steam}`
        : `<ellipse cx="800" cy="552" rx="120" ry="20" fill="#fff"/>${carrot(740, 548, -20)}${carrot(770, 552, -10)}${broc(830, 552)}${broc(870, 550)}`;
      return wrap(
        `${cave(outsideAt(outside(night)), night)}
        ${rex({ x: 800, y: 690, s: 1.05, arm: "front", chew: 0.5 })}
        ${stoneTable(800, 720)}${food}
        <rect x="1000" y="500" width="50" height="64" rx="10" fill="#a8dcff" stroke="#fff" stroke-width="4"/>
        ${night ? mushroomLamp(300, 700) : ""}`,
      );
    },

    nest() {
      const n = nest(800, 720);
      return wrap(
        `${cave(outsideAt(outside(false)))}${n.back}${egg(880, 690, 0.9)}
        ${rex({ x: 620, y: 740, s: 1, arm: "front", armAlt: { pose: "up", dur: 2 }, item: `<ellipse cx="10" cy="-6" rx="26" ry="12" fill="#66bb6a"/>` })}
        ${n.front}
        ${[0, 1, 2].map((k) => `<ellipse cx="${700 + k * 60}" cy="400" rx="18" ry="8" fill="#66bb6a"><animate attributeName="cy" values="380;680" dur="3s" begin="${k}s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="rotate" values="0 ${700 + k * 60} 500;40 ${700 + k * 60} 500;0 ${700 + k * 60} 500" dur="1.5s" repeatCount="indefinite"/></ellipse>`).join("")}`,
      );
    },

    nap(night = false) {
      const n = nest(520, 780);
      const friends = ["tipi", "stella", "anki", "pteri"];
      const spots = [[160, 220], [820, 190], [1010, 420], [1330, 560], [420, 140]];
      return wrap(
        `${cave(outsideAt(outside(night)), true)}${n.back}
        <g transform="rotate(-14 520 760)">${rex({ x: 500, y: 850, s: 0.95, eyes: "closed", anim: bob(4, 3) })}</g>
        ${egg(620, 740, 0.9)}${n.front}
        ${friends.map((id, k) => bubble(id, ...spots[k], k)).join("")}${night ? bubble("bruuno", ...spots[4], 4) : ""}
        ${zzz(640, 470)}${night ? mushroomLamp(1000, 760) : ""}`,
      );
    },

    ready() {
      const runners = [["rex", 0], ["tipi", 0.25], ["stella", 0.5], ["anki", 0.75]].map(([id, d], k) =>
        `<g><animateTransform attributeName="transform" type="translate" values="${-200 - k * 60} 0;${900 - k * 200} 0" dur="10s" fill="freeze"/>
        ${CHAR[id]({ x: 400 - k * 120, y: 740 + (k % 2) * 30, s: 0.7, mouth: "open", arm: "up", anim: hop(26, 0.5, d) })}</g>`).join("");
      return wrap(
        `${outdoor("dr")}${sun(1400, 120, 55)}${cloud(400, 110, 0.7)}${grass(620)}
        <ellipse cx="1350" cy="660" rx="300" ry="60" fill="#56b4ff"/><ellipse cx="1350" cy="650" rx="260" ry="40" fill="#8fd3ff"/>
        ${flower(300, 800, "#ff7eb6")}${flower(900, 820, "#ffd447", 0.8)}
        ${runners}${pteri({ x: 700, y: 250, s: 0.6, anim: bob(18, 1.6) })}`,
        sky("dr", "#9fdcff", "#f0fbff"),
      );
    },

    roar() {
      const DTF = "translate(400 120) scale(0.75)";
      const waves = [0, 1, 2].map((k) => `<path d="M560 ${470 - k * 14} q30 -30 0 -60" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity="0">
        <animateTransform attributeName="transform" type="translate" values="0 0;160 -40" dur="1.2s" begin="${k * 0.4}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;0" dur="1.2s" begin="${k * 0.4}s" repeatCount="indefinite"/></path>`).join("");
      return wrap(
        `${outdoor("dw")}${cloud(250, 120, 0.7)}${grass(640)}<ellipse cx="1200" cy="700" rx="420" ry="70" fill="#56b4ff"/>
        <g transform="${DTF}">${bruuno({ head: "down", eyes: "closed" })}</g>${zzz(640, 430)}
        ${rex({ x: 330, y: 750, s: 0.8, arm: "up", mouth: "open", anim: hop(10, 0.6) })}
        ${tipi({ x: 140, y: 760, s: 0.55, mouth: "open" })}${anki({ x: 160, y: 820, s: 0.5, mouth: "open" })}
        ${stella({ x: 470, y: 820, s: 0.5, mouth: "open" })}${pteri({ x: 480, y: 330, s: 0.5, mouth: "open", anim: bob(14, 1.4) })}
        ${waves}`,
        sky("dw", "#c9e8ff", "#fdf3ff"),
      );
    },

    bruunowake() {
      const DTF = "translate(400 120) scale(0.75)";
      return wrap(
        `${outdoor("dk")}${sun(1450, 110, 50)}${cloud(250, 120, 0.7)}${grass(640)}<ellipse cx="1200" cy="700" rx="420" ry="70" fill="#56b4ff"/>
        <g transform="${DTF}">${bruuno({ head: "nod" })}</g>
        ${rex({ x: 330, y: 750, s: 0.8, arm: "up", armAlt: { pose: "down", dur: 0.7 }, mouth: "open", anim: hop(20, 0.9) })}
        ${tipi({ x: 140, y: 760, s: 0.55, anim: hop(16, 0.9, 0.2) })}${anki({ x: 160, y: 820, s: 0.5, anim: hop(12, 0.9, 0.4) })}
        ${stella({ x: 470, y: 820, s: 0.5, anim: hop(14, 0.9, 0.6) })}${pteri({ x: 600, y: 260, s: 0.55, anim: bob(20, 1.4) })}
        ${[[700, 260], [520, 420], [880, 220]].map(([x, y], k) => sparkle(x, y, 1, k * 0.3)).join("")}`,
        sky("dk", "#8fd3ff", "#e8f8ff"),
      );
    },

    bruunoslide(afternoon = false) {
      const riders = ["rex", "tipi", "stella", "anki"].map((id, k) => {
        const t = `dur="6s" begin="${-k * 1.5}s" repeatCount="indefinite"`;
        return `<g><animateMotion path="${K.DRAGON_RIDE}" ${t} keyPoints="0;${K.HEAD_TOP};${K.HEAD_TOP};1;1" keyTimes="0;0.15;0.2;0.85;1" calcMode="linear"/>
          <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.04;0.85;0.92;1" ${t}/>
          ${CHAR[id]({ s: 0.36, mouth: "open", arm: "up" })}</g>`;
      }).join("");
      const id = afternoon ? "dsa" : "dsd";
      return wrap(
        `${outdoor(id)}${afternoon ? sun(1380, 200, 60) : sun(1420, 110, 50)}${cloud(900, 110, 0.7)}${grass(670)}
        ${bruuno({ head: "pick" })}${riders}
        <g><animateMotion path="M1200 200 C1400 120 1500 300 1250 330 C1000 360 900 160 1200 200" dur="6s" repeatCount="indefinite"/>${pteri({ s: 0.5, mouth: "open" })}</g>`,
        afternoon ? sky(id, "#ffc48a", "#fff0c9") : sky(id, "#8fd3ff", "#e8f8ff"),
      );
    },

    afternoon() {
      return this.bruunoslide(true);
    },

    bruunosleep() {
      const DTF = "translate(400 120) scale(0.75)";
      return wrap(
        `${outdoor("dz")}<circle cx="1420" cy="560" r="90" fill="#ffb36b"/><path d="M0 640 Q500 600 900 640 T1600 630 L1600 900 L0 900 Z" fill="#9bc98a"/>
        <g transform="${DTF}"><g>${bob(4, 3.5)}${bruuno({ head: "down", eyes: "closed" })}</g></g>${zzz(600, 420)}
        ${rex({ x: 330, y: 760, s: 0.75, arm: "up", armAlt: { pose: "down", dur: 1.2 } })}
        ${tipi({ x: 130, y: 770, s: 0.5 })}${stella({ x: 160, y: 830, s: 0.45 })}${anki({ x: 470, y: 830, s: 0.45 })}
        ${pteri({ x: 300, y: 330, s: 0.45, anim: bob(10, 2) })}`,
        sky("dz", "#ff9fb3", "#ffd9a8"),
      );
    },

    dinner() {
      return this.lunch(true);
    },

    bedtime() {
      const n = nest(1050, 760, 0.8);
      const book = `<rect x="-26" y="-34" width="52" height="40" rx="5" fill="#ff7eb6"/><rect x="-20" y="-28" width="40" height="5" rx="2" fill="#fff"/>${sparkle(30, -40, 0.5)}`;
      return wrap(
        `${cave(outsideAt(outside(true)), true)}${n.back}${egg(1090, 730, 0.8)}${n.front}${mushroomLamp(300, 720)}
        ${rex({ x: 700, y: 750, s: 1.1, arm: "front", item: book, mouth: "open", anim: bob(5, 2) })}
        <g transform="translate(470 720)"><ellipse cx="0" cy="-10" rx="70" ry="22" fill="#9e9e9e"/><path d="M-30 -30 L30 -40" stroke="#ff7eb6" stroke-width="8" stroke-linecap="round"/></g>`,
      );
    },

    night() {
      return this.nap(true);
    },

    end() {
      const stars = Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 397) % 1600}" cy="${(i * 211) % 520}" r="${2 + (i % 3)}" fill="#fff"><animate attributeName="opacity" values="1;.2;1" dur="${2 + (i % 4)}s" begin="${(i % 5) * 0.4}s" repeatCount="indefinite"/></circle>`).join("");
      return wrap(
        `${outdoor("de")}${stars}<circle cx="150" cy="190" r="80" fill="#fff6c9"/><circle cx="190" cy="165" r="80" fill="url(#de)"/>
        ${volcano(1150, 700, 1, true)}${palm(300, 720, 0.9)}
        <path d="M0 700 Q400 660 800 700 T1600 690 L1600 900 L0 900 Z" fill="#2a2560"/>
        ${sparkle(560, 300, 1.2)}${sparkle(1050, 200, 1, 0.6)}${sparkle(800, 160, 1.3, 1.1)}`,
        sky("de", "#1d1b4b", "#5b4b8a"),
      );
    },
  };

  globalThis.SCENES = SCENES;
})();
