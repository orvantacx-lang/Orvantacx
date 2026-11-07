export type IconName =
  | "phone-incoming" | "phone-outgoing" | "message-square" | "headset" | "calendar-check" | "chart-column"
  | "audio-lines" | "store" | "house" | "cloud" | "heart-pulse" | "plane" | "briefcase";

export interface Service {
  slug: string;
  href: string;
  name: string;
  /** Value used in the contact form dropdown. */
  formValue: string;
  icon: IconName;
  /** Short card text. */
  card: string;
  /** Lead paragraph on the service page. */
  description: string;
  capabilities: string[];
  suitableFor: string[];
  useCases: string[];
  process: { title: string; text: string }[];
  clientInfo: string[];
  escalation: string[];
  /** Optional caution shown prominently on the page. */
  caution?: string;
  seoTitle: string;
  seoDescription: string;
}

export const services: Service[] = [
  {
    slug: "ai-inbound-calling",
    href: "/inbound-calling",
    name: "AI Inbound Calling",
    formValue: "AI Inbound Calling",
    icon: "phone-incoming",
    card: "AI agents answer incoming calls, respond to approved questions, capture enquiries and route requests.",
    description:
      "Manage incoming customer calls through intelligent AI voice agents configured around your business information and approved conversation flows.",
    capabilities: [
      "Answer incoming enquiries",
      "Provide approved business information",
      "Capture customer details",
      "Respond to frequently asked questions",
      "Route calls to relevant departments",
      "Support appointment requests",
      "Escalate complex enquiries",
      "Create call summaries",
    ],
    suitableFor: [
      "Businesses that receive many repeated, routine questions by phone",
      "Teams that want enquiry details captured in a consistent, structured way",
      "Businesses exploring extended call coverage, subject to configuration and agreed service levels",
    ],
    useCases: [
      "Answering questions about services, prices and opening hours from an approved knowledge base",
      "Capturing a caller's name, number and reason for calling when staff are unavailable",
      "Sending appointment and callback requests to the right team",
      "Directing callers to the correct department",
    ],
    process: [
      { title: "Map your call types", text: "We review the calls you receive, how they are handled today and which ones suit AI handling." },
      { title: "Design the conversation", text: "Approved answers, questions to ask, routing rules and escalation triggers are written down for your review." },
      { title: "Configure and connect", text: "The voice agent is configured and linked to the telephony set-up and any systems that are in scope." },
      { title: "Test and approve", text: "We test realistic calls, including interruptions and unclear answers, and launch only after your approval." },
      { title: "Review summaries", text: "Call summaries and outcomes are reviewed with you so the flows can be improved." },
    ],
    clientInfo: [
      "Approved FAQs, service details and business information",
      "Departments, routing destinations and working hours",
      "Escalation contacts and what should trigger a handover",
      "Current telephony provider or number arrangements",
      "Languages required (English, Hindi)",
      "Your preferences for call recording and caller notices",
      "Any CRM, calendar or ticketing tools that may need to connect",
    ],
    escalation: [
      "Calls can be transferred to an authorised person where a transfer destination is configured.",
      "If nobody is available, the agent can take a message and record a callback request.",
      "Typical triggers: the caller asks for a person, the question is outside approved information, the topic is sensitive, or the agent cannot understand the caller after repeated attempts.",
      "Escalation routes and human availability are agreed with you before launch.",
    ],
    seoTitle: "AI Inbound Calling | AI Voice Agents for Calls",
    seoDescription:
      "AI inbound calling from ORVANTA CX: AI voice agents answer customer calls, capture enquiries, route requests and escalate to a person when needed. English and Hindi.",
  },
  {
    slug: "ai-outbound-calling",
    href: "/outbound-calling",
    name: "AI Outbound Calling",
    formValue: "AI Outbound Calling",
    icon: "phone-outgoing",
    card: "AI agents support permitted follow-ups, appointment confirmations, reminders and lead qualification.",
    description:
      "Support customer follow-ups and permitted outbound communication through AI voice agents.",
    capabilities: [
      "Appointment reminders",
      "Appointment confirmations",
      "Customer follow-ups",
      "Enquiry follow-ups",
      "Lead qualification",
      "Service reminders",
      "Customer feedback requests",
    ],
    suitableFor: [
      "Businesses that need to remind or confirm appointments with customers who have agreed to be contacted",
      "Teams that want to follow up quickly on enquiries people have already made",
      "Businesses that can provide authorised contact lists and records of consent",
    ],
    useCases: [
      "Reminding customers of an upcoming appointment and recording whether they confirm or want to reschedule",
      "Following up on a website enquiry to understand the requirement",
      "Reminding customers that a service is due",
      "Asking for feedback after a completed service",
    ],
    process: [
      { title: "Confirm permissions", text: "We agree who can be called, why, and what consent and preference records exist before anything is configured." },
      { title: "Design the call", text: "The opening, questions, permitted answers, opt-out handling and handover rules are written for your approval." },
      { title: "Configure and test", text: "The calling workflow is configured and tested internally, including calling windows and number handling." },
      { title: "Launch with approval", text: "Calling begins only with your written approval and the required compliance checks in place." },
      { title: "Review outcomes", text: "Call outcomes, opt-outs and escalations are reviewed with you and the flow is adjusted." },
    ],
    clientInfo: [
      "Contact lists you are authorised to call, with evidence of consent where required",
      "Do-not-call and opt-out records, and how new opt-outs should be handled",
      "Approved scripts, questions and permitted information",
      "Calling hours and time zones for the people being contacted",
      "Caller number arrangements and telephony provider",
      "The applicable telecom and marketing rules for the countries involved",
    ],
    escalation: [
      "Customers who want to speak to a person can be transferred or flagged for a callback, where this is configured.",
      "Opt-out requests are recorded and passed to you so the contact is not called again.",
      "Sensitive, upset or unclear conversations are flagged for human follow-up.",
      "Escalation routes and human availability are agreed with you before launch.",
    ],
    caution:
      "Outbound campaigns operate only with the necessary client authorisation, applicable consent, preference checks and telecom compliance. ORVANTA CX does not support unsolicited mass calling.",
    seoTitle: "AI Outbound Calling | Reminders and Follow-Ups",
    seoDescription:
      "AI outbound calling for permitted follow-ups, appointment reminders and lead qualification. Consent and telecom rules first, with human escalation.",
  },
  {
    slug: "ai-chat-support",
    href: "/ai-chat-support",
    name: "AI Chat Support",
    formValue: "AI Chat Support",
    icon: "message-square",
    card: "AI chatbots respond to website visitors, answer common questions and capture customer enquiries.",
    description:
      "Provide automated responses to website visitors and customers through AI-powered chat interfaces.",
    capabilities: [
      "Website chat",
      "FAQ responses",
      "Service information",
      "Product enquiries",
      "Lead capture",
      "Customer request categorisation",
      "Conversation handover",
      "Support intake",
    ],
    suitableFor: [
      "Businesses whose website visitors ask the same questions repeatedly",
      "Teams that want enquiries captured with the right details before a person follows up",
      "Businesses that want a consistent first response outside staffed hours",
    ],
    useCases: [
      "Answering questions about products, services, delivery and policies from approved content",
      "Collecting a visitor's requirements and contact details",
      "Sorting requests into categories such as sales, support and billing",
      "Handing the conversation to a person or a contact form when needed",
    ],
    process: [
      { title: "Review your content", text: "We look at your website, FAQs and policies to decide what the chatbot can answer reliably." },
      { title: "Design the conversation", text: "Greeting, answers, questions to ask visitors and handover points are drafted for your approval." },
      { title: "Configure the chatbot", text: "The chatbot is set up with your approved content and tone, in English or Hindi." },
      { title: "Test and approve", text: "We test common, unusual and unclear questions and launch after your approval." },
      { title: "Review conversations", text: "Conversation summaries and unanswered questions guide improvements to the content." },
    ],
    clientInfo: [
      "Your website address and the pages where chat should appear",
      "Approved FAQs, product and service information, and policies",
      "Tone of voice and languages (English, Hindi)",
      "What details to collect from visitors, and where leads should be sent",
      "Who should receive handovers and in which channel",
    ],
    escalation: [
      "Visitors can be handed to a person or directed to a contact form where a handover route is configured.",
      "Questions outside approved content are acknowledged honestly and passed on rather than guessed.",
      "Complaints and sensitive topics are flagged for human follow-up.",
      "Escalation routes and human availability are agreed with you before launch.",
    ],
    seoTitle: "AI Chat Support | Chatbot Services for Websites",
    seoDescription:
      "AI chat support from ORVANTA CX: chatbots that answer common questions, capture enquiries and hand over to a person where needed. Available in English and Hindi.",
  },
  {
    slug: "ai-customer-support",
    href: "/services#ai-customer-support",
    name: "AI Customer Support",
    formValue: "AI Customer Support",
    icon: "headset",
    card: "First-line support for common questions and routine requests through approved AI workflows.",
    description:
      "Manage common customer questions and routine support interactions through approved AI workflows.",
    capabilities: [
      "First-line customer support",
      "General enquiries",
      "Order-status questions where authorised data is available",
      "Delivery information",
      "Appointment information",
      "Complaint intake",
      "Support request routing",
    ],
    suitableFor: [
      "Businesses with a steady flow of routine support questions",
      "Support teams that want routine requests handled first and complex ones passed on with the details captured",
      "Businesses that can provide approved answers and, where needed, secure access to order or booking information",
    ],
    useCases: [
      "Answering delivery, returns and policy questions from approved information",
      "Giving order status when an authorised data source is connected",
      "Recording a complaint with the relevant details and passing it to the right person",
      "Routing requests to the correct team",
    ],
    process: [
      { title: "Sort your request types", text: "We group the requests you receive into those suitable for AI handling and those that need a person." },
      { title: "Write approved answers", text: "Answers, checks and routing rules are drafted for your approval." },
      { title: "Configure over voice or chat", text: "The workflow is configured for the channel you choose and connected to any data source that is in scope." },
      { title: "Test and launch", text: "We test typical and awkward cases and launch after your approval." },
      { title: "Improve over time", text: "Escalation patterns and unanswered questions are reviewed with you." },
    ],
    clientInfo: [
      "Approved answers, policies and process descriptions",
      "Which requests must always go to a person",
      "Whether order or booking data can be shared securely, and through which system",
      "Escalation contacts, channels and working hours",
      "Languages required",
    ],
    escalation: [
      "Complaints are recorded and routed to an authorised person; the AI does not claim to resolve every complaint.",
      "Anything outside approved answers, or involving a sensitive situation, is escalated.",
      "Customers can ask for a person at any point where a handover route is configured.",
      "Escalation routes and human availability are agreed with you before launch.",
    ],
    caution: "AI support handles routine, approved interactions. It is not designed to resolve every complaint or make decisions that need human judgement.",
    seoTitle: "AI Customer Support Services | First-Line Support with Human Escalation",
    seoDescription:
      "AI customer support for routine questions, order information and complaint intake, with human escalation for complex or sensitive matters. From ORVANTA CX in India.",
  },
  {
    slug: "ai-lead-qualification-appointment-booking",
    href: "/services#ai-lead-qualification-appointment-booking",
    name: "AI Lead Qualification and Appointment Booking",
    formValue: "AI Lead Qualification",
    icon: "calendar-check",
    card: "Capture and qualify enquiries through structured AI conversations and schedule appointments.",
    description:
      "Capture and qualify enquiries through structured AI-powered conversations.",
    capabilities: [
      "Ask approved qualification questions",
      "Capture prospect requirements",
      "Identify enquiry categories",
      "Schedule appointments using connected calendars",
      "Pass qualified leads to client teams",
      "Maintain enquiry records",
    ],
    suitableFor: [
      "Businesses that receive enquiries and want them qualified before a person follows up",
      "Teams that lose time arranging meetings, site visits or consultations",
      "Businesses with a clear idea of what makes an enquiry a good fit",
    ],
    useCases: [
      "Asking a new enquirer a few agreed questions and recording the answers",
      "Booking a consultation or demo in a connected calendar",
      "Sorting enquiries by type so the right person follows up",
      "Keeping a clean record of every enquiry received",
    ],
    process: [
      { title: "Define a good enquiry", text: "We agree the questions to ask and what makes an enquiry qualified, unclear or out of scope." },
      { title: "Design the conversation", text: "The questions, answers and booking steps are written for your approval." },
      { title: "Connect the calendar", text: "Booking is configured against your calendar or scheduling tool, subject to assessment of that tool." },
      { title: "Test and launch", text: "We test bookings, changes and awkward answers, then launch after your approval." },
      { title: "Review lead quality", text: "We review the enquiries with you and refine the questions." },
    ],
    clientInfo: [
      "Your qualification questions and the answers that matter",
      "Services or products to describe, within approved information",
      "Calendar or scheduling tool, availability rules and meeting types",
      "Where qualified leads and records should be sent",
      "Languages and channels (voice, chat or both)",
    ],
    escalation: [
      "Enquiries that are unclear, high-value or sensitive can be flagged for a person to follow up promptly.",
      "Callers or visitors who prefer to speak to a person can be passed on or offered a callback, where configured.",
      "Booking problems, such as unavailable slots, are handed to your team with the details captured.",
      "Escalation routes and human availability are agreed with you before launch.",
    ],
    seoTitle: "AI Lead Qualification & Appointment Booking | ORVANTA CX",
    seoDescription:
      "AI lead qualification and appointment booking through voice and chat: ask approved questions, capture requirements, schedule meetings and pass leads to your team.",
  },
  {
    slug: "ai-call-analytics-reporting",
    href: "/services#ai-call-analytics-reporting",
    name: "AI Call Analytics and Reporting",
    formValue: "Call Analytics and Reporting",
    icon: "chart-column",
    card: "Structured summaries, outcome categories and reporting that make customer interactions easier to review.",
    description:
      "Make customer interactions easier to review through structured summaries and reporting.",
    capabilities: [
      "Call summaries",
      "Transcripts where enabled and lawfully recorded",
      "Call outcome categorisation",
      "Enquiry classification",
      "Escalation tracking",
      "Reporting dashboards",
      "Quality review support",
    ],
    suitableFor: [
      "Businesses that want to understand why customers contact them",
      "Managers who need a clear record of outcomes and escalations",
      "Teams that want to review quality without listening to every call",
    ],
    useCases: [
      "Reading short summaries instead of full call recordings",
      "Seeing how many interactions ended in resolution, a booking or an escalation",
      "Spotting questions the AI could not answer so content can be improved",
      "Supporting quality reviews of sampled conversations",
    ],
    process: [
      { title: "Agree what to measure", text: "We decide the outcomes, categories and measures that are useful to you." },
      { title: "Set up capture", text: "Summaries and, only where enabled and lawfully permitted, transcripts are configured, with the right notices in place." },
      { title: "Build the reports", text: "Reports are prepared in a format and frequency agreed with you." },
      { title: "Review together", text: "We go through the findings with you and decide improvements." },
    ],
    clientInfo: [
      "The measures and categories that matter to your business",
      "Your decisions on recording and transcripts, and the notices you give callers",
      "Who should receive reports, and how often",
      "Existing reporting tools or spreadsheets, if any",
    ],
    escalation: [
      "Escalated interactions are tracked so you can see how often, and why, a person was needed.",
      "Conversations flagged as sensitive can be marked for human review.",
      "Quality findings feed back into the approved scripts and escalation rules.",
    ],
    caution:
      "Recordings and transcripts are not collected automatically. They are enabled only where the workflow is configured and the required legal notices and permissions are in place.",
    seoTitle: "AI Call Analytics & Reporting | Call Summaries and Outcome Tracking",
    seoDescription:
      "AI call analytics and reporting: call summaries, outcome categories, escalation tracking and quality review support. Transcripts only where enabled and lawfully recorded.",
  },
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);

