// Render the web book as an MP4 video with narration.
//
//   node tools/record-video.mjs                    # -> out/printsess-frida.mp4 (1080p, 30 fps)
//   node tools/record-video.mjs --music music.mp3  # optional quiet background music
//   node tools/record-video.mjs --fps 24 --preview # faster test render (720p)
//   node tools/record-video.mjs --v2               # motion-graphics version -> out/printsess-frida-v2.mp4
//   node tools/record-video.mjs --dino             # dinosaur book -> out/rexi-paev.mp4
//
// Page timing = narration length + 2 s (or an estimate when a page has no audio yet).
// Frames are rendered one by one at exact timestamps, then ffmpeg adds each page's
// narration at the moment that page appears, so sound and picture never drift.
import { chromium } from "playwright";
import ffmpeg from "ffmpeg-static";
import { execFileSync, spawn } from "node:child_process";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const opt = (name, def) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : def);
const music = opt("music") ? path.resolve(opt("music")) : null;
const preview = args.includes("--preview");
const dino = args.includes("--dino");
const v2 = dino || args.includes("--v2");
const FPS = Number(opt("fps", "30"));
const [W, H] = preview ? [1280, 720] : [1920, 1080];
const outFile = path.resolve(opt("out", path.join(root, dino ? "out/rexi-paev.mp4" : v2 ? "out/printsess-frida-v2.mp4" : "out/printsess-frida.mp4")));
mkdirSync(path.dirname(outFile), { recursive: true });

const ctx = {};
vm.runInNewContext(readFileSync(path.join(root, dino ? "web/dino-story.js" : "web/story.js"), "utf8"), { globalThis: ctx });
const { PAGES, CHAPTER_CARD } = ctx.STORY;

// ---- page durations ----
function audioFile(i) {
  for (const ext of ["wav", "mp3"]) {
    const f = path.join(root, `web/${dino ? "dino/" : ""}audio/p${String(i).padStart(2, "0")}.${ext}`);
    if (existsSync(f)) return f;
  }
  return null;
}
function probeDuration(file) {
  try {
    execFileSync(ffmpeg, ["-i", file], { stdio: "pipe" });
  } catch (e) {
    const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(String(e.stderr));
    if (m) return +m[1] * 3600 + +m[2] * 60 + +m[3];
  }
  throw new Error(`Cannot read duration of ${file}`);
}
const LEAD_IN = 0.9; // text appears, then narration starts
const pages = PAGES.map((p, i) => {
  const audio = audioFile(i);
  const spoken = audio ? probeDuration(audio) : p.text.split(/\s+/).length * 0.55;
  const min = i === 0 || i === PAGES.length - 1 ? 4 : 5;
  const intro = v2 && p.chapter ? CHAPTER_CARD : 0; // v2 chapter card plays before the page text
  return { audio, intro, dur: Math.round((intro + Math.max(min, LEAD_IN + spoken + 1.5)) * 10) / 10 };
});
const total = pages.reduce((s, p) => s + p.dur, 0);
const frames = Math.round(total * FPS);
console.log(`${pages.length} pages, ${total.toFixed(1)} s, ${frames} frames, narration on ${pages.filter((p) => p.audio).length} pages`);

// ---- ffmpeg: frames from stdin + narration ----
const inputs = ["-f", "image2pipe", "-framerate", String(FPS), "-i", "-"];
const filters = [];
const mixes = [];
let t = 0, n = 1;
for (const p of pages) {
  if (p.audio) {
    inputs.push("-i", p.audio);
    const ms = Math.round((t + p.intro + LEAD_IN) * 1000);
    filters.push(`[${n}:a]adelay=${ms}|${ms},aformat=channel_layouts=stereo[a${n}]`);
    mixes.push(`[a${n}]`);
    n++;
  }
  t += p.dur;
}
if (music) {
  inputs.push("-stream_loop", "-1", "-i", music);
  filters.push(`[${n}:a]volume=0.12,aformat=channel_layouts=stereo,afade=t=out:st=${total - 3}:d=3[a${n}]`);
  mixes.push(`[a${n}]`);
}
const cmd = ["-y", "-loglevel", "error", ...inputs];
if (mixes.length) {
  filters.push(`${mixes.join("")}amix=inputs=${mixes.length}:normalize=0[aout]`);
  cmd.push("-filter_complex", filters.join(";"), "-map", "0:v", "-map", "[aout]", "-c:a", "aac", "-b:a", "192k");
}
cmd.push("-t", total.toFixed(2), "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", outFile);
const enc = spawn(ffmpeg, cmd, { stdio: ["pipe", "inherit", "inherit"] });
const encDone = new Promise((res, rej) => enc.on("close", (code) => (code ? rej(new Error(`ffmpeg exited ${code}`)) : res())));

// ---- render frames ----
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on("pageerror", (e) => console.error("page error:", e.message));
await page.goto(`${pathToFileURL(path.join(root, dino ? "web/dino.html" : v2 ? "web/v2.html" : "web/index.html")).href}?video=1&durs=${pages.map((p) => p.dur).join(",")}`);
await page.evaluate(() => document.fonts.ready);

const started = Date.now();
for (let f = 0; f < frames; f++) {
  await page.evaluate((s) => window.__renderAt(s), f / FPS);
  const buf = await page.screenshot({ type: "jpeg", quality: 92 });
  if (!enc.stdin.write(buf)) await new Promise((r) => enc.stdin.once("drain", r));
  if (f % (FPS * 10) === 0) {
    const pct = ((f / frames) * 100).toFixed(0);
    const eta = f ? (((Date.now() - started) / f) * (frames - f)) / 1000 : 0;
    process.stdout.write(`\r  ${pct}%  ~${eta.toFixed(0)} s left   `);
  }
}
enc.stdin.end();
await browser.close();
await encDone;
console.log(`\nVideo -> ${outFile}`);
