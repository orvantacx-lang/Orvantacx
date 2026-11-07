# ORVANTA CX website

Marketing website and enquiry system for **ORVANTA CX**, an AI-powered BPO and contact centre based in Lucknow, India.

- **Frontend:** Astro 7 (static output), TypeScript, Tailwind CSS v4, Lucide icons, self-hosted fonts (Inter, Manrope, Noto Sans Devanagari). Almost no JavaScript: only the mobile menu and the contact form.
- **Backend:** Cloudflare Pages Functions (`functions/`) with Cloudflare D1 (SQLite) for enquiries.
- **Status:** built and tested locally. **Not deployed, not published, nothing purchased, no paid service connected.**

## Cloudflare deployment warning

This repository includes Pages Functions (`functions/`) and a D1 database binding. **Do not deploy only `dist/` using the dashboard's static drag-and-drop upload** if you need the enquiry form backend. Connect the full source repository to Cloudflare Pages through GitHub. Follow [`docs/START-HERE-WINDOWS.md`](docs/START-HERE-WINDOWS.md) for the Windows-friendly deployment sequence, D1 setup, and required `FORM_SECRET`.

The form stores enquiries in Cloudflare D1. It does not currently write to Google Sheets.

## Quick start

```bash
npm install
npm run dev            # site only, http://localhost:4321 (the enquiry form will say it is unavailable: no backend here)
```

To run the site **with** the working enquiry form (local Cloudflare runtime and a local D1 database):

```bash
cp .dev.vars.example .dev.vars          # then put a random value after FORM_SECRET=  (openssl rand -hex 32)
npm run db:migrate:local
npm run cf:dev                          # builds, then serves http://localhost:8788
```

Saved enquiries can be read with:

```bash
npx wrangler d1 execute orvanta-cx-enquiries --local --command "SELECT id, created_at, full_name, email, service, status FROM enquiries ORDER BY created_at DESC"
```

## Commands

| Command | What it does |
|---|---|
| `npm run build` | Static build into `dist/` |
| `npm run check` | `astro check` + TypeScript check of the Functions code |
| `npm test` | 39 unit tests (validation, tokens, handler, D1 behaviour) |
| `npm run test:e2e:api` | API checks against a running `wrangler pages dev` |
| `npm run test:e2e:browser` | Crawl all pages at 3 screen sizes, SEO, links, menu, FAQ, form (set `MODE=static` against `astro preview`) |
| `npm run test:a11y` | axe-core WCAG 2.1 A/AA scan of every page |
| `npm run icons` | Regenerate PNG icons and the social share image |
| `npm run db:migrate:local` / `:remote` | Apply `migrations/` to the local / real D1 database |

## Where things are

```
src/pages/            14 pages (index, about, services, ai-voice-solutions, ai-chat-support, inbound-calling,
                      outbound-calling, industries, how-we-work, pricing, contact, privacy-policy, terms-of-service, 404) + robots.txt
src/components/       Header, Footer, HeroVisual, ContactForm, ServiceBody, PricingCards, FAQ, ...
src/layouts/          BaseLayout (SEO, JSON-LD), ServicePage, LegalPage
src/data/             site.ts (company facts), services.ts, content.ts (all page copy lists), countries.ts
src/lib/enquiry.ts    Validation shared by the browser and the server
src/server/           Handler, signed tokens, D1 queries, Turnstile, email notification
functions/api/        enquiry.ts (POST) and enquiry-token.ts (GET): thin entry points
migrations/           D1 schema
public/_headers       Security headers and caching (applied by Cloudflare Pages)
wrangler.toml         Cloudflare project + D1 binding (source of truth)
docs/                 DEPLOYMENT.md, TEST-REPORT.md, EXTERNAL-ACCOUNTS.md, CONTENT-NOTES.md
tests/                Vitest unit tests and Playwright end-to-end scripts
```

Company facts (email, phone, hours, location) live in `src/data/site.ts`; all copy lives in `src/data/` and the page files.

## How the enquiry form stays honest

1. The page asks `/api/enquiry-token` for a signed token. If the backend is missing or unconfigured, the form disables itself and shows the official email and phone instead.
2. On submit the browser validates, then posts to `/api/enquiry`. The server validates again, checks the token, honeypot, rate limit and duplicates, and **writes to D1**.
3. The success message and reference number (`OCX-YYYYMMDD-XXXXXXXX`) appear **only after D1 confirms the write**. Any failure shows a clear "not sent" message with the email address.

## Read next

- `docs/DEPLOYMENT.md`: step-by-step Cloudflare Pages + D1 + GitHub setup (do this only after you approve publishing).
- `docs/EXTERNAL-ACCOUNTS.md`: what needs an account, credentials or payment, and what does not.
- `docs/TEST-REPORT.md`: what was tested, results, and what could not be tested.
- `docs/CONTENT-NOTES.md`: claims deliberately **not** made, placeholders that need your decision, legal-review items.
