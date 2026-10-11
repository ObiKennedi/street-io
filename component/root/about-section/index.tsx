"use client";

import { GraduationCap, BookOpen, KeyRound } from "lucide-react";
import "./about.scss";

const pillars = [
  {
    icon: GraduationCap,
    title: "Practical Education",
    description:
      "No fluff or abstract theories. Real-world education on practical skills and topics that nobody puts on the syllabus.",
  },
  {
    icon: BookOpen,
    title: "Complete Task Guides",
    description:
      "Every article is an end-to-end breakdown: how to execute the task step-by-step and where to source the tools to do it.",
  },
  {
    icon: KeyRound,
    title: "Pay to Learn",
    description:
      "A simple pay-to-access model. You pay a membership to unlock actionable knowledge and real-world capabilities.",
  },
];

export default function AboutSection() {
  return (
    <section className="about-sec" id="about" aria-labelledby="about-sec-title">
      <div className="about-sec__container">
        <div className="about-sec__grid">
          {/* Narrative Column */}
          <div className="about-sec__narrative" data-aos="fade-up">
            <div className="about-sec__tag-wrapper">
              <span className="about-sec__status-dot" aria-hidden="true" />
              <span>ABOUT STREET IO</span>
            </div>

            <h2 id="about-sec-title" className="about-sec__title">
              It&rsquo;s education. You pay to learn real-world skills.
            </h2>

            <p className="about-sec__text">
              Standard curriculums teach theory, but leave out the practical mechanics of how the world actually works.
              Street IO is designed to bridge that gap with clear, no-nonsense education.
            </p>

            <p className="about-sec__text">
              <strong>Everything is built around action.</strong> Each article is a complete guide that teaches you how
              to perform a specific task, provides the steps to execute it, and shows you where to source the tools you
              need. You pay for membership to unlock lessons you can actually use.
            </p>
          </div>

          {/* Highlights Column */}
          <div className="about-sec__highlights" data-aos="fade-up" data-aos-delay="100">
            {pillars.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="about-sec__highlight-card">
                  <div className="about-sec__icon-box" aria-hidden="true">
                    <Icon size={18} />
                  </div>
                  <div className="about-sec__highlight-content">
                    <h3 className="about-sec__highlight-title">{item.title}</h3>
                    <p className="about-sec__highlight-desc">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
