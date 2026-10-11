"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import Logo from "@/component/Logo";

import { navActions, primaryNav, type NavItem } from "@/component/root/nav.config";
import "./site-header.scss";

type SiteHeaderProps = {
  /** "dark" = sits over the charcoal hero (reversed logo, light text). */
  tone?: "dark" | "light";
  /** Scroll distance (px) before the header turns solid. */
  solidAfter?: number;
  items?: NavItem[];
};

export default function HeadingNav({
  tone = "dark",
  solidAfter = 24,
  items = primaryNav,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Solid background once the page scrolls past the hero top.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > solidAfter);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [solidAfter]);

  // Close the mobile menu on navigation.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock scroll + Escape to close while the menu is open.
  useEffect(() => {
    if (!isOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  // Close the panel if the viewport grows to desktop.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => e.matches && setIsOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const classes = [
    "site-header",
    `site-header--${tone}`,
    isScrolled && "site-header--scrolled",
    isOpen && "site-header--open",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={classes}>
      <a className="site-header__skip" href="/">
        Skip to content
      </a>

      <div className="site-header__inner">
        <Link href="/" className="site-header__brand logo" aria-label="streetio home">
          <Logo />
        </Link>

        <nav className="site-header__nav" aria-label="Primary">
          <ul className="site-header__list">
            {items.map((item) => (
              <li key={item.href} className="site-header__item">
                <Link
                  href={item.href}
                  className="site-header__link"
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <Link href={navActions.login.href} className="site-header__login">
            {navActions.login.label}
          </Link>
          <Link href={navActions.cta.href} className="site-header__cta">
            {navActions.cta.label}
            <span className="site-header__cta-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className="site-header__toggle"
          aria-expanded={isOpen}
          aria-controls={menuId}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="site-header__toggle-label">
            {isOpen ? "Close menu" : "Open menu"}
          </span>
          <span className="site-header__toggle-bar" aria-hidden="true" />
          <span className="site-header__toggle-bar" aria-hidden="true" />
        </button>
      </div>

      {/* Mobile panel */}
      <div
        id={menuId}
        className="site-header__panel"
        hidden={!isOpen}
      >
        <nav aria-label="Mobile">
          <ul className="site-header__panel-list">
            {items.map((item, i) => (
              <li
                key={item.href}
                className="site-header__panel-item"
                style={{ "--i": i } as React.CSSProperties}
              >
                <Link
                  href={item.href}
                  className="site-header__panel-link"
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__panel-actions">
          <Link href={navActions.cta.href} className="site-header__cta site-header__cta--block">
            {navActions.cta.label}
          </Link>
          <Link href={navActions.login.href} className="site-header__login site-header__login--block">
            {navActions.login.label}
          </Link>
        </div>
      </div>
    </header>
  );
}