// End-to-end API checks against a running `wrangler pages dev dist` (local D1).
// Usage: BASE_URL=http://127.0.0.1:8788 node tests/e2e/api.mjs [--unconfigured]
const BASE = process.env.BASE_URL || "http://127.0.0.1:8788";
const unconfigured = process.argv.includes("--unconfigured");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = 0;
const check = (name, ok, extra = "") => { console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  " + extra}`); if (!ok) failed++; };

const getToken = async () => { const r = await fetch(`${BASE}/api/enquiry-token`); return { status: r.status, body: await r.json().catch(() => null) }; };
const post = async (body) => {
  const r = await fetch(`${BASE}/api/enquiry`, { method: "POST", headers: { "Content-Type": "application/json", Origin: BASE }, body: JSON.stringify(body) });
  return { status: r.status, body: await r.json().catch(() => null) };
};
const valid = {
  fullName: "E2E Tester", email: "e2e@example.com", phone: "+91 98765 43210", company: "E2E Pvt Ltd", country: "India", website: "example.com",
  service: "AI Chat Support", monthlyVolume: "500 to 2,000 per month", language: "English", platform: "", contactMethod: "Email",
  requirements: "End-to-end test enquiry: we want a chatbot for common product questions.", consent: true, nickname: "",
};

if (unconfigured) {
  const t = await getToken();
  check("token endpoint reports not configured (503)", t.status === 503 && t.body?.code === "not_configured");
  const p = await post({ ...valid, token: "x" });
  check("enquiry endpoint reports not configured (503) and names the official email", p.status === 503 && p.body?.ok === false && /orvantacx@gmail\.com/.test(p.body?.message ?? ""), JSON.stringify(p));
  check("no success message when unconfigured", !/received|saved/i.test(p.body?.message ?? "") || /not available/i.test(p.body?.message ?? ""));
  process.exit(failed ? 1 : 0);
}

const t1 = await getToken();
check("GET /api/enquiry-token returns a token", t1.status === 200 && t1.body?.ok && typeof t1.body.token === "string");
const m = await fetch(`${BASE}/api/enquiry`);
check("GET /api/enquiry is 405", m.status === 405);

const tokens = [];
for (let i = 0; i < 6; i++) tokens.push((await getToken()).body.token);
await sleep(4600); // tokens must be older than the minimum fill time

const fast = (await getToken()).body.token;
const tooFast = await post({ ...valid, token: fast, email: "fast@example.com" });
check("too-fast submission is refused", tooFast.status === 400 && tooFast.body?.code === "token_too_fast", JSON.stringify(tooFast));

const ok = await post({ ...valid, token: tokens[0] });
check("valid enquiry is saved and a reference id returned", ok.status === 200 && ok.body?.ok === true && /^OCX-\d{8}-/.test(ok.body?.id ?? ""), JSON.stringify(ok));

const badEmail = await post({ ...valid, token: tokens[1], email: "not-an-email" });
check("invalid email rejected with field error", badEmail.status === 400 && !!badEmail.body?.errors?.email);

const { fullName, ...missing } = valid;
const noName = await post({ ...missing, token: tokens[2] });
check("missing required field rejected", noName.status === 400 && !!noName.body?.errors?.fullName);

const dupToken = await post({ ...valid, token: tokens[0] });
check("same token resubmitted returns the original reference (no second row)", dupToken.status === 200 && dupToken.body?.id === ok.body?.id && dupToken.body?.duplicate === true);

const dupContent = await post({ ...valid, token: tokens[3] });
check("identical content with a new token is de-duplicated", dupContent.status === 200 && dupContent.body?.id === ok.body?.id);

const bot = await post({ ...valid, token: tokens[4], email: "bot@example.com", nickname: "i am a bot" });
check("honeypot submission rejected", bot.status === 400 && bot.body?.ok === false);

const forged = await post({ ...valid, token: "forged.token.value", email: "forged@example.com" });
check("forged token rejected", forged.status === 400 && forged.body?.code === "token_invalid");

const foreign = await fetch(`${BASE}/api/enquiry`, { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://evil.example" }, body: JSON.stringify({ ...valid, token: tokens[5] }) });
check("foreign origin rejected", foreign.status === 403);

let limited = null;
for (let i = 0; i < 6 && !limited; i++) {
  const r = await post({ ...valid, token: "forged.token.value", email: `rl${i}@example.com` });
  if (r.status === 429) limited = r;
}
check("rate limit kicks in (429 with Retry-After message)", limited?.status === 429 && /Too many/.test(limited.body?.message ?? ""));

console.log(failed ? `\n${failed} check(s) FAILED` : "\nAll API checks passed");
process.exit(failed ? 1 : 0);
