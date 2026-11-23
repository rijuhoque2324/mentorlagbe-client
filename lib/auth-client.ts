"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Better Auth is served from this app's origin at /api/auth (proxied to the
 * Express API by next.config.ts rewrites), so the session cookie is
 * first-party. NEXT_PUBLIC_BETTER_AUTH_URL may override that for setups
 * without the proxy.
 */
const configuredUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.trim().replace(/\/+$/, "");

export const authClient = createAuthClient({
  ...(configuredUrl ? { baseURL: configuredUrl } : {}),
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;
