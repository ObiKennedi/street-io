"use client";

import { Terminal, Wrench, ShieldCheck } from "lucide-react";
import "./articles.scss";

const pillars = [
  {
    num: "01",
    tag: "EXECUTION MANUAL",
    title: "Step-by-Step Execution",
    description:
      "Zero fluff or high-level summaries. Each guide walks you through chronological, reproducible workflows with concrete commands, system configurations, and milestone checkpoints.",
    icon: Terminal,
  },
  {
    num: "02",
    tag: "TOOL SOURCING",
    title: "Tool & Equipment Sourcing",
    description:
      "Every piece of hardware, encrypted utility, and specialized software is mapped directly to vetted procurement sources, clean vendor batches, and verified code mirrors.",
    icon: Wrench,
  },
  {
    num: "03",
    tag: "SECURITY PROTOCOLS",
    title: "OpSec Protocols",
    description:
      "Tactical operational security measures to eliminate surveillance footprints, isolate operating environments, and safely sanitize assets once the task is complete.",
    icon: ShieldCheck,
  },
];

export default function ArticlesSection() {
  return (
    <section className="articles-sec" id="articles" aria-labelledby="articles-sec-title">
      <div className="articles-sec__container">
        {/* Section Header */}
        <header className="articles-sec__header" data-aos="fade-up">
          <div className="articles-sec__tag-wrapper">
            <span className="articles-sec__status-dot" aria-hidden="true" />
            <span>HOW OUR ARTICLES WORK</span>
          </div>
          <h2 id="articles-sec-title" className="articles-sec__title">
            Not just news. Complete execution guides with verified tool sourcing.
          </h2>
          <p className="articles-sec__subtitle">
            Every article is an operational blueprint detailing exact execution steps and vetted
            procurement sources for all required tools and hardware.
          </p>
        </header>

        {/* 3 Pillar Cards */}
        <div className="articles-sec__pillars">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <article
                key={pillar.title}
                className="articles-sec__card"
                data-aos="fade-up"
                data-aos-delay={(index + 1) * 100}
              >
                <div className="articles-sec__icon-box" aria-hidden="true">
                  <Icon size={20} />
                </div>
                <span className="articles-sec__card-tag">
                  {pillar.num} • {pillar.tag}
                </span>
                <h3 className="articles-sec__card-heading">{pillar.title}</h3>
                <p className="articles-sec__card-desc">{pillar.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
