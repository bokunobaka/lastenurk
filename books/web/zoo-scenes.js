// "Printsess Frida loomaaias" drawings (1600x900 SVG, SMIL-animated). Reuses the drawing kit from scenes.js.
(() => {
  const K = globalThis.SCENE_KIT;
  const FRIDA_SCENES = globalThis.SCENES; // the Frida book's scenes: the morning page is reused
  const { wrap, sky, outdoor, sun, cloud, flower, bush, grass, sparkle, bob, hop, princess, castle, room } = K;
  const { SIZE, who, SANDWICH, cone, BAG, place, eye, cheek, swing, fence, tree, rock, balloon, starField, dreamBed } = K;
  const zooPath = K.walkway;
  let uid = 0;

  // ---------- animals (facing right, feet at 0,0) ----------
  function giraffe(o = {}) {
    const body = "#ffcf5c", spot = "#d9913a", dark = "#a8661f";
    const leg = (x, b) => `<g><animateTransform attributeName="transform" type="rotate" values="0 ${x + 10} -250;${o.walk ? 6 : 0} ${x + 10} -250;0 ${x + 10} -250" dur="1.4s" begin="${b}s" repeatCount="indefinite"/>
      <rect x="${x}" y="-260" width="20" height="252" rx="9" fill="${body}"/><rect x="${x - 2}" y="-16" width="24" height="16" rx="5" fill="${dark}"/></g>`;
    const spots = [[-62, -292], [-14, -272], [34, -298], [-44, -246], [10, -240], [58, -262], [-84, -262], [-30, -310]]
      .map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="${15 + (i % 3) * 3}" ry="${11 + (i % 2) * 3}" fill="${spot}"/>`).join("");
    const neckSpots = [[70, -330], [86, -390], [104, -450], [120, -510]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="10" fill="${spot}"/>`).join("");
    const chew = o.chew ? `<animateTransform attributeName="transform" type="rotate" values="0 130 -560;-5 130 -560;0 130 -560" dur="1.1s" repeatCount="indefinite"/>` : "";
    const munch = o.chew ? `<animate attributeName="ry" values="3;8;3" dur=".55s" repeatCount="indefinite"/>` : "";
    return place(o, `
      <path d="M-104 -296 Q-130 -230 -122 -170" stroke="${body}" stroke-width="8" fill="none" stroke-linecap="round">
        <animate attributeName="d" values="M-104 -296 Q-130 -230 -122 -170;M-104 -296 Q-110 -230 -140 -176;M-104 -296 Q-130 -230 -122 -170" dur="2.2s" repeatCount="indefinite"/></path>
      ${leg(-88, 0)}${leg(-58, 0.7)}${leg(42, 0.7)}${leg(72, 0)}
      <path d="M40 -300 L112 -556 L160 -546 L104 -266 Z" fill="${body}"/>${neckSpots}
      <path d="M44 -310 L116 -560" stroke="${dark}" stroke-width="10" stroke-linecap="round" stroke-dasharray="14 10"/>
      <ellipse cx="0" cy="-285" rx="112" ry="64" fill="${body}"/>${spots}
      <g>${chew}
        <rect x="128" y="-648" width="9" height="40" rx="4" fill="${body}"/><circle cx="132" cy="-650" r="9" fill="${dark}"/>
        <rect x="152" y="-650" width="9" height="40" rx="4" fill="${body}"/><circle cx="156" cy="-652" r="9" fill="${dark}"/>
        <ellipse cx="114" cy="-602" rx="22" ry="10" fill="${body}" transform="rotate(-20 114 -602)"/>
        <ellipse cx="170" cy="-584" rx="54" ry="32" fill="${body}"/><ellipse cx="214" cy="-574" rx="28" ry="24" fill="#ffe2a8"/>
        ${eye(168, -594, 7, o)}${cheek(186, -572, 9)}<circle cx="226" cy="-582" r="3.5" fill="${dark}"/>
        <ellipse cx="222" cy="-560" rx="9" ry="3" fill="#c2185b">${munch}</ellipse>
      </g>`);
  }

  function elephant(o = {}) {
    const body = "#a9b5cb", dark = "#7c89a3", ear = "#f5b8cc";
    const trunkDown = "M204 -226 C258 -200 268 -130 252 -76 C248 -62 228 -62 226 -76 C238 -126 232 -176 196 -196 Z";
    const trunkUp = "M204 -230 C268 -232 296 -292 286 -354 C292 -366 314 -366 316 -352 C330 -282 290 -206 210 -192 Z";
    const trunk = o.spray
      ? `<path d="${trunkUp}" fill="${body}"><animate attributeName="d" values="${trunkDown};${trunkUp};${trunkUp};${trunkDown}" keyTimes="0;0.25;0.85;1" dur="4s" repeatCount="indefinite"/></path>`
      : `<path d="${trunkDown}" fill="${body}"/>`;
    const drops = o.spray
      ? Array.from({ length: 9 }, (_, i) => `<circle r="${7 + (i % 3) * 3}" fill="#7fd0ff" opacity="0">
          <animateMotion path="M300 -364 q${110 + i * 26} ${-150 - (i % 3) * 40} ${230 + i * 40} ${60 + (i % 4) * 50}" dur="1.4s" begin="${1 + i * 0.16}s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;1;1;0" dur="1.4s" begin="${1 + i * 0.16}s" repeatCount="indefinite"/></circle>`).join("")
      : "";
    const leg = (x) => `<rect x="${x}" y="-150" width="46" height="150" rx="16" fill="${body}"/><path d="M${x + 8} -6 h8 M${x + 22} -6 h8" stroke="#eef1f7" stroke-width="6" stroke-linecap="round"/>`;
    return place(o, `
      <path d="M-166 -220 Q-196 -170 -186 -120" stroke="${body}" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="-186" cy="-116" r="8" fill="${dark}"/>
      ${leg(-118)}${leg(-62)}${leg(36)}${leg(92)}
      <ellipse cx="0" cy="-200" rx="172" ry="126" fill="${body}"/>
      <path d="M-110 -150 Q-60 -130 -20 -150" stroke="${dark}" stroke-width="4" fill="none" opacity=".4"/>
      <circle cx="152" cy="-244" r="92" fill="${body}"/>
      <g><animateTransform attributeName="transform" type="rotate" values="0 120 -300;-8 120 -300;0 120 -300" dur="2.6s" repeatCount="indefinite"/>
        <ellipse cx="104" cy="-236" rx="64" ry="88" fill="${body}" stroke="${dark}" stroke-width="3"/><ellipse cx="104" cy="-232" rx="44" ry="64" fill="${ear}"/></g>
      ${trunk}${eye(184, -270, 9, o)}${cheek(206, -238, 12)}
      <path d="M206 -206 Q226 -196 240 -210" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/>
      ${drops}`);
  }

  // lying down, facing right; o.yawn opens the mouth now and then
  function lion(o = {}) {
    const body = "#f5b94f", mane = "#c9772b", face = "#ffd27a", dark = "#6d3d16";
    const tufts = Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return `<circle cx="${(Math.cos(a) * 82).toFixed(1)}" cy="${(Math.sin(a) * 82).toFixed(1)}" r="30" fill="${mane}"/>`;
    }).join("");
    const mouth = o.yawn
      ? `<ellipse cx="0" cy="34" rx="22" ry="4" fill="#9c2a3a"><animate attributeName="ry" values="4;4;30;30;4" keyTimes="0;0.45;0.6;0.8;1" dur="5s" repeatCount="indefinite"/></ellipse>`
      : `<path d="M-14 30 Q0 40 14 30" stroke="${dark}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    const eyes = o.yawn
      ? `<g>${eye(-24, -14, 8, o)}${eye(24, -14, 8, o)}<animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;0.45;0.5;0.8;1" dur="5s" repeatCount="indefinite"/></g>
         <g opacity="0">${eye(-24, -14, 8, { eyes: "closed" })}${eye(24, -14, 8, { eyes: "closed" })}<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.45;0.5;0.8;1" dur="5s" repeatCount="indefinite"/></g>`
      : `${eye(-24, -14, 8, o)}${eye(24, -14, 8, o)}`;
    return place(o, `
      <path d="M-160 -40 Q-260 -20 -250 -90" stroke="${body}" stroke-width="12" fill="none" stroke-linecap="round">
        <animate attributeName="d" values="M-160 -40 Q-260 -20 -250 -90;M-160 -40 Q-250 -60 -280 -40;M-160 -40 Q-260 -20 -250 -90" dur="3s" repeatCount="indefinite"/></path>
      <ellipse cx="-250" cy="-96" rx="16" ry="20" fill="${mane}"><animate attributeName="cx" values="-250;-284;-250" dur="3s" repeatCount="indefinite"/><animate attributeName="cy" values="-96;-40;-96" dur="3s" repeatCount="indefinite"/></ellipse>
      <ellipse cx="0" cy="-74" rx="176" ry="74" fill="${body}"/>
      <ellipse cx="-120" cy="-18" rx="56" ry="22" fill="${body}"/>
      <ellipse cx="150" cy="-16" rx="54" ry="20" fill="${body}"/><ellipse cx="214" cy="-14" rx="54" ry="20" fill="${body}"/>
      <path d="M180 -10 v8 M196 -8 v8 M244 -8 v8 M260 -8 v8" stroke="${dark}" stroke-width="3" opacity=".5"/>
      <g transform="translate(176 -150)">
        <g>${o.yawn ? `<animateTransform attributeName="transform" type="rotate" values="0;0;-10;-10;0" keyTimes="0;0.45;0.6;0.8;1" dur="5s" repeatCount="indefinite"/>` : ""}
        ${tufts}<circle r="84" fill="${mane}"/>
        <circle cx="-52" cy="-52" r="18" fill="${face}"/><circle cx="52" cy="-52" r="18" fill="${face}"/><circle cx="-52" cy="-52" r="9" fill="${mane}"/><circle cx="52" cy="-52" r="9" fill="${mane}"/>
        <circle r="66" fill="${face}"/>${eyes}${cheek(-42, 12)}${cheek(42, 12)}
        <ellipse cx="0" cy="18" rx="30" ry="22" fill="#fff1cc"/><path d="M-12 4 L12 4 L0 16 Z" fill="${dark}"/>
        ${mouth}</g></g>`);
  }

  // hangs by both hands from the point (0,0)
  function monkey(o = {}) {
    const fur = o.fur || "#a0693a", face = "#f3d0a2", dark = "#5d3a1a";
    return place(o, `
      <path d="M30 190 C80 200 90 140 60 130 C40 124 36 150 52 152" stroke="${fur}" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M-8 0 L-24 70 M8 0 L24 70" stroke="${fur}" stroke-width="16" stroke-linecap="round"/>
      <circle cx="-8" cy="0" r="10" fill="${face}"/><circle cx="8" cy="0" r="10" fill="${face}"/>
      <path d="M-18 196 L-28 250 M18 196 L28 250" stroke="${fur}" stroke-width="16" stroke-linecap="round"/>
      <ellipse cx="-30" cy="254" rx="14" ry="8" fill="${face}"/><ellipse cx="30" cy="254" rx="14" ry="8" fill="${face}"/>
      <ellipse cx="0" cy="160" rx="38" ry="48" fill="${fur}"/><ellipse cx="0" cy="168" rx="24" ry="32" fill="${face}" opacity=".6"/>
      <circle cx="-42" cy="92" r="16" fill="${fur}"/><circle cx="42" cy="92" r="16" fill="${fur}"/><circle cx="-42" cy="92" r="8" fill="${face}"/><circle cx="42" cy="92" r="8" fill="${face}"/>
      <circle cx="0" cy="96" r="42" fill="${fur}"/>
      <path d="M-30 98 Q-30 70 -10 76 Q0 82 10 76 Q30 70 30 98 Q30 130 0 132 Q-30 130 -30 98 Z" fill="${face}"/>
      ${eye(-12, 92, 6, o)}${eye(12, 92, 6, o)}<path d="M-12 114 Q0 124 12 114" stroke="${dark}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`);
  }

  function penguin(o = {}) {
    const dark = "#2d3a4f", beak = "#ff9f1c";
    const flap = (side) => `<ellipse cx="${side * 44}" cy="-82" rx="12" ry="40" fill="${dark}" transform="rotate(${side * -14} ${side * 44} -110)">
      <animateTransform attributeName="transform" type="rotate" values="${side * -14} ${side * 44} -110;${side * -34} ${side * 44} -110;${side * -14} ${side * 44} -110" dur=".8s" repeatCount="indefinite"/></ellipse>`;
    return place(o, `
      <ellipse cx="-16" cy="-4" rx="16" ry="7" fill="${beak}"/><ellipse cx="16" cy="-4" rx="16" ry="7" fill="${beak}"/>
      ${flap(-1)}${flap(1)}
      <ellipse cx="0" cy="-78" rx="46" ry="74" fill="${dark}"/><ellipse cx="6" cy="-66" rx="32" ry="56" fill="#fff"/>
      <ellipse cx="12" cy="-122" rx="26" ry="20" fill="#fff"/>
      ${eye(4, -126, 5, o)}${eye(24, -126, 5, o)}${cheek(30, -108, 6)}
      <path d="M26 -114 L52 -108 L26 -100 Z" fill="${beak}"/>`);
  }

  let stripeId = 0;
  function zebra(o = {}) {
    const id = `zb${uid++}-${stripeId++}`;
    const stripes = Array.from({ length: 11 }, (_, i) => `<path d="M${-140 + i * 26} -290 q${i % 2 ? 14 : -14} 60 0 130 q${i % 2 ? -12 : 12} 50 0 100" stroke="#222" stroke-width="12" fill="none"/>`).join("");
    const leg = (x, b) => `<g><animateTransform attributeName="transform" type="rotate" values="0 ${x + 9} -150;${o.walk ? 8 : 0} ${x + 9} -150;0 ${x + 9} -150" dur="1.2s" begin="${b}s" repeatCount="indefinite"/>
      <rect x="${x}" y="-160" width="18" height="152" rx="8" fill="#fff" stroke="#ddd" stroke-width="2"/>
      <path d="M${x} -110 h18 M${x} -70 h18" stroke="#222" stroke-width="9"/><rect x="${x - 2}" y="-14" width="22" height="14" rx="5" fill="#333"/></g>`;
    const graze = o.graze
      ? `<animateTransform attributeName="transform" type="rotate" values="0 90 -230;40 90 -230;40 90 -230;0 90 -230" keyTimes="0;0.3;0.7;1" dur="5s" repeatCount="indefinite"/>` : "";
    return place(o, `
      <defs><clipPath id="${id}"><ellipse cx="0" cy="-200" rx="130" ry="68"/></clipPath></defs>
      <path d="M-126 -210 Q-150 -160 -142 -120" stroke="#fff" stroke-width="7" fill="none"/><ellipse cx="-142" cy="-114" rx="9" ry="14" fill="#222"/>
      ${leg(-96, 0)}${leg(-66, 0.6)}${leg(52, 0.6)}${leg(82, 0)}
      <ellipse cx="0" cy="-200" rx="130" ry="68" fill="#fff" stroke="#ddd" stroke-width="2"/>
      <g clip-path="url(#${id})">${stripes}</g>
      <g>${graze}
        <path d="M70 -230 L136 -330 L176 -312 L120 -196 Z" fill="#fff"/>
        <path d="M86 -238 L150 -330 M104 -226 L160 -320 M122 -214 L170 -312" stroke="#222" stroke-width="9"/>
        <path d="M70 -240 L134 -340" stroke="#222" stroke-width="14" stroke-linecap="round" stroke-dasharray="10 6"/>
        <ellipse cx="150" cy="-356" rx="10" ry="22" fill="#fff" stroke="#222" stroke-width="3" transform="rotate(-20 150 -356)"/>
        <ellipse cx="178" cy="-318" rx="62" ry="32" fill="#fff" transform="rotate(32 178 -318)"/>
        <path d="M150 -340 L170 -300 M166 -350 L190 -312" stroke="#222" stroke-width="7"/>
        <ellipse cx="214" cy="-292" rx="26" ry="20" fill="#333" transform="rotate(32 214 -292)"/>
        ${eye(170, -332, 7, o)}</g>`);
  }

  function goat(o = {}) {
    const body = o.fur || "#f6efe4", dark = "#9e8a74", horn = "#d8c6a8";
    const mouth = o.baa
      ? `<ellipse cx="128" cy="-128" rx="7" ry="2" fill="#9c2a3a"><animate attributeName="ry" values="2;2;8;8;2" keyTimes="0;0.5;0.58;0.8;1" dur="3s" repeatCount="indefinite"/></ellipse>`
      : `<path d="M120 -130 Q128 -124 134 -132" stroke="${dark}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    const leg = (x) => `<rect x="${x}" y="-80" width="13" height="74" rx="6" fill="${body}"/><rect x="${x - 1}" y="-12" width="15" height="12" rx="4" fill="#5d4a3a"/>`;
    return place(o, `
      <path d="M-70 -112 L-86 -138 L-62 -122 Z" fill="${body}"><animateTransform attributeName="transform" type="rotate" values="0 -70 -112;-20 -70 -112;0 -70 -112" dur=".5s" repeatCount="indefinite"/></path>
      ${leg(-56)}${leg(-36)}${leg(34)}${leg(54)}
      <ellipse cx="0" cy="-100" rx="76" ry="44" fill="${body}"/>${o.spots ? `<ellipse cx="-20" cy="-110" rx="24" ry="16" fill="${o.spots}"/><ellipse cx="30" cy="-92" rx="16" ry="12" fill="${o.spots}"/>` : ""}
      <g>${o.nod ? `<animateTransform attributeName="transform" type="rotate" values="0 60 -120;8 60 -120;0 60 -120" dur="2s" repeatCount="indefinite"/>` : ""}
        <path d="M44 -120 L80 -164 L104 -150 L76 -100 Z" fill="${body}"/>
        <path d="M80 -186 Q72 -214 52 -212" stroke="${horn}" stroke-width="8" fill="none" stroke-linecap="round"/>
        <ellipse cx="66" cy="-170" rx="24" ry="9" fill="${body}" stroke="${dark}" stroke-width="2" transform="rotate(20 66 -170)"/>
        <ellipse cx="100" cy="-158" rx="34" ry="26" fill="${body}" transform="rotate(24 100 -158)"/>
        <path d="M118 -128 L114 -100 L126 -124 Z" fill="${dark}"/>
        ${eye(98, -168, 6, o)}${cheek(112, -146, 7)}<circle cx="128" cy="-142" r="3" fill="${dark}"/>${mouth}</g>`);
  }

  function rabbit(o = {}) {
    const fur = o.fur || "#d9d4e4", inner = "#ffc0d4", dark = "#7a6f8f";
    const ear = (x, r, b) => `<g><animateTransform attributeName="transform" type="rotate" values="${r} ${x} -110;${r - 12} ${x} -110;${r} ${x} -110" dur="2.6s" begin="${b}s" repeatCount="indefinite"/>
      <ellipse cx="${x}" cy="-150" rx="12" ry="40" fill="${fur}"/><ellipse cx="${x}" cy="-148" rx="6" ry="30" fill="${inner}"/></g>`;
    return place(o, `
      <circle cx="-48" cy="-42" r="16" fill="#fff"/>
      <ellipse cx="0" cy="-44" rx="54" ry="42" fill="${fur}"/><ellipse cx="34" cy="-6" rx="22" ry="9" fill="${fur}"/>
      ${ear(30, -6, 0)}${ear(54, 10, 0.5)}
      <circle cx="44" cy="-90" r="32" fill="${fur}"/>
      ${eye(54, -96, 5.5, o)}${cheek(60, -78, 7)}
      <ellipse cx="74" cy="-86" rx="5" ry="4" fill="#ff8fb0"><animate attributeName="cy" values="-86;-88;-86" dur=".35s" repeatCount="indefinite"/></ellipse>
      <path d="M62 -76 Q70 -70 76 -76" stroke="${dark}" stroke-width="2.5" fill="none"/>`);
  }

  // o.rider: SVG drawn on the saddle (origin = top of the saddle)
  const PONY_SADDLE = [-10, -232];
  const PONY_MOUTH = [222, -282];
  function pony(o = {}) {
    const body = "#c58b5a", dark = "#8d5a32", mane = "#ff8fbf";
    const leg = (x, b) => `<g><animateTransform attributeName="transform" type="rotate" values="-8 ${x + 9} -150;8 ${x + 9} -150;-8 ${x + 9} -150" dur="1.2s" begin="${b}s" repeatCount="indefinite"/>
      <rect x="${x}" y="-160" width="20" height="150" rx="9" fill="${body}"/><rect x="${x - 2}" y="-16" width="24" height="16" rx="5" fill="#4e342e"/></g>`;
    return place(o, `
      <path d="M-116 -200 Q-170 -140 -146 -80 Q-120 -130 -110 -170 Z" fill="${mane}"><animateTransform attributeName="transform" type="rotate" values="0 -116 -200;8 -116 -200;0 -116 -200" dur="1.2s" repeatCount="indefinite"/></path>
      ${leg(-92, 0)}${leg(-62, 0.6)}${leg(48, 0.6)}${leg(78, 0)}
      <ellipse cx="0" cy="-190" rx="124" ry="60" fill="${body}"/>
      <path d="M70 -214 L140 -300 L184 -290 L130 -170 Z" fill="${body}"/>
      <path d="M66 -226 Q100 -300 150 -320 L140 -296 Q110 -270 92 -214 Z" fill="${mane}"/>
      <ellipse cx="146" cy="-326" rx="10" ry="20" fill="${body}" transform="rotate(-24 146 -326)"/>
      <ellipse cx="180" cy="-296" rx="58" ry="30" fill="${body}" transform="rotate(30 180 -296)"/>
      <ellipse cx="214" cy="-272" rx="24" ry="20" fill="#e6b48a" transform="rotate(30 214 -272)"/>
      <path d="M150 -320 Q170 -310 166 -290" stroke="${mane}" stroke-width="12" fill="none" stroke-linecap="round"/>
      ${eye(178, -306, 7, o)}${cheek(194, -286, 9)}<circle cx="224" cy="-270" r="3" fill="${dark}"/>
      <path d="M160 -300 L212 -262 M206 -290 L222 -282" stroke="#e53935" stroke-width="5" stroke-linecap="round"/>
      <path d="M-62 -246 Q-10 -262 42 -246 L36 -200 Q-10 -190 -56 -200 Z" fill="#a66cff"/><rect x="-62" y="-250" width="104" height="14" rx="7" fill="#ffd447"/>
      ${o.rider ? `<g transform="translate(${PONY_SADDLE[0]} ${PONY_SADDLE[1]})">${o.rider}</g>` : ""}`);
  }

  function tortoise(o = {}) {
    const shell = "#6aa84f", rim = "#4e8a3a", skin = "#b8d97c", dark = "#3f6f2c";
    const hex = [[-60, -70], [0, -100], [60, -70], [-30, -40], [30, -40], [0, -60]]
      .map(([x, y]) => `<path d="M${x - 22} ${y} l11 -18 h22 l11 18 l-11 18 h-22 Z" fill="#7fbf60" stroke="${rim}" stroke-width="3"/>`).join("");
    return place(o, `
      <ellipse cx="-90" cy="-8" rx="26" ry="16" fill="${skin}"/><ellipse cx="80" cy="-8" rx="26" ry="16" fill="${skin}"/>
      <path d="M-140 -26 L-170 -14 L-140 -10 Z" fill="${skin}"/>
      <g><animateTransform attributeName="transform" type="translate" values="0 0;16 0;16 0;0 0" keyTimes="0;0.3;0.8;1" dur="5s" repeatCount="indefinite"/>
        <path d="M110 -40 Q130 -50 150 -46" stroke="${skin}" stroke-width="30" stroke-linecap="round" fill="none"/>
        <ellipse cx="168" cy="-56" rx="38" ry="28" fill="${skin}"/>${eye(176, -66, 6, o)}${cheek(186, -48, 7)}
        <path d="M184 -40 Q196 -34 204 -44" stroke="${dark}" stroke-width="3" fill="none" stroke-linecap="round"><animate attributeName="d" values="M184 -40 Q196 -34 204 -44;M184 -40 Q196 -28 204 -44;M184 -40 Q196 -34 204 -44" dur=".6s" repeatCount="indefinite"/></path></g>
      <path d="M-140 -22 Q-128 -160 0 -164 Q128 -160 140 -22 Z" fill="${shell}"/>${hex}
      <path d="M-148 -20 Q0 0 148 -20" stroke="${rim}" stroke-width="16" stroke-linecap="round" fill="none"/>`);
  }

  function sparrow(o = {}) {
    return place(o, `<g><animateTransform attributeName="transform" type="rotate" values="0 0 -10;0 0 -10;30 0 -10;0 0 -10" keyTimes="0;0.6;0.75;1" dur="1.4s" repeatCount="indefinite"/>
      <path d="M-26 -20 L-46 -30 L-40 -14 Z" fill="#8d6e63"/><ellipse cx="0" cy="-20" rx="26" ry="18" fill="#a1887f"/><ellipse cx="4" cy="-14" rx="16" ry="10" fill="#efdcc8"/>
      <circle cx="20" cy="-38" r="14" fill="#8d6e63"/>${eye(24, -40, 3)}<path d="M33 -38 L44 -34 L33 -31 Z" fill="#ffb300"/>
      <path d="M-14 -24 Q0 -36 12 -22" stroke="#6d4c41" stroke-width="5" fill="none"/></g>
      <path d="M-4 -2 v-6 M6 -2 v-6" stroke="#ffb300" stroke-width="3"/>`);
  }

  // ---------- scenery ----------
  function pool(x, y, rx, ry, c = "#7fd0ff") {
    return `<ellipse cx="${x}" cy="${y}" rx="${rx + 14}" ry="${ry + 8}" fill="#c9b49a"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/>
      ${[0, 1].map((i) => `<ellipse cx="${x - rx / 3 + i * rx / 2}" cy="${y}" rx="40" ry="8" fill="none" stroke="#fff" stroke-width="4" opacity=".6">
        <animate attributeName="rx" values="10;70" dur="2.4s" begin="${i * 1.2}s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0" dur="2.4s" begin="${i * 1.2}s" repeatCount="indefinite"/></ellipse>`).join("")}`;
  }
  function pawPrint(x, y, s, c) {
    return `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><ellipse cx="0" cy="8" rx="16" ry="13"/><circle cx="-17" cy="-8" r="6"/><circle cx="-6" cy="-18" r="6"/><circle cx="6" cy="-18" r="6"/><circle cx="17" cy="-8" r="6"/></g>`;
  }
  // the zoo gate: two striped pillars and an arch of paw prints (no words, so it works in any language)
  function zooGate(x, y, s = 1, night = false) {
    const c1 = night ? "#3b3570" : "#ff9f43", c2 = night ? "#2a2560" : "#ffd447", arch = night ? "#2a2560" : "#2fb37a";
    const pillar = (px) => `<rect x="${px - 50}" y="-420" width="100" height="420" rx="12" fill="${c2}"/>
      ${[0, 1, 2, 3, 4].map((i) => `<rect x="${px - 50}" y="${-400 + i * 84}" width="100" height="40" fill="${c1}"/>`).join("")}
      <rect x="${px - 64}" y="-450" width="128" height="40" rx="14" fill="${c1}"/>
      ${night ? "" : `<path d="M${px} -450 V-520" stroke="#8d6e63" stroke-width="5"/><path d="M${px} -520 L${px + 50} -505 L${px} -490 Z" fill="#ff5c8a"><animate attributeName="d" values="M${px} -520 L${px + 50} -505 L${px} -490 Z;M${px} -520 L${px + 44} -512 L${px} -490 Z;M${px} -520 L${px + 50} -505 L${px} -490 Z" dur="1.2s" repeatCount="indefinite"/></path>`}`;
    const paws = night ? "" : [-210, -105, 0, 105, 210].map((px, i) => pawPrint(px, -545 + Math.abs(px) * 0.25, 1.1, ["#ff5c8a", "#a66cff", "#ffd447", "#2f9bff", "#ff8a00"][i])).join("");
    return `<g transform="translate(${x} ${y}) scale(${s})">${pillar(-300)}${pillar(300)}
      <path d="M-320 -430 Q0 -680 320 -430 L320 -380 Q0 -620 -320 -380 Z" fill="${arch}"/>
      <path d="M-300 -470 Q0 -640 300 -470" stroke="#fff" stroke-width="8" fill="none" stroke-dasharray="4 26" stroke-linecap="round" opacity=".7"/>
      ${paws}</g>`;
  }
  function barn(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-200" y="-260" width="400" height="260" fill="#e5533d"/>
      <path d="M-230 -250 L0 -420 L230 -250 Z" fill="#b83a2a"/><path d="M-200 -250 L0 -400 L200 -250" stroke="#fff" stroke-width="12" fill="none"/>
      <rect x="-80" y="-170" width="160" height="170" fill="#fff"/><rect x="-70" y="-160" width="140" height="160" fill="#b83a2a"/>
      <path d="M-70 -160 L70 0 M70 -160 L-70 0" stroke="#fff" stroke-width="10"/>
      <circle cx="0" cy="-310" r="36" fill="#fff"/><path d="M0 -290 C-40 -310 -24 -350 0 -330 C24 -350 40 -310 0 -290 Z" fill="#ff5c8a"/></g>`;
  }
  function hay(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-80" y="-80" width="160" height="80" rx="16" fill="#f4cf62"/>
      <path d="M-70 -56 H70 M-70 -28 H70" stroke="#d9a930" stroke-width="5"/><path d="M-80 -60 l-12 -8 M80 -40 l12 -10 M-40 -80 l-6 -12" stroke="#d9a930" stroke-width="4"/></g>`;
  }
  const savanna = (id) => `${outdoor(id)}${sun(1440, 130, 55)}${cloud(320, 140, 0.8)}${cloud(1000, 110, 0.6, 55)}`;

  // ---------- scenes ----------
  const SCENES = {
    cover() {
      return wrap(
        `${savanna("zc")}<path d="M0 640 Q400 600 800 640 T1600 630 V900 H0 Z" fill="#8bd17c"/>
        ${giraffe({ x: 1290, y: 700, s: 0.9, flip: true, chew: true })}${tree(160, 690, 0.8)}
        ${zooGate(800, 700, 1)}${zooPath(780)}
        ${balloon(330, 300, "#ff5c8a")}${balloon(1260, 250, "#2f9bff", 1)}
        ${who("isa", 0.82, { x: 470, y: 820, r: "wave", rAlt: { pose: "wave2", dur: 0.9 } })}
        ${who("uku", 1, { x: 640, y: 830, l: "up", r: "up", mouth: "open", anim: hop(16, 1.1) })}
        ${who("ema", 0.82, { x: 1120, y: 820, flip: true, r: "wave", rAlt: { pose: "wave2", dur: 0.9, begin: 0.3 }, blink: 2 })}
        ${who("frida", 1.15, { x: 880, y: 850, l: "out", r: "out", anim: bob(8, 2) })}
        ${sparkle(700, 330, 1.2)}${sparkle(920, 260, 1, 0.6)}${sparkle(800, 200, 0.8, 1.2)}`,
        sky("zc", "#ffc6e3", "#fff3c4"),
      );
    },

    wake: () => FRIDA_SCENES.wake(),

    family() {
      // Isa holds Uku's hand, Frida holds Ema's hand (hand positions line up for these sizes)
      return wrap(
        `${outdoor("zf")}${sun(1450, 120, 55)}${cloud(600, 130, 0.8)}${cloud(1150, 200, 0.6, 50)}
        ${castle(240, 650, 0.62)}${grass(650)}<path d="M380 900 Q700 760 1600 720 V790 Q900 800 640 900 Z" fill="#f2ddb3"/>
        ${bush(1520, 700)}${flower(150, 800, "#ff7eb6")}${flower(1450, 820, "#b56cff")}
        ${who("isa", 1, { x: 520, y: 790, r: "lowhand", l: "stand", anim: bob(6, 0.9) })}
        ${who("uku", 1, { x: 520 + 97 + 72, y: 790, l: "out", r: "up", mouth: "open", anim: hop(12, 0.9, 0.2) })}
        ${who("frida", 1, { x: 920, y: 800, r: "out", l: "wave", lAlt: { pose: "wave2", dur: 0.9 }, anim: bob(6, 0.9, 0.4) })}
        ${who("ema", 1, { x: 920 + 92 + 106, y: 800, flip: true, r: "hand", l: "hold", lItem: BAG, anim: bob(6, 0.9, 0.6), blink: 2 })}`,
        sky("zf", "#9fdcff", "#e8f8ff"),
      );
    },

    gate() {
      return wrap(
        `${outdoor("zg")}${sun(1450, 120, 50)}${cloud(260, 150, 0.7)}${cloud(1200, 210, 0.6, 50)}
        <path d="M0 640 Q400 600 800 640 T1600 630 V900 H0 Z" fill="#8bd17c"/>${tree(1450, 690, 0.8)}${bush(120, 700)}
        ${zooGate(800, 720, 1.15)}${zooPath(790)}
        ${balloon(480, 260, "#ffd447", 0.4)}${balloon(1140, 300, "#a66cff", 1.2)}
        ${who("isa", 0.9, { x: 420, y: 840, r: "out", l: "stand" })}
        ${who("uku", 1.1, { x: 620, y: 850, l: "up", r: "up", mouth: "open", anim: hop(26, 0.8) })}
        ${who("frida", 1, { x: 1000, y: 850, flip: true, r: "wave", rAlt: { pose: "wave2", dur: 0.8 }, anim: bob(6, 1.4) })}
        ${who("ema", 0.9, { x: 1190, y: 840, flip: true, r: "stand", l: "hold", lItem: BAG })}`,
        sky("zg", "#9fdcff", "#e8f8ff"),
      );
    },

    giraffe() {
      return wrap(
        `${savanna("zgi")}<path d="M0 700 Q400 660 800 700 T1600 690 V900 H0 Z" fill="#c9e07c"/>
        ${tree(1120, 720, 1.05, "#4caf50")}
        ${giraffe({ x: 700, y: 760, s: 1.05, chew: true })}
        ${fence(830)}
        ${who("isa", 0.75, { x: 150, y: 890, r: "out" })}
        ${who("frida", 0.85, { x: 300, y: 895, r: "reach", mouth: "open" })}
        ${who("uku", 0.85, { x: 410, y: 895, l: "up", r: "up", anim: hop(10, 1) })}
        ${sparkle(1000, 160, 0.8)}`,
        sky("zgi", "#9fdcff", "#fff3c4"),
      );
    },

    elephant() {
      return wrap(
        `${savanna("zel")}<path d="M0 640 Q400 600 800 640 T1600 630 V900 H0 Z" fill="#c9e07c"/>
        ${rock(160, 660, 260, 160)}${pool(420, 760, 300, 60)}
        ${elephant({ x: 600, y: 740, s: 1.05, spray: true })}
        ${who("uku", 0.95, { x: 1400, y: 860, flip: true, mouth: "open", l: "hold", r: "hold" })}
        ${who("isa", 0.85, { x: 1290, y: 860, flip: true, l: "stand", r: "out" })}
        ${who("frida", 0.95, { x: 1080, y: 870, flip: true, l: "up", r: "up", mouth: "open", anim: hop(10, 1.2) })}`,
        sky("zel", "#9fdcff", "#fff3c4"),
      );
    },

    lion() {
      return wrap(
        `${savanna("zli")}<path d="M0 560 Q400 520 800 560 T1600 550 V900 H0 Z" fill="#e3c27a"/>
        ${rock(1150, 640, 700, 220, "#c9a37a")}${bush(250, 600, 0.9)}${tree(360, 600, 0.6, "#7cb342")}
        ${lion({ x: 1070, y: 470, s: 0.95, yawn: true })}
        <rect x="0" y="660" width="1600" height="40" fill="#7fd0ff" opacity=".8"/>
        ${fence(790, -20, 1620, "#8d6e63")}
        ${who("ema", 0.85, { x: 380, y: 890, r: "pet", l: "stand" })}
        ${who("frida", 0.95, { x: 560, y: 895, r: "out", l: "stand", mouth: "open" })}
        ${who("uku", 0.95, { x: 220, y: 895, l: "hold", r: "hold" })}`,
        sky("zli", "#ffd59e", "#fff3c4"),
      );
    },

    monkeys() {
      const rope = (ax, len, deg, dur, begin, fur) => `<g>${swing(deg, ax, 130, dur, begin)}
        <path d="M${ax} 130 V${130 + len}" stroke="#b08a5a" stroke-width="7"/>${monkey({ x: ax, y: 130 + len, s: 0.8, fur, blink: begin })}</g>`;
      return wrap(
        `<rect width="1600" height="900" fill="#d6f5c9"/>
        ${[120, 420, 760, 1100, 1450].map((x, i) => `<ellipse cx="${x}" cy="${560 + (i % 2) * 40}" rx="230" ry="200" fill="${i % 2 ? "#8fd17f" : "#a3dc8f"}"/>`).join("")}
        <path d="M0 700 Q400 670 800 700 T1600 690 V900 H0 Z" fill="#7cc46b"/>
        <path d="M-20 140 Q800 80 1620 150" stroke="#8d5d3b" stroke-width="40" fill="none" stroke-linecap="round"/>
        ${[200, 520, 900, 1300].map((x) => `<ellipse cx="${x}" cy="${110}" rx="90" ry="34" fill="#4caf50"/>`).join("")}
        ${rope(420, 150, 18, 2.4, 0, "#a0693a")}${rope(820, 230, 22, 2.8, 0.6, "#8d5a2e")}${rope(1200, 120, 16, 2.2, 1.1, "#b07a46")}
        ${who("isa", 0.85, { x: 300, y: 880, r: "out", mouth: "open" })}
        ${who("frida", 1, { x: 520, y: 885, l: "up", r: "up", anim: hop(8, 1.4) })}
        ${who("uku", 1.1, { x: 720, y: 890, l: "up", r: "up", mouth: "open", lAlt: { pose: "out", dur: 0.8 }, rAlt: { pose: "out", dur: 0.8 }, anim: hop(22, 0.8) })}`,
      );
    },

    penguins() {
      const slide = `<g><animateMotion path="M640 600 Q820 640 980 720" dur="3s" repeatCount="indefinite" keyPoints="0;0;1;1" keyTimes="0;0.3;0.8;1" calcMode="linear"/>
        <g transform="rotate(-70)">${penguin({ s: 0.8 })}</g></g>
        <g transform="translate(1000 730)"><g opacity="0"><animate attributeName="opacity" values="0;0;1;0" keyTimes="0;0.78;0.84;1" dur="3s" repeatCount="indefinite"/>
          ${[-50, -20, 10, 40].map((dx, i) => `<circle cx="${dx}" cy="${-20 - (i % 2) * 30}" r="${10 + (i % 2) * 6}" fill="#fff"/>`).join("")}</g></g>`;
      const waddle = (x, y, s, b) => `<g transform="translate(${x} ${y})"><g><animateTransform attributeName="transform" type="rotate" values="-7;7;-7" dur=".9s" begin="${b}s" repeatCount="indefinite"/>${penguin({ s, blink: b })}</g></g>`;
      return wrap(
        `${outdoor("zpe")}${cloud(300, 120, 0.7)}${cloud(1100, 160, 0.6, 50)}
        <path d="M0 520 L200 380 L360 470 L520 360 L700 480 L900 400 L1100 500 L1300 380 L1600 470 V900 H0 Z" fill="#e8f4ff"/>
        <rect x="0" y="700" width="1600" height="200" fill="#5fb8f0"/>
        ${[0, 1, 2].map((i) => `<path d="M${200 + i * 480} ${770 + (i % 2) * 40} q40 -14 80 0 t80 0" stroke="#fff" stroke-width="5" fill="none" opacity=".6"/>`).join("")}
        <path d="M0 720 L0 560 Q300 520 640 590 Q800 620 1000 730 Z" fill="#f4f8ff" stroke="#cfe3f5" stroke-width="6"/>
        ${waddle(170, 580, 0.9, 0)}${waddle(320, 575, 0.85, 0.3)}${waddle(470, 585, 0.8, 0.6)}${slide}
        ${penguin({ x: 1300, y: 790, s: 0.7 })}
        ${who("frida", 1, { x: 1400, y: 890, flip: true, l: "low", r: "low", anim: `<animateTransform attributeName="transform" type="rotate" values="-6;6;-6" dur=".9s" repeatCount="indefinite"/>` })}`,
        sky("zpe", "#bfe7ff", "#f0f9ff"),
      );
    },

    zebra() {
      return wrap(
        `${savanna("zze")}<path d="M0 640 Q400 600 800 640 T1600 630 V900 H0 Z" fill="#c9e07c"/>
        ${tree(1470, 650, 0.7, "#7cb342")}
        ${zebra({ x: 1300, y: 740, s: 0.9, flip: true, graze: true, blink: 1 })}
        ${zebra({ x: 700, y: 760, s: 1.05 })}
        ${fence(820)}
        ${who("isa", 0.8, { x: 170, y: 890, r: "pet", l: "stand" })}
        ${who("uku", 1.1, { x: 340, y: 895, r: "out", rAlt: { pose: "up", dur: 0.7 }, mouth: "open", anim: bob(6, 0.7) })}`,
        sky("zze", "#9fdcff", "#fff3c4"),
      );
    },

    lunch() {
      const check = Array.from({ length: 8 }, (_, i) => `<path d="M${480 + i * 90} 700 L${440 + i * 100} 860" stroke="#fff" stroke-width="22" opacity=".7"/>`).join("");
      return wrap(
        `${outdoor("zlu")}${sun(160, 130, 55)}${cloud(700, 120, 0.8)}${cloud(1250, 180, 0.6, 50)}
        ${grass(620)}${tree(140, 680, 0.9)}${tree(1470, 690, 0.8, "#66bb6a")}
        <path d="M430 700 L1170 700 L1260 860 L340 860 Z" fill="#ff6f6f"/>${check}
        <g transform="translate(1180 720)"><path d="M-50 0 L-40 -60 H40 L50 0 Z" fill="#c58b5a"/><path d="M-36 -60 Q0 -110 36 -60" stroke="#8d5d3b" stroke-width="6" fill="none"/></g>
        ${who("ema", 0.9, { x: 520, y: 700, sit: true, r: "mouth", rItem: SANDWICH, rAlt: { pose: "hold", dur: 2 }, l: "stand" })}
        ${who("isa", 0.9, { x: 1080, y: 700, sit: true, flip: true, r: "mouth", rItem: SANDWICH, rAlt: { pose: "hold", dur: 2.4 }, l: "stand" })}
        ${who("frida", 1, { x: 690, y: 760, sit: true, r: "mouth", rItem: SANDWICH, rAlt: { pose: "hold", dur: 1.8, begin: 0.4 } })}
        ${who("uku", 1.05, { x: 930, y: 780, sit: true, flip: true, l: "up", r: "hold", rItem: SANDWICH, mouth: "open" })}
        ${sparrow({ x: 1330, y: 840, s: 1.2, anim: hop(10, 1.4) })}
        <circle cx="1270" cy="842" r="4" fill="#f6d28b"/><circle cx="1290" cy="846" r="3" fill="#f6d28b"/>`,
        sky("zlu", "#9fdcff", "#e8f8ff"),
      );
    },

    pettingzoo() {
      return wrap(
        `${outdoor("zpz")}${sun(1450, 120, 50)}${cloud(380, 140, 0.8)}${cloud(900, 100, 0.6, 50)}
        ${grass(640)}${barn(1080, 700, 0.95)}
        ${hay(760, 700, 0.8)}
        ${goat({ x: 900, y: 730, s: 0.8, flip: true, baa: true })}${rabbit({ x: 1320, y: 735, s: 0.8 })}${goat({ x: 620, y: 735, s: 0.6, fur: "#e0c29a", spots: "#a1653f", nod: true })}
        ${fence(780, 480, 1620)}
        ${zooPath(820)}
        ${who("isa", 0.9, { x: 230, y: 860, r: "out", mouth: "open", l: "stand" })}
        ${who("frida", 1, { x: 440, y: 870, r: "wave", rAlt: { pose: "wave2", dur: 0.9 }, anim: bob(6, 1.2) })}
        ${who("uku", 1.05, { x: 580, y: 880, l: "up", r: "up", anim: hop(16, 0.9) })}`,
        sky("zpz", "#9fdcff", "#e8f8ff"),
      );
    },

    goats() {
      return wrap(
        `${outdoor("zgo")}${cloud(300, 120, 0.7)}${cloud(1200, 150, 0.6, 50)}
        <rect y="560" width="1600" height="340" fill="#e7cf98"/>${barn(200, 600, 0.7)}${fence(600, 430, 1620)}
        ${hay(1350, 760, 1)}${hay(1470, 700, 0.8)}
        ${goat({ x: 1240, y: 810, s: 1, flip: true, baa: true, blink: 1 })}
        ${goat({ x: 920, y: 800, s: 1.25, nod: true, blink: 2 })}
        ${goat({ x: 480, y: 820, s: 0.65, fur: "#e0c29a", spots: "#a1653f" })}
        ${who("frida", 1.05, { x: 790, y: 830, r: "pet", rAlt: { pose: "low", dur: 1.2 }, l: "stand" })}
        ${who("ema", 0.85, { x: 300, y: 850, r: "out", l: "stand", blink: 1 })}`,
        sky("zgo", "#9fdcff", "#e8f8ff"),
      );
    },

    rabbits() {
      return wrap(
        `${room("#fbe9d0", "#e7cf98")}
        <rect x="0" y="0" width="1600" height="60" fill="#c58b5a"/>${[200, 600, 1000, 1400].map((x) => `<rect x="${x}" y="0" width="30" height="700" fill="#c58b5a"/>`).join("")}
        ${hay(1200, 780, 1.1)}${hay(500, 760, 0.7)}
        <g transform="translate(1000 820)"><path d="M0 0 L60 -8 L50 6 Z" fill="#ff8a00"/><path d="M58 -6 l14 -10 M60 -4 l16 0" stroke="#4caf50" stroke-width="4"/></g>
        ${rabbit({ x: 1310, y: 700, s: 0.9, fur: "#fff", blink: 1 })}${rabbit({ x: 1100, y: 830, s: 0.9, flip: true, fur: "#b08a6a", blink: 2 })}
        ${rabbit({ x: 800, y: 820, s: 1.35 })}
        ${who("uku", 1.15, { x: 660, y: 840, r: "pet", rAlt: { pose: "low", dur: 1.4 }, l: "stand" })}
        ${who("ema", 0.9, { x: 420, y: 860, r: "pet", l: "stand", blink: 1 })}`,
      );
    },

    pony() {
      const ps = 1.1, px = 760, py = 800;
      const rider = who("frida", 1 / ps, { sit: true, l: "hold", r: "up", anim: bob(6, 0.6) });
      // Isa walks ahead and holds the reins
      const isaX = 1190, isaY = 830, isaS = SIZE.isa * 0.9;
      const hand = [isaX - 92 * isaS, isaY - 172 * isaS];
      const mouth = [px + PONY_MOUTH[0] * ps, py + PONY_MOUTH[1] * ps];
      return wrap(
        `${outdoor("zpo")}${sun(1450, 120, 50)}${cloud(380, 140, 0.8)}${cloud(1000, 110, 0.6, 50)}
        <rect y="580" width="1600" height="320" fill="#ecd6a6"/>${fence(600)}${tree(150, 610, 0.7)}
        <g>${bob(6, 0.6)}${pony({ x: px, y: py, s: ps, rider })}</g>
        <path d="M${mouth[0]} ${mouth[1]} Q${(mouth[0] + hand[0]) / 2} ${Math.max(mouth[1], hand[1]) + 40} ${hand[0]} ${hand[1]}" stroke="#e53935" stroke-width="5" fill="none"/>
        ${who("isa", 0.9, { x: isaX, y: isaY, l: "out", r: "stand", anim: bob(5, 0.6, 0.3) })}`,
        sky("zpo", "#9fdcff", "#e8f8ff"),
      );
    },

    tortoise() {
      const lettuce = `<g transform="translate(1110 800)">${[0, 1, 2, 3].map((i) => `<path d="M${-40 + i * 18} 0 Q${-60 + i * 22} -50 ${-20 + i * 18} -60 Q${i * 14} -40 ${-10 + i * 18} 0 Z" fill="${i % 2 ? "#8bc34a" : "#aed581"}"/>`).join("")}</g>`;
      return wrap(
        `${outdoor("zto")}${cloud(400, 130, 0.7)}${cloud(1200, 150, 0.6, 50)}${grass(600, "#9ed38a")}
        ${bush(120, 640)}${bush(1500, 640, 1.1)}${rock(1350, 700, 260, 120)}
        ${flower(300, 700, "#ff7eb6", 0.8)}${flower(1050, 690, "#ffd447", 0.8)}
        ${tortoise({ x: 820, y: 800, s: 1.3 })}${lettuce}
        ${who("frida", 1, { x: 530, y: 840, r: "pet", rAlt: { pose: "low", dur: 1.6 }, l: "stand" })}
        ${who("uku", 1.1, { x: 660, y: 870, r: "pet", rAlt: { pose: "low", dur: 1.6, begin: 0.8 }, l: "stand", mouth: "open" })}`,
        sky("zto", "#9fdcff", "#e8f8ff"),
      );
    },

    handwash() {
      const tap = (x) => `<path d="M${x} 470 V430 H${x + 60} V450" stroke="#b0bec5" stroke-width="16" fill="none" stroke-linecap="round"/>
        <rect x="${x + 54}" y="452" width="12" height="190" fill="#7fd0ff" opacity=".7"><animate attributeName="opacity" values=".5;.85;.5" dur=".4s" repeatCount="indefinite"/></rect>`;
      const bubbles = Array.from({ length: 10 }, (_, i) =>
        `<circle cx="${640 + (i % 5) * 70}" cy="640" r="${8 + (i % 3) * 5}" fill="#fff" stroke="#9fd8f3" stroke-width="2">
          <animate attributeName="cy" values="640;380" dur="2.6s" begin="${i * 0.26}s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;1;0" dur="2.6s" begin="${i * 0.26}s" repeatCount="indefinite"/></circle>`).join("");
      return wrap(
        `${outdoor("zhw")}${cloud(300, 130, 0.7)}${cloud(1250, 160, 0.6, 50)}${grass(620)}${bush(120, 680)}${bush(1500, 680)}
        <rect x="540" y="470" width="520" height="40" rx="12" fill="#cfd8dc"/>
        ${tap(600)}${tap(860)}
        <path d="M560 640 H1040 L1000 740 H600 Z" fill="#eceff1"/><rect x="540" y="620" width="520" height="34" rx="14" fill="#fff" stroke="#cfd8dc" stroke-width="4"/>
        <rect x="1080" y="560" width="50" height="80" rx="10" fill="#ff8fbf"/><rect x="1094" y="536" width="22" height="26" rx="4" fill="#fff"/>
        ${who("frida", 1, { x: 640, y: 830, r: "hold", l: "hold", rAlt: { pose: "low", dur: 0.6 }, mouth: "open" })}
        <rect x="860" y="800" width="130" height="40" rx="8" fill="#ffd447"/>
        ${who("uku", 1.1, { x: 925, y: 805, flip: true, l: "hold", r: "hold", rAlt: { pose: "low", dur: 0.6, begin: 0.3 } })}
        ${who("ema", 0.85, { x: 1300, y: 840, flip: true, r: "out", l: "stand", blink: 1 })}
        ${bubbles}`,
        sky("zhw", "#9fdcff", "#e8f8ff"),
      );
    },

    icecream() {
      const ukuX = 1000, ukuY = 850, us = SIZE.uku * 1.15;
      const drip = `<g transform="translate(${ukuX} ${ukuY - 226 * us})"><ellipse cx="0" cy="0" rx="10" ry="7" fill="#ff9fc8"/>
        <ellipse cx="0" cy="8" rx="4" ry="6" fill="#ff9fc8"><animate attributeName="cy" values="8;46" dur="1.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="1.6s" repeatCount="indefinite"/></ellipse></g>`;
      const stripes = Array.from({ length: 7 }, (_, i) => `<path d="M${1180 + i * 60} 330 h60 v70 q-30 26 -60 0 Z" fill="${i % 2 ? "#fff" : "#ff8fbf"}"/>`).join("");
      return wrap(
        `${outdoor("zic")}${sun(160, 120, 50)}${cloud(640, 120, 0.7)}${grass(640)}${tree(1530, 680, 0.6)}
        <rect x="1200" y="400" width="380" height="300" fill="#fff3c4"/>${stripes}<rect x="1170" y="320" width="440" height="20" rx="10" fill="#ff5c8a"/>
        <rect x="1180" y="560" width="420" height="40" rx="10" fill="#ffd447"/>${cone("#9be3c4").replace("<g", '<g transform="translate(1300 520) scale(2)"')}
        ${zooPath(780)}
        ${who("isa", 0.88, { x: 260, y: 840, r: "mouth", rItem: cone("#8d5a32"), rAlt: { pose: "hold", dur: 2 }, mouth: "open" })}
        ${who("ema", 0.88, { x: 480, y: 840, r: "hold", rItem: cone("#fff1b8"), l: "stand", mouth: "open", blink: 1 })}
        ${who("frida", 1.05, { x: 740, y: 850, r: "mouth", rItem: cone("#c9a7ff"), rAlt: { pose: "hold", dur: 1.6 }, anim: bob(6, 1.2) })}
        ${who("uku", 1.15, { x: ukuX, y: ukuY, flip: true, r: "hold", rItem: cone("#ff9fc8"), l: "up", mouth: "open", anim: hop(8, 0.9) })}
        ${drip}`,
        sky("zic", "#9fdcff", "#fff3c4"),
      );
    },

    goinghome() {
      const isaX = 1210, isaY = 830, s = SIZE.isa * 0.95;
      // sleeping Uku, carried against Isa's chest
      const uku = who("uku", 0.95, { x: isaX - 10 * s, y: isaY - 120 * s, sit: true, flip: true, eyes: "closed", crown: false, l: "low", r: "low" });
      return wrap(
        `${outdoor("zgh")}<circle cx="1300" cy="560" r="110" fill="#ffb067" opacity=".9"/>
        <path d="M0 640 Q400 600 800 640 T1600 630 V900 H0 Z" fill="#7a9d5e"/>
        <g opacity=".85">${zooGate(280, 690, 0.7, true)}</g>
        <g opacity=".7">${giraffe({ x: 520, y: 650, s: 0.55, flip: true })}</g>
        ${zooPath(790, "#d9b98a")}
        ${who("frida", 1, { x: 700, y: 850, flip: true, r: "wave", rAlt: { pose: "wave2", dur: 0.8 }, l: "out" })}
        ${who("ema", 0.95, { x: 700 + 92 + 112, y: 840, flip: true, r: "hand", l: "hold", lItem: BAG })}
        ${who("isa", 0.95, { x: isaX, y: isaY, flip: true, l: "hold", r: "hold" })}
        ${uku}`,
        sky("zgh", "#6c5fa6", "#ffb38a"),
      );
    },

    bedtime() {
      return dreamBed([
        [170, 240, giraffe({ x: -140, y: 400, s: 0.7, chew: true })],
        [800, 170, elephant({ x: -40, y: 120, s: 0.42 })],
        [1000, 420, `${penguin({ x: -30, y: 70, s: 0.7 })}${penguin({ x: 40, y: 80, s: 0.6, blink: 1 })}`],
        [1330, 560, goat({ x: -70, y: 120, s: 0.85, baa: true })],
      ]);
    },

    end() {
      const stars = starField();
      return wrap(
        `${outdoor("zen")}${stars}<circle cx="150" cy="190" r="80" fill="#fff6c9"/><circle cx="190" cy="165" r="80" fill="url(#zen)"/>
        <g opacity=".9">${zooGate(800, 720, 1, true)}</g>
        <g opacity=".8">${giraffe({ x: 1250, y: 700, s: 0.7, flip: true, eyes: "closed" })}</g>
        <path d="M0 700 Q400 660 800 700 T1600 690 L1600 900 L0 900 Z" fill="#2a2560"/>
        ${sparkle(560, 300, 1.2)}${sparkle(1050, 200, 1, 0.6)}${sparkle(800, 160, 1.3, 1.1)}`,
        sky("zen", "#1d1b4b", "#5b4b9a"),
      );
    },
  };

  globalThis.SCENES = SCENES;
})();
