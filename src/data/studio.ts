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
      "Small business website packages and one-time payment website design: Basic $300, Professional $700, and Deluxe $1,300 plus $100/month.",
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
    name: "Basic",
    number: "01",
    price: 300,
    monthly: 0,
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
    action: "Start with Basic",
  },
  {
    id: "professional",
    name: "Professional",
    number: "02",
    price: 700,
    monthly: 0,
    tagline: "Room for a growing business.",
    description:
      "Professional website design for small businesses that need expanded service and product sections, advanced interactions, and clear navigation.",
    features: [
      "Everything in Basic",
      "More detailed service and product sections",
      "Advanced interactions and visual details",
      "Navigation designed for a larger offering",
      "Two website update rounds per year included",
    ],
    action: "Choose Professional",
  },
  {
    id: "deluxe",
    name: "Deluxe",
    number: "03",
    price: 1300,
    monthly: 100,
    tagline: "A custom site with ongoing care.",
    description:
      "Custom business website design with advanced interactions, dedicated page URLs, and monthly care to keep your content up to date.",
    features: [
      "Everything in Professional",
      "Premium interactive design",
      "Dedicated, descriptive page URLs",
      "Expanded on-page and technical SEO setup",
      "Ongoing website care and updates",
    ],
    action: "Go Deluxe",
  },
];
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
