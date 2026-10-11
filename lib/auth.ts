// File: lib/auth.ts
import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { after } from "next/server";

import { sendEmail } from "@/lib/email/send";
import {
  passwordChangedTemplate,
  resetPasswordTemplate,
  verifyEmailTemplate,
} from "@/lib/email/templates";
import { prisma } from "@/lib/prisma";

/**
 * Send after the response is returned. Not awaiting keeps response times
 * identical whether or not an account exists (no email-enumeration via timing),
 * and `after` keeps serverless functions alive until the send finishes.
 */
function sendInBackground(email: Parameters<typeof sendEmail>[0]) {
  after(() => sendEmail(email));
}

export const auth = betterAuth({
  appName: "streetio",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: prismaAdapter(prisma, { provider: "postgresql" }),

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },

  // ---- Email + password -----------------------------------------------------
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 60 * 60, // 1 hour
    revokeSessionsOnPasswordReset: true,

    sendResetPassword: async ({ user, url }) => {
      sendInBackground({ to: user.email, ...resetPasswordTemplate({ name: user.name, url }) });
    },

    onPasswordReset: async ({ user }) => {
      sendInBackground({ to: user.email, ...passwordChangedTemplate({ name: user.name }) });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    // Unverified users who try to log in get a fresh link instead of a dead end.
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60, // 1 hour

    sendVerificationEmail: async ({ user, url }) => {
      sendInBackground({ to: user.email, ...verifyEmailTemplate({ name: user.name, url }) });
    },
  },

  // ---- Google ---------------------------------------------------------------
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: "select_account",
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      // Google verifies emails, so a Google sign-in can safely link to an
      // existing email/password account with the same address.
      trustedProviders: ["google"],
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  // Built-in rate limiting for sign-in / sign-up / reset endpoints.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/request-password-reset": { window: 60, max: 3 },
      "/send-verification-email": { window: 60, max: 3 },
    },
  },

  // Must be last: lets Server Actions set auth cookies.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;