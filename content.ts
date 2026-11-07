import type { IconName } from "./services";

/* ───────── Industries ───────── */
export interface Industry {
  slug: string;
  name: string;
  icon: IconName;
  summary: string;
  useCases: string[];
  note?: string;
  /** Pre-selected service in the contact form. */
  service: string;
}

export const industries: Industry[] = [
  {
    slug: "ecommerce-retail",
    name: "E-commerce & Retail",
    icon: "store",
    summary: "Answer product, order and delivery questions without queues, and keep returns requests organised.",
    useCases: ["Product enquiries", "Order-status information", "Delivery enquiries", "Return and exchange intake", "Customer support", "Shopping assistance"],
    note: "Order information is shared only where an authorised data source is connected.",
    service: "AI Customer Support",
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    icon: "house",
    summary: "Respond to property enquiries quickly, ask the right questions and arrange site visits.",
    useCases: ["Property enquiries", "Lead qualification", "Site-visit scheduling", "Callback requests", "Property information"],
    service: "AI Lead Qualification",
  },
  {
    slug: "saas-technology",
    name: "SaaS & Technology",
    icon: "cloud",
    summary: "Handle first-line product questions, book demos and log support requests for your team.",
    useCases: ["Product enquiries", "Demo scheduling", "Basic first-line support", "Subscription information", "Support ticket intake"],
    service: "AI Chat Support",
  },
  {
    slug: "healthcare-administration",
    name: "Healthcare Administration",
    icon: "heart-pulse",
    summary: "Support the administrative side of a clinic: information, appointment requests and confirmations.",
    useCases: ["Clinic information", "Appointment requests", "Appointment confirmations", "General administrative enquiries"],
    note: "Administrative support only. ORVANTA CX does not offer medical diagnosis, medical advice, treatment recommendations or emergency triage.",
    service: "Appointment Booking",
  },
  {
    slug: "travel-hospitality",
    name: "Travel & Hospitality",
    icon: "plane",
    summary: "Respond to booking questions and keep reservations and tours confirmed.",
    useCases: ["Booking enquiries", "Reservation information", "Appointment or tour scheduling", "Confirmation reminders", "Guest information"],
    service: "AI Inbound Calling",
  },
  {
    slug: "professional-services",
    name: "Professional Services",
    icon: "briefcase",
    summary: "Handle first contact from prospective clients and arrange consultations.",
    useCases: ["Initial client enquiries", "Consultation scheduling", "General service information", "Lead qualification", "Callback requests"],
    service: "AI Lead Qualification",
  },
];

/* ───────── Home: capability strip ───────── */
export const capabilityStrip = [
  { icon: "audio-lines", title: "AI Voice Agents", text: "Inbound and permitted outbound calls" },
  { icon: "message-square", title: "AI Chat Support", text: "Website chat and enquiry capture" },
  { icon: "languages", title: "English & Hindi", text: "Initial supported languages" },
  { icon: "user-check", title: "Human Escalation", text: "For complex or sensitive matters" },
] as const;

/* ───────── Home: voice and chat capability lists ───────── */
export const voiceCapabilities = [
  "Inbound call handling", "Outbound follow-ups", "Appointment scheduling", "Enquiry capture", "Customer information",
  "Call routing", "Approved FAQs", "Call summaries", "Human transfer where configured",
];
export const chatCapabilities = [
  "Website chat support", "Frequently asked questions", "Product and service information", "Lead capture",
  "Customer enquiry routing", "Basic support requests", "Conversation summaries", "Human handover where configured",
];

/* ───────── Home: flow ───────── */
export const flowSteps = [
  { title: "Customer", text: "Calls or chats with a question or request" },
  { title: "AI voice agent or chatbot", text: "Handles approved, routine interactions" },
  { title: "Resolution or information", text: "Answer given, details captured or request booked" },
  { title: "Human escalation when required", text: "Complex, sensitive or uncertain cases go to a person" },
  { title: "Interaction record", text: "Summary and outcome saved for review" },
] as const;

/* ───────── Why ORVANTA CX ───────── */
export const whyPoints = [
  { icon: "audio-lines", title: "AI-First Approach", text: "Routine conversations start with AI voice agents and chatbots, so people can be kept for the conversations that need them." },
  { icon: "languages", title: "English and Hindi Support", text: "Voice and chat workflows can be configured in English and Hindi. Other languages are subject to assessment." },
  { icon: "list-checks", title: "Consistent Customer Interactions", text: "Every interaction follows the approved answers and flows you have signed off, which keeps responses uniform." },
  { icon: "sliders-horizontal", title: "Flexible Service Configuration", text: "Start with one workflow and add others. Hours, channels and languages are set around your requirements." },
  { icon: "user-check", title: "Human Escalation", text: "Complex, sensitive or uncertain conversations can be passed to an authorised person, using routes agreed with you." },
  { icon: "chart-column", title: "Transparent Reporting", text: "Summaries, outcomes and escalations are reported in a format and frequency we agree with you." },
] as const;

