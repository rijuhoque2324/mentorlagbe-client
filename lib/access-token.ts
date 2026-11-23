import axios from "axios";

/**
 * JWT access-token manager.
 *
 * After Better Auth signs the user in (HTTP-only session cookie), the client
 * exchanges that session for a short-lived JWT at POST /auth/token. The token
 * is kept in memory only (never localStorage) and attached as
 * `Authorization: Bearer <token>` to every protected API request, where the
 * Express `verifyToken` middleware validates it.
 */

interface CachedToken {
  token: string;
  expiresAt: number;
}

let cached: CachedToken | null = null;
let inFlight: Promise<string | null> | null = null;

function decodeExpiry(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : Date.now() + 5 * 60_000;
  } catch {
    return Date.now() + 5 * 60_000;
  }
}

export function clearAccessToken() {
  cached = null;
}

/** Returns a valid JWT, or null when the visitor is not signed in. */
export async function getAccessToken(baseURL: string, force = false): Promise<string | null> {
  if (typeof window === "undefined") return null;

  // Refresh a minute before expiry.
  if (!force && cached && cached.expiresAt - 60_000 > Date.now()) {
    return cached.token || null;
  }

  if (!inFlight) {
    inFlight = axios
      .post(`${baseURL}/auth/token`, undefined, { withCredentials: true, timeout: 15_000 })
      .then((response) => {
        const token = response.data?.data?.token;
        if (typeof token !== "string" || !token) {
          cached = { token: "", expiresAt: Date.now() + 90_000 };
          return null;
        }
        cached = { token, expiresAt: decodeExpiry(token) };
        return token;
      })
      .catch(() => {
        // Not signed in: remember briefly so public pages do not retry per request.
        cached = { token: "", expiresAt: Date.now() + 90_000 };
        return null;
      })
      .finally(() => {
        inFlight = null;
      });
  }

  return inFlight;
}
