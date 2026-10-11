// File: lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

// Same origin as the app, so no baseURL is needed in the browser.
export const authClient = createAuthClient();

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
} = authClient;

export { safePath } from "@/lib/safe-path";