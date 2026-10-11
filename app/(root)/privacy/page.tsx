import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  FileText,
  Clock,
  BookOpen,
  Lock,
  Database,
  CreditCard,
  EyeOff,
  Cookie,
  UserCheck,
  Server,
  Mail,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import "./privacy.scss";

export const metadata: Metadata = {
  title: "Privacy Policy · Street IO",
  description:
    "Learn how Street IO collects, uses, and safeguards your data. We never sell your personal information and maintain strict privacy, encryption, and GDPR/CCPA standards.",
  alternates: {
    canonical: "/privacy",
  },
};

const SECTIONS = [
  { id: "information-collected", num: "01", title: "Information We Collect" },
  { id: "how-we-use-data", num: "02", title: "How We Use Your Data" },
  { id: "legal-bases", num: "03", title: "Legal Bases for Processing" },
  { id: "payments", num: "04", title: "Payment & Financial Data" },
  { id: "third-party-services", num: "05", title: "Third-Party Processors" },
  { id: "retention", num: "06", title: "Data Retention & Deletion" },
  { id: "cookies", num: "07", title: "Cookies & Session Storage" },
  { id: "your-rights", num: "08", title: "Your Privacy Rights (GDPR / CCPA)" },
  { id: "security", num: "09", title: "Security & Encryption" },
  { id: "transfers", num: "10", title: "International Data Transfers" },
  { id: "children", num: "11", title: "Age Restrictions & Minors" },
  { id: "contact-dpo", num: "12", title: "Updates & Privacy Contact" },
];

