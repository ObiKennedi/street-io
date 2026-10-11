import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldAlert,
  FileText,
  Clock,
  BookOpen,
  Scale,
  Lock,
  CreditCard,
  Ban,
  AlertTriangle,
  Mail,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

import "./terms.scss";

export const metadata: Metadata = {
  title: "Terms of Use · Street IO",
  description:
    "Review the Terms of Service and Conditions governing access to Street IO. Learn about our strictly educational scope, digital article access licenses, and user conduct rules.",
  alternates: {
    canonical: "/terms",
  },
};

const SECTIONS = [
  { id: "acceptance", num: "01", title: "Acceptance & Eligibility" },
  { id: "educational-scope", num: "02", title: "Educational & Defensive Scope" },
  { id: "pay-to-access", num: "03", title: "Pay-to-Access & Digital Licensing" },
  { id: "accounts", num: "04", title: "User Accounts & Security" },
  { id: "intellectual-property", num: "05", title: "Intellectual Property Rights" },
  { id: "prohibited-conduct", num: "06", title: "Prohibited Uses & Conduct" },
  { id: "disclaimers", num: "07", title: "Disclaimers & No Warranty" },
  { id: "liability", num: "08", title: "Limitation of Liability" },
  { id: "refunds", num: "09", title: "Refunds & Cancellations" },
  { id: "termination", num: "10", title: "Suspension & Termination" },
  { id: "governing-law", num: "11", title: "Governing Law & Updates" },
  { id: "contact", num: "12", title: "Contact & Legal Notices" },
];

