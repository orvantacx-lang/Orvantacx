# What needs an external account, credentials or payment

Nothing below has been created, purchased or connected. Items are grouped by whether they are needed to publish the site.

## Needed to publish (free tiers)

| Item | Why | Cost |
|---|---|---|
| GitHub account | Hosts the source; Cloudflare builds from it | Free |
| Cloudflare account | Pages hosting, Functions, D1 database | Free plan is sufficient at low volume; check current limits |
| `FORM_SECRET` (you generate it) | Signs form tokens, salts IP hashes | Free |

## Optional, may involve cost or extra accounts

| Feature | Status in this build | What is needed |
|---|---|---|
| Custom domain (e.g. orvantacx.com) | Not set up. Site works on `*.pages.dev`. | **Buying a domain** (you decide; not done) |
| Cloudflare Turnstile | Code ready, **untested against the live service** | Free Cloudflare widget; site key + secret |
| Email notification on new enquiry | Code ready (Resend), **untested, not claimed to work** | Resend (or similar) account, a verified sending domain (usually needs a domain you own), API key |
| Google Search Console | Meta tag hook ready | Free Google account; verification code |
| Analytics | **None installed** | Your choice (e.g. Cloudflare Web Analytics, free) |
| Live AI voice demo / chat widget | **Not built; not pretended.** The site shows a clearly labelled written example only | AI voice/chat platform, telephony provider and numbers: **paid**, and telecom rules apply |
| Real outbound or inbound calls | **None made or configured** | Telephony provider, numbers, consent and compliance set-up |
| WhatsApp | **Not integrated** | WhatsApp Business API account; only add once configured and tested |
| Social profiles | **None linked** (no empty links) | Add real profile URLs to `src/components/Footer.astro` when they exist |
| Legal review | Privacy Policy and Terms are **drafts** | A qualified lawyer |
