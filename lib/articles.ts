// File: lib/articles.ts
import { exploreCategories, type DashboardCategory } from "@/component/dashboard/categories.config";

export type Article = {
  id: string;
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  price: string;
  isUnlocked?: boolean;
  readTime: string;
  description: string;
  contentSnippet: string;
  keyTakeaways: string[];
  tags: string[];
  weeklyReads: number;
  monthlyReads: number;
  totalReads: number;
  trendingDelta: string;
  uploadedAt?: string;
};

export type TrendingTimeframe = "weekly" | "monthly";

export type TrendingArticle = Article & {
  rank: number;
  currentReads: number;
};

export const ARTICLES_DATABASE: Article[] = [
  // 1. Dating
  {
    id: "art-1",
    slug: "spot-romance-scam-guide",
    title: "How to Spot a Romance Scam: Operational Playbook & Red Flags",
    category: "Dating",
    categorySlug: "dating",
    price: "₦3,500",
    readTime: "9 min read",
    description: "An investigative breakdown of romance scam scripts, emotional priming tactics, photo theft verification, and fake emergency money requests.",
    contentSnippet: "Romance scammers operate using standardized emotional engineering scripts. Key indicators include fast love-bombing, refusal or constant excuses to avoid live video calls (citing deployment, broken cameras, offshore contracts), and gradual financial escalation: starting with small emergencies (medical bills, customs fees, gift cards) leading to crypto investments. Use reverse image search on Yandex and TinEye, cross-reference metadata, and never wire unverified funds.",
    keyTakeaways: [
      "Rapid declarations of affection followed by isolation from family and friends.",
      "Inability to meet in person or connect on real-time verifiable video.",
      "Sudden crises requiring immediate wire transfers, cryptocurrency, or gift cards."
    ],
    tags: ["romance scam", "dating", "catfish", "love bombing", "online safety", "scams"],
    weeklyReads: 28450,
    monthlyReads: 94200,
    totalReads: 242000,
    trendingDelta: "+48%"
  },
  {
    id: "art-1b",
    slug: "catfish-biometric-verification-protocol",
    title: "Catfish Biometric Verification: How to Validate Real Identity Before Meeting",
    category: "Dating",
    categorySlug: "dating",
    price: "₦2,800",
    readTime: "6 min read",
    description: "Tactical verification steps: requesting timestamped physical gestures, reverse audio voice note analysis, and checking registered phone carrier metadata.",
    contentSnippet: "Before meeting online acquaintances or investing emotionally, implement zero-trust identity verification. Request a short real-time video greeting with a dynamic prompt (e.g. hold up 3 fingers and touch your ear). Real human contacts comply without hesitation; AI deepfakes and catfish impersonators create excuses.",
    keyTakeaways: [
      "Dynamic real-time gesture requests instantly defeat pre-recorded video loops and mid-tier deepfakes.",
      "Cross-check phone number carrier type: VoIP numbers (Google Voice, TextNow) indicate burner identity.",
      "Scrutinize social media friend networks for local organic connections."
    ],
    tags: ["dating", "catfish", "biometrics", "verification", "online safety"],
    weeklyReads: 14200,
    monthlyReads: 48900,
    totalReads: 110000,
    trendingDelta: "+31%"
  },

  // 2. BEC (Business Email Compromise)
  {
    id: "art-2",
    slug: "bec-wire-transfer-defense",
    title: "BEC (Business Email Compromise): Wire Intercept & Executive Impersonation",
    category: "BEC (Business Email Compromise)",
    categorySlug: "bec-email-compromise",
    price: "₦5,000",
    readTime: "12 min read",
    description: "How sophisticated adversaries compromise corporate email inboxes, spoof vendor domains, and divert 6-figure invoices into dummy accounts.",
    contentSnippet: "Business Email Compromise (BEC) accounts for billions in corporate losses annually. Attackers use lookalike domains (typosquatting like comapny.com instead of company.com) or compromised partner inboxes. They monitor email threads until an invoice is due, then inject a legitimate-looking updated routing number citing 'audit banking changes'. Countermeasure: Always mandate out-of-band phone verification using an established contact number before altering vendor wire details.",
    keyTakeaways: [
      "Implement multi-person approval and mandatory out-of-band telephone callbacks for payment detail changes.",
      "Enforce DMARC, DKIM, and SPF protocols alongside external email banner warnings.",
      "Monitor mailbox forwarding rules which attackers silently deploy upon initial compromise."
    ],
    tags: ["bec", "wire transfer", "executive impersonation", "invoice fraud", "business email compromise"],
    weeklyReads: 24900,
    monthlyReads: 112500,
    totalReads: 310000,
    trendingDelta: "+32%"
  },
  {
    id: "art-2b",
    slug: "ceo-fraud-urgent-wire-containment",
    title: "CEO Fraud & Executive Urgent Wire Containment Playbook",
    category: "BEC (Business Email Compromise)",
    categorySlug: "bec-email-compromise",
    price: "₦4,500",
    readTime: "10 min read",
    description: "Responding to emergency 'secret acquisition' emails spoofing the CEO. How CFOs and controllers safeguard treasury operations.",
    contentSnippet: "Adversaries research corporate hierarchy on LinkedIn and strike during executive travel or earnings windows. They send high-urgency emails marked 'Strictly Confidential: Wire deposit for closing acquisition'. This guide provides the emergency pause protocol, bank recall process (within 72 hours), and IC3 asset recovery procedures.",
    keyTakeaways: [
      "Never execute wires on text/email instruction alone regardless of urgency or seniority.",
      "Dual-authorization security tokens must reside with separate financial officers.",
      "Initiate SWIFT Recall and FBI Kill Chain within 48 hours if a fraudulent wire was dispatched."
    ],
    tags: ["bec", "ceo fraud", "wire recall", "treasury security", "executive protection"],
    weeklyReads: 17800,
    monthlyReads: 68400,
    totalReads: 185000,
    trendingDelta: "+25%"
  },

  // 3. Blackmail Info
  {
    id: "art-3",
    slug: "blackmail-deescalation-protocol",
    title: "Blackmail & Digital Extortion: The Tactical Containment Playbook",
    category: "Blackmail Info",
    categorySlug: "blackmail-info",
    price: "₦4,500",
    readTime: "11 min read",
    description: "What to do within the first 60 minutes of a blackmail attempt. How to cut emotional leverage, preserve digital evidence, and neutralize extortionists.",
    contentSnippet: "When targeted by digital blackmail (including webcam sextortion, private message leaks, or compromised files), the cardinal rule is: NEVER PAY. Paying proves the extortion works and guarantees subsequent higher demands. Immediate protocol: Take unedited screenshots of all messages and account handles, record payment wallet IDs, lock down social media privacy, cease communication without blocking abruptly, and submit reports to IC3 / law enforcement.",
    keyTakeaways: [
      "Do not pay: compliance converts an extortionist from a threat into a recurring predator.",
      "Archive verifiable timestamped evidence before attackers delete accounts or retract messages.",
      "Lock down all mutual friend lists on Instagram, Facebook, and LinkedIn immediately."
    ],
    tags: ["blackmail", "extortion", "sextortion", "crisis containment", "cyber safety"],
    weeklyReads: 21800,
    monthlyReads: 88400,
    totalReads: 195000,
    trendingDelta: "+56%"
  },

  // 4. Investment Info
  {
    id: "art-4",
    slug: "crypto-investment-scam-red-flags",
    title: "Investment Info: Uncovering High-Yield Crypto & Staking Traps",
    category: "Investment Info",
    categorySlug: "investment-info",
    price: "₦3,800",
    readTime: "8 min read",
    description: "Deconstructing 'Pig Butchering' (Sha Zhu Pan) schemes, fake trading dashboards, and withdrawal tax fee traps.",
    contentSnippet: "High-yield investment fraud frequently employs customized web applications that simulate real-time profits. The victim deposits funds and sees their account balance multiply rapidly. When an attempt to withdraw funds is made, the fraudulent platform demands a 20% 'capital gains tax' or 'liquidity release deposit'. Once paid, customer support disappears. Authentic investment funds never require secondary off-platform payments to withdraw principal.",
    keyTakeaways: [
      "Guaranteed daily or weekly returns over 1% are mathematical impossibilities and signal fraud.",
      "Never trade on customized platforms recommended by strangers met via Telegram, WhatsApp, or dating apps.",
      "Verify domain registration dates via WHOIS lookup — scam platforms are typically under 90 days old."
    ],
    tags: ["investment", "crypto", "pig butchering", "sha zhu pan", "fake trading", "financial due diligence"],
    weeklyReads: 19400,
    monthlyReads: 98100,
    totalReads: 285000,
    trendingDelta: "+24%"
  },

  // 5. Secret Tips & Advices
  {
    id: "art-5",
    slug: "secret-tips-industry-workarounds",
    title: "Secret Tips & Advices: Unpublished Industry Loopholes & NDA Leverage",
    category: "Secret Tips & Advices",
    categorySlug: "secret-tips-advices",
    price: "₦4,200",
    readTime: "10 min read",
    description: "Unwritten operational rules across venture contracts, vendor negotiations, non-compete enforceability, and corporate leverage mechanics.",
    contentSnippet: "Every regulated industry operates with an unwritten subtext. Discover standard arbitration carve-outs, how to legally structure side-letter consulting without triggering non-compete clauses, and tactics to trigger executive fast-track review. Practical counter-measures to preserve ownership of intellectual work.",
    keyTakeaways: [
      "Review territorial and duration limits on non-compete clauses; courts in multiple jurisdictions decline broad restrictions.",
      "Insist on carved-out grandfathered project clauses before signing employment agreements.",
      "Use timestamped git commits or cryptographic hash registries to prove prior invention."
    ],
    tags: ["secret tips", "workarounds", "nda", "contracts", "negotiation", "insider playbooks"],
    weeklyReads: 18200,
    monthlyReads: 67300,
    totalReads: 145000,
    trendingDelta: "+74%"
  },

  // 6. TikTok Info
  {
    id: "art-6",
    slug: "tiktok-algorithm-monetisation-playbook",
    title: "TikTok Info: Algorithmic Hooks, Creator Monetisation & Shadowban Defense",
    category: "TikTok Info",
    categorySlug: "tiktok-info",
    price: "₦3,500",
    readTime: "9 min read",
    description: "Reverse-engineering TikTok's 3-second completion metrics, retention graphs, affiliate shop conversions, and account health recovery.",
    contentSnippet: "TikTok distribution operates on strict velocity thresholds within batch test pools of 200 to 500 viewers. Key scoring metrics prioritize watch time percentage (aim for >85% on 30s clips) and re-watches over raw likes. Learn how to diagnose shadowbans caused by automated community flag false-positives and configure ad accounts safely.",
    keyTakeaways: [
      "The first 2.5 seconds determines 70% of distribution tier qualification.",
      "Avoid deleting flagged videos abruptly; set them to private to prevent account trust penalties.",
      "Structure multi-account management using separate 4G/5G mobile proxies to prevent IP cluster linking."
    ],
    tags: ["tiktok", "algorithm", "creator fund", "monetisation", "social media", "shadowban"],
    weeklyReads: 16700,
    monthlyReads: 73800,
    totalReads: 180000,
    trendingDelta: "+39%"
  },

  // 7. Billing Strategy & Scope
  {
    id: "art-7",
    slug: "billing-strategy-scope-management",
    title: "Billing Strategy and Scope: Retainers, Milestones & Scope Creep",
    category: "Billing Strategy & Scope",
    categorySlug: "billing-strategy-scope",
    price: "₦4,000",
    readTime: "10 min read",
    description: "Protect your service agency margins with watertight scoping agreements, milestone release triggers, and change-order pricing structures.",
    contentSnippet: "Scope creep silently destroys service business margins. This guide provides exact contract clauses for revision caps, milestone acceptance windows, and hourly rate step-ups for out-of-scope requests. Learn how to convert volatile fixed-fee engagements into recurring monthly advisory retainers with upfront deposits.",
    keyTakeaways: [
      "Define deliverables by verifiable specifications rather than subjective stakeholder satisfaction.",
      "Institute automated change-order authorization forms before commencing out-of-scope tasks.",
      "Require 50% upfront retainer deposits before dedicating operational capacity."
    ],
    tags: ["billing", "scope creep", "retainers", "consulting", "contracts", "agency strategy"],
    weeklyReads: 15300,
    monthlyReads: 81200,
    totalReads: 215000,
    trendingDelta: "+19%"
  },

  // 8. Telegram Info
  {
    id: "art-8",
    slug: "telegram-osint-privacy-blueprints",
    title: "Telegram Info: Channel Automation, Bot Footprints & OSINT Defense",
    category: "Telegram Info",
    categorySlug: "telegram-info",
    price: "₦4,500",
    readTime: "11 min read",
    description: "Securing your Telegram identity, tracing malicious bot networks, and preventing phone number leaks in public group ecosystems.",
    contentSnippet: "Telegram provides robust messaging but contains critical metadata leak vectors if default privacy options are unchanged. Discover how attackers scrape group members, deploy malicious automated trading bots, and exploit peer-to-peer call IP leak vulnerabilities. Step-by-step guidance to lockdown forward privacy, peer-to-peer voice routing, and session authorization.",
    keyTakeaways: [
      "Disable peer-to-peer call routing to prevent direct IP address exposure to callers.",
      "Set phone number visibility to 'Nobody' and restrict group invitations to verified contacts only.",
      "Audit active sessions weekly and enforce two-step cloud passwords."
    ],
    tags: ["telegram", "osint", "privacy", "bots", "metadata", "channel security"],
    weeklyReads: 13900,
    monthlyReads: 62400,
    totalReads: 160000,
    trendingDelta: "+28%"
  },

  // 9. Inheritance Info
  {
    id: "art-9",
    slug: "inheritance-probate-imposter-schemes",
    title: "Inheritance Info: Identifying Fake Estate Barrister & Probate Scams",
    category: "Inheritance Info",
    categorySlug: "inheritance-info",
    price: "₦3,000",
    readTime: "7 min read",
    description: "Letters from fake European or Caribbean barristers claiming an unclaimed multi-million dollar inheritance sharing your surname.",
    contentSnippet: "Inheritance fraud relies on greed and vanity. The fraudster pretends to be a senior legal counsel searching for the next of kin to a deceased foreign national with an identical surname. They offer a 50/50 split of millions of dollars if you pose as the rightful beneficiary. They will demand administrative processing fees, anti-money laundering clearance certificates, and probate filing fees. Authentic legal estates are settled through formal court notices.",
    keyTakeaways: [
      "Legitimate probate attorneys never ask beneficiaries to send advance wire transfers to unlock estates.",
      "Foreign courts publish unclaimed estates on official government gazettes.",
      "Any proposal to falsify relationship credentials constitutes felony fraud."
    ],
    tags: ["inheritance", "probate", "barrister scam", "next of kin", "advance fee fraud"],
    weeklyReads: 12400,
    monthlyReads: 59100,
    totalReads: 138000,
    trendingDelta: "+15%"
  },

  // 10. Employment Info
  {
    id: "art-10",
    slug: "remote-employment-check-fraud",
    title: "Employment Info: Remote Job Interview Scams & Fake Equipment Checks",
    category: "Employment Info",
    categorySlug: "employment-info",
    price: "₦3,000",
    readTime: "8 min read",
    description: "The mechanics of text-only Telegram interviews, fake PDF offer letters, and counterfeit cashier check home office equipment schemes.",
    contentSnippet: "Job seekers are frequently lured by lucrative remote data entry or executive assistant positions. The interview is conducted entirely over chat (Telegram, Signal, Microsoft Teams). An offer letter is immediately issued, followed by a digital check for $2,500 to 'buy home office equipment from an approved vendor'. The check bounces 4 business days later after the victim has wired real money to the fake vendor.",
    keyTakeaways: [
      "Legitimate companies never conduct entire interview cycles exclusively via anonymous messaging apps.",
      "Employers provide hardware directly or reimburse through established corporate payroll systems.",
      "Banks credit deposited checks provisionally before clearing; cleared balance verification is essential."
    ],
    tags: ["employment", "job scam", "fake check", "remote work", "hiring fraud"],
    weeklyReads: 11800,
    monthlyReads: 54900,
    totalReads: 122000,
    trendingDelta: "+22%"
  },

  // 11. Celebrity Management Info
  {
    id: "art-11",
    slug: "celebrity-management-contract-realities",
    title: "Celebrity Management Info: Booking Rider Scams & Representation Contracts",
    category: "Celebrity Management Info",
    categorySlug: "celebrity-management",
    price: "₦3,800",
    readTime: "8 min read",
    description: "How fake booking agents forge artist representation letters and how genuine talent managers structure riders and appearance escrow.",
    contentSnippet: "In event booking and talent management, counterfeit booking agents routinely impersonate high-profile management agencies (CAA, WME, UTA) using forged Letter of Intent documents. Learn how escrow accounts are verified, standard talent deposit schedules, and how to verify direct agency roster representation.",
    keyTakeaways: [
      "Always verify representation directly via agency switchboard or official agent email domain.",
      "Talent deposits must be held in accredited third-party legal escrow, never personal peer-to-peer transfers.",
      "Scrutinize technical riders for standard industry boilerplate specifications."
    ],
    tags: ["celebrity management", "booking agent", "talent riders", "contract law", "entertainment"],
    weeklyReads: 9800,
    monthlyReads: 48300,
    totalReads: 98000,
    trendingDelta: "+12%"
  },

  // 12. Web Development
  {
    id: "art-12",
    slug: "web-development-security-hardening",
    title: "Web Development: Hardening Next.js & API Endpoints Against Tampering",
    category: "Web Development",
    categorySlug: "web-development",
    price: "₦5,500",
    readTime: "14 min read",
    description: "Production security checklist: Content Security Policy, rate limiting, SSR auth validation, and SQL driver protection.",
    contentSnippet: "Building modern web applications requires proactive defensive architecture. Explore how to configure CSP headers to neutralize XSS, implement Redis or memory-based sliding window rate limits, validate authenticated sessions on Server Actions and Route Handlers, and eliminate parameter pollution.",
    keyTakeaways: [
      "Do not rely solely on middleware for sensitive route protection; validate sessions inside server components.",
      "Implement strict Content-Security-Policy with nonces to prevent unauthorized script injection.",
      "Enforce server-side schema validation on all incoming payload bodies using Zod."
    ],
    tags: ["web development", "nextjs", "security", "api defense", "csp", "fullstack"],
    weeklyReads: 8900,
    monthlyReads: 44100,
    totalReads: 110000,
    trendingDelta: "+18%"
  },

  // 13. Celebrity Info
  {
    id: "art-13",
    slug: "celebrity-dossier-vetting-publicist-claims",
    title: "Celebrity Info: Vetting Background Dossiers, LLC Holding Shells & Impersonators",
    category: "Celebrity Info",
    categorySlug: "celebrity-info",
    price: "₦3,500",
    readTime: "9 min read",
    description: "Investigating celebrity representation claims, verification badges, corporate Delaware holding shells, and fake charity galas.",
    contentSnippet: "Verifying high-profile individuals requires cross-referencing corporate registry filings, accredited management rosters, and public court dockets. Learn how scammers forge celebrity endorsements for private equity and how investigative researchers audit genuine talent commitments.",
    keyTakeaways: [
      "Cross-examine SAG-AFTRA or talent directory registry filings before entering commercial licensing agreements.",
      "Analyze photo metadata and background lighting artifacts to identify synthetic composite imagery.",
      "Delaware and Wyoming corporate holding shells require out-of-band officer verification."
    ],
    tags: ["celebrity", "publicist", "due diligence", "entity registration", "entertainment"],
    weeklyReads: 10400,
    monthlyReads: 41200,
    totalReads: 87000,
    trendingDelta: "+16%"
  },

  // 14. Tutorials
  {
    id: "art-14",
    slug: "tactical-osint-dossier-verification",
    title: "Tutorials: Step-by-Step Tactical OSINT Dossier Verification",
    category: "Tutorials",
    categorySlug: "tutorials",
    price: "₦4,000",
    readTime: "13 min read",
    description: "A hands-on operational walkthrough: reverse username footprinting, EXIF geolocation analysis, and digital archive preservation.",
    contentSnippet: "Open Source Intelligence (OSINT) is the backbone of practical online investigation. This step-by-step tutorial guides you through pivot tools (Sherlock, Spiderfoot, Maltego), searching historical Wayback Machine records, and extracting camera serial numbers from raw image headers.",
    keyTakeaways: [
      "Preserve target digital footprint with hash-verified archive snapshots before adversary cleans presence.",
      "Pivot username handles across 150+ social networks to find forgotten legacy profiles.",
      "Extract EXIF metadata to determine camera make, timestamp, and coordinate data."
    ],
    tags: ["tutorials", "osint", "investigation", "footprinting", "digital forensics"],
    weeklyReads: 15800,
    monthlyReads: 63100,
    totalReads: 172000,
    trendingDelta: "+35%"
  },

  // 15. Facebook Info
  {
    id: "art-15",
    slug: "facebook-marketplace-meta-ad-account-recovery",
    title: "Facebook Info: Ad Account Ban Reversals, Marketplace Defense & Hijack Recovery",
    category: "Facebook Info",
    categorySlug: "facebook-info",
    price: "₦3,800",
    readTime: "10 min read",
    description: "How e-commerce operators and individuals regain hijacked Business Managers, reverse automated 2FA lockouts, and spot marketplace buyer scams.",
    contentSnippet: "Meta's automated policy bots routinely disable high-spend Business Manager accounts without human review. Learn how to draft escalated enterprise appeal tickets, preserve proof of identity, eliminate unauthorized pixel admins, and avoid fake courier delivery payment slips on Facebook Marketplace.",
    keyTakeaways: [
      "Maintain at least two verified Business Manager admins with separate physical hardware security keys.",
      "Use Meta Enterprise concierge chat rather than consumer help center forms for rapid reinstatement.",
      "Reject off-platform payment confirmations on Marketplace."
    ],
    tags: ["facebook", "meta", "business manager", "marketplace", "ad account", "account recovery"],
    weeklyReads: 12900,
    monthlyReads: 52400,
    totalReads: 140000,
    trendingDelta: "+21%"
  },

  // 16. Twitter Info
  {
    id: "art-16",
    slug: "twitter-x-algorithmic-reach-impersonation-defense",
    title: "Twitter Info: Algorithmic Reach Mechanics, API Tier Workarounds & Impersonation Defense",
    category: "Twitter Info",
    categorySlug: "twitter-info",
    price: "₦3,500",
    readTime: "8 min read",
    description: "Navigating the X algorithm ranking open-source repository, paid tier verification badges, and rapid reporting protocols for crypto impersonators.",
    contentSnippet: "With Twitter/X open-sourcing parts of its recommendation algorithm, researchers know the exact weights: reply engagement holds a 13.5x multiplier over plain retweets, while external links receive dampening penalties unless posted in replies. Learn how to secure your brand handle from verified gold/blue badge lookalikes.",
    keyTakeaways: [
      "Replies and author interactions drive the heaviest algorithmic distribution boost.",
      "Place external URLs in reply threads to avoid initial algorithmic reach penalties.",
      "File trademark priority claims with corporate registration certificates to take down badge impersonators."
    ],
    tags: ["twitter", "x", "algorithm", "impersonation", "api", "social media strategy"],
    weeklyReads: 11200,
    monthlyReads: 46800,
    totalReads: 125000,
    trendingDelta: "+17%"
  },

  // 17. CPU (Christian Pastoral Update)
  {
    id: "art-17",
    slug: "christian-pastoral-update-governance-audit",
    title: "CPU: Ministry Compliance, Non-Profit Asset Protection & Church Governance",
    category: "CPU (Christian Pastoral Update)",
    categorySlug: "cpu-christian-pastoral",
    price: "₦3,200",
    readTime: "9 min read",
    description: "Stewardship blueprints for pastoral leadership: 501(c)(3) compliance, trustee fiduciary safeguards, and preventing embezzlement traps.",
    contentSnippet: "Pastoral stewardship requires clean separation of executive authority and financial governance. This operational update covers independent audit board setups, designated giving compliance, preventing ministerial housing allowance tax audits, and digital tithing platform cybersecurity.",
    keyTakeaways: [
      "Ensure dual signature authorization on all church operating and building fund accounts.",
      "Segregate restricted donor funds from general operating budgets to avoid legal liability.",
      "Conduct annual external certified audits for non-profit transparency and congregational trust."
    ],
    tags: ["pastoral", "ministry", "church governance", "nonprofit", "stewardship", "compliance"],
    weeklyReads: 7800,
    monthlyReads: 32400,
    totalReads: 64000,
    trendingDelta: "+11%"
  },

  // 18. Documentaries / FMT
  {
    id: "art-18",
    slug: "documentaries-fmt-whistleblower-source-protection",
    title: "Documentaries / FMT: Investigative Source Protection & Case File Verification",
    category: "Documentaries / FMT",
    categorySlug: "documentaries-fmt",
    price: "₦4,500",
    readTime: "12 min read",
    description: "Field protocols for underground investigative producers: air-gapped evidence lockers, Signal verification, and legal defamation shields.",
    contentSnippet: "Producing hard-hitting investigative case documentaries requires rigorous evidentiary proof to withstand defamation lawsuits. Learn how journalists strip invisible printer tracking dots (Machine Identification Codes), secure whistleblower dropboxes with Tails OS, and draft rock-solid fair use clearances.",
    keyTakeaways: [
      "Always air-gap primary investigative video and audio evidence on encrypted external hardware.",
      "Sanitize printer yellow tracking dots and digital voice pitch before broadcast.",
      "Secure pre-broadcast legal review for First Amendment and fair-use privilege protections."
    ],
    tags: ["documentaries", "fmt", "investigative journalism", "whistleblower", "source protection"],
    weeklyReads: 9200,
    monthlyReads: 39500,
    totalReads: 88000,
    trendingDelta: "+14%"
  },

  // 19. Escort / Hookup Info
  {
    id: "art-19",
    slug: "escort-hookup-safety-blackmail-threat-model",
    title: "Escort / Hookup Info: Blackmail Threat Models, Burner Devices & Physical OPSEC",
    category: "Escort / Hookup Info",
    categorySlug: "escort-hookup-info",
    price: "₦4,000",
    readTime: "10 min read",
    description: "Critical safety measures: identifying extortion setup rings, burner communication protocols, hotel room surveillance scans, and asset privacy.",
    contentSnippet: "Meeting encounters arranged online carry high risks of extortion setups, drugged robbery, and digital entrapment. This operational guide details mandatory physical precautions: using secondary burner numbers, scanning hotel rooms for hidden pinhole lens reflections, never displaying luxury watches or cards, and pre-arranging check-in safety timers.",
    keyTakeaways: [
      "Never disclose real full name, employer, home address, or social profiles to unverified contacts.",
      "Perform RF and infrared optical sweep of unfamiliar private suites for covert recording gear.",
      "Keep payment exclusively peer-to-peer cash without linking bank or credit applications."
    ],
    tags: ["safety", "opsec", "personal defense", "blackmail traps", "counter surveillance"],
    weeklyReads: 14700,
    monthlyReads: 61200,
    totalReads: 153000,
    trendingDelta: "+34%"
  },

  // 20. Elon Musk Info
  {
    id: "art-20",
    slug: "elon-musk-ecosystem-venture-mechanics",
    title: "Elon Musk Info: Ecosystem Tracking, Starlink Procurement & Executive Doctrine",
    category: "Elon Musk Info",
    categorySlug: "elon-musk-info",
    price: "₦4,200",
    readTime: "11 min read",
    description: "Analyzing the interlinked engineering and capital velocity between SpaceX, Tesla, xAI, Neuralink, and X. Strategic implications for enterprise.",
    contentSnippet: "The Musk ecosystem operates on aggressive vertical integration and the 'First Principles' manufacturing algorithm: delete every requirement made by a department, simplify the process, accelerate cycle time, and automate only last. Understand how Starlink defense contracts are negotiated and what xAI's Colossus cluster means for enterprise computing.",
    keyTakeaways: [
      "The 'Question Every Requirement' algorithm has reduced SpaceX and Tesla component costs by over 70%.",
      "Starlink commercial vs military (Starshield) contracts require distinct procurement clearances.",
      "xAI cluster architecture leverages direct co-located gas turbine power generation."
    ],
    tags: ["elon musk", "spacex", "tesla", "xai", "starlink", "engineering doctrine"],
    weeklyReads: 13500,
    monthlyReads: 58900,
    totalReads: 165000,
    trendingDelta: "+26%"
  },

  // 21. Leukemia Info
  {
    id: "art-21",
    slug: "leukemia-clinical-pathways-advocacy-protocols",
    title: "Leukemia Info: Clinical Subtypes, Bone Marrow Match Registries & CAR-T Trials",
    category: "Leukemia Info",
    categorySlug: "leukemia-info",
    price: "₦3,500",
    readTime: "11 min read",
    description: "Operational medical intelligence for patients and advocates: navigating ALL/AML/CLL genetic markers, HLA donor matching, and trial enrollment.",
    contentSnippet: "Receiving a leukemia diagnosis requires immediate familiarity with complex oncology protocols. This guide breaks down cytogenetic risk stratification (FLT3, BCR-ABL), understanding minimal residual disease (MRD) testing, how to access national bone marrow registries (NMDP), and qualifying for cutting-edge CAR-T cell immunotherapy trials.",
    keyTakeaways: [
      "Cytogenetic testing determines whether targeted kinase inhibitors or stem cell transplant is the primary pathway.",
      "Early registration with Be The Match and global bone marrow registries accelerates HLA matching.",
      "MRD (Minimal Residual Disease) flow cytometry is the gold-standard test for tracking remission."
    ],
    tags: ["leukemia", "clinical intelligence", "oncology", "car-t", "bone marrow", "patient advocacy"],
    weeklyReads: 8400,
    monthlyReads: 36700,
    totalReads: 79000,
    trendingDelta: "+13%"
  },

  // 22. Facee Info
  {
    id: "art-22",
    slug: "facee-biometric-recognition-deepfake-defense",
    title: "Facee Info: Facial Recognition Scrapers, Biometric Privacy & Deepfake Countermeasures",
    category: "Facee Info",
    categorySlug: "facee-info",
    price: "₦3,800",
    readTime: "9 min read",
    description: "How Clearview AI and commercial scrapers index faces across the web. Protective techniques: Fawkes cloaking, opting out, and detecting synthetic faces.",
    contentSnippet: "Facial recognition systems now scrape billions of images without individual consent, building searchable biometric fingerprints. Discover how adversarial image cloaking works (perturbing pixels to fool neural networks without altering visual appearance to humans), how to file CCPA/BIPA removal requests, and how to spot synthetic deepfakes via pupil edge distortion.",
    keyTakeaways: [
      "Use biometric cloaking software like Fawkes to scramble facial embeddings on public uploads.",
      "Inspect pupil boundary reflections and ear symmetry to expose real-time generative deepfakes.",
      "File formal biometric opt-out notices under Illinois BIPA and European GDPR frameworks."
    ],
    tags: ["facee", "biometrics", "facial recognition", "deepfakes", "privacy", "countermeasures"],
    weeklyReads: 11600,
    monthlyReads: 49200,
    totalReads: 115000,
    trendingDelta: "+29%"
  },

  // 23. Military Info
  {
    id: "art-23",
    slug: "military-opsec-contractor-procurement-vetting",
    title: "Military Info: Operational Security (OPSEC), Defense Procurement & DD-214 Verification",
    category: "Military Info",
    categorySlug: "military-info",
    price: "₦4,000",
    readTime: "10 min read",
    description: "Verifying veteran discharge records, military contractor SAM.gov registration, and safeguarding operational deployments from digital eavesdropping.",
    contentSnippet: "Imposters frequently fabricate service records to access veteran benefit programs or military contractor bids. Learn how to verify genuine DD-214 discharge certificates through the National Personnel Records Center, navigate SAM.gov CAGE codes for defense tenders, and enforce strict unit geolocation OPSEC on personal devices.",
    keyTakeaways: [
      "Verify authentic service history via NPRC eVetRecs official records repository.",
      "Defense contracting requires active SAM.gov CAGE code registration and CMMC cybersecurity compliance.",
      "Enforce zero-transmission GPS rules for active deployed personnel on Strava and fitness wearables."
    ],
    tags: ["military", "opsec", "defense procurement", "dd-214", "contractor vetting"],
    weeklyReads: 9900,
    monthlyReads: 42800,
    totalReads: 95000,
    trendingDelta: "+15%"
  },

  // 24. NGO & Grants Info
  {
    id: "art-24",
    slug: "ngo-grants-application-audit-compliance",
    title: "NGO & Grants Info: Scoring Rubrics, Fiduciary Audit Compliance & Fake Grant Defense",
    category: "NGO & Grants Info",
    categorySlug: "ngo-grants-info",
    price: "₦3,600",
    readTime: "9 min read",
    description: "How to draft winning institutional grant proposals, maintain strict USAID/EU grant compliance, and spot advance-fee foundation grant scams.",
    contentSnippet: "Winning competitive grant capital requires matching the funder's exact scoring rubric: Logical Framework Matrix (LogFrame), verifiable Key Performance Indicators (KPIs), and watertight overhead calculations. Discover how legitimate international foundations audit expenses and how to recognize fraudulent 'pre-approved grant clearance fee' schemes.",
    keyTakeaways: [
      "Structure proposal budgets with transparent indirect cost rates matching federal/funder caps.",
      "Authentic grantors never require upfront 'application processing fees' or crypto deposits to release awards.",
      "Maintain timestamped procurement logs with 3-quote competitive bidding for all project line items."
    ],
    tags: ["ngo", "grants", "funding proposals", "audit compliance", "philanthropy", "due diligence"],
    weeklyReads: 8700,
    monthlyReads: 38200,
    totalReads: 82000,
    trendingDelta: "+18%"
  },

  // 25. E-Commerce Info
  {
    id: "art-25",
    slug: "ecommerce-chargeback-defense-supplier-vetting",
    title: "E-Commerce Info: Chargeback Mitigation, Dropshipping Supplier Vetting & Fraud Rings",
    category: "E-Commerce Info",
    categorySlug: "e-commerce-info",
    price: "₦3,800",
    readTime: "10 min read",
    description: "Protecting online merchant accounts from friendly fraud chargebacks, card testing spikes, and counterfeit supplier Alibaba escrow defaults.",
    contentSnippet: "E-commerce merchants frequently lose their payment processing facilities due to chargeback rates exceeding 1%. Learn how to deploy 3D Secure 2.0 (3DS2) liability shift protocols, dispute friendly fraud using delivery proof and IP match logs, and vet Asian manufacturers with accredited on-site inspection agents.",
    keyTakeaways: [
      "Enforce 3DS2 authentication on high-risk checkout orders to shift chargeback liability to card issuers.",
      "Inspect supplier business licenses via National Enterprise Credit Information system before wiring deposits.",
      "Maintain automated card-velocity velocity rate filters to stop automated BIN card testing attacks."
    ],
    tags: ["e-commerce", "chargebacks", "fraud mitigation", "supplier vetting", "merchants", "logistics"],
    weeklyReads: 14100,
    monthlyReads: 63900,
    totalReads: 158000,
    trendingDelta: "+33%"
  }
];

