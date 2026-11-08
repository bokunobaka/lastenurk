// v2 motion-graphics layer, loaded only by v2.html. Hooks into book.js via globalThis.MOTION.
// Everything is CSS / Web Animations with fixed delays, so video mode can scrub it frame-exactly.
(() => {
  const { PAGES, CHAPTER_CARD } = globalThis.STORY;
  const $ = (id) => document.getElementById(id);

  // Camera move per scene: [scale, focusX%, focusY%] from -> to, over the whole page.
  const CAMERA = {
    cover: [[1.18, 50, 60], [1, 50, 50]],
    wake: [[1, 50, 50], [1.14, 30, 45]],
    teeth: [[1.14, 50, 55], [1.02, 50, 50]],
    dress: [[1, 50, 50], [1.16, 50, 40]],
    read: [[1.04, 40, 50], [1.18, 45, 42]],
    friends: [[1.12, 12, 60], [1.12, 78, 60]],
    ball: [[1.12, 15, 50], [1.12, 85, 50]],
    slide: [[1.16, 22, 28], [1.12, 72, 78]],
    bouncy: [[1, 50, 50], [1.14, 50, 42]],
    plums: [[1.16, 50, 20], [1.02, 50, 60]],
    goodbye: [[1, 50, 60], [1.16, 50, 42]],
    lunch: [[1.14, 50, 55], [1.02, 50, 50]],
    pajamas: [[1, 50, 50], [1.14, 50, 42]],
    nap: [[1.14, 28, 72], [1, 50, 50]],
    ready: [[1.14, 50, 62], [1, 50, 50]],
    wands: [[1.12, 15, 68], [1.12, 55, 38]],
    dragonwake: [[1.2, 45, 40], [1, 50, 50]],
    dragonslide: [[1.16, 18, 32], [1.16, 92, 78]],
    afternoon: [[1, 50, 50], [1.12, 62, 50]],
    dragonsleep: [[1, 50, 50], [1.16, 42, 55]],
    dinner: [[1.14, 50, 55], [1.02, 50, 50]],
    bedtime: [[1, 50, 50], [1.16, 50, 42]],
    night: [[1, 50, 50], [1.22, 26, 72]],
    end: [[1.22, 50, 30], [1, 50, 50]],
  };

  const PARTICLES = {
    cover: "glitter", wake: "bokeh", teeth: "bubble", dress: "glitter", read: "bokeh",
    friends: "petal", ball: "petal", slide: "petal", bouncy: "confetti", plums: "leaf",
    goodbye: "petal", lunch: "bokeh", pajamas: "bokeh", nap: "star", ready: "glitter",
    wands: "glitter", dragonwake: "confetti", dragonslide: "confetti", afternoon: "bokeh",
    dragonsleep: "firefly", dinner: "bokeh", bedtime: "star", night: "star", end: "star",
  };

  // Comic-style sound stickers: [text, colour, left%, top%]
  const STICKERS = {
    ball: [["HOPP!", "#ff5c8a", 70, 18]],
    slide: [["VIUH!", "#2f9bff", 62, 30], ["VIUH!", "#8e44ff", 78, 48]],
    bouncy: [["HOPP!", "#ff8a00", 24, 22], ["HOPP!", "#ff5c8a", 52, 14], ["HOPP!", "#8e44ff", 76, 24]],
    plums: [["AMPS!", "#8e44ff", 76, 22]],
    wands: [["ÜKS!", "#ff5c8a", 62, 14], ["KAKS!", "#8e44ff", 74, 26], ["KOLM!", "#ff8a00", 86, 14]],
    dragonwake: [["TERE!", "#2fb37a", 22, 20]],
    dragonslide: [["VIUH!", "#2f9bff", 66, 22]],
    dragonsleep: [["Z-z-z…", "#6c5fa6", 40, 18]],
    wake: [["TERE HOMMIKUST!", "#ff8a00", 66, 16]],
  };
  // Words highlighted in the text: these everywhere, plus the words of the page's own stickers
  const SOUND_WORDS = ["viuh", "hopp", "hopp-hopp-hopp", "amps", "kõrgele-kõrgele", "whoosh", "hop", "hop-hop-hop", "chomp"];
  // Sticker words in English (both books)
  const STICKER_EN = {
    "HOPP!": "HOP!", "VIUH!": "WHOOSH!", "AMPS!": "CHOMP!", "AMPS-AMPS!": "CHOMP-CHOMP!", "ÜKS!": "ONE!", "KAKS!": "TWO!", "KOLM!": "THREE!",
    "TERE!": "HELLO!", "TERE HOMMIKUST!": "GOOD MORNING!", "PÕMM!": "BOOM!", "LIRTS!": "SPLISH!", "LÄRTS!": "SPLASH!",
    "LEIDSIN!": "FOUND YOU!", "KRÕMPS!": "CRUNCH!", "KRÕMPS-KRÕMPS!": "CRUNCH-CRUNCH!", "TRAMPSTI!": "STOMP!", "LÜRPS!": "SLURP!",
    "PRITSTI!": "SPLASH!", "UU-AA!": "OO-AA!", "NOKK-NOKK!": "PECK-PECK!", "MÄÄ!": "BAA!", "KOPP-KOPP!": "CLIP-CLOP!",
    "SULPSTI!": "SPLOSH!", "NÄMM!": "YUM!",
  };
  const english = () => document.documentElement.lang === "en"; // set by book.js
  const bare = (w) => w.toLowerCase().replace(/[^\p{L}-]/gu, "");

  const TRANSITIONS = ["iris", "star", "wipe", "push"];
  const PALETTE = ["#ff5c8a", "#a66cff", "#ffb000", "#2f9bff", "#2fb37a"];
  const CARD_COLORS = { sun: "#ffb54d", ball: "#ff6f9f", bowl: "#5fc3a0", dragon: "#8e6cff", longneck: "#f0a83c", paw: "#ff8a65", moon: "#3b3570" };

  // Pages may carry their own camera / particles / stickers (other books); else the tables above
  const stickerList = (i) => (PAGES[i].stickers || STICKERS[PAGES[i].scene] || [])
    .map(([text, ...rest]) => [english() ? STICKER_EN[text] ?? text : text, ...rest]);
  const intro = (i) => (PAGES[i].chapter ? CHAPTER_CARD : 0);

  // deterministic random per page, so the video and the book always match
  function rng(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function camera(i, el, dur) {
    const target = el.firstElementChild;
    const [[s0, x0, y0], [s1, x1, y1]] = PAGES[i].camera || CAMERA[PAGES[i].scene] || [[1, 50, 50], [1.08, 50, 50]];
    target.animate(
      [
        { transform: `scale(${s0})`, transformOrigin: `${x0}% ${y0}%` },
        { transform: `scale(${s1})`, transformOrigin: `${x1}% ${y1}%` },
      ],
      { duration: dur, easing: "cubic-bezier(.45,0,.55,1)", fill: "both" },
    );
  }

  function particles(i, el) {
    const kind = PAGES[i].particles || PARTICLES[PAGES[i].scene];
    if (!kind) return;
    const r = rng(i * 7919 + 1);
    const count = { star: 26, glitter: 22, firefly: 16, bubble: 14, bokeh: 14 }[kind] ?? 22;
    const box = document.createElement("div");
    box.className = `particles ${kind}`;
    for (let k = 0; k < count; k++) {
      const p = document.createElement("i");
      const dur = 5 + r() * 7;
      p.style.cssText = `left:${(r() * 100).toFixed(1)}%;top:${(r() * 100).toFixed(1)}%;--s:${(0.6 + r() * 0.9).toFixed(2)};` +
        `--dur:${dur.toFixed(2)}s;--delay:${(-r() * dur).toFixed(2)}s;--drift:${((r() - 0.5) * 16).toFixed(1)}cqw;` +
        `--rot:${Math.round(r() * 720 - 360)}deg;--c:${PALETTE[k % PALETTE.length]}`;
      box.append(p);
    }
    el.append(box);
  }

  function chapterCard(i, layer) {
    const ch = PAGES[i].chapter;
    if (!ch) return;
    const card = document.createElement("div");
    card.className = "card";
    card.style.setProperty("--bg", CARD_COLORS[ch.icon] || "#ff6f9f");
    card.style.setProperty("--life", `${CHAPTER_CARD}s`);
    const letters = [...((english() && ch.en) || ch.title)].map((c, k) => `<span style="--c:${k}">${c === " " ? "&nbsp;" : c}</span>`).join("");
    card.innerHTML = `<div class="rings"><i></i><i></i><i></i><i></i></div>
      <div class="icon">${ICONS[ch.icon] || ""}</div><h2>${letters}</h2>`;
    layer.append(card);
  }

  function stickers(i, layer) {
    const list = stickerList(i);
    const t0 = intro(i) + 1.6;
    list.forEach(([text, color, x, y], k) => {
      const s = document.createElement("div");
      s.className = "sticker";
      s.style.cssText = `left:${x}%;top:${y}%;--col:${color};--at:${(t0 + k * 0.8).toFixed(2)}s;--tilt:${k % 2 ? 7 : -8}deg`;
      s.innerHTML = `<svg viewBox="-100 -100 200 200"><polygon points="${burst()}" /></svg><b${text.length > 8 ? ' class="long"' : ""}>${text}</b>`;
      layer.append(s);
    });
  }

  function burst() {
    return Array.from({ length: 24 }, (_, k) => {
      const a = (k / 24) * Math.PI * 2, rr = k % 2 ? 62 : 92;
      return `${(Math.cos(a) * rr * 1.25).toFixed(1)},${(Math.sin(a) * rr * 0.8).toFixed(1)}`;
    }).join(" ");
  }

  let lastProgress = 0;
  function progress(i) {
    const pct = (i / (PAGES.length - 1)) * 100;
    const from = lastProgress;
    lastProgress = pct;
    const opts = { duration: 900, delay: 300, easing: "cubic-bezier(.3,1.4,.5,1)", fill: "both" };
    $("prog-crown").animate([{ left: `${from}%` }, { left: `${pct}%` }], opts);
    $("prog-fill").animate([{ width: `${from}%` }, { width: `${pct}%` }], opts);
  }

  const ICONS = {
    sun: `<svg viewBox="-60 -60 120 120"><g class="spin">${Array.from({ length: 10 }, (_, k) => `<rect x="-5" y="-56" width="10" height="20" rx="5" fill="#fff" transform="rotate(${k * 36})"/>`).join("")}</g><circle r="30" fill="#fff"/></svg>`,
    ball: `<svg viewBox="-60 -60 120 120"><g class="spin"><circle r="44" fill="#fff"/><path d="M-44 0 A44 44 0 0 0 44 0 Z" fill="#ffe14d"/><path d="M0 -44 V44" stroke="#ff6f9f" stroke-width="8"/></g></svg>`,
    bowl: `<svg viewBox="-60 -60 120 120"><path d="M-46 -4 Q0 60 46 -4 Z" fill="#fff"/><path class="steam" d="M-14 -16 q-10 -14 0 -28 q10 -14 0 -28 M14 -16 q-10 -14 0 -28 q10 -14 0 -28" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/></svg>`,
    dragon: `<svg viewBox="-80 -70 160 140"><path d="M-10 -30 L0 -64 L14 -30 Z M24 -30 L44 -60 L46 -24 Z" fill="#ffe14d"/><ellipse cx="10" cy="0" rx="52" ry="40" fill="#fff"/><ellipse cx="-34" cy="12" rx="40" ry="28" fill="#fff"/><circle cx="2" cy="-8" r="9" fill="#3b3570"/><path d="M-66 18 Q-44 32 -22 22" stroke="#3b3570" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`,
    longneck: `<svg viewBox="-80 -80 160 160"><path d="M-60 50 Q-60 0 0 0 Q40 0 40 -40 L40 -60 Q40 -76 56 -76 Q72 -76 72 -60 Q72 -50 60 -48 L60 -30 Q60 20 30 34 Q10 50 -10 50 Z" fill="#fff"/><circle cx="58" cy="-64" r="5" fill="#3b3570"/><ellipse cx="-20" cy="56" rx="50" ry="8" fill="#fff" opacity=".4"/></svg>`,
    paw: `<svg viewBox="-60 -60 120 120"><g transform="rotate(-12)"><ellipse cx="0" cy="14" rx="30" ry="26" fill="#fff"/>
      <ellipse cx="-34" cy="-14" rx="11" ry="14" fill="#fff"/><ellipse cx="-13" cy="-34" rx="11" ry="14" fill="#fff"/>
      <ellipse cx="13" cy="-34" rx="11" ry="14" fill="#fff"/><ellipse cx="34" cy="-14" rx="11" ry="14" fill="#fff"/></g></svg>`,
    moon: `<svg viewBox="-60 -60 120 120"><circle r="40" fill="#fff6c9"/><circle cx="18" cy="-12" r="36" fill="var(--bg)"/><g class="twinkle"><circle cx="34" cy="30" r="4" fill="#fff"/><circle cx="-40" cy="-36" r="3" fill="#fff"/></g></svg>`,
  };

  globalThis.MOTION = {
    outDelay: 1.0,
    introSeconds: intro,

    onScene(i, el, { dur }) {
      el.classList.add(`tr-${i === 0 ? "iris" : TRANSITIONS[i % TRANSITIONS.length]}`);
      camera(i, el, dur);
      particles(i, el);
      const layer = $("mg");
      layer.replaceChildren();
      chapterCard(i, layer);
      stickers(i, layer);
      progress(i);
    },

    onText(i, textEl) {
      textEl.style.setProperty("--t0", `${(intro(i) + 0.45).toFixed(2)}s`);
      const title = textEl.classList.contains("title");
      let c = 0;
      const sounds = new Set([...SOUND_WORDS, ...stickerList(i).flatMap(([t]) => t.split(" ").map(bare))]);
      textEl.querySelectorAll(".w").forEach((w) => {
        if (title) {
          w.innerHTML = [...w.textContent].map((ch) => `<span class="ch" style="--c:${c++}">${ch}</span>`).join("");
        } else if (sounds.has(bare(w.textContent))) {
          w.classList.add("snd");
        }
      });
    },
  };
})();
