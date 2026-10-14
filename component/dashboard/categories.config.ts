// File: component/dashboard/categories.config.ts
import type { CategoryIconName } from "./CategoryIcon";

export type CategorySection = "money-income" | "street-info";

export type DashboardCategory = {
  slug: string;
  label: string;
  icon: CategoryIconName;
  description?: string;
  section: CategorySection;
  /** Defaults to /category/{slug}. */
  href?: string;
  isNew?: boolean;
};

/**
 * 1. MONEY / INCOME Categories
 * Real-world wealth generation, remote monetization, career, and business playbooks.
 */
export const moneyIncomeCategories: DashboardCategory[] = [
  {
    slug: "make-money-online",
    label: "Make Money Online",
    icon: "dollarSign",
    description: "Remote monetization, freelance platforms, and online revenue models",
    section: "money-income",
  },
  {
    slug: "business",
    label: "Business",
    icon: "briefcase",
    description: "Company formation, cashflow management, vendor negotiation, and ops",
    section: "money-income",
  },
  {
    slug: "sales-and-getting-clients",
    label: "Sales & Getting Clients",
    icon: "target",
    description: "Outreach funnels, closing playbooks, client acquisition, and retainers",
    section: "money-income",
  },
  {
    slug: "jobs-and-career",
    label: "Jobs & Career",
    icon: "award",
    description: "High-leverage career pivots, remote job vetting, and executive placement",
    section: "money-income",
  },
  {
    slug: "digital-skills",
    label: "Digital Skills",
    icon: "code",
    description: "In-demand technical competencies, design, coding, and workflow mastery",
    section: "money-income",
  },
  {
    slug: "content-creation",
    label: "Content Creation",
    icon: "video",
    description: "Audience building, storytelling, viral distribution, and sponsorships",
    section: "money-income",
  },
  {
    slug: "ai-and-technology",
    label: "AI & Technology",
    icon: "sparkles",
    description: "AI workflow automation, prompt engineering, and productivity stacks",
    section: "money-income",
    isNew: true,
  },
  {
    slug: "investing-and-personal-finance",
    label: "Investing & Personal Finance",
    icon: "trending",
    description: "Wealth preservation, risk hedging, asset allocation, and personal finance",
    section: "money-income",
  },
];

/**
 * 2. STREET INFO Categories
 * Tactical field intelligence, defense protocols, forensics, and survival guides.
 */
export const streetInfoCategories: DashboardCategory[] = [
  {
    slug: "dating",
    label: "Dating",
    icon: "heart",
    description: "Romance mechanics, catfish patterns, and verification",
    section: "street-info",
  },
  {
    slug: "blackmail-info",
    label: "Blackmail Info",
    icon: "alertTriangle",
    description: "Extortion de-escalation, counter-leverage, and containment",
    section: "street-info",
    isNew: true,
  },
  {
    slug: "bec-email-compromise",
    label: "BEC (Business Email Compromise)",
    icon: "mailAlert",
    description: "Wire transfer intercept schemes and executive protection",
    section: "street-info",
    isNew: true,
  },
  {
    slug: "secret-tips-advices",
    label: "Secret Tips & Advices",
    icon: "key",
    description: "Unpublished industry loopholes and insider workarounds",
    section: "street-info",
    isNew: true,
  },
  {
    slug: "escort-hookup-info",
    label: "Escort / Hookup Info",
    icon: "shield",
    description: "Safety protocol, blackmail hazards, and OSINT defense",
    section: "street-info",
  },
  {
    slug: "celebrity-info",
    label: "Celebrity Info",
    icon: "star",
    description: "Vetted background and operational dossiers",
    section: "street-info",
  },
  {
    slug: "celebrity-management",
    label: "Celebrity Management Info",
    icon: "users",
    description: "Talent contracts, booking models, and agency mechanics",
    section: "street-info",
  },
  {
    slug: "tutorials",
    label: "Tutorials",
    icon: "book",
    description: "Tactical step-by-step guides and execution walkthroughs",
    section: "street-info",
  },
  {
    slug: "tiktok-info",
    label: "TikTok Info",
    icon: "video",
    description: "Algorithm hooks, creator monetisation, and risk models",
    section: "street-info",
  },
  {
    slug: "facebook-info",
    label: "Facebook Info",
    icon: "messageSquare",
    description: "Ad account safeguards, marketplace security, and recovery",
    section: "street-info",
  },
  {
    slug: "twitter-info",
    label: "Twitter Info",
    icon: "messageSquare",
    description: "API updates, verification badges, and engagement trends",
    section: "street-info",
  },
  {
    slug: "telegram-info",
    label: "Telegram Info",
    icon: "messageSquare",
    description: "Channel automation, OSINT tracking, and privacy setup",
    section: "street-info",
  },
  {
    slug: "documentaries-fmt",
    label: "Documentaries / FMT",
    icon: "file",
    description: "Deep-dive case investigations and underground blueprints",
    section: "street-info",
  },
  {
    slug: "cpu-christian-pastoral",
    label: "CPU (Christian Pastoral Update)",
    icon: "cross",
    description: "Ministry updates, community stewardship, and leadership",
    section: "street-info",
  },
  {
    slug: "facee-info",
    label: "Facee Info",
    icon: "camera",
    description: "Facial recognition vectors, biometric protection, and deepfakes",
    section: "street-info",
  },
  {
    slug: "military-info",
    label: "Military Info",
    icon: "target",
    description: "Tactical doctrine, service benefits, and procurement",
    section: "street-info",
  },
  {
    slug: "inheritance-info",
    label: "Inheritance Info",
    icon: "award",
    description: "Probate estate reality, legacy imposters, and legal verification",
    section: "street-info",
  },
  {
    slug: "ngo-grants-info",
    label: "NGO & Grants Info",
    icon: "globe",
    description: "Funding proposals, grant compliance, and non-profit audits",
    section: "street-info",
  },
  {
    slug: "elon-musk-info",
    label: "Elon Musk Info",
    icon: "rocket",
    description: "Venture strategies, executive leadership, and ecosystem tracking",
    section: "street-info",
  },
  {
    slug: "leukemia-info",
    label: "Leukemia Info",
    icon: "activity",
    description: "Clinical breakdowns, research protocols, and support paths",
    section: "street-info",
  },
];

/** Legacy category aliases retained for backward-compatible routing */
export const legacyCategoryAliases: DashboardCategory[] = [
  {
    slug: "billing-strategy-scope",
    label: "Billing Strategy & Scope",
    icon: "dollarSign",
    description: "Pricing tactics, scope-creep containment, and retainers",
    section: "money-income",
  },
  {
    slug: "investment-info",
    label: "Investment Info",
    icon: "trending",
    description: "High-yield pitfalls, crypto screening, and due diligence",
    section: "money-income",
  },
  {
    slug: "web-development",
    label: "Web Development",
    icon: "code",
    description: "Fullstack architecture, security headers, and modern tools",
    section: "money-income",
  },
  {
    slug: "employment-info",
    label: "Employment Info",
    icon: "award",
    description: "Remote offer verification, hiring scams, and salary leverage",
    section: "money-income",
  },
  {
    slug: "e-commerce-info",
    label: "E-Commerce Info",
    icon: "briefcase",
    description: "Chargeback mitigation, supplier vetting, and logistics",
    section: "money-income",
  },
];

/** All active explore categories grouped into MONEY / INCOME (8) and STREET INFO (20) */
export const exploreCategories: DashboardCategory[] = [
  ...moneyIncomeCategories,
  ...streetInfoCategories,
];

// Alias for backward compatibility
export const dashboardCategories = exploreCategories;