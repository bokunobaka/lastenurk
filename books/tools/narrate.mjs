// Generate Estonian narration with Neurokõne (TartuNLP, University of Tartu) -> web/audio/pNN.wav
//
//   node tools/narrate.mjs                  # voice "mari", skip pages that already have audio
//   node tools/narrate.mjs --speaker liivika --speed 0.9 --force
//   node tools/narrate.mjs --dino           # dinosaur book -> web/dino/audio/
//
// Voices (est): albert, indrek, kalev, kylli, lee, liivika, luukas, mari, meelis, peeter, tambet, vesta
// Your own recordings work too: save them as web/audio/pNN.mp3 (or .wav) and skip this script.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const opt = (name, def) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : def);
const speaker = opt("speaker", "mari");
const speed = Number(opt("speed", "0.9"));
const force = args.includes("--force");
const dino = args.includes("--dino");
const API = "https://api.tartunlp.ai/text-to-speech/v2";

const ctx = {};
vm.runInNewContext(readFileSync(path.join(root, dino ? "web/dino-story.js" : "web/story.js"), "utf8"), { globalThis: ctx });
const { PAGES } = ctx.STORY;

const outDir = path.join(root, dino ? "web/dino/audio" : "web/audio");
mkdirSync(outDir, { recursive: true });

async function tts(text) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, speaker, speed }),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    console.warn(`  attempt ${attempt}: HTTP ${res.status} ${(await res.text()).slice(0, 80)}`);
    await new Promise((r) => setTimeout(r, 2000 * attempt));
  }
  throw new Error("TartuNLP TTS failed — the service may be down, try again later.");
}

for (const [i, p] of PAGES.entries()) {
  const file = path.join(outDir, `p${String(i).padStart(2, "0")}.wav`);
  if (!force && (existsSync(file) || existsSync(file.replace(/wav$/, "mp3")))) {
    console.log(`p${i}: exists, skipping`);
    continue;
  }
  // Read the cover title as a sentence; quotes confuse some voices
  const text = p.text.replace(/[„”“"]/g, "");
  console.log(`p${i}: ${text.slice(0, 60)}…`);
  writeFileSync(file, await tts(text));
}
console.log(`Done -> ${outDir}`);
