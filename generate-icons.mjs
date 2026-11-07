// Regenerates the PNG icons and social-share image in /public from simple inline markup.
// Usage: node scripts/generate-icons.mjs   (needs Playwright with Chromium available)
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import { fileURLToPath } from "node:url";
import path from "node:path";

const pub = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");
const mark = (size, radius) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64"><rect width="64" height="64" rx="${radius}" fill="#101D30"/><circle cx="32" cy="32" r="19" fill="none" stroke="#54C7B4" stroke-width="5"/><rect x="22.5" y="27" width="4" height="10" rx="2" fill="#54C7B4"/><rect x="30" y="21" width="4" height="22" rx="2" fill="#54C7B4"/><rect x="37.5" y="25" width="4" height="14" rx="2" fill="#54C7B4"/></svg>`;

const browser = await chromium.launch();
const shot = async (html, w, h, file) => {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(`<body style="margin:0">${html}</body>`);
  await page.screenshot({ path: path.join(pub, file) });
  await page.close();
};

await shot(mark(32, 14), 32, 32, "favicon-32.png");
await shot(mark(180, 0), 180, 180, "apple-touch-icon.png");
await shot(mark(192, 14), 192, 192, "icon-192.png");
await shot(mark(512, 14), 512, 512, "icon-512.png");

const bars = [14, 26, 40, 24, 48, 66, 40, 78, 52, 90, 60, 78, 44, 66, 36, 48, 24, 32, 18, 12];
const wave = bars.map((h, i) => `<rect x="${i * 22}" y="${100 - h}" width="10" height="${h * 2}" rx="5" fill="#54C7B4" opacity="${0.35 + (h / 90) * 0.65}"/>`).join("");
await shot(`
<div style="width:1200px;height:630px;background:#101D30;position:relative;overflow:hidden;font-family:system-ui,Arial,sans-serif;color:#fff">
  <svg style="position:absolute;right:-120px;top:-60px" width="720" height="720" fill="none" stroke="#54C7B4" stroke-opacity=".14" stroke-width="2"><circle cx="360" cy="360" r="120"/><circle cx="360" cy="360" r="200"/><circle cx="360" cy="360" r="280"/><circle cx="360" cy="360" r="350"/></svg>
  <div style="position:absolute;left:80px;top:78px;display:flex;align-items:center;gap:18px">
    ${mark(64, 14)}<span style="font-size:36px;font-weight:800;letter-spacing:-.5px">ORVANTA <span style="color:#54C7B4">CX</span></span>
  </div>
  <div style="position:absolute;left:80px;top:230px;width:760px">
    <div style="font-size:64px;font-weight:800;line-height:1.08;letter-spacing:-1.5px">Every Customer Conversation. Handled Smarter.</div>
    <div style="margin-top:26px;font-size:28px;color:#b6c4d3">AI-powered BPO &amp; contact centre &middot; Lucknow, India</div>
  </div>
  <svg style="position:absolute;left:80px;bottom:54px" width="440" height="200" viewBox="0 0 440 200">${wave}</svg>
</div>`, 1200, 630, "og-image.png");

await browser.close();
console.log("Icons and og-image written to", pub);
