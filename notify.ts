import type { Env } from "./types";

export interface NotifyPayload {
  id: string;
  fullName: string;
  company: string;
  service: string;
  country: string;
  receivedAt: string;
}

const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim().slice(0, 200);

/**
 * Optional email notification through Resend (https://resend.com). Disabled unless RESEND_API_KEY,
 * NOTIFY_TO_EMAIL and NOTIFY_FROM_EMAIL are all set. The message is deliberately minimal — it contains no
 * contact details or message text; the full record stays in D1.
 *
 * NOTE: this integration has NOT been tested against the live provider. Test it after adding credentials.
 */
export async function sendNotification(env: Env, n: NotifyPayload, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  const { RESEND_API_KEY: key, NOTIFY_TO_EMAIL: to, NOTIFY_FROM_EMAIL: from } = env;
  if (!key || !to || !from) return false;
  try {
    const res = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `New enquiry ${n.id} — ${oneLine(n.service)}`,
        text: [
          "A new enquiry was received through the ORVANTA CX website.",
          "",
          `Reference: ${n.id}`,
          `Name:      ${oneLine(n.fullName)}`,
          `Company:   ${oneLine(n.company)}`,
          `Service:   ${oneLine(n.service)}`,
          `Country:   ${oneLine(n.country)}`,
          `Received:  ${n.receivedAt}`,
          "",
          "Full details are stored in the Cloudflare D1 database (table: enquiries).",
        ].join("\n"),
      }),
    });
    if (!res.ok) console.error("[enquiry] notification provider returned", res.status);
    return res.ok;
  } catch (err) {
    console.error("[enquiry] notification failed:", err instanceof Error ? err.message : "unknown error");
    return false;
  }
}
