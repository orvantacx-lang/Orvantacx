// Accessibility scan (axe-core, WCAG 2.1 A/AA rules) of every page at desktop and mobile widths.
// Usage: BASE_URL=http://127.0.0.1:4321 node tests/e2e/a11y.mjs
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const BASE = (process.env.BASE_URL || "http://127.0.0.1:4321").replace(/\/$/, "");
const pages = ["/", "/about", "/services", "/ai-voice-solutions", "/ai-chat-support", "/inbound-calling", "/outbound-calling", "/industries", "/how-we-work", "/pricing", "/contact", "/privacy-policy", "/terms-of-service", "/nope-404"];
const browser = await chromium.launch();
let total = 0;
for (const [name, viewport] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport });
  for (const p of pages) {
    const page = await ctx.newPage();
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    await page.evaluate(axeSource);
    const res = await page.evaluate(() => window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } }));
    for (const v of res.violations) {
      total++;
      console.log(`${name} ${p}: [${v.impact}] ${v.id} - ${v.help} (${v.nodes.length} nodes) e.g. ${v.nodes[0].target.join(" ")} :: ${(v.nodes[0].failureSummary || "").split("\n")[1] ?? ""}`);
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
console.log(total ? `\n${total} violation group(s)` : "\nNo axe violations");
process.exit(total ? 1 : 0);
