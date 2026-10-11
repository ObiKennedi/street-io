// File: component/dashboard/categories.config.ts
import type { CategoryIconName } from "./CategoryIcon";

export type DashboardCategory = {
  slug: string;
  label: string;
  icon: CategoryIconName;
  description?: string;
  /** Defaults to /category/{slug}. */
  href?: string;
  isNew?: boolean;
};

export const exploreCategories: DashboardCategory[] = [
  { slug: "celebrity-info", label: "Celebrity Info", icon: "star", description: "Vetted background and operational dossiers" },
  { slug: "celebrity-management", label: "Celebrity Management Info", icon: "users", description: "Talent contracts, booking models, and agency mechanics" },
  { slug: "dating", label: "Dating", icon: "heart", description: "Romance mechanics, catfish patterns, and verification" },
  { slug: "tutorials", label: "Tutorials", icon: "video", description: "Tactical step-by-step guides and execution walkthroughs" },
  { slug: "tiktok-info", label: "TikTok Info", icon: "video", description: "Algorithm hooks, creator monetisation, and risk models" },
  { slug: "facebook-info", label: "Facebook Info", icon: "messageSquare", description: "Ad account safeguards, marketplace security, and recovery" },
  { slug: "twitter-info", label: "Twitter Info", icon: "messageSquare", description: "API updates, verification badges, and engagement trends" },
  { slug: "billing-strategy-scope", label: "Billing Strategy & Scope", icon: "dollarSign", description: "Pricing tactics, scope-creep containment, and retainers" },
  { slug: "investment-info", label: "Investment Info", icon: "trending", description: "High-yield pitfalls, crypto screening, and due diligence" },
  { slug: "cpu-christian-pastoral", label: "CPU (Christian Pastoral Update)", icon: "cross", description: "Ministry updates, community stewardship, and leadership" },
  { slug: "telegram-info", label: "Telegram Info", icon: "messageSquare", description: "Channel automation, OSINT tracking, and privacy setup" },
  { slug: "documentaries-fmt", label: "Documentaries / FMT", icon: "file", description: "Deep-dive case investigations and underground blueprints" },
  { slug: "web-development", label: "Web Development", icon: "code", description: "Fullstack architecture, security headers, and modern tools" },
  { slug: "secret-tips-advices", label: "Secret Tips & Advices", icon: "key", description: "Unpublished industry loopholes and insider workarounds", isNew: true },
  { slug: "escort-hookup-info", label: "Escort / Hookup Info", icon: "shield", description: "Safety protocol, blackmail hazards, and OSINT defense" },
  { slug: "employment-info", label: "Employment Info", icon: "briefcase", description: "Remote offer verification, hiring scams, and salary leverage" },
  { slug: "elon-musk-info", label: "Elon Musk Info", icon: "rocket", description: "Venture strategies, executive leadership, and ecosystem tracking" },
  { slug: "leukemia-info", label: "Leukemia Info", icon: "activity", description: "Clinical breakdowns, research protocols, and support paths" },
  { slug: "facee-info", label: "Facee Info", icon: "camera", description: "Facial recognition vectors, biometric protection, and deepfakes" },
  { slug: "military-info", label: "Military Info", icon: "target", description: "Tactical doctrine, service benefits, and procurement" },
  { slug: "bec-email-compromise", label: "BEC (Business Email Compromise)", icon: "mailAlert", description: "Wire transfer intercept schemes and executive protection", isNew: true },
  { slug: "inheritance-info", label: "Inheritance Info", icon: "award", description: "Probate estate reality, legacy imposters, and legal verification" },
  { slug: "ngo-grants-info", label: "NGO & Grants Info", icon: "globe", description: "Funding proposals, grant compliance, and non-profit audits" },
  { slug: "e-commerce-info", label: "E-Commerce Info", icon: "shoppingBag", description: "Chargeback mitigation, supplier vetting, and logistics" },
  { slug: "blackmail-info", label: "Blackmail Info", icon: "alertTriangle", description: "Extortion de-escalation, counter-leverage, and containment", isNew: true },
];

// Alias for backward compatibility
export const dashboardCategories = exploreCategories;