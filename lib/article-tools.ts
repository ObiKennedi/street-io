// File: lib/article-tools.ts

export type ArticleTool = {
  id: string;
  name: string;
  description: string;
  category: string;
  type: "Verification" | "Forensics" | "Defense" | "Regulatory" | "Intelligence" | "Security";
  url: string;
  isExternal?: boolean;
  badge?: string;
};

export const FIELD_TOOLS_DATABASE: Record<string, ArticleTool[]> = {
  // Dating & Catfish / Romance Scams
  dating: [
    {
      id: "tool-tineye",
      name: "TinEye Reverse Image Engine",
      description: "Search image databases for stolen modeling headshots, stock photos, and mirrored identity profiles.",
      category: "Dating & Romance Defense",
      type: "Verification",
      url: "https://tineye.com",
      isExternal: true,
      badge: "Free",
    },
    {
      id: "tool-yandex-visual",
      name: "Yandex Visual Face Matcher",
      description: "Superior neural face matching across international social networks to unmask catfish identities.",
      category: "Dating & Romance Defense",
      type: "Forensics",
      url: "https://yandex.com/images",
      isExternal: true,
      badge: "High Accuracy",
    },
    {
      id: "tool-numverify",
      name: "Carrier & VoIP Lookup Inspector",
      description: "Detect whether a contact's phone number is a burner VoIP service (Google Voice, TextNow) or real SIM.",
      category: "Dating & Romance Defense",
      type: "Verification",
      url: "https://numverify.com",
      isExternal: true,
      badge: "Essential",
    },
    {
      id: "tool-exiftool",
      name: "ExifTool Metadata Extractor",
      description: "Extract hidden EXIF GPS coordinates, camera model serial numbers, and original timestamps from sent photos.",
      category: "Dating & Romance Defense",
      type: "Forensics",
      url: "https://exiftool.org",
      isExternal: true,
    },
  ],

  // BEC (Business Email Compromise)
  "bec-email-compromise": [
    {
      id: "tool-mxtoolbox",
      name: "MxToolbox DMARC & SPF Analyzer",
      description: "Audit vendor email domains for missing SPF, DKIM, and spoofing vulnerabilities before processing invoices.",
      category: "BEC Defense",
      type: "Defense",
      url: "https://mxtoolbox.com/dmarc.aspx",
      isExternal: true,
      badge: "Corporate Standard",
    },
    {
      id: "tool-whois-domain",
      name: "Whois Domain Age & Lookalike Inspector",
      description: "Detect lookalike typosquat domains (e.g. companny.com instead of company.com) registered within 30 days.",
      category: "BEC Defense",
      type: "Intelligence",
      url: "https://whois.domaintools.com",
      isExternal: true,
      badge: "Immediate Red Flag",
    },
    {
      id: "tool-swift-callback",
      name: "Out-of-Band Wire Callback Template",
      description: "Standardized dual-person telephone verification protocol to validate bank routing and account changes.",
      category: "BEC Defense",
      type: "Regulatory",
      url: "#callback-template",
      isExternal: false,
      badge: "Internal SOP",
    },
    {
      id: "tool-canary-forwarding",
      name: "Mailbox Forwarding Rule Auditor",
      description: "Script to scan Exchange and Google Workspace accounts for hidden hacker auto-forwarding rules.",
      category: "BEC Defense",
      type: "Forensics",
      url: "https://learn.microsoft.com/en-us/exchange/troubleshoot/mailflow/detect-and-remediate-illicit-consent-grants",
      isExternal: true,
    },
  ],

  // Real Estate & Land Fraud
  "real-estate-fraud": [
    {
      id: "tool-lagos-lands",
      name: "State Lands Electronic Registry",
      description: "Verify Certificate of Occupancy (C of O), Governor's Consent numbers, and registered encumbrances.",
      category: "Real Estate Due Diligence",
      type: "Regulatory",
      url: "https://lands.lagosstate.gov.ng",
      isExternal: true,
      badge: "Official Portal",
    },
    {
      id: "tool-gis-survey",
      name: "Cadastral Survey Beacon Verifier",
      description: "Match surveyor beacon coordinate numbers against official excision gazettes and government acquisitions.",
      category: "Real Estate Due Diligence",
      type: "Verification",
      url: "#survey-checker",
      isExternal: false,
      badge: "Boundary Verification",
    },
    {
      id: "tool-corporate-cac",
      name: "CAC Corporate Search (Real Estate Developers)",
      description: "Confirm active directors, annual returns, and authorized signatories of property development companies.",
      category: "Real Estate Due Diligence",
      type: "Intelligence",
      url: "https://search.cac.gov.ng",
      isExternal: true,
    },
  ],

  // Cybersecurity & SIM Swap
  cybersecurity: [
    {
      id: "tool-port-lock",
      name: "Telecom Port-Out Lock Shortcodes",
      description: "Official carrier USSD codes to lock your SIM profile against unauthorized retail agent porting.",
      category: "Cybersecurity & Telecom",
      type: "Defense",
      url: "#port-lock-guide",
      isExternal: false,
      badge: "Crucial Setup",
    },
    {
      id: "tool-yubico",
      name: "Hardware Security Key (FIDO2 / U2F)",
      description: "Replace vulnerable SMS two-factor authentication with un-phishable physical hardware tokens.",
      category: "Cybersecurity & Telecom",
      type: "Defense",
      url: "https://www.yubico.com",
      isExternal: true,
      badge: "Gold Standard",
    },
    {
      id: "tool-haveibeenpwned",
      name: "Have I Been Pwned Leak Scanner",
      description: "Check if your credentials, passwords, or phone number were exposed in dark-web database dumps.",
      category: "Cybersecurity & Telecom",
      type: "Intelligence",
      url: "https://haveibeenpwned.com",
      isExternal: true,
    },
  ],

  // Extortion & Blackmail
  "extortion-blackmail": [
    {
      id: "tool-stopncii",
      name: "StopNCII Cryptographic Hash Registry",
      description: "Create irreversible digital hashes of private photos to block them from being uploaded to major platforms.",
      category: "Extortion Countermeasures",
      type: "Defense",
      url: "https://stopncii.org",
      isExternal: true,
      badge: "Global Anti-Extortion",
    },
    {
      id: "tool-signal-vault",
      name: "Signal Sealed Sender Communications",
      description: "End-to-end encrypted protocol to communicate with trusted advisors without leaking metadata.",
      category: "Extortion Countermeasures",
      type: "Security",
      url: "https://signal.org",
      isExternal: true,
      badge: "Zero Metadata",
    },
    {
      id: "tool-forensic-chain",
      name: "Evidence Preservation & Timestamping Log",
      description: "Standard courtroom protocol to preserve digital messages, headers, and extortion threats without spoiling chain of custody.",
      category: "Extortion Countermeasures",
      type: "Forensics",
      url: "#evidence-chain-log",
      isExternal: false,
    },
  ],

  // Crypto Forensics & Asset Recovery
  "crypto-forensics": [
    {
      id: "tool-etherscan",
      name: "Etherscan Blockchain Explorer",
      description: "Trace transaction inputs/outputs, contract creator addresses, and stolen token transfers across addresses.",
      category: "Crypto Forensics",
      type: "Forensics",
      url: "https://etherscan.io",
      isExternal: true,
      badge: "Public Ledger",
    },
    {
      id: "tool-chainabuse",
      name: "Chainabuse Global Fraud Registry",
      description: "Submit and search reported malicious smart contracts, phishing drainers, and scam deposit wallets.",
      category: "Crypto Forensics",
      type: "Intelligence",
      url: "https://www.chainabuse.com",
      isExternal: true,
      badge: "Scam Database",
    },
    {
      id: "tool-revoke-cash",
      name: "Revoke.cash Allowance Revoker",
      description: "Instantly audit and cancel unlimited token spending approvals given to malicious smart contracts.",
      category: "Crypto Forensics",
      type: "Defense",
      url: "https://revoke.cash",
      isExternal: true,
      badge: "Immediate Action",
    },
  ],
};