export default function PrivacyPage() {
  return (
    <main id="main-content" className="privacy-page">
      <div className="privacy-page__bg-glow" aria-hidden="true" />

      <div className="privacy-page__container">
        {/* Header Hero */}
        <header className="privacy-page__header">
          <div className="privacy-page__badge">
            <ShieldCheck aria-hidden="true" />
            <span>Data Protection & Privacy</span>
          </div>

          <h1 className="privacy-page__title">
            Privacy <span>Policy</span>
          </h1>

          <p className="privacy-page__lead">
            At Street IO, your privacy and trust are paramount. This policy explains what information
            we collect when you read, purchase, or interact with our educational articles, how we
            protect it, and how you can exercise full control over your data.
          </p>

          <div className="privacy-page__meta">
            <span className="privacy-page__meta-item">
              <Clock aria-hidden="true" />
              Effective: October 9, 2026
            </span>
            <span className="privacy-page__meta-item">
              <FileText aria-hidden="true" />
              Version 2.4
            </span>
            <span className="privacy-page__meta-item">
              <BookOpen aria-hidden="true" />
              Controller: Street IO, Inc.
            </span>
          </div>
        </header>

        {/* Commitment Banner */}
        <aside
          id="privacy-promise"
          className="privacy-page__callout"
          aria-label="Street IO Privacy Promise"
        >
          <div className="privacy-page__callout-icon" aria-hidden="true">
            <EyeOff />
          </div>
          <div className="privacy-page__callout-content">
            <h2 className="privacy-page__callout-title">
              Our Privacy Promise: No Selling, No Advertising Brokers
            </h2>
            <p className="privacy-page__callout-text">
              We do <strong>not sell, rent, monetize, or disclose your personal data</strong> to third-party
              advertising networks or data brokers. We collect only what is strictly required to
              authenticate your sessions, process pay-per-article access, deliver transactional
              emails, and defend the integrity of our platform.
            </p>
          </div>
        </aside>

        {/* Main Grid: TOC + Content */}
        <div className="privacy-page__grid">
          {/* Table of Contents */}
          <nav className="privacy-page__toc" aria-label="Table of contents">
            <div className="privacy-page__toc-title">Sections</div>
            <ol className="privacy-page__toc-list">
              {SECTIONS.map((sec) => (
                <li key={sec.id}>
                  <a href={`#${sec.id}`} className="privacy-page__toc-link">
                    <span className="privacy-page__toc-link--num">{sec.num}</span>
                    <span>{sec.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Legal Text Body */}
          <article className="privacy-page__article">
            {/* Section 01 */}
            <section id="information-collected" className="privacy-page__section">
              <div className="privacy-page__section-header">
                <span className="privacy-page__section-num">01</span>
                <h2 className="privacy-page__section-title">Information We Collect</h2>
              </div>
              <div className="privacy-page__section-body">
                <p>
                  We collect information directly from you when you register an account, purchase
                  access to articles, or communicate with our support desk, as well as automatically
                  when you browse Street IO:
                </p>

                <div className="privacy-page__card-grid">
                  <div className="privacy-page__card">
                    <div className="privacy-page__card-title">
                      <UserCheck aria-hidden="true" />
                      <span>Account Information</span>
                    </div>
                    <p className="privacy-page__card-text">
                      Full name, email address, cryptographic password hash (never stored in plain
                      text), and optional OAuth credentials (such as Google Profile identifier).
                    </p>
                  </div>

                  <div className="privacy-page__card">
                    <div className="privacy-page__card-title">
                      <CreditCard aria-hidden="true" />
                      <span>Purchase & Entitlements</span>
                    </div>
                    <p className="privacy-page__card-text">
                      Records of articles unlocked, membership status, billing timestamps, order IDs,
                      and payment status. We do not store raw card numbers.
                    </p>
                  </div>

                  <div className="privacy-page__card">
                    <div className="privacy-page__card-title">
                      <Server aria-hidden="true" />
                      <span>Technical Telemetry</span>
                    </div>
                    <p className="privacy-page__card-text">
                      IP address, device type, operating system, browser user agent, session cookies,
                      and request timestamps used for security rate-limiting.
                    </p>
                  </div>

                  <div className="privacy-page__card">
                    <div className="privacy-page__card-title">
                      <BookOpen aria-hidden="true" />
                      <span>Reading Preferences</span>
                    </div>
                    <p className="privacy-page__card-text">
                      Article bookmarks, reading progress indicators, and UI preferences (such as
                      light or dark mode themes).
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 02 */}
            <section id="how-we-use-data" className="privacy-page__section">
              <div className="privacy-page__section-header">
                <span className="privacy-page__section-num">02</span>
                <h2 className="privacy-page__section-title">How We Use Your Data</h2>
              </div>
              <div className="privacy-page__section-body">
                <p>We use the data we collect solely for the following explicit purposes:</p>
                <ul>
                  <li>
                    <strong>Access Provisioning:</strong> Authenticating your identity and verifying
                    that your account is authorized to view paid educational articles.
                  </li>
                  <li>
                    <strong>Transactional Communications:</strong> Sending essential notifications
                    including account verification emails, password reset links, and purchase
                    receipts via Resend.
                  </li>
                  <li>
                    <strong>Platform Defense:</strong> Detecting and mitigating automated scraping,
                    brute-force login attacks, credential sharing, and malicious activity.
                  </li>
                  <li>
                    <strong>Platform Performance:</strong> Diagnosing server anomalies, optimizing
                    page render speeds, and improving editorial layout.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 03 */}
            <section id="legal-bases" className="privacy-page__section">
              <div className="privacy-page__section-header">
                <span className="privacy-page__section-num">03</span>
                <h2 className="privacy-page__section-title">Legal Bases for Processing</h2>
              </div>
              <div className="privacy-page__section-body">
                <p>
                  If you reside in the European Economic Area (EEA), the United Kingdom, or similar
                  data protection jurisdictions, our legal bases under the General Data Protection
                  Regulation (GDPR) are:
                </p>
                <ul>
                  <li>
                    <strong>Contractual Performance:</strong> Necessary to create your account,
                    process purchases, and provide paid article access requested under our{" "}
                    <Link href="/terms">Terms of Use</Link>.
                  </li>
                  <li>
                    <strong>Legitimate Interests:</strong> Necessary to defend Street IO against
                    fraud, prevent content piracy, maintain system stability, and safeguard user accounts.
                  </li>
                  <li>
                    <strong>Legal Obligations:</strong> Compliance with statutory tax, invoicing, and
                    financial audit requirements.
                  </li>
                  <li>
                    <strong>Consent:</strong> Where you have provided specific voluntary consent (e.g.
                    optional newsletters or non-essential cookies), which you may withdraw at any time.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 04 */}
            <section id="payments" className="privacy-page__section">
              <div className="privacy-page__section-header">
                <span className="privacy-page__section-num">04</span>
                <h2 className="privacy-page__section-title">Payment & Financial Data</h2>
              </div>
              <div className="privacy-page__section-body">
                <p>
                  When you purchase pay-per-article access or subscriptions, transactions are
                  processed through PCI-DSS Level 1 certified third-party payment gateways.
                </p>
                <div className="privacy-page__card">
                  <div className="privacy-page__card-title">
                    <Lock aria-hidden="true" />
                    <span>Zero Cardholder Data Storage</span>
                  </div>
                  <p className="privacy-page__card-text">
                    Street IO servers never receive, process, or store your credit card numbers, CVV
                    codes, or banking credentials. We receive only an encrypted customer token, the
                    last 4 digits of the card (for receipt display), and transaction completion status.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 05 */}
            <section id="third-party-services" className="privacy-page__section">
              <div className="privacy-page__section-header">
                <span className="privacy-page__section-num">05</span>
                <h2 className="privacy-page__section-title">Third-Party Processors</h2>
              </div>
              <div className="privacy-page__section-body">
                <p>
                  We share data with trusted infrastructure providers bound by strict Data Processing
                  Agreements (DPAs) and confidentiality obligations:
                </p>
                <ul>
                  <li>
                    <strong>Database & Hosting Infrastructure:</strong> Cloud PostgreSQL and edge
                    hosting providers for maintaining encrypted article records and secure user sessions.
                  </li>
                  <li>
                    <strong>Transactional Email Delivery:</strong> Resend, utilized strictly to deliver
                    verification emails, password resets, and account security notices.
                  </li>
                  <li>
                    <strong>OAuth Authentication:</strong> Google Identity Services (when chosen by
                    the user for one-click authentication).
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 06 */}
            <section id="retention" className="privacy-page__section">
              <div className="privacy-page__section-header">
                <span className="privacy-page__section-num">06</span>
                <h2 className="privacy-page__section-title">Data Retention & Deletion</h2>
              </div>
              <div className="privacy-page__section-body">
                <p>
                  We retain personal data for as long as your account remains active or as needed to
                  provide you with access to your purchased articles.
                </p>
                <p>
                  Upon receiving a verified account deletion request, we permanently purge or anonymize
                  your personal identifiers, credentials, and profile records within 30 days, except
                  for financial transaction receipts required by law to be retained for statutory tax
                  and accounting periods.
                </p>
              </div>
            </section>

            {/* Section 07 */}
            <section id="cookies" className="privacy-page__section">
              <div className="privacy-page__section-header">
                <span className="privacy-page__section-num">07</span>
                <h2 className="privacy-page__section-title">Cookies & Session Storage</h2>
              </div>
              <div className="privacy-page__section-body">
                <p>
                  Street IO employs cookies and local storage tokens strictly for essential
                  operational and security functionality:
                </p>
                <ul>
                  <li>
                    <strong>Authentication Cookies:</strong> Secure, HTTP-only session cookies
                    managed via Better Auth to keep you signed in across navigation without exposing
                    tokens to client scripts.
                  </li>
                  <li>
                    <strong>Security & CSRF Tokens:</strong> Tokens protecting form submissions
                    against Cross-Site Request Forgery and credential hijacking.
                  </li>
                  <li>
                    <strong>Preference Tokens:</strong> Local storage flags remembering your UI theme
                    choice (light or dark mode).
                  </li>
                </ul>
                <p>
                  We do not deploy third-party advertising cookies, cross-site trackers, or behavioral
                  profiling scripts.
                </p>
              </div>
            </section>

            {/* Section 08 */}
            <section id="your-rights" className="privacy-page__section">
              <div className="privacy-page__section-header">
                <span className="privacy-page__section-num">08</span>
                <h2 className="privacy-page__section-title">Your Privacy Rights (GDPR / CCPA)</h2>
              </div>
              <div className="privacy-page__section-body">
                <p>
                  Regardless of your location, Street IO provides all users with comprehensive rights
                  over their personal data:
                </p>
                <ul>
                  <li>
                    <strong>Right of Access & Portability:</strong> Request an export of the personal
                    data we hold regarding your account and purchase history.
                  </li>
                  <li>
                    <strong>Right to Rectification:</strong> Update inaccurate or incomplete
                    information directly in your account settings or via support.
                  </li>
                  <li>
                    <strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> Request the permanent
                    deletion of your account and personal identifiers.
                  </li>
                  <li>
                    <strong>Right to Restrict or Object:</strong> Restrict or object to certain
                    aspects of data processing under legitimate interest provisions.
                  </li>
                  <li>
                    <strong>Non-Discrimination:</strong> We will never deny service, charge different
                    rates, or degrade your educational experience for exercising your privacy rights.
                  </li>
                </ul>
                <p>
                  To exercise any of these rights, contact us at <strong>privacy@streetio.com</strong>.
                  We respond to all verified requests within thirty (30) days without charge.
                </p>
              </div>
            </section>

            {/* Section 09 */}
            <section id="security" className="privacy-page__section">
              <div className="privacy-page__section-header">
                <span className="privacy-page__section-num">09</span>
                <h2 className="privacy-page__section-title">Security & Encryption</h2>
              </div>
              <div className="privacy-page__section-body">
                <p>
                  We implement robust technical and organizational measures engineered to protect
                  personal data against unauthorized access, destruction, or disclosure:
                </p>
                <ul>
                  <li>
                    <strong>Transport Encryption:</strong> All platform traffic is strictly enforced
                    over HTTPS using Transport Layer Security (TLS 1.3).
                  </li>
                  <li>
                    <strong>Credential Protection:</strong> Passwords are cryptographically hashed using
                    modern memory-hard algorithms before database ingestion.
                  </li>
                  <li>
                    <strong>Database Safeguards:</strong> Access to production databases is restricted
                    to authorized personnel via encrypted connection pools with least-privilege roles.
                  </li>
                  <li>
                    <strong>Rate Limiting & Threat Shielding:</strong> Automated edge rate limiting on
                    authentication endpoints to block credential stuffing and brute force attempts.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 10 */}
            <section id="transfers" className="privacy-page__section">
              <div className="privacy-page__section-header">
                <span className="privacy-page__section-num">10</span>
                <h2 className="privacy-page__section-title">International Data Transfers</h2>
              </div>
              <div className="privacy-page__section-body">
                <p>
                  Street IO servers and primary data centers are located in the United States and
                  distributed cloud regions. If you access Street IO from outside the United States,
                  your information may be transferred to, stored, and processed in jurisdictions with
                  differing privacy laws.
                </p>
                <p>
                  When transferring personal data originating in the EEA or UK, we rely on standard
                  contractual clauses (SCCs) approved by the European Commission to ensure adequate
                  levels of protection.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section id="children" className="privacy-page__section">
              <div className="privacy-page__section-header">
                <span className="privacy-page__section-num">11</span>
                <h2 className="privacy-page__section-title">Age Restrictions & Minors</h2>
              </div>
              <div className="privacy-page__section-body">
                <p>
                  Street IO is designed exclusively for individuals who are at least 18 years of age.
                  We do not knowingly solicit, collect, or store personal information from individuals
                  under the age of 18.
                </p>
                <p>
                  If you believe that a minor has created an account or provided us with personal data,
                  please notify us immediately at <strong>privacy@streetio.com</strong> so we can take
                  prompt action to delete the associated account and data.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section id="contact-dpo" className="privacy-page__section">
              <div className="privacy-page__section-header">
                <span className="privacy-page__section-num">12</span>
                <h2 className="privacy-page__section-title">Updates & Privacy Contact</h2>
              </div>
              <div className="privacy-page__section-body">
                <p>
                  We may periodically revise this Privacy Policy to reflect modifications to our
                  service, evolving technologies, or regulatory guidance. We will notify you of
                  material revisions by updating the effective date and providing prominent notices on
                  the platform.
                </p>

                <div className="privacy-page__card">
                  <div className="privacy-page__card-title">
                    <Mail aria-hidden="true" />
                    <span>Data Protection Inquiries</span>
                  </div>
                  <p className="privacy-page__card-text">
                    <strong>Privacy Team:</strong> privacy@streetio.com<br />
                    <strong>Data Protection Officer:</strong> dpo@streetio.com<br />
                    <strong>Security Team:</strong> security@streetio.com
                  </p>
                </div>
              </div>
            </section>

            {/* Bottom Contact / Action Card */}
            <div className="privacy-page__contact-card">
              <div className="privacy-page__contact-card-info">
                <h3 className="privacy-page__contact-card-title">Need to make a privacy request?</h3>
                <p className="privacy-page__contact-card-text">
                  Our data protection team is ready to assist with data exports, deletions, or inquiries.
                </p>
              </div>
              <div className="privacy-page__contact-card-actions">
                <a
                  href="mailto:privacy@streetio.com"
                  className="privacy-page__contact-card-btn privacy-page__contact-card-btn--primary"
                >
                  Email Privacy Team
                  <ChevronRight aria-hidden="true" size={16} />
                </a>
                <Link
                  href="/terms"
                  className="privacy-page__contact-card-btn privacy-page__contact-card-btn--secondary"
                >
                  Terms of Use
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
