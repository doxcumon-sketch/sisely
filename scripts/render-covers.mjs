// Renders scripts/gen-covers.py output (SVG) to optimised JPEGs in public/covers using Playwright's Chromium.
//   python3 scripts/gen-covers.py /tmp/covers-svg && node scripts/render-covers.mjs /tmp/covers-svg public/covers
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const [src = "/tmp/covers-svg", out = "public/covers"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
for (const f of fs.readdirSync(src).filter((n) => n.endsWith(".svg"))) {
  await page.goto("file://" + path.resolve(src, f));
  await page.screenshot({ path: path.join(out, f.replace(".svg", ".jpg")), type: "jpeg", quality: 82 });
  console.log("rendered", f);
}
await browser.close();
