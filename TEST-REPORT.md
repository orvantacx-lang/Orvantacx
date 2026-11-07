# Test report

Run on 7 November 2026 in a Linux sandbox (Node 22, Chromium via Playwright, Wrangler 4 local runtime with a local D1 database). **Nothing was deployed.** Everything below was tested locally; behaviour on a real Cloudflare account is untested (see "Not tested").

## Summary

| Area | Tool | Result |
|---|---|---|
| Type checking (Astro + TypeScript strict, Functions code) | `npm run check` | 0 errors, 0 warnings, 0 hints |
| Production build | `npm run build` | 14 pages, no errors |
| Unit tests | Vitest, node:sqlite adapter applying the real migration | 39 / 39 passed |
| Real local D1 migration | `wrangler d1 migrations apply --local` | Applied cleanly |
| API end-to-end | `wrangler pages dev` + `tests/e2e/api.mjs` | 12 / 12 passed (+ 3 / 3 in the "not configured" run) |
| Browser crawl, SEO, links, menu, FAQ, form | Playwright, `tests/e2e/browser.mjs` | 622 passed, 0 failed (configured backend) |
| Same, on a static server with no backend | `MODE=static` | 613 passed; 3 "failures" are the browser logging the expected 404 for `/api/enquiry-token`, which is the scenario being tested |
| Accessibility | axe-core, WCAG 2.1 A + AA, 14 pages × desktop and mobile | 0 violations |
| Dependency audit | `npm audit` | 0 vulnerabilities |
| Secrets scan | grep of `dist/` and source | No keys, secrets or credentials found |
| Prohibited-claims scan | text of every built page | Only negations found ("we do not offer unlimited…", "we do not guarantee…") |

## What the browser suite checks (per page, at 1440, 820 and 390 px wide)

HTTP 200 · exactly one `<h1>` · no horizontal overflow · no console or page errors · no failed requests · indexable (no `noindex`) · canonical, Open Graph and Twitter tags present · `lang` set · all images have alt text · every JSON-LD block parses · unique title and unique meta description across pages · title ≤ 70 and description 70–165 characters · every `mailto:` is `orvantacx@gmail.com` and every `tel:` is `+917355309230`.

Site-wide: every internal link and `#anchor` resolves; sitemap lists the 13 indexable pages and not `/404`; `robots.txt` allows crawling and names the sitemap; favicon, PNG icons, manifest and share image all load; unknown URLs show the custom 404 ("Looks Like This Conversation Got Disconnected.").

Interaction: mobile menu opens, closes with Escape and navigates · FAQ opens and closes · contact form prefill from `?service=`, `?plan=`, `?industry=`.

## Enquiry form: scenarios verified

| Scenario | Result |
|---|---|
| Valid enquiry (browser, real local D1) | Saved; reference `OCX-YYYYMMDD-XXXXXXXX` shown only after the write; one row in D1 |
| Double-click on Send | Exactly one request sent |
| Empty form | Field errors, focus moves to first invalid field, nothing posted |
| Invalid email / too-short requirements | Specific messages shown |
| Missing required field (server) | 400 with per-field error |
| Same token resubmitted / identical content with a new token | Original reference returned; no second row |
| Honeypot filled | Rejected, nothing saved |
| Forged / too-fast / expired token | Rejected |
| Foreign `Origin` | 403 |
| Many attempts | 429 with "Too many attempts" |
| Oversized or malformed body | 413 / 400 |
| Daily cap reached | 429 |
| D1 write fails (simulated) | 502 "has not been sent" message; **no success message, no reference** |
| Backend not configured (no secret or no D1) | 503; form disables itself and shows `orvantacx@gmail.com` and the phone number |
| Static host with no Functions | Same disabled state with email and phone links |
| Email provider failing (mocked) | Enquiry still saved; `notified` stays 0 |
| Raw IP address | Never stored (only a salted hash, 32 hex chars) |

## Security headers (checked via `wrangler pages dev`)
`Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`; `/_astro/*` cached immutable; API responses `no-store`. The full browser suite ran under this CSP with no violations (a first run found fonts being inlined as `data:` URIs and blocked; fixed by disabling asset inlining).

## Issues found and fixed during testing
1. Small fonts inlined as `data:` URIs were blocked by the CSP → `assetsInlineLimit: 0`.
2. Eight titles/descriptions exceeded recommended search-result lengths → shortened.
3. A unit-test regex used the wrong ID alphabet (flaky test, not a product bug) → fixed, repeated 5×.
4. Hero illustration text clipped and waveform off-centre → fixed. A misaligned form label → fixed. Repeated lead paragraph on service pages → removed.
5. One TypeScript error in the form script → fixed.

## Page weight (production build)
`dist/` is 1.2 MB in total, of which 16 font files and 112 KB for the share image. Home page HTML is 14 KB gzipped; CSS 8 KB gzipped; the contact form script 8.5 KB; menu script 0.5 KB. No third-party scripts load unless Turnstile is enabled. (A Lighthouse run was not performed.)

## Not tested, and why
- **A real Cloudflare deployment**, real remote D1, and the dashboard binding steps: not deployed, by instruction. `docs/DEPLOYMENT.md` lists how to verify after deploying.
- **Email notifications:** no provider credentials exist. Only the failure-isolation path was tested with a mock. **Do not treat email as working.**
- **Cloudflare Turnstile:** logic tested with a mocked verification response; the live widget was not exercised.
- **Real-device and Safari/Firefox testing:** only Chromium at three widths.
- **Lighthouse / Core Web Vitals, Search Console, search ranking:** not measured. Nothing is promised.
- **Hindi copy** needs review by a fluent speaker; **legal pages** need a lawyer.

## Re-running
```bash
npm run check && npm test
cp .dev.vars.example .dev.vars   # set FORM_SECRET
npm run db:migrate:local && npm run build
npx wrangler pages dev dist --port 8788 &      # then:
npm run test:e2e:api && npm run test:e2e:browser
npx astro preview --port 4321 &                # then:
BASE_URL=http://127.0.0.1:4321 npm run test:a11y
BASE_URL=http://127.0.0.1:4321 MODE=static npm run test:e2e:browser
```
(The API test waits ~5 s for token age and uses the per-visitor rate limit: clear `rate_limits` between repeated runs.)
