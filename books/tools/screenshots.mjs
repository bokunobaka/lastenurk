// Screenshot every page of the web book to out/shots/ (quick visual check). --v2 -> out/shots-v2/;
// --<book> for the other books (web/<book>.html -> out/shots-<book>/): --dino, --zoo, --beach, --funfair, --winter, --doctor
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const BOOKS = ["dino", "zoo", "beach", "funfair", "winter", "doctor"];
const book = BOOKS.find((b) => process.argv.includes(`--${b}`));
const v2 = !!book || process.argv.includes("--v2");
const out = path.join(root, book ? `out/shots-${book}` : v2 ? "out/shots-v2" : "out/shots");
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(pathToFileURL(path.join(root, book ? `web/${book}.html` : v2 ? "web/v2.html" : "web/index.html")).href);
const n = await page.evaluate(() => window.__book.pages);
for (let i = 0; i < n; i++) {
  await page.evaluate((i) => window.__book.go(i), i);
  const intro = await page.evaluate((i) => globalThis.MOTION?.introSeconds(i) ?? 0, i);
  await page.waitForTimeout(v2 ? 2600 + intro * 1000 : 1800);
  await page.screenshot({ path: path.join(out, `p${String(i).padStart(2, "0")}.png`) });
}
await browser.close();
console.log(errors.length ? `Errors:\n${errors.join("\n")}` : `OK: ${n} pages -> ${out}`);
