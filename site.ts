/** Single source of truth for company facts. Only information supplied by the business appears here. */
export const company = {
  name: "ORVANTA CX",
  tagline: "Smarter Conversations. Faster Support. Better Experiences.",
  positioning: "Your AI-Powered Customer Experience Partner.",
  email: "orvantacx@gmail.com",
  phone: "+91 7355309230",
  phoneHref: "tel:+917355309230",
  location: "Lucknow, Uttar Pradesh, India",
  coverage: "India and international clients",
  languages: ["English", "Hindi"],
  hours: [
    { day: "Monday – Friday", time: "10:00 AM – 6:00 PM IST" },
    { day: "Saturday", time: "By appointment" },
    { day: "Sunday", time: "Closed" },
  ],
  hoursNote:
    "These are business enquiry hours for discussing requirements with our team. They are not a promise of human customer support hours for any client service.",
  description:
    "ORVANTA CX is an AI-powered BPO and contact centre service provider based in Lucknow, India. AI voice agents and chatbots handle routine customer interactions, with human escalation for sensitive or complex matters.",
} as const;

export const mainNav = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Industries", href: "/industries" },
  { label: "How We Work", href: "/how-we-work" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
] as const;

export const legalNav = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
] as const;
