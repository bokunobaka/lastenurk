// Web book runtime: page navigation, media swap-in, narration, tap sparkles, video mode, language.
(() => {
  const { PAGES, TITLE, TITLE_EN } = globalThis.STORY;
  const ASSETS = globalThis.STORY.assets ?? ""; // per-book folder for media/ and audio/
  const SCENES = globalThis.SCENES;
  const EMBED = globalThis.EMBED; // single-file build (tools/bundle.mjs): path -> data: URL, nothing else exists
  const asset = (path) => (EMBED ? EMBED[path] : path);
  const MOTION = globalThis.MOTION; // optional v2 motion-graphics layer (motion.js)
  const OUT_DELAY = MOTION?.outDelay ?? 0.5; // seconds the old page stays under the new one

  const params = new URLSearchParams(location.search);
  const VIDEO = params.has("video"); // set by tools/record-video.mjs
  const DURS = (params.get("durs") || "").split(",").map(Number).filter(Boolean); // seconds per page

  // ---------- language: ?lang=en|et, else the choice saved by the landing page or this toggle ----------
  // Estonian is the default; pages carry `en` text, motion.js translates chapter cards and stickers.
  const LANG_KEY = "lastenurk.lang";
  const UI = {
    et: { prev: "Eelmine lehekülg", read: "Loe ette", auto: "Loe terve raamat ette", next: "Järgmine lehekülg", lang: "In English", home: "Tagasi lastenurka" },
    en: { prev: "Previous page", read: "Read aloud", auto: "Read the whole book", next: "Next page", lang: "Eesti keeles", home: "Back to the kids’ corner" },
  };
  const store = (k, v) => { try { return v === undefined ? localStorage.getItem(k) : localStorage.setItem(k, v); } catch { return null; } };
  let lang = VIDEO ? "et" : [params.get("lang"), store(LANG_KEY)].find((l) => l in UI) ?? "et";
  const textOf = (p) => (lang === "en" && p.en) || p.text;

  const $ = (id) => document.getElementById(id);
  const sceneEl = $("scene"), textEl = $("text"), dotsEl = $("dots"), fxEl = $("fx");
  const pad = (i) => String(i).padStart(2, "0");

  let page = 0;
  let autoRead = false;
  let audio = null;
  let advanceTimer = null;

  if (VIDEO) document.body.classList.add("video");

  // On the published site (/books/<name>/) a home button leads back to the landing page
  const ON_SITE = /^https?:$/.test(location.protocol) && /\/books\/[^/]+\/(index\.html)?$/.test(location.pathname);
  if (ON_SITE && !VIDEO) document.body.classList.add("has-home");

  // Estonian is read aloud only from recorded audio (the device's Estonian voice is too poor);
  // without recordings the read buttons are hidden in Estonian. English uses the device voice.
  let hasRecording = false;
  probeAudio(1).then((ok) => { hasRecording = ok; applyLang(); });
  function probeAudio(i) {
    const srcs = ["mp3", "wav"].map((ext) => asset(`${ASSETS}audio/p${pad(i)}.${ext}`)).filter(Boolean);
    return srcs.reduce((prev, src) => prev.then((ok) => ok || new Promise((res) => {
      const a = new Audio();
      a.preload = "metadata";
      a.onloadedmetadata = () => res(true);
      a.onerror = () => res(false);
      a.src = src;
    })), Promise.resolve(false));
  }

  function applyLang() {
    document.documentElement.lang = lang;
    document.body.classList.toggle("no-voice", lang === "et" && !hasRecording);
    document.title = lang === "en" ? TITLE_EN : TITLE;
    for (const id of ["prev", "read", "auto", "next", "lang", "home"]) $(id).setAttribute("aria-label", UI[lang][id]);
    $("lang").textContent = lang === "en" ? "ET" : "EN";
    $("home").href = `../../?lang=${lang}`;
  }
  function setLang(l) {
    if (l !== lang) setAuto(false);
    lang = l;
    store(LANG_KEY, l);
    applyLang();
    go(page);
  }
  applyLang();
  dotsEl.innerHTML = PAGES.map(() => "<span></span>").join("");

  // ---------- media: web/media/pNN.(mp4|webm|png|jpg|webp) replaces the SVG drawing ----------
  const mediaCache = new Map();
  function probe(src, tag) {
    return new Promise((resolve) => {
      const el = document.createElement(tag);
      const done = (ok) => resolve(ok ? el : null);
      if (tag === "video") {
        Object.assign(el, { muted: true, loop: true, playsInline: true, autoplay: true, preload: "auto" });
        el.onloadeddata = () => done(true);
      } else el.onload = () => done(true);
      el.onerror = () => done(false);
      el.src = src;
    });
  }
  async function findMedia(i) {
    if (mediaCache.has(i)) return mediaCache.get(i);
    let found = null;
    for (const [ext, tag] of [["mp4", "video"], ["webm", "video"], ["png", "img"], ["jpg", "img"], ["webp", "img"]]) {
      const src = asset(`${ASSETS}media/p${pad(i)}.${ext}`);
      if (src && (found = await probe(src, tag))) break;
    }
    const src = found && found.src;
    mediaCache.set(i, src ? { src, tag: found.tagName.toLowerCase() } : null);
    return mediaCache.get(i);
  }

  async function renderScene(i) {
    const media = await findMedia(i);
    if (i !== page) return; // user flipped again while probing
    for (const old of sceneEl.children) {
      old.classList.add("out");
      if (!VIDEO) setTimeout(() => old.remove(), OUT_DELAY * 1000); // video mode removes it in renderAt
    }
    const el = document.createElement("div");
    el.className = "page";
    if (media) {
      const m = document.createElement(media.tag);
      if (media.tag === "video") Object.assign(m, { muted: true, loop: true, playsInline: true, autoplay: true });
      m.src = media.src;
      el.append(m);
    } else {
      el.innerHTML = SCENES[PAGES[i].scene]();
      el.querySelector("svg")?.setCurrentTime?.(0);
    }
    sceneEl.append(el);
    MOTION?.onScene(i, el, { dur: (DURS[i] || 12) * 1000 });
  }

  function renderText(i) {
    const p = PAGES[i];
    const isTitle = p.scene === "cover" || p.scene === "end";
    textEl.className = isTitle ? "title" : "";
    // Wrap words so speech-synthesis word boundaries can highlight them
    let pos = 0, n = 0;
    textEl.innerHTML = textOf(p)
      .split(/(\s+)/)
      .map((tok) => {
        const start = pos;
        pos += tok.length;
        return /\s/.test(tok) ? tok : `<span class="w" data-at="${start}" style="--i:${n++}">${tok}</span>`;
      })
      .join("");
    MOTION?.onText(i, textEl);
    // restart entrance animation
    textEl.style.animation = "none";
    void textEl.offsetWidth;
    textEl.style.animation = "";
  }

  function go(i) {
    if (i < 0 || i >= PAGES.length) return;
    stopNarration();
    page = i;
    [...dotsEl.children].forEach((d, k) => d.classList.toggle("on", k === i));
    renderScene(i);
    renderText(i);
    if (!VIDEO && autoRead) setTimeout(() => page === i && narrate(), 900 + (MOTION?.introSeconds(i) ?? 0) * 1000);
  }

  // ---------- narration: Estonian from web/audio/pNN.(mp3|wav), English from the browser's voice ----------
  function stopNarration() {
    clearTimeout(advanceTimer);
    if (audio) { audio.pause(); audio = null; }
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    $("read").classList.remove("on");
  }

  function finished(i) {
    $("read").classList.remove("on");
    textEl.querySelectorAll(".w.on").forEach((w) => w.classList.remove("on"));
    if (autoRead && i === page && page < PAGES.length - 1) advanceTimer = setTimeout(() => go(page + 1), 1500);
    else if (page === PAGES.length - 1) setAuto(false);
  }

  async function narrate() {
    stopNarration();
    const i = page;
    $("read").classList.add("on");
    for (const ext of lang === "et" ? ["mp3", "wav"] : []) { // recorded narration is Estonian
      const src = asset(`${ASSETS}audio/p${pad(i)}.${ext}`);
      if (!src) continue;
      const a = new Audio(src);
      const ok = await new Promise((res) => { a.oncanplaythrough = () => res(true); a.onerror = () => res(false); });
      if (i !== page) return;
      if (ok) {
        audio = a;
        a.onended = () => finished(i);
        a.play().catch(() => finished(i));
        return;
      }
    }
    if (lang === "en") speakFallback(i);
    else finished(i);
  }

  function speakFallback(i) {
    if (!("speechSynthesis" in window)) return finished(i);
    const u = new SpeechSynthesisUtterance(textOf(PAGES[i]));
    u.lang = "en-GB";
    u.rate = 0.85;
    const voices = speechSynthesis.getVoices();
    const voice = voices.find((v) => v.lang.replace("_", "-") === u.lang) ?? voices.find((v) => v.lang.toLowerCase().startsWith("en"));
    if (voice) u.voice = voice;
    u.onboundary = (e) => {
      textEl.querySelectorAll(".w").forEach((w) => w.classList.toggle("on", +w.dataset.at <= e.charIndex && e.charIndex < +w.dataset.at + w.textContent.length));
    };
    u.onend = () => finished(i);
    u.onerror = () => finished(i);
    speechSynthesis.speak(u);
  }

  function setAuto(on) {
    autoRead = on;
    $("auto").classList.toggle("on", on);
    $("auto").textContent = on ? "⏸" : "▶";
    if (on) narrate();
    else stopNarration();
  }

  // ---------- video mode: the recorder steps time frame by frame ----------
  // Every animation (SVG SMIL, CSS, video clips) is paused and set to the exact frame time,
  // so the picture stays in sync with the narration no matter how slow screenshots are.
  const starts = DURS.reduce((acc, d, k) => (acc.push(k ? acc[k - 1] + DURS[k - 1] : 0), acc), []);
  async function renderAt(t) {
    let i = 0;
    while (i + 1 < starts.length && t >= starts[i + 1]) i++;
    if (i !== page || !sceneEl.children.length) {
      page = i;
      await renderScene(i);
      renderText(i);
    }
    const local = t - starts[i];
    if (local > OUT_DELAY + 0.1) sceneEl.querySelectorAll(".out").forEach((el) => el.remove());
    sceneEl.querySelectorAll(".page:not(.out) svg").forEach((svg) => {
      svg.pauseAnimations();
      svg.setCurrentTime(local);
    });
    sceneEl.querySelectorAll(".out svg").forEach((svg) => svg.pauseAnimations()); // freeze while fading out
    for (const v of sceneEl.querySelectorAll("video")) {
      v.pause();
      const target = v.duration ? local % v.duration : 0;
      if (Math.abs(v.currentTime - target) > 0.01) {
        await new Promise((res) => { v.onseeked = res; v.currentTime = target; });
      }
    }
    for (const a of document.getAnimations()) {
      a.pause();
      if (a.effect?.target?.closest?.(".out")) continue; // outgoing page stays frozen under the transition
      a.currentTime = local * 1000;
    }
  }

  // ---------- input ----------
  $("prev").onclick = () => go(page - 1);
  $("next").onclick = () => go(page + 1);
  $("read").onclick = () => narrate();
  $("auto").onclick = () => setAuto(!autoRead);
  $("lang").onclick = () => setLang(lang === "en" ? "et" : "en");

  addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === " ") go(page + 1);
    if (e.key === "ArrowLeft") go(page - 1);
  });

  let touchX = null;
  $("stage").addEventListener("pointerdown", (e) => { touchX = e.clientX; });
  $("stage").addEventListener("pointerup", (e) => {
    if (e.target.closest("button, a")) return;
    const dx = e.clientX - (touchX ?? e.clientX);
    if (Math.abs(dx) > 60) go(page + (dx < 0 ? 1 : -1));
    else burst(e);
  });

  // tap anywhere on the picture: sparkles
  function burst(e) {
    const r = $("stage").getBoundingClientRect();
    const icons = ["✨", "⭐", "💖", "💜", "💛"];
    for (let k = 0; k < 7; k++) {
      const s = document.createElement("span");
      s.className = "burst";
      s.textContent = icons[k % icons.length];
      const a = (k / 7) * Math.PI * 2;
      s.style.left = `${e.clientX - r.left}px`;
      s.style.top = `${e.clientY - r.top}px`;
      s.style.setProperty("--dx", `${Math.cos(a) * 90}px`);
      s.style.setProperty("--dy", `${Math.sin(a) * 90}px`);
      fxEl.append(s);
      setTimeout(() => s.remove(), 950);
    }
  }

  window.__book = { go, pages: PAGES.length };
  if (VIDEO) {
    page = -1;
    window.__renderAt = renderAt;
    window.__videoTotal = starts.at(-1) + DURS.at(-1);
  } else go(0);
})();
