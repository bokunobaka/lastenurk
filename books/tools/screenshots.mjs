// Screenshot every page of the web book to out/shots/ (quick visual check). --v2 -> out/shots-v2/, --dino -> out/shots-dino/, --zoo -> out/shots-zoo/
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dino = process.argv.includes("--dino");
const zoo = process.argv.includes("--zoo");
const v2 = dino || zoo || process.argv.includes("--v2");
const out = path.join(root, dino ? "out/shots-dino" : zoo ? "out/shots-zoo" : v2 ? "out/shots-v2" : "out/shots");
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(pathToFileURL(path.join(root, dino ? "web/dino.html" : zoo ? "web/zoo.html" : v2 ? "web/v2.html" : "web/index.html")).href);
const n = await page.evaluate(() => window.__book.pages);
for (let i = 0; i < n; i++) {
  await page.evaluate((i) => window.__book.go(i), i);
  const intro = await page.evaluate((i) => globalThis.MOTION?.introSeconds(i) ?? 0, i);
  await page.waitForTimeout(v2 ? 2600 + intro * 1000 : 1800);
  await page.screenshot({ path: path.join(out, `p${String(i).padStart(2, "0")}.png`) });
}
await browser.close();
console.log(errors.length ? `Errors:\n${errors.join("\n")}` : `OK: ${n} pages -> ${out}`);
