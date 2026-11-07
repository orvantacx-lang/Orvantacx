import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// The canonical site URL. Set SITE_URL at build time (Cloudflare Pages → Settings → Environment variables)
// once the real address is known. The default is only a placeholder for the Pages subdomain.
const site = (process.env.SITE_URL || "https://orvanta-cx.pages.dev").replace(/\/$/, "");

export default defineConfig({
  site,
  output: "static",
  trailingSlash: "never",
  build: { format: "file" },
  integrations: [sitemap({ filter: (page) => !page.includes("/404") })],
  // Fonts must stay as real files: inlined data: URIs would be blocked by the font-src 'self' CSP.
  vite: { plugins: [tailwindcss()], build: { assetsInlineLimit: 0 } },
});
