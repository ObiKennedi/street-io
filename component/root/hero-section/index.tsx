"use client";

import { useEffect } from "react";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";

import HeroIllustration from "./HeroIllustration";
import "./hero.scss";

type HeroAction = { label: string; href: string };

type HeroProps = {
  eyebrow?: string[];
  title?: string;
  /** Words in the title to render in Steel (the "street" colour). */
  highlight?: string;
  subtitle?: string;
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
};

export default function Hero({
  eyebrow = ["Researched", "Uncensored", "Members-only"],
  title = "The lessons nobody puts on the syllabus",
  highlight = "nobody",
  subtitle = "In-depth articles on the topics people avoid talking about — researched, plain-spoken and unlocked with a membership.",
  primaryAction = { label: "Get access", href: "/register" },
  secondaryAction = { label: "Learn more", href: "#about" },
}: HeroProps) {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 40,
    });
  }, []);

  const [before, after] = highlight ? title.split(highlight) : [title, ""];

  return (
    <section className="hero" aria-labelledby="hero-title">
      {/* Background: concentric arcs + floating shapes */}
      <div className="hero__bg" aria-hidden="true">
        <span className="hero__arc hero__arc--1" />
        <span className="hero__arc hero__arc--2" />
        <span className="hero__arc hero__arc--3" />
        <span className="hero__arc hero__arc--4" />

        <span className="hero__shape hero__shape--ring hero__shape--a" />
        <span className="hero__shape hero__shape--square hero__shape--b" />
        <span className="hero__shape hero__shape--plus hero__shape--c" />
        <span className="hero__shape hero__shape--ring hero__shape--d" />
        <span className="hero__shape hero__shape--square hero__shape--e" />
      </div>

      <div className="hero__inner">
        <div className="hero__content">
          {eyebrow.length > 0 && (
            <ul
              className="hero__eyebrow"
              data-aos="fade-down"
              data-aos-duration="600"
            >
              {eyebrow.map((item) => (
                <li key={item} className="hero__eyebrow-item">
                  {item}
                </li>
              ))}
            </ul>
          )}

          <h1
            id="hero-title"
            className="hero__title"
            data-aos="fade-up"
            data-aos-duration="700"
            data-aos-delay="100"
          >
            {before}
            {highlight && <span className="hero__title-accent">{highlight}</span>}
            {after}
          </h1>

          <p
            className="hero__subtitle"
            data-aos="fade-up"
            data-aos-duration="700"
            data-aos-delay="200"
          >
            {subtitle}
          </p>

          <div
            className="hero__actions"
            data-aos="fade-up"
            data-aos-duration="700"
            data-aos-delay="300"
          >
            <Link href={primaryAction.href} className="hero__btn hero__btn--primary">
              {primaryAction.label}
            </Link>
            <Link href={secondaryAction.href} className="hero__btn hero__btn--secondary">
              {secondaryAction.label}
            </Link>
          </div>
        </div>

        <div
          className="hero__media"
          data-aos="fade-left"
          data-aos-duration="800"
          data-aos-delay="200"
        >
          <HeroIllustration className="hero__illustration" />
        </div>
      </div>
    </section>
  );
}