export function getTrendingArticles(timeframe: TrendingTimeframe = "weekly"): TrendingArticle[] {
  const sorted = [...ARTICLES_DATABASE].sort((a, b) => {
    const readsA = timeframe === "weekly" ? a.weeklyReads : a.monthlyReads;
    const readsB = timeframe === "weekly" ? b.weeklyReads : b.monthlyReads;
    return readsB - readsA;
  });

  return sorted.map((article, index) => ({
    ...article,
    rank: index + 1,
    currentReads: timeframe === "weekly" ? article.weeklyReads : article.monthlyReads,
  }));
}

export function getLatestArticles(): (Article & { uploadTag: string })[] {
  const timestamps = [
    "Uploaded 2 hours ago",
    "Uploaded 5 hours ago",
    "Uploaded today",
    "Uploaded yesterday",
    "Uploaded 2 days ago",
    "Uploaded 3 days ago",
    "Uploaded this week",
    "Uploaded this week",
    "Uploaded last week",
    "Uploaded last week",
  ];

  return [...ARTICLES_DATABASE].slice(0, 16).map((article, idx) => ({
    ...article,
    uploadTag: timestamps[idx % timestamps.length],
  }));
}

export function getArticleBySlug(slug: string): Article | undefined {
  const clean = slug.trim().toLowerCase();
  return ARTICLES_DATABASE.find(
    (a) => a.slug.toLowerCase() === clean || a.id.toLowerCase() === clean
  );
}