/* ───────── Process ───────── */
export const homeProcess = [
  { title: "Understand Your Requirements", text: "We learn what customers ask, how you handle it today and what should stay with your team." },
  { title: "Design Conversation Flows", text: "Approved answers, questions and escalation rules are written for your review." },
  { title: "Configure AI Voice or Chat", text: "The voice agent or chatbot is configured and connected to the services in scope." },
  { title: "Test and Review", text: "Realistic conversations are tested and reviewed with you before anything goes live." },
  { title: "Launch with Approval", text: "We go live only after your approval and any required compliance checks." },
  { title: "Monitor and Improve", text: "Outcomes and escalations are reviewed regularly and the flows are refined." },
] as const;

export const detailedProcess = [
  { title: "Discovery", text: "Understand the client's customer interaction requirements, call volumes, business hours, languages and existing systems." },
  { title: "Conversation Design", text: "Prepare scripts, FAQs, approved responses, call flows and escalation rules." },
  { title: "AI Configuration", text: "Configure the selected AI voice or chat system and connect the required services." },
  { title: "Testing", text: "Test conversations, language handling, interruptions, incorrect inputs, routing, escalation and privacy controls." },
  { title: "Go-Live", text: "Launch only after client approval, successful testing and required compliance checks." },
  { title: "Monitoring and Improvement", text: "Review agreed performance measures, customer interaction outcomes, failed conversations, escalation patterns and improvement opportunities." },
] as const;

export const workingArrangements = [
  { title: "Client responsibilities", text: "Provide accurate business information, review and approve scripts, make sure you are permitted to contact the people involved, and keep ORVANTA CX informed of changes to your offers, prices or policies." },
  { title: "Access permissions", text: "We ask only for the access a workflow needs, for example a calendar or a data source, and agree it in advance. Access can be withdrawn." },
  { title: "Approved scripts and knowledge sources", text: "AI agents answer from the content you approve. Anything outside it is not answered from guesswork; it is captured or escalated." },
  { title: "Human escalation arrangements", text: "Transfer destinations, callback handling and the hours of the people who receive escalations are agreed with you before launch." },
  { title: "Reporting frequency", text: "Summaries and reports are provided in a format and at an interval agreed with you, for example weekly or monthly." },
  { title: "Change management", text: "Updates to scripts, prices or flows are requested in writing, tested, and approved before they replace what is live." },
  { title: "Service availability", text: "Coverage hours are configured per client. Extended or round-the-clock AI coverage depends on your requirements, the technical set-up and agreed service levels; it is not assumed." },
] as const;

/* ───────── About ───────── */
export const values = [
  { title: "Customer-first communication", text: "Conversations are designed around what the customer is trying to do, not just what is easiest to automate." },
  { title: "Responsible AI", text: "AI answers from approved information, and tells people when it cannot help rather than guessing." },
  { title: "Human accountability", text: "People remain responsible for escalations, sensitive matters and the quality of the service." },
  { title: "Data protection", text: "We aim to collect only the information a workflow needs and to limit who can see it." },
  { title: "Transparency", text: "We are clear about what is in scope, what costs extra and what we cannot yet do." },
  { title: "Continuous improvement", text: "We review outcomes and failed conversations, and refine flows over time." },
] as const;

/* ───────── Pricing ───────── */
export interface Plan {
  slug: string;
  name: string;
  price: string;
  priceSuffix: string;
  forWho: string;
  inclusions: string[];
  cta: string;
  note?: string;
}

export const plans: Plan[] = [
  {
    slug: "starter",
    name: "AI Contact Centre Starter",
    price: "₹15,000",
    priceSuffix: "per month, starting from",
    forWho: "Businesses beginning with one basic AI customer communication workflow.",
    inclusions: ["One configured voice or chat workflow", "Basic FAQ handling", "Enquiry capture", "Standard reporting", "Defined operating scope", "Basic escalation configuration"],
    cta: "Enquire about Starter",
  },
  {
    slug: "growth",
    name: "AI Contact Centre Growth",
    price: "₹35,000",
    priceSuffix: "per month, starting from",
    forWho: "Businesses requiring multiple customer communication workflows.",
    inclusions: ["Multiple approved workflows", "Voice and chat configuration", "Lead or enquiry categorisation", "Standard integrations, subject to assessment", "Regular reporting", "Escalation workflow", "Performance reviews"],
    cta: "Enquire about Growth",
  },
  {
    slug: "managed",
    name: "Managed AI Contact Centre",
    price: "₹60,000+",
    priceSuffix: "per month, starting from",
    forWho: "Businesses requiring broader managed customer interaction support.",
    inclusions: ["Multiple configured workflows", "More extensive integrations", "Advanced reporting", "Ongoing conversation optimisation", "Agreed monitoring arrangements", "Defined support and escalation arrangements"],
    cta: "Enquire about Managed",
  },
  {
    slug: "enterprise",
    name: "Enterprise Solutions",
    price: "Custom quotation",
    priceSuffix: "",
    forWho: "Businesses requiring higher interaction volumes, multiple workflows, complex integrations, multiple regions or custom service-level arrangements.",
    inclusions: [],
    cta: "Request a quotation",
  },
];

