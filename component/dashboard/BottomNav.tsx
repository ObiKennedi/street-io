"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CategoryIcon, type CategoryIconName } from "./CategoryIcon";

const tabs: { label: string; href: string; icon: CategoryIconName }[] = [
  { label: "Home (fyp)", href: "/dashboard", icon: "home" },
  { label: "Explore", href: "/explore", icon: "compass" },
  { label: "Trending", href: "/trending", icon: "trending" },
  { label: "New", href: "/new", icon: "sparkles" },
  { label: "Profile", href: "/dashboard/profile", icon: "user" },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard" || pathname === "/dashboard/fyp"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="dash-tabs" aria-label="Dashboard">
      <ul className="dash-tabs__list">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`dash-tabs__link${active ? " dash-tabs__link--active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <CategoryIcon name={tab.icon} size={22} />
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}