export default function TermsPage() {
  return (
    <main id="main-content" className="terms-page">
      <div className="terms-page__bg-glow" aria-hidden="true" />

      <div className="terms-page__container">
        {/* Header Hero */}
        <header className="terms-page__header">
          <div className="terms-page__badge">
            <Scale aria-hidden="true" />
            <span>Legal Documentation</span>
          </div>

          <h1 className="terms-page__title">
            Terms of <span>Use</span>
          </h1>

          <p className="terms-page__lead">
            Please read these terms carefully before accessing Street IO. By creating an account,
            purchasing article access, or browsing our platform, you agree to be bound by all
            terms detailed herein.
          </p>

          <div className="terms-page__meta">
            <span className="terms-page__meta-item">
              <Clock aria-hidden="true" />
              Effective: October 9, 2026
            </span>
            <span className="terms-page__meta-item">
              <FileText aria-hidden="true" />
              Version 2.4
            </span>
            <span className="terms-page__meta-item">
              <BookOpen aria-hidden="true" />
              Platform: streetio.com
            </span>
          </div>
        </header>

        {/* Prominent Educational Notice */}
        <aside
          id="educational-notice"
          className="terms-page__callout"
          aria-label="Educational Use Notice"
        >
          <div className="terms-page__callout-icon" aria-hidden="true">
            <ShieldAlert />
          </div>
          <div className="terms-page__callout-content">
            <h2 className="terms-page__callout-title">
              Important Notice: Strictly Educational & Defensive Use
            </h2>
            <p className="terms-page__callout-text">
              Street IO publishes real-world, actionable skills and non-syllabus insights strictly
              for <strong>educational, defensive, and research purposes</strong>. Street IO does not
              condone, permit, or assist any illegal, harmful, or unauthorized activity. Any
              application of knowledge acquired through Street IO must comply with all applicable
              laws and ethical standards.
            </p>
          </div>
        </aside>

        {/* Main Grid: TOC + Content */}
        <div className="terms-page__grid">
          {/* Table of Contents */}
          <nav className="terms-page__toc" aria-label="Table of contents">
            <div className="terms-page__toc-title">Contents</div>
            <ol className="terms-page__toc-list">
              {SECTIONS.map((sec) => (
                <li key={sec.id}>
                  <a href={`#${sec.id}`} className="terms-page__toc-link">
                    <span className="terms-page__toc-link--num">{sec.num}</span>
                    <span>{sec.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Legal Text Body */}
          <article className="terms-page__article">
            {/* Section 01 */}
            <section id="acceptance" className="terms-page__section">
              <div className="terms-page__section-header">
                <span className="terms-page__section-num">01</span>
                <h2 className="terms-page__section-title">Acceptance & Eligibility</h2>
              </div>
              <div className="terms-page__section-body">
                <p>
                  These Terms of Use (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you
                  (&ldquo;User,&rdquo; &ldquo;you,&rdquo; or &ldquo;your&rdquo;) and Street IO (&ldquo;Street IO,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or
                  &ldquo;us&rdquo;). By accessing our website, creating an account, or unlocking pay-to-access
                  content, you confirm that you have read, understood, and agreed to these Terms.
                </p>
                <p>
                  To use Street IO, you must be at least 18 years of age or the age of legal majority
                  in your jurisdiction. If you are accessing the platform on behalf of an entity or
                  organization, you represent and warrant that you possess the legal authority to
                  bind that entity to these Terms.
                </p>
              </div>
            </section>

            {/* Section 02 */}
            <section id="educational-scope" className="terms-page__section">
              <div className="terms-page__section-header">
                <span className="terms-page__section-num">02</span>
                <h2 className="terms-page__section-title">Educational & Defensive Scope</h2>
              </div>
              <div className="terms-page__section-body">
                <p>
                  Street IO is an educational publication dedicated to unpacking practical,
                  non-traditional topics, high-stakes tradecraft, and specialized methodologies not
                  covered in traditional curricula.
                </p>
                <div className="terms-page__card">
                  <div className="terms-page__card-title">
                    <AlertTriangle aria-hidden="true" />
                    <span>Defensive & Research Mandate</span>
                  </div>
                  <p className="terms-page__card-text">
                    All technical walkthroughs, case studies, operational guides, and systems
                    analyses are produced strictly for legitimate diagnostic, defensive, research,
                    and preventive analysis. We strictly forbid weaponizing or applying platform
                    knowledge in unauthorized environments.
                  </p>
                </div>
                <p>
                  You expressly agree that you will not utilize any technique, material, or insight
                  from Street IO to breach any computer system, violate third-party rights, commit
                  fraud, bypass legal safeguards, or execute unlawful activities under any
                  jurisdiction.
                </p>
              </div>
            </section>

            {/* Section 03 */}
            <section id="pay-to-access" className="terms-page__section">
              <div className="terms-page__section-header">
                <span className="terms-page__section-num">03</span>
                <h2 className="terms-page__section-title">Pay-to-Access & Digital Licensing</h2>
              </div>
              <div className="terms-page__section-body">
                <p>
                  Street IO operates on a paid digital publishing model. Access to individual
                  deep-dive articles, modules, and premium subscriptions requires payment through
                  authorized payment processors.
                </p>
                <ul>
                  <li>
                    <strong>Single-User License:</strong> When you purchase an article or active
                    membership, Street IO grants you a personal, non-exclusive, non-transferable,
                    revocable license to view the designated content.
                  </li>
                  <li>
                    <strong>No Redistribution:</strong> You may not copy, mirror, transcribe,
                    screen-record, redistribute, republish, or syndicate unlocked articles in whole
                    or in part without explicit written authorization from Street IO.
                  </li>
                  <li>
                    <strong>Per-Access Pricing:</strong> Prices for articles and memberships are
                    displayed at the point of sale. Street IO reserves the right to modify prices
                    prospectively at any time.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 04 */}
            <section id="accounts" className="terms-page__section">
              <div className="terms-page__section-header">
                <span className="terms-page__section-num">04</span>
                <h2 className="terms-page__section-title">User Accounts & Security</h2>
              </div>
              <div className="terms-page__section-body">
                <p>
                  To unlock paid articles and manage reading history, you must register for an
                  account using a valid email address or supported OAuth provider (such as Google).
                </p>
                <p>
                  You are solely responsible for safeguarding your login credentials. Account sharing,
                  pooling credentials, or leasing access tokens is strictly prohibited and constitutes
                  grounds for immediate account suspension without refund. If you suspect
                  unauthorized use of your account, you must notify Street IO immediately at{" "}
                  <strong>security@streetio.com</strong>.
                </p>
              </div>
            </section>

            {/* Section 05 */}
            <section id="intellectual-property" className="terms-page__section">
              <div className="terms-page__section-header">
                <span className="terms-page__section-num">05</span>
                <h2 className="terms-page__section-title">Intellectual Property Rights</h2>
              </div>
              <div className="terms-page__section-body">
                <p>
                  All content published on Street IO—including but not limited to written articles,
                  custom graphics, interactive elements, code repositories, branding, logos, and
                  editorial styling—is the exclusive intellectual property of Street IO and its
                  contributing authors, protected by international copyright and trademark laws.
                </p>
                <p>
                  Purchasing access to an article does not grant any ownership rights, patent
                  licenses, or derivative distribution rights. Any unauthorized commercial exploitation
                  of our work will be prosecuted to the fullest extent of the law.
                </p>
              </div>
            </section>

            {/* Section 06 */}
            <section id="prohibited-conduct" className="terms-page__section">
              <div className="terms-page__section-header">
                <span className="terms-page__section-num">06</span>
                <h2 className="terms-page__section-title">Prohibited Uses & Conduct</h2>
              </div>
              <div className="terms-page__section-body">
                <p>By using Street IO, you agree that you will not, under any circumstances:</p>
                <ul>
                  <li>
                    Engage in automated data collection, scraping, indexing, or harvesting of articles
                    via bots, spiders, or headless browsers without written API agreements.
                  </li>
                  <li>
                    Attempt to bypass, disable, tamper with, or circumvent paywalls, access control
                    systems, or cryptographic tokens safeguarding content.
                  </li>
                  <li>
                    Probe, scan, or test the vulnerability of Street IO servers, network
                    infrastructure, or authentication systems without express prior authorization.
                  </li>
                  <li>
                    Use article contents to train proprietary machine learning or generative AI
                    models without a commercial licensing contract.
                  </li>
                  <li>
                    Harass, threaten, or impersonate other users, authors, or Street IO team members.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 07 */}
            <section id="disclaimers" className="terms-page__section">
              <div className="terms-page__section-header">
                <span className="terms-page__section-num">07</span>
                <h2 className="terms-page__section-title">Disclaimers & No Warranty</h2>
              </div>
              <div className="terms-page__section-body">
                <p>
                  Street IO is provided on an <strong>&ldquo;AS IS&rdquo;</strong> and{" "}
                  <strong>&ldquo;AS AVAILABLE&rdquo;</strong> basis without warranties of any kind, whether
                  express, statutory, or implied.
                </p>
                <p>
                  While we strive for rigorous editorial standards and technical precision, we make
                  no representation or warranty that our content is completely error-free, exhaustive,
                  or suitable for any specific production environment. Any actions you take based on
                  information found on Street IO are undertaken at your own sole risk and discretion.
                </p>
              </div>
            </section>

            {/* Section 08 */}
            <section id="liability" className="terms-page__section">
              <div className="terms-page__section-header">
                <span className="terms-page__section-num">08</span>
                <h2 className="terms-page__section-title">Limitation of Liability</h2>
              </div>
              <div className="terms-page__section-body">
                <p>
                  To the maximum extent permitted by applicable law, neither Street IO, its founders,
                  authors, contributors, nor affiliates shall be held liable for any indirect,
                  punitive, incidental, special, consequential, or exemplary damages—including but not
                  limited to loss of profits, data corruption, system downtime, regulatory fines, or
                  legal claims arising out of your access to, or misuse of, our materials.
                </p>
                <p>
                  In no event shall Street IO&rsquo;s cumulative liability across all claims exceed the
                  amount paid by you to Street IO in the twelve (12) months preceding the incident.
                </p>
              </div>
            </section>

            {/* Section 09 */}
            <section id="refunds" className="terms-page__section">
              <div className="terms-page__section-header">
                <span className="terms-page__section-num">09</span>
                <h2 className="terms-page__section-title">Refunds & Cancellations</h2>
              </div>
              <div className="terms-page__section-body">
                <p>
                  Due to the nature of digital information products, once an article is unlocked or
                  digital materials are accessed, purchases are generally final and non-refundable.
                </p>
                <p>
                  In cases of verified billing errors, duplicate transactions, or defective delivery,
                  we provide resolution in accordance with our{" "}
                  <Link href="/refunds">Refund Policy</Link>. Please submit purchase receipts to{" "}
                  <strong>support@streetio.com</strong> within 7 days of the transaction.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section id="termination" className="terms-page__section">
              <div className="terms-page__section-header">
                <span className="terms-page__section-num">10</span>
                <h2 className="terms-page__section-title">Suspension & Termination</h2>
              </div>
              <div className="terms-page__section-body">
                <p>
                  Street IO reserves the right to immediately suspend, restrict, or permanently
                  terminate your account and access to purchased articles, without prior notice or
                  refund, if:
                </p>
                <ul>
                  <li>You violate any material provision of these Terms.</li>
                  <li>
                    There is reasonable suspicion of unauthorized account sharing, automated content
                    leaking, or credential abuse.
                  </li>
                  <li>
                    We determine that your usage presents legal liability, security risks, or reputational
                    harm to Street IO or its community.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 11 */}
            <section id="governing-law" className="terms-page__section">
              <div className="terms-page__section-header">
                <span className="terms-page__section-num">11</span>
                <h2 className="terms-page__section-title">Governing Law & Updates</h2>
              </div>
              <div className="terms-page__section-body">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the
                  State of Delaware, United States, without regard to conflict of law principles. Any
                  legal dispute shall be resolved through binding individual arbitration, or within
                  courts of competent jurisdiction in Delaware.
                </p>
                <p>
                  We may periodically revise these Terms to reflect changes in our platform,
                  regulatory requirements, or legal standards. Changes become effective upon posting.
                  Your continued use of Street IO following published revisions confirms your acceptance
                  of the updated Terms.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section id="contact" className="terms-page__section">
              <div className="terms-page__section-header">
                <span className="terms-page__section-num">12</span>
                <h2 className="terms-page__section-title">Contact & Legal Notices</h2>
              </div>
              <div className="terms-page__section-body">
                <p>
                  For formal legal correspondence, copyright infringement inquiries (DMCA notices),
                  or clarification regarding these Terms of Use, please reach out to our legal team:
                </p>

                <div className="terms-page__card">
                  <div className="terms-page__card-title">
                    <Mail aria-hidden="true" />
                    <span>Official Communications</span>
                  </div>
                  <p className="terms-page__card-text">
                    <strong>Legal Inquiries:</strong> legal@streetio.com<br />
                    <strong>General Support:</strong> support@streetio.com<br />
                    <strong>Security Vulnerabilities:</strong> security@streetio.com
                  </p>
                </div>
              </div>
            </section>

            {/* Bottom Contact / Action Card */}
            <div className="terms-page__contact-card">
              <div className="terms-page__contact-card-info">
                <h3 className="terms-page__contact-card-title">Have questions about our terms?</h3>
                <p className="terms-page__contact-card-text">
                  Our compliance and editorial team is available to help clarify any details.
                </p>
              </div>
              <div className="terms-page__contact-card-actions">
                <Link
                  href="/contact"
                  className="terms-page__contact-card-btn terms-page__contact-card-btn--primary"
                >
                  Contact Support
                  <ChevronRight aria-hidden="true" size={16} />
                </Link>
                <Link
                  href="/privacy"
                  className="terms-page__contact-card-btn terms-page__contact-card-btn--secondary"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