export function getArticlesByCategory(categorySlug: string): Article[] {
  const clean = categorySlug.trim().toLowerCase();
  return ARTICLES_DATABASE.filter(
    (a) => a.categorySlug.toLowerCase() === clean
  );
}

export function deleteArticle(articleIdOrSlug: string): boolean {
  const clean = articleIdOrSlug.trim().toLowerCase();
  const index = ARTICLES_DATABASE.findIndex(
    (a) => a.id.toLowerCase() === clean || a.slug.toLowerCase() === clean
  );
  if (index !== -1) {
    ARTICLES_DATABASE.splice(index, 1);
    return true;
  }
  return false;
}

export function getCategoryBySlug(slug: string): DashboardCategory | undefined {
  const clean = slug.trim().toLowerCase();
  return exploreCategories.find((c) => c.slug.toLowerCase() === clean);
}

export function searchArticles(query: string): Article[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  const tokens = clean.split(/\s+/).filter((t) => t.length > 1);

  return ARTICLES_DATABASE.map((article) => {
    let score = 0;
    const titleLower = article.title.toLowerCase();
    const descLower = article.description.toLowerCase();
    const snippetLower = article.contentSnippet.toLowerCase();
    const catLower = article.category.toLowerCase();
    const tagsLower = article.tags.map((t) => t.toLowerCase());

    // Full match bonuses
    if (titleLower.includes(clean)) score += 15;
    if (catLower.includes(clean)) score += 12;
    if (descLower.includes(clean)) score += 8;
    if (snippetLower.includes(clean)) score += 6;

    // Token matches
    for (const token of tokens) {
      if (titleLower.includes(token)) score += 5;
      if (catLower.includes(token)) score += 4;
      if (tagsLower.some((t) => t.includes(token))) score += 4;
      if (descLower.includes(token)) score += 2;
      if (snippetLower.includes(token)) score += 1;
    }

    return { article, score };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.article);
}
