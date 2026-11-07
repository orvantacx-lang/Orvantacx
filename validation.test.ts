import { describe, expect, it } from "vitest";
import { validateEnquiry, normaliseWebsite } from "../src/lib/enquiry";

import { valid } from "./fixtures";

describe("validateEnquiry", () => {
  it("accepts a complete valid enquiry and normalises it", () => {
    const r = validateEnquiry(valid);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.email).toBe("asha@example.com");
      expect(r.value.website).toBe("https://example.com/");
    }
  });
  it("accepts only the required fields", () => {
    const r = validateEnquiry({ ...valid, phone: "", website: "", monthlyVolume: "", platform: "" });
    expect(r.ok).toBe(true);
  });
  it.each([
    ["fullName", ""], ["email", "not-an-email"], ["email", "a@b"], ["email", "a..b@example.com"], ["company", ""], ["country", ""],
    ["service", "Something else"], ["language", "French"], ["contactMethod", "Fax"], ["requirements", "too short"],
    ["phone", "abc"], ["website", "http://"], ["monthlyVolume", "lots"],
  ])("rejects invalid %s (%s)", (field, value) => {
    const r = validateEnquiry({ ...valid, [field]: value });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors).toHaveProperty(field);
  });
  it("requires consent to be exactly true", () => {
    for (const consent of [false, "true", 1, undefined]) {
      const r = validateEnquiry({ ...valid, consent });
      expect(r.ok).toBe(false);
    }
  });
  it("requires a phone number when Phone is the preferred contact method", () => {
    const r = validateEnquiry({ ...valid, phone: "", contactMethod: "Phone" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.phone).toBeTruthy();
  });
  it("rejects link-stuffed requirements", () => {
    const r = validateEnquiry({ ...valid, requirements: "buy now http://a.com http://b.com http://c.com please visit our site today" });
    expect(r.ok).toBe(false);
  });
  it("rejects over-long fields and non-object input", () => {
    expect(validateEnquiry({ ...valid, requirements: "x".repeat(3001) }).ok).toBe(false);
    expect(validateEnquiry({ ...valid, fullName: "x".repeat(101) }).ok).toBe(false);
    expect(validateEnquiry(null).ok).toBe(false);
    expect(validateEnquiry("string").ok).toBe(false);
  });
  it("strips control characters", () => {
    const r = validateEnquiry({ ...valid, fullName: "Asha\u0000 Verma" });
    expect(r.ok && r.value.fullName).toBe("Asha Verma");
  });
});

describe("normaliseWebsite", () => {
  it("adds https and rejects junk", () => {
    expect(normaliseWebsite("www.example.com")).toBe("https://www.example.com/");
    expect(normaliseWebsite("javascript:alert(1)")).toBeNull();
    expect(normaliseWebsite("no spaces.com")).toBeNull();
    expect(normaliseWebsite("")).toBe("");
  });
});
