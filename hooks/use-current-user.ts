"use client";

import { useEffect, useState } from "react";

import { useSession } from "@/lib/auth-client";
import { normalizeUser } from "@/lib/normalize";
import { getRoleFromUser } from "@/lib/roles";
import { userService } from "@/services/users.service";
import type { User } from "@/types";

interface CachedProfile {
  value: User;
  expiresAt: number;
}

let cachedProfile: CachedProfile | null = null;
let inFlight: Promise<User> | null = null;

async function loadProfile(force = false): Promise<User> {
  if (!force && cachedProfile && cachedProfile.expiresAt > Date.now()) {
    return cachedProfile.value;
  }

  if (!inFlight) {
    inFlight = userService
      .me()
      .then((user) => {
        cachedProfile = {
          value: user,
          expiresAt: Date.now() + 15_000,
        };
        return user;
      })
      .finally(() => {
        inFlight = null;
      });
  }

  return inFlight;
}

export function invalidateCurrentUser() {
  cachedProfile = null;
}

/**
 * Combines the Better Auth session with the authoritative profile endpoint.
 * The session keeps the UI fast; the profile request supplies role and plan.
 */
export function useCurrentUser() {
  const { data: session, isPending, refetch: refetchSession } = useSession();
  const [profile, setProfile] = useState<User | null>(null);
  const sessionUser = session?.user as unknown;
  const sessionRecord =
    sessionUser !== null && typeof sessionUser === "object"
      ? (sessionUser as Record<string, unknown>)
      : null;
  const userId = sessionRecord ? String(sessionRecord.id ?? "") : "";

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }

    let active = true;

    loadProfile()
      .then((user) => {
        if (active) {
          setProfile(user);
        }
      })
      .catch(() => {
        // The session remains usable when the profile endpoint is unavailable.
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const fallback = sessionRecord ? normalizeUser(sessionRecord) : null;
  const user = profile ?? fallback;

  function refetch() {
    invalidateCurrentUser();
    setProfile(null);
    void refetchSession();
  }

  return {
    user,
    session,
    isPending,
    role: getRoleFromUser(user),
    refetch,
  };
}
