/** Business details preserved from albrecht-web-co-with-portfolio.astro. */
export const studio = {
  name: "Albrecht Web Co.",
  owner: "Parker Albrecht",
  url: "https://albrechtwebco.net",
  email: "Albrechtp919@gmail.com",
  phone: "+18167386774",
  phoneLabel: "(816) 738-6774",
  veteranRate: 0.85,
};
export type Page = "home" | "services" | "pricing" | "contact" | "notfound";
export const metadata: Record<Page, { title: string; description: string }> = {
  home: {
    title: "Affordable Custom Website Design | Albrecht Web Co.",
    description:
      "Affordable custom website design and affordable web design for small businesses nationwide. Custom business websites start at $300.",
  },
  services: {
    title: "Custom Coded Websites for Small Businesses | Albrecht Web Co.",
    description:
      "Custom coded websites and responsive website design for small businesses, with mobile-friendly layouts, clear navigation, and search-friendly structure.",
  },
  pricing: {
    title: "Small Business Website Packages | Albrecht Web Co.",
    description:
      "Small business website packages: Starter $300, Business $700, and Premium $1,300 one time. Optional website maintenance starts at $100/month.",
  },
  contact: {
    title: "Hire a Small Business Website Designer | Albrecht Web Co.",
    description:
      "Ready to hire someone to build a business website? Work directly with Parker Albrecht for nationwide custom business website design.",
  },
  notfound: {
    title: "Page Not Found | Albrecht Web Co.",
    description:
      "This page could not be found. Return to Albrecht Web Co. to explore custom web design services and packages.",
  },
};
export const packages = [
  {
    id: "basic",
    name: "Starter",
    number: "01",
    price: 300,
    pageLimit: 3,
    revisionRounds: 2,
    timeline: "3–5 business days",
    tagline: "Your business, online.",
    description:
      "Small business website design under $500, starting at $300. Introduce your services and make it easy to get in touch.",
    features: [
      "Custom design around your brand",
      "Layouts for phones and desktops",
      "Your services and business details",
      "Clear contact and inquiry links",
      "Descriptive page titles and structure",
    ],
    action: "Start with Starter",
  },
  {
    id: "professional",
    name: "Business",
    number: "02",
    price: 700,
    pageLimit: 7,
    revisionRounds: 3,
    timeline: "5–10 business days",
    tagline: "Room for a growing business.",
    description:
      "Affordable custom website design with more room for your services, enhanced design, clear navigation, and SEO fundamentals.",
    features: [
      "Everything in Starter",
      "More detailed service and product sections",
      "Advanced interactions and visual details",
      "Navigation designed for a larger offering",
      "SEO fundamentals: page titles, descriptions, and structure",
      "Two website update rounds per year included",
    ],
    action: "Choose Business",
  },
  {
    id: "deluxe",
    name: "Premium",
    number: "03",
    price: 1300,
    pageLimit: 12,
    revisionRounds: 4,
    timeline: "10–21 business days",
    tagline: "Your most ambitious website.",
    description:
      "Custom coded websites for small businesses, with premium design, advanced animations, interactive elements, and dedicated page URLs.",
    features: [
      "Everything in Business",
      "Premium interactive design",
      "Advanced animations and custom interactions",
      "Dedicated, descriptive page URLs",
      "Expanded on-page and technical SEO setup",
    ],
    action: "Go Premium",
  },
];
/** Planning standards supplied by the owner; the written quote confirms scope. */
export const packageScope = {
  note: "Page limits, revision rounds, and build times below are proposed planning standards. Your written quote confirms the final scope and schedule before work begins.",
  revisions: "A revision round is one consolidated list of feedback on the agreed design before launch. Additional pages or features are discussed and quoted before they are added.",
  timeline: "Estimated build time starts after your content, images, required access, and agreed scope are ready. Feedback and content delays can move the launch date.",
};
export const maintenance = {
  price: 100,
  description: "Optional website maintenance covering routine updates, maintenance, and minor content changes.",
  scopeNote: "The exact tasks, limits, and response times are confirmed in your care agreement. Larger changes and new features are quoted separately.",
};
/** Add a public URL only after checking it. An empty URL intentionally renders no live-site button. */
export const projects = [
  {
    id: "last-round",
    number: "01",
    name: "Last Round",
    category: "Nightlife / Digital product",
    status: "Live project",
    live: true,
    url: "https://lastroundllc.com/",
    domain: "lastroundllc.com",
    accent: "#d69779",
    desktop: "/portfolio/last-round-desktop.webp",
    mobile: "/portfolio/last-round-mobile.webp",
    description:
      "A custom nightlife platform for drink tracking, group plans, venue discovery, and business listings, designed for desktop and mobile.",
    services: ["Product design", "Responsive development", "Supabase & Stripe"],
    source:
      "Desktop captured from the live website on October 5, 2026. Mobile captured from the supplied October 1 source.",
    alt: "Last Round interface with night-out planning, drink tracking, and local venue discovery.",
  },
  {
    id: "rotateiq",
    number: "02",
    name: "RotateIQ",
    category: "Gaming / Interactive application",
    status: "Source preview",
    live: false,
    url: "",
    domain: "Source preview",
    accent: "#8cafcc",
    desktop: "/portfolio/rotateiq-desktop.webp",
    mobile: "/portfolio/rotateiq-mobile.webp",
    description:
      "An interactive Fortnite map with safe-circle controls, traffic estimates, timing tools, and rotation planning for competitive players.",
    services: ["Interactive maps", "Route planning", "Responsive interface"],
    source:
      "Rendered from the supplied index16.astro source, last updated September 16, 2026. Public launch URL not supplied.",
    alt: "RotateIQ interface with a Fortnite map, safe-circle editor, and rotation planning controls.",
  },
  {
    id: "wick",
    number: "03",
    name: "Wick",
    category: "Education / Web platform",
    status: "Source preview",
    live: false,
    url: "",
    domain: "Source preview",
    accent: "#c4bf91",
    desktop: "/portfolio/wick-desktop.webp",
    mobile: "/portfolio/wick-mobile.webp",
    description:
      "A trading education platform with clear lessons, interactive practice tools, paper trading, and an AI coach interface.",
    services: ["Education platform", "Interactive tools", "AI coach interface"],
    source:
      "Rendered from the supplied wick-vscode 2.zip build dated October 1, 2026. Public launch URL and production coach connection not verified.",
    alt: "Wick trading education interface with lesson navigation, market concepts, and interactive practice tools.",
  },
];

/** A product case study based on the supplied project and verified live site. */
export const portfolioCaseStudy = {
  name: "Last Round",
  heading: "One idea. A complete web experience.",
  introduction:
    "Last Round is an original product that brings night-out planning and local venue discovery together. Here’s a closer look at the work behind the live website.",
  details: [
    {
      label: "The goal",
      description:
        "Bring drink tracking, group plans, and venue discovery into one clear experience people can use on a phone or computer.",
    },
    {
      label: "What I built",
      description:
        "A custom responsive platform with planning tools, venue discovery, and business listings, presented through a consistent visual design.",
    },
    {
      label: "What it delivers",
      description:
        "A live website that gives visitors a place to explore venues and plan their night, while giving businesses a place to present their listings.",
    },
  ],
  takeaway:
    "Your business may need a simpler site, but the same care applies: make your offer easy to understand, useful on every screen, and clear about the next step. Let’s talk about what that could look like for you.",
};
