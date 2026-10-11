"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Logo from "@/component/Logo";
import { 
    disclaimer, 
    footerColumns, 
    socialLinks, 
    type FooterLink 
} from "./footer.config";
import "./site-footer.scss";

function FooterAnchor({ link, className }: { link: FooterLink; className: string }) {
  if (link.external) {
    return (
      <a href={link.href} className={className} target="_blank" rel="noopener noreferrer">
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

export function SiteFooter() {
  const [year, setYear] = useState(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        {/* ---- Educational disclaimer one-liner strip ---- */}
        <aside className="site-footer__notice" aria-label="Disclaimer">
          <div className="site-footer__notice-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path
                d="M12 2.5 4 5.5v6c0 5 3.4 8.9 8 10 4.6-1.1 8-5 8-10v-6l-8-3Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path d="m8.5 8.5 7 7m0-7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <p className="site-footer__notice-text">
            <strong className="site-footer__notice-title">{disclaimer.title}</strong>{" "}
            {disclaimer.text}
          </p>
        </aside>

        {/* ---- Brand + link columns ---- */}
        <div className="site-footer__main">
          <div className="site-footer__brand">
            <Link href="/" className="site-footer__logo logo" aria-label="streetio home">
              <Logo />
            </Link>
            <p className="site-footer__tagline">
              Researched, plain-spoken articles on the topics people avoid — so you can see the
              game before it gets played on you.
            </p>
            <ul className="site-footer__social" aria-label="streetio on social media">
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <FooterAnchor link={link} className="site-footer__social-link" />
                </li>
              ))}
            </ul>
          </div>

          <nav className="site-footer__nav" aria-label="Footer">
            {footerColumns.map((column) => (
              <div key={column.title} className="site-footer__column">
                <h3 className="site-footer__heading">{column.title}</h3>
                <ul className="site-footer__list">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <FooterAnchor link={link} className="site-footer__link" />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* ---- Bottom bar ---- */}
        <div className="site-footer__bottom">
          <p className="site-footer__copyright">© {year} streetio. All rights reserved.</p>
          <p className="site-footer__motto">
            Learn it. <span>Don&rsquo;t do it.</span>
          </p>
          <a href="/" className="site-footer__top">
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}