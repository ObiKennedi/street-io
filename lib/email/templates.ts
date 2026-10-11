// File: lib/email/templates.ts
// Branded transactional emails. Table layout + inline styles for email-client support.
// The logo is a hosted PNG: copy streetio-logo-primary@600w.png from the brand kit
// to public/brand/ so it's served at {APP_URL}/brand/streetio-logo-primary@600w.png.

const APP_URL = (process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");

const C = {
  charcoal: "#253238",
  steel: "#7A7B83", // steel-700: the brand Steel is too light for text on the grey email background
  muted: "#5A5D62",
  border: "#DDDDE2",
  surface: "#F5F5F7",
  white: "#FFFFFF",
};

// Single quotes only — this is interpolated inside style="…" attributes.
const FONT = `Inter,'Helvetica Neue',Helvetica,Arial,sans-serif`;

type Email = { subject: string; html: string; text: string };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] as string
  ));
}

function firstName(name?: string | null) {
  const first = name?.trim().split(/\s+/)[0];
  return first ? escapeHtml(first) : "there";
}

function layout({
  preheader,
  heading,
  body,
  cta,
  footnote,
}: {
  preheader: string;
  heading: string;
  body: string;
  cta?: { label: string; url: string };
  footnote: string;
}) {
  const button = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px">
        <tr><td style="border-radius:4px;background:${C.charcoal}">
          <a href="${cta.url}" style="display:inline-block;padding:14px 28px;font:700 16px/1 ${FONT};color:${C.white};text-decoration:none;letter-spacing:-0.01em">${cta.label}</a>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font:400 13px/1.6 ${FONT};color:${C.muted}">
        Button not working? Paste this link into your browser:<br>
        <a href="${cta.url}" style="color:${C.charcoal};word-break:break-all">${cta.url}</a>
      </p>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:${C.surface}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.surface}">
  <tr><td align="center" style="padding:40px 16px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
      <tr><td style="padding:0 0 24px">
        <a href="${APP_URL}"><img src="${APP_URL}/brand/streetio-logo-primary@600w.png" width="120" alt="streetio" style="display:block;border:0;width:120px;height:auto"></a>
      </td></tr>
      <tr><td style="background:${C.white};border:1px solid ${C.border};border-radius:12px;padding:36px 32px">
        <h1 style="margin:0 0 16px;font:900 26px/1.15 ${FONT};color:${C.charcoal};letter-spacing:-0.04em">${heading}</h1>
        <div style="font:400 16px/1.6 ${FONT};color:${C.charcoal}">${body}</div>
        ${button}
        <p style="margin:28px 0 0;padding-top:20px;border-top:1px solid ${C.border};font:400 13px/1.6 ${FONT};color:${C.muted}">${footnote}</p>
      </td></tr>
      <tr><td style="padding:24px 8px 0;font:400 12px/1.6 ${FONT};color:${C.muted}">
        streetio publishes for educational purposes only. We never ask for your password, PIN or OTP by email, phone or DM.<br>
        <strong style="color:${C.charcoal}">Learn it.</strong> <strong style="color:${C.steel}">Don&rsquo;t do it.</strong>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export function verifyEmailTemplate({ name, url }: { name?: string | null; url: string }): Email {
  return {
    subject: "Confirm your email for streetio",
    html: layout({
      preheader: "One click to confirm your email and finish setting up your account.",
      heading: "Confirm your email",
      body: `<p style="margin:0">Hi ${firstName(name)}, thanks for joining streetio. Confirm this is your email address to finish setting up your account.</p>`,
      cta: { label: "Confirm email", url },
      footnote: "This link expires in 1 hour. If you didn&rsquo;t create a streetio account, you can ignore this email.",
    }),
    text: `Hi ${name?.split(" ")[0] ?? "there"},

Confirm your email to finish setting up your streetio account:
${url}

This link expires in 1 hour. If you didn't create an account, ignore this email.`,
  };
}

export function resetPasswordTemplate({ name, url }: { name?: string | null; url: string }): Email {
  return {
    subject: "Reset your streetio password",
    html: layout({
      preheader: "Use this link to choose a new password.",
      heading: "Reset your password",
      body: `<p style="margin:0">Hi ${firstName(name)}, we got a request to reset the password for your streetio account. Choose a new one below.</p>`,
      cta: { label: "Choose a new password", url },
      footnote: "This link expires in 1 hour and can only be used once. If you didn&rsquo;t ask for this, ignore this email &mdash; your password won&rsquo;t change.",
    }),
    text: `Hi ${name?.split(" ")[0] ?? "there"},

Reset your streetio password here:
${url}

This link expires in 1 hour. If you didn't ask for this, ignore this email.`,
  };
}

export function passwordChangedTemplate({ name }: { name?: string | null }): Email {
  const resetUrl = `${APP_URL}/forgot-password`;
  return {
    subject: "Your streetio password was changed",
    html: layout({
      preheader: "Your password was just changed.",
      heading: "Password changed",
      body: `<p style="margin:0">Hi ${firstName(name)}, the password for your streetio account was just changed and you&rsquo;ve been signed out on other devices.</p>`,
      footnote: `If this wasn&rsquo;t you, <a href="${resetUrl}" style="color:${C.charcoal}">reset your password</a> straight away and contact us.`,
    }),
    text: `Hi ${name?.split(" ")[0] ?? "there"},

The password for your streetio account was just changed and you've been signed out on other devices.

If this wasn't you, reset your password now: ${resetUrl}`,
  };
}