// Fallback universal tools if category has no specific tools
export const UNIVERSAL_FIELD_TOOLS: ArticleTool[] = [
  {
    id: "tool-paga-escrow",
    name: "Paga Secure Escrow Gateway",
    description: "Hold transaction funds in neutral custody until operational milestones and delivery verifications are signed.",
    category: "Financial Security",
    type: "Defense",
    url: "/checkout/paga",
    isExternal: false,
    badge: "Official Integration",
  },
  {
    id: "tool-threat-intel",
    name: "Street IO Incident Response Registry",
    description: "Search community-reported adversary scripts, fraudulent account numbers, and confirmed scam signatures.",
    category: "Operational Intelligence",
    type: "Intelligence",
    url: "/explore",
    isExternal: false,
    badge: "Field Database",
  },
  {
    id: "tool-document-vault",
    name: "Encrypted Evidence Vault & PDF Export",
    description: "Download verified offline checklists, phone callback scripts, and legal escalation templates.",
    category: "Operational Tradecraft",
    type: "Verification",
    url: "#offline-vault",
    isExternal: false,
    badge: "Classified",
  },
];

export function getToolsForArticle(categorySlug: string): ArticleTool[] {
  const clean = categorySlug.trim().toLowerCase();
  const specific = FIELD_TOOLS_DATABASE[clean];
  if (specific && specific.length > 0) {
    return specific;
  }
  return UNIVERSAL_FIELD_TOOLS;
}
