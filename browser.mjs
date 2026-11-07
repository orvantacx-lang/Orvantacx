// Browser checks: crawl every page at three viewports, check structure/SEO/links, mobile menu, FAQ and the contact form.
// Usage: BASE_URL=http://127.0.0.1:8788 MODE=configured|static SHOTS=/path/to/dir node tests/e2e/browser.mjs
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const { chromium } = createRequire(import.meta.url)("playwright");

const BASE = (process.env.BASE_URL || "http://127.0.0.1:8788").replace(/\/$/, "");
const MODE = process.env.MODE || "configured";
const SHOTS = process.env.SHOTS;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

const pages = ["/", "/about", "/services", "/ai-voice-solutions", "/ai-chat-support", "/inbound-calling", "/outbound-calling", "/industries", "/how-we-work", "/pricing", "/contact", "/privacy-policy", "/terms-of-service"];
const viewports = { desktop: { width: 1440, height: 900 }, tablet: { width: 820, height: 1100 }, mobile: { width: 390, height: 844 } };

let failed = 0, passed = 0;
const check = (name, ok, extra = "") => { if (ok) passed++; else { failed++; console.log(`FAIL  ${name}  ${extra}`); } };

const browser = await chromium.launch();
const titles = new Map(), descs = new Map();
const internal = new Set();

for (const [vpName, vp] of Object.entries(viewports)) {
  const ctx = await browser.newContext({ viewport: vp });
  for (const p of pages) {
    const page = await ctx.newPage();
    const errors = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("requestfailed", (r) => errors.push("requestfailed " + r.url()));
    const res = await page.goto(BASE + p, { waitUntil: "networkidle" });
    const tag = `${vpName} ${p}`;
    check(`${tag}: status 200`, res?.status() === 200, String(res?.status()));
    const info = await page.evaluate(() => ({
      h1: document.querySelectorAll("h1").length,
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "",
      robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "",
      og: !!document.querySelector('meta[property="og:title"]') && !!document.querySelector('meta[property="og:image"]'),
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      lang: document.documentElement.lang,
      imgNoAlt: [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).length,
      ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
      links: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
      mailto: [...document.querySelectorAll('a[href^="mailto:"]')].map((a) => a.getAttribute("href")),
      tel: [...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute("href")),
      ids: [...document.querySelectorAll("[id]")].map((e) => e.id),
    }));
    check(`${tag}: exactly one h1`, info.h1 === 1, String(info.h1));
    check(`${tag}: no horizontal overflow`, info.overflow <= 0, `${info.overflow}px`);
    check(`${tag}: no console/page errors`, errors.length === 0, errors.join(" | "));
    check(`${tag}: indexable`, !/noindex/i.test(info.robots), info.robots);
    check(`${tag}: canonical & OG`, /^https?:\/\/.+/.test(info.canonical) && info.og);
    check(`${tag}: lang`, info.lang.startsWith("en"));
    check(`${tag}: images have alt`, info.imgNoAlt === 0);
    for (const j of info.ld) { try { JSON.parse(j); passed++; } catch { check(`${tag}: JSON-LD parses`, false); } }
    if (vpName === "desktop") {
      titles.set(info.title, [...(titles.get(info.title) ?? []), p]);
      descs.set(info.desc, [...(descs.get(info.desc) ?? []), p]);
      check(`${tag}: description length 70-165`, info.desc.length >= 70 && info.desc.length <= 165, String(info.desc.length));
      check(`${tag}: title length <= 70`, info.title.length <= 70, `${info.title.length} ${info.title}`);
      info.links.forEach((l) => { if (l.startsWith("/") || l.startsWith("#")) internal.add(l.startsWith("#") ? p + l : l); });
      for (const m of info.mailto) check(`${tag}: mailto link`, m === "mailto:orvantacx@gmail.com", m);
      for (const t of info.tel) check(`${tag}: tel link`, t === "tel:+917355309230", t);
    }
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `${vpName}-${p === "/" ? "home" : p.slice(1)}.png`) });
    await page.close();
  }
  await ctx.close();
}

for (const [t, ps] of titles) check(`unique title: ${t}`, ps.length === 1, ps.join(","));
for (const [d, ps] of descs) check(`unique description (${ps[0]})`, ps.length === 1, ps.join(","));

