"use client";

import { useState } from "react";
import { Mail, Phone, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { FaXTwitter, FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa6";
import "./contact.scss";

const socialLinks = [
  { label: "X (Twitter)", href: "https://x.com/streetio", icon: FaXTwitter },
  { label: "Facebook", href: "https://facebook.com/streetio", icon: FaFacebookF },
  { label: "Instagram", href: "https://instagram.com/streetio", icon: FaInstagram },
  { label: "TikTok", href: "https://tiktok.com/@streetio", icon: FaTiktok },
];

const subjectLabels: Record<string, string> = {
  general: "General Inquiry",
  membership: "Membership & Billing",
  "topic-suggestion": "Educational Guide Suggestion",
  technical: "Technical Support",
};

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const accessKey =
      process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ||
      "2adc1db1-8fa1-484c-ab07-9442cac4a9b9";

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: formData.name,
          email: formData.email,
          subject: `[Street IO] ${subjectLabels[formData.subject] || formData.subject} from ${formData.name}`,
          message: formData.message,
          from_name: "Street IO Contact Form",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
      } else {
        setErrorMessage(data.message || "Failed to send message. Please try again.");
      }
    } catch {
      setErrorMessage("Something went wrong while sending your message. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ name: "", email: "", subject: "general", message: "" });
    setIsSubmitted(false);
    setErrorMessage(null);
  };

  return (
    <section className="contact-sec" id="contact" aria-labelledby="contact-sec-title">
      <div className="contact-sec__container">
        {/* Section Header */}
        <header className="contact-sec__header" data-aos="fade-up">
          <div className="contact-sec__tag-wrapper">
            <span className="contact-sec__status-dot" aria-hidden="true" />
            <span>GET IN TOUCH</span>
          </div>
          <h2 id="contact-sec-title" className="contact-sec__title">
            Have a question or request? Contact us directly.
          </h2>
          <p className="contact-sec__subtitle">
            Whether you need assistance with membership, want to suggest an educational guide topic,
            or need to reach out directly, we are accessible across multiple channels.
          </p>
        </header>

        {/* 2-Column Grid */}
        <div className="contact-sec__grid">
          {/* Left Column: Direct Channels & Socials */}
          <div className="contact-sec__info" data-aos="fade-up">
            <div className="contact-sec__channels">
              {/* Email */}
              <a href="mailto:hello@streetio.org" className="contact-sec__channel-item">
                <div className="contact-sec__channel-icon" aria-hidden="true">
                  <Mail size={18} />
                </div>
                <div className="contact-sec__channel-details">
                  <span className="contact-sec__channel-label">Email Address</span>
                  <span className="contact-sec__channel-value">hello@streetio.org</span>
                </div>
              </a>

              {/* Phone */}
              <a href="tel:+2347067997301" className="contact-sec__channel-item">
                <div className="contact-sec__channel-icon" aria-hidden="true">
                  <Phone size={18} />
                </div>
                <div className="contact-sec__channel-details">
                  <span className="contact-sec__channel-label">Phone Line</span>
                  <span className="contact-sec__channel-value">+234 706 799 7301</span>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/2347067997301"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-sec__channel-item"
              >
                <div className="contact-sec__channel-icon contact-sec__channel-icon--whatsapp" aria-hidden="true">
                  <FaWhatsapp size={20} />
                </div>
                <div className="contact-sec__channel-details">
                  <span className="contact-sec__channel-label">WhatsApp Direct</span>
                  <span className="contact-sec__channel-value">+234 706 799 7301</span>
                </div>
              </a>
            </div>

            {/* Social Links */}
            <div className="contact-sec__socials-block">
              <span className="contact-sec__socials-heading">Follow & Connect on Socials</span>
              <div className="contact-sec__socials-list">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-sec__social-btn"
                    >
                      <Icon size={16} />
                      <span>{social.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="contact-sec__form-card" data-aos="fade-up" data-aos-delay="100">
            {isSubmitted ? (
              <div className="contact-sec__success-box">
                <div className="contact-sec__success-icon">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="contact-sec__success-title">Message Received</h3>
                <p className="contact-sec__success-text">
                  Thank you for reaching out. We have received your inquiry and our team will get back to you at{" "}
                  <strong>{formData.email || "your email"}</strong> as soon as possible.
                </p>
                <button type="button" onClick={handleReset} className="contact-sec__reset-btn">
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h3 className="contact-sec__form-title">Send a Message</h3>
                <p className="contact-sec__form-sub">
                  Fill in the form below and we will respond directly to your inbox.
                </p>

                <form onSubmit={handleSubmit} className="contact-sec__form">
                  {errorMessage && (
                    <div className="contact-sec__error-alert" role="alert">
                      <AlertCircle size={16} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="contact-sec__form-row">
                    <div className="contact-sec__form-group">
                      <label htmlFor="contact-name" className="contact-sec__label">
                        Your Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        placeholder="Alex Morgan"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="contact-sec__input"
                      />
                    </div>

                    <div className="contact-sec__form-group">
                      <label htmlFor="contact-email" className="contact-sec__label">
                        Email Address
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        placeholder="alex@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="contact-sec__input"
                      />
                    </div>
                  </div>

                  <div className="contact-sec__form-group">
                    <label htmlFor="contact-subject" className="contact-sec__label">
                      Inquiry Subject
                    </label>
                    <select
                      id="contact-subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="contact-sec__select"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="membership">Membership & Billing</option>
                      <option value="topic-suggestion">Educational Guide Suggestion</option>
                      <option value="technical">Technical Support</option>
                    </select>
                  </div>

                  <div className="contact-sec__form-group">
                    <label htmlFor="contact-message" className="contact-sec__label">
                      Your Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      placeholder="Write your question, feedback, or guide suggestion here..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="contact-sec__textarea"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="contact-sec__submit-btn"
                  >
                    <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                    <Send size={15} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
