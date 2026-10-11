// File: lib/email/send.ts
import "server-only";

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

// Must be an address on a domain you've verified in Resend,
// e.g. "streetio <no-reply@streetio.org>".
const FROM = process.env.EMAIL_FROM ?? "streetio <no-reply@streetio.org>";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY is not set. Email skipped:", { to, subject });
    return null;
  }

  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
    text,
    replyTo: process.env.EMAIL_REPLY_TO,
  });

  if (error) {
    // Logged, not thrown: auth flows shouldn't reveal delivery problems to the client.
    console.error("[email] Resend failed", { to, subject, error });
    return null;
  }

  return data;
}