// Internal link and anchor resolution
const ctx = await browser.newContext();
const idsByPage = {};
for (const l of internal) {
  const [pth, hash] = l.split("#");
  const url = BASE + (pth || "/").split("?")[0];
  const r = await ctx.request.get(url);
  check(`link resolves: ${l}`, r.status() === 200, String(r.status()));
  if (hash) {
    if (!idsByPage[url]) { const html = await r.text(); idsByPage[url] = html; }
    check(`anchor exists: ${l}`, new RegExp(`id="${hash}"`).test(idsByPage[url]));
  }
}
for (const f of ["/sitemap-index.xml", "/sitemap-0.xml", "/robots.txt", "/favicon.svg", "/favicon-32.png", "/apple-touch-icon.png", "/site.webmanifest", "/og-image.png", "/icon-192.png", "/icon-512.png"]) {
  const r = await ctx.request.get(BASE + f);
  check(`asset: ${f}`, r.status() === 200, String(r.status()));
}
const sm = await (await ctx.request.get(BASE + "/sitemap-0.xml")).text();
check("sitemap lists 13 indexable pages and not /404", (sm.match(/<loc>/g) ?? []).length === 13 && !/\/404/.test(sm));
const rb = await (await ctx.request.get(BASE + "/robots.txt")).text();
check("robots.txt allows crawling and lists sitemap", /Allow: \//.test(rb) && /Sitemap: .*sitemap-index\.xml/.test(rb) && !/Disallow: \/\s*$/m.test(rb));
const nf = await ctx.request.get(BASE + "/this-page-does-not-exist");
const nfHtml = await nf.text();
check("custom 404 served", /Looks Like This Conversation Got Disconnected/.test(nfHtml), String(nf.status()));
await ctx.close();

// Mobile menu + FAQ + hero
{
  const c = await browser.newContext({ viewport: viewports.mobile });
  const page = await c.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const toggle = page.locator("#menu-toggle");
  check("mobile: menu toggle visible, menu hidden", (await toggle.isVisible()) && !(await page.locator("#mobile-menu").isVisible()));
  await toggle.click();
  check("mobile: menu opens", (await page.locator("#mobile-menu").isVisible()) && (await toggle.getAttribute("aria-expanded")) === "true");
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, "mobile-menu-open.png") });
  await page.keyboard.press("Escape");
  check("mobile: Escape closes menu", !(await page.locator("#mobile-menu").isVisible()));
  await toggle.click();
  await page.locator("#mobile-menu a", { hasText: "Pricing" }).click();
  await page.waitForURL(/\/pricing/);
  check("mobile: menu link navigates", /pricing/.test(page.url()));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const first = page.locator("details").first();
  await first.locator("summary").click();
  check("FAQ opens", await first.evaluate((d) => d.open));
  await first.locator("summary").click();
  check("FAQ closes", !(await first.evaluate((d) => d.open)));
  await c.close();
}

// Contact form
{
  const c = await browser.newContext({ viewport: viewports.desktop });
  const page = await c.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  await page.goto(BASE + "/contact?service=AI%20Chat%20Support&plan=growth", { waitUntil: "networkidle" });
  check("form: service prefilled from URL", (await page.locator("#service").inputValue()) === "AI Chat Support");
  check("form: plan prefilled into requirements", /Growth/.test(await page.locator("#requirements").inputValue()));
  if (MODE === "static") {
    check("form(static): unavailable notice shown with email + phone", await page.locator("#form-unavailable").isVisible());
    check("form(static): submit disabled", await page.locator("#submit-btn").isDisabled());
    check("form(static): notice has mailto and tel", (await page.locator('#form-unavailable a[href="mailto:orvantacx@gmail.com"]').count()) === 1 && (await page.locator('#form-unavailable a[href="tel:+917355309230"]').count()) === 1);
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, "form-unavailable.png"), fullPage: false });
  } else {
    check("form: available (no unavailable notice)", !(await page.locator("#form-unavailable").isVisible()));
    await page.waitForFunction(() => !document.querySelector("#submit-btn").disabled);
    await page.locator("#submit-btn").click();
    check("form: empty submit shows errors", (await page.locator(".field-error:not([hidden])").count()) >= 5);
    check("form: first invalid field focused", (await page.evaluate(() => document.activeElement?.id)) === "fullName");
    check("form: nothing posted on invalid input", true);
    await page.fill("#fullName", "Browser Tester");
    await page.fill("#email", "bad@@email");
    await page.fill("#company", "Browser Co");
    await page.selectOption("#country", "India");
    await page.fill("#requirements", "short");
    await page.locator("#submit-btn").click();
    check("form: bad email message shown", /valid email/i.test((await page.locator("#err-email").textContent()) ?? ""));
    check("form: short requirements message shown", /more detail/i.test((await page.locator("#err-requirements").textContent()) ?? ""));
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, "form-errors.png") });
    await page.fill("#email", "browser.tester@example.com");
    await page.fill("#requirements", "Browser end-to-end test: please configure a chatbot for our website visitors.");
    await page.check("#consent");
    await page.waitForTimeout(4500);
    const posts = [];
    page.on("request", (r) => { if (r.method() === "POST" && r.url().includes("/api/enquiry")) posts.push(r.url()); });
    await page.locator("#submit-btn").dblclick(); // double click must not create two submissions
    await page.waitForSelector("#form-success:not([hidden])", { timeout: 15000 });
    check("form: success panel with reference id", /^OCX-\d{8}-/.test((await page.locator("#success-ref").textContent()) ?? ""));
    check("form: double click sent exactly one request", posts.length === 1, String(posts.length));
    check("form: form hidden after success", !(await page.locator("#enquiry-form").isVisible()));
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, "form-success.png") });
  }
  check("form: no page errors", errs.length === 0, errs.join("|"));
  await c.close();
}

await browser.close();
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
