"use client";

import { createAuthClient } from "better-auth/react";

const betterAuthUrl = (
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.trim() || "http://localhost:5000"
).replace(/\/+$/, "");

export const authClient = createAuthClient({
  baseURL: betterAuthUrl,
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;