export const pricingDisclaimer =
  "All prices are indicative starting prices and are subject to technical assessment and final quotation. One-time setup charges, AI usage, telephony, phone numbers, additional integrations and other third-party costs may be charged separately or included through a specifically agreed allowance.";

export const pricingFactors = [
  "Monthly call volume", "Average call duration", "Inbound and outbound calling mix", "Concurrent calls", "Languages",
  "AI model and voice provider", "Telephony provider", "Phone number requirements", "Chat conversation volume", "Integrations",
  "Reporting requirements", "Service hours", "Human escalation requirements",
];

/* ───────── FAQ ───────── */
export const faqs = [
  {
    q: "What is an AI-powered BPO?",
    a: "A business process outsourcing (BPO) company runs a business function on behalf of other companies. In an AI-powered BPO, the routine part of that work, such as answering common questions and capturing enquiries, is handled by AI voice agents and chatbots, while people deal with exceptions and sensitive matters. ORVANTA CX applies this to customer communication.",
  },
  {
    q: "How does an AI voice agent work?",
    a: "The agent listens to the caller, understands what they are asking, and responds in natural speech using information and conversation flows you have approved. It can answer questions, collect details, book appointments where a calendar is connected, and pass the call to a person when a conversation needs one. Behind this sit speech recognition, a language model, speech generation and a telephony connection, which are selected for each project.",
  },
  {
    q: "Can your AI agents speak Hindi and English?",
    a: "English and Hindi are our initial supported languages for voice and chat. We test each workflow in the languages you need before launch. Other languages would be subject to assessment.",
  },
  {
    q: "Can you manage inbound and outbound calls?",
    a: "Yes, both can be configured. Inbound calling covers answering and routing calls. Outbound calling is limited to permitted follow-ups, reminders and qualification, and only where you have the authorisation, consent and preference records that the applicable rules require. We do not support unsolicited mass calling.",
  },
  {
    q: "Can AI transfer calls to human representatives?",
    a: "Where a transfer destination is configured, yes. Where nobody is available, the agent can take a message and record a callback request. Escalation routes, and the hours when people are available to receive transfers, are agreed with you before launch.",
  },
  {
    q: "Can you integrate with our existing systems?",
    a: "Often, subject to assessment. Typical candidates are calendars, CRM tools, support systems and e-commerce platforms. We do not assume that any integration is already connected; we review what your systems allow, confirm what is feasible, and test it before launch.",
  },
  {
    q: "How is pricing calculated?",
    a: "Our packages show indicative starting prices. The final price depends on factors such as call and chat volumes, call length, inbound and outbound mix, concurrent calls, languages, integrations, reporting and service hours. We provide a quotation after a technical assessment.",
  },
  {
    q: "Are phone calls and AI usage included in the monthly fee?",
    a: "Not automatically. One-time setup charges, AI usage, telephony, phone numbers, additional integrations and other third-party costs may be charged separately, or covered by a specifically agreed allowance. Your quotation sets out exactly what is included.",
  },
  {
    q: "Can we start with a small pilot?",
    a: "Yes, that is a sensible way to begin. We can start with one workflow, for example answering common questions or booking appointments, review how it performs, and then decide whether to extend it.",
  },
  {
    q: "Do you support international clients?",
    a: "We are based in Lucknow, India and work with clients in India and in markets such as the United Kingdom, the United States, Canada and Australia, subject to service and regulatory requirements. International pricing is quoted after we review your requirements and delivery costs.",
  },
  {
    q: "How do you protect customer information?",
    a: "We design workflows to collect only the information they need, limit access to authorised people, and agree with you what is recorded and for how long. Recordings and transcripts are not collected unless the workflow is configured for them and the required notices and permissions are in place. We do not currently claim security certifications. The details of data handling for an engagement are agreed in writing. Our Privacy Policy is currently a draft under legal review.",
  },
] as const;

/* ───────── Illustrative conversation examples ───────── */
export const conversationEn = [
  { from: "customer", text: "Hello, I want to know about your services." },
  { from: "ai", text: "Certainly. I can help you with information about our services. May I know which service you are interested in?" },
  { from: "customer", text: "I want to schedule an appointment." },
  { from: "ai", text: "I can collect your preferred date and contact details and pass your request to the appropriate team." },
] as const;

export const conversationHi = [
  { from: "customer", text: "नमस्ते, मुझे आपकी सेवाओं के बारे में जानकारी चाहिए।" },
  { from: "ai", text: "जी बिल्कुल। मैं आपको हमारी सेवाओं की जानकारी देने में मदद कर सकता हूँ। आप किस सेवा के बारे में जानना चाहते हैं?" },
  { from: "customer", text: "मैं एक अपॉइंटमेंट तय करना चाहता हूँ।" },
  { from: "ai", text: "मैं आपकी पसंदीदा तारीख़ और संपर्क जानकारी लेकर आपका अनुरोध संबंधित टीम तक पहुँचा सकता हूँ।" },
] as const;
