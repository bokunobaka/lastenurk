// Draws every picture (shadow, then finished with details) into gallery.png, for checking by eye.
// Uses the Playwright installed in ../../books (npm i && npx playwright install chromium there).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { levels } from '../src/levels.js';
import * as A from '../src/art.js';

const out = process.argv[2] || 'gallery.png';
const cards = levels
  .map(
    (lv) => `<figure><div>${A.svg(A.shadow(lv.pieces, lv.outline), A.viewBox(lv))}${A.svg(A.picture(lv), A.viewBox(lv))}</div>
      <figcaption>${lv.index + 1}. ${lv.id}</figcaption></figure>`
  )
  .join('');
const css = fs.readFileSync(new URL('../src/style.css', import.meta.url), 'utf8').match(/\/\* anim:start \*\/[\s\S]*\/\* anim:end \*\//)?.[0] || '';
const html = `<!doctype html><style>body{margin:0;font:700 18px sans-serif;background:#fff4e0;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:10px}
figure{margin:0;background:#fff;border-radius:14px;padding:6px}figure div{display:flex;gap:6px}svg{width:50%;height:200px}
figcaption{text-align:center}${css}</style>${cards}`;
const tmp = path.resolve('gallery.html');
fs.writeFileSync(tmp, html);
const require = createRequire(path.resolve('../../books/package.json'));
const { chromium } = require('playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.goto('file://' + tmp);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
fs.unlinkSync(tmp);
console.log('wrote', out);
