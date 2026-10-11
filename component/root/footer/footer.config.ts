export type FooterLink = { label: string; href: string; external?: boolean };
export type FooterColumn = { title: string; links: FooterLink[] };

export const footerColumns: FooterColumn[] = [
  {
    title: "Read",
    links: [
      { label: "Latest articles", href: "/articles" },
      { label: "Topics", href: "/topics" },
      { label: "Free articles", href: "/articles/free" },
      { label: "Membership", href: "/membership" },
    ],
  },
  {
    title: "streetio",
    links: [
      { label: "About", href: "/about" },
      { label: "Editorial standards", href: "/editorial-standards" },
      { label: "Contact", href: "/contact" },
      { label: "Report fraud", href: "/report-fraud" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of use", href: "/terms" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Refund policy", href: "/refunds" },
    ],
  },
];

export const socialLinks: FooterLink[] = [
  { label: "X", href: "https://x.com/streetio", external: true },
  { label: "Facebook", href: "https://facebook.com/streetio", external: true },
  { label: "Instagram", href: "https://instagram.com/streetio", external: true },
  { label: "TikTok", href: "https://tiktok.com/@streetio", external: true },
];

export const disclaimer = {
  title: "Educational use only:",
  text: "Published strictly for educational, defensive, and research purposes. Street IO does not condone, assist, or permit illegal activity.",
};