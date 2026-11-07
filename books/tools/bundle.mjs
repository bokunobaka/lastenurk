// Builds shareable single-file books: every script, stylesheet, the font, and any
// media/ + audio/ files are inlined into one .html that opens anywhere, offline.
//   node tools/bundle.mjs            -> dist/printsess-frida.html, dist/rexi-paev.html
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";

const WEB = new URL("../web/", import.meta.url).pathname;
const DIST = new URL("../dist/", import.meta.url).pathname;
const FONT_CSS = "https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&display=swap";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36";
const MIME = { ".mp4": "video/mp4", ".webm": "video/webm", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".mp3": "audio/mpeg", ".wav": "audio/wav" };

const BOOKS = [
  { html: "v2.html", out: "printsess-frida.html", assets: "" },
  { html: "dino.html", out: "rexi-paev.html", assets: "dino/" },
];

const dataUrl = (buf, mime) => `data:${mime};base64,${Buffer.from(buf).toString("base64")}`;
const safeScript = (js) => js.replace(/<\/script/gi, "<\\/script");

// Latin + latin-ext subsets of Baloo 2 (covers õ ä ö ü š ž), embedded as data: URLs
async function fontCss() {
  const css = await (await fetch(FONT_CSS, { headers: { "User-Agent": UA } })).text();
  let out = "";
  for (const block of css.match(/\/\* (latin|latin-ext) \*\/\s*@font-face\s*{[^}]*}/g) ?? []) {
    const url = block.match(/url\((https:[^)]+)\)/)[1];
    const buf = await (await fetch(url)).arrayBuffer();
    out += block.replace(url, dataUrl(buf, "font/woff2")) + "\n";
  }
  return out;
}

async function embedAssets(prefix) {
  const map = {};
  for (const dir of ["media", "audio"]) {
    const files = await readdir(join(WEB, prefix, dir)).catch(() => []);
    for (const f of files) {
      const mime = MIME[extname(f)];
      if (mime) map[`${prefix}${dir}/${f}`] = dataUrl(await readFile(join(WEB, prefix, dir, f)), mime);
    }
  }
  return map;
}

await mkdir(DIST, { recursive: true });
const font = await fontCss().catch((e) => (console.warn("font not embedded:", e.message), ""));

for (const book of BOOKS) {
  let html = await readFile(join(WEB, book.html), "utf8");
  html = html.replace(/\s*<link rel="preconnect"[^>]*>/, "");
  html = html.replace(/<link href="https:\/\/fonts[^>]*>/, font ? `<style>\n${font}</style>` : "$&");

  const css = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)" \/>/g)];
  for (const [tag] of css) html = html.replace(tag, () => "");
  const styles = await Promise.all(css.map(([, href]) => readFile(join(WEB, href), "utf8")));
  html = html.replace("</head>", () => `<style>\n${styles.join("\n")}</style>\n</head>`);

  const embed = await embedAssets(book.assets);
  const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)];
  for (const [i, [tag, src]] of scripts.entries()) {
    const js = await readFile(join(WEB, src), "utf8");
    const pre = i === 0 ? `globalThis.EMBED = ${JSON.stringify(embed)};\n` : "";
    html = html.replace(tag, () => `<script>\n${safeScript(pre + js)}</script>`);
  }

  await writeFile(join(DIST, book.out), html);
  const n = Object.keys(embed).length;
  console.log(`dist/${book.out}  ${(html.length / 1024).toFixed(0)} KB${n ? `, ${n} media/audio files` : ""}`);
}