/** Overview page for the voice offering (not one of the six listed services; it spans inbound and outbound). */
export const voiceSolutions: Service = {
  slug: "ai-voice-solutions",
  href: "/ai-voice-solutions",
  name: "AI Voice Solutions",
  formValue: "Complete AI Contact Centre",
  icon: "audio-lines",
  card: "AI voice agents that handle approved phone conversations, with human transfer where configured.",
  description:
    "AI voice agents hold natural spoken conversations on the phone, using information and call flows that you have approved. They answer, ask the right questions, record what was said and, when a conversation needs a person, pass it on.",
  capabilities: [
    "Inbound call handling",
    "Outbound follow-ups, where permitted",
    "Appointment scheduling, with a connected calendar",
    "Enquiry capture",
    "Customer information, from authorised sources only",
    "Call routing",
    "Approved FAQs",
    "Call summaries",
    "Human transfer where configured",
  ],
  suitableFor: [
    "Businesses whose staff spend much of the day answering the same questions by phone",
    "Teams that miss enquiries when lines are busy or the office is closed",
    "Businesses that want phone enquiries captured in a consistent format",
  ],
  useCases: [
    "Answering service, price and opening-hours questions from an approved knowledge base",
    "Taking appointment and callback requests and sending them to the right team",
    "Appointment reminders and confirmations to customers who have agreed to be contacted",
    "Qualifying enquiries with a short set of approved questions",
  ],
  process: [
    { title: "Choose the call types", text: "We agree which calls the voice agent will handle and which stay with your team." },
    { title: "Write the conversations", text: "Scripts, answers and escalation rules are drafted for your approval, in English, Hindi or both." },
    { title: "Configure and test", text: "The voice agent and telephony connection are configured and tested with realistic calls, including interruptions and unclear speech." },
    { title: "Launch and review", text: "We go live only after your approval, then review call outcomes and refine the flows." },
  ],
  clientInfo: [
    "The types of calls you receive and roughly how many",
    "Approved answers, prices, policies and opening hours",
    "Who should receive transferred calls, and when they are available",
    "Languages required, and any phrases or names that must be pronounced correctly",
    "Your telephony provider or number requirements, if you have them",
    "Any recording, notice or consent requirements that apply to your callers",
  ],
  escalation: [
    "Calls the agent cannot answer from approved information are captured or passed on rather than guessed.",
    "Callers who ask for a person, or whose request is sensitive, can be transferred where a destination is configured.",
    "Where nobody is available, the agent records a callback request and tells the caller what will happen next.",
    "Transfer destinations and the hours of the people receiving them are agreed with you before launch.",
  ],
  caution:
    "Voice agents should identify themselves as AI when asked or where the law requires it. Recording and transcription are used only where a workflow is configured for them and the required notices and permissions are in place.",
  seoTitle: "AI Voice Solutions for Business Calls | ORVANTA CX",
  seoDescription:
    "AI voice agents from ORVANTA CX handle inbound and permitted outbound calls in English and Hindi, from approved scripts, with human transfer where configured.",
};
