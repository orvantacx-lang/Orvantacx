import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL("https://orvanta-cx.pages.dev")).toString().replace(/\/$/, "");
  const body = ["User-agent: *", "Allow: /", "Disallow: /api/", "", `Sitemap: ${base}/sitemap-index.xml`, ""].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
