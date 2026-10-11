export type NavItem = {
  label: string;
  href: string;
};

export const primaryNav: NavItem[] = [
  { label: "Articles", href: "#articles" },
  { label: "About", href: "#about" },
  {label: "Contact", href: "#contact"}
];

export const navActions = {
  login: { label: "Log in", href: "/login" },
  cta: { label: "Unlock access", href: "/register" },
} as const;