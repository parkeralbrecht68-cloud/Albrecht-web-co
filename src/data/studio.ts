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
    title: "Albrecht Web Co. | Military-Owned Custom Website Design",
    description:
      "Military-owned and operated web design. Bold, mobile-friendly websites from $300, with Professional and Deluxe options and a 15% veteran discount.",
  },
  services: {
    title: "Custom Website Design & Development | Albrecht Web Co.",
    description:
      "Custom web design with responsive layouts, interactive experiences, clear navigation, and search-friendly structure. Built by Albrecht Web Co.",
  },
  pricing: {
    title: "Website Design Packages from $300 | Albrecht Web Co.",
    description:
      "Compare Basic at $300, Professional at $700, and Deluxe at $1,300 plus $100/month. Veterans receive 15% off with Albrecht Web Co.",
  },
  contact: {
    title: "Start Your Website Project | Albrecht Web Co.",
    description:
      "Talk directly with Albrecht Web Co. about a custom website. Email Albrechtp919@gmail.com or call (816) 738-6774 to start your project.",
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
    tagline: "Your first great impression.",
    description:
      "A complete, polished foundation for businesses ready to make their mark online.",
    features: [
      "Custom design for your brand",
      "Mobile and desktop layouts",
      "Your services and business essentials",
      "Clear contact and inquiry links",
      "Search-friendly page titles and structure",
    ],
    action: "Start with Basic",
  },
  {
    id: "professional",
    name: "Professional",
    number: "02",
    price: 700,
    monthly: 0,
    tagline: "More business. More possibility.",
    description:
      "A more detailed, advanced website for established businesses with a growing clientele and products to showcase.",
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
    tagline: "Your most ambitious move yet.",
    description:
      "A premium web experience with deeper functionality, intentional page routing, and ongoing attention.",
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
      "A better night out, from the first plan to the last round. Drink tracking, group plans, venue discovery, and tools for local businesses.",
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
      "Read the zone. Plan the next move. An interactive Fortnite map with safe circles, traffic estimates, timing, and rotation planning.",
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
      "Trading, understood. An education platform with approachable lessons, interactive tools, paper trading, and an AI coach interface.",
    services: ["Education platform", "Interactive tools", "AI coach interface"],
    source:
      "Rendered from the supplied wick-vscode 2.zip build dated October 1, 2026. Public launch URL and production coach connection not verified.",
    alt: "Wick trading education interface with lesson navigation, market concepts, and interactive practice tools.",
  },
];
