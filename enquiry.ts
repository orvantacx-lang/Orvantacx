/**
 * Enquiry form definition and validation.
 * Pure TypeScript with no browser or Cloudflare APIs, so the SAME rules run in the visitor's browser
 * (instant feedback) and in the Pages Function (the authoritative check).
 */

export const SERVICE_OPTIONS = [
  "AI Inbound Calling",
  "AI Outbound Calling",
  "AI Chat Support",
  "AI Customer Support",
  "AI Lead Qualification",
  "Appointment Booking",
  "Call Analytics and Reporting",
  "Complete AI Contact Centre",
  "Other",
] as const;

export const VOLUME_OPTIONS = [
  "Not sure yet",
  "Fewer than 500 calls or chats per month",
  "500 to 2,000 per month",
  "2,000 to 10,000 per month",
  "More than 10,000 per month",
] as const;

export const LANGUAGE_OPTIONS = ["English", "Hindi"] as const;
export const CONTACT_METHODS = ["Email", "Phone"] as const;

export const CONSENT_TEXT = "I agree to the processing of my information as described in the Privacy Policy so that ORVANTA CX can respond to my enquiry.";

export interface EnquiryInput {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  website: string;
  service: (typeof SERVICE_OPTIONS)[number];
  monthlyVolume: string;
  language: (typeof LANGUAGE_OPTIONS)[number];
  platform: string;
  contactMethod: (typeof CONTACT_METHODS)[number];
  requirements: string;
  consent: true;
}

export type FieldName = keyof EnquiryInput;
export type FieldErrors = Partial<Record<FieldName, string>>;

export type ValidationResult = { ok: true; value: EnquiryInput } | { ok: false; errors: FieldErrors };

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9()\s.\-]{7,25}$/;
const MAX_LINKS = 2;

const clean = (v: unknown): string => (typeof v === "string" ? v.replace(CONTROL_CHARS, "").trim() : "");
const oneOf = <T extends readonly string[]>(list: T, v: string): v is T[number] => (list as readonly string[]).includes(v);

/** Adds https:// when the visitor typed a bare domain, then checks it is a plausible web address. */
export function normaliseWebsite(input: string): string | null {
  if (!input) return "";
  const candidate = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  try {
    const u = new URL(candidate);
    if (!/^https?:$/.test(u.protocol) || !u.hostname.includes(".") || u.hostname.length > 253) return null;
    if (/\s/.test(input)) return null;
    return u.toString().length <= 200 ? u.toString() : null;
  } catch {
    return null;
  }
}

export function validateEnquiry(raw: unknown): ValidationResult {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const fullName = clean(r.fullName);
  if (fullName.length < 2) errors.fullName = "Please enter your full name.";
  else if (fullName.length > 100) errors.fullName = "Name is too long (100 characters maximum).";

  const email = clean(r.email).toLowerCase();
  if (!email) errors.email = "Please enter your business email.";
  else if (email.length > 254 || !EMAIL_RE.test(email) || email.includes("..")) errors.email = "Please enter a valid email address, for example name@company.com.";

  const phone = clean(r.phone);
  if (phone && (!PHONE_RE.test(phone) || phone.replace(/\D/g, "").length < 7)) errors.phone = "Please enter a valid phone number, including the country code if outside India.";

  const company = clean(r.company);
  if (company.length < 2) errors.company = "Please enter your company name.";
  else if (company.length > 120) errors.company = "Company name is too long (120 characters maximum).";

  const country = clean(r.country);
  if (country.length < 2) errors.country = "Please select your country.";
  else if (country.length > 80) errors.country = "Country name is too long.";

  const websiteRaw = clean(r.website);
  const website = normaliseWebsite(websiteRaw);
  if (website === null) errors.website = "Please enter a valid website address, for example www.yourcompany.com.";

  const service = clean(r.service);
  if (!oneOf(SERVICE_OPTIONS, service)) errors.service = "Please select the service you need.";

  const monthlyVolume = clean(r.monthlyVolume);
  if (monthlyVolume && !oneOf(VOLUME_OPTIONS, monthlyVolume)) errors.monthlyVolume = "Please choose one of the listed options.";

  const language = clean(r.language);
  if (!oneOf(LANGUAGE_OPTIONS, language)) errors.language = "Please choose English or Hindi.";

  const platform = clean(r.platform);
  if (platform.length > 150) errors.platform = "Please keep this under 150 characters.";

  const contactMethod = clean(r.contactMethod);
  if (!oneOf(CONTACT_METHODS, contactMethod)) errors.contactMethod = "Please choose how you would like to be contacted.";
  else if (contactMethod === "Phone" && !phone) errors.phone = errors.phone ?? "Please add a phone number, or choose Email as your preferred contact method.";

  const requirements = clean(r.requirements);
  if (requirements.length < 20) errors.requirements = "Please describe your requirements in a little more detail (at least 20 characters).";
  else if (requirements.length > 3000) errors.requirements = "Please keep your description under 3,000 characters.";
  else if ((requirements.match(/https?:\/\/|www\./gi) ?? []).length > MAX_LINKS) errors.requirements = "Please remove extra links from your description.";

  if (r.consent !== true) errors.consent = "Please confirm your consent so that we can respond to your enquiry.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      fullName, email, phone, company, country,
      website: website ?? "",
      service: service as EnquiryInput["service"],
      monthlyVolume,
      language: language as EnquiryInput["language"],
      platform,
      contactMethod: contactMethod as EnquiryInput["contactMethod"],
      requirements,
      consent: true,
    },
  };
}

/** Messages shown to visitors. The success text is only ever displayed after the enquiry is confirmed saved. */
export const MESSAGES = {
  success: "Thank you. Your enquiry has been received and saved. Our team will review your requirements and get in touch.",
  unavailable:
    "Our online enquiry form is not available right now, so nothing has been sent. Please email orvantacx@gmail.com or call +91 7355309230 and we will be glad to help.",
  storageFailed:
    "We could not save your enquiry, so it has not been sent. Please try again in a few minutes, or email orvantacx@gmail.com or call +91 7355309230.",
  rateLimited: "Too many attempts from your connection. Please wait a few minutes and try again, or email orvantacx@gmail.com.",
  rejected: "We could not process this submission. Please refresh the page and try again.",
  session: "Your form session has expired. Please try submitting again.",
  tooFast: "That was very quick. Please check your details and submit again.",
  network: "We could not reach the server, so your enquiry has not been sent. Please check your connection and try again, or email orvantacx@gmail.com.",
} as const;
