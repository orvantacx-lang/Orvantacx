# Deployment guide: Cloudflare Pages + D1 + GitHub

> **Do not follow this until you have approved publishing.** Nothing in this project has been deployed. Every step below is free on Cloudflare's free plans at normal enquiry-form volumes (check current limits on cloudflare.com before relying on them). No domain purchase is needed: Cloudflare gives you a `*.pages.dev` address.

## 0. What you need

| Need | Notes |
|---|---|
| A GitHub account | Free. Holds the code. |
| A Cloudflare account | Free plan is enough. |
| Node.js 22 or newer, and npm | On the computer you run the commands from. |

## 1. Put the code on GitHub

1. Create a **private** repository on GitHub (for example `orvanta-cx-website`). Do not tick "Add a README".
2. In the project folder:
   ```bash
   git init && git add . && git commit -m "Initial ORVANTA CX website"
   git branch -M main
   git remote add origin https://github.com/<your-account>/orvanta-cx-website.git
   git push -u origin main
   ```
3. Check that `.dev.vars` and `.env` are **not** in the repository (they are listed in `.gitignore`; `git status` should not show them).

## 2. Create the D1 database

```bash
npm install
npx wrangler login                                  # opens a browser to sign in to Cloudflare
npx wrangler d1 create orvanta-cx-enquiries
```

The command prints a `database_id`. Open `wrangler.toml` and replace the placeholder `00000000-0000-0000-0000-000000000000` with it. The ID is an identifier, not a password, so it is safe to commit.

Create the tables:

```bash
npm run db:migrate:remote
```

Confirm:

```bash
npx wrangler d1 execute orvanta-cx-enquiries --remote --command "SELECT name FROM sqlite_master WHERE type='table'"
```
You should see `enquiries` and `rate_limits`. Commit and push the `wrangler.toml` change.

## 3. Create the Pages project and bind D1

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**, and choose the repository.
2. Build settings:
   - **Framework preset:** Astro (or None)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Environment variables (build):** `NODE_VERSION` = `22`, and `SITE_URL` = the address Cloudflare will give you, for example `https://orvanta-cx.pages.dev` (use your real project name; see step 6).
3. **Binding D1.** `wrangler.toml` contains `pages_build_output_dir`, so Cloudflare reads bindings from that file: the `[[d1_databases]]` block binds your database to the name `DB` automatically on the next deployment. In the dashboard, **Settings → Bindings** will show it as read-only. You do not enter database credentials anywhere; D1 is bound by Cloudflare itself and the code never sees a connection string.
4. Click **Save and Deploy** only when you are ready to publish. (Cloudflare deploys on every push to `main` from then on.)

## 4. Add the form secret (required)

The form refuses to run (and tells visitors so) until `FORM_SECRET` exists. Generate a random value:

```bash
openssl rand -hex 32
```

Add it as an **encrypted secret**, either:

- Dashboard: Pages project → **Settings → Variables and Secrets → Add** → type **Secret**, name `FORM_SECRET`, for **Production** (and Preview if you test previews); or
- CLI: `npx wrangler pages secret put FORM_SECRET --project-name <your-project-name>`

Then redeploy (secrets apply to new deployments). Never put this value in the code, in `wrangler.toml`, or in a `PUBLIC_` variable.

## 5. Test the live form

1. Visit `https://<your-project>.pages.dev/api/enquiry-token`. Expected: `{"ok":true,"token":"..."}`. If you see `not_configured`, the D1 binding or `FORM_SECRET` is missing.
2. Open `/contact`, submit a real test enquiry, and confirm the reference number appears.
3. Read it back from the live database:
   ```bash
   npx wrangler d1 execute orvanta-cx-enquiries --remote --command "SELECT id, created_at, full_name, email, service, status FROM enquiries ORDER BY created_at DESC LIMIT 10"
   ```
4. Delete your test row: `... --command "DELETE FROM enquiries WHERE email='<your test email>'"`.

You can also view and query rows in the dashboard: **Storage & Databases → D1 → orvanta-cx-enquiries → Console**.

### Managing enquiries
`status` is one of `new`, `contacted`, `qualified`, `closed`, `spam`. Example:
```sql
UPDATE enquiries SET status='contacted' WHERE id='OCX-20261107-XXXXXXXX';
```

## 6. Address, canonical URL and Google Search Console

- The canonical URL, Open Graph URLs, sitemap and JSON-LD all come from the `SITE_URL` build variable. Set it to the exact address the site is served from (the `*.pages.dev` address first). If you later attach a custom domain, change `SITE_URL` and redeploy.
- `robots.txt` allows crawling and points to `/sitemap-index.xml`. No page is `noindex` except the 404.
- **Search Console:** add the site as a property (URL-prefix). Choose the "HTML tag" verification, copy only the `content` value into the build variable `PUBLIC_GOOGLE_SITE_VERIFICATION`, redeploy, click Verify, then submit `https://<your-site>/sitemap-index.xml`. (Verification and ranking are up to Google; nothing here promises results.)

## 7. Optional: Cloudflare Turnstile (spam challenge)

Free. Not required: the honeypot, signed tokens, rate limiting and duplicate protection already work without it.

1. Dashboard → **Turnstile** → add a widget for your site address; copy the **site key** and **secret key**.
2. Set the build variable `PUBLIC_TURNSTILE_SITE_KEY` (public) and the secret `TURNSTILE_SECRET_KEY`. Redeploy.
3. When the secret is present, the server **requires** a valid challenge. Test it before relying on it.

## 8. Optional: email notification when an enquiry arrives

Off by default. It is **not** claimed to work until you have supplied credentials and a real test has succeeded.

1. Create an account with an email API provider. The code uses **Resend** (`src/server/notify.ts`); it has a free tier but requires verifying a sending domain you own, which may mean buying one. Gmail SMTP passwords must never be used here.
2. Set secrets `RESEND_API_KEY`, `NOTIFY_FROM_EMAIL` (a verified sender) and `NOTIFY_TO_EMAIL` (where to notify). Redeploy.
3. Submit a test enquiry and confirm the email arrives. Look at the `notified` column (1 = provider accepted it). A failed email never affects whether the enquiry is saved; it is always in D1.

The notification carries only the reference, name, company, service and country. Full details stay in D1.

## 9. Other settings

| Variable / secret | Purpose | Default |
|---|---|---|
| `ALLOWED_ORIGINS` | Extra origins allowed to post (e.g. a custom domain during a move), comma-separated | same origin only |
| `DAILY_ENQUIRY_LIMIT` | Safety cap on saved enquiries per day | 300 |

## 10. Troubleshooting

| Symptom | Likely cause |
|---|---|
| Form says it is unavailable | `FORM_SECRET` missing, D1 binding missing, or `database_id` still the placeholder |
| `storage_failed` / "could not save" | Migrations not applied to the remote database (`npm run db:migrate:remote`) |
| "Too many attempts" | Rate limit (8 submissions / 15 min per visitor). Wait, or clear `rate_limits` |
| Canonical URLs show `orvanta-cx.pages.dev` | `SITE_URL` not set at build time |
| 403 on submit from a custom domain | Add it to `ALLOWED_ORIGINS` |
